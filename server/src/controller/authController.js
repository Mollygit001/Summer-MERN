import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/Users.js';
import { OAuth2Client } from 'google-auth-library';
import { validationResult } from 'express-validator';
import sendEmail from '../services/emailService.js'


const secret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

const generateRandomCode = () => {
   const codeArray = '0123456789';
   let randomCode = '';

   for (let i = 0, n = codeArray.length; i < 6; i++) {
      randomCode += codeArray.charAt(Math.floor(Math.random() * n));
   }
   return randomCode;
}


const authController = {

   login: async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      try {
         const { email, password } = req.body;

         let data = await User.findOne({ email: email });
         if (!data) {
            return res.status(404).json({ message: 'User not found' });
         }

         const isMatch = await bcrypt.compare(password, data.password);
         if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
         }


         const userDetails = {
            id: data._id,
            name: data.name,
            email: data.email,
            //NOTE: role is not always present in the user model, so we set a default value
            role: data.role || 'user',
            credits: data.credits,
            subscription: data.subscription
         };
         const token = jwt.sign(userDetails, secret, { expiresIn: '1h' });
         const refreshToken = jwt.sign(userDetails, refreshSecret, { expiresIn: '7d' });
         res.cookie('jwtToken', token, {
            httpOnly: true,
            secure: true,
            path: '/',
         });
         res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            path: '/',
         });
         res.status(200).json({ message: 'Login successful', userDetails: userDetails });
      } catch (error) {
         res.status(401).json({ message: 'Invalid credentials' });
         console.error('Login error:', error);
      }
   },

   logout: (req, res) => {
      res.clearCookie('jwtToken');
      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logout successful' });
   },

   isUserLoggedIn: async (req, res) => {
      const token = req.cookies.jwtToken;
      if (!token) {
         return res.status(401).json({ message: 'User is not logged in' });
      }

      jwt.verify(token, secret, async (err, decoded) => {
         if (err) {
            return res.status(401).json({ message: 'Invalid token' });
         }
         // Fetch latest user info from DB
         const user = await User.findById(decoded.id);
         if (!user) {
            return res.status(404).json({ message: 'User not found' });
         }
         const userDetails = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            credits: user.credits,
            subscription: user.subscription
         };
         return res.status(200).json({ message: 'User is logged in', userDetails });
      });
   },

   register: async (req, res) => {
      try {
         const { email, password, name } = req.body;
         // Check if user already exists
         const existingUser = await User.findOne({ email: email });
         if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
         }
         const encryptedPassword = await bcrypt.hash(password, 10);

         const user = new User({
            email: email,
            password: encryptedPassword,
            name: name,
            role: 'admin'
         });
         await user.save();

         const userDetails = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role || 'admin', // Default role if not set
            credits: user.credits,
            subscription: user.subscription
         }


         const token = jwt.sign(userDetails, secret, { expiresIn: '1h' });
         res.cookie('jwtToken', token, {
            httpOnly: true,
            secure: true,
            path: '/',
         });
         res.status(201).json({ message: 'User registered successfully', userDetails: userDetails });

      } catch (error) {
         return res.status(500).json({ message: 'Error registering user', error: error.message });
      }
   },

   googleAuth: async (req, res) => {
      const { idToken } = req.body;
      if (!idToken) {
         return res.status(400).json({ message: 'Invalid request!' });
      }

      try {
         const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
         const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
         });

         const payload = ticket.getPayload();
         const { sub: googleId, email, name } = payload;

         let data = await User.findOne({ email: email });
         if (!data) {
            // If user does not exist, create a new user
            const newUser = new User({
               email: email,
               name: name,
               isGoogleUser: true,
               googleId: googleId,
               role: 'admin'
            });
            await newUser.save();
            data = newUser;
         }
         const userDetails = {
            id: data._id ? data._id : googleId,
            email: data.email,
            name: data.name || name,
            role: data.role || 'admin', // Default role if not set
            credits: data.credits,
            subscription: data.subscription
         };
         const token = jwt.sign(userDetails, secret, { expiresIn: '1h' });
         res.cookie('jwtToken', token, {
            httpOnly: true,
            secure: true,
            domain: 'localhost',
         });
         const refreshToken = jwt.sign(userDetails, refreshSecret, { expiresIn: '7d' });
         res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            domain: 'localhost',
         });
         res.status(200).json({ message: 'Google authentication successful', userDetails: userDetails });
      } catch (error) {
         console.error('Google Auth Error:', error);
         return res.status(500).json({ message: 'Internal server error' });
      }
   },

   refreshToken: async (req, res) => {
      try {
         const refreshToken = req.cookies?.refreshToken;
         if (!refreshToken) {
            return res.status(401).json({ message: 'No Refresh Token availabe!' });
         }

         const decoded = jwt.verify(refreshToken, refreshSecret);
         const data = await User.findById({ _id: decoded.id });

         if (!data) {
            return res.status(400).json({ message: 'User Not Found!' });
         }

         const user = {
            id: data._id,
            email: data.email,
            name: data.name,
            role: data.role || 'admin', // Default role if not set
            credits: data.credits,
            subscription: data.subscription
         }

         const newAccessToken = jwt.sign(user, secret, { expiresIn: '1h' });

         res.cookie('jwtToken', newAccessToken, {
            httpOnly: true,
            secure: true,
            domain: 'localhost'
         });

         res.status(200).json({ message: 'Token Refreshed!', userDetails: user });

      } catch (err) {
         console.log(err)
         res.status(500).json({
            message: 'Internal Server error!'
         })
      }
   },

   sendResetPasswordToken: async (req, res) => {
      try {

         const { email } = req.body;

         const user = await User.findOne({ email: email });

         if (!user) {
            return res.status(401).json({
               message: "User Not Found!"
            })
         }

         const randomCode = generateRandomCode();
         console.log('Random code: ' + randomCode);
         const hasdedCode = await bcrypt.hash(randomCode, 10);

         try {
            await sendEmail({
               to: email,
               subject: 'Temp code for reset password',
               text: `Your Code is ${randomCode}. Valid only for next 15 minutes.`
            })
         } catch (error) {
            console.log(error)
            return res.status(500).json({
               message: 'Error Sending mail. Try again Later!'
            })

         }

         user.resetPassCode = hasdedCode;
         await user.save()
         res.status(200).json({
            message: 'Code send to console and also on registered email!'
         });

      } catch (error) {
         console.log(error);
         res.status(500).json({
            message: 'Something went wrong! Try again Later!'
         });
      }
   },

   resetPassword: async (req, res) => {
      try {
         const { otp, resetPassword, email } = req.body;

         const user = await User.findOne({ email: email });

         if (!user) {
            return res.status(401).json({
               message: 'No User Found!'
            });
         }

         const matchOtp = await bcrypt.compare(otp, user.resetPassCode);
         if (!matchOtp) {
            return res.status(400).json({
               message: 'Invalid Otp!!'
            });
         }

         if (user.resetPassCodeExpire && user.resetPassCodeExpire < Date.now()) {
            return res.status(400).json({
               message: 'Otp Expired!!'
            });
         }

         const hashedPassword = await bcrypt.hash(resetPassword, 10);
         user.password = hashedPassword;
         user.resetPassCode = null;
         user.resetPassCodeExpire = null;

         await user.save();

         res.status(201).json({
            message: 'Password Changed! Login Again'
         })
      } catch (error) {
         console.log(error)
         res.status(500).json({
            message: 'Internal Server Error!'
         })
      }
   }
};


export default authController;
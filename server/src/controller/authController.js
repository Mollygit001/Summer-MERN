import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/Users.js';
import { OAuth2Client } from 'google-auth-library';
import { validationResult } from 'express-validator';
const secret = process.env.JWT_SECRET;


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
        role: data.role || 'user', // Default role if not set
        credits: data.credits,
        subscription: data.subscription
      };
      const token = jwt.sign(userDetails, secret, { expiresIn: '1h' });
      res.cookie('jwtToken', token, {
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
      res.status(200).json({ message: 'Google authentication successful', userDetails: userDetails });
    } catch (error) {
      console.error('Google Auth Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }


  }
};


export default authController;
/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/Users.js';
const secret = "1223";
import { OAuth2Client } from 'google-auth-library';


const authController = {

    login: async (req, res) => {
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
            };
            const token = jwt.sign(userDetails, secret, { expiresIn: '1h' });
            res.cookie('jwtToken', token, {
                httpOnly: true,
                secure: true,
                path: '/',
            });
            res.status(200).json({ message: 'Login successful', userDetails: userDetails });
            // console.log(userDetails);
            

        } catch (error) {
            res.status(401).json({ message: 'Invalid credentials' });
            console.error('Login error:', error);
        }
    },

    logout: (req, res) => {
        res.clearCookie('jwtToken');
        res.status(200).json({ message: 'Logout successful' });
    },

    isUserLoggedIn: (req, res) => {
        const token = req.cookies.jwtToken;
        if (!token) {
            return res.status(401).json({ message: 'User is not logged in' });
        }

        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            return res.status(200).json({ message: 'User is logged in', userDetails: decoded });
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
                name: name
            });
            await user.save();

            res.status(201).json({ message: 'User registered successfully' });
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
                });
                await newUser.save();
                data = newUser;
            }
            const userDetails = {
                id: data._id ? data._id : googleId,
                email: data.email,
                name: data.name || name,
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
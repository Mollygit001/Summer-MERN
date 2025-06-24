import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/Users.js';
const secret = "1223";


const authController = {

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            let data = await User.findOne({ email: username });
            if (!data) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isMatch = await bcrypt.compare(password, data.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }


            const userDetails = {
                id: data._id,
                username: data.username,
                email: data.email,
            };
            const token = jwt.sign(userDetails, secret, { expiresIn: '1h' });
            res.cookie('jwtToken', token, {
                httpOnly: true,
                secure: true,
                domain: 'localhost',
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
            const { username, password, name } = req.body;
            // Check if user already exists
            const existingUser = await User.findOne({ email: username });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const encryptedPassword = await bcrypt.hash(password, 10);

            const user = new User({
                email: username,
                password: encryptedPassword,
                name: name
            });
            await user.save();

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Error registering user', error: error.message });
        }
    }
};


export default authController;
import {USER_ROLES}  from '../constants/userConstants.js';
import User from '../model/Users.js';
import sendEmail  from '../services/emailService.js';
import bcrypt from 'bcryptjs';


const getRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
};


const userController = {
    create: async (req, res) => {
        try {
            const { name, email, role } = req.body;
            if (!USER_ROLES.includes(role)) {
                return res.status(400).json({ error: "Invalid role" });
            }

            const tempPassword = getRandomPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);


            const newUser = {
                name,
                email,
                role,
                password: hashedPassword,
                adminId: req.user.adminId
            };
            await User.create(newUser);

            try {
                await sendEmail({
                    to: email,
                    subject: "Welcome to Our Service",
                    text: `Hello ${name},\n\nYour account has been created successfully. Your temporary password is: ${tempPassword}\nPlease change your password after logging in.\n\nBest regards,\nYour Team`
                });
                res.status(201).json({ message: "User created and email send successfully  " });
            }
            catch (emailError) {
                console.error("Error sending email:", emailError);
                return res.status(500).json({ error: "Failed to send welcome email" });
            }
        }
        catch (err) {
            console.error("Error in userController.create:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    getAll: async (req, res) => {
        try {
            const users = await User.find({ adminId: req.user.adminId });
            res.status(200).json(users);
        } catch (err) {
            console.error("Error in userController.getAll:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    },


    update: async (req, res) => {
        try {
            const { userId } = req.params;
            const { name, role } = req.body;

            if (role && !USER_ROLES.includes(role)) {
                return res.status(400).json({ error: "Invalid role" });
            }

            const user = await User.findOne({ _id: userId, adminId: req.user.adminId });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if (name) user.name = name;
            if (role) user.role = role;

            await user.save();
            res.status(200).json(user);

        } catch (err) {
            console.error("Error in userController.update:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findOneAndDelete({ _id: userId, adminId: req.user.adminId });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json({ message: "User deleted successfully" });
        } catch (err) {
            console.error("Error in userController.delete:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export default userController;
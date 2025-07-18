import express from "express";
import authController from "../controller/authController.js";
import loginValidator from "../middleware/validators.js";

const router = express.Router();

router.post('/login', loginValidator, authController.login);
router.post("/logout", authController.logout);
router.post("/is-user-logged-in", authController.isUserLoggedIn);
router.post("/register", authController.register);
router.post("/googleauth", authController.googleAuth);
router.post("/refresh-token", authController.refreshToken);
router.post("/sendResetPasswordToken", authController.sendResetPasswordToken);
router.post("/verifyandupdate", authController.resetPassword);

export default router;

import express from "express";
import authController from "../controller/authController.js";
import loginValidator from "../middleware/validators.js";

const router = express.Router();

router.post('/login', loginValidator, authController.login);
router.post("/logout", authController.logout);
router.post("/is-user-logged-in", authController.isUserLoggedIn);
router.post("/register", authController.register);
router.post("/googleauth", authController.googleAuth);

export default router;

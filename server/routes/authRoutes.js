import express from "express";
import { getUserData, isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, verifyEmail } from "../controllers/userController.js";
import userAuth from "../middleware/userMiddleware.js";

const router = express.Router();

// Single user data
router.get("/data", userAuth, getUserData);

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

// Account verifying apis 
router.post("/send-verify-otp", userAuth, sendVerifyOtp);

router.post("/verify-account", userAuth, verifyEmail);

router.post("/is-auth", userAuth, isAuthenticated);

// Resetting password apis
router.post("/send-reset-otp", sendResetOtp);

router.post("/reset-password", resetPassword);

export default router;
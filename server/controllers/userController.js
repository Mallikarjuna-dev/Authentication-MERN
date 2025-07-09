import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js"
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found!" });
        }

        res.status(200).json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Registration for new users 
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Enter all required fields!" });
    }

    try {
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: "User already exists!" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Sending welcome email
        const mailOptions = {
            from: process.env.ADMIN_ID,
            to: email,
            subject: "Welcome to Auth-App",
            text: `Welcome to Auth application, Your account has bd created with email id: ${email}`,
        }
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Registration successful!" })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
};

// Login controller for existed users
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Credentials required!" })
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Register to login." })
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return res.json({ success: true, message: "Login successful." })
        } else {
            return res.json({ success: false, message: "Invalid password" })
        }
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
};

// Logout function 
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            // maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({ success: true, message: "Logged out successfully." })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
};

// Sending otp to users email for verification
export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return res.json({ success: true, message: "Account already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOption = {
            from: process.env.ADMIN_ID,
            to: user.email,
            subject: "Account verification OTP",
            // text: `Your OTP is ${otp}. Verify your account using this One Time Password.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }
        await transporter.sendMail(mailOption);

        res.json({ success: true, message: "OTP sent to your email." });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Confirming Otp for newly registered users 
export const verifyEmail = async (req, res) => {
    const userId = req.userId;
    const { otp } = req.body;
    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing details" })
    }
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid verification code." });
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();
        res.json({ success: true, message: "Email verified successfully." });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Is User Authenticated ? Checking function
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true })

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Sending OTP for password resetting
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Email required" })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found!" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        const mailOption = {
            from: process.env.ADMIN_ID,
            to: user.email,
            subject: "Password Reset OTP",
            // text: `Your OTP for resetting your password is ${otp}. Reset your account password using this One Time Password. Valid for only 5mins`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }
        await transporter.sendMail(mailOption);
        return res.json({ success: true, message: "OTP sent to your email." })

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Reset your Password - verifying OTP
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: " New Credentials are required" })
    }
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found!" })
        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }

        const hashedpassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedpassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password changed successfull" })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
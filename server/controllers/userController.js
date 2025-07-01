import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Enter all required fields!" });
    }

    try {
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            res.json({ success: false, message: "User already exists!" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });
        await user.save();

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
import express from "express";
import userAuth from "../middleware/userMiddleware.js";
import { getUserData } from "../controllers/userController.js";

const router = express.Router();

// Single user data
router.get("/data", userAuth, getUserData);

export default router;
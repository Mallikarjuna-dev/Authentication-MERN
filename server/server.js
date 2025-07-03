import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoutes.js";
import userRoute from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 8000;

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// test route
app.get('/', (req, res) => {
    res.send("API working...");
})
// actual routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

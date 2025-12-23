import {User} from "../models/userModel.js"
import jwt from "jsonwebtoken"


export const protectRoute = async (req, res, next) => {
    try {
        let token;
        // Read JWT from Authorization header: "Bearer <token>"
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No Token Provided" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
        if (!decodedToken) {
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }

        const user = await User.findById(decodedToken.userId).select("-password");
        if (!user) return res.status(404).json({ error: "User does not exists" });
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(500).json({ error: "internal server error" });
    }
}

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express();
// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))
// app.use(cors({
//     origin: "http://localhost:5173",  // IMPORTANT
//     credentials: true
// }));
const allowedOrigins = [
    "http://localhost:5173",           // local Vite dev
    "http://16.171.23.225:5173",      // if frontend is served from EC2:5173
    "http://16.171.23.225",
	"https://api.elitecode-ai.club",          // if frontend is served from EC2 on port 80
    "https://www.elitecode-ai.club",   // custom domain (HTTPS)
    "https://d1fexxetc6tspa.cloudfront.net", // CloudFront distribution
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser clients (Postman, curl) with no origin
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));




app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser())


import authRouter from "./routes/auth.routes.js"
import problemRouter from "./routes/problem.routes.js"
//apis
app.use("/v1/auth",authRouter);
app.use("/v1/problem",problemRouter);

export {app}
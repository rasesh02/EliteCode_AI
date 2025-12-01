import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express();
// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))
app.use(cors({
    origin: "http://localhost:5173",  // IMPORTANT
    credentials: true
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

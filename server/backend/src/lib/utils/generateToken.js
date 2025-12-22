import jwt from "jsonwebtoken"

export const generateTokenAndSetCookie=(userId,res)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRETKEY,{
        expiresIn: "15d",
    })
    res.cookie("jwt",token,{
         maxAge: 15 * 24 * 60 * 60 * 1000, //in milliseconds
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // allows same-site requests with credentials
        secure: false, // use true in production with HTTPS
    })
}

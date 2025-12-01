import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt"


export const signup=async(req,res)=>{
    try{
    const {name,email,password}=req.body;
    //checks
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({error: "Invalid email format"});
    }
    const user=await User.findOne({name});
    if(user){
        return res.status(400).json({error: "User already exists, Please login to your Account"});
    }
    const existingEmail=await User.findOne({email});
    if(existingEmail){
        return res.status(400).json({error: "User already exists, Please login to your Account"});
    }
    if (password.length < 6) {
			return res.status(400).json({error: "Password must be atleast 6 characters long"});
	}
    
    const hashPassword=await bcrypt.hash(password,10);

    // creates a user instance in memory but doesnt saves to mongodb
    const newUser=new User({
        name: name,
        email:email,
        password:hashPassword
    })
    if(newUser){
        //
        generateTokenAndSetCookie(newUser._id,res);

        await newUser.save();
        res.status(201).json({
            _id: newUser._id,
            name : newUser.name,
            email: newUser.email
        })

    }
    else{
        res.status(400).json({error:"Invalid user data"});
    }
}
catch(error){
     console.log("Error in signup controller", error.message);
	 res.status(500).json({ error: "Internal Server Error" });
   }
}

export const login=async(req,res)=>{
    try {
    const {name,password}=req.body;
    const user = await User.findOne({name});
    const isPasswordCorrect=await bcrypt.compare(password,user?.password || "");
    if (!user || !isPasswordCorrect) {
			return res.status(401).json({ error: "Invalid username or password" });
		}
    //
    generateTokenAndSetCookie(user._id,res);  
    
     res.status(201).json({
            _id: user.id,
            name : user.name,
            email: user.email
        })
    
    
    } catch (error) {
    console.log("Error in login controller", error.message);
	res.status(500).json({ error: "Internal Server Error" });
    }
}

export const logout=async(req,res)=>{
    try {
    res.cookie("jwt","",{maxAge: 0});
    res.status(201).json({message:"User logged out successfully"})
    } catch (error) {
        console.log("error while logging out ",error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

export const getUser=async(req,res)=>{
    try{
    const user=await User.findById(req.user?._id).select("-password");
    res.status(200).json(user);
}
catch(error){
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
}
}

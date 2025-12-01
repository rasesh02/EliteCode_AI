import { Router } from "express";
import { login,logout,signup,getUser } from "../controllers/auth.controllers.js";

const router=Router();

router.post("/login",login)
router.post("/signup",signup)
router.post("/logout",logout);
router.get("/getUser",getUser);

export default router;
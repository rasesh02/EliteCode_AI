import { Router } from "express";
import { searchProblems,getProblem, generateCode, generateTests, getAllProblems } from "../controllers/problem.controllers.js";
import {protectRoute} from "../middlewares/protectRoute.js"

const router=Router();


router.get("/search",protectRoute,searchProblems);
router.get("/:id",protectRoute,getProblem);
router.post("/create",protectRoute,generateCode);
router.post("/generate",protectRoute,generateTests)
router.get("/",protectRoute,getAllProblems);
export default router;
import { Router } from "express";
import { getUsers } from "../controllers/userController";

const router = Router();

router.get("/", getUsers); // get all users

export default router;
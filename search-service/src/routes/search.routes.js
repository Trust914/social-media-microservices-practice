import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { searchPostController } from "../controllers/search.controller.js";

const router = express.Router()

router.use(authMiddleware)

router.get("/posts",searchPostController)

export default router
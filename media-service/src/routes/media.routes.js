import express from "express"
import { uploadMultiple } from "../middlewares/cloudinary.middleware.js"
import { getAllMedia, uploadMedia } from "../controllers/media.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use("/",authMiddleware)
router.post("/upload/:postId", uploadMultiple("postFiles",5),uploadMedia)
router.get("/get-all",getAllMedia)

export default router
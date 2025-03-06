import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createPost, deleteAllPost, deleteSinglePost, getAllPosts, getSinglePost } from "../controllers/posts.controller.js";
import {
  paginationMiddleware,
  sortMiddleware,
} from "../middlewares/paginationSort.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/create", createPost);
router.get("/get-all",paginationMiddleware, sortMiddleware, getAllPosts);
router.get("/get/:postId", getSinglePost)
router.delete("/delete/:postId", deleteSinglePost)
router.delete("/delete-all",deleteAllPost)

export default router;

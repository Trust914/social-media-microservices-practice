import express from "express"
import { deleteUser, loginUser, logoutUser, refreshTokenUser, registerUser, updateUserDetails } from "../controllers/identity.controller.js"
import { userAthMiddleware } from "../middlewares/userAthentication.middleware.js"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/refresh-token", refreshTokenUser)
router.post("/logout", logoutUser)
router.put("/update",userAthMiddleware,updateUserDetails)
router.delete("/delete",userAthMiddleware,deleteUser)

export default router
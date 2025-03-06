import { HTTPCODES } from "../utils/constants.util.js"
import { APIGatewayError } from "../utils/error.util.js"
import jwt from "jsonwebtoken"
import { logger } from "../utils/logger.util.js"


export const validateToken = (req,res,next)=>{
    const authHeader = req.headers.authorization
    // logger.debug(authHeader)
    const accessToken = authHeader && authHeader.split(" ")[1]
    if(!authHeader || !accessToken){
        const authError = new APIGatewayError(`AuthenticationError`,HTTPCODES.UNAUTHORISED,`User not authorised to perform the request. Please login or register to proceed`,true,{authHeader,accessToken})
        next(authError)
    }

    const user = jwt.verify(accessToken,process.env.JWT_SECRET)
    req.user = user

    next()
}
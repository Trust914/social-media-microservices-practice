import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.util.js"
import { BaseError, IdentityServiceError } from "../utils/error.util.js"
import { HTTPCODES } from "../utils/constants.util.js"
import { logger } from "../utils/logger.util.js"

export const userAthMiddleware = asyncHandler(async (req, res, next) => {
    const authorisation = req.headers.authorization
    const accessToken = authorisation && authorisation.split(" ")[1]
    if(!accessToken || !authorisation){
        const error =  new IdentityServiceError("AthenticationOrAuthorisationError", HTTPCODES.UNAUTHORISED,"No authorisation token received or authorisation token is invalid or expired",true,{info: "You must login or register to proceed"})
        throw (error)
    }

    const verifiedUser = jwt.verify(accessToken,process.env.JWT_SECRET)
    // logger.debug(verifiedUser)
    req.userInfo = verifiedUser
    // logger.debug(req.userInfo)
    next()
})
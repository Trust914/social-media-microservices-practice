import { HTTPCODES } from "../utils/constants.util.js";
import { SearchServiceError } from "../utils/error.util.js";
import { logger } from "../utils/logger.util.js";

export const authMiddleware =  (req,res,next) => {
    const userId = req.headers["x-user-id"] // userId gotten from the api gateway`
    logger.debug(userId)
    // const accessToken = authHeader && authHeader.split(" ")[1] // authheader is in form "Bearer `accessToken`"

    if(!userId){
        const authError = new SearchServiceError("AuthenticationOrAuthorizationError",HTTPCODES.UNAUTHORISED,"User not authorised to proceed. User must login or register to continue",true)
        next(authError)
    }
    
    req.user = {userId}
    next()
}
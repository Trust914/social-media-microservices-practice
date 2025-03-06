import SearchModel from "../models/search.model.js"
import { HTTPCODES, sendClientSuccess } from "../utils/constants.util.js"
import { deleteCachedData } from "../utils/deleteCachedData.util.js"
import { SearchServiceError } from "../utils/error.util.js"
import { logger } from "../utils/logger.util.js"

export const handlePostCreated = async(eventData, redisClient)=>{
    try {
        logger.debug(`eventdata`,eventData)
        const {postId, userId, content, createdAt} = eventData
        const newSearchPost = await SearchModel.create({
            postId, userId, content, createdAt
        })
        logger.debug(`newpost`,newSearchPost)

        if (!newSearchPost){
            throw new SearchServiceError(`PostCreationError`, HTTPCODES.CREATED,`Server encountered an error while trying to create the post in the DB`, true,{newSearchPost})
        }
        logger.info(`Successfully created the new Search Post`, {newSearchPost})
        // sendClientSuccess(res,HTTPCODES.OK,"Created the search post successfully", {newSearchPost})
    } catch (error) {
        const err = new SearchServiceError(`PostCreatedEventError-${error.name}`,HTTPCODES.INTERNAL_SERVER_ERROR,`Unable to consume the event received`,true,{eventData})
        throw err
    }
}

export const handlePostDeleted = async(eventData)=>{
    try {
        const {userId, postId} = eventData
        const searchPostToDelete = await SearchModel.findOneAndDelete({postId})
        if (!searchPostToDelete){
            throw new SearchServiceError(`PostCreationError`, HTTPCODES.CREATED,`Server encountered an error while trying to create the post in the DB`, true,{newSearchPost})
        }
        logger.info(`Successfully deleted the  Search Post`, {searchPostToDelete})
        // sendClientSuccess(res,HTTPCODES.OK,"Deleted the search post successfully", {searchPostToDelete})

    } catch (error) {
        const err = new SearchServiceError(`PostCreatedEventError-${error.name}`,HTTPCODES.INTERNAL_SERVER_ERROR,`Unable to consume the event received`,true,{eventData})
        throw err
    }
}
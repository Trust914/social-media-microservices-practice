export const deleteCachedData = async(redisClient, input)=>{
    const keys = await redisClient.keys("search*")
    if(keys.length > 0){
        await req.redisClient.del(keys)
    }
}
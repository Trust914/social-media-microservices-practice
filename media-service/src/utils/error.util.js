export class MediaServiceError extends Error{
    constructor(name, httpCode,description,isOperational,details={}){
        super(name,httpCode,description,isOperational,details)

        Object.setPrototypeOf(this, new.target.prototype)
        this.name = name
        this.httpCode = httpCode
        this.description = description
        this.isOperational = isOperational
        this.details = details

        Error.captureStackTrace(this)
    }
}
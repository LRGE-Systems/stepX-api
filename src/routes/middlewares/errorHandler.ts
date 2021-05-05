import * as restify from 'restify'
import { eventLoggerController } from '../../common/EventLoggerController'
// Se tiver duvidas consulte: http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml 
// Código em conformidade com rfc7231, rfc2616, rfc2616 elaborado pelo Internet Engineering Task Force (https://tools.ietf.org/html/rfc7231#section-6.3.5)

export const handleError = (req: restify.Request, resp: restify.Response, err, done)=>{
  let errorHandler = {
    status: err.statusCode,
    messages: err.message
  }
  
  
  switch(err.name){
    case 'MongoError':
      if(err.code === 11000){
        errorHandler.status = 400
      }
      eventRegister(req,err)
      break
    case 'ValidationError':
      errorHandler.status = 400
      errorHandler.messages = []
      for(let name in err.errors){
        errorHandler.messages.push({message: err.errors[name].message})
      }
      eventRegister(req,err)
      break
    case 'NotAuthorizedError':
      errorHandler.status = err.statusCode
      errorHandler.messages = 'Invalid Credentials'
      // eventRegister(req,err)
      break
    case 'ForbiddenError':
      errorHandler.status = err.statusCode
      errorHandler.messages = 'Permission denied'
      // eventRegister(req,err)
      break
    case 'TokenExpiredError':
      errorHandler.status = 401
      errorHandler.messages = `Token expired at ${err.expiredAt}`
      // eventRegister(req,err)
      break
    case 'InvalidCredentialsError':
      errorHandler.status = 401
      errorHandler.messages = `User credencials are not valid`
      // eventRegister(req,err)
      break
    case 'MethodNotAllowedError':
      errorHandler.status = 405
      errorHandler.messages = `Method Not Allowed`
      eventRegister(req,err)
      break
    case 'ConflictError':
      errorHandler.status = 409
      errorHandler.messages = err.message
      eventRegister(req,err)
      break
    case 'ResourceNotFoundError':
      errorHandler.status = err.statusCode
      errorHandler.messages =err.message
      eventRegister(req,err)
      break
    case 'NotFoundError':
      errorHandler.status = err.statusCode
      errorHandler.messages =err.message
      eventRegister(req,err)
      break
    case 'BadRequestError':
      errorHandler.status = err.statusCode
      errorHandler.messages =err.message
      eventRegister(req,err)
      break
    case 'JsonWebTokenError':
      errorHandler.status = 401
      errorHandler.messages = `Credencials are not valid`
      break
    default:
        console.log(err.name, err.message)
        errorHandler.status = 500
        errorHandler.messages = {message: 'Internal server error'}
        eventRegister(req,err)
        break
  }
  // done()
  return resp.json(errorHandler.status, {
    message : errorHandler.messages
  })
}


function eventRegister(req,err){
  req.log.error(
    'Error %s in router: %s ',
    err.name,
    req.getPath())
  eventLoggerController.registerEvent({
    nome: err.name,
    idUsuario: req.authenticated ? req.authenticated._id: null,
    rota: req.getPath(),
    metodoHTTP: req.method,
    mensagem: "Error: " + err.message
  })
}
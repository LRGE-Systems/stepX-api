import * as restify from 'restify'
import * as jwt from 'jsonwebtoken'
import { ForbiddenError,InvalidCredentialsError } from 'restify-errors'
import { environment } from '../../config/environment'
import { userController } from '../controllers/UserController'
import { eventLoggerController } from '../../common/EventLoggerController'

export const tokenParser: restify.RequestHandler = (req, resp, next) => {
  const token = extractToken(req)
  if(token){
    jwt.verify(token, environment.security.apiSecret, applyBearer(req, next))
  } else {
    return req.getPath().split("/")[1] === "auth" || String(req.getPath()) === String('/users/recoverPassword') || String(req.getPath()) === String('/users/requestPassword') ? next():next(new ForbiddenError("Permission denied"))//token === undefined ? resp.json(500):next()
  }
}

function extractToken(req: restify.Request){
  //Authorization: Bearer TOKEN
  let token = undefined
  const authorization = req.header('authorization')
  if(authorization){
    const parts: string[] = authorization.split(' ')
    if(parts.length === 2 && parts[0] === 'Bearer'){
      token = parts[1]
    }
  }
  return token
}

function applyBearer (req: restify.Request, next): (error, decoded) => void {
  return (error, decoded) =>{
    if(decoded) {
      userController.findByID(decoded.sub).then(user=>{
        if(user){
          req.authenticated = user //
          next()
        }else{
          req.log.error(
            'No user found for %s in path %s',
            decoded.sub,
            req.getPath())
          eventLoggerController.registerEvent({
            nome: "Invalid Credentials Error",
            rota: req.getPath(),
            metodoHTTP: req.method,
            mensagem: "Token Invalid: " + req.header('authorization')
          })
          next(new InvalidCredentialsError("No user found"));
        }
        
      }).catch(next)
    }else if(error.name =='TokenExpiredError'){
      req.log.error(
        'Attempted access with expired token: %s in route: %s', req.header('authorization'),
        req.getPath())
          next(error)
    } else {
      next()
    }
  }
}
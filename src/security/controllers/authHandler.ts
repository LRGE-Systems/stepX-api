import * as restify from 'restify'
import {NotAuthorizedError} from 'restify-errors'
import * as jwt from 'jsonwebtoken'
import {environment} from '../../config/environment'
import { eventLoggerController } from '../../common/EventLoggerController'
import { userController } from '../../routes/controllers/UserController'

export const authenticate: restify.RequestHandler = (req,resp, next)=>{
    const {login, password} = req.body
    userController.findByEmail(login,'+credenciais.senha')
        .then(user =>{
            if(user && (<any>user).matches(password) ){ 
                const token = jwt.sign({info: 'stepx-api'}, environment.security.apiSecret, {
                  subject: String(user._id), 
                  expiresIn: '1d',
                })
                req.log.info('User %s is authorized with profiles %j on route %s.',
                req.authenticated ? req.authenticated._id: req.body.cpf,
                req.authenticated ? req.authenticated.credenciais: "",
                req.path())
                eventLoggerController.registerEvent({
                  nome: "Login",
                  idUsuario: user._id,
                  rota: req.getPath(),
                  metodoHTTP: req.method,
                  token: token,
                  origem: req.headers
                })
                return resp.json({
                  user: {
                    name: user.nome, 
                    email: user.email
                  }, 
                  token: token,
                  profile: user.credenciais.permissao
                })

              } else {
                  if(user){
                    req.log.error(
                      'Invalid Credentials for user with ID: %s. ',
                      user._id)
                      eventLoggerController.registerEvent({
                        nome: "Login Error",
                        idUsuario: user._id,
                        rota: req.getPath(),
                        metodoHTTP: req.method,
                        mensagem: 'Invalid Credentials for user with ID: ' + user._id,
                        origem: req.headers
                      })
                  }else{
                    req.log.error(
                      'Permission denied for %s. Invalid Credentials',
                      req.body.email)
                      
                  }
                return next(new NotAuthorizedError('Invalid Credentials'))
              }
        }).catch(next)
    
}
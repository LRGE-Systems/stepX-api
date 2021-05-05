import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, InvalidArgumentError, InvalidCredentialsError, NotAuthorizedError, NotFoundError } from "restify-errors";
import { MailController } from "../../common/mailController";
import { environment } from "../../config/environment";
import { User } from "../../data/models/User";
import * as jwt from 'jsonwebtoken'

class UserController {
  indexMe(req, res, next) {
    
    User.find({_id: req.authenticated.id})
      .then((projects) => res.json(projects))
      .catch(next);
  }

  findByEmail(email: String, projection?: String){
    return User
        .findOne({email},projection)
}
  findByID(id: String, projection?: String){
    return User
        .findOne({_id: id},projection)
  }
  validateMail(body:any):Boolean{
    return body && body.email && body.email.includes("")
  }
  async create(req,res,next){
      let user = new User(req.body)      
      user.tokenPwdRecover  = await userController.generateToken(user)
      user.save()
          .then(user => {
              res.json("Success")
              return (new MailController()).sendMail(user).then(response => {
                console.log(response) 
            })

          })
          .catch(next)  
  }

  async requestPassword(req,res,next){
    if(!req.body.email){
        next(new InvalidCredentialsError(""));
    }else{
        return User.findOne({email:req.body.email})
        .then(async user => {
            if(user){
                user.tokenPwdRecover  = await userController.generateToken(user)
                user.updateOne({tokenPwdRecover: user.tokenPwdRecover})
                .then(users => {
                    return (new MailController()).sendMail(user).then(response => {
                        res.setHeader('Content-Range', 5);
                        res.json("sucess")
                    })
                    
                })
                .catch(next)
            }else{
                return next( new NotFoundError("Email not found"))
            }
        })
    }    
  }

  async changePassword(req,res,next){
    const token = req.query.token ? req.query.token: null
    return User.findOne({tokenPwdRecover: token},"+tokenPwdRecover")
    .then(user => {
        if( user){
            if(token === null || !req.body.senha || String(user.tokenPwdRecover) !== String(token)){
                next(new InvalidCredentialsError(""));
              }else{
                jwt.verify(token, environment.security.apiSecret + String(user._id), (error, decoded) =>{
                  if(decoded){
                    return User.updateOne({_id: user._id},{"credenciais.senha": req.body.senha,tokenPwdRecover: "" }).then(result => res.json("sucess"))
                    
                  }else if(error.name =='TokenExpiredError'){
                        return next(new InvalidCredentialsError("Token expired"))
                  }else{
                    next(error)
                  } 
                })
              }    
        }else{
            return next(new NotAuthorizedError("This user does not exist, or toke invalid!"))
        }
    })
    .catch(next)
  }
  async generateToken(user:User):Promise<String>{
      const token = await jwt.sign({info: 'password recover token'}, environment.security.apiSecret + String(user._id), {
          subject: <string>user.email, 
          expiresIn: '1d',
        })
      return token
  }

  
}
export const userController = new UserController();

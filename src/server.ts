import * as restify from 'restify'
import {environment} from './config/environment'
import {Router} from './protocols/router'
import * as mongoose from 'mongoose'
import { handleError } from './routes/middlewares/errorHandler'
import * as corsMiddleware from 'restify-cors-middleware'
import { logger } from './common/logger'
import { tokenParser } from './routes/middlewares/tokenParser'
export class Server {

  application: restify.Server

  initializeDb(){
      (<any>mongoose).Promise= global.Promise
      return mongoose.connect(environment.db.url,{
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useCreateIndex: true
      })
  }

  initRoutes(routers: Router[]): Promise<any>{
    return new Promise((resolve, reject)=>{
      try{

        this.application = restify.createServer({
          name: 'step-api',
          version: '1.0.0',
          log: logger
        })
        this.application.pre(restify.plugins.requestLogger({
          log: logger,
        }))
        const corsOptions: corsMiddleware.Options = {
          preflightMaxAge: 10,
          origins: ['*'],
          allowHeaders: ['authorization','range','Content-Range'],
          exposeHeaders: ['x-custom-header','Content-Range',]

        }
        const cors: corsMiddleware.CorsMiddleware = corsMiddleware(corsOptions)
        this.application.pre(cors.preflight)
        this.application.use(cors.actual)
        this.application.use(restify.plugins.queryParser())
        this.application.use(restify.plugins.jsonBodyParser());
        this.application.use(tokenParser)
        //routes
        for (const router of routers) {
            router.applyRoutes(this.application)
        }

        this.application.listen(environment.server.port, ()=>{
           resolve(this.application)
        })
        this.application.on('restifyError', handleError)

      }catch(error){
        reject(error)
      }
    })
  }

  bootstrap(routers: Router[] = []): Promise<Server>{
      return this.initializeDb().then(()=>this.initRoutes(routers).then(()=> this))
  }

}
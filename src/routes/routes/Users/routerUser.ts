import { Router } from "../../../protocols/router";
import * as restify from "restify";
import { authorize } from "../../../security/middlewares/authorizeAcess";
import { userController } from "../../controllers/UserController";

export class UserRouter extends Router {
  applyRoutes(application: restify.Server) {
    application.get("/users/me", [userController.indexMe]);
    application.post("/users", [userController.create]);
    application.patch('/users/recoverPassword', [userController.changePassword])
    application.post('/users/requestPassword', [userController.requestPassword])

    
  }
}

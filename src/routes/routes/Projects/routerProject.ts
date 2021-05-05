import { Router } from "../../../protocols/router";
import * as restify from "restify";
import { projectController } from "../../controllers/ProjectController";
import { authorize } from "../../../security/middlewares/authorizeAcess";

export class ProjectRouter extends Router {
  applyRoutes(application: restify.Server) {
    application.get("/projects", [authorize(), projectController.index]);
    
  }
}

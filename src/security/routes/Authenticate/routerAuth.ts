import { Router } from "../../../protocols/router";
import * as restify from "restify";
import { authenticate } from "../../controllers/authHandler";

export class AuthRouter extends Router {
  applyRoutes(application: restify.Server) {
    application.post("/auth", authenticate);
  }
}

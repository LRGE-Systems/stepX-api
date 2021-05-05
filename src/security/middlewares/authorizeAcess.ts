import * as restify from "restify";
import { ForbiddenError } from "restify-errors";
import { eventLoggerController } from "../../common/EventLoggerController";

export const authorize: (...profiles: string[]) => restify.RequestHandler = (
  ...profiles
) => {
  return (req, resp, next) => {
    if ( req.authenticated !== undefined && handlePermissions(req.authenticated, req.getRoute().path, req.getRoute().method)) {
      req.log.info(
        "User %s is authorized to make a %j on route %s.",
        req.authenticated ? req.authenticated._id : "None",
        req.method ? req.method : "",
        req.path()
      );
      eventLoggerController.registerEvent({
        nome: "Event",
        idUsuario: req.authenticated._id,
        rota: req.getPath(),
        metodoHTTP: req.method,
        mensagem: "Success",
        token: req.header("authorization"),
      });
      next();
    } else {
      if (req.authenticated) {
        req.log.error(
          "User with ID: %s try to access a route without permission. ",
          req.authenticated._id
        );
        eventLoggerController.registerEvent({
          nome: "Forbidden Error",
          idUsuario: req.authenticated._id,
          rota: req.getPath(),
          metodoHTTP: req.method,
          mensagem:
            "User with ID: " +
            req.authenticated._id +
            " try to access a route without permission.",
        });
      }
      next(new ForbiddenError("Permission denied"));
    }
  };
};

const handlePermissions = (professional, path, httpMethod) => {
  let permissions = professional.credenciais.permissao;

  switch (path.split("/")[1]) {

    // case "projects":
    //   return validateRequest(
    //     httpMethod,
    //     permissions.projects
    //   );
    //   break;
    
    default:
      return false;
      break;
  }
  return false;
};

const validateRequest = (httpMethod, permission) => {
  switch (httpMethod) {
    case "GET":
      return permission.leitura ? true : false;
      break;
    case "POST":
      return permission.gravacao ? true : false;
      break;
    case "PATCH":
      return permission.edicao ? true : false;
      break;
    case "DELETE":
      return permission.exclusao ? true : false;
      break;
    default:
      return false;
      break;
  }
};

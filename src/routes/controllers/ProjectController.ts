import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "restify-errors";
import { Project } from "../../data/models/Project";


class ProjectController {
  index(req, res, next) {
    Project.find()
      .then((projects) => res.json(projects))
      .catch(next);
  }
  
}
export const projectController = new ProjectController();

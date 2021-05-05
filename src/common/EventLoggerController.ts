import * as mongoose from "mongoose";
import { EventLogger } from "./EventLogger";

class EventLoggerController {
  index(req, res, next) {
    EventLogger.find(req.query)
      .then((event) => res.json(event))
      .catch(next);
  }

  create(req, res, next) {
    let event = new EventLogger(req.body);
    event
      .save()
      .then((event) => res.json(event))
      .catch(next);
  }
  registerEvent(data) {
    let event = new EventLogger(data);
    event
      .save()
  }

  
}
export const eventLoggerController = new EventLoggerController();

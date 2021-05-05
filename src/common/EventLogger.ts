import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

const EventLoggerSchema = new mongoose.Schema({
 
  nome: {
    type: String
  },
  idUsuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Professional"
  },
  rota: {
    type: String
  },
  metodoHTTP: {
    type: String
  },
  token: {
    type: String
  },
  mensagem: {
    type: String
  },
  origem: {  },
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

EventLoggerSchema.plugin(uniqueValidator);

export const EventLogger = mongoose.model("EventLogger", EventLoggerSchema);

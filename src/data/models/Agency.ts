import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

export interface Agency extends mongoose.Document {
}

const AgencySchema = new mongoose.Schema({
  projectId: {
    type: String,
  },
  agencyID: {
    type: Number,
  },
  link: {
    type: String,
  },
  name: {
    type: String,
  },
  status: {
    type: String,
  },
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

AgencySchema.plugin(uniqueValidator);

export const Agency = mongoose.model<Agency>(
  "Agency",
  AgencySchema
);

import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

export interface ActivityStep extends mongoose.Document {
}

const ActivityStepSchema = new mongoose.Schema({
  activityId: {
    type: Number
  },
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

ActivityStepSchema.plugin(uniqueValidator);

export const ActivityStep = mongoose.model<ActivityStep>(
  "Activity_Step",
  ActivityStepSchema
);

import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

export interface Activity extends mongoose.Document {
}

const ActivitySchema = new mongoose.Schema({
  activityId:{
    type: Number,
  },
  agencyId: {
    type: Number,
  },
  bankFinanced: {
    type: Number,
  },
  contractType: {
    type: Number,
  },
  reviewType: {
    type: String,
  },
  description: {
    type: String,
  },
  estimatedAmount: {
    type: Number,
  },
  link: {
    type: String,
  },
  marketApproach: {
    type: String,
  },
  processStatus: {
    type: String,
  },
  procurementCategory: {
    type: String,
  },
  procurementMethod: {
    type: String,
  },
  projectId: {
    type: String,
  },
  referenceNo: {
    type: String,
  },
  retroactiveFinancing: {
    type: Boolean,
  },
  procurementProcess: {
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

ActivitySchema.plugin(uniqueValidator);

export const Activity = mongoose.model<Activity>(
  "Activity",
  ActivitySchema
);

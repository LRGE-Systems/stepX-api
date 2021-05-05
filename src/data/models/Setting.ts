import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

export interface Setting extends mongoose.Document {
}

const SettingSchema = new mongoose.Schema({
  projectsAvailable: [{
    type: String
  }],
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

SettingSchema.plugin(uniqueValidator);

export const Setting = mongoose.model<Setting>(
  "Setting",
  SettingSchema
);

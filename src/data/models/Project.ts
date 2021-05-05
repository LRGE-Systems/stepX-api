import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

export interface Project extends mongoose.Document {
}

const ProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
  },
  abstract: {
    type: String,
  },
  approvalDate: {
    type: Date,
  },
  lastUpdateDate: {
    type: Date,
  },
  closingDate: {
    type: Date,
  },
  approvalFy: {
    type: String,
  },
  borrower: {
    type: String,
  },
  commitmentAmount: {
    type: String,
  },
  countryName: {
    type: String,
  },
  regionName: {
    type: String,
  },
  environmentalCategory: {
    type: String,
  },
  projectName: {
    type: String,
  },
  sectorId: {
    type: Number,
  },
  status: {
    type: String
  },
  teamLeader: [{
    type: String
  }],
  sectors: [],
  implementingAgency: {
    type: String
  },
  totalProjectCost: {
    type: String
  },
  disbursedAmount: {
    type: Number
  },
  loanAmount: {
    type: Number
  },  
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

ProjectSchema.plugin(uniqueValidator);

export const Project = mongoose.model<Project>(
  "Project",
  ProjectSchema
);

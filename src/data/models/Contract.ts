import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

export interface Contract extends mongoose.Document {
}

const ContractSchema = new mongoose.Schema({
    activityId: {
      type: Number
    },
    contractId:{
      type: Number,
      unique: true
    },
    stepActivityId: {
      type: Number
    },
    agencyId: {
      type: Number
    },
    awardId: {
      type: Number
    },
    baseAmount: {
      type: Number
    },
    baseCurrency: {
      type: String
    },
    baseExchangeRate: {
      type: Number
    },
    baseAmountEquivalence: {
      type: Number
    },
    description: {
      type: String
    },
    org: {
      type: String
    },
    referenceNo: {
      type: String
    },
    status: {
      type: String
    },
    totalAmount: {
      type: Number
    },
    totalCurrency: {
      type: String
    },
    totalAmountEquivalence: {
      type: String
    },
    link: {
      type: String
    },
    projectId: {
      type: String
    },
    signedDate: {
      type: Date
    },
    amendmentAmount: {
      type: Number
    },
    completionDate: {
      type: Date
    },
    duration: {
      type: String
    },
  
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

ContractSchema.plugin(uniqueValidator);

export const Contract = mongoose.model<Contract>(
  "Contract",
  ContractSchema
);

import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

export interface Amendment extends mongoose.Document {
}

const ContractAmendmentSchema = new mongoose.Schema({
  contractId: {
    type: Number
  },
    hasAmendments:{
      type: Boolean
    },
    amendmentNumber: {
      type: Number
    },
    substitutionStaff :{
      type: Boolean
    },
    variationOrder :{
      type: Boolean
    },
    other :{
      type: Boolean
    },
    modificationScopeServices :{
      type: Boolean
    },
    changeTimePerformance :{
      type: Boolean
    },
    contractDurationNoObjection :{
      type: Number
    },
    timeUnit :{
      type: String
    },
    durationRevised :{
      type: Number
    },
    timeUnitDuration :{
      type: String
    },
    changeTermsConditions :{
      type: Boolean
    },
    amendmentId: {
      type: Number,
      unique: true
    },

    changePriceAdjustmentsCPA :{
      type: Boolean
    },
    currentContractCurrencyCPA :{
      type: String
    },
    currentContractAmountCPA :{
      type: Number
    },
    contractAmendmentCurrencyCPA :{
      type: String
    },
    contractAmendmentAmountCPA :{
      type: Number
    },
    contractAmendmentExchangeRateCPA :{
      type: Number
    },
    contractAmendmentAmountDollarCPA :{
      type: Number
    },
    currencyContractPlusContractAmendmentCPA :{
      type: String
    },
    currentContractAmountPlusContractAmendmentAmountCPA :{
      type: Number
    },

    changeContractAmountCCA :{
      type: Boolean
    },
    currentContractCurrencyCCA :{
      type: String
    },
    currentContractAmountCCA :{
      type: Number
    },
    contractAmendmentCurrencyCCA :{
      type: String
    },
    contractAmendmentAmountCCA :{
      type: Number
    },
    contractAmendmentExchangeRateCCA :{
      type: Number
    },
    contractAmendmentAmountDollarCCA :{
      type: Number
    },
    currencyContractPlusContractAmendmentCCA :{
      type: String
    },
    currentContractAmountPlusContractAmendmentAmountCCA :{
      type: Number
    },
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

ContractAmendmentSchema.plugin(uniqueValidator);

export const Amendment = mongoose.model<Amendment>(
  "Contract_Amendment",
  ContractAmendmentSchema
);

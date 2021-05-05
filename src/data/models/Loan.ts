import * as mongoose from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

export interface Loan extends mongoose.Document { 
}

const LoanSchema = new mongoose.Schema({
  projectId: {
    type: String,
  },
  amount: {
    type: String,
  },
  approvalDate: {
    type: Date,
  },
  closingDate: {
    type: Date,
  },
  contractAmountPaid: {
    type: Number,
  },
  disbursedAmountPaid: {
    type: Number,
  },
  effectivenessDate: {
    type: Date,
  },
  agreementNo: {
    type: String,
  },
  relatedActivities: {
    type: Number,
  },
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

LoanSchema.plugin(uniqueValidator);

export const Loan = mongoose.model<Loan>(
  "Loan",
  LoanSchema
);

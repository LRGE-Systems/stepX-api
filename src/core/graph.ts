import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "restify-errors";
import { Activity } from "../data/models/Activity";
import { ActivityStep } from "../data/models/ActivitySteps";
import { Agency } from "../data/models/Agency";
import { Amendment } from "../data/models/Amendment";
import { Contract } from "../data/models/Contract";
import { Project } from "../data/models/Project";
import { activityController } from "../routes/controllers/ActivityController";
import { amendmentController } from "../routes/controllers/AmendmentController";
import { contractController } from "../routes/controllers/ContractController";
import { roadmapController } from "../routes/controllers/RoadmapController";



class Graphics{
    
    async getActivityGraphByField(activityQuery, anotherQuerys, field, next){
        activityQuery = await activityController.formatActivityQueryParams(activityQuery)
        var filteredAnotherQuerys = await contractController.formatContractQueryParams(anotherQuerys)
        return Activity.aggregate([
            { $match: { ...activityQuery } },
            {
                $lookup: {
                    from: "projects",
                    localField: "projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
                $unwind: {
                    path : "$projectData"
                }
            },
            {
                "$project":{
                    "regionName": "$projectData.regionName",
                    "countryName": "$projectData.countryName",
                    "sectors": "$projectData.sectors",
                    activityId:1,
                    agencyId:1,
                    bankFinanced:1,
                    contractType:1,
                    description:1,
                    estimatedAmount:1,
                    marketApproach:1,
                    processStatus:1,
                    procurementCategory:1,
                    procurementMethod:1,
                    procurementProcess:1,
                    projectId:1,
                    referenceNo:1,
                    retroactiveFinancing:1,
                    status:1,
                    reviewType:1,
                }
            },


            {
                $match: { $and: [filteredAnotherQuerys][0] ? [filteredAnotherQuerys]:[{}]  } 
            },
            
            { "$facet": {
                "data": [{"$group" : {_id:`$${field}`, count:{$sum:1},monetaryValue : { $sum: "$estimatedAmount" } }}],
                "totalCount": [
                  { "$count": "count" }
                ],
                "totalMonetaryValue": [{"$group" : {_id: null, monetaryValue : { $sum: "$estimatedAmount" } }}]
              }}
            
        ])
        .then(data  => {
            return data
        }).catch(next)
    }
    async getContractGraphByField(contractQuery, anotherQuerys, field, next){
        var filteredAnotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        var contractsQuery = await contractController.formatContractQueryParams(contractQuery)
        console.log(filteredAnotherQuerys)
        return Contract.aggregate([
            { $match: { ...contractsQuery } },
            {
                $lookup: {
                    from: "activities",
                    localField: "activityId",
                    foreignField: "activityId",
                    as: "activityData"
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
                $unwind: {
                    path : "$activityData"
                }
            },
            {
                $unwind: {
                    path : "$projectData"
                }
            },
            {
                "$project":{
                    "regionName": "$projectData.regionName",
                    "countryName": "$projectData.countryName",
                    "sectors": "$projectData.sectors",
                    activityId:"$activityData.activityId",
                    agencyId:"$activityData.agencyId",
                    bankFinanced:"$activityData.bankFinanced",
                    contractType:"$activityData.contractType",
                    description:"$activityData.description",
                    estimatedAmount:"$activityData.estimatedAmount",
                    marketApproach:"$activityData.marketApproach",
                    processStatus:"$activityData.processStatus",
                    procurementCategory:"$activityData.procurementCategory",
                    procurementMethod:"$activityData.procurementMethod",
                    procurementProcess:"$activityData.procurementProcess",
                    projectId:1,
                    referenceNo:"$activityData.referenceNo",
                    retroactiveFinancing:"$activityData.retroactiveFinancing",
                    status:"$activityData.status",
                    reviewType:"$activityData.reviewType",
                }
            },


            {
                $match: { $and: [filteredAnotherQuerys][0] ? [filteredAnotherQuerys]:[{}]  } 
            },
            
            { "$facet": {
                "data": [{"$group" : {_id:`$${field}`, count:{$sum:1},monetaryValue : { $sum: "$estimatedAmount" } }}],
                "totalCount": [
                  { "$count": "count" }
                ],
                "totalMonetaryValue": [{"$group" : {_id: null, monetaryValue : { $sum: "$estimatedAmount" } }}]
              }}
            
        ])
        .then(data  => {
            return data
        }).catch(next)
    }
    async getAmendmentGraphByFields(amendmentQuery, anotherQuerys, field, next){
        amendmentQuery = await amendmentController.formatAmendmentQueryParams(amendmentQuery)
        var filteredAnotherQuerys = Object.keys(anotherQuerys).map(key =>{
            var query = {}
            query[`${key}`] = anotherQuerys[key]
            return query
        })
        return Amendment.aggregate([
            { $match: { ...amendmentQuery } },
            {
                $lookup: {
                    from: "contracts",
                    localField: "contractId",
                    foreignField: "contractId",
                    as: "contractData"
                }
            },
            {
                    $unwind: {
                        path : "$contractData"
                    }
            },
                  
            {
              $lookup: {
                  from: "activities",
                  localField: "contractData.activityId",
                  foreignField: "activityId",
                  as: "activityData"
              }
          },
          {
            $unwind: {
                path : "$activityData"
            }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "contractData.projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                  "amendmentNumber":1,
                  "contractId":1,
                  "contractDurationNoObjection":1,
                  "changeTimePerformance":1,
                  "timeUnit":1,
                  "durationRevised":1,
                  "timeUnitDuration":1,
                  "changeContractAmountCCA":1,
                  "currentContractAmountCCA":1,
                  "currentContractCurrencyCCA":1,
                  "contractAmendmentAmountCCA":1,
                  "contractAmendmentCurrencyCCA":1,
                  "contractAmendmentExchangeRateCCA":1,
                  "contractAmendmentAmountDollarCCA":1,
                  "currentContractAmountPlusContractAmendmentAmountCCA":1,
                  "currencyContractPlusContractAmendmentCCA":1,
                  "changePriceAdjustmentsCPA":1,
                  "currentContractAmountCPA":1,
                  "currentContractCurrencyCPA":1,
                  "contractAmendmentAmountCPA":1,
                  "contractAmendmentCurrencyCPA":1,
                  "contractAmendmentExchangeRateCPA":1,
                  "contractAmendmentAmountDollarCPA":1,
                  "currentContractAmountPlusContractAmendmentAmountCPA":1,
                  "currencyContractPlusContractAmendmentCPA":1,
                  "changeTermsConditions":1,
                  "substitutionStaff":1,
                  "other":1,
                  "modificationScopeServices":1,
                  "variationOrder":1,
                  //////// Contract
                  "activityId":"$contractData.activityId",//
                  "agencyId": "$contractData.agencyId",//
                  "contractReferenceNo": "$contractData.referenceNo",
                   "contractStatus": "$contractData.status",
                   "projectId": "$contractData.projectId",
                   "baseDuration": "$contractData.duration",
                   ////////////// Activity
                   "reviewType": "$activityData.reviewType",
                   "procurementCategory": "$activityData.procurementCategory",
                  //  "referenceNo": "$activityData.",
                  "procurementMethod": "$activityData.procurementMethod", //
                   "procurementProcess": "$activityData.procurementProcess",//
                   "marketApproach": "$activityData.marketApproach",//
                  ///////////////// Project
                  'projectName': "$projectData.projectName",
                  'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",
                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            
            
            { "$facet": {
                "data": [{"$group" : {_id:1,
                    changeTimePerformance: {$sum: {$cond: [{$eq:["$changeTimePerformance", true]}, 1, 0]}},
                    other: {$sum: {$cond: [{$eq:["$other", true]}, 1, 0]}},
                    changeContractAmountCCA: {$sum: {$cond: [{$eq:["$changeContractAmountCCA", true]}, 1, 0]}},
                    changeTermsConditions: {$sum: {$cond: [{$eq:["$changeTermsConditions", true]}, 1, 0]}},
                    changePriceAdjustmentsCPA: {$sum: {$cond: [{$eq:["$changePriceAdjustmentsCPA", true]}, 1, 0]}},
                    modificationScopeServices: {$sum: {$cond: [{$eq:["$modificationScopeServices", true]}, 1, 0]}},
                    substitutionStaff: {$sum: {$cond: [{$eq:["$substitutionStaff", true]}, 1, 0]}},
                    
            }}],
                "totalCount": [
                 
                  { "$count": "count" }
                ],
                
              }},
            
        ])
        .then(data  => {
            return data
        })
    }
    async getAmmendedContractsGraphByType(amendmentQuery, anotherQuerys, field, next){
        amendmentQuery = await amendmentController.formatAmendmentQueryParams(amendmentQuery)
        var filteredAnotherQuerys = Object.keys(anotherQuerys).map(key =>{
            var query = {}
            query[`${key}`] = anotherQuerys[key]
            return query
        })
        return Amendment.aggregate([
            { $match: { ...amendmentQuery } },
            {
                $lookup: {
                    from: "contracts",
                    localField: "contractId",
                    foreignField: "contractId",
                    as: "contractData"
                }
            },
            {
                    $unwind: {
                        path : "$contractData"
                    }
            },
                  
            {
              $lookup: {
                  from: "activities",
                  localField: "contractData.activityId",
                  foreignField: "activityId",
                  as: "activityData"
              }
          },
          {
            $unwind: {
                path : "$activityData"
            }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "contractData.projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                  "amendmentNumber":1,
                  "contractId":1,
                  "contractDurationNoObjection":1,
                  "changeTimePerformance":1,
                  "timeUnit":1,
                  "durationRevised":1,
                  "timeUnitDuration":1,
                  "changeContractAmountCCA":1,
                  "currentContractAmountCCA":1,
                  "currentContractCurrencyCCA":1,
                  "contractAmendmentAmountCCA":1,
                  "contractAmendmentCurrencyCCA":1,
                  "contractAmendmentExchangeRateCCA":1,
                  "contractAmendmentAmountDollarCCA":1,
                  "currentContractAmountPlusContractAmendmentAmountCCA":1,
                  "currencyContractPlusContractAmendmentCCA":1,
                  "changePriceAdjustmentsCPA":1,
                  "currentContractAmountCPA":1,
                  "currentContractCurrencyCPA":1,
                  "contractAmendmentAmountCPA":1,
                  "contractAmendmentCurrencyCPA":1,
                  "contractAmendmentExchangeRateCPA":1,
                  "contractAmendmentAmountDollarCPA":1,
                  "currentContractAmountPlusContractAmendmentAmountCPA":1,
                  "currencyContractPlusContractAmendmentCPA":1,
                  "changeTermsConditions":1,
                  "substitutionStaff":1,
                  "other":1,
                  "modificationScopeServices":1,
                  "variationOrder":1,
                  //////// Contract
                  "activityId":"$contractData.activityId",//
                  "agencyId": "$contractData.agencyId",//
                  "contractReferenceNo": "$contractData.referenceNo",
                   "contractStatus": "$contractData.status",
                   "projectId": "$contractData.projectId",
                   "baseDuration": "$contractData.duration",
                   ////////////// Activity
                   "reviewType": "$activityData.reviewType",
                   "procurementCategory": "$activityData.procurementCategory",
                  //  "referenceNo": "$activityData.",
                  "procurementMethod": "$activityData.procurementMethod", //
                   "procurementProcess": "$activityData.procurementProcess",//
                   "marketApproach": "$activityData.marketApproach",//
                  ///////////////// Project
                  'projectName': "$projectData.projectName",
                  'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",
                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            
            
            { "$facet": {
                "data": [{"$group" : {_id:1,
                    changeTimePerformance: {$sum: {$cond: [{$eq:["$changeTimePerformance", true]}, 1, 0]}},
                    other: {$sum: {$cond: [{$eq:["$other", true]}, 1, 0]}},
                    changeContractAmountCCA: {$sum: {$cond: [{$eq:["$changeContractAmountCCA", true]}, 1, 0]}},
                    changeTermsConditions: {$sum: {$cond: [{$eq:["$changeTermsConditions", true]}, 1, 0]}},
                    changePriceAdjustmentsCPA: {$sum: {$cond: [{$eq:["$changePriceAdjustmentsCPA", true]}, 1, 0]}},
                    modificationScopeServices: {$sum: {$cond: [{$eq:["$modificationScopeServices", true]}, 1, 0]}},
                    substitutionStaff: {$sum: {$cond: [{$eq:["$substitutionStaff", true]}, 1, 0]}},
            }}],
                "totalCount": [
                 
                  { "$count": "count" }
                ],
                
              }},
        ])
        .then(data  => {
            return data
        })
    }
    async getAmmendedContractsGraphByCategory(contractQuery, anotherQuerys, field, next){
        var filteredAnotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        var contractsQuery = await contractController.formatContractQueryParams(contractQuery)
        return Contract.aggregate([
            { $match: { ...contractsQuery } },
            {
                $lookup: {
                    from: "contract_amendments",
                    localField: "contractId",
                    foreignField: "contractId",
                    as: "amendmentData"
                }
            },
            {
              $lookup: {
                  from: "activities",
                  localField: "activityId",
                  foreignField: "activityId",
                  as: "activityData"
              }
          },
          {
            $unwind: {
                path : "$activityData"
            }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                  "contractId":1,
                  "status":1,
                  projectId:1,
                  referenceNo:1,
                  agencyId:1,
                  activityId:1,
                  sizeAmendments: {$size: "$amendmentData"},
                   ////////////// Activity
                   "reviewType": "$activityData.reviewType",
                   "procurementCategory": "$activityData.procurementCategory",
                  //  "referenceNo": "$activityData.",
                  "procurementMethod": "$activityData.procurementMethod", //
                   "procurementProcess": "$activityData.procurementProcess",//
                   "marketApproach": "$activityData.marketApproach",//
                  ///////////////// Project
                  'projectName': "$projectData.projectName",
                  'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",
                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            
            
            { "$facet": {
                "data": [{"$group" : {_id:{procurementCategory: "$procurementCategory", },
                    "category": {$first:"$procurementCategory"},
                    sizeContractsAmendmended: {$sum: {$cond: [{ $gte: [ "$sizeAmendments", 1 ] }, 1, 0]}},
                    sizeContracts: {$push: "$contractId"}
            }}],
              }},
            
        ])
        .then(data  => {
            return data
        })
    }
    async getAmendedContractsGraphByFields(amendmentQuery, anotherQuerys, field, next){
        amendmentQuery = await amendmentController.formatAmendmentQueryParams(amendmentQuery)
        var filteredAnotherQuerys = Object.keys(anotherQuerys).map(key =>{
            var query = {}
            query[`${key}`] = anotherQuerys[key]
            return query
        })
        return Amendment.aggregate([
            { $match: { ...amendmentQuery } },
            {
                $lookup: {
                    from: "contracts",
                    localField: "contractId",
                    foreignField: "contractId",
                    as: "contractData"
                }
            },
            {
                    $unwind: {
                        path : "$contractData"
                    }
            },
                  
            {
              $lookup: {
                  from: "activities",
                  localField: "contractData.activityId",
                  foreignField: "activityId",
                  as: "activityData"
              }
          },
          {
            $unwind: {
                path : "$activityData"
            }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "contractData.projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                  "amendmentNumber":1,
                  "contractId":1,
                  "contractDurationNoObjection":1,
                  "changeTimePerformance":1,
                  "timeUnit":1,
                  "durationRevised":1,
                  "timeUnitDuration":1,
                  "changeContractAmountCCA":1,
                  "currentContractAmountCCA":1,
                  "currentContractCurrencyCCA":1,
                  "contractAmendmentAmountCCA":1,
                  "contractAmendmentCurrencyCCA":1,
                  "contractAmendmentExchangeRateCCA":1,
                  "contractAmendmentAmountDollarCCA":1,
                  "currentContractAmountPlusContractAmendmentAmountCCA":1,
                  "currencyContractPlusContractAmendmentCCA":1,
                  "changePriceAdjustmentsCPA":1,
                  "currentContractAmountCPA":1,
                  "currentContractCurrencyCPA":1,
                  "contractAmendmentAmountCPA":1,
                  "contractAmendmentCurrencyCPA":1,
                  "contractAmendmentExchangeRateCPA":1,
                  "contractAmendmentAmountDollarCPA":1,
                  "currentContractAmountPlusContractAmendmentAmountCPA":1,
                  "currencyContractPlusContractAmendmentCPA":1,
                  "changeTermsConditions":1,
                  "substitutionStaff":1,
                  "other":1,
                  "modificationScopeServices":1,
                  "variationOrder":1,
                  //////// Contract
                  "activityId":"$contractData.activityId",//
                  "agencyId": "$contractData.agencyId",//
                  "contractReferenceNo": "$contractData.referenceNo",
                   "contractStatus": "$contractData.status",
                   "projectId": "$contractData.projectId",
                   "baseDuration": "$contractData.duration",
                   ////////////// Activity
                   "reviewType": "$activityData.reviewType",
                   "procurementCategory": "$activityData.procurementCategory",
                  //  "referenceNo": "$activityData.",
                  "procurementMethod": "$activityData.procurementMethod", //
                   "procurementProcess": "$activityData.procurementProcess",//
                   "marketApproach": "$activityData.marketApproach",//
                  ///////////////// Project
                  'projectName': "$projectData.projectName",
                  'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",
                //   "temp": {$sum: {$cond: [{$eq:["$changeTimePerformance", true]}, 1, 0]}}
                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            
            
            { "$facet": {
                "data": [{"$group" : {_id:{contractId:"$contractId"},
                    changeTimePerformance: {$sum: {$cond: [{$eq:["$changeTimePerformance", true]}, 1, 0]}},
                    other: {$sum: {$cond: [{$eq:["$other", true]}, 1, 0]}},
                    changeContractAmountCCA: {$sum: {$cond: [{$eq:["$changeContractAmountCCA", true]}, 1, 0]}},
                    changeTermsConditions: {$sum: {$cond: [{$eq:["$changeTermsConditions", true]}, 1, 0]}},
                    changePriceAdjustmentsCPA: {$sum: {$cond: [{$eq:["$changePriceAdjustmentsCPA", true]}, 1, 0]}},
                    modificationScopeServices: {$sum: {$cond: [{$eq:["$modificationScopeServices", true]}, 1, 0]}},
                    substitutionStaff: {$sum: {$cond: [{$eq:["$substitutionStaff", true]}, 1, 0]}},
            }},],
                
                
              }},
            
        ])
        .then(data  => {
            return data
        })
    }
    async getRoadmapGraph(stepQuery, anotherQuerys, field, next){
        stepQuery = await roadmapController.formatRoadmapQueryParams(stepQuery)
        anotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        console.log(stepQuery)
        console.log(anotherQuerys)
        var filteredAnotherQuerys = Object.keys(anotherQuerys).map(key =>{
            var query = {}
            query[`${key}`] = anotherQuerys[key]
            return query
        })
        return ActivityStep.aggregate([
            { $match: { ...stepQuery } },     
            {
              $lookup: {
                  from: "activities",
                  localField: "activityId",
                  foreignField: "activityId",
                  as: "activityData"
              }
          },
          {
            $unwind: {
                path : "$activityData"
            }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "activityData.projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                    activityId:1,
                    stepActivityId:1,
                    runningDate: 1,
                    revisedDate:1,
                    revisedDays:1,
                    originalDateDays:1,
                    originalDate:1,
                    actualDate:1,
                    stepName:1,
                    diff:{$divide: [{ $subtract: ["$actualDate","$originalDate"] }, 1000 * 60 * 60 * 24]},
                    projectData: "$projectData",
                    activityData: "$activityData",
                    projectId: "$projectData.projectId",
                    procurementCategory: "$activityData.procurementCategory",
                    procurementMethod: "$activityData.procurementMethod",
                    procurementProcess: "$activityData.procurementProcess",
                    reviewType: "$activityData.reviewType",
                    'projectName': "$projectData.projectName",
                  'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",

                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            {
                $match: { $and: [{"actualDate":{$ne: null}},{"originalDate":{$ne: null}}]  } 
            },
            {
                $match: { $and: [{"procurementCategory": {$ne:"Consultant Services"}}]  } 
            },
            
            
            { "$facet": {
                "procurementCategory": [
                   
                    {"$group" : {_id:{stepName: "$stepName"},
                        "dias": {$push:"$diff"},
                        
                              
                    },}, 
                ],
                
              }},
            
        ])
        .then(data  => {
            // return data
            data = data[0].procurementCategory.map( element => {
                element.dias = element.dias.filter(value => value!=undefined).sort(function(a, b) {
                    return a - b;
                  })
                var min = Math.min( ...element.dias )
                var max = Math.max( ...element.dias );
                var median = graphics.median(element.dias)
                var average = (element.dias.reduce((a, b) => a + b, 0))/element.dias.length || 0
                var firstQuartil = graphics.median(element.dias.slice(0,Math.floor(element.dias.length / 2)))
                var thirdQuartil = graphics.median(element.dias.slice(Math.floor(element.dias.length / 2),element.dias.length))
                var inferiorLimit = firstQuartil - (1.5 * (thirdQuartil - firstQuartil))
                var superiorLimit = thirdQuartil + (1.5 * (thirdQuartil - firstQuartil))
               
                return {stepName: element._id.stepName,
                    median: median, average: average , 
                    meanDeviation:  graphics.meanDeviation(element.dias, average),
                    firstQuartil : firstQuartil,
                    thirdQuartil:thirdQuartil,
                    inferiorLimit: inferiorLimit < min ? min:inferiorLimit,
                    superiorLimit:superiorLimit > max? max:superiorLimit,
                    rawData:element.dias,
                    outlayers : (element.dias.filter(element => element < (inferiorLimit < min ? min:inferiorLimit))).concat(element.dias.filter(element => element > (superiorLimit > max? max:superiorLimit))),
                 }
            })
            
            return graphics.groupBy(data,"stepName")
        })
    }
    async getRoadmapConsultantServicesGraph(stepQuery, anotherQuerys, field, next){
        stepQuery = await roadmapController.formatRoadmapQueryParams(stepQuery)
        anotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        console.log(stepQuery)
        console.log(anotherQuerys)
        var filteredAnotherQuerys = Object.keys(anotherQuerys).map(key =>{
            var query = {}
            query[`${key}`] = anotherQuerys[key]
            return query
        })
        return ActivityStep.aggregate([
            { $match: { ...stepQuery } },     
            {
              $lookup: {
                  from: "activities",
                  localField: "activityId",
                  foreignField: "activityId",
                  as: "activityData"
              }
          },
          {
            $unwind: {
                path : "$activityData"
            }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "activityData.projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                    activityId:1,
                    stepActivityId:1,
                    runningDate: 1,
                    revisedDate:1,
                    revisedDays:1,
                    originalDateDays:1,
                    originalDate:1,
                    actualDate:1,
                    stepName:1,
                    diff:{$divide: [{ $subtract: ["$actualDate","$originalDate"] }, 1000 * 60 * 60 * 24]},
                    projectData: "$projectData",
                    activityData: "$activityData",
                    projectId: "$projectData.projectId",
                    procurementCategory: "$activityData.procurementCategory",
                    procurementMethod: "$activityData.procurementMethod",
                    procurementProcess: "$activityData.procurementProcess",
                    reviewType: "$activityData.reviewType",
                    'projectName': "$projectData.projectName",
                  'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",

                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            {
                $match: { $and: [{"actualDate":{$ne: null}},{"originalDate":{$ne: null}}]  } 
            },
            {
                $match: { $and: [{"procurementCategory": "Consultant Services"}]  } 
            },
            
            
            { "$facet": {
                "procurementCategory": [
                   
                    {"$group" : {_id:{stepName: "$stepName"},
                        "dias": {$push:"$diff"},
                        
                              
                    },}, 
                ],
                
              }},
            
        ])
        .then(data  => {
            // return data
            data = data[0].procurementCategory.map( element => {
                element.dias = element.dias.filter(value => value!=undefined).sort(function(a, b) {
                    return a - b;
                  })
                var min = Math.min( ...element.dias )
                var max = Math.max( ...element.dias );
                var median = graphics.median(element.dias)
                var average = (element.dias.reduce((a, b) => a + b, 0))/element.dias.length || 0
                var firstQuartil = graphics.median(element.dias.slice(0,Math.floor(element.dias.length / 2)))
                var thirdQuartil = graphics.median(element.dias.slice(Math.floor(element.dias.length / 2),element.dias.length))
                var inferiorLimit = firstQuartil - (1.5 * (thirdQuartil - firstQuartil))
                var superiorLimit = thirdQuartil + (1.5 * (thirdQuartil - firstQuartil))
               
                return {stepName: element._id.stepName,
                    median: median, average: average , 
                    meanDeviation:  graphics.meanDeviation(element.dias, average),
                    firstQuartil : firstQuartil,
                    thirdQuartil:thirdQuartil,
                    inferiorLimit: inferiorLimit < min ? min:inferiorLimit,
                    superiorLimit:superiorLimit > max? max:superiorLimit,
                    rawData:element.dias,
                    outlayers : (element.dias.filter(element => element < (inferiorLimit < min ? min:inferiorLimit))).concat(element.dias.filter(element => element > (superiorLimit > max? max:superiorLimit))),
                 }
            })
            
            return graphics.groupBy(data,"stepName")
        })
    }
    async getActivityDurationByCategoryGraph(stepQuery, anotherQuerys, field, next){
        stepQuery = await roadmapController.formatRoadmapQueryParams(stepQuery)
        anotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        console.log(stepQuery)
        console.log(anotherQuerys)
        var filteredAnotherQuerys = Object.keys(anotherQuerys).map(key =>{
            var query = {}
            query[`${key}`] = anotherQuerys[key]
            return query
        })
        return Activity.aggregate([
            // { $match: { ...stepQuery } },     
            {
              $lookup: {
                  from: "activity_steps",
                  localField: "activityId",
                  foreignField: "activityId",
                  as: "stepData"
              }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                    activityId:1,
                    // projectData: "$projectData",
                    // steps: "$stepData",
                    agencyId:1,
                    bankFinanced:1,
                    contractType:1,
                    description:1,
                    estimatedAmount:1,
                    marketApproach:1,
                    processStatus:1,
                    procurementCategory:1,
                    procurementMethod:1,
                    procurementProcess:1,
                    projectId:1,
                    referenceNo:1,
                    retroactiveFinancing:1,
                    status:1,
                    reviewType:1,
                    firstStep: {$first:"$stepData" },
                    lastStep: {$last:"$stepData" },
                    // duration: {$subtract: [{$last:"$stepData.originalDate" },{$first:"$stepData.originalDate" }]},
                    duration: {$divide: [{ $subtract: [{$last:"$stepData.originalDate" },{$first:"$stepData.originalDate" }]}, 1000 * 60 * 60 * 24]},
                    'projectName': "$projectData.projectName",
                //   'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",

                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            {
                $match: { $and: [{"lastStep.revisedDate":{$ne: null}},{"firstStep.revisedDate":{$ne: null}} ]}
            },
            
            
            
            { "$facet": {
                "procurementCategory": [
                   
                    {"$group" : {_id:{procurementCategory: "$procurementCategory"},
                        duration: {$push:"$duration"},
                        
                              
                    },}, 
                ],
                
              }},
            
        ])
        .then(data  => {
            data = data[0].procurementCategory.map( element => {
                element.duration = element.duration.filter(value => value!=undefined).sort(function(a, b) {
                    return a - b;
                  })
                var min = Math.min( ...element.duration )
                var max = Math.max( ...element.duration );
                var median = graphics.median(element.duration)
                var average = (element.duration.reduce((a, b) => a + b, 0))/element.duration.length || 0
                var firstQuartil = graphics.median(element.duration.slice(0,Math.floor(element.duration.length / 2)))
                var thirdQuartil = graphics.median(element.duration.slice(Math.floor(element.duration.length / 2),element.duration.length))
                var inferiorLimit = firstQuartil - (1.5 * (thirdQuartil - firstQuartil))
                var superiorLimit = thirdQuartil + (1.5 * (thirdQuartil - firstQuartil))
                return {procurementCategory: element._id.procurementCategory,
                    median: median, average: average , 
                    meanDeviation:  graphics.meanDeviation(element.duration, average),
                    firstQuartil : firstQuartil,
                    thirdQuartil:thirdQuartil,
                    inferiorLimit: inferiorLimit < min ? min:inferiorLimit,
                    superiorLimit:superiorLimit > max? max:superiorLimit,
                    rawData:element.duration,
                    outlayers : (element.duration.filter(element => element < (inferiorLimit < min ? min:inferiorLimit))).concat(element.duration.filter(element => element > (superiorLimit > max? max:superiorLimit))),
                 }
            })
            
            return data
        })
    }
     meanDeviation(data, average){
        var sum = 0
        data.forEach(element => {
            sum = sum + Math.abs(element - average)
        });
        return sum/data.length || 0
    }
   
            
    async getRoadmapGraphByProcurementMethod(stepQuery, anotherQuerys, field, next){
        stepQuery = await roadmapController.formatRoadmapQueryParams(stepQuery)
        anotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        var filteredAnotherQuerys = Object.keys(anotherQuerys).map(key =>{
            var query = {}
            query[`${key}`] = anotherQuerys[key]
            return query
        })
        return ActivityStep.aggregate([
            { $match: { ...stepQuery } },     
            {
              $lookup: {
                  from: "activities",
                  localField: "activityId",
                  foreignField: "activityId",
                  as: "activityData"
              }
          },
          {
            $unwind: {
                path : "$activityData"
            }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "activityData.projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                    activityId:1,
                    stepActivityId:1,
                    runningDate: 1,
                    revisedDate:1,
                    revisedDays:1,
                    originalDateDays:1,
                    originalDate:1,
                    actualDate:1,
                    stepName:1,
                    diff:{$divide: [{ $subtract: ["$actualDate","$originalDate"] }, 1000 * 60 * 60 * 24]},
                    projectData: "$projectData",
                    activityData: "$activityData",
                    projectId: "$projectData.projectId",
                    procurementCategory: "$activityData.procurementCategory",
                    procurementMethod: "$activityData.procurementMethod",
                    procurementProcess: "$activityData.procurementProcess",
                    reviewType: "$activityData.reviewType",
                    'projectName': "$projectData.projectName",
                  'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",
                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            {
                $match: { $and: [{"procurementMethod": {$ne:"Individual Consultant Selection"}}]  } 
            },
            {
                $match: { $and: [{"actualDate":{$ne: null}},{"originalDate":{$ne: null}}]  } 
            },
            
            
            { "$facet": {
                "procurementCategory": [
                   
                    {"$group" : {_id:{stepName: "$stepName"},
                        "dias": {$push:"$diff"},
                    },}, 
                ],
                
              }},
            
        ])
        .then(data  => {
            data = data[0].procurementCategory.map( element => {
                element.dias = element.dias.filter(value => value!=undefined).sort(function(a, b) {
                    return a - b;
                  })
                var min = Math.min( ...element.dias )
                var max = Math.max( ...element.dias );
                var median = graphics.median(element.dias)
                var average = (element.dias.reduce((a, b) => a + b, 0))/element.dias.length || 0
                var firstQuartil = graphics.median(element.dias.slice(0,Math.floor(element.dias.length / 2)))
                var thirdQuartil = graphics.median(element.dias.slice(Math.floor(element.dias.length / 2),element.dias.length))
                var inferiorLimit = firstQuartil - (1.5 * (thirdQuartil - firstQuartil))
                var superiorLimit = thirdQuartil + (1.5 * (thirdQuartil - firstQuartil))
                // var totalData = element.revisedDays
                return {stepName: element._id.stepName,
                    procurementCategory: element._id.procurementCategory, 
                    // min: min, 
                    // max: max, 
                    median: median, average: average , 
                    meanDeviation:  graphics.meanDeviation(element.dias, average),
                    firstQuartil : firstQuartil,
                    thirdQuartil:thirdQuartil,
                    inferiorLimit: inferiorLimit < min ? min:inferiorLimit,
                    superiorLimit:superiorLimit > max? max:superiorLimit,
                    rawData:element.dias,
                    outlayers : (element.dias.filter(element => element < (inferiorLimit < min ? min:inferiorLimit))).concat(element.dias.filter(element => element > (superiorLimit > max? max:superiorLimit))),
                 }
            })
            return graphics.groupBy(data,"stepName")
        })
    }
    async getFinancialPhysicalGraph(contractQuery, anotherQuerys, field, next){
        contractQuery = await contractController.formatContractQueryParams(contractQuery)
        anotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        var filteredAnotherQuerys = Object.keys(anotherQuerys).map(key =>{
            var query = {}
            query[`${key}`] = anotherQuerys[key]
            return query
        })
        return Contract.aggregate([
            { $match: { ...contractQuery } },     
            {
              $lookup: {
                  from: "activities",
                  localField: "activityId",
                  foreignField: "activityId",
                  as: "activityData"
              }
          },
            {
              $lookup: {
                  from: "contract_amendments",
                  localField: "contractId",
                  foreignField: "contractId",
                  as: "amendmentData"
              }
          },
          {
            $unwind: {
                path : "$activityData"
            }
          },
            {
                $lookup: {
                    from: "projects",
                    localField: "activityData.projectId",
                    foreignField: "projectId",
                    as: "projectData"
                }
            },
            {
              $unwind: {
                  path : "$projectData"
              }
            },
            {
                "$project": {
                    activityId:1,
                    stepActivityId:1,
                    runningDate: 1,
                    revisedDate:1,
                    revisedDays:1,
                    originalDateDays:1,
                    originalDate:1,
                    actualDate:1,
                    totalAmount:1,
                    totalAmountEquivalence:1,
                    contractId:1,
                    duration:1,
                    signedDate:1,
                    baseAmountEquivalence:1,
                    amendments: "$amendmentData",
                    projectData: "$projectData",
                    activityData: "$activityData",
                    projectId: "$projectData.projectId",
                    procurementCategory: "$activityData.procurementCategory",
                    procurementMethod: "$activityData.procurementMethod",
                    procurementProcess: "$activityData.procurementProcess",
                    reviewType: "$activityData.reviewType",
                    'projectName': "$projectData.projectName",
                  'sectors': "$projectData.sectors",
                  'regionName': "$projectData.regionName", //
                  'countryName': "$projectData.countryName",
                }
              },
            {
                $match: { $and: filteredAnotherQuerys[0] ? filteredAnotherQuerys:[{}]  } 
            },
            {
                $match: { $and: [{signedDate: {$ne: null}}]  } 
            },
            
        ])
        .then(data  => {
            var response = data.map(contract => {
                // var originalDuration = contract.duration 
                contract.duration = graphics.convertToDay(String(contract.duration).replace("M","").replace("D","").replace("Y",""), contract.duration.includes("Y") ? "Y":contract.duration.includes("D") ? "D": "M")
                // console.log(contract.duration)
                contract = graphics.treatAmendment(contract)
                var signedDate = new Date(contract.signedDate)
                var finalDateWithAmmendment = new Date(signedDate.setMonth(signedDate.getMonth()+((Number(contract.duration)+contract.amendmentDuration )/30)));
                signedDate = new Date(contract.signedDate)
                
                var finalDate = new Date(signedDate.setMonth(signedDate.getMonth()+((Number(contract.duration))/30)));
                var valuePerDay = contract.baseAmountEquivalence/Number(contract.duration)
                // console.log(valuePerDay)
                var valuesDistributedWithAmendment = graphics.distributeValuesInYears(contract.signedDate,finalDateWithAmmendment,contract.valuePerDayWithAmendment )
                var valuesDistributed = graphics.distributeValuesInYears(contract.signedDate,finalDate,valuePerDay )

                return{ valuesDistributed, valuesDistributedWithAmendment}
            })
            

            return graphics.mergeContractsValues(response)

        })
    }
    mergeContractsValues(contracts){
        var filtered = {
            "valuesDistributed": [],
            "valuesDistributedWithAmendment":[]
        }
        contracts.forEach(contract =>{
            filtered.valuesDistributed.push((<any>contract).valuesDistributed)
            filtered.valuesDistributedWithAmendment.push((<any>contract).valuesDistributedWithAmendment)
        })
        filtered.valuesDistributed = graphics.mergeValuesByYear(filtered.valuesDistributed)
        filtered.valuesDistributedWithAmendment = graphics.mergeValuesByYear(filtered.valuesDistributedWithAmendment)
        return {original: filtered.valuesDistributed, withAmendments: filtered.valuesDistributedWithAmendment}
    }
    mergeValuesByYear(values){
        // console.log("values: ",values)
        var merged = values.flat(Infinity)
        merged = graphics.groupBy(merged,"year")
        console.log()
        Object.keys(merged).forEach(key =>{
            merged[key] = merged[key].reduce(function(previousValue, currentValue) {
                return {
                    // "year": key,
                    "valuePerYear": previousValue.valuePerYear + currentValue.valuePerYear
                }
              });
        })
        // console.log(merged)
        return merged
    }
    distributeValuesInYears(initialDate, finalDate, valuePerDay){
        
        var durationInYears = graphics.arrayOfYears(new Date(initialDate).getFullYear(), finalDate.getFullYear()).map(year =>{   
            if(new Date(initialDate).getFullYear()===finalDate.getFullYear()){
                return {year: finalDate.getFullYear(), valuePerYear: valuePerDay* (finalDate.getMonth() - (new Date(initialDate).getMonth()))  * 30}
            }else if (year == new Date(initialDate).getFullYear()){
                var effectiveMonths = 12 - new Date(initialDate).getMonth() 
                return {year: year, valuePerYear: valuePerDay * effectiveMonths * 30}
            }else if(year ===finalDate.getFullYear()){
                var effectiveMonths = Number(finalDate.getMonth())
                return {year: year, valuePerYear: valuePerDay * effectiveMonths * 30}
            }else{
                return {year: year, valuePerYear: valuePerDay * 365}
            }
        })
        
        return durationInYears

    }
    arrayOfYears(startDate,endDate){
        const listDate = [];
        let strDate = startDate;

        while (strDate <= endDate) {
        listDate.push(strDate);
        strDate = strDate +1
        };
        return listDate
    }
    
    convertToDay(duration, originalUnity,){
        switch (originalUnity) {
            case "Y":
                return Number(duration) * 12 * 30
                break;
            case "M":
                return Number(duration)*30
                break;
            default:
                return Number(duration)
                break;
        }
    }
    treatAmendment(contract){
        var contractTotalWithAmendment = Number(contract.totalAmountEquivalence)
        var amendmentDuration = 0
        // console.log(contract.amendments.length)
        contract.amendments.forEach(amendment =>{
            if(amendment.changeTimePerformance){
                amendmentDuration = amendmentDuration + graphics.convertToDay(String(amendment.durationRevised).replace("M","").replace("D","").replace("Y",""), amendment.timeUnitDuration)
                amendmentDuration = graphics.convertToDay(String(amendment.durationRevised).replace("M","").replace("D","").replace("Y",""), amendment.timeUnitDuration)
            }
        })

        return { valuePerDayWithAmendment: Number(contractTotalWithAmendment)/ (Number(contract.duration)+amendmentDuration),amendmentDuration,contractTotalWithAmendment,...contract}

    }
    groupBy(xs, key) {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };
    median(numbers) {
        const sorted = numbers.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
    
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
    
        return sorted[middle];
    }
}
export const graphics = new Graphics();
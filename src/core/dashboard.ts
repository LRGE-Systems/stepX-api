import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "restify-errors";
import { Activity } from "../data/models/Activity";
import { Agency } from "../data/models/Agency";
import { Amendment } from "../data/models/Amendment";
import { Contract } from "../data/models/Contract";
import { Project } from "../data/models/Project";
import { activityController } from "../routes/controllers/ActivityController";
import { amendmentController } from "../routes/controllers/AmendmentController";
import { contractController } from "../routes/controllers/ContractController";



class Dashboads{
    
    async getDashBoardActivity(activityQuery, anotherQuerys, fields, next){
        activityQuery = await activityController.formatActivityQueryParams(activityQuery)
        console.log(activityQuery)
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
                $lookup: {
                    from: "loans",
                    localField: "projectId",
                    foreignField: "projectId",
                    as: "loanData"
                }
            },
            {
                $lookup: {
                    from: "agencies",
                    localField: "agencyId",
                    foreignField: "agencyID",
                    as: "agencyData"
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
                    "loans": "$loanData",
                    "agencyData": "$agencyData",
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
                "loans": [{"$group" : {_id:"$projectId",
                    "disbursedAmountPaid" :  { $first: "$loans.disbursedAmountPaid" },
                    "relatedActivities" :  { $first: "$loans.relatedActivities" },
                    "amount" :  { $first: "$loans.amount" },
                }},],
                "agencies": [{"$group" : {_id:"$agencyId",
                    "agecy" :  { $push: "$agencyData" },
                }},],
                "projects": [{"$group" : {_id:"$projectId",
                    "project" :  { $push: "$projectData" },
                }},],
                "countries": [{"$group" : {_id:"$countryName",
                    "project" :  { $push: "$projectData" },
                }},],
               
                "activities": [
                    {"$group" : {_id:null,
                        "estimatedAmount" : { $sum: "$estimatedAmount" },
                    }},
                ],
                "activitiesTotal": [
                    {"$group" : {_id:"$activityId",
                        "activity" : { $push: "$activityId" },
                    }},
                ],
              }},

              {$project:{
                "estimatedAmount": "$activities.estimatedAmount",//$size
                "disbursedAmountPaid":  "$loans.disbursedAmountPaid"  ,
                "loanAmount": "$loans.amount",
                "agenciesCount": {$size:"$agencies"},
                // "relatedActivities":  "$loans.relatedActivities"  ,
                "relatedActivities":  {$size:"$activitiesTotal"}  ,
                "projects": {$size:"$projects"},
                "countries": {$size: "$countries"},
                // "contractsSUM": "$contractsSUM.all",

                  
              }}

             
            
        ])
        .then( async data  => {
            // return data
            return  {
                "estimatedAmount": dashboads.formatCurrency(data[0]["estimatedAmount"][0]),
                "disbursedAmountPaid" : dashboads.formatCurrency(await dashboads.mergeArraysAndSum(data[0]["disbursedAmountPaid"])),
                "loanAmount": dashboads.formatCurrency(await dashboads.convertStringArraysMergeAndSum(data[0]["loanAmount"]) ),
                "N° Agencies": data[0]["agenciesCount"],
                "relatedActivities": data[0]["relatedActivities"],//await dashboads.mergeArraysAndSum(data[0]["relatedActivities"]),
                "projects": data[0]["projects"],
                "countries": data[0]["countries"],
                "N° Sectors": 0,

              }
            
            
        }).catch(next)
    }
    async getDashBoardContract(contractQuery, anotherQuerys, fields, next){
        var filteredAnotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        var contractsQuery = await contractController.formatContractQueryParams(contractQuery)
        console.log(filteredAnotherQuerys)
        console.log(contractsQuery)
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
                $lookup: {
                    from: "contract_amendments",
                    localField: "contractId",
                    foreignField: "contractId",
                    as: "amendmentData"
                }
            },
            // {
            //     $unwind: {
            //         path : "$activityData"
            //     }
            // },
            {
                $lookup: {
                    from: "loans",
                    localField: "projectId",
                    foreignField: "projectId",
                    as: "loanData"
                }
            },
            {
                $lookup: {
                    from: "agencies",
                    localField: "agencyId",
                    foreignField: "agencyID",
                    as: "agencyData"
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
                    "loans": "$loanData",
                    "projectData": "$projectData",
                    "agencyData": "$agencyData",
                    "amendmentData":"$amendmentData",
                    contractId: 1,
                    activityId:1,
                    agencyId:1,
                    baseAmount:1,
                    totalAmount:1,
                    bankFinanced:"$activityData.bankFinanced",
                    contractType:"$activityData.contractType",
                    description:1,
                    estimatedAmount:"$activityData.estimatedAmount",
                    marketApproach:"$activityData.marketApproach",
                    processStatus:"$activityData.processStatus",
                    procurementCategory:"$activityData.procurementCategory",
                    procurementMethod:"$activityData.procurementMethod",
                    procurementProcess:"$activityData.procurementProcess",
                    projectId:1,
                    baseAmountEquivalence:1,
                    totalAmountEquivalence:1,
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
                "loans": [{"$group" : {_id:"$projectId",
                    "disbursedAmountPaid" :  { $first: "$loans.disbursedAmountPaid" },
                    "relatedActivities" :  { $first: "$loans.relatedActivities" },
                    "amount" :  { $first: "$loans.amount" },
                }},],
                // "agencies": [{"$group" : {_id:"$agencyId",
                //     "agecy" :  { $push: "$agencyData" },
                // }},],
                "projects": [{"$group" : {_id:"$projectId",
                    "project" :  { $push: "$projectData.projectId" },
                }},],
                "amendments": [{"$group" : {_id:"$contractId",
                    "contractAmendmentAmountDollarCCA" :  { $push: "$amendmentData.contractAmendmentAmountDollarCCA" },
                }},],
                "countries": [{"$group" : {_id:"$countryName",
                    "project" :  { $push: "$projectData.projectId" },
                }},],
                "contracts": [{"$group" : {_id:"$activityId",
                    "totalAmount" :  { $push: "$totalAmountEquivalence" },
                    "baseAmount" :  { $push: "$baseAmountEquivalence" },
                    "contractIds" :  { $push: "$contractId" },
                }},],
                // "contractsSUM": [{"$group" : {_id:"$activityId",
                //     "all" :  { $push: "$contractId" },
                // }},],
                "activities": [
                    {"$group" : {_id:null,
                        "estimatedAmount" : { $sum: "$estimatedAmount" },
                    }}, 
                ],
                "activitiesCount": [
                    {"$group" : {_id:{contractId:"$contractId", activityId: "$activityId" },
                        "activity" : { $push: "$activityId" },
                        "contract" : { $push: "$contractId" },
                    }}, 
                ],
              }},

              {$project:{
                "estimatedAmount": "$activities.estimatedAmount",//$size
                // "disbursedAmountPaid":  "$loans.disbursedAmountPaid"  ,
                // "loanAmount": "$loans.amount",
                // "agenciesCount": {$size:"$agencies"},
                "amendmentAmount" : "$amendments.contractAmendmentAmountDollarCCA",
                "relatedActivities":  "$loans.relatedActivities"  ,
                "projects": {$size:"$projects"},
                "countries": {$size: "$countries"},
                "contracts": "$contracts",
                // "activitiesCount": "$activitiesCount"
                "activitiesCount": {$size:"$activitiesCount"}
                // "contractsSUM": "$contractsSUM.all",

                  
              }}

             
            
        ])
        .then( async data  => {
            // return data
            return  {
                // "estimatedAmount": data[0]["estimatedAmount"][0],
                // "disbursedAmountPaid" : await dashboads.mergeArraysAndSum(data[0]["disbursedAmountPaid"]),
                // "loanAmount": await dashboads.convertStringArraysMergeAndSum(data[0]["loanAmount"]) ,
                // "N° Agencies": data[0]["agenciesCount"],
                // "relatedActivities": await dashboads.mergeArraysAndSum(data[0]["relatedActivities"]),
                "activities": data[0]["activitiesCount"],
                "projects": data[0]["projects"],
                "countries": data[0]["countries"],
                "N° Sectors": 0,
                "contractTotal": dashboads.formatCurrency(await dashboads.convertStringArraysMergeAndSum(await dashboads.mergeArrays(data[0]["contracts"].map(element => element["totalAmount"])))),
                "contractBase": dashboads.formatCurrency(await dashboads.mergeArraysAndSum(await dashboads.mergeArrays(data[0]["contracts"].map(element => element["baseAmount"])))),
                "amendmentAmount": dashboads.formatCurrency(await dashboads.mergeArraysAndSum(await dashboads.mergeArrays(data[0]["amendmentAmount"]))),
                "contractIds": await (await dashboads.mergeArrays(await dashboads.mergeArrays(data[0]["contracts"].map(element => element["contractIds"])))).length,

              }
            
            
        }).catch(next)
    }
    async getDashBoardAmendment(amendmentQuery, anotherQuerys, fields, next){
        var filteredAnotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        var amendmentsQuery = await contractController.formatContractQueryParams(amendmentQuery)
        // console.log(filteredAnotherQuerys)
        // console.log(amendmentsQuery)
        return Contract.aggregate([
            { $match: { ...amendmentsQuery } },
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
                    from: "loans",
                    localField: "projectId",
                    foreignField: "projectId",
                    as: "loanData"
                }
            },
            {
                $lookup: {
                    from: "agencies",
                    localField: "agencyId",
                    foreignField: "agencyID",
                    as: "agencyData"
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
                    "loans": "$loanData",
                    "projectData": "$projectData",
                    "agencyData": "$agencyData",
                    "amendmentData":"$amendmentData",
                    "amendmentId":"$amendmentData.amendmentId",
                    contractId: 1,
                    activityId:1,
                    agencyId:1,
                    baseAmount:1,
                    totalAmount:1,
                    bankFinanced:"$activityData.bankFinanced",
                    contractType:"$activityData.contractType",
                    description:1,
                    estimatedAmount:"$activityData.estimatedAmount",
                    marketApproach:"$activityData.marketApproach",
                    processStatus:"$activityData.processStatus",
                    procurementCategory:"$activityData.procurementCategory",
                    procurementMethod:"$activityData.procurementMethod",
                    procurementProcess:"$activityData.procurementProcess",
                    projectId:1,
                    baseAmountEquivalence:1,
                    totalAmountEquivalence:1,
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
                "loans": [{"$group" : {_id:"$projectId",
                    "disbursedAmountPaid" :  { $first: "$loans.disbursedAmountPaid" },
                    "relatedActivities" :  { $first: "$loans.relatedActivities" },
                    "amount" :  { $first: "$loans.amount" },
                }},],
                // "agencies": [{"$group" : {_id:"$agencyId",
                //     "agecy" :  { $push: "$agencyData" },
                // }},],
                "projects": [{"$group" : {_id:"$projectId",
                    "project" :  { $push: "$projectData.projectId" },
                }},],
                "amendments": [{"$group" : {_id:"$contractId",
                    "contractAmendmentAmountDollarCCA" :  { $push: "$amendmentData.contractAmendmentAmountDollarCCA" },
                }},],
                "amendmentsTotal": [{"$group" : {_id:"$contractId",
                    "amendmentId" :  { $push: "$amendmentData.amendmentId" },
                }},],
                "countries": [{"$group" : {_id:"$countryName",
                    "project" :  { $push: "$projectData.projectId" },
                }},],
                "contracts": [{"$group" : {_id:"$activityId",
                    "totalAmount" :  { $push: "$totalAmountEquivalence" },
                    "baseAmount" :  { $push: "$baseAmountEquivalence" },
                    "contractIds" :  { $push: "$contractId" },
                }},],
                "contractsTotal": [{"$group" : {_id:"$contractId",
                    "contract" :  { $push: "$contractId" },
                    "amendment" :  { $push: "$amendmentData.amendmentId" },
                }},],
                // "contractsSUM": [{"$group" : {_id:"$activityId",
                //     "all" :  { $push: "$contractId" },
                // }},],
                "activities": [
                    {"$group" : {_id:null,
                        "estimatedAmount" : { $sum: "$estimatedAmount" },
                    }}, 
                ],
                // "activitiesCount": [
                //     {"$group" : {_id:"$activityId",
                //         "activity" : { $push: "$activityId" },
                //     }}, 
                // ],
              }},

              {$project:{
                "estimatedAmount": "$activities.estimatedAmount",//$size
                // "disbursedAmountPaid":  "$loans.disbursedAmountPaid"  ,
                // "loanAmount": "$loans.amount",
                // "agenciesCount": {$size:"$agencies"},
                "amendmentAmount" : "$amendments.contractAmendmentAmountDollarCCA",
                // "numberAmendments": "$amendmentData",
                "numberAmendments": "$amendmentsTotal.amendmentId",
                "relatedActivities":  "$loans.relatedActivities"  ,
                "projects": {$size:"$projects"},
                "countries": {$size: "$countries"},
                "contracts": "$contracts",
                "numberAmendmentContracts": "$contractsTotal.amendment",
                "contractsTotal": "$contractsTotal"
                // "activitiesCount": {$size:"$activitiesCount"}
                // "contractsSUM": "$contractsSUM.all",

                  
              }}

             
            
        ])
        .then( async data  => {
            return  {
                "projects": data[0]["projects"],
                "countries": data[0]["countries"],
                "amendments": (await (await dashboads.mergeArrays(await dashboads.mergeArrays(data[0]["numberAmendments"])))).length,
                "contractTotal": dashboads.formatCurrency(await dashboads.convertStringArraysMergeAndSum(await dashboads.mergeArrays(data[0]["contracts"].map(element => element["totalAmount"])))),
                "contractBase": dashboads.formatCurrency(await dashboads.mergeArraysAndSum(await dashboads.mergeArrays(data[0]["contracts"].map(element => element["baseAmount"])))),
                "amendmentAmount": dashboads.formatCurrency(await dashboads.mergeArraysAndSum(await dashboads.mergeArrays(data[0]["amendmentAmount"]))),
                "contracts": await (await dashboads.mergeArrays(await dashboads.mergeArrays(data[0]["contracts"].map(element => element["contractIds"])))).length,
                "amendmendedContracts": (await Amendment.find({},["contractId"]).distinct("contractId").exec()).length,
              }
            
            
        }).catch(next)
    }
    formatCurrency(value,currency="$"){
        return currency+ String(dashboads.monetaryFormater(value))
    }

    monetaryFormater(number){
        var SI_SYMBOL = ["", "K", "M", "B", "T", "P", "E"];
        var tier = Math.log10(Math.abs(number)) / 3 | 0;
        if(tier == 0) return number;
        var suffix = SI_SYMBOL[tier];
        var scale = Math.pow(10, tier * 3);
    
        // scale the number
        var scaled = number / scale;
    
        // format number and add suffix
        return scaled.toFixed(1) + suffix;
    }
    async getDashBoardAmendment2(amendmentQuery, anotherQuerys, fields, next){
        var filteredAnotherQuerys = await activityController.formatActivityQueryParams(anotherQuerys)
        var amendmentsQuery = await contractController.formatContractQueryParams(amendmentQuery)
        return Amendment.aggregate([
            { $match: { ...amendmentsQuery } },
            {
                $lookup: {
                    from: "contracts",
                    localField: "contractId",
                    foreignField: "contractId",
                    as: "contractData"
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
                $lookup: {
                        from: "projects",
                        localField: "contractData.projectId",
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
                    path : "$contractData"
                }
            },
            {
                $lookup: {
                    from: "loans",
                    localField: "contractData.projectId",
                    foreignField: "projectId",
                    as: "loanData"
                }
            },
            {
                $lookup: {
                    from: "agencies",
                    localField: "contractData.agencyId",
                    foreignField: "agencyID",
                    as: "agencyData"
                }
            },
            {
                $unwind: {
                    path : "$projectData"
                }
            },
            {
                "$project":{
                    contractId: 1,
                    amendmentId: 1,
                    projectId:"$projectData.projectId",
                    contractData: "$contractData",
                    totalAmountEquivalence: "$contractData.totalAmountEquivalence",
                    baseAmountEquivalence: "$contractData.baseAmountEquivalence",
                    
                }
            },


            { "$facet": {
                "contractsAmendments": [{"$group" : {_id:"$contractId",
                    "contracts" :  { $push: "$contractData.contractId" },
                }},],
                "numberAmendments": [{"$group" : {_id:"$amendmentId",
                    "contracts" :  { $push: "$contractData.contractId" },
                }},],
                "contract": [{"$group" : {_id:"$contractId",
                    "totalAmount" :  { $push: "$totalAmountEquivalence" },
                    "baseAmount" :  { $push: "$baseAmountEquivalence" },
                    "contractIds" :  { $push: "$contractId" },
                }},],
              }},         
        ])
        .then( async data  => {
            return data
            
            
            
        }).catch(next)
    }
    async mergeArrays(data): Promise<Array<number>>{
        return [].concat.apply([], data)
    }
    async mergeArraysAndUniqueElements(data): Promise<Array<number>>{
        data = data.map(element => element ===[] ? []: 1)
        return [].concat.apply([], data)
    }
    async mergeArraysAndSum(data): Promise<number> {
        return [].concat.apply([], data).reduce( (sum, current) => <number>sum + Number(current), 0 )
    }
    async convertStringArraysMergeAndSum(data): Promise<number> {
        return [].concat.apply([], data).map(element => String(element).split(",").join("")).reduce( (sum, current) => <number>sum + Number(current), 0 )
    }
}
export const dashboads = new Dashboads();
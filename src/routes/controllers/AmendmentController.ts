import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "restify-errors";
import { ConvertJsonToTable } from "../../common/ConvertJsonToTable";
import { dashboads } from "../../core/dashboard";
import { filters } from "../../core/filter";
import { graphics } from "../../core/graph";
import { Amendment } from "../../data/models/Amendment";

class AmendmentController {
  async getProcurementCategoryGraph(req,res,next){
    const activityFields = ["activityId","reviewType","referenceNo", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = amendmentController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = amendmentController.extractFilteredQuery(req.query, activityFields, true)
    return await graphics.getActivityGraphByField(activityQuery,anotherQuerys,'procurementCategory',next)
    .then(data =>{
      if(data[0]){
        var response = {}
        response['totalCount'] = data[0]['totalCount']
        response['totalMonetaryValue'] = data[0]['totalMonetaryValue']
        response["data"] = data[0]["data"].map(item =>{
          item['percentage'] = Number(item['count'])/Number(data[0]['totalCount'][0]['count'])*100
          return item
        })
        return res.json([response])
      }
    }).catch(next)
  }
  async getMarketApproachGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = amendmentController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = amendmentController.extractFilteredQuery(req.query, activityFields, true)
    return res.json(await graphics.getActivityGraphByField(activityQuery,anotherQuerys,'marketApproach',next))
  }
  async getDashBoard(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    var contractQuery = amendmentController.extractFilteredQuery(req.query,contractFields)
    var anotherQuerys = amendmentController.extractFilteredQuery(req.query, contractFields, true)
    return await dashboads.getDashBoardAmendment(contractQuery,anotherQuerys,'marketApproach',next).then(data => res.json(data)).catch(next)
  }
  async getAmendedContractTypeGraph(req,res,next){
    const amendmentFields = ["amendmentNumber","contractId","contractDurationNoObjection","changeTimePerformance","timeUnit","durationRevised","timeUnitDuration","changeContractAmountCCA","currentContractAmountCCA","currentContractCurrencyCCA","contractAmendmentAmountCCA","contractAmendmentCurrencyCCA","contractAmendmentExchangeRateCCA","contractAmendmentAmountDollarCCA","currentContractAmountPlusContractAmendmentAmountCCA","currencyContractPlusContractAmendmentCCA","changePriceAdjustmentsCPA","currentContractAmountCPA","currentContractCurrencyCPA","contractAmendmentAmountCPA","contractAmendmentCurrencyCPA","contractAmendmentExchangeRateCPA","contractAmendmentAmountDollarCPA","currentContractAmountPlusContractAmendmentAmountCPA","currencyContractPlusContractAmendmentCPA","changeTermsConditions","substitutionStaff","other","modificationScopeServices","variationOrder"]
    var activityQuery = amendmentController.extractFilteredQuery(req.query,amendmentFields)
    var anotherQuerys = amendmentController.extractFilteredQuery(req.query, amendmentFields, true)
    return await graphics.getAmendedContractsGraphByFields(activityQuery,anotherQuerys,'changeTimePerformance',next)
    .then(data =>{
      // res.json(data)
      if(data[0]){
        if(data[0]["data"][0]){
          var response = {}
          response['totalCount'] =  [
            {
              "count": data[0]['data'].length
            }
          ]
          
          var total = {
          }
          data[0]['data'].forEach(contract => {
            Object.keys(contract).forEach(item =>{
                total[item]= 0
              })
          });
          data[0]['data'].forEach(contract => {
            Object.keys(contract).forEach(item =>{
                total[item]= total[item] + (contract[item]> 0 ? 1:0)
              })
          });
          response["data"] = []
          Object.keys(total).forEach(item =>{
            response["data"].push({_id:item, count: total[item], percentage: (total[item]/data[0]['data'].length)*100})  
          })
          response["data"] = response["data"].filter(data => data["_id"] !== "_id")
          
          return res.json([response])
        }else{
          return res.json(data)
        }
      }
      // res.json(data)
    }).catch(next)
  }
  async getAmendedContractByCategoruGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    var contractQuery = amendmentController.extractFilteredQuery(req.query,contractFields)
    var anotherQuerys = amendmentController.extractFilteredQuery(req.query, contractFields, true)
    return await graphics.getAmmendedContractsGraphByCategory(contractQuery,anotherQuerys,'changeTimePerformance',next)
    .then(data =>{
      if(data[0]){
        if(data[0]["data"][0]){
          var response = {}
          response["data"] = data[0]["data"].map(item =>{
            // var packet = {_id: item._id}
            var packet = {}
            var total = item.sizeContracts.length
            packet['percentage'] = total >0 ? (Number(item.sizeContractsAmendmended)/total)*100: 0
            packet["count"] = item.sizeContractsAmendmended
            packet["total"] = total
            packet["procurementCategory"] = item.category
            // console.log(packet)
            return packet
          }).filter(data => data["_id"] !== "_id")
          
          return res.json([response])
        }else{
          console.log("Ola")
          return res.json(data)
        }}
      // res.json(data)
    }).catch(next)
  }
  async getAmendmentTypeGraph(req,res,next){
    const amendmentFields = ["amendmentNumber","contractId","contractDurationNoObjection","changeTimePerformance","timeUnit","durationRevised","timeUnitDuration","changeContractAmountCCA","currentContractAmountCCA","currentContractCurrencyCCA","contractAmendmentAmountCCA","contractAmendmentCurrencyCCA","contractAmendmentExchangeRateCCA","contractAmendmentAmountDollarCCA","currentContractAmountPlusContractAmendmentAmountCCA","currencyContractPlusContractAmendmentCCA","changePriceAdjustmentsCPA","currentContractAmountCPA","currentContractCurrencyCPA","contractAmendmentAmountCPA","contractAmendmentCurrencyCPA","contractAmendmentExchangeRateCPA","contractAmendmentAmountDollarCPA","currentContractAmountPlusContractAmendmentAmountCPA","currencyContractPlusContractAmendmentCPA","changeTermsConditions","substitutionStaff","other","modificationScopeServices","variationOrder"]
    var activityQuery = amendmentController.extractFilteredQuery(req.query,amendmentFields)
    var anotherQuerys = amendmentController.extractFilteredQuery(req.query, amendmentFields, true)
    return await graphics.getAmendmentGraphByFields(activityQuery,anotherQuerys,'changeTimePerformance',next)
    .then(data =>{
      if(data[0]){
        if(data[0]["data"][0]){
          var response = {}
          response['totalCount'] = data[0]['totalCount']
          response['totalMonetaryValue'] = data[0]['totalMonetaryValue']
          var total = 0
          Object.keys(data[0]["data"][0]).forEach(item =>{
            total = total +  Number(data[0]["data"][0][item])
          })
          data[0]["totalCount"][0].count = total
          
          response["data"] = Object.keys(data[0]["data"][0]).map(item =>{
            var packet = {_id: item}
            packet['percentage'] = total >0 ? (Number(data[0]["data"][0][item])/total)*100: 0
            packet["count"] = data[0]["data"][0][item]
            // console.log(packet)
            return packet
          }).filter(data => data["_id"] !== "_id")
          
          return res.json([response])
        }else{
          return res.json(data)
        }
      }
    }).catch(next)
  }
  
  async getReviewTypeGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = amendmentController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = amendmentController.extractFilteredQuery(req.query, activityFields, true)
    return graphics.getActivityGraphByField(activityQuery,anotherQuerys,'reviewType',next)
    .then(data =>{
      if(data[0]){
        var response = {}
        response['totalCount'] = data[0]['totalCount']
        response['totalMonetaryValue'] = data[0]['totalMonetaryValue']
        response["data"] = data[0]["data"].map(item =>{
          item['percentage'] = Number(item['count'])/Number(data[0]['totalCount'][0]['count'])*100
          return item
        })
        return res.json([response])
      }
    }).catch(next)
  }
  async getFilters(req, res, next) {
    return res.json({
      regionName: await filters.getRegions(), 
      countryName: await filters.getCountries(), 
      projectId:  await filters.getProjectsIds(), 
      sectors: await filters.getSectors(), 
      agencyId: await filters.getAgencies(), 
      procurementCategory: await filters.getProcurementCategory(),
      procurementMethod: await filters.getProcurementMethod(),
      reviewType: await filters.getReviewType(),
      // contractId: await filters.getContractIds(),
      marketApproach: await filters.getMarketApproach(),
      procurementProcess: await filters.getProcurementProcess(),
      plannedYear: ["Em breve"],
      actualYear: ["Em breve"],
    })
  }


  
  filterObj( base, names ) {
    var new_obj = {}
    for( var i = 0; i < names.length; i++ ) {
        new_obj[ names[i] ] = base[ names[i] ] || {};
    }
    return new_obj
  }
  extractFilteredQuery(originalQuery:Object,fields:Array<String>,reverseLogic=false){
    return amendmentController.filterObj(originalQuery,Object.keys(originalQuery).filter(item => reverseLogic ? !fields.includes(item):fields.includes(item)))
  }
  async formatAmendmentQueryParams(query:Object):Promise<Object>{
    const numberFields = ["amendmentNumber","contractId","amendmentId","contractDurationNoObjection","durationRevised","currentContractAmountCCA","contractAmendmentAmountCCA","contractAmendmentAmountDollarCCA","currentContractAmountPlusContractAmendmentAmountCCA","currentContractAmountCPA","contractAmendmentAmountCPA","contractAmendmentAmountDollarCPA","currentContractAmountPlusContractAmendmentAmountCPA"]
    const booleanFields = ["changeTimePerformance","changeContractAmountCCA","changePriceAdjustmentsCPA","changeTermsConditions","substitutionStaff","other","modificationScopeServices","variationOrder"]
    var promises = Object.keys(query).map(key =>{
        if (numberFields.includes(key)){
            query[key] = Number(query[key])
        }else if(booleanFields.includes(key)){
            query[key] = Boolean(query[key])
        }
    })
    
    return Promise.all(promises).then(formated => {
        return query
    })
}
  async indexAmendments(req, res, next) {
    const amendmentFields = ["amendmentNumber","contractId","contractDurationNoObjection","changeTimePerformance","timeUnit","durationRevised","timeUnitDuration","changeContractAmountCCA","currentContractAmountCCA","currentContractCurrencyCCA","contractAmendmentAmountCCA","contractAmendmentCurrencyCCA","contractAmendmentExchangeRateCCA","contractAmendmentAmountDollarCCA","currentContractAmountPlusContractAmendmentAmountCCA","currencyContractPlusContractAmendmentCCA","changePriceAdjustmentsCPA","currentContractAmountCPA","currentContractCurrencyCPA","contractAmendmentAmountCPA","contractAmendmentCurrencyCPA","contractAmendmentExchangeRateCPA","contractAmendmentAmountDollarCPA","currentContractAmountPlusContractAmendmentAmountCPA","currencyContractPlusContractAmendmentCPA","changeTermsConditions","substitutionStaff","other","modificationScopeServices","variationOrder"]
    const contractFields = ["activityId","agencyId","referenceNo", "contractId", "status", "projectId", "duration"]
    const activityFields = ["reviewType","procurementCategory","referenceNo","activityId", "procurementMethod","procurementProcess","marketApproach"]
    const projectFields = ['projectName','sectors','regionName','countryName']


    var  amendmentQuery = await amendmentController.formatAmendmentQueryParams(amendmentController.extractFilteredQuery(req.query,amendmentFields))
    var anotherQuerys = await amendmentController.extractFilteredQuery(req.query, contractFields, true)
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
          $match: { $and: anotherQuerys ? [anotherQuerys]:[{}]  } 
      }, 
      {
        "$project": {
          //////// Contract
          "activityId": 0,
          "agencyId": 0,
           ////////////// Activity
            "procurementMethod": 0, 
           "procurementProcess": 0,
           "marketApproach": 0,
          ///////////////// Project
          'regionName': 0, 
        }
      },  

      
  ]).then(response => res.json(response)).catch(next)
  }
  async downloadAmendments(req, res, next) {
    const format = req.query.format && (req.query.format === 'csv' || req.query.format === 'xlsx') ? req.query.format : 'xlsx'
    delete req.query.format
    const amendmentFields = ["amendmentNumber","contractId","contractDurationNoObjection","changeTimePerformance","timeUnit","durationRevised","timeUnitDuration","changeContractAmountCCA","currentContractAmountCCA","currentContractCurrencyCCA","contractAmendmentAmountCCA","contractAmendmentCurrencyCCA","contractAmendmentExchangeRateCCA","contractAmendmentAmountDollarCCA","currentContractAmountPlusContractAmendmentAmountCCA","currencyContractPlusContractAmendmentCCA","changePriceAdjustmentsCPA","currentContractAmountCPA","currentContractCurrencyCPA","contractAmendmentAmountCPA","contractAmendmentCurrencyCPA","contractAmendmentExchangeRateCPA","contractAmendmentAmountDollarCPA","currentContractAmountPlusContractAmendmentAmountCPA","currencyContractPlusContractAmendmentCPA","changeTermsConditions","substitutionStaff","other","modificationScopeServices","variationOrder"]
    const contractFields = ["activityId","agencyId","referenceNo", "contractId", "status", "projectId", "duration"]
    const activityFields = ["reviewType","procurementCategory","referenceNo","activityId", "procurementMethod","procurementProcess","marketApproach"]
    const projectFields = ['projectName','sectors','regionName','countryName']


    var  amendmentQuery = await amendmentController.formatAmendmentQueryParams(amendmentController.extractFilteredQuery(req.query,amendmentFields))
    var anotherQuerys = await amendmentController.extractFilteredQuery(req.query, contractFields, true)
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
          $match: { $and: anotherQuerys ? [anotherQuerys]:[{}]  } 
      }, 
      {
        "$project": {
          //////// Contract
          "activityId": 0,
          "agencyId": 0,
           ////////////// Activity
            "procurementMethod": 0, 
           "procurementProcess": 0,
           "marketApproach": 0,
          ///////////////// Project
          'regionName': 0, 
        }
      },  

      
  ]).then(async response=> {
    response = response.map(amendment =>{
      delete amendment._id
      return amendment
    })
    const table = await new ConvertJsonToTable().convertToTable(response,format)
    switch (format) {
      case 'csv':
        res.writeHead(200, {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=amendments.csv'
        });
        break;
      case 'xlsx':
        res.setHeader('Content-disposition', 'attachment; filename=amendments.xlsx');
        res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      default:
        break;
    }
  res.end(table);
  }).catch(next)
  }

  
}
export const amendmentController = new AmendmentController();

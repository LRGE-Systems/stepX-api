import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "restify-errors";
import { ConvertJsonToTable } from "../../common/ConvertJsonToTable";
import { dashboads } from "../../core/dashboard";
import { filters } from "../../core/filter";
import { graphics } from "../../core/graph";
import { Contract } from "../../data/models/Contract";
import { Project } from "../../data/models/Project";


class ContractController {
  async getDashBoard(req,res,next){
    const activityFields = ["activityId","reviewType","referenceNo", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    var contractQuery = contractController.extractFilteredQuery(req.query,contractFields)
    var anotherQuerys = contractController.extractFilteredQuery(req.query, contractFields, true)
    return await dashboads.getDashBoardContract(contractQuery,anotherQuerys,'marketApproach',next).then(data => res.json(data)).catch(next)
  }
  async getProcurementCategoryGraph(req,res,next){
    const activityFields = ["activityId","reviewType","referenceNo", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    var contractQuery = contractController.extractFilteredQuery(req.query,contractFields)
    var anotherQuerys = contractController.extractFilteredQuery(req.query, contractFields, true)
    return res.json(await graphics.getContractGraphByField(contractQuery,anotherQuerys,'procurementCategory',next))
  }
  async getProcurementMethodGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    var contractQuery = contractController.extractFilteredQuery(req.query,contractFields)
    var anotherQuerys = contractController.extractFilteredQuery(req.query, contractFields, true)
    return res.json(await graphics.getContractGraphByField(contractQuery,anotherQuerys,'procurementMethod',next))
  }
  async getMarketApproachGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    var contractQuery = contractController.extractFilteredQuery(req.query,contractFields)
    var anotherQuerys = contractController.extractFilteredQuery(req.query, contractFields, true)
    return res.json(await graphics.getContractGraphByField(contractQuery,anotherQuerys,'marketApproach',next))
  }
  async getReviewTypeGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    var contractQuery = contractController.extractFilteredQuery(req.query,contractFields)
    var anotherQuerys = contractController.extractFilteredQuery(req.query, contractFields, true)
    return graphics.getContractGraphByField(contractQuery,anotherQuerys,'reviewType',next)
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
    })
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
    return contractController.filterObj(originalQuery,Object.keys(originalQuery).filter(item => reverseLogic ? !fields.includes(item):fields.includes(item)))
  }
  async formatContractQueryParams(query:Object):Promise<Object>{
    const numberFields = ['activityId','agencyId','contractId','baseAmount',"baseAmountEquivalence","baseExchangeRate","totalAmount"]
    const booleanFields = ['']
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
  async indexContracts(req, res, next) {
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    const activityFields = ["reviewType","referenceNo","activityId", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","marketApproach"]
    const projectFields = ['projectName','sectors','regionName','countryName']
    const agencyFields = ['name']
    const activityStepFields = ['revisedDate','originalDate','actualDate','stepActivityId']


    var contractQuery = await contractController.formatContractQueryParams(contractController.extractFilteredQuery(req.query,contractFields))
    var anotherQuerys = await contractController.extractFilteredQuery(req.query, contractFields, true)
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
              from: "projects",
              localField: "projectId",
              foreignField: "projectId",
              as: "projectData"
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
              path : "$activityData"
          }
      },
      {
          $unwind: {
              path : "$projectData"
          }
      },
      {
        "$project": {
          "_id": 1,
          "activityId":1,
          "contractReferenceNo":"referenceNo",
           "contractId":1,
           "status":1,
           "duration":1,
           "totalAmount":1,
           "totalCurrency":1,
           "totalAmountEquivalence":1,
           "baseAmount":1,
           "baseCurrency":1,
           "baseExchangeRate":1,
          "description":1,
          "projectId":1,
          "agencyId":"agencyId",
          "agencyName":{ $arrayElemAt: [ "$agencyData.name", 0 ] },
          "reviewType":"$activityData.reviewType",
          "referenceNo":"$activityData.referenceNo",
           "estimatedAmount":"$activityData.estimatedAmount",
          "procurementCategory":"$activityData.procurementCategory",
          "procurementMethod":"$activityData.procurementMethod",
          "procurementProcess":"$activityData.procurementProcess",
          "marketApproach":"$activityData.marketApproach",
          'projectName':'$projectData.projectName',
          'sectors':'$projectData.sectors',
          'regionName':'$projectData.regionName',
          'countryName':'$projectData.countryName'
        }
      },
      {
          $match: { $and: anotherQuerys ? [anotherQuerys]:[{}]  } 
      },    
      
  ]).then(response => res.json(response)).catch(next)
  }
  async downloadContracts(req, res, next) {
    const format = req.query.format && (req.query.format === 'csv' || req.query.format === 'xlsx') ? req.query.format : 'xlsx'
    delete req.query.format
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    const activityFields = ["reviewType","referenceNo","activityId", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","marketApproach"]
    const projectFields = ['projectName','sectors','regionName','countryName']
    const agencyFields = ['name']
    const activityStepFields = ['revisedDate','originalDate','actualDate','stepActivityId']


    var contractQuery = await contractController.formatContractQueryParams(contractController.extractFilteredQuery(req.query,contractFields))
    var anotherQuerys = await contractController.extractFilteredQuery(req.query, contractFields, true)
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
              from: "projects",
              localField: "projectId",
              foreignField: "projectId",
              as: "projectData"
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
              path : "$activityData"
          }
      },
      {
          $unwind: {
              path : "$projectData"
          }
      },
      {
        "$project": {
          "_id": 1,
          "activityId":1,
          "contractReferenceNo":"referenceNo",
           "contractId":1,
           "status":1,
           "duration":1,
           "totalAmount":1,
           "totalCurrency":1,
           "totalAmountEquivalence":1,
           "baseAmount":1,
           "baseCurrency":1,
           "baseExchangeRate":1,
          "description":1,
          "projectId":1,
          "agencyId":"agencyId",
          "agencyName":{ $arrayElemAt: [ "$agencyData.name", 0 ] },
          "reviewType":"$activityData.reviewType",
          "referenceNo":"$activityData.referenceNo",
           "estimatedAmount":"$activityData.estimatedAmount",
          "procurementCategory":"$activityData.procurementCategory",
          "procurementMethod":"$activityData.procurementMethod",
          "procurementProcess":"$activityData.procurementProcess",
          "marketApproach":"$activityData.marketApproach",
          'projectName':'$projectData.projectName',
          'sectors':'$projectData.sectors',
          'regionName':'$projectData.regionName',
          'countryName':'$projectData.countryName'
        }
      },
      {
          $match: { $and: anotherQuerys ? [anotherQuerys]:[{}]  } 
      },    
      
  ]).then(async response=> {
    response = response.map(contract =>{
      delete contract._id
      return contract
    })
    const table = await new ConvertJsonToTable().convertToTable(response,format)
    switch (format) {
      case 'csv':
        res.writeHead(200, {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=contract.csv'
        });
        break;
      case 'xlsx':
        res.setHeader('Content-disposition', 'attachment; filename=contract.xlsx');
        res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      default:
        break;
    }
  res.end(table);
  }).catch(next)
  }

  
}
export const contractController = new ContractController();

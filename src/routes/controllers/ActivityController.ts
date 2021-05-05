import { Parser } from "json2csv";
import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "restify-errors";
import { ConvertJsonToTable } from "../../common/ConvertJsonToTable";
import { dashboads } from "../../core/dashboard";
import { filters } from "../../core/filter";
import { graphics } from "../../core/graph";
import { Activity } from "../../data/models/Activity";
import { ActivityStep } from "../../data/models/ActivitySteps";
import { Loan } from "../../data/models/Loan";
import { Project } from "../../data/models/Project";


class ActivityController {
  async getDashBoard(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = activityController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = activityController.extractFilteredQuery(req.query, activityFields, true)
    return await dashboads.getDashBoardActivity(activityQuery,anotherQuerys,'marketApproach',next).then(data => res.json(data)).catch(next)
  }
  async getProcurementCategoryGraph(req,res,next){
    const activityFields = ["activityId","reviewType","referenceNo", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = activityController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = activityController.extractFilteredQuery(req.query, activityFields, true)
    return res.json(await graphics.getActivityGraphByField(activityQuery,anotherQuerys,'procurementCategory',next))
  }
  async getProcurementMethodGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = activityController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = activityController.extractFilteredQuery(req.query, activityFields, true)
    return res.json(await graphics.getActivityGraphByField(activityQuery,anotherQuerys,'procurementMethod',next))
  }
  async getMarketApproachGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = activityController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = activityController.extractFilteredQuery(req.query, activityFields, true)
    return res.json(await graphics.getActivityGraphByField(activityQuery,anotherQuerys,'marketApproach',next))
  }
  async getReviewTypeGraph(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = activityController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = activityController.extractFilteredQuery(req.query, activityFields, true)
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
    return activityController.filterObj(originalQuery,Object.keys(originalQuery).filter(item => reverseLogic ? !fields.includes(item):fields.includes(item)))
  }
  async formatActivityQueryParams(query:Object):Promise<Object>{
    const numberFields = ['activityId','agencyId','bankFinanced','estimatedAmount']
    const booleanFields = ['retroactiveFinancing']
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
  async indexActivities(req, res, next) {
  

    const activityFields = ["reviewType","activityId","referenceNo", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const projectFields = ['projectName','approvalDate','closingDate','sectors','regionName','countryName']
    const loanFields = ['effectivenessDate','contractAmountPaid']
    const activityStepFields = ['revisedDate','originalDate','actualDate','stepActivityId']
    var queryActivity =  await activityController.formatActivityQueryParams(activityController.extractFilteredQuery(req.query,activityFields))//activityController.filterObj(req.query,Object.keys(req.query).filter(item => activityFields.includes(item)))
    var anotherQuerys = await activityController.extractFilteredQuery(req.query, activityFields, true)

    return Activity.aggregate([
      { $match: { ...queryActivity } },
   
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
              from: "activity_steps",
              localField: "activityId",
              foreignField: "activityId",
              as: "stepData"
          }
      },
      {
          $unwind: {
              path : "$projectData"
          }
      },
      {
        "$project": {
          "reviewType":1,
          "activityId":1,
          "referenceNo":1,
           "estimatedAmount":1,
          "procurementCategory":1,
          "procurementMethod":1,
          "procurementProcess":1,
          "retroactiveFinancing":1,
          "marketApproach":1,
          "bankFinanced":1,
          "contractType":1,
          "description":1,
          "agencyId":1,
          "projectId":1,
          "stepData":{ $arrayElemAt: [ "$stepData", 0 ] },
          'projectName': "$projectData.projectName",
          'approvalDate': "$projectData.approvalDate",
          'closingDate': "$projectData.closingDate",
          'activitySectors': "$projectData.sectors",
          'regionName': "$projectData.regionName",
          'countryName': "$projectData.countryName",
          "loans": "$loanData",
        }
      },
      {
          $match: { $and: anotherQuerys ? [anotherQuerys]:[{}]  } 
      },    
      
  ])
    .then(async activities => {
      if( activities[0]){
        var promises = await activities.map( async activity =>{ 
          
          var lastDate = activity.loans.reduce((a, b) => {
            return new Date((<any>a).effectivenessDate) > new Date((<any>b).effectivenessDate) ? a : b;
          },0)
          activity.effectivenessDate = (<any>lastDate).effectivenessDate
          activity.contractAmountPaid  =  (<any>lastDate).contractAmountPaid
          activity.actualYear= (<any>activity.stepData) && (<any>activity.stepData).actualDate ? String(new Date((<any>activity.stepData).actualDate).getFullYear()): "Date not defined"
          activity.plannedYear = (<any>activity.stepData) && (<any>activity.stepData).revisedDate ? String(new Date((<any>activity.stepData).revisedDate).getFullYear()) : (<any>activity.stepData) && ((<any>activity.stepData).originalDate ?  String(new Date((<any>activity.stepData).originalDate).getFullYear()): 'Date not defined' )

          delete activity.stepData
          delete activity.loans
          return activity;
        })
        return Promise.all(promises).then(async response=> {
          res.json(activities)
        }).catch(next)
      }else{
        next(new NotFoundError("There`s no activities on the database that matches with the query"))
      }
    })
  }
  async downloadActivities(req, res, next) {
  
    const format = req.query.format && (req.query.format === 'csv' || req.query.format === 'xlsx') ? req.query.format : 'xlsx'
    delete req.query.format
    const activityFields = ["reviewType","activityId","referenceNo", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    const projectFields = ['projectName','approvalDate','closingDate','sectors','regionName','countryName']
    const loanFields = ['effectivenessDate','contractAmountPaid']
    const activityStepFields = ['revisedDate','originalDate','actualDate','stepActivityId']
    var queryActivity =  await activityController.formatActivityQueryParams(activityController.extractFilteredQuery(req.query,activityFields))//activityController.filterObj(req.query,Object.keys(req.query).filter(item => activityFields.includes(item)))
    var anotherQuerys = await activityController.extractFilteredQuery(req.query, activityFields, true)

    return Activity.aggregate([
      { $match: { ...queryActivity } },
   
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
              from: "activity_steps",
              localField: "activityId",
              foreignField: "activityId",
              as: "stepData"
          }
      },
      {
          $unwind: {
              path : "$projectData"
          }
      },
      {
        "$project": {
          "reviewType":1,
          "activityId":1,
          "referenceNo":1,
           "estimatedAmount":1,
          "procurementCategory":1,
          "procurementMethod":1,
          "procurementProcess":1,
          "retroactiveFinancing":1,
          "marketApproach":1,
          "bankFinanced":1,
          "contractType":1,
          "description":1,
          "agencyId":1,
          "projectId":1,
          "stepData":{ $arrayElemAt: [ "$stepData", 0 ] },
          'projectName': "$projectData.projectName",
          'approvalDate': "$projectData.approvalDate",
          'closingDate': "$projectData.closingDate",
          'activitySectors': "$projectData.sectors",
          'regionName': "$projectData.regionName",
          'countryName': "$projectData.countryName",
          "loans": "$loanData",
        }
      },
      {
          $match: { $and: anotherQuerys ? [anotherQuerys]:[{}]  } 
      },    
      
  ])
    .then(async activities => {
      if( activities[0]){
        var promises = await activities.map( async activity =>{ 
          
          var lastDate = activity.loans.reduce((a, b) => {
            return new Date((<any>a).effectivenessDate) > new Date((<any>b).effectivenessDate) ? a : b;
          },0)
          activity.effectivenessDate = (<any>lastDate).effectivenessDate
          activity.contractAmountPaid  =  (<any>lastDate).contractAmountPaid
          activity.actualYear= (<any>activity.stepData) && (<any>activity.stepData).actualDate ? String(new Date((<any>activity.stepData).actualDate).getFullYear()): "Date not defined"
          activity.plannedYear = (<any>activity.stepData) && (<any>activity.stepData).revisedDate ? String(new Date((<any>activity.stepData).revisedDate).getFullYear()) : (<any>activity.stepData) && ((<any>activity.stepData).originalDate ?  String(new Date((<any>activity.stepData).originalDate).getFullYear()): 'Date not defined' )

          delete activity.stepData
          delete activity.loans
          delete activity._id
          return activity;
        })
        return Promise.all(promises).then(async response=> {
          const fields = ["reviewType",
            "activityId",
            "referenceNo",
            "estimatedAmount",
            "procurementCategory",
            "procurementMethod",
            "procurementProcess",
            "retroactiveFinancing",
            "marketApproach",
            "bankFinanced",
            "contractType",
            "description",
            "agencyId",
            "projectId",
            'projectName',
            'approvalDate',
            'closingDate',
            'activitySectors',
            'regionName',
            'countryName',
            "actualYear",
            "plannedYear"
          ];
          const table = await new ConvertJsonToTable().convertToTable(activities, format)
          switch (format) {
            case 'csv':
              res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=activities.csv'
              });
              break;
            case 'xlsx':
              console.log('ói')
              res.setHeader('Content-disposition', 'attachment; filename=activities.xlsx');
              res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            default:
              break;
          }
        res.end(table);
        }).catch(next)
      }else{
        next(new NotFoundError("There`s no activities on the database that matches with the query"))
      }
    })
  }
  

  
}
export const activityController = new ActivityController();

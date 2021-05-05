import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "restify-errors";
import { ConvertJsonToTable } from "../../common/ConvertJsonToTable";
import { dashboads } from "../../core/dashboard";
import { filters } from "../../core/filter";
import { graphics } from "../../core/graph";
import { ActivityStep } from "../../data/models/ActivitySteps";
import { Loan } from "../../data/models/Loan";
import { Project } from "../../data/models/Project";
import { contractController } from "./ContractController";


class RoadmapController {
  async getDashBoard(req,res,next){
    const activityFields = ["activityId","referenceNo","reviewType", "estimatedAmount","procurementCategory","procurementMethod","procurementProcess","retroactiveFinancing","marketApproach","bankFinanced","contractType","description","agencyId","projectId"]
    var activityQuery = roadmapController.extractFilteredQuery(req.query,activityFields)
    var anotherQuerys = roadmapController.extractFilteredQuery(req.query, activityFields, true)
    return await dashboads.getDashBoardActivity(activityQuery,anotherQuerys,'marketApproach',next).then(data => res.json(data)).catch(next)
  }
  async getFilters(req, res, next) {
    return res.json({
      regionName: await filters.getRegions(), 
      // activityId: await filters.getActivities(), 
      countryName: await filters.getCountries(), 
      projectId:  await filters.getProjectsIds(), 
      // sectors: await filters.getSectors(), 
      agencyId: await filters.getAgencies(), 
      procurementCategory: await filters.getProcurementCategory(),
      procurementMethod: await filters.getProcurementMethod(),
      reviewType: await filters.getReviewType(),
      marketApproach: await filters.getMarketApproach(),
      procurementProcess: await filters.getProcurementProcess(),
      // plannedYear: ["Em breve"],
      contractId: await filters.getContractIds(),
      actualYear: ["Em breve"],
    })
  }
  async getRoadmapGraph(req,res,next){
    const activityStepFields = ['revisedDate','revisedDays','originalDate','originalDateDays','actualDate','activityId','stepName','runningDate','runningDays','inProgress']
    var activityStepQuery = roadmapController.extractFilteredQuery(req.query,activityStepFields)
    var anotherQuerys = roadmapController.extractFilteredQuery(req.query, activityStepFields, true)
    return res.json(await graphics.getRoadmapGraph(activityStepQuery,anotherQuerys,'procurementCategory',next))
  }
  async getRoadmapConsultantServicesGraph(req,res,next){
    const activityStepFields = ['revisedDate','revisedDays','originalDate','originalDateDays','actualDate','activityId','stepName','runningDate','runningDays','inProgress']
    var activityStepQuery = roadmapController.extractFilteredQuery(req.query,activityStepFields)
    var anotherQuerys = roadmapController.extractFilteredQuery(req.query, activityStepFields, true)
    return res.json(await graphics.getRoadmapConsultantServicesGraph(activityStepQuery,anotherQuerys,'procurementCategory',next))
  }
  async getActivityDurationByCategoryGraph(req,res,next){
    const activityStepFields = ['revisedDate','revisedDays','originalDate','originalDateDays','actualDate','activityId','stepName','runningDate','runningDays','inProgress']
    var activityStepQuery = roadmapController.extractFilteredQuery(req.query,activityStepFields)
    var anotherQuerys = roadmapController.extractFilteredQuery(req.query, activityStepFields, true)
    return res.json(await graphics.getActivityDurationByCategoryGraph(activityStepQuery,anotherQuerys,'procurementCategory',next))
  }
  async getFinancialPhysicalGraph(req,res,next){
    const contractFields = ["activityId","referenceNo", "contractId", "status", "duration", "totalAmount", "totalCurrency", "totalAmountEquivalence", "baseAmount", "baseCurrency", "baseExchangeRate","description","status","projectId","agencyId"]
    var contractQuery = contractController.extractFilteredQuery(req.query,contractFields)
    var anotherQuerys = roadmapController.extractFilteredQuery(req.query, contractFields, true)
    return res.json(await graphics.getFinancialPhysicalGraph(contractQuery,anotherQuerys,'procurementCategory',next))
  }
  async getStepNames(req,res,next){
    const activityStepFields = ['revisedDate','revisedDays','originalDate','originalDateDays','actualDate','activityId','stepName','runningDate','runningDays','inProgress']
    var activityStepQuery = roadmapController.extractFilteredQuery(req.query,activityStepFields)
    return ActivityStep.aggregate(
      [  
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
                // diff: {$subtract: ["$actualDate","$originalDate"]},
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
        //   {
        //     $match: { $and: [{"stepName": "Bid Validity Extension"}]  } 
        // },
        
        { "$facet": {
            "procurementCategory": [
               
                {"$group" : {_id:{procurementMethod: "$procurementMethod"},
                // {"$group" : {_id:{stepName: "$stepName",procurementCategory:"$activityData.procurementCategory"},
                    // "revisedDays" : { $push: "$revisedDays" },
                    // "originalDateDays" : { $push: "$originalDateDays" },
                    // "stepActivityId": {$push:"$stepActivityId"},
                    // "actualDate" : { $push: "$actualDate" },
                    // "originalDate" : { $push: "$originalDate" },
                    // "revisedDate" : { $push: "$revisedDate" },
                    "stepName": {$push:"$stepName"},
                    // "activityId": {$push:"$activityId"},
                    
                          
                },}, 
            ],
            
          }},

         
        
    ]
    ).then(data =>{
      data = (<any>data[0]).procurementCategory.map(element=>{
        element.stepName = element.stepName.filter(function(item, pos) {
          return element.stepName.indexOf(item) == pos;
      })
        return element
      })
      return res.json(data)
    })
  }
  async getRoadmapGraphByProcurementMethod(req,res,next){
    const activityStepFields = ['revisedDate','revisedDays','originalDate','originalDateDays','actualDate','activityId','stepName','runningDate','runningDays','inProgress']
    var activityStepQuery = roadmapController.extractFilteredQuery(req.query,activityStepFields)
    var anotherQuerys = roadmapController.extractFilteredQuery(req.query, activityStepFields, true)
    return res.json(await graphics.getRoadmapGraphByProcurementMethod(activityStepQuery,anotherQuerys,'procurementCategory',next))
  }

  async filterPacket(packet,anotherQuerys){
    var test =  packet.filter(activity =>{
      return (Object.keys(anotherQuerys).map( key => {
        return activity[key] === anotherQuerys[key]
      }).includes(false) ? false:true) === true
    })
    return test
  }
  
  filterObj( base, names ) {
    var new_obj = {}
    for( var i = 0; i < names.length; i++ ) {
        new_obj[ names[i] ] = base[ names[i] ] || {};
    }
    return new_obj
  }
  extractFilteredQuery(originalQuery:Object,fields:Array<String>,reverseLogic=false){
    return roadmapController.filterObj(originalQuery,Object.keys(originalQuery).filter(item => reverseLogic ? !fields.includes(item):fields.includes(item)))
  }
  async formatRoadmapQueryParams(query:Object):Promise<Object>{
    const numberFields = ['activityId','stepActivityId',"originalDateDays"]
    const booleanFields = ['inProgress']
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
  async formatQueryParams(query:Object):Promise<Object>{
    const numberFields = ['activityId','originalDateDays','revisedDays','runningDays']
    const booleanFields = ['inProgress']
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
  async indexSteps(req, res, next) {
    const activityStepFields = ['revisedDate','revisedDays','originalDate','originalDateDays','actualDate','activityId','stepName','runningDate','runningDays','inProgress']
    const activityFields = ["activityId","projectId"]
    var queryActivity =  roadmapController.extractFilteredQuery(req.query,activityFields)
    var querySteps =  await roadmapController.formatQueryParams(roadmapController.extractFilteredQuery(req.query,activityStepFields))

    return ActivityStep.aggregate([
      { $match: { ...querySteps } },
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
      // { "$limit": (page.page - 1)+50 },
      // { "$skip": (page.page - 1) },    
     
      { $project: { 
              "revisedDate": 1 ,
              'revisedDays': 1,
              'originalDate':1,
              'originalDateDays':1,
              'actualDate':1,
              'activityId':1,
              'stepName':1,
              'runningDate':1,
              'runningDays':1,
              'inProgress':1,
              'activityDescription': "$activityData.description",
              'projectId': "$activityData.projectId"

            } 
      }    
  ])
    .then(async activitiesSteps => {
      if( activitiesSteps[0]){
        return res.json(activitiesSteps)
      }else{
        next(new NotFoundError("There`s no activities on the database that matches with the query"))
      }
    })
  }
  async downloadSteps(req, res, next) {
    const format = req.query.format && (req.query.format === 'csv' || req.query.format === 'xlsx') ? req.query.format : 'xlsx'
    delete req.query.format
    const activityStepFields = ['revisedDate','revisedDays','originalDate','originalDateDays','actualDate','activityId','stepName','runningDate','runningDays','inProgress']
    const activityFields = ["activityId","projectId"]
    var queryActivity =  roadmapController.extractFilteredQuery(req.query,activityFields)
    var querySteps =  await roadmapController.formatQueryParams(roadmapController.extractFilteredQuery(req.query,activityStepFields))

    return ActivityStep.aggregate([
      { $match: { ...querySteps } },
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
      // { "$limit": (page.page - 1)+50 },
      // { "$skip": (page.page - 1) },    
     
      { $project: { 
              "revisedDate": 1 ,
              'revisedDays': 1,
              'originalDate':1,
              'originalDateDays':1,
              'actualDate':1,
              'activityId':1,
              'stepName':1,
              'runningDate':1,
              'runningDays':1,
              'inProgress':1,
              'activityDescription': "$activityData.description",
              'projectId': "$activityData.projectId"

            } 
      }    
  ])
    .then(async activitiesSteps => {
      if( activitiesSteps[0]){
        activitiesSteps = activitiesSteps.map(amendment =>{
          delete amendment._id
          return amendment
        })
        const table = await new ConvertJsonToTable().convertToTable(activitiesSteps,format)
        switch (format) {
          case 'csv':
            res.writeHead(200, {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename=roadmaps.csv'
            });
            break;
          case 'xlsx':
            res.setHeader('Content-disposition', 'attachment; filename=roadmaps.xlsx');
            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          default:
            break;
        }
      res.end(table);
      }else{
        next(new NotFoundError("There`s no activities on the database that matches with the query"))
      }
    })
  }

  
}
export const roadmapController = new RoadmapController();

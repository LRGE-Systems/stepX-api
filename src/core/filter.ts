import * as mongoose from "mongoose";
import { BadRequestError, ConflictError, NotFoundError } from "restify-errors";
import { Activity } from "../data/models/Activity";
import { Agency } from "../data/models/Agency";
import { Contract } from "../data/models/Contract";
import { Project } from "../data/models/Project";



class Filters{
    async getRegions(){
        return Project.find({},["regionName"]).distinct('regionName')
        .then(regions => regions)
    }
    async getActivities(){
        return Activity.find({},["activityId","description"])
        .then(regions => regions)
    }
    async getCountries(){
        return Project.find({},["countryName"]).distinct('countryName')
        .then(countries => countries)
    }
    async getProjectsIds(){
        return Project.find({},["projectId"])
        .then(projects => projects)
    }
    async getContractIds(){
        return Contract.find({},["contractId"])
        .then(contracts => contracts)
    }
    async getSectors(){
        return Project.find({},["sectors"])
        .then(sectors => {
            if(sectors){
                var list = []
                sectors.forEach(sectorsList =>{
                    (<any>sectorsList).sectors.forEach(element => {
                        list.push(element.Name)
                    });
                })
                return list.filter(function(item, pos) {
                    return list.indexOf(item) == pos;
                }).sort()
            }else{
                return []
            }
        } )
    }
    async getAgencies(){
        return Agency.aggregate([
            {$match: {}}, 
            {$project: { 
                         'agencyId': '$agencyID', 
                         'name': '$name', 
                         }}])
    }
    async getProcurementCategory(){
        return Activity.find({}, ["procurementCategory"]).distinct("procurementCategory")
    }
    async getProcurementMethod(){
        return Activity.find({}, ["procurementMethod"]).distinct("procurementMethod")
    }
    async getMarketApproach(){
        return Activity.find({}, ["marketApproach"]).distinct("marketApproach")
    }
    async getProcurementProcess(){
        return Activity.find({}, ["procurementProcess"]).distinct("procurementProcess")
    }
    async getReviewType(){
        return Activity.find({}, ["reviewType"]).distinct("reviewType")
    }
    

}
export const filters = new Filters();
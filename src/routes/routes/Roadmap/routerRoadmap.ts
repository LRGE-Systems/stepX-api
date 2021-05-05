import { Router } from "../../../protocols/router";
import * as restify from "restify";
import { authorize } from "../../../security/middlewares/authorizeAcess";
import { roadmapController } from "../../controllers/RoadmapController";


export class RoadmapRouter extends Router {
  applyRoutes(application: restify.Server) {
    application.get("/roadmaps", [roadmapController.indexSteps ]);
    application.get("/roadmaps/download", [roadmapController.downloadSteps ]);
    application.get("/roadmaps/dashboard", [roadmapController.getDashBoard ]);
    application.get("/roadmaps/stepnames", [roadmapController.getStepNames ]);
    application.get("/roadmaps/graph/boxplotRoadmap", [roadmapController.getRoadmapGraph ]);
    application.get("/roadmaps/graph/boxplotRoadmapConsultantServices", [roadmapController.getRoadmapConsultantServicesGraph ]);
    application.get("/roadmaps/graph/activityDurationByCategory", [roadmapController.getActivityDurationByCategoryGraph ]);
    application.get("/roadmaps/graph/financialPhysical", [roadmapController.getFinancialPhysicalGraph ]);
    application.get("/roadmaps/graph/boxplotGroupByProcurementMethod", [roadmapController.getRoadmapGraphByProcurementMethod ]);
    application.get("/roadmaps/filterOptions", [ roadmapController.getFilters]);   
    
    
  }
}

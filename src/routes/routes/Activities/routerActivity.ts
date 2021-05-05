import { Router } from "../../../protocols/router";
import * as restify from "restify";
import { authorize } from "../../../security/middlewares/authorizeAcess";
import { activityController } from "../../controllers/ActivityController";

export class ActivityRouter extends Router {
  applyRoutes(application: restify.Server) {
    application.get("/activities", [activityController.indexActivities ]);
    application.get("/activities/filterOptions", [ activityController.getFilters]);   
    application.get("/activities/graph/procurementCategory", [activityController.getProcurementCategoryGraph]);
    application.get("/activities/graph/procurementMethod", [activityController.getProcurementMethodGraph ]);
    application.get("/activities/graph/marketApproach", [activityController.getMarketApproachGraph ]);
    application.get("/activities/graph/reviewType", [activityController.getReviewTypeGraph ]);
    application.get("/activities/dashboard", [activityController.getDashBoard ]);
    application.get("/activities/download", [activityController.downloadActivities ]);
    
  }
}

import { Router } from "../../../protocols/router";
import * as restify from "restify";
import { authorize } from "../../../security/middlewares/authorizeAcess";
import { activityController } from "../../controllers/ActivityController";
import { amendmentController } from "../../controllers/AmendmentController";

export class AmendmentRouter extends Router {
  applyRoutes(application: restify.Server) {
    application.get("/amendments", [amendmentController.indexAmendments ]);
    application.get("/amendments/download", [amendmentController.downloadAmendments ]);
    application.get("/amendments/dashboard", [amendmentController.getDashBoard ]);
    application.get("/amendments/graph/procurementCategory", [amendmentController.getProcurementCategoryGraph ]);
    application.get("/amendments/graph/amendmentTypeGraph", [amendmentController.getAmendmentTypeGraph ]);
    application.get("/amendments/graph/amendedContractsByAmendmentType", [amendmentController.getAmendedContractTypeGraph ]);
    application.get("/amendments/graph/amendedContractsByCategory", [amendmentController.getAmendedContractByCategoruGraph ]);
    application.get("/amendments/graph/marketApproach", [amendmentController.getMarketApproachGraph ]);
    application.get("/amendments/graph/reviewType", [amendmentController.getReviewTypeGraph ]);
    application.get("/amendments/filterOptions", [ amendmentController.getFilters]);    
    
  }
}

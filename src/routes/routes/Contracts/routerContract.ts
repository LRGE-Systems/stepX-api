import { Router } from "../../../protocols/router";
import * as restify from "restify";
import { authorize } from "../../../security/middlewares/authorizeAcess";
import { activityController } from "../../controllers/ActivityController";
import { contractController } from "../../controllers/ContractController";

export class ContractRouter extends Router {
  applyRoutes(application: restify.Server) {
    application.get("/contracts", [contractController.indexContracts ]);
    application.get("/contracts/download", [contractController.downloadContracts ]);
    application.get("/contracts/dashboard", [contractController.getDashBoard ]);
    application.get("/contracts/graph/procurementCategory", [contractController.getProcurementCategoryGraph ]);
    application.get("/contracts/graph/procurementMethod", [contractController.getProcurementMethodGraph ]);
    application.get("/contracts/graph/marketApproach", [contractController.getMarketApproachGraph ]);
    application.get("/contracts/graph/reviewType", [contractController.getReviewTypeGraph ]);
    application.get("/contracts/filterOptions", [ contractController.getFilters]);   
    
  }
}

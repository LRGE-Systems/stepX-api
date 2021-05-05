import { Server } from "./server";
import { AuthRouter } from "./security/routes/Authenticate/routerAuth";
import { FileDriver } from "./common/fileUpload";
import { ProjectRouter,UserRouter,ActivityRouter, RoadmapRouter,ContractRouter, AmendmentRouter } from "./routes/routes";

const server = new Server();
const projectRouter = new ProjectRouter();
const userRouter = new UserRouter();
const authRouter = new AuthRouter();
const activityRouter = new ActivityRouter();
const roadmapRouter = new RoadmapRouter();
const contractRouter = new ContractRouter();
const amendmentRouter = new AmendmentRouter();
export const fileDriver = new FileDriver();
server
  .bootstrap([
    authRouter,
    projectRouter,
    userRouter,
    activityRouter,
    roadmapRouter,
    contractRouter,
    amendmentRouter
  ])
  .then((server) => {
    console.log(`Server is listen on: ${server.application.address().port}`);
  })
  .catch((error) => {
    console.log(`Server failed to start: ${error}`);
    process.exit(1);
  });

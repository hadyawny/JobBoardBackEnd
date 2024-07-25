import { globalError } from "../middleware/globalError.js";
import authRouter from "./auth/auth.routes.js";
import jobRouter from "./job/job.routes.js";
import userRouter from "./user/user.routes.js";

export const bootstrap = (app) => {

  // app.use("/api/v1/brands",brandRouter);
  app.use("/api/v1/users",userRouter);
  app.use("/api/v1/auth",authRouter);
  app.use("/api/v1/jobs",jobRouter);



  app.get('/',(req,res)=>res.send("Welcome to Job board API please select any of available Endpoints"))

  app.use(globalError);
};

import express from "express";
import { validation } from "../../middleware/validation.js";
import { addJobVal, paramsIdVal, UpdateJobVal } from "./job.validation.js";
import { addJob, applyToJob, deleteJob, getAllJobs, getSingleJob, updateJob } from "./job.controller.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";


const jobRouter = express.Router();

jobRouter.route("/")
.post(protectedRoutes,allowedTo("hr"),validation(addJobVal),addJob)
.get(getAllJobs)
jobRouter.route("/:id")
.get(validation(paramsIdVal),getSingleJob)
.put(protectedRoutes,allowedTo("hr"),validation(UpdateJobVal),updateJob)
.delete(protectedRoutes,allowedTo("hr"),validation(paramsIdVal),deleteJob)

jobRouter.route("/apply/:id").post(protectedRoutes,allowedTo("user"),validation(paramsIdVal),applyToJob)

export default jobRouter;

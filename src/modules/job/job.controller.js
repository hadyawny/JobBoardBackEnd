import slugify from "slugify";
import { catchError } from "../../middleware/catchError.js";
import { deleteOne, getAllOne, getSingleOne } from "../handler/handlers.js";
import { jobModel } from "../../../database/models/job.model.js";
import { userModel } from "../../../database/models/user.model.js";

const addJob = catchError(async (req, res, next) => {
  req.body.createdBy = req.user._id;
  let job = new jobModel(req.body);
  await job.save();

  await userModel.findByIdAndUpdate(req.user._id, { $push: { addedJobs: job._id } },{new: true})


  res.json({ message: "success", job });
});

const applyToJob = catchError(async (req, res, next) => {


  await jobModel.findByIdAndUpdate(req.params.id, { $push: { applicants: req.user._id } },{new: true})

  await userModel.findByIdAndUpdate(req.user._id, { $push: { appliedJobs: req.params.id } },{new: true})


  res.json({ message: "success" });
});

const updateJob = catchError(async (req, res, next) => {

  let job = await jobModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  !job && res.status(404).json({ message: "job not found" });
  job && res.json({ message: "success", job });
});

const getAllJobs = getAllOne(jobModel,['createdBy','applicants']);

const getSingleJob = getSingleOne(jobModel,['createdBy','applicants']);

const deleteJob = deleteOne(jobModel);

export { addJob, getAllJobs, getSingleJob, updateJob, deleteJob ,applyToJob};

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

  let user = await userModel.findById(req.user._id);

  if (user.appliedJobs.includes(req.params.id)) {
    return res.status(400).json({ message: "You have already applied to this job." });
  }
  let job = await jobModel.findByIdAndUpdate(req.params.id, { $push: { applicants: req.user._id } },{new: true})

  await userModel.findByIdAndUpdate(req.user._id, { $push: { appliedJobs: req.params.id } },{new: true})


  !job && res.status(404).json({ message: "job not found" });
  job && res.json({ message: "success", job });
});

const updateJob = catchError(async (req, res, next) => {

  let job = await jobModel.findOneAndUpdate({_id:req.params.id,createdBy:req.user._id}, req.body, {
    new: true,
  });
  !job && res.status(404).json({ message: "job not found" });
  job && res.json({ message: "success", job });
});

const deleteJob = catchError(async (req, res, next) => {

  const job = await jobModel.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  // Remove the job from the user's addedJobs array
  await userModel.findByIdAndUpdate(req.user._id, { $pull: { addedJobs: req.params.id } }, { new: true });

  res.json({ message: "Job deleted successfully" });
});

const getAllJobs = getAllOne(jobModel,['createdBy','applicants']);

const getSingleJob = getSingleOne(jobModel,['createdBy','applicants']);


export { addJob, getAllJobs, getSingleJob, updateJob, deleteJob ,applyToJob};

import Joi from "joi";

const addJobVal = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  details: Joi.string().min(5).max(1000).required(),
  company: Joi.string().min(2).max(100).required(),
  location: Joi.string().min(2).max(100),
  employmentType: Joi.string().valid("full-time", "part-time", "contract", "temporary", "internship").required(),
});


const paramsIdVal = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const UpdateJobVal = Joi.object({
  id: Joi.string().hex().length(24).required(),
  title: Joi.string().min(2).max(100).trim(),
  details: Joi.string().min(5).max(1000).trim(),
  company: Joi.string().min(2).max(100).trim(),
  location: Joi.string().min(2).max(100).trim(),
  employmentType: Joi.string().valid("full-time", "part-time", "contract", "temporary", "internship"),
});

export { addJobVal, paramsIdVal, UpdateJobVal  };

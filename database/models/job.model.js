import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      minLength: [2, "too short title"],
    },
    details: {
      type: String,
      trim: true,
      required: true,
      minLength: [5, "too short job details"],
    },
    company: { type: String, required: true },
    location: { type: String  ,required: true },
    category: {
      type: String,
      enum: ["design", "sales", "marketing", "finance", "technology", "engineering", "business", "human resources"],
      required: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "temporary", "internship"],
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    applicants:[{ type: mongoose.Types.ObjectId, ref: "user" }],

  },
  { timestamps: true }
);

export const jobModel = mongoose.model("job", schema);

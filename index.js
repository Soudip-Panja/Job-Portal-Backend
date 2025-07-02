const express = require("express");
require("dotenv").config();
const app = express();

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,

  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const { initializeDatabase } = require("./db/db.connect");
const fs = require("fs");
const Job = require("./model/job.model");

initializeDatabase();

const jsonData = fs.readFileSync("jobs.json", "utf-8");
const jobsData = JSON.parse(jsonData);

function seedData() {
  try {
    for (const jobData of jobsData) {
      const newJob = new Job({
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        companyLocation: jobData.companyLocation,
        salary: jobData.salary,
        jobType: jobData.jobType,
        jobDescription: jobData.jobDescription,
        qualifications: jobData.qualifications,
      });
      // console.log(newJob.jobTitle)
      newJob.save();
    }
  } catch (error) {
    console.log("Error seeding the data.", error);
  }
}
// seedData();


// ✅ Fetch all jobs
async function readAllJobs() {
  try {
    const allJobs = await Job.find();
    return allJobs;
  } catch (error) {
    console.log("Error reading all Jobs.", error);
    return [];
  }
}

// ✅ GET all jobs
app.get("/jobs", async (req, res) => {
  try {
    const jobs = await readAllJobs();
    if (jobs.length !== 0) {
      res.status(200).json({ jobs });
    } else {
      res.status(404).json({ error: "No jobs found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

// ✅ GET job by ID
app.get("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the job." });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
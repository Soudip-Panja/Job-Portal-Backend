const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const { initializeDatabase } = require("./db/db.connect");
const Job = require("./model/job.model");

initializeDatabase();

const jsonPath = path.resolve(__dirname, "jobs.json");
const jsonData = fs.readFileSync(jsonPath, "utf-8");
const jobsData = JSON.parse(jsonData);

async function seedData() {
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
      await newJob.save(); // Added await here
    }
    console.log("Seed data inserted successfully.");
  } catch (error) {
    console.log("Error seeding data:", error.message);
  }
}
// seedData();

async function readAllJobs() {
  try {
    const allJobs = await Job.find();
    console.log(allJobs);
    return allJobs;
  } catch (error) {
    console.log("Error reading jobs:", error.message);
    return [];
  }
}

app.get("/jobs", async (req, res) => {
  try {
    const jobs = await readAllJobs();
    if (jobs && jobs.length > 0) {
      res.status(200).json({ jobs });
    } else {
      res.status(404).json({ error: "No jobs found." });
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

app.get("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job." });
  }
});

// For posting new job part
async function createJob(newJob) {
  try {
    const job = new Job(newJob);
    const savedJob = await job.save();
    console.log("New Job data:", savedJob);
    return savedJob; // Added return statement
  } catch (error) {
    throw error;
  }
}

app.post("/jobs", async (req, res) => {
  try {
    const savedJob = await createJob(req.body);
    res
      .status(201)
      .json({ message: "Job added successfully.", job: savedJob });
  } catch (error) {
    res.status(500).json({ error: "Failed to add job." });
  }
});

// For deleting job by ID
async function deleteJobById(jobId) {
  try {
    const deletedJob = await Job.findByIdAndDelete(jobId);
    return deletedJob;
  } catch (error) {
    throw error;
  }
}

app.delete("/jobs/:id", async (req, res) => {
  try {
    const deletedJob = await deleteJobById(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ error: "Job not found." });
    }
    res.status(200).json({ 
      message: "Job deleted successfully.", 
      job: deletedJob 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
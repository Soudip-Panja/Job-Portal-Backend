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
seedData();

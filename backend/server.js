require("dns").setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");
const SavedJob = require("./models/SavedJob");
const Interview = require("./models/Interview");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const app = express();

const PORT = process.env.PORT || 5000;


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        req.headers.origin || "*"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json());


/* =========================================================
   MONGODB CONNECTION
========================================================= */

mongoose.connect(process.env.MONGODB_URI)

    .then(() => {

        console.log(
            "MongoDB connected successfully!"
        );

        app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `CareerConnect server is running on port ${PORT}`
    );
});

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });


/* =========================================================
   BASIC TEST ROUTES
========================================================= */

const frontendPath = path.join(__dirname, "../frontend");

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "CareerConnect API is working!"
    });
});


app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "CareerConnect API is working!"
    });

});


/* =========================================================
   AUTH - REGISTER
========================================================= */

app.post(
    "/api/auth/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password,
                role
            } = req.body;


            if (!name || !email || !password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, email and password are required"

                });

            }


            const existingUser =
                await User.findOne({
                    email: email.toLowerCase().trim()
                });


            if (existingUser) {

                return res.status(400).json({

                    success: false,

                    message:
                        "User already exists"

                });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            const user =
                await User.create({

                    name:
                        name.trim(),

                    email:
                        email.toLowerCase().trim(),

                    password:
                        hashedPassword,

                    role:
                        role || "job_seeker"

                });


            res.status(201).json({

                success: true,

                message:
                    "User registered successfully",

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role

                }

            });


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   AUTH - LOGIN
========================================================= */

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (!email || !password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and password are required"

                });

            }


            const user =
                await User.findOne({
                    email: email.toLowerCase().trim()
                });


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            const isPasswordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!isPasswordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password"

                });

            }


            res.json({

                success: true,

                message:
                    "Login successful",

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    phone:
                        user.phone || "",

                    skills:
                        user.skills || "",

                    bio:
                        user.bio || "",

                    company:
                        user.company || ""

                }

            });


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   CREATE JOB
========================================================= */

app.post(
    "/api/jobs",
    async (req, res) => {

        try {

            const {
                title,
                company,
                location,
                salary,
                description,
                requirements,
                postedBy
            } = req.body;


            if (
                !title ||
                !company ||
                !location ||
                !description ||
                !postedBy
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Title, company, location, description and postedBy are required"

                });

            }


            const employer =
                await User.findOne({

                    _id: postedBy,

                    role: "employer"

                });


            if (!employer) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only employers can post jobs"

                });

            }


            const job =
                await Job.create({

                    title:
                        title.trim(),

                    company:
                        company.trim(),

                    location:
                        location.trim(),

                    salary:
                        salary
                            ? salary.trim()
                            : "",

                    description:
                        description.trim(),

                    requirements:
                        requirements
                            ? requirements.trim()
                            : "",

                    postedBy

                });


            res.status(201).json({

                success: true,

                message:
                    "Job posted successfully",

                job

            });


        } catch (error) {

            console.error(
                "Create job error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   GET ALL JOBS
========================================================= */

app.get(
    "/api/jobs",
    async (req, res) => {

        try {

            const jobs =
                await Job.find()
                    .sort({
                        createdAt: -1
                    });


            res.json({

                success: true,

                jobs

            });


        } catch (error) {

            console.error(
                "Get jobs error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   GET SINGLE JOB
========================================================= */

app.get(
    "/api/jobs/:id",
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid job ID"

                });

            }


            const job =
                await Job.findById(
                    req.params.id
                );


            if (!job) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job not found"

                });

            }


            res.json({

                success: true,

                job

            });


        } catch (error) {

            console.error(
                "Get job details error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   DELETE JOB
========================================================= */

app.delete(
    "/api/jobs/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const {
                employerId
            } = req.body;


            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid job ID"

                });

            }


            if (
                !employerId ||
                !mongoose.Types.ObjectId.isValid(
                    employerId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Valid employer ID is required"

                });

            }


            const job =
                await Job.findById(id);


            if (!job) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job not found"

                });

            }


            /* Check job owner */

            if (
                job.postedBy.toString() !==
                employerId.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only delete your own jobs"

                });

            }


            /* Delete related applications */

            await Application.deleteMany({

                job: id

            });


            /* Delete saved jobs */

            await SavedJob.deleteMany({

                job: id

            });


            /* Delete job */

            await Job.findByIdAndDelete(id);


            res.json({

                success: true,

                message:
                    "Job deleted successfully"

            });


        } catch (error) {

            console.error(
                "Delete job error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   APPLY FOR JOB
========================================================= */

app.post(
    "/api/applications",
    async (req, res) => {

        try {

            const {
                job,
                applicant,
                coverLetter
            } = req.body;


            if (!job || !applicant) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Job and applicant are required"

                });

            }


            /* Validate applicant ID */

            if (
                !mongoose.Types.ObjectId.isValid(
                    applicant
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid applicant ID"

                });

            }


            /* Validate job ID */

            if (
                !mongoose.Types.ObjectId.isValid(
                    job
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid job ID"

                });

            }


            /* Check applicant */

            const user =
                await User.findOne({

                    _id: applicant,

                    role: "job_seeker"

                });


            if (!user) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only job seekers can apply"

                });

            }


            /* Check job */

            const existingJob =
                await Job.findById(job);


            if (!existingJob) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job not found"

                });

            }


            /* Prevent duplicate application */

            const existingApplication =
                await Application.findOne({

                    job,

                    applicant

                });


            if (existingApplication) {

                return res.status(400).json({

                    success: false,

                    message:
                        "You have already applied for this job"

                });

            }


            /* Create application */

            const application =
                await Application.create({

                    job,

                    applicant,

                    coverLetter:
                        coverLetter
                            ? coverLetter.trim()
                            : "",

                    status:
                        "pending"

                });


            const populatedApplication =
                await Application.findById(
                    application._id
                )
                    .populate("job")
                    .populate(
                        "applicant",
                        "name email"
                    );


            res.status(201).json({

                success: true,

                message:
                    "Application submitted successfully",

                application:
                    populatedApplication

            });


        } catch (error) {

            console.error(
                "Application error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   GET EMPLOYER APPLICATIONS
========================================================= */

app.get(
    "/api/applications/employer/:employerId",
    async (req, res) => {

        try {

            const employerId =
                req.params.employerId;


            if (
                !mongoose.Types.ObjectId.isValid(
                    employerId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid employer ID"

                });

            }


            /* Find employer jobs */

            const jobs =
                await Job.find({

                    postedBy:
                        employerId

                });


            const jobIds =
                jobs.map(
                    job => job._id
                );


            /* Find applications */

            const applications =
                await Application.find({

                    job: {
                        $in: jobIds
                    }

                })
                    .populate("job")
                    .populate(
                        "applicant",
                        "name email phone skills bio"
                    )
                    .sort({
                        createdAt: -1
                    });


            res.json({

                success: true,

                applications

            });


        } catch (error) {

            console.error(
                "Get employer applications error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   EMPLOYER APPLICATION STATISTICS
========================================================= */

app.get(
    "/api/applications/employer/:employerId/stats",
    async (req, res) => {

        try {

            const employerId =
                req.params.employerId;


            if (
                !mongoose.Types.ObjectId.isValid(
                    employerId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid employer ID"

                });

            }


            const jobs =
                await Job.find({

                    postedBy:
                        employerId

                }).select("_id");


            const jobIds =
                jobs.map(
                    job => job._id
                );


            const applications =
                await Application.find({

                    job: {
                        $in: jobIds
                    }

                }).select("status");


            const stats = {

                total:
                    applications.length,

                pending:
                    applications.filter(
                        application =>
                            application.status ===
                            "pending"
                    ).length,

                shortlisted:
                    applications.filter(
                        application =>
                            application.status ===
                            "shortlisted"
                    ).length,

                rejected:
                    applications.filter(
                        application =>
                            application.status ===
                            "rejected"
                    ).length,

                hired:
                    applications.filter(
                        application =>
                            application.status ===
                            "hired"
                    ).length

            };


            res.json({

                success: true,

                stats

            });


        } catch (error) {

            console.error(
                "Application statistics error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   UPDATE APPLICATION STATUS
========================================================= */

app.put(
    "/api/applications/:id/status",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "pending",

                "shortlisted",

                "rejected",

                "hired"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application status"

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application ID"

                });

            }


            const application =
                await Application.findById(
                    req.params.id
                );


            if (!application) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found"

                });

            }


            application.status =
                status;


            await application.save();


            const updatedApplication =
                await Application.findById(
                    application._id
                )
                    .populate("job")
                    .populate(
                        "applicant",
                        "name email phone skills bio"
                    );


            res.json({

                success: true,

                message:
                    "Application status updated successfully",

                application:
                    updatedApplication

            });


        } catch (error) {

            console.error(
                "Update application status error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   JOB SEEKER APPLICATIONS
========================================================= */

app.get(
    "/api/applications/job-seeker/:applicantId",
    async (req, res) => {

        try {

            const applicantId =
                req.params.applicantId;


            if (
                !mongoose.Types.ObjectId.isValid(
                    applicantId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid applicant ID"

                });

            }


            const applications =
                await Application.find({

                    applicant:
                        applicantId

                })
                    .populate("job")
                    .sort({
                        createdAt: -1
                    });


            res.json({

                success: true,

                applications

            });


        } catch (error) {

            console.error(
                "Get job seeker applications error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   UPDATE USER PROFILE
========================================================= */

app.put(
    "/api/users/:id/profile",
    async (req, res) => {

        try {

            const {
                name,
                phone,
                skills,
                bio,
                company
            } = req.body;


            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user ID"

                });

            }


            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            if (name) {

                user.name =
                    name.trim();

            }


            user.phone =
                phone
                    ? phone.trim()
                    : "";


            user.skills =
                skills
                    ? skills.trim()
                    : "";


            user.bio =
                bio
                    ? bio.trim()
                    : "";


            user.company =
                company
                    ? company.trim()
                    : "";


            await user.save();


            res.json({

                success: true,

                message:
                    "Profile updated successfully",

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role,

                    phone:
                        user.phone,

                    skills:
                        user.skills,

                    bio:
                        user.bio,

                    company:
                        user.company

                }

            });


        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   SAVE JOB
========================================================= */

app.post(
    "/api/saved-jobs",
    async (req, res) => {

        try {

            const {
                user,
                job
            } = req.body;


            if (!user || !job) {

                return res.status(400).json({

                    success: false,

                    message:
                        "User and job are required"

                });

            }


            const existingJob =
                await Job.findById(job);


            if (!existingJob) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job not found"

                });

            }


            const existingSavedJob =
                await SavedJob.findOne({

                    user,

                    job

                });


            if (existingSavedJob) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Job is already saved"

                });

            }


            const savedJob =
                await SavedJob.create({

                    user,

                    job

                });


            res.status(201).json({

                success: true,

                message:
                    "Job saved successfully",

                savedJob

            });


        } catch (error) {

            console.error(
                "Save job error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   GET SAVED JOBS
========================================================= */

app.get(
    "/api/saved-jobs/:userId",
    async (req, res) => {

        try {

            const savedJobs =
                await SavedJob.find({

                    user:
                        req.params.userId

                })
                    .populate("job")
                    .sort({
                        createdAt: -1
                    });


            res.json({

                success: true,

                savedJobs

            });


        } catch (error) {

            console.error(
                "Get saved jobs error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   REMOVE SAVED JOB
========================================================= */

app.delete(
    "/api/saved-jobs/:userId/:jobId",
    async (req, res) => {

        try {

            const deletedJob =
                await SavedJob.findOneAndDelete({

                    user:
                        req.params.userId,

                    job:
                        req.params.jobId

                });


            if (!deletedJob) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Saved job not found"

                });

            }


            res.json({

                success: true,

                message:
                    "Job removed from saved jobs"

            });


        } catch (error) {

            console.error(
                "Remove saved job error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);
/* =========================================================
   INTERVIEW ROUTES
========================================================= */


/* =========================================================
   SCHEDULE INTERVIEW
   Employer schedules interview for an application
========================================================= */

app.post(
    "/api/interviews",
    async (req, res) => {

        try {

            const {
                application,
                employer,
                date,
                type,
                meetingLink,
                location,
                notes
            } = req.body;


            /* -----------------------------------------
               Required fields
            ----------------------------------------- */

            if (
                !application ||
                !employer ||
                !date
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Application, employer and date are required"

                });

            }


            /* -----------------------------------------
               Validate IDs
            ----------------------------------------- */

            if (
                !mongoose.Types.ObjectId.isValid(
                    application
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application ID"

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    employer
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid employer ID"

                });

            }


            /* -----------------------------------------
               Validate date
            ----------------------------------------- */

            const interviewDate =
                new Date(date);


            if (
                Number.isNaN(
                    interviewDate.getTime()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview date"

                });

            }


            if (
                interviewDate <= new Date()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Interview date must be in the future"

                });

            }


            /* -----------------------------------------
               Check employer
            ----------------------------------------- */

            const employerUser =
                await User.findOne({

                    _id: employer,

                    role: "employer"

                });


            if (!employerUser) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only employers can schedule interviews"

                });

            }


            /* -----------------------------------------
               Find application
            ----------------------------------------- */

            const existingApplication =
                await Application.findById(
                    application
                );


            if (!existingApplication) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found"

                });

            }


            /* -----------------------------------------
               Find job
            ----------------------------------------- */

            const job =
                await Job.findById(
                    existingApplication.job
                );


            if (!job) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Job not found"

                });

            }


            /* -----------------------------------------
               Make sure employer owns job
            ----------------------------------------- */

            if (
                job.postedBy.toString() !==
                employer.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only schedule interviews for your own jobs"

                });

            }


            /* -----------------------------------------
               Prevent duplicate scheduled interview
            ----------------------------------------- */

            const existingInterview =
                await Interview.findOne({

                    application,

                    status: "scheduled"

                });


            if (existingInterview) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This application already has a scheduled interview"

                });

            }


            /* -----------------------------------------
               Validate interview type
            ----------------------------------------- */

            const allowedTypes = [
                "online",
                "phone",
                "in-person"
            ];


            const interviewType =
                type || "online";


            if (
                !allowedTypes.includes(
                    interviewType
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview type"

                });

            }


            /* -----------------------------------------
               Create interview
            ----------------------------------------- */

            const interview =
                await Interview.create({

                    application:
                        existingApplication._id,

                    job:
                        job._id,

                    applicant:
                        existingApplication.applicant,

                    employer:
                        employer,

                    date:
                        interviewDate,

                    type:
                        interviewType,

                    meetingLink:
                        meetingLink
                            ? meetingLink.trim()
                            : "",

                    location:
                        location
                            ? location.trim()
                            : "",

                    notes:
                        notes
                            ? notes.trim()
                            : "",

                    status:
                        "scheduled"

                });


            /* -----------------------------------------
               Automatically shortlist applicant
            ----------------------------------------- */

            existingApplication.status =
                "shortlisted";

            await existingApplication.save();


            /* -----------------------------------------
               Populate response
            ----------------------------------------- */

            const populatedInterview =
                await Interview.findById(
                    interview._id
                )
                    .populate(
                        "job",
                        "title company location salary"
                    )
                    .populate(
                        "applicant",
                        "name email phone"
                    )
                    .populate(
                        "employer",
                        "name email company"
                    );


            res.status(201).json({

                success: true,

                message:
                    "Interview scheduled successfully",

                interview:
                    populatedInterview

            });


        } catch (error) {

            console.error(
                "Schedule interview error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   GET JOB SEEKER INTERVIEWS
========================================================= */

app.get(
    "/api/interviews/job-seeker/:applicantId",
    async (req, res) => {

        try {

            const {
                applicantId
            } = req.params;


            /* -----------------------------------------
               Validate user ID
            ----------------------------------------- */

            if (
                !mongoose.Types.ObjectId.isValid(
                    applicantId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid applicant ID"

                });

            }


            /* -----------------------------------------
               Check user
            ----------------------------------------- */

            const user =
                await User.findOne({

                    _id: applicantId,

                    role: "job_seeker"

                });


            if (!user) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Invalid job seeker"

                });

            }


            /* -----------------------------------------
               Get interviews
            ----------------------------------------- */

            const interviews =
                await Interview.find({

                    applicant:
                        applicantId

                })
                    .populate(
                        "job",
                        "title company location salary"
                    )
                    .populate(
                        "employer",
                        "name email company"
                    )
                    .sort({
                        date: 1
                    });


            res.json({

                success: true,

                interviews

            });


        } catch (error) {

            console.error(
                "Get job seeker interviews error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   GET EMPLOYER INTERVIEWS
========================================================= */

app.get(
    "/api/interviews/employer/:employerId",
    async (req, res) => {

        try {

            const {
                employerId
            } = req.params;


            if (
                !mongoose.Types.ObjectId.isValid(
                    employerId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid employer ID"

                });

            }


            /* -----------------------------------------
               Check employer
            ----------------------------------------- */

            const employer =
                await User.findOne({

                    _id: employerId,

                    role: "employer"

                });


            if (!employer) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Invalid employer"

                });

            }


            /* -----------------------------------------
               Get employer interviews
            ----------------------------------------- */

            const interviews =
                await Interview.find({

                    employer:
                        employerId

                })
                    .populate(
                        "job",
                        "title company location salary"
                    )
                    .populate(
                        "applicant",
                        "name email phone"
                    )
                    .sort({
                        date: 1
                    });


            res.json({

                success: true,

                interviews

            });


        } catch (error) {

            console.error(
                "Get employer interviews error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   UPDATE INTERVIEW STATUS
========================================================= */

app.put(
    "/api/interviews/:id/status",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "scheduled",

                "completed",

                "cancelled"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview status"

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID"

                });

            }


            const interview =
                await Interview.findById(
                    req.params.id
                );


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Interview not found"

                });

            }


            interview.status =
                status;


            await interview.save();


            const updatedInterview =
                await Interview.findById(
                    interview._id
                )
                    .populate(
                        "job",
                        "title company location salary"
                    )
                    .populate(
                        "applicant",
                        "name email phone"
                    )
                    .populate(
                        "employer",
                        "name email company"
                    );


            res.json({

                success: true,

                message:
                    "Interview status updated successfully",

                interview:
                    updatedInterview

            });


        } catch (error) {

            console.error(
                "Update interview status error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);


/* =========================================================
   DELETE / CANCEL INTERVIEW
========================================================= */

app.delete(
    "/api/interviews/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid interview ID"

                });

            }


            const interview =
                await Interview.findById(id);


            if (!interview) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Interview not found"

                });

            }


            interview.status =
                "cancelled";


            await interview.save();


            res.json({

                success: true,

                message:
                    "Interview cancelled successfully",

                interview

            });


        } catch (error) {

            console.error(
                "Cancel interview error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error"

            });

        }

    }
);
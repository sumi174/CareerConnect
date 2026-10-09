# CareerConnect

CareerConnect is a full-stack job portal that connects **job seekers** with **employers**. Employers post jobs, review applicants and schedule interviews; job seekers browse jobs, save favourites, apply and track their applications.

**Live demo:** https://careerconnect-ijro.onrender.com
**Repository:** https://github.com/sumi174/CareerConnect

## Features

### Job seekers
- Register and log in as a job seeker
- Browse all job listings and view job details
- Apply to jobs with a cover letter (duplicate applications are blocked)
- Save and un-save jobs for later
- Track application status: `pending`, `shortlisted`, `rejected`, `hired`
- View scheduled interviews
- Edit profile (phone, skills, bio)

### Employers
- Register and log in as an employer
- Post and delete their own job listings
- View all applications received for their jobs
- Update application status
- Dashboard statistics (total, pending, shortlisted, rejected, hired)
- Schedule interviews (online, phone or in-person) with meeting link, location and notes
- Mark interviews as completed or cancelled
- Edit profile (including company)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Security | bcryptjs (password hashing) |
| Config | dotenv, CORS |
| Hosting | Render |

## Project Structure

```
CareerConnect/
├── backend/
│   ├── server.js        # Express app, API routes, serves the frontend
│   └── models/          # Mongoose models: User, Job, Application, SavedJob, Interview
├── frontend/            # Static HTML/CSS/JS pages (served by Express)
├── package.json
└── .gitignore
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or newer
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/sumi174/CareerConnect.git
cd CareerConnect
npm install
```

### Environment variables

Create a `.env` file in the **project root** (next to `package.json`):

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

`PORT` is optional and defaults to `5000`. On hosts like Render the platform sets `PORT` automatically, so don't hardcode it there.

### Run

```bash
npm start
```

Open http://localhost:5000. The Express server serves the frontend and the API from the same port.

Health check: `GET /api/test` returns `{ "success": true, "message": "CareerConnect API is working!" }`.

## API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create an account (`name`, `email`, `password`, `role`) |
| POST | `/auth/login` | Log in with `email` and `password` |

### Users
| Method | Endpoint | Description |
| --- | --- | --- |
| PUT | `/users/:id/profile` | Update name, phone, skills, bio, company |

### Jobs
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/jobs` | List all jobs (newest first) |
| GET | `/jobs/:id` | Get a single job |
| POST | `/jobs` | Post a job (employers only) |
| DELETE | `/jobs/:id` | Delete own job and its related applications and saved jobs |

### Applications
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/applications` | Apply for a job (job seekers only) |
| GET | `/applications/job-seeker/:applicantId` | Applications submitted by a job seeker |
| GET | `/applications/employer/:employerId` | Applications received by an employer |
| GET | `/applications/employer/:employerId/stats` | Application counts by status |
| PUT | `/applications/:id/status` | Set status: `pending`, `shortlisted`, `rejected`, `hired` |

### Saved jobs
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/saved-jobs` | Save a job |
| GET | `/saved-jobs/:userId` | Get a user's saved jobs |
| DELETE | `/saved-jobs/:userId/:jobId` | Remove a saved job |

### Interviews
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/interviews` | Schedule an interview (also shortlists the applicant) |
| GET | `/interviews/job-seeker/:applicantId` | Interviews for a job seeker |
| GET | `/interviews/employer/:employerId` | Interviews for an employer |
| PUT | `/interviews/:id/status` | Set status: `scheduled`, `completed`, `cancelled` |
| DELETE | `/interviews/:id` | Cancel an interview |

## Deployment (Render)

1. Push the repo to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) and connect the repo.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add the `MONGODB_URI` environment variable. Leave `PORT` unset.
5. In MongoDB Atlas, allow Render's IPs under **Network Access**.

## Roadmap

- Token-based authentication (JWT) and protected routes
- Job search, filters and pagination
- Resume upload
- Email notifications for status changes and interviews

## Author

Built by [sumi174](https://github.com/sumi174).

## License

ISC


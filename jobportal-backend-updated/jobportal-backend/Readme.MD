# HRMS Backend — Node.js + Express + MongoDB

## Setup

```bash
npm install
cp .env.example .env        # fill in your values
npm run seed                # seed demo data
npm run dev                 # development
npm start                   # production
```

---

## API Base URL
```
http://localhost:5000/api/v1
```

---

## Auth Endpoints
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | /auth/register | Admin/HR | Register new employee |
| POST | /auth/login | Public | Login |
| POST | /auth/refresh-token | Public | Refresh JWT |
| POST | /auth/logout | User | Logout |
| GET | /auth/me | User | Get own profile |
| PUT | /auth/change-password | User | Change password |

---

## Attendance Endpoints

### User
| Method | URL | Description |
|--------|-----|-------------|
| POST | /attendance/checkin | Check in today |
| PUT | /attendance/checkout | Check out today |
| PUT | /attendance/mark-half-day | Mark half day (first/second) |
| GET | /attendance/my?month=6&year=2026 | Own monthly attendance |
| GET | /attendance/today | Today's status |

### Admin / HR / Manager
| Method | URL | Description |
|--------|-----|-------------|
| POST | /attendance/admin/mark | Mark attendance for any employee |
| PUT | /attendance/admin/edit/:id | Edit any attendance record |
| GET | /attendance/admin/report | Monthly report (with filters) |
| GET | /attendance/admin/employee/:id | Employee-wise attendance |
| POST | /attendance/admin/bulk | Bulk upload attendance |

---

## Leave Endpoints

### User
| Method | URL | Description |
|--------|-----|-------------|
| POST | /leaves/apply | Apply for leave (+ file upload) |
| GET | /leaves/my | My leave history |
| GET | /leaves/balance | My leave balance |
| DELETE | /leaves/:id/cancel | Cancel a pending leave |

### Admin / HR / Manager
| Method | URL | Description |
|--------|-----|-------------|
| GET | /leaves/admin/all | All leaves (with filters) |
| GET | /leaves/admin/pending | Pending leaves |
| PUT | /leaves/admin/:id/status | Approve / Reject |
| PUT | /leaves/admin/:id/edit | Edit any leave record |
| GET | /leaves/admin/balance/:employeeId | Employee balance |
| PUT | /leaves/admin/balance/:employeeId | Adjust leave balance |

---

## User Endpoints (Admin/HR)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /users | All employees (paginated, searchable) |
| GET | /users/departments | List of departments |
| GET | /users/:id | Employee by ID |
| PUT | /users/:id | Update employee |
| DELETE | /users/:id | Deactivate employee |

---

## Holiday Endpoints
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | /holidays?year=2026 | All users | Get holidays |
| POST | /holidays | Admin | Add holiday |
| PUT | /holidays/:id | Admin | Update holiday |
| DELETE | /holidays/:id | Admin | Delete holiday |

---

## Roles & Permissions
| Role | Permissions |
|------|-------------|
| employee | Own attendance, own leaves, own profile |
| manager | Team attendance view, leave approvals for team |
| hr | All attendance, all leaves, all users (no admin ops) |
| admin | Full access including user management, balance adjustment |

---

## Seed Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrms.com | password123 |
| HR | hr@hrms.com | password123 |
| Employee | arjun@hrms.com | password123 |
| Manager | ravi@hrms.com | password123 |

---

## Folder Structure
```
src/
├── config/        db.js
├── controllers/   auth, attendance, leave, user, holiday
├── middleware/    auth, errorHandler, validate, upload
├── models/        User, Attendance, Leave, LeaveBalance, Holiday
├── routes/        index, auth, attendance, leave, user, holiday
├── utils/         logger, apiResponse, catchAsync, AppError, dateHelper, seeder
├── validators/    auth, attendance, leave
├── app.js
└── server.js
service - all logic 
```

---

## Job Portal Module (jobhai) — Employer Side

Base path: `/api/jobhai`

### Employer Auth
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | /employer/auth/register | Public | Register a new company (status starts `pending`) |
| POST | /employer/auth/login | Public | Login as company owner OR recruiter |
| POST | /employer/auth/refresh | Public | Refresh access token (cookie or body) |
| POST | /employer/auth/logout | Employer/Recruiter | Logout, invalidate refresh token |
| GET  | /employer/auth/me | Employer/Recruiter | Get own account |

### Employer Profile
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | /employer/profile | Employer/Recruiter | View company profile |
| PATCH | /employer/profile | Employer only | Update company profile |
| POST | /employer/profile/logo | Employer only | Upload company logo (multipart `logo`) |

### Job Postings
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | /employer/jobs | canPostJobs | Create a job (goes to `review`) |
| GET | /employer/jobs | Employer/Recruiter | List own jobs (search, status, jobType, category, page, limit) |
| GET | /employer/jobs/:id | Employer/Recruiter | Get one job |
| PATCH | /employer/jobs/:id | canPostJobs | Update a job (re-enters `review` if it was `active`) |
| DELETE | /employer/jobs/:id | canPostJobs | Soft-delete a job |

### Recruiters
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | /employer/recruiters | canManageRecruiters | Invite a recruiter |
| GET | /employer/recruiters | canManageRecruiters | List recruiters |
| PATCH | /employer/recruiters/:id | canManageRecruiters | Update a recruiter |
| DELETE | /employer/recruiters/:id | canManageRecruiters | Remove a recruiter |

### Applicants
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | /employer/applications/job/:jobId | canManageApplicants | List applicants for a job (filter by status) |
| GET | /employer/applications/:id | canManageApplicants | Get one application |
| PATCH | /employer/applications/:id/status | canManageApplicants | Move applicant through pipeline (applied → shortlisted → interview_scheduled → rejected/hired) |

### Dashboard
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | /employer/dashboard | Employer/Recruiter | Job + application stats, recent applicants |

### Admin (job portal moderation — reuses ERP-wide admin/subadmin login)
Base path: `/api/jobhai/admin` — all routes require `protect` + `allowRoles("admin", "subadmin")`.

| Method | URL | Description |
|--------|-----|-------------|
| GET | /admin/dashboard | Combined stats overview |
| GET | /admin/employers, /admin/employers/:id | List / view companies |
| PATCH | /admin/employers/:id/verify, /reject, /suspend, /restore | Moderate companies |
| PATCH | /admin/employers/:id/plan | Change subscription plan |
| GET | /admin/jobs, /admin/jobs/:id | List / view jobs |
| PATCH | /admin/jobs/:id/approve, /reject, /flag, /remove | Moderate jobs |
| GET | /admin/users | List job portal candidates |

> Note: `canPostJobs`, `canManageRecruiters`, `canManageApplicants` are recruiter permission flags — the company owner (Employer) always has full access regardless of these flags.

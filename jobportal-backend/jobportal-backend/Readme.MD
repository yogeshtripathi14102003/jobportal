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
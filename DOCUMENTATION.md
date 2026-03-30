# 📖 College Helpdesk - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [Course Management](#course-management)
4. [Chatbot System](#chatbot-system)
5. [Timetable Generation](#timetable-generation)
6. [API Reference](#api-reference)
7. [Database Models](#database-models)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Design
```
┌─────────────┐      HTTP/REST      ┌─────────────┐      Mongoose      ┌─────────────┐
│   React     │ ◄─────────────────► │   Express   │ ◄────────────────► │   MongoDB   │
│  Frontend   │    JWT Auth         │   Backend   │    ODM             │  Database   │
└─────────────┘                     └─────────────┘                    └─────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with Hooks
- Axios for HTTP requests
- Context API for state management
- CSS Variables for theming

**Backend:**
- Express.js for REST API
- Mongoose for MongoDB ODM
- JWT for authentication
- bcryptjs for password hashing
- PDFKit for PDF generation

**Database:**
- MongoDB for data persistence
- Collections: Users, Courses, Subjects, Teachers, Classes, Timetables, KnowledgeBase

---

## Authentication System

### Overview
JWT-based authentication with role-based access control. Users register with their chosen role (Admin/Student) and receive a token valid for 30 days.

### User Roles

**Student (role: 'user')**
- Access chatbot
- View courses and timetables
- Download PDFs

**Admin (role: 'admin')**
- All student features
- Access admin panel
- Manage all system data
- Generate timetables

### Registration Flow

1. User fills registration form with role selection
2. Frontend sends POST to `/api/auth/register`
3. Backend validates and checks for existing email
4. Password is hashed with bcrypt (10 salt rounds)
5. User document created in MongoDB
6. JWT token generated and returned
7. Frontend stores token in localStorage
8. User redirected to dashboard

### Login Flow

1. User enters email and password
2. Frontend sends POST to `/api/auth/login`
3. Backend finds user by email
4. Password compared using bcrypt
5. JWT token generated if valid
6. Token and user data returned
7. Frontend stores in localStorage
8. User redirected to dashboard

### Password Security

**Hashing (User Model):**
```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

**Comparison:**
```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### Token Management

**Generation:**
```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
```

**Verification (Middleware):**
```javascript
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } else {
    res.status(401).json({ error: 'Not authorized' });
  }
};
```

### Session Management

- Token stored in localStorage
- Axios interceptor adds token to all requests
- Session cleared on app restart (no persistence)
- 401 errors trigger automatic logout

---

## Course Management

### Data Structure

**Course → Section → Subjects**

```
Course (BCA)
├── Section A, Semester 1
│   ├── Programming
│   ├── Mathematics
│   └── English
└── Section B, Semester 1
    ├── Programming
    ├── Mathematics
    └── Physics
```

### Course Model
```javascript
{
  name: String,           // "Bachelor of Computer Applications"
  code: String,           // "BCA"
  description: String,    // Course details
  duration: String,       // "3 years"
  fees: Number,          // 150000 (in rupees)
  category: String       // undergraduate/postgraduate/diploma/certificate
}
```

### Class Model
```javascript
{
  course: ObjectId,      // Reference to Course
  section: String,       // "A", "B", "C"
  semester: Number,      // 1, 2, 3, etc.
  subjects: [ObjectId]   // Array of Subject references
}
```

### Admin Workflow

1. **Add Courses** → Courses tab
2. **Add Subjects** → Subjects tab (with code and hours/week)
3. **Add Teachers** → Teachers tab (assign subjects they teach)
4. **Create Class Sections** → Classes tab (select course, section, semester, subjects)
5. **Generate Timetables** → Generate tab (creates schedules for all sections)

---

## Chatbot System

### Real-Time Database Integration

The chatbot queries the database on every request, ensuring it always has the latest course information.

**No manual seeding required!** When admin adds a course, chatbot knows immediately.

### Query Types

**1. Fees Queries**
- "BCA fees"
- "What is the fee for CSE?"
- "How much does MCA cost?"

**2. Duration Queries**
- "How long is MBA?"
- "CSE duration"

**3. Course Details**
- "Tell me about BCA"
- "CSE course information"

**4. General Queries**
- "What courses do you offer?"
- "Available programs"

### Course Matching Algorithm

```javascript
1. Extract course codes from query (BCA, CSE, MCA, etc.)
2. Sort courses by code length (longest first to avoid conflicts)
3. Check if query contains course code or name
4. Return best match
5. Format response based on query type
```

### Currency Formatting

All fees displayed in Indian Rupees with proper formatting:
```javascript
fees.toLocaleString('en-IN') // 150000 → ₹1,50,000
```

### Response Templates

**Fees Response:**
```
The annual tuition fee for [Course Name] ([CODE]) is ₹[Amount]. 
The program duration is [Duration].
```

**Details Response:**
```
[Course Name] ([CODE]) is a [category] program.

[Description]

Duration: [Duration]
Annual Fee: ₹[Amount]
```

---

## Timetable Generation

### Algorithm Overview

The timetable generator creates unique schedules for each section while preventing teacher conflicts across all sections.

### Key Features

1. **Shared Teacher Schedule** - Tracks teacher availability across all sections
2. **Conflict Prevention** - No teacher in two places at once
3. **Unique Schedules** - Each section gets different timetable
4. **Constraint Solving** - Respects subject hours and teacher availability

### Generation Process

```javascript
1. Fetch all sections for the course
2. Initialize shared teacher schedule (empty)
3. For each section:
   a. Fetch subjects and available teachers
   b. Create time slots (Mon-Fri, 9:00-16:00)
   c. Assign subjects to slots
   d. Check teacher availability in shared schedule
   e. Update shared schedule when teacher assigned
   f. Save timetable to database
4. Return success with all generated timetables
```

### Time Slots

- **Days**: Monday to Friday
- **Hours**: 9:00 AM to 4:00 PM
- **Slot Duration**: 1 hour
- **Total Slots**: 35 per week (5 days × 7 hours)

### Conflict Resolution

**Teacher Availability Check:**
```javascript
const isTeacherAvailable = (teacher, day, time, sharedSchedule) => {
  return !sharedSchedule.some(entry => 
    entry.teacher === teacher &&
    entry.day === day &&
    entry.time === time
  );
};
```

### PDF Generation

- Professional formatting with headers
- Course and section information
- Day-wise schedule table
- Teacher assignments
- Page breaks for multiple sections
- Footer with generation date

---

## API Reference

### Authentication Endpoints

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "user",
  "studentId": "STU001"
}

Response: { _id, name, email, role, token }
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response: { _id, name, email, role, token }
```

**Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { _id, name, email, role, studentId }
```

### Chat Endpoints

**Send Query**
```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "What are the BCA fees?"
}

Response: { response: "The annual tuition fee for..." }
```

### Course Endpoints

**Get All Courses**
```http
GET /api/courses

Response: [{ _id, name, code, description, duration, fees, category }]
```

**Get Single Course**
```http
GET /api/courses/:id

Response: { _id, name, code, description, duration, fees, category }
```

### Timetable Endpoints

**Generate Timetable (Admin Only)**
```http
POST /api/timetable/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "course_object_id"
}

Response: { message, timetables: [...] }
```

**Get Timetable**
```http
GET /api/timetable/:classId
Authorization: Bearer <token>

Response: { _id, class, schedule: [...] }
```

**Download PDF**
```http
GET /api/timetable/:classId/pdf
Authorization: Bearer <token>

Response: PDF file download
```

### Admin Endpoints (Admin Only)

All admin endpoints require `Authorization: Bearer <token>` and admin role.

**Courses**
```http
GET    /api/admin/courses
POST   /api/admin/courses
PUT    /api/admin/courses/:id
DELETE /api/admin/courses/:id
```

**Subjects**
```http
GET    /api/admin/subjects
POST   /api/admin/subjects
PUT    /api/admin/subjects/:id
DELETE /api/admin/subjects/:id
```

**Teachers**
```http
GET    /api/admin/teachers
POST   /api/admin/teachers
PUT    /api/admin/teachers/:id
DELETE /api/admin/teachers/:id
```

**Classes**
```http
GET    /api/admin/classes
POST   /api/admin/classes
PUT    /api/admin/classes/:id
DELETE /api/admin/classes/:id
```

**Knowledge Base**
```http
GET    /api/admin/knowledge
POST   /api/admin/knowledge
PUT    /api/admin/knowledge/:id
DELETE /api/admin/knowledge/:id
```

---

## Database Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (default: 'user', enum: ['user', 'admin']),
  studentId: String (optional),
  createdAt: Date
}
```

### Course
```javascript
{
  name: String (required),
  code: String (required, unique),
  description: String,
  duration: String,
  fees: Number,
  category: String (enum: ['undergraduate', 'postgraduate', 'diploma', 'certificate'])
}
```

### Subject
```javascript
{
  name: String (required),
  code: String (required, unique),
  hoursPerWeek: Number (default: 4)
}
```

### Teacher
```javascript
{
  name: String (required),
  email: String (required, unique),
  subjects: [ObjectId] (ref: 'Subject')
}
```

### Class
```javascript
{
  course: ObjectId (ref: 'Course', required),
  section: String (required),
  semester: Number (required),
  subjects: [ObjectId] (ref: 'Subject')
}
```

### Timetable
```javascript
{
  class: ObjectId (ref: 'Class', required),
  schedule: [{
    day: String,
    time: String,
    subject: ObjectId (ref: 'Subject'),
    teacher: ObjectId (ref: 'Teacher')
  }],
  createdAt: Date
}
```

### KnowledgeBase
```javascript
{
  question: String (required),
  answer: String (required),
  category: String,
  keywords: [String]
}
```

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running
- Check MONGODB_URI in backend/.env
- Verify MongoDB port (default: 27017)

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change PORT in backend/.env
- Or kill the process: `npx kill-port 5000`

### JWT Authentication Error
```
Error: jwt malformed
```
**Solution:**
- Ensure JWT_SECRET is set in backend/.env
- Clear localStorage and login again
- Check token format in Authorization header

### 401 Unauthorized
**Solution:**
- Login again (token may have expired)
- Check if user has correct role for admin routes
- Verify token is being sent in requests

### CORS Issues
**Solution:**
- Backend already has CORS enabled
- Check axios baseURL in frontend/src/utils/axios.js
- Ensure it points to http://localhost:5000

### Timetable Shows Empty
**Solution:**
1. Go to Admin Panel
2. Navigate to "Generate Timetable" tab
3. Click "Generate All Sections" for the course
4. Refresh timetable view

### Login Says "Invalid Credentials"
**Solution:**
- Ensure you registered first
- Check email and password are correct
- Verify backend is running
- Check browser console for errors

### PDF Download Not Working
**Solution:**
- Ensure timetable is generated first
- Check browser console for errors
- Verify backend is running
- Try different browser if issue persists

---

## Development Guide

### Adding New Features

**1. Add New API Endpoint**
```javascript
// backend/routes/newRoutes.js
router.get('/new-endpoint', protect, controller);

// backend/server.js
app.use('/api/new', require('./routes/newRoutes'));
```

**2. Add New Model**
```javascript
// backend/models/NewModel.js
const mongoose = require('mongoose');
const schema = new mongoose.Schema({...});
module.exports = mongoose.model('NewModel', schema);
```

**3. Add New Frontend Component**
```javascript
// frontend/src/components/NewComponent.js
import { useState, useEffect } from 'react';
import axios from '../utils/axios';

function NewComponent() {
  // Component logic
}
export default NewComponent;
```

### Testing

**Backend Testing:**
```bash
cd backend
node scripts/testTimetable.js
node scripts/testChatbot.js
```

**API Testing with curl:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get courses (with token)
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer <your_token>"
```

### Database Scripts

**Seed Database:**
```bash
cd backend
node scripts/seedData.js
```

**Clear Timetables:**
```bash
cd backend
node scripts/clearTimetables.js
```

**Generate All Timetables:**
```bash
cd backend
node scripts/generateAllTimetables.js
```

---

## Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/college-helpdesk

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
```

### Frontend
No environment variables needed. API URL is configured in `src/utils/axios.js`:
```javascript
baseURL: 'http://localhost:5000'
```

---

## Security Best Practices

### Current Implementation
✅ Password hashing with bcrypt
✅ JWT token authentication
✅ Role-based access control
✅ Protected API routes
✅ CORS enabled
✅ Environment variables for secrets

### Production Recommendations
- Use HTTPS only
- Implement rate limiting
- Add refresh tokens
- Use secure cookies instead of localStorage
- Implement CSRF protection
- Add input validation and sanitization
- Set up monitoring and logging
- Use strong JWT_SECRET (32+ characters)
- Implement password strength requirements
- Add email verification
- Enable 2FA for admin accounts

---

## Performance Optimization

### Current Optimizations
- MongoDB indexes on frequently queried fields
- Axios interceptors for automatic token handling
- React Context API for theme state
- CSS variables for efficient theming

### Future Improvements
- Implement caching for course data
- Add pagination for large datasets
- Optimize timetable generation algorithm
- Use Redis for session management
- Implement lazy loading for components
- Add service workers for offline support

---

## Deployment Guide

### Backend Deployment (Heroku/Railway)

1. Set environment variables
2. Update MONGODB_URI to cloud MongoDB (Atlas)
3. Deploy backend
4. Note the backend URL

### Frontend Deployment (Vercel/Netlify)

1. Update axios baseURL to backend URL
2. Build: `npm run build`
3. Deploy build folder

### MongoDB Atlas Setup

1. Create cluster at mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update MONGODB_URI in backend

---

## Future Enhancements

### Authentication
- Password reset via email
- Email verification
- Refresh tokens
- OAuth integration (Google, Microsoft)
- 2FA for admin accounts

### Chatbot
- Natural language processing with AI (OpenAI, Gemini)
- Multi-language support
- Voice input/output
- Chat history
- File upload support

### Timetable
- Drag-and-drop schedule editing
- Room allocation
- Break time management
- Exam schedule generation
- Calendar integration (Google Calendar, Outlook)

### General
- Real-time notifications
- Email notifications
- Mobile app (React Native)
- Analytics dashboard
- Attendance tracking
- Grade management
- Fee payment integration

---

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check backend logs
4. Verify MongoDB connection
5. Ensure all dependencies are installed

---

**Last Updated:** March 2026
**Version:** 1.0.0

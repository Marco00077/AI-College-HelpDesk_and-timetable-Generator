# 🎓 College Helpdesk System

A modern full-stack web application for college management featuring an intelligent chatbot, automated timetable generation, and comprehensive course management.

## ✨ Features

- 🔐 JWT Authentication with role-based access control
- 💬 Intelligent chatbot for student queries with real-time database integration
- 📚 Course management with fees in Indian Rupees (₹)
- 📅 Automated timetable generation with conflict resolution
- 📄 PDF export for timetables
- 🎨 Modern UI with dark/light theme support
- 👥 Admin panel for complete system management

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
npm run install-all
```

2. **Configure backend environment**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-helpdesk
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

3. **Start MongoDB**
- Windows: Start MongoDB service from Services
- Mac/Linux: `sudo systemctl start mongod`

4. **Seed database with sample data**
```bash
cd backend
node scripts/seedData.js
```

5. **Run the application**
```bash
# From root directory
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 🎯 First Time Usage

### Register Your Account
1. Open http://localhost:3000
2. Click "Create Account"
3. Fill in your details
4. Select role: **Admin** or **Student**
5. Click "Create Account"

### Explore Features

**For Students:**
- 💬 Chat with the bot about courses, fees, and admissions
- 📚 Browse available courses
- 📅 View class timetables
- 📄 Download timetable PDFs

**For Admins:**
- ⚙️ Access admin panel
- ➕ Add/edit courses, subjects, teachers, and classes
- 🔄 Generate timetables for all sections
- 📊 Manage chatbot knowledge base

## 🏗️ Tech Stack

### Frontend
- React.js
- Axios for API calls
- Context API for theme management
- Modern CSS with CSS variables

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- PDFKit for PDF generation

## 📁 Project Structure

```
college-helpdesk/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   ├── utils/       # Axios config
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── README.md
├── DOCUMENTATION.md
└── package.json
```

## 🔑 Key Features Explained

### Authentication System
- JWT-based authentication with 30-day token expiration
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (Admin/Student)
- Automatic token handling with axios interceptors
- Session cleared on app restart for security

### Chatbot
- Real-time database integration
- Automatically knows about new courses added by admin
- Supports queries about fees, duration, and course details
- Displays fees in Indian Rupees (₹) with proper formatting
- Smart course code matching (BCA, CSE, MCA, etc.)

### Timetable Generation
- Generates unique timetables for each section
- Prevents teacher conflicts across sections
- Constraint-based scheduling algorithm
- Supports multiple sections per course
- PDF export with professional formatting

### Course Management
- Organized by Course → Section → Subjects
- Fees in Indian Rupees
- Categories: Undergraduate, Postgraduate, Diploma, Certificate
- Admin can add/edit/delete courses through UI

## 🎨 UI Features

- Modern gradient design with purple theme
- Dark/light mode toggle
- Smooth animations and transitions
- Responsive design for mobile devices
- Glass-morphism effects
- Custom SVG logo and icons

## 📚 Available Scripts

```bash
# Install all dependencies (root, backend, frontend)
npm run install-all

# Run both frontend and backend concurrently
npm run dev

# Seed database with sample data
npm run seed

# Backend only
cd backend && npm start

# Frontend only
cd frontend && npm start
```

## 🔒 Security Features

- Passwords never stored in plain text
- JWT tokens with expiration
- Protected API routes
- Role-based authorization
- CORS enabled
- Environment variables for sensitive data

## 📖 Documentation

For detailed technical documentation, API references, and troubleshooting, see [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🤝 Contributing

This is a college project. Feel free to fork and modify for your needs.

## 📝 License

MIT License - Feel free to use this project for educational purposes.

---

**Made with ❤️ for college students**

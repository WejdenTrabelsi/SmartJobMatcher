# 💼 SmartJobMatcher

> **AI-powered Job & Skill Matching Platform**  
> Connecting candidates and recruiters through intelligent job recommendations.

---

## 🧠 Overview

**SmartJobMatcher** is a full-stack web application that leverages **Natural Language Processing (NLP)** to analyze job descriptions and candidate profiles.  
It automatically matches candidates with relevant job postings based on their skills, experience, and keywords.

This project demonstrates practical use of **React**, **Node.js**, **Express**, and **MongoDB**, combined with **AI-driven text analysis**.

---

## 🚀 Features

- 👥 **Dual Authentication:** Separate dashboards for Candidates and Recruiters  
- 🧠 **AI Matching Engine:** Uses NLP libraries (`natural`, `compromise`) for semantic analysis  
- 💬 **Smart Job Suggestions:** Recommends the best matches based on skills similarity  
- 📁 **Resume Upload:** Parses and extracts skills for better profile matching  
- 🔍 **Advanced Filtering:** Search jobs by title, required skills, or experience level  
- 🌐 **Full MERN Stack Integration:** Seamless connection between frontend and backend  

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Vite, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **AI/NLP** | Compromise, Natural |
| **Auth** | JWT, bcryptjs |
| **File Uploads** | Multer |

---

## 🗄️ Database Structure (MongoDB Collections)

- **users** → candidate & recruiter profiles  
- **jobs** → job postings with descriptions and requirements  
- **applications** → links candidates to jobs  
- **skills** → extracted or suggested skills  

---

## ⚙️ Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/smart-job-matcher.git
cd smart-job-matcher
```

### 2️⃣ Install Dependencies
```bash
# Frontend
cd smart-job-matcher
npm install

# Backend
cd backend
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file inside the `backend` folder:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4️⃣ Run the Application
```bash
# Start the Backend Server
cd backend
npm run dev

# Start the Frontend App
cd ../
npm run dev
```

The app will run on:  
🌐 **Frontend:** http://localhost:5173  
🧩 **Backend API:** http://localhost:5000

---

## 🧩 Folder Structure
```
SmartJobMatcher/
│
├── backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── scripts/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.jsx
│
└── README.md
```

---

## 🧠 Future Improvements

- 🤖 Integrate a chatbot assistant for interview prep or skill suggestions  
- 📝 Add AI-based resume analysis and auto-tagging  
- 🔔 Implement real-time notifications for new job matches  
- 📊 Add an admin dashboard for platform analytics  

---

## 👩‍💻 Author

**Wejden Trabelsi**  
📧 trabelsiwejden911@gmail.com  
🔗 [LinkedIn]([https://linkedin.com](https://www.linkedin.com/in/trabelsi-wejden-29b847259/)) | [GitHub]([https://github.com)](https://github.com/WejdenTrabelsi).

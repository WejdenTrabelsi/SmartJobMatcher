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

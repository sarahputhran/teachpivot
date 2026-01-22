# TeachPivot

**Just-in-time classroom execution support for government school teachers**

🚀 **Hackathon Build • January 2026**

---

## 📋 Overview

TeachPivot is a decision support system for government school teachers designed to help anticipate and recover from common classroom breakdowns **before and after a lesson**.

It focuses **exclusively on lesson execution**, not lesson planning, content delivery, or evaluation, and provides structured, context-aware guidance that respects real classroom constraints.

**Core philosophy:**  
Teacher support should arrive *when it’s needed*, not only during scheduled training or visits.

---

## 🚀 Getting Started
**Prerequisites**

Node.js (v18 or higher) needs to be downloaded — https://nodejs.org
### Do the following in Bash Terminal:
### 1. Clone the repository
```bash
git clone https://github.com/sarahputhran/teachpivot.git
cd teachpivot
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev # Run the backend
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev # Run the frontend
```
---

## 🎯 Problem Statement

Public education systems typically support teachers through:

- Periodic visits (CRP/ARP) that miss daily classroom realities  
- Short trainings disconnected from specific classroom moments  
- Generic feedback that arrives too late to help  

**Result:**  
Teachers know *what* to teach, but struggle with *how lessons actually unfold*: prerequisite gaps, mixed pace classrooms, language barriers, and activity chaos.

When breakdowns occur, support systems are silent.

TeachPivot bridges this gap with **just-in-time, context-aware execution support** without requiring live classroom intervention.

---

## 🧭 Design Principles (Non-Negotiable)

| Principle | Why It Matters |
|---------|----------------|
| No live classroom usage | Maintains classroom flow; avoids teacher distraction |
| No chatbot / free-text input | Fast interaction (<30s); low cognitive load |
| Structured inputs only | Clean data, predictable patterns, scalable learning |
| No teacher evaluation | Builds trust; removes performance anxiety |
| No student data collection | Privacy by design; ethical foundation |
| Teacher agency preserved | AI supports the teacher; does not replace authority |

---

## ✅ What TeachPivot Is & Is Not

### TeachPivot **Is**
- 🛡️ Pre-class preparation tool to anticipate breakdowns  
- 🔄 Post-class reflection tool to improve future execution  
- 🧩 Pattern-based decision support system  
- 🌱 Collective learning system via anonymized feedback  

### TeachPivot **Is Not**
- 🤖 A chatbot or conversational AI  
- 🎥 A live classroom assistant or surveillance tool  
- 📝 A lesson planner or content repository  
- 📊 A teacher evaluation system  
- 👥 A student analytics platform  

---

## 🃏 Core Feature: Prep Cards

Prep Cards are the **atomic unit** of TeachPivot.

Each card is tightly scoped to:

### Context
- Grade: 3 or 4  
- Subject: Mathematics or EVS  
- One NCERT-aligned chapter  
- One classroom situation  

### Content (Exactly 4 Blocks)
1. **What Is Breaking**  
   The specific classroom failure point  
2. **Early Warning Signs**  
   Observable signals teachers can spot early  
3. **Action (If Lost)**  
   Concrete steps for remedial understanding  
4. **Action (If Bored)**  
   Strategies to recover student engagement  

Language is **classroom-ready and execution-focused** and no pedagogy lectures.

---

## 🎯 Classroom Situations Model

Each chapter defines **exactly nine situations**.

### Fixed Situations (6 per chapter)

1. Prerequisite Gap  
2. Conceptual Gap  
3. Can’t Visualize  
4. Mixed Pace Classroom  
5. Language Not Understood  
6. Activity Chaos  

### Chapter-Specific Situations (3 per chapter)

- Derived from DIKSHA teacher training resources  
- Based on documented misconceptions  
- Unique per chapter but fixed in number  

This structure ensures **clean, analyzable data** and avoids ambiguity.

---

## 🔒 Hackathon Scope (Intentional Constraints)

| Scope | Details |
|------|--------|
| Grades | 3 & 4 |
| Subjects | Mathematics, EVS (The World Around Us) |
| Curriculum | NCERT aligned |
| Coverage | First 5 chapters per subject per grade |
| Language | English (with classroom-ready vernacular adaptations) |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS  
- **Backend:** Node.js, Express.js (REST API)  
- **Database:** MongoDB + Mongoose  
- **Deployment:** Vercel (Frontend), Railway/Render (Backend)

---

## 📁 Project Structure
```
teachpivot/
├── frontend/
│   ├── src/
│   │   ├── components/        # PrepCards, layouts, UI blocks
│   │   ├── pages/             # Dashboard, ChapterView, PrepView
│   │   ├── services/          # API layer (Axios)
│   │   ├── hooks/             # Custom React hooks
│   │   └── main.jsx           # React entry point
│   ├── public/                # Static assets
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/            # REST API routes
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Mongoose schemas
│   │   ├── seed/              # Pedagogical data seeding
│   │   └── app.js             # Express app config
│   ├── server.js              # Backend entry point
│   └── package.json
│
└── README.md
```

---

## 🤖 Role of AI

AI in TeachPivot is **intentionally bounded** and used strictly for decision support and system-level learning, not authority or evaluation.

### What AI Does
- **Pattern Matching:** Maps classroom situations to the most relevant Prep Cards.
- **Trend Analysis:** Identifies recurring challenges across chapters (e.g., repeated “Activity Chaos” in a district).
- **Relevance Weighting:** Boosts Prep Cards that teachers mark as *high impact* during post-class reflection.

### What AI Does Not Do
- Generate pedagogical or instructional content autonomously  
- Evaluate or rank teachers  
- Operate during live classroom instruction  
- Interact with students or collect student data  

---

## 📄 License

This project is licensed under the **MIT License**.

Built for the **2026 Education Innovation Hackathon**.

---

## 💡 Why This Matters

Effective teaching knowledge exists, but it is often trapped in individual experience, isolated classroom visits, or theoretical training.

TeachPivot makes **tacit classroom execution knowledge visible, shareable, and actionable** without judgment, surveillance, or classroom disruption.

**Proof of concept • January 2026**  
Feedback and collaboration are welcome.

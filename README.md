# TeachPivot 🎓

> **Teaching guidance that respects your students.** A privacy-first Progressive Web App that helps teachers find effective approaches to common teaching challenges—powered by peer insights, zero surveillance.

---

## 🎯 What is TeachPivot?

**In 30 seconds:**  
Before class, teachers tap: subject → grade → topic → challenge  
They get a card showing what usually helps, including peer insights  
After class, they share what worked (anonymously)  
The system learns and improves guidance for all teachers  

**No accounts. No tracking. No student data. Just teaching.**

---

## ✨ Key Features

- 🔒 **Privacy by Design** — Anonymized immediately, zero user tracking
- 📱 **PWA** — Installable, works offline, syncs when online
- 🌍 **Multilingual** — English & Spanish built-in, easily extensible
- 📊 **CRP Insights** — Dashboard for school planning & teacher coaching
- 💬 **Peer Learning** — Real advice from teachers who've tried it
- ⚡ **Lightweight** — Fast on low-bandwidth, government-school devices
- 🔧 **Deployable** — Self-hosted or cloud, no vendor lock-in

---

## 🚀 Quick Start

### Fastest: Docker
```bash
docker-compose up
# Then: http://localhost:5173
```

### Or: Local
```bash
# Backend
cd backend && npm install && node src/data/seedData.js && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
# Then: http://localhost:5173
```

### Or: Cloud
Deploy `backend/` to Heroku/Railway, `frontend/` to Vercel/Netlify, `MongoDB` to Atlas.

**Full setup guide:** [docs/ARCHITECTURE_AND_SETUP.md](docs/ARCHITECTURE_AND_SETUP.md)

---

## 📁 What's Inside

```
teachpivot/
├── backend/              # Express.js + MongoDB API
├── frontend/             # React + Vite + PWA
├── docs/
│   ├── ARCHITECTURE_AND_SETUP.md   # Complete tech spec
│   ├── DEVELOPER_GUIDE.md          # How to contribute
│   └── GRANT_PROPOSAL.md           # For funding/pilots
├── SETUP.md              # Installation guide
└── README.md             # This file
```

---

## 🎬 How It Works

### Teacher Flow
```
1. Open app → Select language & role (teacher)
2. Tap subject (Maths), grade (8), topic (Fractions)
3. Tap challenge: "Students can't visualize"
4. Read card:
   - Why this happens
   - Warning signs
   - If lost → try these strategies
   - If bored → try these strategies
   - "4 teachers found starting with concrete models helped"
5. Go teach
6. Return later → "How did it go?" → Select outcome
7. Card gets smarter
```

### CRP/School Flow
```
1. Open app → Select language & role (CRP)
2. View dashboard:
   - Topic heatmap (where students struggle)
   - Situation clusters (what challenges matter most)
   - Trends (improving/declining)
3. Use for school planning, teacher coaching, visit prep
```

### Data Flow
```
Teacher reflection → MongoDB (anonymized) → Aggregation engine
                                                    ↓
                                            Card success rate updated
                                            CRP dashboard updated
                                            Peer count updated
```

**Privacy guarantee:** No student IDs, no teacher IDs, no email, no name—ever.

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite | Fast builds, Vite PWA plugin |
| **Styling** | Tailwind CSS | Utility-first, mobile-ready |
| **i18n** | i18next | Works offline, no external APIs |
| **Backend** | Node.js + Express | Minimal, lightweight |
| **Database** | MongoDB | Flexible schema, aggregation pipelines |
| **Hosting** | Any cloud (AWS, GCP, local) | School choice |
| **PWA** | Vite PWA + Service Worker | Offline-first, installable |

---

## 📊 Flows (MVP Complete)

✅ **Entry** — Language + role selection + explainer  
✅ **Teacher Context** — Subject / Grade / Topic (tap-only, no search)  
✅ **Situation** — 6 common teaching challenges  
✅ **Prep Card** — Single scrollable card with advice  
✅ **Post-Reflection** — Outcome (worked/partial/no) + reason (optional)  
✅ **CRP Dashboard** — Heatmap + clusters + filters  
✅ **Multilingual** — EN + ES (add more in i18n.js)  
✅ **Offline** — PWA, caching, sync when online  
✅ **Privacy** — Anonymized by design, no user tracking  

---

## 🌍 Curriculum Support

**Currently seeded:** Maths Grades 8-10, fractions (sample data)

**To add your curriculum:**

1. Edit `backend/src/data/seedData.js`
2. Add subjects, grades, topics, prep cards
3. Run: `node src/data/seedData.js`
4. Update frontend if needed

---

## 📱 Browser Support

- **Desktop:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile:** iOS 12+, Android 6+ (Chrome, Firefox)
- **Works offline:** After first visit (PWA service worker)

---

## 🔒 Privacy & Security

### By Design
✅ No user accounts (anonymous by default)  
✅ No sessions (no tracking across visits)  
✅ No student data (only teacher reflections)  
✅ No individual profiling (document-based, not relational)  
✅ No push notifications (no background monitoring)  
✅ No third-party integrations (no analytics, no ads)  

### Data Storage
```javascript
// ✅ What we store:
{ subject: "Maths", grade: 8, topicId: "fractions", outcome: "worked" }

// ❌ What we NEVER store:
{ userId: "teacher_123", schoolId: "school_456", email: "..." }
```

### Compliance
- ✅ GDPR-ready (no personal data)
- ✅ COPPA-compliant (no student tracking)
- ✅ Open-source (code review-able)
- ✅ Deployable on-premise (full control)

---

## 💡 Philosophy

**Low cognitive load**  
→ Tap, don't type. No friction.

**No surveillance**  
→ Privacy is enforced, not optional.

**Pattern learning**  
→ Wisdom from the crowd, not algorithms.

**Scales quietly**  
→ Stateless backend, horizontal scaling.

**Trust by design**  
→ No user tracking = teachers share honestly.

---

## 🚀 Next Steps

### For Teachers
1. Try it: http://localhost:5173
2. Go through the flows
3. Submit feedback: Share what was helpful, what wasn't

### For Schools/CRPs
1. Deploy (local or cloud)
2. Customize curriculum with your topics
3. Share link with teachers
4. Monitor dashboard for insights

### For Developers
1. Read [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
2. Extend with more languages, situations, prep cards
3. Contribute back (PRs welcome)
4. Deploy improvements

### For Researchers
1. Run pilot with your school network
2. Measure adoption, satisfaction, student outcomes
3. Publish findings
4. Help improve the system

---

## 📈 Roadmap

### Phase 1: MVP (Complete ✅)
- Entry, context, situation, prep card, reflection
- CRP dashboard
- Multilingual (EN, ES)
- PWA offline support

### Phase 2: Growth (Next)
- Advanced pattern engine
- More languages (Hindi, regional)
- Teacher-specific insights
- Mobile apps (iOS/Android)
- Integration with LMS

### Phase 3: Impact (Year 2)
- Community-contributed curriculum
- CRP certification program
- Research partnerships
- OER license + sustainability

---

## 🤝 Contributing

**Want to help?**

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

**Areas needing help:**
- 🌍 Translations (more languages)
- 📚 Curriculum (more subjects/topics)
- 💬 Peer insights (help curate what works)
- 🐛 Bug reports & fixes
- 📖 Documentation

---

## 🏫 Pilots & Case Studies

TeachPivot is designed for government schools and education nonprofits.

**Interested in a pilot?**
1. Review [docs/GRANT_PROPOSAL.md](docs/GRANT_PROPOSAL.md)
2. Email: [your-email@example.com]
3. Schedule a demo

---

## 📝 License

[Your License - e.g., MIT, Apache 2.0, or OER Commons]

---

## 🙏 Acknowledgments

Built with 💚 for teachers.  
Inspired by peer learning, privacy-first design, and a belief that teaching can be better supported.

---

## 📞 Support

**Questions?**
- 📖 Read the docs: [docs/](docs/)
- 💬 Open an issue
- 📧 Email: [your-email]

**Found a bug?**
- 🐛 File an issue with details
- 📸 Include screenshots if helpful
- 🔍 Check existing issues first

---

## 🌟 Stats

- **Lines of Code:** ~3,500 (lean)
- **Database Collections:** 4 (minimal)
- **API Endpoints:** 8 (focused)
- **React Components:** 8 (composable)
- **Languages:** 2 (extensible)
- **Files:** ~25 core files (organized)

---

**TeachPivot MVP v0.1.0**  
Built January 2026  
Status: Ready for pilot testing  

---

<div align="center">

### Teaching is hard. Peer learning makes it better.

[Get Started](docs/ARCHITECTURE_AND_SETUP.md) • [Developer Guide](docs/DEVELOPER_GUIDE.md) • [Grant Proposal](docs/GRANT_PROPOSAL.md)

</div>

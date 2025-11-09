# EZ Labs Front-End Intern Assignment

Built using **React (Vite)** and **Tailwind CSS**.

## 🚀 Features
- Fully responsive single-page design
- Custom cursor, scroll animations, and parallax effects
- Integrated Contact Form with real API (https://vernanbackend.ezlab.in/api/contact-us/)
- Validation and loading states
- Deployed via Vercel

## 🛠️ Tech Stack
- React + Vite
- Tailwind CSS
- Lucide Icons

## 📦 Run Locally

```bash
npm install
npm run dev
```

Then open: [http://localhost:5173](http://localhost:5173)

---

**API Endpoint:**
`POST https://vernanbackend.ezlab.in/api/contact-us/`

```json
{
  "name": "Test User",
  "email": "testuser@gmail.com",
  "phone": "908765498",
  "message": "This is a message"
}
```
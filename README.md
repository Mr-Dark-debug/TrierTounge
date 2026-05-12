# TRIERTONGUE 👅

**TrierTongue** is a neo-brutalist language exchange platform exclusively designed for students at the **University of Trier**. It facilitates reciprocal language learning by pairing native speakers with students eager to master new languages, all within a secure, campus-focused environment.

## 🚀 Key Features

- **Reciprocal Matching**: An AI-powered system that pairs you with partners who need the language you speak and can teach you the language you want.
- **Campus-Centric Discovery**: Filter by major, study year, and campus (Campus I or II).
- **Smart Practice Rooms**: In-app practice calls featuring AI-generated conversation starters tailored to your academic and social goals.
- **Availability Heatmaps**: Find overlapping free time for Mensa or Library meetups.
- **Multilingual Support**: Available in English, Deutsch, Español, and Français.
- **Neo-Brutalist UI**: A high-contrast, bold, and modern interface optimized for all devices.

## 🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Backend/Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **AI/GenAI**: [Google Genkit](https://firebase.google.com/docs/genkit) (Gemini 1.5 Flash)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

- `src/app`: Next.js routes and pages.
- `src/components`: Reusable UI components (Dashboard, Onboarding, Landing).
- `src/firebase`: Firebase configuration, hooks, and providers.
- `src/ai`: Genkit flows for AI compatibility analysis and conversation starters.
- `src/context`: React contexts (Language, etc.).
- `src/lib`: Data constants (Trier faculties, dorms) and utility functions.

## 🔒 Security & Privacy

TrierTongue is designed with student safety in mind. Social media handles (Instagram/Telegram) are **only** revealed after a mutual match is accepted. We encourage the use of university email addresses to maintain a verified campus community.

## 🏫 For Administration

We are actively seeking integration with the University of Trier's official LDAP/SSO systems. See the `/pitch` page for our integration proposal.

---
*Created with 🖤 for the Trier University Community.*
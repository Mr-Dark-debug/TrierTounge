
# TRIERTONGUE 👅

**TrierTongue** is a high-contrast, neo-brutalist language exchange platform designed exclusively for students at the **University of Trier**. It bridges the gap between domestic and international students through reciprocal matching and smart campus integration.

---
<img width="1919" height="927" alt="image" src="https://github.com/user-attachments/assets/0f0e6695-0f33-4f06-90c1-58ef71ee5444" />


## 🚀 Key Features

### 1. Reciprocal Matching (Powered by Genkit)
- **AI Compatibility Analysis**: Analyzes student profiles to find the best match based on academic and social goals.
- **Mutual Acceptance**: Privacy first. Social media handles (Instagram/Telegram) are only revealed after both parties accept the match.

### 2. Hyper-Local Campus Integration
- **Trier Specific Data**: Built-in support for all 6 faculties, official departments, and student dorms (Studierendenwerk & private).
- **Campus Hotspots**: Specific meeting suggestions for **BibTop** (Campus I Library), **Geozentrum** (Campus II), and various local Mensas.
- **Availability Heatmaps**: Find overlapping free time specifically for library or dining hall sessions.

### 3. Smart Practice Rooms
- **In-App Practice Calls**: High-performance UI for virtual practice.
- **AI Ice Breakers**: Genkit-powered conversation starters generated based on the participants' shared academic subjects and personal hobbies.

### 4. Safety & Exclusivity
- **Verified Access**: Restricted to `@uni-trier.de` or `@studierende.uni-trier.de` email addresses.
- **Safe meeting spots**: Emphasis on public, well-lit campus areas.

## 🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom Neo-Brutalist design system.
- **Backend**: [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Authentication](https://firebase.google.com/docs/auth).
- **AI**: [Google Genkit](https://firebase.google.com/docs/genkit) using Gemini 1.5 Flash for matching and content generation.
- **Localization**: Full English, German, Spanish, and French support.

## 📂 Project Structure

- `src/app`: Core application routes (Home, Call, Settings, Pitch).
- `src/components`: UI components organized by feature (Auth, Dashboard, Onboarding).
- `src/firebase`: Firebase configuration, hooks, and error management.
- `src/ai`: Genkit flows for matching analysis and ice breakers.
- `src/context`: React contexts for application state (Language, etc.).
- `src/lib`: Constants for Trier-specific university data and shared translations.

## 🏫 Administrative Integration

A dedicated `/pitch` page is available for the **Studierendenwerk** or **University Administration** to review integration proposals for SSO (LDAP/OIDC) and official campus data synchronization.

---
*Developed with ❤️ for the Trier University community.*

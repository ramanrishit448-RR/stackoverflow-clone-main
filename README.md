Code-Quest

## Elevance Skills Internship Project

This repository contains a full-stack StackOverflow clone, built and refined as part of the **Elevance Skills** internship program. It comprises a server-side API (Express & Node.js) and a client-side Next.js web application.

---

## 🚀 Tech Stack

### Backend

- **Core**: Node.js & Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Security & Authentication**: JWT (JSON Web Tokens) & Bcrypt.js
- **Environment Management**: Dotenv
- **Hot Reloading**: Nodemon

### Frontend

- **Framework**: Next.js 15 (Pages Router)
- **Styling**: TailwindCSS & Vanilla CSS
- **Components**: shadcn/ui components (Radix UI primitives)
- **HTTP client**: Axios
- **Notifications**: React Toastify
- **Icons**: Lucide React

---

## 🛠️ Project Structure

```
├── server/                 # Express Backend API
│   ├── controller/         # API logic (auth, question, answer, feed, admin, etc.)
│   ├── middleware/         # Custom Express middlewares (authentication, admin verification)
│   ├── models/             # Mongoose database schemas (User, Post, Question, Comment, Report)
│   ├── routes/             # Express routes defining API endpoints
│   ├── utils/              # Helper utilities (computations, notifications)
│   ├── index.js            # Express server entrypoint
│   └── package.json        # Backend dependencies & run scripts
│
└── stack/                  # Next.js Frontend Application
    ├── public/             # Static assets (images, logos)
    ├── src/
    │   ├── components/     # UI widgets (Navbar, Sidebar, CommentSection, PostCard, etc.)
    │   ├── hooks/          # Custom react hooks (e.g. useInfiniteFeed)
    │   ├── layout/         # General page layouts
    │   ├── lib/            # Shared libraries (AuthContext, Axios instances, custom utils)
    │   ├── pages/          # Next.js file-based router pages (auth, ask, feed, questions, users)
    │   └── styles/         # Global stylesheets (Tailwind imports, custom theme rules)
    ├── package.json        # Frontend dependencies & package config
    └── next.config.ts      # Next.js configurations
```

---

## 🌟 Key Features

1. **Authentication & User Management**:
   - Register a new account with custom profile attributes.
   - Login / Logout flow with persistent authentication using local storage.
   - Profile management where users can customize their display name, bio, and technical skills.

2. **Q&A System (StackOverflow Engine)**:
   - Ask public questions with formatting, title, body, and up to 5 tag badges.
   - View, upvote, downvote questions, and bookmark them for reading later.
   - Post answers to existing questions.
   - Delete own questions and answers.

3. **Community Feed (Social Network Hub)**:
   - Post updates, achievements (with specialized layouts), image cards, code snippets, or project showcases.
   - Infinite scroll feed loaded dynamically using an `IntersectionObserver` sentinel.
   - Interactive feeds partitioned by: **For You**, **Following**, and **Trending**.
   - Likes, comments, sub-replies, and link sharing.
   - User-to-user tagging via `@username` mentions (triggers notifications).

4. **Follow System**:
   - Follow and unfollow community developers.
   - Live updates to follower and following counts.
   - Curated feed focusing exclusively on followed authors.

5. **Notification System**:
   - Live polling for unread actions.
   - Notifications triggered when another user follows you, comments on, likes, shares, or reports your post.

6. **Admin Moderation Portal**:
   - Access-controlled dashboards for admin roles.
   - Review reported posts with tools to dismiss reports, remove inappropriate content, or suspend offenders.

7. **Mobile-first responsive UI**:
   - Responsive layouts for mobile and tablet screens.
   - Sidebar navigation switches to a slide-in menu on smaller viewports.
   - Homepage includes mobile-friendly cards for feature discovery.

8. **Chat & Challenges experience**:
   - Added a `Chat` page for quick community support and conversational help.
   - Added a `Challenges` page for practice tasks, learning prompts, and badge-style challenges.
   - Homepage cards highlight chat and challenge experiences.

9. **Chat & Challenges experience**:
   - New `Chat` page for quick support, code help, and conversational guidance.
   - New `Challenges` page to explore practice tasks with badges and step-by-step prompts.

---

## ⚙️ How to Run Locally

### Prerequisites

- Node.js installed on your machine.
- MongoDB Server running locally on standard port `27017` (or configured via environment variables).

### 1. Setup Backend

```bash
cd server
npm install
npm start
```

Make sure `.env` is configured (defaults are provided in the folder).

### 2. Setup Frontend

```bash
cd ../stack
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your web browser.

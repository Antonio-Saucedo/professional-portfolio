# Antonio Saucedo — Professional Portfolio

A personal portfolio built to showcase my projects, skills, and experience as a software engineer. Live
at [antoniosoftwareengineer.com](https://antoniosoftwareengineer.com).

---

## Features

- **AI Cover Letter Generator** — powered by Gemini 2.5 Flash, generates tailored cover letters from a job description,
  candidate info, and tone preference
- **Interactive Tic-Tac-Toe** — a CSE 210 console game running live in the browser via Pyodide, a real Python
  interpreter compiled to WebAssembly, with clickable input in place of the terminal
- **Light & dark mode** — system-aware theme with manual toggle
- **Contact form** — integrated with EmailJS for direct message delivery
- **Responsive design** — optimized for desktop and mobile
- **CI/CD** — automatic deploys to GitHub Pages via GitHub Actions on every push to `main`

---

## Architecture

The frontend is a static React/TypeScript/Vite app deployed to GitHub Pages. The Cover Letter Generator feature uses a
separate Node.js/Express backend proxy deployed to Render, which keeps the Gemini API key out of the browser entirely.

```
Browser (GitHub Pages)
       │
       ├── EmailJS (contact form — direct, no key exposure risk)
       │
       └── POST /generate-cover-letter
               │
       Express Proxy (Render)
               │
       Gemini API (Google)
```

**Why the proxy?** Calling the Gemini API directly from the frontend would expose the API key in the JavaScript bundle —
visible to anyone with DevTools open. The proxy receives the request, adds the key server-side from an environment
variable, and forwards it to Gemini. The key never reaches the browser.

---

The Tic-Tac-Toe feature is unrelated to this proxy setup — it's fully client-side. Pyodide loads from a CDN (jsDelivr)
the first time the modal's **Start** button is clicked, and the original CSE 210 game logic runs directly in the browser
via WebAssembly. No API key, no backend, nothing to configure.

---

## Tech Stack

| Layer              | Technology                         |
|--------------------|------------------------------------|
| Frontend           | React, TypeScript, Vite, SCSS      |
| In-browser Python  | Pyodide (WebAssembly)              |
| AI Backend         | Node.js, Express, TypeScript       |
| AI Model           | Gemini 2.5 Flash (`@google/genai`) |
| Contact            | EmailJS                            |
| Hosting (frontend) | GitHub Pages                       |
| Hosting (backend)  | Render                             |
| CI/CD              | GitHub Actions                     |

---

## Local Development

### Prerequisites

- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/apikey)
- An [EmailJS](https://emailjs.com) account

### Frontend

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your values in .env

# Start dev server
npm run dev
```

### Backend proxy

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Start dev server
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and expects the backend at `http://localhost:3001` (set via
`VITE_BACKEND_URL` in your root `.env`).

---

## Environment Variables

### Frontend (root `.env`)

| Variable                   | Description                                                                               |
|----------------------------|-------------------------------------------------------------------------------------------|
| `VITE_EMAILJS_SERVICE_ID`  | EmailJS service ID                                                                        |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID                                                                       |
| `VITE_EMAILJS_PUBLIC_KEY`  | EmailJS public key                                                                        |
| `VITE_BACKEND_URL`         | URL of the Express proxy (`http://localhost:3001` locally, your Render URL in production) |

### Backend (`server/.env`)

| Variable         | Description           |
|------------------|-----------------------|
| `GEMINI_API_KEY` | Google Gemini API key |

---

## Deployment

### Frontend (GitHub Pages)

Deployments are automated via `.github/workflows/deploy.yml`. Every push to `main` triggers a build and deploy. All
`VITE_*` environment variables must be added as GitHub Actions secrets in the repo settings.

### Backend (Render)

The `server/` folder is deployed as a separate Web Service on Render.

| Setting        | Value              |
|----------------|--------------------|
| Root Directory | `server`           |
| Build Command  | `npm install`      |
| Start Command  | `npx tsx index.ts` |

Set `GEMINI_API_KEY` as an environment variable in the Render dashboard. The server includes a `/ping` endpoint that the
frontend calls when the Cover Letter modal opens, warming the instance before the user submits the form.

---

## Dependency updates

Dependabot is configured (`.github/dependabot.yml`) to check weekly for npm package updates and GitHub Actions version
updates, opening up to 10 pull requests at a time.

`.github/workflows/ci.yml` runs `npm audit --audit-level=high` on every push and pull request against `main`, which
covers dependency vulnerabilities but does not currently lint, type-check, or build the project — a broken commit can
still reach `main` and get deployed. Worth keeping in mind when merging Dependabot PRs, since nothing currently blocks a
bad merge beyond the audit step.

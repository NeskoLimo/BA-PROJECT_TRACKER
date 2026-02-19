# ⬡ BA Project Tracker — Angular App

A futuristic, dark-mode **Project Status & Reporting Tool** built for Business Analysts.
Track projects, monitor risks, visualise portfolio health, and export reports — all in one place.

---

## ✦ Features

| Feature | Description |
|---|---|
| 📊 Dashboard | KPI cards, project table, at-risk alerts, upcoming milestones |
| 📁 Projects | Card view with add / edit / delete, filter by status & search |
| 📈 Reports | Status breakdown, priority matrix, full report table, risk register, print/export |
| 💾 Persistence | Data saved to browser localStorage — survives page refresh |
| 🎨 Design | Futuristic deep navy + electric blue — matches your PM portfolio |

---

## 🗂 Project Structure

```
ba-project-tracker/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── navbar/          ← Top navigation bar
│   │   │   ├── sidebar/         ← Left sidebar with portfolio health
│   │   │   ├── dashboard/       ← Main dashboard view
│   │   │   ├── projects/        ← Project cards + add/edit modal
│   │   │   └── reports/         ← Analytics & reporting view
│   │   ├── models/
│   │   │   └── project.model.ts ← TypeScript interfaces
│   │   ├── services/
│   │   │   └── project.service.ts ← Data management (signals)
│   │   ├── app.component.ts     ← Root shell component
│   │   ├── app.config.ts        ← App bootstrap config
│   │   └── app.routes.ts        ← Page routing
│   ├── styles.css               ← Global design system
│   ├── index.html               ← HTML entry point
│   └── main.ts                  ← Bootstrap entry
├── server.js                    ← Express server (for Render)
├── angular.json                 ← Angular build config
├── package.json                 ← Dependencies
├── render.yaml                  ← Render deployment config
├── tsconfig.json                ← TypeScript config
└── README.md
```

---

## 🚀 PART 1 — Setting Up Your Machine (First Time Only)

### Step 1 — Install Node.js

Angular requires Node.js. Download the **LTS version** from:
👉 [nodejs.org](https://nodejs.org)

After installing, verify it worked:
```bash
node --version    # Should show v18 or higher
npm --version     # Should show v9 or higher
```

### Step 2 — Install Angular CLI

The Angular CLI is a command-line tool that helps you run and build Angular apps.

```bash
npm install -g @angular/cli
```

Verify:
```bash
ng version
```

---

## 💻 PART 2 — Running the App Locally

### Step 1 — Extract the project

Unzip `ba-project-tracker.zip` somewhere on your computer, e.g. your Desktop.

### Step 2 — Open a terminal in that folder

**On Windows:** Right-click the folder → "Open in Terminal"
**On Mac:** Right-click the folder → "New Terminal at Folder"

### Step 3 — Install dependencies

```bash
npm install
```

This downloads all the libraries Angular needs. Takes 1–2 minutes. You only do this once.

### Step 4 — Start the app

```bash
npm start
```

You'll see output like:
```
✔ Compiled successfully.
Application bundle generation complete.
Local: http://localhost:4200
```

### Step 5 — Open in your browser

Go to 👉 **http://localhost:4200**

You should see the BA Project Tracker dashboard with 5 sample projects!

> **To stop the server:** Press `Ctrl + C` in the terminal.

---

## 🐙 PART 3 — Push to GitHub

### Step 1 — Create a GitHub account (if needed)
Sign up at [github.com](https://github.com)

### Step 2 — Create a new repository
1. Click the **+** button → **New repository**
2. Name it `ba-project-tracker`
3. Set to **Public** (required for free Render hosting)
4. **Do NOT** tick "Add a README" or anything else
5. Click **Create repository**

### Step 3 — Push your code

In your terminal (in the project folder):

```bash
git init
git add .
git commit -m "Initial commit — BA Project Tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ba-project-tracker.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

GitHub will ask for your username and password. Use your GitHub username and a **Personal Access Token** (not your password) — generate one at: Settings → Developer Settings → Personal Access Tokens → Tokens (classic).

---

## 🌐 PART 4 — Deploy to Render (Free Hosting)

### Step 1 — Sign up at Render
Go to [render.com](https://render.com) → Sign up with GitHub.

### Step 2 — Create a Web Service
1. Click **New +** → **Web Service**
2. Click **Connect GitHub** → authorize Render
3. Find and select your `ba-project-tracker` repo
4. Click **Connect**

### Step 3 — Check the settings
Render should auto-detect from `render.yaml`. Confirm:

| Setting | Value |
|---|---|
| Name | ba-project-tracker |
| Environment | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `node server.js` |
| Plan | Free |

### Step 4 — Deploy!
Click **Create Web Service**.

Render will:
1. Clone your GitHub repo
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile Angular → static files
4. Start the Express server (`node server.js`)

**First deploy takes 3–5 minutes.** Subsequent deploys are faster.

Your app will be live at:
```
https://ba-project-tracker.onrender.com
```
(or similar — Render will show you the exact URL)

### Auto-deploys
Every time you push new code to GitHub (`git push`), Render automatically re-deploys. No manual steps needed.

---

## ✏️ Customisation Guide

### Change your name/role in the sidebar
Open `src/app/components/sidebar/sidebar.component.ts` and find:
```typescript
<p class="user-name">Business Analyst</p>
<p class="user-role">Project Lead</p>
```
Replace with your actual name and title.

### Change the currency
Search for `KES` in the codebase and replace with your currency symbol.

### Add real projects
Delete the mock data in `src/app/services/project.service.ts` (the `MOCK_PROJECTS` array) and replace with your real project data, or just clear it — you can add projects via the UI.

### Change colours
All colours are in `src/styles.css` under `:root`. The key ones:
```css
--blue-500: #2563eb;   /* Primary accent */
--space-950: #020812;  /* Page background */
```

---

## 🔄 Making Updates After Deployment

```bash
# Make your changes to the code, then:
git add .
git commit -m "Your change description"
git push
```
Render will automatically detect the push and redeploy within 2–3 minutes.

---

## 🆘 Troubleshooting

| Problem | Solution |
|---|---|
| `npm install` fails | Make sure Node.js v18+ is installed |
| `ng: command not found` | Run `npm install -g @angular/cli` |
| App won't start | Check you're in the right folder (`cd ba-project-tracker`) |
| Blank page on Render | Check the Render logs for build errors |
| Data disappears on refresh | This is expected on Render free tier — localStorage is per-browser |

---

## 📄 Licence
MIT — free to use and customise.

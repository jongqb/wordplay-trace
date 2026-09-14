# WordPlay Trace 🎨✍️

> A tablet-first, kid-friendly Progressive Web App (PWA) for handwriting practice, sight words, and spelling across **English**, **Bahasa Malaysia**, and **Chinese (汉字)**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## ✨ Features

- ✍️ **Guided Letter & Word Tracing**: Animated stroke guides with numbered step-by-step paths for uppercase and lowercase Latin characters and numbers.
- 🇨🇳 **Chinese Hanzi Animated Stroke Order**: Powered by Hanzi-writer for authentic stroke order practice with pinyin hints.
- 📚 **Custom Courses & Words**: Create custom curriculum units, spelling lists, or sight words.
- 👆 **Interactive Click & Hold**: Long-press any course pill or word card to edit details or delete.
- 🔒 **Parental Gate & Dashboard**: Secure 4-digit PIN protected dashboard for curriculum editing, student progress tracking, and sound preferences.
- 📱 **Full PWA & Offline Support**: Installable on iPad, Android tablets, Chromebooks, iPhones, and desktop browsers with offline caching.
- 🎵 **Synthesizer & Audio Feedback**: Positive audio chimes, star pops, victory fanfares, and haptic feedback.

---

## 🚀 Quick Deployment to Vercel

### Option 1: Import GitHub Repository to Vercel (Recommended)

1. Push this project to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of WordPlay Trace PWA"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Open [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Select your GitHub repository.
5. Vercel will automatically detect **Vite** as the framework from `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your PWA is live in seconds!

### Option 2: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## 🛠️ Local Development

Ensure you have Node.js 18+ installed:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build
npm run preview
```

---

## 📱 Installing as a PWA

- **iPad / iPhone (iOS Safari)**: Tap the **Share** button in Safari, then tap **Add to Home Screen**.
- **Android / Chromebook (Chrome)**: Tap the in-app **"Install App"** button, or tap the three dots menu and select **"Add to Home screen"**.
- **macOS / Windows**: Look for the install icon in the browser address bar.

---

## 🧱 Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (`motion/react`)
- **Chinese Strokes**: Hanzi Writer
- **Icons**: Lucide React
- **PWA**: Web App Manifest, Service Worker (`sw.js`)
- **Deployment**: Vercel (`vercel.json`)

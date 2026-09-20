# Daily Field-Work Report - Deployment Guide

This application is an offline-capable, mobile-first daily field-work report generator and tracker designed for field representatives. It features instant formatted morning and evening summaries, automated calculations, cumulative tracking, and client-side persistence.

---

## 1. Quick Start

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The dev server will run locally at `http://localhost:3000`.

### Run Test Suite
To verify calculations, date helpers, and validation rules:
```bash
npm test
```

---

## 2. Production Build

Build the optimized static assets:
```bash
npm run build
```
The production bundle will be output to the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

---

## 3. Deployment Options

Because the application is fully standalone and relies on browser client-side storage, it can be hosted on any static hosting service or container platform:

- **Cloud Run**: Ready for container deployment.
- **Vercel / Netlify / Cloudflare Pages**: Connect the repository and configure build command `npm run build` and output directory `dist`.
- **GitHub Pages**: Deploy the contents of the `dist/` folder.

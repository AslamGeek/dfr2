# Daily Field-Work Report - Google Apps Script & Sheets Deployment Guide

This production-ready application is designed for field representative **Aslam K. S.** (Headquarters: **Proddatur**). It runs natively as a Google Apps Script Web App backed by Google Sheets, with an optimized mobile-first React frontend.

---

## 1. Create or Select the Google Sheet

1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet (e.g. named `Daily Field Reports - Aslam K. S.`).
2. Note the **Spreadsheet ID** from the browser address bar:
   `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`
   The bold part between `/d/` and `/edit` is your `SPREADSHEET_ID`.

---

## 2. Create and Configure the Apps Script Project

There are two easy methods:

### Method A: Bound Script (Recommended)
1. Inside your Google Sheet, click **Extensions > Apps Script**.
2. Rename the project to `Daily Field Report Web App`.
3. In this method, the script is directly linked to the sheet.

### Method B: Standalone Script
1. Go to [script.google.com](https://script.google.com) and click **New project**.
2. Name the project `Daily Field Report Web App`.

---

## 3. Set Script Properties (Configuration)

1. In the Apps Script project, open the left sidebar and click **Project Settings** (gear icon ⚙️).
2. Scroll to the **Script Properties** section and click **Edit script properties > Add script property**:
   - **Property**: `SPREADSHEET_ID`
   - **Value**: Your Google Sheet ID from Step 1.
3. Click **Save script properties**.

---

## 4. Install Project Dependencies

On your development machine:

```bash
npm install
```

---

## 5. Run Tests & Build the Apps Script Package

Verify all calculations and domain rules:

```bash
npm run test
```

Build the complete Google Apps Script bundle:

```bash
npm run build:gas
```

This compiles the React + Tailwind UI into a single standalone `Index.html` and packages all backend files (`Code.gs`, `Spreadsheet.gs`, `Records.gs`, `Settings.gs`, `Calculations.gs`, `Validation.gs`, `DateUtils.gs`, `Tests.gs`, `appsscript.json`) into the `dist/gas/` directory.

---

## 6. Push Files to Google Apps Script

### Option 1: Using clasp (Command Line)
1. If you haven't already, install and log into Google's clasp CLI:
   ```bash
   npm install -g @google/clasp
   clasp login
   ```
2. Link your Apps Script project ID:
   ```bash
   cd dist/gas
   clasp clone <YOUR_SCRIPT_ID>
   ```
   *(Your Script ID is found under Apps Script Project Settings > Script ID)*
3. Push files:
   ```bash
   clasp push
   ```

### Option 2: Manual Copy & Paste
If you prefer not using the CLI:
1. In the Apps Script editor, create the following script files and paste the matching code from `apps-script/`:
   - `Code.gs`
   - `Spreadsheet.gs`
   - `Records.gs`
   - `Settings.gs`
   - `Calculations.gs`
   - `Validation.gs`
   - `DateUtils.gs`
   - `Tests.gs`
2. Click **+ > HTML** and name the file `Index` (Apps Script will append `.html`).
3. Open `dist/gas/Index.html`, copy its entire content, and paste it into the Apps Script `Index.html`.
4. Click **Save** (disk icon or `Ctrl+S` / `Cmd+S`).

---

## 7. Run One-Time Sheet Initialization

1. In the Apps Script editor top bar, select **`initializeApp`** from the function dropdown.
2. Click **▷ Run**.
3. Google will prompt you to **Review Permissions**:
   - Click your account.
   - Click *Advanced > Go to Daily Field Report Web App (unsafe)*.
   - Click **Allow**.
4. The execution log will show:
   ```text
   Starting initializeApp...
   initializeApp completed successfully.
   ```
5. Check your Google Sheet: Three sheets will be created automatically:
   - **Records**: (Columns: DateKey, ReportDate, WorkPlace, Doctors, Chemists, NewConversions, POB, CreatedAt, UpdatedAt)
   - **Settings**: Initialized with default settings:
     - Name: `Aslam K. S.`
     - HQ: `Proddatur`
     - TimeZone: `Asia/Kolkata`
     - PobMode: `monthly`
     - ContinuousPobOpeningBalance: `0`
     - SchemaVersion: `1.1.0`
   - **MonthlyOpeningBalances**: (Columns: MonthKey, DoctorsOpening, ChemistsOpening, PobOpening, UpdatedAt)

---

## 8. Deploy the Web App

1. In the top right of Apps Script, click **Deploy > New deployment**.
2. Click the gear icon ⚙️ next to *Select type* and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Daily Field-Work Report v1.0`
   - **Execute as**: **Me (your-email@gmail.com)**
   - **Who has access**: **Anyone** (or *Anyone with Google account* based on team policy)
4. Click **Deploy**.
5. Copy the generated **Web App URL** (e.g. `https://script.google.com/macros/s/.../exec`).

Bookmark this URL on your mobile phone or add to your home screen!

---

## 9. Web App Access Permissions

- **Execute as: Me**: Crucial because Google Sheets updates occur under your authoritative script credentials without requiring individual OAuth consent per daily mobile session.
- **Who has access: Anyone**: Allows fast, seamless mobile browser access without repeated Google workspace login redirections on mobile.

---

## 10. Updating a Deployed Version Later

Whenever you make frontend or backend modifications:

1. Re-run tests:
   ```bash
   npm run test
   ```
2. Build the updated bundle:
   ```bash
   npm run build:gas
   ```
3. Push via clasp:
   ```bash
   cd dist/gas && clasp push
   ```
4. In the Apps Script editor, click **Deploy > Manage deployments**.
5. Click the pencil icon ✏️ (Edit) on the active Web app deployment.
6. Under **Version**, select **New version**.
7. Click **Deploy**. The Web App URL remains the same!

---

## Backend Test Suite

To verify all server-side logic in Apps Script directly:
1. In the function dropdown, select **`runAllBackendTests`**.
2. Click **▷ Run**.
3. View the Execution log to confirm all validation, reporting-week boundaries (days 1–7, 8–14, 15–21, 22–end), number clamping, and cumulative rules pass with zero failures.

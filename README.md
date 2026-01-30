# Biomarker Dashboard

A Next.js 14 application for visualizing and tracking biomarker health data with real-time data fetching from Google Sheets.

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React** - UI library

### UI Components & Styling
- **Material UI (MUI) v5** - Component library
  - `@mui/material` - Core Material UI components
  - `@mui/icons-material` - Material UI icons
  - `@emotion/react` & `@emotion/styled` - CSS-in-JS styling solution

### Data Visualization
- **Recharts** - Composable charting library built on React components
  - Used for creating interactive biomarker graphs and charts

### Data Processing
- **PapaParse** - Fast and powerful CSV parser
  - Parses CSV data from Google Sheets
  - Handles various CSV formats and edge cases
- **Axios** - HTTP client for fetching data from Google Sheets

### Package Manager
- **pnpm** - Fast, disk space efficient package manager

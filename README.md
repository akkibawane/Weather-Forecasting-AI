# ??? WeatherAI – Smart Weather Forecast & AI Assistant

[![Deploy to GitHub Pages](https://github.com/akkibawane/Weather-Forecasting-AI/actions/workflows/deploy.yml/badge.svg)](https://github.com/akkibawane/Weather-Forecasting-AI/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen?style=flat&logo=github)](https://akkibawane.github.io/Weather-Forecasting-AI/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-green?logo=leaflet)](https://leafletjs.com/)

A modern, intelligent weather forecasting web application featuring real-time meteorological data, 7-day extended forecasts, interactive radar maps, Air Quality Index (AQI) monitoring, and an **AI-powered weather assistant**.

---

## ?? Live Demo

?? **Live Website**: [https://akkibawane.github.io/Weather-Forecasting-AI/](https://akkibawane.github.io/Weather-Forecasting-AI/)  
?? **GitHub Repository**: [https://github.com/akkibawane/Weather-Forecasting-AI](https://github.com/akkibawane/Weather-Forecasting-AI)

---

## ?? Key Features

- **?? AI Weather Assistant & Insights**: Natural language weather summaries, clothing and travel recommendations, and interactive AI Q&A.
- **?? Real-Time Weather Conditions**: Temperature, "feels like", humidity, wind speed, UV index, atmospheric pressure, and visibility.
- **?? Hourly & 7-Day Forecast**: Granular 24-hour timeline alongside an extended multi-day outlook with high/low temperatures and precipitation probabilities.
- **??? Interactive Weather & Radar Maps**: Embedded Leaflet maps for clouds, precipitation, wind, and temperature layers.
- **?? Air Quality Index (AQI)**: Comprehensive pollutant breakdown (PM2.5, PM10, NO2, O3, CO, SO2) with health risk advisories.
- **??? Compare Cities**: Side-by-side weather comparisons between multiple cities across the world.
- **? Saved Locations & Favorites**: Bookmark favorite cities for instant one-click switching.
- **?? Severe Weather Alerts**: Real-time warnings for rainstorms, extreme heat, cold waves, and high winds.
- **?? Dynamic Atmospheric Backgrounds**: Animated visual effects responsive to current weather states (rain, snowfall, thunder, clear skies).
- **?? Fully Responsive Design**: Seamless desktop and mobile experience with custom theme selector and sharing tools.

---

## ??? Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism CSS
- **Mapping**: [Leaflet](https://leafletjs.com/) + OpenStreetMap
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **CI/CD & Hosting**: GitHub Actions & GitHub Pages

---

## ?? Getting Started Locally

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/akkibawane/Weather-Forecasting-AI.git

# Navigate into the project folder
cd Weather-Forecasting-AI

# Install dependencies
npm install

# Start local dev server
npm run dev
```

The application will start on your local Vite development port (typically `http://localhost:5173/`).

---

## ?? Production Build

```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

The compiled static files are generated in the `dist/` directory.

---

## ?? Deployment

Automated deployment is configured with GitHub Actions in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Any push to the `main` branch builds the project with Vite and publishes directly to GitHub Pages.

---

## ?? License

This project is open source and available under the [MIT License](LICENSE).

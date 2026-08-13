# Crate Analytics 📦📊

A modern, interactive analytics dashboard web application for tracking crate distribution, real-time inventory metrics, and performance insights.

## 🚀 Features

- **Real-Time Overview**: Live statistics on total crates, active shipments, and delivery efficiency.
- **Interactive Data Visualizations**: Dynamic charts powered by modern web technologies.
- **Fast Performance**: Built with Vite and modern ES modules for lightning-fast loads.

## 🤖 AI & ML Capabilities

- **Retention Prediction Model**: Evaluates behavioral features (such as initial response time, number of review cycles, changes requested, and total merge duration) to calculate a **Return Probability Score** and risk level for individual contributors.
- **Automated Friction Detection**: Flags anomalous onboarding patterns, such as prolonged response delays or excessive review bottlenecks that correlate with lower retention.
- **Smart Recommendations**: Dynamically generates prioritized, high-impact suggestions to help maintainers improve community onboarding health.

## ⚙️ Backend & Database

- **GitHub Integration & OAuth**: Secure authentication via GitHub OAuth and API integration to fetch repository issues, pull requests, reviews, and contributor profiles.
- **Data Processing Pipeline**: Aggregates raw GitHub events and reconstructs individual contributor journeys across milestones.
- **Relational Database**: Uses PostgreSQL to reliably store repository data, contributor stats, and calculated onboarding metrics.
- **REST APIs**: Powers the frontend dashboard with structured endpoints for metrics, insights, and journey tracking.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation & Running

1. Clone the repository:
   ```bash
   git clone https://github.com/kalviumcommunity/S70_Team02_CRATE.git
   cd S70_Team02_CRATE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173/` in your browser.

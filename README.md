# Schema Evolution Monitor

A web application that helps development teams safely update API schemas in microservice architectures.

## Features

- **Breaking Change Detection**: Automatically identifies breaking changes between schema versions
- **Impact Analysis**: Shows which services will be affected by schema changes
- **Smart Deployment Order**: Recommends optimal deployment sequence to minimize downtime
- **Visual Dashboard**: Clear visualization of changes, impacts, and deployment plan
- **Export & Share**: Download deployment plans as JSON or share with team

## Quick Start

1. **Clone and install**:
```bash
git clone <your-repo-url>
cd schema-evolution-monitor
npm install
```

2. **Run locally**:
```bash
npm start
```

3. **Build for production**:
```bash
npm run build
```

## How It Works

### The Problem
When you update an API schema (e.g., rename `email` → `emailAddress`), multiple downstream services can break. This tool shows exactly what breaks and the safest way to roll out changes.

### The Solution
1. **Upload** your old and new schema versions
2. **Analyze** breaking changes and affected services
3. **Get** optimized deployment order
4. **Export** deployment plan for your team

## Example Analysis

```json
{
  "changes": [
    {
      "type": "FIELD_REMOVED", 
      "schema": "UserSchema",
      "field": "email",
      "severity": "BREAKING"
    }
  ],
  "affectedServices": [
    {
      "name": "notification-service",
      "breakingChanges": 1,
      "impactLevel": "HIGH"
    }
  ]
}
```

## Technology Stack

- **Frontend**: React 18
- **Styling**: Pure CSS (no external frameworks)
- **Analysis**: Custom JavaScript algorithms
- **Deployment**: Render (Static Site)
- **Storage**: Client-side only (no backend)

## Sample Data

The app includes sample data showing a typical e-commerce system:
- UserSchema (id, email, name, createdAt)
- OrderSchema (id, userId, items, total)
- 4 microservices with various dependencies

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Connect repository to Render
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Deploy!

The app will be live at: `https://your-app-name.onrender.com`

## File Structure

```
src/
├── components/
│   ├── SchemaCompare/      # Schema diff visualization
│   ├── ImpactAnalysis/     # Service impact analysis
│   ├── DeploymentOrder/    # Deployment planning
│   └── Layout/             # App layout
├── utils/
│   ├── schemaAnalyzer.js   # Core analysis logic
│   ├── deploymentOptimizer.js # Deployment algorithms
│   └── sampleData.js       # Demo data
└── App.jsx                 # Main application
```

## Usage

### Interactive Demo
1. Visit the deployed site
2. Click "See Full Analysis" to view sample data
3. Explore breaking changes, impact analysis, and deployment plan

### Upload Your Data
1. Click "Upload Schemas"
2. Select JSON file with format:
```json
{
  "oldSchemas": { "UserSchema": {...} },
  "newSchemas": { "UserSchema": {...} },
  "services": [...]
}
```

### Export Results
- Click "Export JSON" to download deployment plan
- Click "Copy Plan" to share with your team

## Perfect for Interviews

This project demonstrates:
- **React Skills**: Modern hooks, component architecture
- **Problem Solving**: Complex algorithm implementation
- **System Design**: Microservice dependency analysis
- **UX Design**: Intuitive interface for technical users
- **Deployment**: Full CI/CD pipeline to production

## Live Demo

🚀 **[View Live Demo](https://schema-evolution-monitor.onrender.com)**

## License

MIT License - feel free to use for your portfolio!
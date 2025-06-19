# Schema Evolution Monitor

A smart tool for managing database schema changes across microservices. Automatically detects breaking changes, analyzes service impact, and suggests optimal deployment order.

## What It Does

When you update your database schemas, this tool helps you:
- **Identify breaking changes** that could break your services
- **See which services** will be affected by the changes
- **Get an optimized deployment order** to minimize downtime
- **Visualize service dependencies** to understand impact

Live Demo
View Live Application at https://schema-evolution-monitor-15.onrender.com

## Quick Start

### Running Locally

```bash
# Clone the repository
git clone https://github.com/myayush/schema_evolution_monitor.git
cd schema-evolution-monitor

# Install dependencies
npm install

# Start the application
npm start
```

Open http://localhost:3000 to view the app.

### Using the Tool

1. **Input Your Data**: Paste your old schemas, new schemas, and service configurations in JSON format
2. **Click "Analyze Schemas"**: The tool will process your changes
3. **Review Results**: See breaking changes, affected services, and deployment recommendations
4. **Follow Deployment Plan**: Use the suggested order to deploy safely

## Example Input Format

```json
{
  "oldSchemas": {
    "UserSchema": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "email": { "type": "string" },
        "name": { "type": "string" }
      },
      "required": ["id", "email"]
    }
  },
  "newSchemas": {
    "UserSchema": {
      "type": "object", 
      "properties": {
        "id": { "type": "string" },
        "emailAddress": { "type": "string" },
        "firstName": { "type": "string" },
        "lastName": { "type": "string" }
      },
      "required": ["id", "emailAddress"]
    }
  },
  "services": [
    {
      "name": "user-service",
      "importance": "HIGH",
      "callsPerDay": 50000,
      "dependencies": ["UserSchema.email", "UserSchema.name"],
      "serviceDependencies": []
    }
  ]
}
```

## Key Features

### Schema Change Detection
- Automatically identifies field additions, removals, and renames
- Distinguishes between breaking and safe changes
- Tracks required field changes that could cause failures

### Impact Analysis
- Shows which services use affected schema fields
- Calculates risk based on service importance and call volume
- Provides detailed breakdown of changes per service

### Smart Deployment Planning
- Orders deployments to minimize risk and downtime
- Considers service dependencies and importance levels
- Ensures prerequisites are deployed first

### Visual Dependency Graph
- Interactive network diagram of service relationships
- Drag nodes to reorganize the layout
- Click services for detailed information
- Color-coded to show affected vs safe services

## Understanding the Results

### Breaking Changes
Changes that could cause your services to fail:
- **Field Removed**: Service expects a field that no longer exists
- **Field Renamed**: Service uses old field name
- **Required Field Added**: Service doesn't provide the new required field
- **Type Changed**: Service expects different data type

### Safe Changes
Changes that won't break existing services:
- **Optional Field Added**: Services can ignore new fields
- **Field Made Optional**: Services still work if field is missing

### Service Priority Levels
- **CRITICAL**: Core business services (payment, auth)
- **HIGH**: Important services (user management, orders)
- **MEDIUM**: Supporting services (notifications, search)
- **LOW**: Non-essential services (analytics, reporting)

## Deployment Strategy

The tool suggests deployment order based on:

1. **Number of breaking changes** (fewer changes = deploy first)
2. **Service importance** (critical services need more careful handling)
3. **Dependencies** (deploy dependencies before dependent services)
4. **Risk assessment** (minimize blast radius)








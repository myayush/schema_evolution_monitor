// src/App.jsx
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SchemaCompare from './components/SchemaCompare';
import ImpactAnalysis from './components/ImpactAnalysis';
import DeploymentOrder from './components/DeploymentOrder';
import DependencyGraph3D from './components/DependencyGraph3D';
import { findSchemaChanges, findAffectedServices, getChangeSummary } from './utils/schemaAnalyzer';
import { calculateDeploymentOrder, generateDeploymentPlan } from './utils/deploymentOptimizer';
import { SAMPLE_SCHEMAS, SAMPLE_SERVICES } from './utils/sampleData';
import './App.css';

function App() {
  const [oldSchemas, setOldSchemas] = useState(SAMPLE_SCHEMAS.old);
  const [newSchemas, setNewSchemas] = useState(SAMPLE_SCHEMAS.new);
  const [services, setServices] = useState(SAMPLE_SERVICES);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);

  // Run analysis on initial load and when schemas change
  useEffect(() => {
    // Only run analysis if we have valid schemas, services, showDashboard is true, and no current analysis
    if (oldSchemas && newSchemas && services && showDashboard && !analysis) {
      runAnalysis();
    }
  }, [oldSchemas, newSchemas, services, showDashboard]); // Added dependencies

  const runAnalysis = () => {
    // Guard clause - don't run if schemas are null/undefined
    if (!oldSchemas || !newSchemas || !services) {
      console.warn('Cannot run analysis: missing schemas or services');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Longer processing time for better UX
    setTimeout(() => {
      try {
        const changes = findSchemaChanges(oldSchemas, newSchemas);
        const affectedServices = findAffectedServices(changes, services);
        const deploymentOrder = calculateDeploymentOrder(affectedServices);
        const deploymentPlan = generateDeploymentPlan(deploymentOrder);
        const summary = getChangeSummary(changes);

        setAnalysis({
          changes,
          affectedServices,
          deploymentOrder,
          deploymentPlan,
          summary
        });
      } catch (error) {
        console.error('Error during analysis:', error);
        // Reset to sample data if analysis fails
        setOldSchemas(SAMPLE_SCHEMAS.old);
        setNewSchemas(SAMPLE_SCHEMAS.new);
        setServices(SAMPLE_SERVICES);
      }
      
      setIsLoading(false);
    }, 2000);
  };

  const handleLoadExample = () => {
    setOldSchemas(SAMPLE_SCHEMAS.old);
    setNewSchemas(SAMPLE_SCHEMAS.new);
    setServices(SAMPLE_SERVICES);
    setShowDashboard(true);
    setIsLoading(true);
    setAnalysis(null);
    // Analysis will be triggered by useEffect when schemas change
  };

  const handleNewAnalysis = () => {
    // Clear analysis first
    setAnalysis(null);
    setIsLoading(false);
    setShowDashboard(false);
    // Clear schemas AFTER hiding dashboard to prevent useEffect from running
    setTimeout(() => {
      setOldSchemas(null);
      setNewSchemas(null);
    }, 100);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.oldSchemas && data.newSchemas) {
            setOldSchemas(data.oldSchemas);
            setNewSchemas(data.newSchemas);
            if (data.services) {
              setServices(data.services);
            }
            setAnalysis(null); // Clear previous analysis
            setShowDashboard(true);
            setIsLoading(true);
            // Analysis will be triggered by useEffect
          } else {
            alert('Invalid file format. Please upload a valid schema file.');
          }
        } catch (error) {
          alert('Error reading file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadFormat = () => {
    const formatExample = {
      oldSchemas: {
        UserSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" }
          },
          required: ["id", "email", "name"]
        }
      },
      newSchemas: {
        UserSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            emailAddress: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" }
          },
          required: ["id", "emailAddress", "firstName", "lastName"]
        }
      },
      services: [
        {
          name: "user-service",
          importance: "HIGH",
          callsPerDay: 25000,
          dependencies: [
            "UserSchema.id",
            "UserSchema.email",
            "UserSchema.name"
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(formatExample, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema-format-example.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!showDashboard) {
    return (
      <div className="App">
        <Layout>
          <div className="welcome-section">
            <div className="welcome-content">
              <h2>Schema Evolution Monitor</h2>
              <p className="welcome-description">
                Analyze schema changes and plan safe deployments for your microservices
              </p>
              
              <div className="demo-card">
                <h3>Try Demo Analysis</h3>
                <div className="demo-preview">
                  <div className="demo-change">
                    <span className="change-line">UserSchema v1 → v2</span>
                    <div className="change-details">
                      <div className="change-item breaking">❌ email → emailAddress</div>
                      <div className="change-item breaking">❌ name → firstName + lastName</div>
                    </div>
                  </div>
                  <div className="demo-impact">
                    <strong>3 services will be affected!</strong>
                  </div>
                </div>
                <button className="demo-btn" onClick={handleLoadExample}>
                  Analyze Sample Data
                </button>
              </div>

              <div className="upload-card">
                <h3>Upload Your Schemas</h3>
                <p>Upload JSON file with old and new schema versions</p>
                <div className="upload-actions">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="upload-btn">
                    📁 Choose File
                  </label>
                  <button 
                    className="format-btn" 
                    onClick={handleDownloadFormat}
                    title="Download JSON format example"
                  >
                    📋 View Format
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="App">
      <Layout>
        <div className="dashboard">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="dashboard-title">
              <h2>Schema Evolution Analysis</h2>
              <p>Monitor schema changes and deployments across your services</p>
            </div>
            <div className="dashboard-actions">
              <button className="action-btn secondary" onClick={handleNewAnalysis}>
                New Analysis
              </button>
              <button className="action-btn secondary" onClick={handleLoadExample}>
                Reload Sample
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-section">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <h3>Analyzing Schema Changes...</h3>
                <p>Detecting breaking changes and calculating impact</p>
              </div>
            </div>
          ) : analysis && oldSchemas && newSchemas ? (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Schemas</h3>
                  </div>
                  <div className="stat-number">{Object.keys(oldSchemas).length}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Changes</h3>
                  </div>
                  <div className="stat-number">{analysis.summary.total}</div>
                  <div className="stat-badges">
                    <span className="badge breaking">{analysis.summary.breaking} breaking</span>
                    <span className="badge safe">{analysis.summary.nonBreaking} safe</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Dependencies</h3>
                  </div>
                  <div className="stat-number">
                    {services.reduce((total, service) => total + service.dependencies.length, 0)}
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Affected Services</h3>
                  </div>
                  <div className="stat-number">{analysis.affectedServices.length}</div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="dashboard-grid">
                <div className="grid-left">
                  <SchemaCompare 
                    changes={analysis.changes}
                    oldSchemas={oldSchemas}
                    newSchemas={newSchemas}
                  />
                  
                  <ImpactAnalysis 
                    affectedServices={analysis.affectedServices}
                  />
                </div>
                
                <div className="grid-right">
                  <DeploymentOrder 
                    deploymentPlan={analysis.deploymentPlan}
                  />
                  
                  {/* 3D Dependency Visualization */}
                  <DependencyGraph3D 
                    services={services}
                    affectedServices={analysis.affectedServices}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="no-data-section">
              <div className="no-data-content">
                <h3>No Analysis Available</h3>
                <p>Load sample data or upload your schema files to get started</p>
                <button className="demo-btn" onClick={handleLoadExample}>
                  Load Sample Data
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

export default App;
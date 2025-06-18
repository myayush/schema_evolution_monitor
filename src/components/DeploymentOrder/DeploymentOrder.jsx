// src/components/DeploymentOrder/DeploymentOrder.jsx
import React from 'react';
import './DeploymentOrder.css';

function DeploymentOrder({ deploymentPlan, onExport }) {
  if (!deploymentPlan || !deploymentPlan.steps) {
    return (
      <div className="deployment-order">
        <h2>Deployment Plan</h2>
        <p className="no-plan">No deployment plan available</p>
      </div>
    );
  }

  const handleExport = () => {
    const exportData = {
      plan: deploymentPlan,
      generatedAt: new Date().toISOString(),
      summary: `${deploymentPlan.totalSteps} services, estimated ${deploymentPlan.estimatedTime} minutes`
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deployment-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const shareText = `Schema Evolution Deployment Plan:\n\n${deploymentPlan.steps.map(step => 
      `${step.order}. ${step.service} (${step.impact} impact)`
    ).join('\n')}\n\nEstimated time: ${deploymentPlan.estimatedTime} minutes`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Deployment Plan',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Plan copied to clipboard!');
      });
    }
  };

  return (
    <div className="deployment-order">
      <div className="header-section">
        <h2>Smart Deployment Plan</h2>
        <div className="action-buttons">
          <button className="export-btn" onClick={handleExport}>
            📁 Export JSON
          </button>
          <button className="share-btn" onClick={handleShare}>
            📋 Copy Plan
          </button>
        </div>
      </div>

      <div className="plan-summary">
        <div className="summary-item">
          <span className="summary-label">Total Steps:</span>
          <span className="summary-value">{deploymentPlan.totalSteps}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Deployment Order:</span>
          <span className="summary-value">Optimized</span>
        </div>
      </div>

      <div className="deployment-steps">
        {deploymentPlan.steps.map((step, index) => (
          <div key={index} className={`deployment-step ${step.impact.toLowerCase()}`}>
            <div className="step-number">{step.order}</div>
            
            <div className="step-content">
              <div className="step-header">
                <h3 className="service-name">{step.service}</h3>
                <div className="step-badges">
                  <span className={`impact-badge ${step.impact.toLowerCase()}`}>
                    {step.impact}
                  </span>
                  <span className="importance-badge">
                    {step.importance}
                  </span>
                </div>
              </div>
              
              <div className="step-details">
                <div className="step-reason">
                  <strong>Why this order:</strong> {step.reason}
                </div>
                
                <div className="step-info">
                  <div className="info-item">
                    <span className="info-label">Breaking Changes:</span>
                    <span className="info-value">{step.breakingChanges}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Priority:</span>
                    <span className="info-value">{step.importance}</span>
                  </div>
                </div>
                
                {step.prerequisites && step.prerequisites.length > 0 && (
                  <div className="prerequisites">
                    <strong>Prerequisites:</strong>
                    <ul>
                      {step.prerequisites.map((prereq, i) => (
                        <li key={i}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations-section">
        <h3>Deployment Recommendations</h3>
        <ul className="recommendations-list">
          {deploymentPlan.recommendations.map((rec, index) => (
            <li key={index} className="recommendation-item">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DeploymentOrder;
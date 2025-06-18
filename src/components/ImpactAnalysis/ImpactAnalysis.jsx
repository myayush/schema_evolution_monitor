// src/components/ImpactAnalysis/ImpactAnalysis.jsx
import React, { useState } from 'react';
import './ImpactAnalysis.css';

function ImpactAnalysis({ affectedServices }) {
  const [selectedService, setSelectedService] = useState(null);

  if (!affectedServices || affectedServices.length === 0) {
    return (
      <div className="impact-analysis">
        <h2>Impact Analysis</h2>
        <p className="no-impact">No services affected</p>
      </div>
    );
  }

  const highImpact = affectedServices.filter(s => s.impactLevel === 'HIGH');
  const lowImpact = affectedServices.filter(s => s.impactLevel === 'LOW');

  return (
    <div className="impact-analysis">
      <h2>Impact Analysis</h2>
      
      <div className="impact-summary">
        <div className="summary-card high">
          <div className="summary-number">{highImpact.length}</div>
          <div className="summary-label">High Impact</div>
        </div>
        <div className="summary-card low">
          <div className="summary-number">{lowImpact.length}</div>
          <div className="summary-label">Low Impact</div>
        </div>
        <div className="summary-card total">
          <div className="summary-number">{affectedServices.length}</div>
          <div className="summary-label">Total Affected</div>
        </div>
      </div>

      <div className="services-grid">
        {affectedServices.map((service, index) => (
          <div 
            key={index} 
            className={`service-card ${service.impactLevel.toLowerCase()}`}
            onClick={() => setSelectedService(service)}
          >
            <div className="service-header">
              <h3 className="service-name">{service.name}</h3>
              <span className={`impact-badge ${service.impactLevel.toLowerCase()}`}>
                {service.impactLevel}
              </span>
            </div>
            
            <div className="service-stats">
              <div className="stat">
                <span className="stat-label">Breaking Changes:</span>
                <span className="stat-value">{service.breakingChanges.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Calls/Day:</span>
                <span className="stat-value">{service.callsPerDay}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Importance:</span>
                <span className="stat-value">{service.importance}</span>
              </div>
            </div>
            
            <div className="dependencies">
              <div className="dependencies-label">Dependencies:</div>
              <div className="dependencies-list">
                {service.dependencies.slice(0, 2).map((dep, i) => (
                  <span key={i} className="dependency-tag">{dep}</span>
                ))}
                {service.dependencies.length > 2 && (
                  <span className="dependency-more">+{service.dependencies.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="service-details">
          <div className="details-header">
            <h3>{selectedService.name} - Detailed Impact</h3>
            <button 
              className="close-btn"
              onClick={() => setSelectedService(null)}
            >
              ×
            </button>
          </div>
          
          <div className="details-content">
            <div className="details-section">
              <h4>Breaking Changes</h4>
              {selectedService.breakingChanges.length > 0 ? (
                <ul className="changes-list">
                  {selectedService.breakingChanges.map((change, i) => (
                    <li key={i} className="change-item">
                      <strong>{change.schema}</strong>: {change.field} ({change.type})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No breaking changes</p>
              )}
            </div>
            
            <div className="details-section">
              <h4>All Dependencies</h4>
              <div className="all-dependencies">
                {selectedService.dependencies.map((dep, i) => (
                  <span key={i} className="dependency-tag">{dep}</span>
                ))}
              </div>
            </div>
            
            <div className="details-section">
              <h4>Recommendations</h4>
              <ul className="recommendations">
                <li>Deploy during low traffic hours</li>
                <li>Monitor error rates closely</li>
                <li>Have rollback plan ready</li>
                {selectedService.impactLevel === 'HIGH' && (
                  <li>Consider phased rollout</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImpactAnalysis;
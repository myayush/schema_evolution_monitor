// src/components/SchemaCompare/SchemaCompare.jsx
import React from 'react';
import { formatChange } from '../../utils/schemaAnalyzer';
import './SchemaCompare.css';

function SchemaCompare({ changes, oldSchemas, newSchemas }) {
  if (!changes || changes.length === 0) {
    return (
      <div className="schema-compare">
        <h2>Schema Changes</h2>
        <p className="no-changes">No changes detected</p>
      </div>
    );
  }

  const breakingChanges = changes.filter(c => c.severity === 'BREAKING');
  const nonBreakingChanges = changes.filter(c => c.severity === 'NON_BREAKING');

  return (
    <div className="schema-compare">
      <div className="section-header">
        <h3>Schema Changes</h3>
        <div className="version-info">
          <span className="version-badge">v1.0 → v2.0</span>
        </div>
      </div>
      
      <div className="changes-summary">
        <div className="summary-item breaking">
          <span className="count">{breakingChanges.length}</span>
          <span className="label">Breaking</span>
        </div>
        <div className="summary-item non-breaking">
          <span className="count">{nonBreakingChanges.length}</span>
          <span className="label">Safe</span>
        </div>
      </div>

      {breakingChanges.length > 0 && (
        <div className="changes-section">
          <h3 className="section-title breaking">❌ Breaking Changes</h3>
          <div className="changes-list">
            {breakingChanges.map((change, index) => (
              <div key={index} className="change-item breaking">
                <div className="change-header">
                  <span className="schema-name">{change.schema}</span>
                  <span className="change-type">{change.type}</span>
                </div>
                <div className="change-description">
                  {formatChange(change)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nonBreakingChanges.length > 0 && (
        <div className="changes-section">
          <h3 className="section-title safe">✅ Safe Changes</h3>
          <div className="changes-list">
            {nonBreakingChanges.map((change, index) => (
              <div key={index} className="change-item safe">
                <div className="change-header">
                  <span className="schema-name">{change.schema}</span>
                  <span className="change-type">{change.type}</span>
                </div>
                <div className="change-description">
                  {formatChange(change)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SchemaCompare;
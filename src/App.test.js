// src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard header initially', () => {
  render(<App />);
  const headerElement = screen.getByText(/Schema Evolution Analysis/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders dashboard loading state initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Analyzing Schema Changes/i);
  expect(loadingElement).toBeInTheDocument();
});

test('renders new analysis button', () => {
  render(<App />);
  const newAnalysisButton = screen.getByText(/New Analysis/i);
  expect(newAnalysisButton).toBeInTheDocument();
});

test('renders reload sample button', () => {
  render(<App />);
  const reloadButton = screen.getByText(/Reload Sample/i);
  expect(reloadButton).toBeInTheDocument();
});

// Test schema analyzer functions
import { findSchemaChanges, getChangeSummary } from './utils/schemaAnalyzer';

test('detects breaking changes', () => {
  const oldSchema = {
    UserSchema: {
      fields: { email: { type: 'string', required: true } }
    }
  };
  const newSchema = {
    UserSchema: {
      fields: { emailAddress: { type: 'string', required: true } }
    }
  };
  
  const changes = findSchemaChanges(oldSchema, newSchema);
  expect(changes).toHaveLength(2); // removed + added
  expect(changes[0].severity).toBe('BREAKING');
});

test('calculates change summary correctly', () => {
  const changes = [
    { severity: 'BREAKING' },
    { severity: 'BREAKING' },
    { severity: 'NON_BREAKING' }
  ];
  
  const summary = getChangeSummary(changes);
  expect(summary.total).toBe(3);
  expect(summary.breaking).toBe(2);
  expect(summary.nonBreaking).toBe(1);
  expect(summary.hasBreakingChanges).toBe(true);
});

test('handles empty changes array', () => {
  const changes = [];
  const summary = getChangeSummary(changes);
  expect(summary.total).toBe(0);
  expect(summary.breaking).toBe(0);
  expect(summary.nonBreaking).toBe(0);
  expect(summary.hasBreakingChanges).toBe(false);
});
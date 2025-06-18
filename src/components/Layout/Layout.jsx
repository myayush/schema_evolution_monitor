// src/components/Layout/Layout.jsx
import React from 'react';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="title">Schema Evolution Monitor</h1>
          <p className="subtitle">Safe schema deployments for microservices</p>
        </div>
      </header>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
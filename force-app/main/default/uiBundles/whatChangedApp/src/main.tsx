import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initSalesforceClient } from './data/salesforceClient';
import './styles/global.css';

// Initialize the Salesforce Data SDK before rendering so the app knows
// whether it's running inside the Multi-Framework runtime (live data)
// or standalone (demo/mock data).
initSalesforceClient().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

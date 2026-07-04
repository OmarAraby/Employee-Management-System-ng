// environment.prod.ts — swapped in for production builds via angular.json fileReplacements.
// apiUrl is RELATIVE by design: production deployments serve the SPA and proxy /api
// to the backend on the same origin (no CORS). See docs/agdr/AgDR-0001-prod-apiurl-strategy.md.
export const environment = {
  production: true,
  apiUrl: '/api',
  appName: 'Employee Management System',
  appVersion: '1.0.0'
};

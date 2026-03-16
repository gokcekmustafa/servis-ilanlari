import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import App from './src/App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Huvudfilen som renderar hela React-applikationen
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Skapar en root för React-applikationen och kopplar den till 'root'-elementet i HTML-filen
const root = ReactDOM.createRoot(document.getElementById('root'));
// Renderar App-komponenten inuti <React.StrictMode> för att identifiera potentiella problem i utvecklingsläget
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 
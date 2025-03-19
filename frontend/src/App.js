// Huvudkomponenten för forumapplikationen
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ForumProvider } from './context/ForumContext';
import ThreadList from './components/ThreadList';
import ThreadDetail from './components/ThreadDetail';
import NewThread from './components/NewThread';
import './App.css';

function App() {
  return (
    // Omsluter hela applikationen i ForumProvider för att hantera global state
    <ForumProvider>
      <Router>
        <div className="app">
          <header>
            <nav>
              <Link to="/">Hem</Link>
              <Link to="/new-thread">Ny tråd</Link>
            </nav>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<ThreadList />} />
              <Route path="/thread/:id" element={<ThreadDetail />} />
              <Route path="/new-thread" element={<NewThread />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ForumProvider>
  );
}

export default App; // Exporterar App-komponenten som standardexport så att den kan importeras och användas i andra filer.
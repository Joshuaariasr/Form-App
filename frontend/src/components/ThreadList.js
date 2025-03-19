import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForum } from '../context/ForumContext';
import './ThreadList.css';

const ThreadList = () => {
  // Hämtar state och funktioner från forumets context.
  const { 
    threads,         // Lista över alla trådar.
    sortBy,          // Nuvarande sorteringsval.
    setSortBy,       // Funktion för att ändra sorteringsval.
    category,        // Nuvarande kategori.
    setCategory,     // Funktion för att ändra kategori.
    searchQuery,     // Nuvarande sökfras.
    setSearchQuery,  // Funktion för att uppdatera sökfrasen.
    fetchThreads     // Funktion för att hämta trådar från databasen.
  } = useForum();

  //körs när komponenten mountas eller när sortering, kategori eller sökfras ändras.
  useEffect(() => {
    console.log('ThreadList mounted, fetching threads...');
    fetchThreads();
  }, [sortBy, category, searchQuery]);

  //körs varje gång `threads` uppdateras och loggar dess nya värde.
  useEffect(() => {
    console.log('Threads updated:', threads);
  }, [threads]);
  
  // Lista över kategorier för filtrering.
  const categories = [
    'Allmänt',
    'Teknik',
    'Sport',
    'Underhållning',
    'Annat'
  ];

 // Om trådar inte har laddats ännu, visa en laddningsindikator.
  if (!threads) {
    return <div className="thread-list">Laddar trådar...</div>;
  }

  return (
    <div className="thread-list">
      <div className="thread-list-header">
        <h2>Forum</h2>
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Sök trådar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Alla kategorier</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Senast skapad</option>
              <option value="latest_activity">Senaste aktivitet</option>
              <option value="reply_count">Antal svar</option>
            </select>
          </div>
        </div>
      </div>
      
      <Link to="/new-thread" className="new-thread-button">
        Skapa ny tråd
      </Link>

      {threads.length === 0 ? (
        <div className="no-threads">Inga trådar hittades</div>
      ) : (
        <div className="threads">
          {threads.map((thread) => (
            <div key={thread.id} className="thread-item">
              <Link to={`/thread/${thread.id}`} className="thread-link">
                <h3>{thread.title}</h3>
              </Link>
              <div className="thread-meta">
                <span>Kategori: {thread.category}</span>
                <span>Skapad: {new Date(thread.created_at).toLocaleDateString('sv-SE')}</span>
                <span>Svar: {thread.reply_count || 0}</span>
                <span>Senast aktiv: {new Date(thread.last_activity).toLocaleDateString('sv-SE')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadList; // Exporterar komponenten för att kunna användas i andra delar av applikationen.
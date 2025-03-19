import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config';

// Skapar ett React Context för forumet

const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
  // Tillstånd för att hantera forumtrådar och användarinteraktioner
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Hämtar trådar från API:et baserat på filter och sortering
  const fetchThreads = async () => {
    try {
      console.log('Fetching threads with params:', { sortBy, category, searchQuery });
      const params = new URLSearchParams({
        sortBy,
        ...(category && { category }),
        ...(searchQuery && { search: searchQuery })
      });
      const response = await fetch(`${API_URL}/threads?${params}`);
      if (!response.ok) throw new Error('Kunde inte hämta trådar');
      const data = await response.json();
      console.log('Received threads:', data);
      setThreads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fel vid hämtning av trådar:', error);
      setThreads([]);
    }
  };
  
  // Hämtar en enskild tråd baserat på dess ID
  const fetchThread = async (id) => {
    try {
      const response = await fetch(`${API_URL}/threads/${id}`);
      if (!response.ok) {
        throw new Error('Något gick fel vid hämtning av tråd');
      }
      const data = await response.json();
      setCurrentThread(data);
    } catch (error) {
      console.error('Fel vid hämtning av tråd:', error);
    }
  };
  
  // Skapar en ny tråd
  const createThread = async (title, content, category) => {
    try {
      console.log('Creating thread:', { title, content, category });
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, category }),
      });
      if (!response.ok) throw new Error('Kunde inte skapa tråd');
      const data = await response.json();
      console.log('Thread created:', data);
      setThreads(prevThreads => [data, ...prevThreads]);
      return data;
    } catch (error) {
      console.error('Fel vid skapande av tråd:', error);
      throw error;
    }
  };
  
  // Uppdaterar en befintlig tråd
  const updateThread = async (id, title, content) => {
    try {
      const response = await fetch(`${API_URL}/threads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });
      if (!response.ok) {
        throw new Error('Något gick fel vid uppdatering av tråd');
      }
      await fetchThreads();
      await fetchThread(id);
    } catch (error) {
      console.error('Fel vid uppdatering av tråd:', error);
      throw error;
    }
  };

  // Tar bort en tråd
  const deleteThread = async (id) => {
    try {
      const response = await fetch(`${API_URL}/threads/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Något gick fel vid borttagning av tråd');
      }
      await fetchThreads();
    } catch (error) {
      console.error('Fel vid borttagning av tråd:', error);
      throw error;
    }
  };

  // Skapar ett svar i en tråd
  const createReply = async (threadId, content) => {
    try {
      const response = await fetch(`${API_URL}/threads/${threadId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Något gick fel vid skapande av svar');
      }
      const data = await response.json();
      await fetchThread(threadId);
      await fetchThreads();
      return data;
    } catch (error) {
      console.error('Fel vid skapande av svar:', error);
      throw error;
    }
  };

  //Uppdatera innehållet i ett svar inut i själva tråden 
  const updateReply = async (replyId, content) => {
    try {
      const response = await fetch(`${API_URL}/replies/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Något gick fel vid uppdatering av svar');
      }
      if (currentThread) {
        await fetchThread(currentThread.id);
      }
      await fetchThreads();
    } catch (error) {
      console.error('Fel vid uppdatering av svar:', error);
      throw error;
    }
  };

  // Tar bort inehållet av ett svar inut i själva tråden
  const deleteReply = async (replyId) => {
    try {
      const response = await fetch(`${API_URL}/replies/${replyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Något gick fel vid borttagning av svar');
      }
      if (currentThread) {
        await fetchThread(currentThread.id);
      }
      await fetchThreads();
    } catch (error) {
      console.error('Fel vid borttagning av svar:', error);
      throw error;
    }
  };

// Använder useEffect för att hämta trådar vid förändringar i filter och sortering
  useEffect(() => {
    fetchThreads();
  }, [sortBy, category, searchQuery]);

  return (
    <ForumContext.Provider
      value={{
        threads,
        currentThread,
        sortBy,
        setSortBy,
        category,
        setCategory,
        searchQuery,
        setSearchQuery,
        fetchThreads,
        fetchThread,
        createThread,
        updateThread,
        deleteThread,
        createReply,
        updateReply,
        deleteReply,
      }}
    >
      {children}
    </ForumContext.Provider>
  );
};
// Hook för att använda forumets context
export const useForum = () => useContext(ForumContext); 
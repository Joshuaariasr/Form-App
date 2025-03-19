import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForum } from '../context/ForumContext';
import './NewThread.css';

const NewThread = () => {
  const navigate = useNavigate();
  const { createThread } = useForum();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Allmänt');

  // Lista över tillgängliga kategorier för forumtråden.
  const categories = [
    'Allmänt',
    'Teknik',
    'Sport',
    'Underhållning',
    'Annat'
  ];

  // Funktion som hanterar formulärinsändningen
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Rubrik och innehåll måste fyllas i');
      return;
    }
    try {
      await createThread(title, content, category);
      navigate('/');
    } catch (error) {
      console.error('Fel vid skapande av tråd:', error);
      alert('Kunde inte skapa tråden. Försök igen senare.');
    }
  };

  return (
    <div className="new-thread">
      <h2>Skapa ny tråd</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Rubrik:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Kategori:</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="content">Innehåll:</label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Skapa tråd</button>
      </form>
    </div>
  );
};
// Exporterar komponenten så att den kan användas i andra delar av applikationen.
export default NewThread; 
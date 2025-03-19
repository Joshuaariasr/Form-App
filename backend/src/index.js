const express = require('express');
const cors = require('cors');
const sqlite3 = require('better-sqlite3');
const path = require('path');

const app = express();
const port = 5001;

// CORS-konfiguration
app.use(cors());
app.use(express.json());

// Anslut till SQLite-databasen
const db = new sqlite3(path.join(__dirname, 'database.sqlite'));

// Skapa tabellerna "threads", 
//last_activity uppdateras vid nya svar
// category har standardvärdet "Allmänt"
db.exec(`
  CREATE TABLE IF NOT EXISTS threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Allmänt',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Skapa tabellen "replies" om den inte finns
// Den lagrar svar kopplade till en specifik tråd
db.exec(`
  CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id)
  )
`);

// Uppdatera last_activity när en ny reply skapas eller en tråd uppdateras
const updateLastActivity = (threadId) => {
  db.prepare('UPDATE threads SET last_activity = CURRENT_TIMESTAMP WHERE id = ?').run(threadId);
};

// Hämta alla diskussionstrådar med sortering och filtrering
app.get('/api/threads', (req, res) => {
  try {
    const { sortBy = 'created_at', category, search } = req.query;
    let query = `
      SELECT 
        t.*,
        COUNT(r.id) as reply_count,
        COALESCE(MAX(r.created_at), t.created_at) as last_activity
      FROM threads t 
      LEFT JOIN replies r ON t.id = r.thread_id 
      GROUP BY t.id
    `;
    const params = [];
    const whereConditions = [];

    // Filtrera efter kategori om angivet
    if (category) {
      whereConditions.push('t.category = ?');
      params.push(category);
    }
    
    // Filtrera efter sökord om angivet
    if (search) {
      whereConditions.push('(t.title LIKE ? OR t.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereConditions.length > 0) {
      query = query.replace('GROUP BY t.id', `WHERE ${whereConditions.join(' AND ')} GROUP BY t.id`);
    }

    //Sortering
    switch (sortBy) {
      case 'latest_activity':
        query += ' ORDER BY last_activity DESC';
        break;
      case 'reply_count':
        query += ' ORDER BY reply_count DESC, t.created_at DESC';
        break;
      default:
        query += ' ORDER BY t.created_at DESC';
    }

    console.log('SQL Query:', query);
    console.log('Params:', params);

    try {
      const stmt = db.prepare(query);
      const threads = stmt.all(...params);
      console.log('Hittade trådar:', threads);
      res.json(threads);
    } catch (error) {
      console.error('SQL-fel:', error);
      res.status(500).json({ error: 'Databasfel vid hämtning av trådar' });
    }
  } catch (error) {
    console.error('Fel vid hämtning av trådar:', error);
    res.status(500).json({ error: 'Kunde inte hämta trådar' });
  }
});

// Skapa en ny diskussionstråd
app.post('/api/threads', (req, res) => {
  try {
    const { title, content, category = 'Allmänt' } = req.body;
    
    console.log('Mottagen förfrågan att skapa tråd:', { title, content, category });
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Rubrik och innehåll måste fyllas i' });
    }

    try {
      const stmt = db.prepare('INSERT INTO threads (title, content, category) VALUES (?, ?, ?)');
      const result = stmt.run(title, content, category);
      
      console.log('Resultat från databasen:', result);
      
      if (result.changes === 0) {
        return res.status(500).json({ error: 'Kunde inte skapa tråden' });
      }

      // Hämta den skapade tråden med samma information som GET /api/threads
      const threadStmt = db.prepare(`
        SELECT 
          t.*,
          COUNT(r.id) as reply_count,
          COALESCE(MAX(r.created_at), t.created_at) as last_activity
        FROM threads t 
        LEFT JOIN replies r ON t.id = r.thread_id 
        WHERE t.id = ?
        GROUP BY t.id
      `);
      const thread = threadStmt.get(result.lastInsertRowid);
      
      console.log('Skapad tråd:', thread);

      res.json(thread);
    } catch (error) {
      console.error('SQL-fel:', error);
      res.status(500).json({ error: 'Databasfel vid skapande av tråd' });
    }
  } catch (error) {
    console.error('Fel vid skapande av tråd:', error);
    res.status(500).json({ error: 'Ett fel uppstod vid skapande av tråden' });
  }
});

// Uppdatera en tråd
app.put('/api/threads/:id', (req, res) => {
  const { title, content } = req.body;
  db.prepare('UPDATE threads SET title = ?, content = ? WHERE id = ?').run(title, content, req.params.id);
  updateLastActivity(req.params.id);
  res.json({ id: req.params.id });
});

// Ta bort en tråd och dess svar
app.delete('/api/threads/:id', (req, res) => {
  db.prepare('DELETE FROM replies WHERE thread_id = ?').run(req.params.id);
  db.prepare('DELETE FROM threads WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Hämta en specifik tråd och dess svar
app.get('/api/threads/:id', (req, res) => {
  const thread = db.prepare('SELECT * FROM threads WHERE id = ?').get(req.params.id);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  
  const replies = db.prepare('SELECT * FROM replies WHERE thread_id = ? ORDER BY created_at').all(req.params.id);
  res.json({ ...thread, replies });
});

// Lägg till ett svar på en tråd
app.post('/api/threads/:id/replies', (req, res) => {
  const { content } = req.body;
  const result = db.prepare('INSERT INTO replies (thread_id, content) VALUES (?, ?)').run(req.params.id, content);
  updateLastActivity(req.params.id);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/replies/:id', (req, res) => {
  const { content } = req.body;
  const reply = db.prepare('SELECT thread_id FROM replies WHERE id = ?').get(req.params.id);
  if (!reply) {
    return res.status(404).json({ error: 'Reply not found' });
  }
  
  db.prepare('UPDATE replies SET content = ? WHERE id = ?').run(content, req.params.id);
  updateLastActivity(reply.thread_id);
  res.json({ id: req.params.id });
});

app.delete('/api/replies/:id', (req, res) => {
  const reply = db.prepare('SELECT thread_id FROM replies WHERE id = ?').get(req.params.id);
  if (!reply) {
    return res.status(404).json({ error: 'Reply not found' });
  }
  
  db.prepare('DELETE FROM replies WHERE id = ?').run(req.params.id);
  updateLastActivity(reply.thread_id);
  res.json({ success: true });
});

// Root-route
app.get('/', (req, res) => {
  res.json({ message: 'Forum API är igång' });
});

// Starta servern
app.listen(port, () => {
  console.log(`Server kör på port ${port}`);
}); 
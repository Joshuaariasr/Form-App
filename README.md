# Forum Applikation

En enkel forum-applikation byggd med React, Express.js och SQLite. Applikationen låter användare skapa trådar, lägga till svar och interagera med innehållet.

## Funktioner

- Skapa och hantera forumtrådar
- Lägga till svar på trådar
- Redigera och ta bort trådar och svar
- Filtrera trådar efter kategori
- Söka i trådar
- Sortera trådar efter datum, aktivitet och antal svar

## Teknisk Stack

- Frontend: React.js
- Backend: Express.js
- Databas: SQLite (better-sqlite3)
- Routing: React Router
- Styling: CSS

## Projektstruktur
```
the-app/
├── backend/
│   ├── src/
│   │   └── index.js         # Huvudserverfil med API-endpoints
│   │
│   ├── database.sqlite      # SQLite-databasfil
│   └── package.json         # Backend-beroenden och scripts
│
└── frontend/
    ├── public/
    │   ├── index.html       # HTML-mall
    │   └── favicon.ico      # Webbläsarikon
    │
    ├── src/
    │   ├── components/      # React-komponenter
    │   │   ├── ThreadList.js
    │   │   ├── ThreadDetail.js
    │   │   ├── ThreadForm.js
    │   │   ├── ReplyList.js
    │   │   ├── ReplyForm.js
    │   │   ├── SearchBar.js
    │   │   └── CategoryFilter.js
    │   │
    │   ├── context/         # React Context
    │   │   └── ForumContext.js
    │   │
    │   ├── App.js           # Huvudapplikationskomponent
    │   ├── index.js         # Applikationsstartpunkt
    │   └── index.css        # Globala stilar
    │
    └── package.json         # Frontend-beroenden och scripts
```

### Backend-struktur
- `backend/src/index.js`: Innehåller all serverlogik, API-endpoints och databasoperationer
- `backend/database.sqlite`: SQLite-databasfilen som lagrar all data
- `backend/package.json`: Hanterar backend-beroenden och scripts

### Frontend-struktur
- `frontend/src/components/`: Innehåller alla React-komponenter
  - `ThreadList.js`: Visar lista över alla trådar
  - `ThreadDetail.js`: Visar detaljerad vy av en tråd
  - `ThreadForm.js`: Formulär för att skapa/redigera trådar
  - `ReplyList.js`: Visar lista över svar i en tråd
  - `ReplyForm.js`: Formulär för att lägga till svar
  - `SearchBar.js`: Sökkomponent
  - `CategoryFilter.js`: Filtreringskomponent för kategorier
- `frontend/src/context/`: Innehåller React Context för state management
  - `ForumContext.js`: Hanterar global state för forumdata
- `frontend/public/`: Statiska filer
- `frontend/src/App.js`: Huvudkomponenten som hanterar routing
- `frontend/src/index.js`: Startpunkt för React-applikationen
- `frontend/src/index.css`: Globala CSS-stilar

## Installation

1. Klona projektet:
```bash
git clone [projekt-url]
cd the-app
```

2. Installera backend-beroenden:
```bash
cd backend
npm install
```

3. Installera frontend-beroenden:
```bash
cd ../frontend
npm install
```

## Starta Applikationen

1. Starta backend-servern:
```bash
cd backend
node src/index.js
```
Backend-servern kör på http://localhost:5001

2. I en ny terminal, starta frontend-applikationen:
```bash
cd frontend
npm start
```
Frontend-applikationen kör på http://localhost:3000

## Stänga Ner Applikationen

1. Tryck `Ctrl + C` i båda terminalerna för att stänga ner servrarna
2. Stäng webbläsaren

## Databasstruktur

### Tabeller

#### threads
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- content (TEXT)
- category (TEXT)
- created_at (DATETIME)
- last_activity (DATETIME)

#### replies
- id (INTEGER PRIMARY KEY)
- thread_id (INTEGER)
- content (TEXT)
- created_at (DATETIME)

## API Endpoints

### Trådar
- GET /api/threads - Hämta alla trådar
- POST /api/threads - Skapa ny tråd
- GET /api/threads/:id - Hämta specifik tråd
- PUT /api/threads/:id - Uppdatera tråd
- DELETE /api/threads/:id - Ta bort tråd

### Svar
- POST /api/threads/:id/replies - Skapa nytt svar
- PUT /api/replies/:id - Uppdatera svar
- DELETE /api/replies/:id - Ta bort svar

## Felsökning

Om du får "EADDRINUSE" fel när du startar backend-servern:
1. Kontrollera om servern redan kör på port 5001
2. Stäng ner den befintliga processen:
```bash
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```
3. Starta om backend-servern

## Utveckling

För att utveckla applikationen:
1. Backend: Ändra i `backend/src/index.js`
2. Frontend: Ändra i `frontend/src/` mappen
3. Styling: Ändra i CSS-filerna i `frontend/src/components/`

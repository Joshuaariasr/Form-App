import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForum } from '../context/ForumContext';

const ThreadDetail = () => {
  const { id } = useParams(); //Hämtar trådens ID från URL-parametrarna.
  const navigate = useNavigate(); // Hook för att navigera mellan sidor.
  
  // Hämtar funktioner och state från forumets context.
  const { currentThread, fetchThread, createReply, updateThread, deleteThread, updateReply, deleteReply } = useForum();
  
  // State för att hantera nya svar.
  const [replyContent, setReplyContent] = useState('');
  
  // State för att hantera redigering av tråd.
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  // State för att hantera redigering av svar.
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  // Hämtar trådens data när komponenten laddas eller när ID ändras.
  useEffect(() => {
    fetchThread(id);
  }, [id]);

  // Funktion för att hantera inskick av svar.
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    await createReply(id, replyContent);
    setReplyContent('');
  };
  // Funktion för att börja redigera en tråd.
  const handleEditThread = () => {
    setEditTitle(currentThread.title);
    setEditContent(currentThread.content);
    setIsEditing(true);
  };
  // Funktion för att spara redigerad tråd.
  const handleUpdateThread = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) return;
    
    await updateThread(id, editTitle, editContent);
    setIsEditing(false);
  };
  // Funktion för att radera en tråd.
  const handleDeleteThread = async () => {
    if (window.confirm('Är du säker på att du vill ta bort denna tråd?')) {
      await deleteThread(id);
      navigate('/');
    }
  };
  // Funktion för att börja redigera ett svar.
  const handleEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditReplyContent(reply.content);
  };
  // Funktion för att uppdatera ett svar.
  const handleUpdateReply = async (replyId) => {
    if (!editReplyContent.trim()) return;
    
    await updateReply(replyId, editReplyContent);
    setEditingReplyId(null);
  };
  // Funktion för att radera ett svar.
  const handleDeleteReply = async (replyId) => {
    if (window.confirm('Är du säker på att du vill ta bort detta svar?')) {
      await deleteReply(replyId);
    }
  };
  // Om trådens data inte har laddats, visa en laddningsindikator.
  if (!currentThread) {
    return <div>Laddar...</div>;
  }

  return (
    <div className="thread-detail">
      {isEditing ? (
        <form onSubmit={handleUpdateThread} className="edit-form">
          <div className="form-group">
            <label htmlFor="edit-title">Rubrik:</label>
            <input
              type="text"
              id="edit-title"
              name="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-content">Innehåll:</label>
            <textarea
              id="edit-content"
              name="edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              required
            />
          </div>
          <div className="button-group">
            <button type="submit">Spara ändringar</button>
            <button type="button" onClick={() => setIsEditing(false)}>Avbryt</button>
          </div>
        </form>
      ) : (
        <div className="thread-content">
          <div className="thread-header">
            <h2>{currentThread.title}</h2>
            <div className="thread-actions">
              <button onClick={handleEditThread}>Redigera</button>
              <button onClick={handleDeleteThread} className="delete-button">Ta bort</button>
            </div>
          </div>
          <p>{currentThread.content}</p>
          <p className="thread-meta">
            Skapad: {new Date(currentThread.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="replies">
        <h3>Svar</h3>
        {currentThread.replies.map((reply) => (
          <div key={reply.id} className="reply">
            {editingReplyId === reply.id ? (
              <div className="edit-reply">
                <textarea
                  id="edit-reply-textarea"
                  name="edit-reply-textarea"
                  value={editReplyContent}
                  onChange={(e) => setEditReplyContent(e.target.value)}
                />
                <div className="button-group">
                  <button onClick={() => handleUpdateReply(reply.id)}>Spara</button>
                  <button onClick={() => setEditingReplyId(null)}>Avbryt</button>
                </div>
              </div>
            ) : (
              <>
                <p>{reply.content}</p>
                <div className="reply-meta">
                  <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                  <div className="reply-actions">
                    <button onClick={() => handleEditReply(reply)}>Redigera</button>
                    <button onClick={() => handleDeleteReply(reply.id)} className="delete-button">Ta bort</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    
      <form onSubmit={handleSubmitReply} className="reply-form">
        <div className="form-group">
          <label htmlFor="reply-content">Ditt svar:</label>
          <textarea
            id="reply-content"
            name="reply-content"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Skicka svar</button>
      </form>
    </div>
  );
};

export default ThreadDetail; // Exporterar komponenten så att den kan användas i andra delar av applikationen.
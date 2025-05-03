import { useState, useEffect, useRef } from 'react';
import styles from './App.module.css';

const LOCAL_KEY = 'brainhub-notes';

export default function App() {
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedNoteId, setSelectedNoteId] = useState(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed[0]?.id || null;
    }
    return null;
  });

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [editorWidth, setEditorWidth] = useState(600);

  const dragTargetRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (dragTargetRef.current === 'sidebar') {
        setSidebarWidth(Math.max(150, Math.min(e.clientX, window.innerWidth - 200)));
      } else if (dragTargetRef.current === 'editor') {
        const wrapper = document.querySelector(`.${styles.editorWrapper}`);
        const wrapperRect = wrapper.getBoundingClientRect();
        const newWidth = e.clientX - wrapperRect.left;
        setEditorWidth(Math.max(200, newWidth));
      }
    };

    const handlePointerUp = () => {
      dragTargetRef.current = null;
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled',
      content: '# Untitled',
    };
    setNotes(prev => [...prev, newNote]);
    //setSelectedNoteId(newNote.id);
  };

  const updateNote = (id, content) => {
    const firstLine = content.split('\n')[0];
    const match = firstLine.match(/^#\s+(.*)/);
    const newTitle = match ? match[1] : 'Untitled';
  
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, content, title: newTitle }
          : note
      )
    );
  };

  const deleteNote = (id) => {
    if (!confirm('Delete this note?')) return;
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    if (selectedNoteId === id) setSelectedNoteId(updated[0]?.id || null);
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar} style={{ width: sidebarWidth }}>
        <button className={styles.addButton} onClick={addNote}>+</button>
        <ul className={styles.noteList}>
          {notes.map(note => (
            <li key={note.id}>
              <button
                className={selectedNoteId === note.id ? styles.activeNote : styles.noteButton}
                onClick={() => setSelectedNoteId(note.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  deleteNote(note.id);
                }}
              >
                {note.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={styles.divider}
        onPointerDown={() => {
          dragTargetRef.current = 'sidebar';
        }}
      />

      <div className={styles.editorWrapper}>
        <div
          className={styles.editor}
          style={{ width: `${editorWidth}px` }}
        >
          <textarea
            className={styles.textArea}
            value={selectedNote?.content || ''}
            onChange={(e) => {
              if (selectedNote) updateNote(selectedNote.id, e.target.value);
            }}
            disabled={!selectedNote}
          />
        </div>
        <div
          className={styles.editorDragger}
          onPointerDown={() => {
            dragTargetRef.current = 'editor';
          }}
        />
      </div>
    </div>
  );
}

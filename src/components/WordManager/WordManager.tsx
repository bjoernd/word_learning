// ABOUTME: UI component for managing the word database
// ABOUTME: Provides interface to add and delete words
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addWord, deleteWord } from '../../services/database';
import styles from './WordManager.module.css';

export function WordManager() {
  const [inputValue, setInputValue] = useState('');
  const words = useLiveQuery(() => db.words.toArray()) ?? [];

  const handleAddWord = async () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      await addWord(trimmed);
      setInputValue('');
    }
  };

  const handleDeleteWord = async (id: number) => {
    if (window.confirm('Delete this word?')) {
      await deleteWord(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.addSection}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a word"
          className={styles.input}
          aria-label="New word to add"
        />
        <button onClick={handleAddWord} className={styles.addButton}>
          Add Word
        </button>
      </div>

      {words.length === 0 ? (
        <p className={styles.emptyMessage}>
          No words yet. Add some words to start practicing.
        </p>
      ) : (
        <ul className={styles.wordList}>
          {words.sort((a, b) => a.word.localeCompare(b.word)).map((word) => (
            <li key={word.id} className={styles.wordItem}>
              <span className={styles.wordText}>{word.word}</span>
              <button
                onClick={() => handleDeleteWord(word.id!)}
                className={styles.deleteButton}
                aria-label={`Delete word ${word.word}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

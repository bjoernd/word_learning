import { useState, useEffect } from 'react';
import { getWords, saveWords } from '../services/storage';
import './WordsList.css';

/**
 * WordsList Component
 * Displays all words from the database with ability to delete them
 */
function WordsList() {
  const [words, setWords] = useState([]);

  /**
   * Load words from localStorage on component mount
   */
  useEffect(() => {
    loadWords();
  }, []);

  /**
   * Load words from localStorage and sort alphabetically
   */
  const loadWords = () => {
    const storedWords = getWords();
    // Sort words alphabetically (case-insensitive)
    const sortedWords = [...storedWords].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    setWords(sortedWords);
  };

  /**
   * Handle word deletion with confirmation
   */
  const handleDelete = (wordToDelete) => {
    // Ask for confirmation
    const confirmed = window.confirm(
      `Are you sure you want to delete "${wordToDelete}"?`
    );

    if (!confirmed) {
      return;
    }

    // Remove word from list (filter by word, not index)
    const updatedWords = words.filter(word => word !== wordToDelete);

    // Save to localStorage
    const saved = saveWords(updatedWords);

    if (saved) {
      // Update local state with sorted list
      const sortedWords = [...updatedWords].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
      setWords(sortedWords);
    } else {
      // Show error if save failed
      alert('Oops! Could not delete the word. Please try again.');
    }
  };

  return (
    <div className="words-list">
      <h2>Your Word List</h2>

      {words.length === 0 ? (
        <div className="empty-state">
          <p>No words yet. Add some!</p>
          <p className="empty-state-hint">
            Use the form above to add your first word.
          </p>
        </div>
      ) : (
        <div className="words-container">
          <p className="word-count">
            You have {words.length} word{words.length !== 1 ? 's' : ''} to practice!
          </p>
          <ul className="words-grid">
            {words.map((word, index) => (
              <li key={`${word}-${index}`} className="word-item">
                <span className="word-text">{word}</span>
                <button
                  onClick={() => handleDelete(word)}
                  className="delete-button"
                  aria-label={`Delete ${word}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WordsList;

import { useState } from 'react';
import { getWords, saveWords } from '../services/storage';
import { isValidWord, isDuplicate } from '../utils/wordModel';
import './WordsManagement.css';

/**
 * WordsManagement Component
 * Provides interface for adding new words to the database
 */
function WordsManagement() {
  const [wordInput, setWordInput] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error' | ''

  /**
   * Handle form submission to add a new word
   */
  const handleAddWord = (e) => {
    e.preventDefault();

    // Clear any existing message
    setMessage({ text: '', type: '' });

    const trimmedWord = wordInput.trim();

    // Validate word is not empty
    if (!trimmedWord) {
      setMessage({ text: 'Please enter a word!', type: 'error' });
      return;
    }

    // Validate word contains only letters
    if (!isValidWord(trimmedWord)) {
      setMessage({ text: 'Words can only contain letters (no numbers or symbols)!', type: 'error' });
      return;
    }

    // Get existing words
    const existingWords = getWords();

    // Check for duplicates
    if (isDuplicate(trimmedWord, existingWords)) {
      setMessage({ text: `"${trimmedWord}" is already in your word list!`, type: 'error' });
      return;
    }

    // Add the new word
    const updatedWords = [...existingWords, trimmedWord];
    const saved = saveWords(updatedWords);

    if (saved) {
      setMessage({ text: `Great! "${trimmedWord}" has been added!`, type: 'success' });
      setWordInput(''); // Clear input field
    } else {
      setMessage({ text: 'Oops! Could not save the word. Please try again.', type: 'error' });
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    setWordInput(e.target.value);
    // Clear message when user starts typing again
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  return (
    <div className="words-management">
      <h2>Add New Words</h2>

      <form onSubmit={handleAddWord} className="add-word-form">
        <div className="input-group">
          <input
            type="text"
            value={wordInput}
            onChange={handleInputChange}
            placeholder="Type a word..."
            className="word-input"
            aria-label="New word input"
          />
          <button type="submit" className="add-button">
            Add Word
          </button>
        </div>
      </form>

      {message.text && (
        <div className={`message message-${message.type}`} role="alert">
          {message.text}
        </div>
      )}
    </div>
  );
}

export default WordsManagement;

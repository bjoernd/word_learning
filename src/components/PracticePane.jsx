import { useState, useRef, useEffect } from 'react';
import { speakWord, isTTSSupported } from '../services/tts';
import { getScore, saveScore, getWords } from '../services/storage';
import { getRandomWord } from '../utils/wordModel';
import { checkSpelling } from '../utils/spellChecker';
import './PracticePane.css';

/**
 * PracticePane Component
 * Main interface for practicing spelling words
 */
function PracticePane() {
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(() => getScore());
  const [feedback, setFeedback] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);
  // Spell check result will be used in WI-11 for detailed feedback display
  const [_spellCheckResult, setSpellCheckResult] = useState(null);

  const inputRef = useRef(null);

  /**
   * Auto-focus input when ready for user input
   */
  useEffect(() => {
    if (currentWord && !isShowingFeedback && !isSpeaking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWord, isShowingFeedback, isSpeaking]);

  /**
   * Select and speak the next word for practice
   * Handles edge cases: empty database, preventing same word twice
   */
  const selectNextWord = async () => {
    const words = getWords();

    // Handle empty database
    if (words.length === 0) {
      setFeedback('No words in the database! Go to "Manage Words" to add some.');
      setCurrentWord('');
      return;
    }

    // Get a random word, avoiding the current word if possible
    const nextWord = getRandomWord(words, currentWord);
    setCurrentWord(nextWord);
    setFeedback('');
    setUserInput('');

    // Automatically speak the word if TTS is supported
    if (isTTSSupported() && nextWord) {
      setIsSpeaking(true);
      try {
        await speakWord(nextWord);
      } catch (error) {
        console.error('TTS error:', error);
        setFeedback('Could not speak the word. Click "Speak Word" to try again.');
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  /**
   * Handle Speak Word button click
   */
  const handleSpeakWord = async () => {
    if (!currentWord) {
      setFeedback('No word to speak! Click "Get Word" to start.');
      return;
    }

    if (!isTTSSupported()) {
      setFeedback('Sorry, text-to-speech is not supported in your browser.');
      return;
    }

    setIsSpeaking(true);
    try {
      await speakWord(currentWord);
    } catch (error) {
      console.error('TTS error:', error);
      setFeedback('Oops! Could not speak the word. Please try again.');
    } finally {
      setIsSpeaking(false);
    }
  };

  /**
   * Handle Replay Word button click (same as Speak Word)
   */
  const handleReplayWord = async () => {
    await handleSpeakWord();
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  /**
   * Handle form submission
   * Check spelling and update score
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentWord || !userInput.trim()) {
      return;
    }

    // Check spelling
    const result = checkSpelling(userInput, currentWord);
    setSpellCheckResult(result);

    // Update score if correct
    if (result.isCorrect) {
      updateScore(score + 1);
      setFeedback('Great job! You spelled it correctly!');
    } else {
      setFeedback('Not quite right. Try again!');
    }

    // Set feedback state
    setIsShowingFeedback(true);

    // Clear input after submission
    setUserInput('');
  };

  /**
   * Update score and save to localStorage
   */
  const updateScore = (newScore) => {
    setScore(newScore);
    saveScore(newScore);
  };

  /**
   * Reset score to 0
   */
  const handleResetScore = () => {
    updateScore(0);
    setFeedback('Score reset to 0!');
  };

  /**
   * Get a new word
   */
  const handleGetWord = () => {
    selectNextWord();
  };

  /**
   * Dismiss feedback and prepare for next word
   */
  const handleDismissFeedback = () => {
    setIsShowingFeedback(false);
    setFeedback('');
    setSpellCheckResult(null);
  };

  /**
   * Handle "Next Word" button - dismiss feedback and get new word
   */
  const handleNextWord = () => {
    handleDismissFeedback();
    selectNextWord();
  };

  return (
    <div className="practice-pane">
      <h2>Practice Spelling</h2>

      {/* Score Display */}
      <div className="score-section">
        <div className="score-display">
          <span className="score-label">Score:</span>
          <span className="score-value">{score}</span>
        </div>
        <button
          onClick={handleResetScore}
          className="reset-score-button"
          aria-label="Reset score"
        >
          Reset Score
        </button>
      </div>

      {/* Word Control Buttons */}
      <div className="word-controls">
        <button
          onClick={handleGetWord}
          className="get-word-button"
          aria-label="Get a new word"
        >
          Get Word
        </button>
        <button
          onClick={handleSpeakWord}
          className="speak-button"
          disabled={!currentWord || isSpeaking}
          aria-label="Speak the word"
        >
          {isSpeaking ? 'Speaking...' : 'Speak Word'}
        </button>
        <button
          onClick={handleReplayWord}
          className="replay-button"
          disabled={!currentWord || isSpeaking}
          aria-label="Replay the word"
        >
          Replay Word
        </button>
      </div>

      {/* Input Section */}
      <form onSubmit={handleSubmit} className="input-section">
        <label htmlFor="spelling-input" className="input-label">
          Type what you hear:
        </label>
        <input
          id="spelling-input"
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Type the word here..."
          className="spelling-input"
          disabled={!currentWord || isShowingFeedback}
          ref={inputRef}
          aria-label="Spelling input"
        />
        <button
          type="submit"
          className="submit-button"
          disabled={!currentWord || !userInput.trim() || isShowingFeedback}
        >
          Submit
        </button>
      </form>

      {/* Feedback Section */}
      {feedback && (
        <div className="feedback-section" role="alert">
          <p className="feedback-message">{feedback}</p>
          {isShowingFeedback && (
            <button
              onClick={handleNextWord}
              className="next-word-button"
              aria-label="Get next word"
            >
              Next Word
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      {!currentWord && (
        <div className="instructions">
          <h3>How to Practice:</h3>
          <ol>
            <li>Click "Get Word" to start</li>
            <li>Listen to the word by clicking "Speak Word"</li>
            <li>Type what you hear in the box</li>
            <li>Click "Submit" to check your spelling</li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default PracticePane;

import { useState } from 'react';
import { speakWord, isTTSSupported } from '../services/tts';
import { getScore, saveScore } from '../services/storage';
import './PracticePane.css';

/**
 * PracticePane Component
 * Main interface for practicing spelling words
 */
function PracticePane() {
  const [currentWord] = useState(''); // setCurrentWord will be used in WI-08
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(() => getScore());
  const [feedback, setFeedback] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

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
   * Handle form submission (to be implemented in later work items)
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Spell checking logic will be added in WI-10
    setFeedback('Submit functionality will be implemented soon!');
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
   * Get a new word (to be implemented in WI-08)
   */
  const handleGetWord = () => {
    // Word selection logic will be added in WI-08
    setFeedback('Word selection will be implemented soon!');
    setUserInput('');
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
          disabled={!currentWord}
          aria-label="Spelling input"
        />
        <button
          type="submit"
          className="submit-button"
          disabled={!currentWord || !userInput.trim()}
        >
          Submit
        </button>
      </form>

      {/* Feedback Section */}
      {feedback && (
        <div className="feedback-section" role="alert">
          <p className="feedback-message">{feedback}</p>
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

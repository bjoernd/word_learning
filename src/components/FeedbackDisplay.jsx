import PropTypes from 'prop-types';
import './FeedbackDisplay.css';

/**
 * FeedbackDisplay Component
 * Shows spelling results with character-by-character comparison
 */
function FeedbackDisplay({ spellCheckResult, onNextWord }) {
  if (!spellCheckResult) {
    return null;
  }

  const { isCorrect, userAnswer, correctAnswer, highlights } = spellCheckResult;

  return (
    <div className="feedback-display">
      {/* Encouraging message */}
      <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
        {isCorrect ? (
          <span className="success-message">Great job! You spelled it correctly!</span>
        ) : (
          <span className="error-message">Not quite right. Try again!</span>
        )}
      </div>

      {/* Spelling comparison - only show if incorrect */}
      {!isCorrect && (
        <div className="spelling-comparison">
          <div className="comparison-section">
            <div className="comparison-label">Your answer:</div>
            <div className="word-display">
              {userAnswer.split('').map((char, index) => (
                <span
                  key={index}
                  className={`letter ${highlights[index] ? 'incorrect' : 'correct'}`}
                >
                  {char}
                </span>
              ))}
              {/* Show missing characters if user's answer is shorter */}
              {highlights.length > userAnswer.length &&
                highlights.slice(userAnswer.length).map((_, index) => (
                  <span key={userAnswer.length + index} className="letter missing">
                    _
                  </span>
                ))}
            </div>
          </div>

          <div className="comparison-section">
            <div className="comparison-label">Correct spelling:</div>
            <div className="word-display correct-word">
              {correctAnswer.split('').map((char, index) => (
                <span key={index} className="letter">
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Word button */}
      <button
        onClick={onNextWord}
        className="next-word-button"
        aria-label="Get next word"
      >
        Next Word
      </button>
    </div>
  );
}

FeedbackDisplay.propTypes = {
  spellCheckResult: PropTypes.shape({
    isCorrect: PropTypes.bool.isRequired,
    userAnswer: PropTypes.string.isRequired,
    correctAnswer: PropTypes.string.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.bool).isRequired,
  }),
  onNextWord: PropTypes.func.isRequired,
};

export default FeedbackDisplay;

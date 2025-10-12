// ABOUTME: Practice component for vocabulary learning sessions with TTS playback and feedback.
// ABOUTME: Manages 10-word sessions, answer validation, scoring, and character-by-character comparison.
import { useState, useEffect, useCallback } from 'react';
import { getRandomWords, getWordCount } from '../../services/database';
import { Word, PracticeWord } from '../../types';
import { speechService } from '../../services/speech';
import { isAnswerCorrect, calculateScore, compareAnswers } from '../../services/practiceLogic';
import styles from './Practice.module.css';

const WORDS_PER_SESSION = 10;
const FEEDBACK_DELAY_MS = 3000;

type FeedbackType = 'correct' | 'incorrect' | null;

export function Practice() {
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PracticeWord[]>([]);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  const playWord = useCallback(async (word: string) => {
    try {
      await speechService.speak(word);
    } catch (err) {
      console.error('Speech error:', err);
    }
  }, []);

  const startSession = useCallback(async () => {
    setIsLoading(true);

    const wordCount = await getWordCount();
    if (wordCount === 0) {
      setIsLoading(false);
      return;
    }

    const words = await getRandomWords(WORDS_PER_SESSION);
    setSessionWords(words);
    setCurrentIndex(0);
    setAnswers([]);
    setUserInput('');
    setFeedback(null);
    setSessionStarted(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    startSession();
  }, [startSession]);

  const handleStart = () => {
    setSessionStarted(true);
    if (sessionWords[currentIndex]) {
      playWord(sessionWords[currentIndex].word);
    }
  };

  const handleReplay = () => {
    if (sessionWords[currentIndex]) {
      playWord(sessionWords[currentIndex].word);
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim() || feedback) return;

    const currentWord = sessionWords[currentIndex];
    const correct = isAnswerCorrect(currentWord.word, userInput);

    const practiceWord: PracticeWord = {
      word: currentWord,
      userAnswer: userInput,
      isCorrect: correct
    };

    const newAnswers = [...answers, practiceWord];
    setAnswers(newAnswers);
    setFeedback(correct ? 'correct' : 'incorrect');

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');

      if (currentIndex + 1 < sessionWords.length) {
        setCurrentIndex(currentIndex + 1);
        playWord(sessionWords[currentIndex + 1].word);
      }
    }, FEEDBACK_DELAY_MS);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const renderCharacterComparison = (correctWord: string, userAnswer: string) => {
    const comparison = compareAnswers(correctWord, userAnswer);
    const correct = correctWord.toLowerCase();
    const user = userAnswer.toLowerCase();

    return (
      <div className={styles.characterComparison}>
        <div className={styles.comparisonRow}>
          <span className={styles.label}>Correct:</span>
          <div className={styles.characters}>
            {correct.split('').map((char, idx) => (
              <span
                key={idx}
                className={`${styles.char} ${
                  comparison[idx] === 'match' ? styles.charMatch :
                  comparison[idx] === 'missing' ? styles.charMissing :
                  styles.charWrong
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.comparisonRow}>
          <span className={styles.label}>Your answer:</span>
          <div className={styles.characters}>
            {user.split('').map((char, idx) => (
              <span
                key={idx}
                className={`${styles.char} ${
                  comparison[idx] === 'match' ? styles.charMatch :
                  comparison[idx] === 'extra' ? styles.charExtra :
                  styles.charWrong
                }`}
              >
                {char}
              </span>
            ))}
            {comparison.slice(user.length).map((match, idx) => (
              match === 'missing' && (
                <span key={user.length + idx} className={`${styles.char} ${styles.charMissing}`}>
                  _
                </span>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (sessionWords.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>No words available for practice.</p>
          <p>Please add some words in the Manage Words tab first.</p>
        </div>
      </div>
    );
  }

  const isSessionComplete = answers.length === sessionWords.length;

  if (isSessionComplete) {
    const score = calculateScore(answers);
    return (
      <div className={styles.container}>
        <div className={styles.summary}>
          <h2>Session Complete!</h2>
          <div className={styles.score}>
            <span className={styles.scoreNumber}>{score}</span>
            <span> out of </span>
            <span className={styles.scoreNumber}>{sessionWords.length}</span>
          </div>
          <button onClick={startSession} className={styles.restartButton}>
            Restart
          </button>
        </div>
      </div>
    );
  }

  const score = calculateScore(answers);
  const lastAnswer = answers[answers.length - 1];

  if (!sessionStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.startPrompt}>
          <h2>Ready to Practice?</h2>
          <p>Click Start to hear the first word.</p>
          <button onClick={handleStart} className={styles.startButton}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.scoreDisplay}>
        Score: {score}/{answers.length}
      </div>

      <div className={styles.practiceArea}>
        <button onClick={handleReplay} className={styles.replayButton}>
          🔊 Replay Word
        </button>

        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type the word you heard"
          className={styles.input}
          disabled={feedback !== null}
          autoFocus
        />

        <button
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={feedback !== null}
        >
          Submit
        </button>

        {feedback && (
          <div className={feedback === 'correct' ? styles.correct : styles.incorrect}>
            {feedback === 'correct' ? (
              <>
                <div className={styles.icon}>✓</div>
                <div className={styles.message}>Correct!</div>
              </>
            ) : (
              <>
                <div className={styles.icon}>✗</div>
                <div className={styles.message}>Incorrect</div>
                {renderCharacterComparison(lastAnswer.word.word, lastAnswer.userAnswer)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

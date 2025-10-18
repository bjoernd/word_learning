// ABOUTME: Practice component for vocabulary learning sessions with TTS playback and feedback.
// ABOUTME: Manages 10-word sessions, answer validation, scoring, and character-by-character comparison.
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getRandomWords, getWordCount } from '../../services/database';
import { Word, PracticeWord } from '../../types';
import { speechService } from '../../services/speech';
import { soundEffectsService } from '../../services/soundEffects';
import { isAnswerCorrect, calculateScore } from '../../services/practiceLogic';
import { handleAudioError } from '../../utils/errorHandling';
import { ConfettiAnimation } from './ConfettiAnimation';
import { SessionSummary } from './SessionSummary';
import { AnswerInput } from './AnswerInput';
import goodAnimation from '../../assets/animations/good.json';
import badAnimation from '../../assets/animations/bad.json';
import styles from './Practice.module.css';

const WORDS_PER_SESSION = 10;
const CORRECT_FEEDBACK_DELAY_MS = 1000;
const INCORRECT_FEEDBACK_DELAY_MS = 3000;
const CONFETTI_MIN_POSITION = 30;
const CONFETTI_POSITION_RANGE = 40;
const GOOD_SCORE_THRESHOLD = 60;

type FeedbackType = 'correct' | 'incorrect' | null;

export function Practice() {
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PracticeWord[]>([]);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [confettiAnimation, setConfettiAnimation] = useState<{
    top: number;
    left: number;
    animationData: unknown;
    key: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const confettiKey = useRef(0);

  const isSessionComplete = useMemo(() => {
    return answers.length === sessionWords.length &&
           sessionWords.length > 0 &&
           feedback === null;
  }, [answers.length, sessionWords.length, feedback]);

  const playWord = useCallback(async (word: string) => {
    try {
      await speechService.speak(word);
    } catch (err) {
      handleAudioError('Speech', err);
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

  useEffect(() => {
    if (sessionStarted && feedback === null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sessionStarted, feedback]);

  useEffect(() => {
    if (feedback === 'correct' || feedback === 'incorrect') {
      // Randomize position: 30-70% from top, 30-70% from left
      const randomTop = CONFETTI_MIN_POSITION + Math.random() * CONFETTI_POSITION_RANGE;
      const randomLeft = CONFETTI_MIN_POSITION + Math.random() * CONFETTI_POSITION_RANGE;
      setConfettiAnimation({
        top: randomTop,
        left: randomLeft,
        animationData: feedback === 'correct' ? goodAnimation : badAnimation,
        key: confettiKey.current++,
      });
    }
  }, [feedback]);

  useEffect(() => {
    if (!isSessionComplete) return;

    const score = calculateScore(answers);
    const scorePercentage = (score / sessionWords.length) * 100;

    if (scorePercentage >= GOOD_SCORE_THRESHOLD) {
      soundEffectsService.play('summary').catch(err => {
        handleAudioError('SoundEffects', err);
      });
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        startSession();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSessionComplete, answers, sessionWords.length, startSession]);

  const handleStart = async () => {
    setSessionStarted(true);
    try {
      await soundEffectsService.play('start');
    } catch (err) {
      console.error('Sound effect error:', err);
    }
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

    soundEffectsService.play(correct ? 'good' : 'bad').catch(err => {
      handleAudioError('SoundEffects', err);
    });

    const delayMs = correct ? CORRECT_FEEDBACK_DELAY_MS : INCORRECT_FEEDBACK_DELAY_MS;
    setTimeout(() => {
      setFeedback(null);
      setUserInput('');

      if (currentIndex + 1 < sessionWords.length) {
        setCurrentIndex(currentIndex + 1);
        playWord(sessionWords[currentIndex + 1].word);
      }
    }, delayMs);
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

  if (isSessionComplete) {
    const score = calculateScore(answers);
    return <SessionSummary score={score} total={sessionWords.length} onRestart={startSession} />;
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
      <AnswerInput
        userInput={userInput}
        onInputChange={setUserInput}
        onSubmit={handleSubmit}
        onReplay={handleReplay}
        feedback={feedback}
        score={score}
        answersCount={answers.length}
        correctWord={lastAnswer?.word.word}
        userAnswer={lastAnswer?.userAnswer}
        inputRef={inputRef}
      />

      {confettiAnimation && (
        <ConfettiAnimation
          key={confettiAnimation.key}
          top={confettiAnimation.top}
          left={confettiAnimation.left}
          animationData={confettiAnimation.animationData}
          onComplete={() => setConfettiAnimation(null)}
        />
      )}
    </div>
  );
}

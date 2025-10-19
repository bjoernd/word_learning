// ABOUTME: UI component for managing the word database
// ABOUTME: Provides interface to add and delete words
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addWord, deleteWord } from '../../services/database';
import { handleEnterKey } from '../../utils/keyboard';
import styles from './WordManager.module.css';

export function WordManager() {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const words = useLiveQuery(() => db.words.toArray()) ?? [];

  const handleAddWord = async () => {
    setErrorMessage('');
    const trimmed = inputValue.trim();
    if (trimmed) {
      try {
        await addWord(trimmed);
        setInputValue('');
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(t('wordManager.message.addFailed'));
        }
      }
    }
  };

  const handleDeleteWord = async (id: number) => {
    if (window.confirm(t('wordManager.message.deleteConfirm'))) {
      await deleteWord(id);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{t('wordManager.heading')}</h2>
        <p className={styles.wordCount}>{t('wordManager.wordCount', { count: words.length })}</p>
      </div>

      <div className={styles.addSection}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => handleEnterKey(e, handleAddWord)}
          placeholder={t('wordManager.input.placeholder')}
          className={styles.input}
          aria-label={t('wordManager.input.ariaLabel')}
        />
        <button onClick={handleAddWord} className={styles.addButton}>
          {t('wordManager.button.add')}
        </button>
      </div>

      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}

      {words.length === 0 ? (
        <p className={styles.emptyMessage}>
          {t('wordManager.message.empty')}
        </p>
      ) : (
        <ul className={styles.wordList}>
          {words.sort((a, b) => a.word.localeCompare(b.word)).map((word) => (
            <li key={word.id} className={styles.wordItem}>
              <span className={styles.wordText}>{word.word}</span>
              <button
                onClick={() => handleDeleteWord(word.id!)}
                className={styles.deleteButton}
                aria-label={t('wordManager.button.deleteAriaLabel', { word: word.word })}
              >
                {t('wordManager.button.delete')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

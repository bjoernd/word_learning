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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
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

  const handleWordItemClick = (id: number, event: React.MouseEvent) => {
    const isMultiSelect = event.ctrlKey || event.metaKey;

    setSelectedIds(prevSelected => {
      const newSelected = new Set(prevSelected);

      if (newSelected.has(id)) {
        // Clicking an already selected item deselects it
        newSelected.delete(id);
      } else if (isMultiSelect) {
        // Ctrl/Cmd+click adds to selection
        newSelected.add(id);
      } else {
        // Regular click replaces selection
        newSelected.clear();
        newSelected.add(id);
      }

      return newSelected;
    });
  };

  const handleDeleteSelected = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    const message = t('wordManager.message.deleteSelectedConfirm', { count });
    if (window.confirm(message)) {
      await Promise.all(Array.from(selectedIds).map(id => deleteWord(id)));
      setSelectedIds(new Set());
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

      {selectedIds.size > 0 && (
        <div className={styles.bulkActions}>
          <button
            onClick={handleDeleteSelected}
            className={styles.deleteSelectedButton}
            aria-label={t('wordManager.button.deleteSelectedAriaLabel', { count: selectedIds.size })}
          >
            {t('wordManager.button.deleteSelected', { count: selectedIds.size })}
          </button>
        </div>
      )}

      {words.length === 0 ? (
        <p className={styles.emptyMessage}>
          {t('wordManager.message.empty')}
        </p>
      ) : (
        <ul className={styles.wordList}>
          {words.sort((a, b) => a.word.localeCompare(b.word)).map((word) => (
            <li
              key={word.id}
              className={`${styles.wordItem} ${selectedIds.has(word.id!) ? styles.selected : ''}`}
              onClick={(e) => handleWordItemClick(word.id!, e)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWordItemClick(word.id!, e as unknown as React.MouseEvent);
                }
              }}
            >
              <span className={styles.wordText}>{word.word}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWord(word.id!);
                }}
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

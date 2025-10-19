// ABOUTME: Voice selector component for testing and choosing TTS voices.
// ABOUTME: Allows keyboard navigation through available voices and plays test phrase.
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { speechService } from '../../services/speech';
import { useVoices } from '../../hooks/useVoices';
import { handleAudioError } from '../../utils/errorHandling';
import styles from './VoiceSelector.module.css';

export function VoiceSelector() {
  const { t } = useTranslation();
  const voices = useVoices((voice) => voice.lang.startsWith('en'));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceVoice, setPracticeVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    setPracticeVoice(speechService.getSelectedVoice());
  }, []);

  const playVoice = async (voiceIndex: number) => {
    if (isPlaying || voiceIndex < 0 || voiceIndex >= voices.length) {
      return;
    }

    setIsPlaying(true);
    try {
      await speechService.speak(t('voiceSelector.voice.testPhrase'), voices[voiceIndex]);
    } catch (err) {
      handleAudioError('Speech', err);
    } finally {
      setIsPlaying(false);
    }
  };

  const setPracticeVoiceHandler = () => {
    const voice = voices[selectedIndex];
    speechService.setSelectedVoice(voice);
    setPracticeVoice(voice);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(voices.length - 1, prev + 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        playVoice(selectedIndex);
        break;
    }
  };

  if (voices.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t('voiceSelector.loading')}</div>
      </div>
    );
  }

  const selectedVoice = voices[selectedIndex];

  return (
    <div className={styles.container} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className={styles.header}>
        <h2>{t('voiceSelector.heading')}</h2>
        <p>{t('voiceSelector.instructions')}</p>
      </div>

      <div className={styles.currentVoice}>
        <h3>{t('voiceSelector.currentlySelected')}</h3>
        <div className={styles.voiceInfo}>
          <div className={styles.voiceName}>{selectedVoice.name}</div>
          <div className={styles.voiceDetails}>
            <span>{t('voiceSelector.voice.language', { lang: selectedVoice.lang })}</span>
            {selectedVoice.default && <span className={styles.badge}>{t('voiceSelector.voice.default')}</span>}
            {selectedVoice.localService && <span className={styles.badge}>{t('voiceSelector.voice.local')}</span>}
          </div>
        </div>
        <div className={styles.buttons}>
          <button
            onClick={() => playVoice(selectedIndex)}
            disabled={isPlaying}
            className={styles.playButton}
          >
            {isPlaying ? t('voiceSelector.voice.playing') : t('voiceSelector.voice.playTest', { phrase: t('voiceSelector.voice.testPhrase') })}
          </button>
          <button
            onClick={setPracticeVoiceHandler}
            className={styles.setPracticeButton}
          >
            {t('voiceSelector.voice.setButton')}
          </button>
        </div>
        {practiceVoice && (
          <div className={styles.practiceInfo}>
            {t('voiceSelector.voice.practiceVoice', { voiceName: practiceVoice.name })}
          </div>
        )}
      </div>

      <div className={styles.voiceList}>
        <h3>{t('voiceSelector.allVoices', { count: voices.length })}</h3>
        <div className={styles.list}>
          {voices.map((voice, index) => (
            <div
              key={index}
              className={`${styles.voiceItem} ${index === selectedIndex ? styles.selected : ''}`}
              onClick={() => setSelectedIndex(index)}
              onDoubleClick={() => playVoice(index)}
            >
              <div className={styles.voiceItemName}>
                {voice.name}
                {practiceVoice?.voiceURI === voice.voiceURI && (
                  <span className={styles.practiceBadge}>{t('voiceSelector.voice.practice')}</span>
                )}
              </div>
              <div className={styles.voiceItemLang}>{voice.lang}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

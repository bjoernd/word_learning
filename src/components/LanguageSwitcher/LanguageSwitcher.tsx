// ABOUTME: Language switcher component for toggling between English and German UI
// ABOUTME: Manages language state with i18next and persists user preference to localStorage

import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('userLanguage', languageCode);
  };

  return (
    <div className={styles.container} role="group" aria-label="Language selection">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`${styles.button} ${i18n.language === lang.code ? styles.active : ''}`}
          aria-pressed={i18n.language === lang.code}
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

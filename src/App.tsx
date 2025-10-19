import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Practice } from './components/Practice/Practice';
import { WordManager } from './components/WordManager/WordManager';
import { VoiceSelector } from './components/VoiceSelector/VoiceSelector';
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher';
import styles from './App.module.css';
import './i18n/config';

type TabType = 'practice' | 'manage' | 'voice';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('practice');

  const tabs = [
    { id: 'practice' as const, label: t('app.nav.practice') },
    { id: 'manage' as const, label: t('app.nav.manageWords') },
    { id: 'voice' as const, label: t('app.nav.voiceSelector') }
  ] as const;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>{t('app.title')}</h1>
            <nav className={styles.nav}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? styles.active : ''}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <main className={styles.main}>
        {activeTab === 'practice' && <Practice />}
        {activeTab === 'manage' && <WordManager />}
        {activeTab === 'voice' && <VoiceSelector />}
      </main>
    </div>
  );
}

export default App;

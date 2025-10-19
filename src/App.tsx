import { useState } from 'react';
import { Practice } from './components/Practice/Practice';
import { WordManager } from './components/WordManager/WordManager';
import { VoiceSelector } from './components/VoiceSelector/VoiceSelector';
import styles from './App.module.css';
import './i18n/config';

type TabType = 'practice' | 'manage' | 'voice';

const TABS = [
  { id: 'practice' as const, label: 'Practice' },
  { id: 'manage' as const, label: 'Manage Words' },
  { id: 'voice' as const, label: 'Voice Selector' }
] as const;

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('practice');

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Word Learning</h1>
        <nav className={styles.nav}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? styles.active : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
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

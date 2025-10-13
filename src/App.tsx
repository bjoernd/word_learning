import { useState } from 'react';
import { Practice } from './components/Practice/Practice';
import { WordManager } from './components/WordManager/WordManager';
import { VoiceSelector } from './components/VoiceSelector/VoiceSelector';
import styles from './App.module.css';

type TabType = 'practice' | 'manage' | 'voice';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('practice');

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Word Learning</h1>
        <nav className={styles.nav}>
          <button
            className={activeTab === 'practice' ? styles.active : ''}
            onClick={() => setActiveTab('practice')}
          >
            Practice
          </button>
          <button
            className={activeTab === 'manage' ? styles.active : ''}
            onClick={() => setActiveTab('manage')}
          >
            Manage Words
          </button>
          <button
            className={activeTab === 'voice' ? styles.active : ''}
            onClick={() => setActiveTab('voice')}
          >
            Voice Selector
          </button>
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

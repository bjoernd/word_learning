import { useState } from 'react';
import { Practice } from './components/Practice/Practice';
import { WordManager } from './components/WordManager/WordManager';
import styles from './App.module.css';

type TabType = 'practice' | 'manage';

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
        </nav>
      </header>
      <main className={styles.main}>
        {activeTab === 'practice' && <Practice />}
        {activeTab === 'manage' && <WordManager />}
      </main>
    </div>
  );
}

export default App;

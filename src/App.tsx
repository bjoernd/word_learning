import { useState } from 'react';
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
        {activeTab === 'practice' && <div>Practice View</div>}
        {activeTab === 'manage' && <div>Manage Words View</div>}
      </main>
    </div>
  );
}

export default App;

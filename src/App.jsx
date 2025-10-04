import { useState } from 'react';
import PracticePane from './components/PracticePane';
import WordsManagement from './components/WordsManagement';
import './App.css';

/**
 * Main App Component
 * Container for the Word Learning app with tab navigation
 */
function App() {
  const [activeTab, setActiveTab] = useState('practice');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Word Learning App</h1>
        <p className="app-subtitle">Practice your spelling!</p>
      </header>

      <nav className="tab-navigation" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'practice'}
          aria-controls="practice-panel"
          className={`tab ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => handleTabChange('practice')}
        >
          Practice
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'manage'}
          aria-controls="manage-panel"
          className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => handleTabChange('manage')}
        >
          Manage Words
        </button>
      </nav>

      <main className="app-content">
        <div
          id="practice-panel"
          role="tabpanel"
          aria-labelledby="practice-tab"
          className={`tab-panel ${activeTab === 'practice' ? 'active' : 'hidden'}`}
        >
          {activeTab === 'practice' && <PracticePane />}
        </div>

        <div
          id="manage-panel"
          role="tabpanel"
          aria-labelledby="manage-tab"
          className={`tab-panel ${activeTab === 'manage' ? 'active' : 'hidden'}`}
        >
          {activeTab === 'manage' && <WordsManagement />}
        </div>
      </main>
    </div>
  );
}

export default App;

import { useState } from 'react';
import './App.css';
import articlesData from './data/articles.json';

type Article = {
  id: string;
  title: string;
  source: string;
  difficulty: string;
  date: string;
  coverImg: string;
  content: string;
};

function App() {
  const [filter, setFilter] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'reader' | 'flashcards' | 'chat'>('reader');
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);

  const filteredArticles = filter === 'All' 
    ? articlesData.articles 
    : articlesData.articles.filter(a => a.difficulty === filter);

  // Mock translation function for UI
  const getMockTranslation = (text: string) => {
    return "AI가 실시간으로 분석한 한국어 해석 및 핵심 문법 포인트가 이곳에 표시됩니다. (예: " + text.substring(0, 30) + "... 의 구조는 주어+동사 형태로 이루어져 있습니다.)";
  };

  const renderDashboard = () => (
    <div className="app-container">
      <header className="header">
        <h1>Gravity English</h1>
        <div className="filter-group">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
            <button 
              key={diff}
              className={`glass-button ${filter === diff ? 'active' : ''}`}
              onClick={() => setFilter(diff)}
            >
              {diff}
            </button>
          ))}
        </div>
      </header>
      
      <div className="articles-grid">
        {filteredArticles.map((article) => (
          <div key={article.id} className="glass-panel article-card" onClick={() => setSelectedArticle(article)}>
            <div className="card-img-wrapper">
              <img src={article.coverImg} alt={article.title} className="card-img" />
            </div>
            <div className="card-meta">
              <span className="source">{article.source}</span>
              <span className={`difficulty diff-${article.difficulty.toLowerCase()}`}>{article.difficulty}</span>
            </div>
            <h3 className="card-title">{article.title}</h3>
            <p className="card-preview">{article.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReader = (article: Article) => {
    const paragraphs = article.content.split('\n\n');
    
    return (
      <div className="app-container reader-view">
        <button className="glass-button back-btn" onClick={() => setSelectedArticle(null)}>
          ← Back to Library
        </button>
        
        <div className="feature-tabs">
          <button className={`glass-button ${activeTab === 'reader' ? 'active' : ''}`} onClick={() => setActiveTab('reader')}>📖 Reader</button>
          <button className={`glass-button ${activeTab === 'flashcards' ? 'active' : ''}`} onClick={() => setActiveTab('flashcards')}>🗂️ Flashcards</button>
          <button className={`glass-button ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Discuss</button>
        </div>

        {activeTab === 'reader' && (
          <div className="glass-panel">
            <div className="reader-header">
              <h1>{article.title}</h1>
              <div className="reader-meta">
                <span>{article.source}</span>
                <span>•</span>
                <span className={`difficulty diff-${article.difficulty.toLowerCase()}`}>{article.difficulty}</span>
              </div>
            </div>
            
            <div className="reader-content">
              {paragraphs.map((p, idx) => (
                <div 
                  key={idx} 
                  className="paragraph-block"
                  onClick={() => setActiveParagraph(activeParagraph === idx ? null : idx)}
                >
                  <p>{p}</p>
                  {activeParagraph === idx && (
                    <div className="translation-panel">
                      {getMockTranslation(p)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
            <h2>Vocabulary Flashcards</h2>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>AI is extracting advanced vocabulary from this article...</p>
            {/* Flashcard UI will be implemented here */}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
            <h2>Discuss with AI</h2>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>I have summarized the article. Let's practice speaking about it!</p>
            {/* Chat UI will be implemented here */}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      {selectedArticle ? renderReader(selectedArticle) : renderDashboard()}
    </div>
  );
}

export default App;

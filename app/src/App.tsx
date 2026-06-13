import { useState, useEffect } from 'react';
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

type SavedWord = {
  id: string;
  word: string;
  meaning: string;
  context: string;
  source: string;
  dateAdded: string;
};

function App() {
  const [filter, setFilter] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'reader' | 'flashcards' | 'chat'>('reader');
  
  // Archive States
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [selectionPos, setSelectionPos] = useState<{x: number, y: number, text: string, context: string} | null>(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load saved words from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('gravity_saved_words');
    if (stored) {
      setSavedWords(JSON.parse(stored));
    }
  }, []);

  const saveToArchive = (word: SavedWord) => {
    const updated = [...savedWords, word];
    setSavedWords(updated);
    localStorage.setItem('gravity_saved_words', JSON.stringify(updated));
  };

  const filteredArticles = filter === 'All' 
    ? articlesData.articles 
    : articlesData.articles.filter(a => a.difficulty === filter);

  // Handle Text Selection for Archiving
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (selection && text && text.length > 1 && text.length < 30) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const parentNode = selection.anchorNode?.parentElement;
      const contextText = parentNode ? parentNode.innerText : text;
      
      setSelectionPos({ 
        x: rect.left + window.scrollX + (rect.width / 2), 
        y: rect.top + window.scrollY - 10, 
        text: text,
        context: contextText
      });
    } else {
      setSelectionPos(null);
    }
  };

  const handleSaveWordClick = () => {
    if (!selectionPos) return;
    
    // Prompt for meaning
    const userMeaning = window.prompt(`'${selectionPos.text}'의 한글 뜻을 입력해 주세요.\n(나중에 적으려면 그냥 확인을 누르세요)`);
    
    const newWord: SavedWord = {
      id: Date.now().toString(),
      word: selectionPos.text,
      meaning: userMeaning || "뜻 미입력",
      context: selectionPos.context,
      source: selectedArticle?.source || "직접 입력",
      dateAdded: new Date().toISOString()
    };
    
    saveToArchive(newWord);
    setSelectionPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIdx((prev) => (prev + 1) % savedWords.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIdx((prev) => (prev - 1 + savedWords.length) % savedWords.length);
    }, 150);
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
          <button className="glass-button" style={{marginLeft: '20px', borderColor: 'var(--accent)'}} onClick={() => { setSelectedArticle(null); setActiveTab('flashcards'); }}>
            📚 내 단어장 ({savedWords.length})
          </button>
        </div>
      </header>
      
      {activeTab === 'flashcards' ? renderFlashcards() : (
        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <div key={article.id} className="glass-panel article-card" onClick={() => { setSelectedArticle(article); setActiveTab('reader'); }}>
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
      )}
    </div>
  );

  const renderFlashcards = () => {
    return (
      <div className="app-container flashcards-container">
        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
          <button className="glass-button back-btn" onClick={() => { setSelectedArticle(null); setActiveTab('reader'); }}>
            ← 뒤로 가기
          </button>
        </div>

        {savedWords.length === 0 ? (
          <div className="glass-panel empty-state">
            <h2>아직 저장된 단어가 없습니다.</h2>
            <p>기사(Reader) 화면에서 모르는 단어를 마우스로 드래그하여 아카이브해 보세요!</p>
          </div>
        ) : (
          <>
            <h2>Flashcards ({currentCardIdx + 1} / {savedWords.length})</h2>
            <div 
              className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-inner">
                <div className="flashcard-front">
                  <h2>{savedWords[currentCardIdx].word}</h2>
                  <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>클릭해서 의미 확인하기</p>
                </div>
                <div className="flashcard-back">
                  <h3 style={{ fontSize: '2rem', color: '#fbbf24', marginBottom: '10px' }}>{savedWords[currentCardIdx].meaning}</h3>
                  <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'white' }}>{savedWords[currentCardIdx].word}</p>
                  
                  <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '15px' }}>
                    <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>"{savedWords[currentCardIdx].context}"</p>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>잡지명: <strong>{savedWords[currentCardIdx].source}</strong></span>
                    <span>저장일: {new Date(savedWords[currentCardIdx].dateAdded).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flashcard-controls">
              <button className="btn-prev" onClick={prevCard}>← 이전 카드</button>
              <button className="btn-next" onClick={nextCard}>다음 카드 →</button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderReader = (article: Article) => {
    const paragraphs = article.content.split('\n\n');
    
    return (
      <div className="app-container reader-view" onMouseUp={handleMouseUp}>
        <button className="glass-button back-btn" onClick={() => { setSelectedArticle(null); setActiveTab('reader'); }}>
          ← 기사 목록으로
        </button>
        
        <div className="feature-tabs">
          <button className={`glass-button ${activeTab === 'reader' ? 'active' : ''}`} onClick={() => setActiveTab('reader')}>📖 Reader</button>
          <button className={`glass-button ${activeTab === 'flashcards' ? 'active' : ''}`} onClick={() => setActiveTab('flashcards')}>🗂️ Flashcards ({savedWords.length})</button>
          <button className={`glass-button ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Discuss</button>
        </div>

        {selectionPos && activeTab === 'reader' && (
          <div 
            className="selection-popup" 
            style={{ left: selectionPos.x, top: selectionPos.y }}
            onMouseDown={(e) => { e.preventDefault(); handleSaveWordClick(); }}
          >
            + 단어 저장 (Archive)
          </div>
        )}

        {activeTab === 'reader' && (
          <div className="glass-panel">
            <div className="reader-header">
              <h1>{article.title}</h1>
              <div className="reader-meta">
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>{article.source}</span>
                <span>•</span>
                <span className={`difficulty diff-${article.difficulty.toLowerCase()}`}>{article.difficulty}</span>
              </div>
            </div>
            
            <div className="reader-content">
              {paragraphs.map((p, idx) => (
                <div key={idx} className="paragraph-block">
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && renderFlashcards()}

        {activeTab === 'chat' && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
            <h2>Discuss with AI</h2>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>I have summarized the article. Let's practice speaking about it!</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      {selectedArticle || activeTab === 'flashcards' ? (selectedArticle ? renderReader(selectedArticle) : renderFlashcards()) : renderDashboard()}
    </div>
  );
}

export default App;

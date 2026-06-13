import { useState, useEffect } from 'react';
import './App.css';

type ArticleIndex = {
  id: string;
  title: string;
  source: string;
  difficulty: string;
  date: string;
  coverImg: string;
  fileUrl: string;
};

type Article = ArticleIndex & {
  content: string;
};

type SavedWord = {
  id: string;
  word: string;
  meaning: string;
  enMeaning: string;
  context: string;
  source: string;
  dateAdded: string;
};

const translationsMap: Record<string, string> = {};

type MainView = 'home' | 'library' | 'flashcards';

function App() {
  const [mainView, setMainView] = useState<MainView>('home');
  const [filter, setFilter] = useState('All');
  
  const [articlesData, setArticlesData] = useState<ArticleIndex[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(true);
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  
  const [activeReaderTab, setActiveReaderTab] = useState<'reader' | 'flashcards' | 'chat'>('reader');
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [selectionPos, setSelectionPos] = useState<{x: number, y: number, text: string, context: string} | null>(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [readArticleIds, setReadArticleIds] = useState<string[]>([]);

  useEffect(() => {
    const storedWords = localStorage.getItem('gravity_saved_words');
    if (storedWords) setSavedWords(JSON.parse(storedWords));

    const storedHistory = localStorage.getItem('gravity_read_history');
    if (storedHistory) setReadArticleIds(JSON.parse(storedHistory));
    
    fetch('/data/index.json')
      .then(res => res.json())
      .then(data => {
        setArticlesData(data.articles || []);
        setIsLoadingIndex(false);
      })
      .catch(err => {
        console.error("Failed to load article index", err);
        setIsLoadingIndex(false);
      });
  }, []);

  const saveToArchive = (word: SavedWord) => {
    const updated = [...savedWords, word];
    setSavedWords(updated);
    localStorage.setItem('gravity_saved_words', JSON.stringify(updated));
  };

  const markAsRead = (articleId: string) => {
    if (!readArticleIds.includes(articleId)) {
      const updated = [...readArticleIds, articleId];
      setReadArticleIds(updated);
      localStorage.setItem('gravity_read_history', JSON.stringify(updated));
    }
  };

  const handleArticleClick = async (articleIndex: ArticleIndex) => {
    setIsLoadingArticle(true);
    try {
      const res = await fetch(articleIndex.fileUrl);
      const fullArticle = await res.json();
      
      markAsRead(fullArticle.id);
      setSelectedArticle(fullArticle);
      setActiveReaderTab('reader');
      setActiveParagraph(null);
    } catch (e) {
      console.error("Failed to load article data", e);
      alert("기사를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const getRecommendations = () => {
    const unread = articlesData.filter(a => !readArticleIds.includes(a.id));
    const sorted = unread.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length < 3) {
      const remaining = 3 - sorted.length;
      const read = articlesData.filter(a => readArticleIds.includes(a.id)).slice(0, remaining);
      return [...sorted, ...read];
    }
    return sorted.slice(0, 3);
  };

  const filteredArticles = filter === 'All' 
    ? articlesData 
    : articlesData.filter(a => a.difficulty === filter);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      if (!isSaving) setSelectionPos(null);
      return;
    }
    
    let text = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    
    if (node.nodeType === Node.TEXT_NODE) {
      const fullText = node.textContent || "";
      let start = range.startOffset;
      let end = range.endOffset;
      while (start > 0 && /[a-zA-Z]/.test(fullText[start - 1])) start--;
      while (end < fullText.length && /[a-zA-Z]/.test(fullText[end])) end++;
      const expandedWord = fullText.substring(start, end).trim();
      if (expandedWord.length > 0) text = expandedWord;
    }

    if (text && text.length >= 1 && text.length < 50) {
      const rect = range.getBoundingClientRect();
      const parentNode = selection.anchorNode?.parentElement;
      const contextText = parentNode ? parentNode.innerText : text;
      
      const container = document.querySelector('.reader-view');
      let x = rect.left + window.scrollX + (rect.width / 2);
      let y = rect.top + window.scrollY - 10;
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        x = rect.left - containerRect.left + (rect.width / 2);
        y = rect.top - containerRect.top - 10;
      }
      
      setSelectionPos({ 
        x, 
        y, 
        text: text,
        context: contextText
      });
    } else {
      if (!isSaving) setSelectionPos(null);
    }
  };

  const handleSaveWordClick = async () => {
    if (!selectionPos) return;
    setIsSaving(true);
    const wordText = selectionPos.text;
    const context = selectionPos.context;
    
    setSelectionPos({ ...selectionPos, text: "저장 중..." });
    
    let autoMeaning = "뜻을 찾을 수 없음";
    let autoEnMeaning = "영어 뜻 없음";
    
    try {
      const resKo = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(wordText)}`);
      const dataKo = await resKo.json();
      autoMeaning = dataKo[0][0][0]; 
      
      const resEn = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordText.split(' ')[0])}`);
      if (resEn.ok) {
        const dataEn = await resEn.json();
        if (dataEn && dataEn[0] && dataEn[0].meanings && dataEn[0].meanings[0].definitions[0]) {
          autoEnMeaning = dataEn[0].meanings[0].definitions[0].definition;
        }
      }
    } catch (e) {
      console.error("사전 API 오류:", e);
    }

    const newWord: SavedWord = {
      id: Date.now().toString(),
      word: wordText,
      meaning: autoMeaning,
      enMeaning: autoEnMeaning,
      context: context,
      source: selectedArticle?.source || "직접 입력",
      dateAdded: new Date().toISOString()
    };
    
    saveToArchive(newWord);
    setIsSaving(false);
    setSelectionPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteWord = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("이 단어를 삭제하시겠습니까?")) {
      const updated = savedWords.filter(w => w.id !== id);
      setSavedWords(updated);
      localStorage.setItem('gravity_saved_words', JSON.stringify(updated));
      if (currentCardIdx >= updated.length) {
        setCurrentCardIdx(Math.max(0, updated.length - 1));
      }
      setIsFlipped(false);
    }
  };

  const handleEditMeaning = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const wordToEdit = savedWords.find(w => w.id === id);
    if (!wordToEdit) return;

    const newMeaning = window.prompt("한글 뜻을 수정하세요:", wordToEdit.meaning);
    if (newMeaning && newMeaning.trim() !== "") {
      const updated = savedWords.map(w => w.id === id ? { ...w, meaning: newMeaning } : w);
      setSavedWords(updated);
      localStorage.setItem('gravity_saved_words', JSON.stringify(updated));
    }
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

  const handleCardClick = () => {
    if (isFlipped) {
      nextCard();
    } else {
      setIsFlipped(true);
    }
  };

  const getTranslation = (text: string) => {
    return translationsMap[text.trim()] || "이 문장에 대한 해석 데이터가 없습니다. (추후 AI 자동 해석 연동 예정)";
  };

  const renderHeader = () => (
    <header className="header">
      <h1 style={{ cursor: 'pointer', margin: 0 }} onClick={() => { setMainView('home'); setSelectedArticle(null); }}>Study English</h1>
      <div className="filter-group">
        <button className={`glass-button ${mainView === 'home' && !selectedArticle ? 'active' : ''}`} onClick={() => { setMainView('home'); setSelectedArticle(null); }}>
          🏠 홈
        </button>
        <button className={`glass-button ${mainView === 'library' && !selectedArticle ? 'active' : ''}`} onClick={() => { setMainView('library'); setSelectedArticle(null); }}>
          📰 전체 기사
        </button>
        <button className={`glass-button ${mainView === 'flashcards' && !selectedArticle ? 'active' : ''}`} style={{ borderColor: 'var(--accent)' }} onClick={() => { setMainView('flashcards'); setSelectedArticle(null); }}>
          📚 내 단어장 ({savedWords.length})
        </button>
      </div>
    </header>
  );

  const renderHome = () => {
    if (isLoadingIndex) return <div className="app-container" style={{textAlign:'center', marginTop:'100px'}}><h2>데이터를 불러오는 중입니다...</h2></div>;
    const recommended = getRecommendations();
    return (
      <div className="app-container">
        {renderHeader()}
        <section>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>🌟 맞춤 추천 기사</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>학습하지 않은 최신 업데이트 기사를 난이도별로 추천합니다.</p>
          <div className="articles-grid">
            {recommended.map((article) => (
              <div key={`rec-${article.id}`} className="glass-panel article-card" style={{ border: '1px solid var(--accent)' }} onClick={() => handleArticleClick(article)}>
                <div className="card-img-wrapper">
                  <img src={article.coverImg} alt={article.title} className="card-img" />
                </div>
                <div className="card-meta">
                  <span className="source">{article.source}</span>
                  <span className={`difficulty diff-${article.difficulty.toLowerCase()}`}>{article.difficulty}</span>
                </div>
                <h3 className="card-title">{article.title}</h3>
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--accent)' }}>클릭해서 읽기</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderLibrary = () => {
    if (isLoadingIndex) return <div className="app-container" style={{textAlign:'center', marginTop:'100px'}}><h2>데이터를 불러오는 중입니다...</h2></div>;
    return (
      <div className="app-container">
        {renderHeader()}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.8rem' }}>📚 전체 기사 탐색 ({filteredArticles.length}개)</h2>
            <div className="filter-group">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                <button 
                  key={diff}
                  className={`glass-button ${filter === diff ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '0.9rem' }}
                  onClick={() => setFilter(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
          
          <div className="articles-grid">
            {filteredArticles.slice(0, 100).map((article) => { // Render only top 100 to prevent lag
              const isRead = readArticleIds.includes(article.id);
              return (
                <div key={article.id} className="glass-panel article-card" style={{ opacity: isRead ? 0.7 : 1 }} onClick={() => handleArticleClick(article)}>
                  <div className="card-img-wrapper">
                    <img src={article.coverImg} alt={article.title} className="card-img" style={{ filter: isRead ? 'grayscale(50%)' : 'none' }} />
                  </div>
                  <div className="card-meta">
                    <span className="source">{article.source}</span>
                    <span className={`difficulty diff-${article.difficulty.toLowerCase()}`}>{article.difficulty}</span>
                  </div>
                  <h3 className="card-title">{article.title}</h3>
                  {isRead && <div style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>✓ 학습 완료</div>}
                </div>
              );
            })}
          </div>
          {filteredArticles.length > 100 && (
             <div style={{textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)'}}>...스크롤 최적화를 위해 100개만 표시 중입니다...</div>
          )}
        </section>
      </div>
    );
  };

  const renderFlashcardsList = (words: SavedWord[], title: string) => {
    if (words.length === 0) {
      return (
        <div className="glass-panel empty-state" style={{ marginTop: '40px' }}>
          <h2>저장된 단어가 없습니다.</h2>
          <p>기사 화면에서 모르는 단어를 마우스로 드래그하여 아카이브해 보세요!</p>
        </div>
      );
    }

    const currentWord = words[currentCardIdx] || words[0];

    return (
      <div className="flashcards-container" style={{ marginTop: '20px' }}>
        <h2>{title} ({currentCardIdx + 1} / {words.length})</h2>
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
          onClick={handleCardClick}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="card-actions">
                <button className="icon-btn" onClick={(e) => handleDeleteWord(e, currentWord.id)} title="단어 삭제">🗑️</button>
              </div>
              <h2>{currentWord.word}</h2>
              <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>클릭해서 의미 확인하기</p>
            </div>
            
            <div className="flashcard-back">
              <div className="card-actions">
                <button className="icon-btn" onClick={(e) => handleEditMeaning(e, currentWord.id)} title="한글 뜻 수정">✏️</button>
                <button className="icon-btn" onClick={(e) => handleDeleteWord(e, currentWord.id)} title="단어 삭제">🗑️</button>
              </div>
              
              <h3 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '5px' }}>{currentWord.word}</h3>
              
              <div style={{ padding: '15px 0', width: '100%' }}>
                <p style={{ fontSize: '1.4rem', color: '#fbbf24', marginBottom: '10px', fontWeight: 'bold', fontStyle: 'normal' }}>
                  {currentWord.meaning}
                </p>
                <p style={{ fontSize: '1rem', color: '#94a3b8', fontStyle: 'normal', marginBottom: '20px' }}>
                  {currentWord.enMeaning || "영어 뜻 없음"}
                </p>
              </div>
              
              <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '20px', width: '100%', textAlign: 'left' }}>
                <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', fontSize: '1rem', lineHeight: '1.5' }}>
                  "{currentWord.context}"
                </p>
              </div>
              
              <div style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                <span>출처: <strong>{currentWord.source}</strong></span>
                <span>저장일: {new Date(currentWord.dateAdded).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flashcard-controls">
          <button className="btn-prev" onClick={(e) => { e.stopPropagation(); prevCard(); }}>← 이전 카드</button>
          <button className="btn-next" onClick={(e) => { e.stopPropagation(); nextCard(); }}>다음 카드 →</button>
        </div>
      </div>
    );
  };

  const renderFlashcards = () => {
    return (
      <div className="app-container">
        {renderHeader()}
        {renderFlashcardsList(savedWords, "내 전체 단어장")}
      </div>
    );
  };

  const renderReader = (article: Article) => {
    const paragraphs = article.content.split('\n\n');
    const articleWords = savedWords.filter(w => w.source === article.source);
    
    return (
      <div className="app-container reader-view" onMouseUp={handleMouseUp}>
        <button className="glass-button back-btn" onClick={() => { setSelectedArticle(null); setMainView('home'); }}>
          ← 홈으로
        </button>
        
        <div className="feature-tabs">
          <button className={`glass-button ${activeReaderTab === 'reader' ? 'active' : ''}`} onClick={() => setActiveReaderTab('reader')}>📖 기사 읽기</button>
          <button className={`glass-button ${activeReaderTab === 'flashcards' ? 'active' : ''}`} onClick={() => { setActiveReaderTab('flashcards'); setCurrentCardIdx(0); setIsFlipped(false); }}>
            🗂️ 이 기사 단어장 ({articleWords.length})
          </button>
          <button className={`glass-button ${activeReaderTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveReaderTab('chat')}>💬 토론</button>
        </div>

        {selectionPos && activeReaderTab === 'reader' && (
          <div 
            className="selection-popup" 
            style={{ left: selectionPos.x, top: selectionPos.y }}
            onMouseDown={(e) => { e.preventDefault(); handleSaveWordClick(); }}
          >
            {isSaving ? "저장 중..." : "+저장"}
          </div>
        )}

        {activeReaderTab === 'reader' && (
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
                <div 
                  key={idx} 
                  className="paragraph-block"
                  onClick={() => setActiveParagraph(activeParagraph === idx ? null : idx)}
                >
                  <p>{p}</p>
                  {activeParagraph === idx && (
                    <div className="translation-panel">
                      {getTranslation(p)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeReaderTab === 'flashcards' && (
          <div className="glass-panel" style={{ padding: '20px' }}>
             {renderFlashcardsList(articleWords, `'${article.source}' 학습 단어`)}
          </div>
        )}

        {activeReaderTab === 'chat' && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
            <h2>Discuss with AI</h2>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>AI와 함께 이 기사의 핵심 내용을 영어로 토론해 보세요! (준비 중)</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      {isLoadingArticle ? (
        <div className="app-container" style={{textAlign:'center', marginTop:'100px'}}><h2>기사 데이터를 불러오는 중입니다...</h2></div>
      ) : selectedArticle ? (
        renderReader(selectedArticle) 
      ) : (
        mainView === 'home' ? renderHome() : mainView === 'library' ? renderLibrary() : renderFlashcards()
      )}
    </div>
  );
}

export default App;

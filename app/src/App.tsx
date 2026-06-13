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
  enMeaning: string;
  context: string;
  source: string;
  dateAdded: string;
};

const translationsMap: Record<string, string> = {
  "The global economy is facing unprecedented challenges as inflation rates hover near historical highs while central banks attempt a delicate soft landing. Analysts predict that emerging markets will bear the brunt of capital flight, though tech-driven productivity gains might offset some losses.": 
    "세계 경제는 인플레이션율이 역사적 최고치에 근접하고 중앙은행들이 섬세한 연착륙을 시도함에 따라 전례 없는 도전에 직면해 있습니다. 분석가들은 신흥 시장이 자본 유출의 가장 큰 타격을 입을 것이라고 예측하지만, 기술 주도의 생산성 향상이 일부 손실을 상쇄할 수도 있습니다.",
  "However, there are silver linings. The rapid adoption of artificial intelligence in corporate sectors has led to a 15% increase in operational efficiency across Fortune 500 companies. This technological renaissance could be the catalyst for the next economic supercycle.":
    "하지만 희망적인 측면도 있습니다. 기업 부문에서 인공지능의 빠른 도입은 포춘 500대 기업 전반에 걸쳐 운영 효율성을 15% 증가시켰습니다. 이러한 기술의 부흥은 다음 경제 슈퍼사이클의 촉매제가 될 수 있습니다.",
  "Artificial Intelligence is everywhere. We use it when we search the internet, watch movies, and even drive our cars. But with great power comes great responsibility. People are starting to ask important questions about how AI makes decisions.":
    "인공지능은 어디에나 있습니다. 우리는 인터넷을 검색하고, 영화를 보며, 심지어 운전을 할 때도 그것을 사용합니다. 하지만 큰 힘에는 큰 책임이 따릅니다. 사람들은 AI가 어떻게 결정을 내리는지에 대한 중요한 질문을 하기 시작했습니다.",
  "For example, if a self-driving car makes a mistake, who is responsible? The company, the programmer, or the car itself? These ethical questions are very important for our future.":
    "예를 들어, 자율주행차가 실수를 한다면 누구의 책임일까요? 회사, 프로그래머, 아니면 자동차 자체일까요? 이러한 윤리적 질문들은 우리의 미래를 위해 매우 중요합니다.",
  "Humanity's journey into the cosmos is accelerating at an astonishing pace. With private companies launching reusable rockets, the cost of entering low Earth orbit has dropped significantly. NASA's Artemis program aims to establish a sustainable human presence on the Moon by the end of the decade.":
    "인류의 우주를 향한 여정은 놀라운 속도로 가속화되고 있습니다. 민간 기업들이 재사용 가능한 로켓을 발사하면서 지구 저궤도 진입 비용이 크게 떨어졌습니다. NASA의 아르테미스 프로그램은 10년 안에 달에 지속 가능한 인류의 거점을 구축하는 것을 목표로 하고 있습니다.",
  "Beyond the Moon, the ultimate goal remains Mars. However, the psychological and physical toll of long-duration spaceflight poses significant hurdles. Scientists are developing new habitation modules and radiation shielding to protect astronauts on their journey.":
    "달 너머, 궁극적인 목표는 여전히 화성입니다. 그러나 장기 우주 비행에 따른 심리적, 신체적 피해는 상당한 장애물이 됩니다. 과학자들은 우주 비행사들을 보호하기 위해 새로운 거주 모듈과 방사선 차폐 장치를 개발하고 있습니다."
};

type MainView = 'home' | 'library' | 'flashcards';

function App() {
  const [mainView, setMainView] = useState<MainView>('home');
  const [filter, setFilter] = useState('All');
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeReaderTab, setActiveReaderTab] = useState<'reader' | 'flashcards' | 'chat'>('reader');
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  
  // Archive States
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [selectionPos, setSelectionPos] = useState<{x: number, y: number, text: string, context: string} | null>(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Read History State
  const [readArticleIds, setReadArticleIds] = useState<string[]>([]);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const storedWords = localStorage.getItem('gravity_saved_words');
    if (storedWords) setSavedWords(JSON.parse(storedWords));

    const storedHistory = localStorage.getItem('gravity_read_history');
    if (storedHistory) setReadArticleIds(JSON.parse(storedHistory));
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

  const handleArticleClick = (article: Article) => {
    markAsRead(article.id);
    setSelectedArticle(article);
    setActiveReaderTab('reader');
    setActiveParagraph(null);
  };

  const getRecommendations = () => {
    const unread = articlesData.articles.filter(a => !readArticleIds.includes(a.id));
    const sorted = unread.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length < 3) {
      const remaining = 3 - sorted.length;
      const read = articlesData.articles.filter(a => readArticleIds.includes(a.id)).slice(0, remaining);
      return [...sorted, ...read];
    }
    return sorted.slice(0, 3);
  };

  const filteredArticles = filter === 'All' 
    ? articlesData.articles 
    : articlesData.articles.filter(a => a.difficulty === filter);

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
      // 1. 한국어 번역 가져오기
      const resKo = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(wordText)}`);
      const dataKo = await resKo.json();
      autoMeaning = dataKo[0][0][0]; 
      
      // 2. 영어 영영사전 정의 가져오기
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
    e.stopPropagation(); // 카드 뒤집힘 방지
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
    e.stopPropagation(); // 카드 뒤집힘 방지
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
                <p className="card-preview">{article.content}</p>
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--accent)' }}>추천 완료!</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderLibrary = () => {
    return (
      <div className="app-container">
        {renderHeader()}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.8rem' }}>📚 전체 기사 탐색</h2>
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
            {filteredArticles.map((article) => {
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
                  <p className="card-preview">{article.content}</p>
                  {isRead && <div style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>✓ 학습 완료</div>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  // 플래시카드 공통 렌더링 함수 (전체 단어장 및 기사 전용 단어장 통합)
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
          onClick={() => setIsFlipped(!isFlipped)}
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
                {/* 한글 뜻: 기울임 없음, 정자체 */}
                <p style={{ fontSize: '1.4rem', color: '#fbbf24', marginBottom: '10px', fontWeight: 'bold', fontStyle: 'normal' }}>
                  {currentWord.meaning}
                </p>
                {/* 영영 뜻 추가 */}
                <p style={{ fontSize: '1rem', color: '#94a3b8', fontStyle: 'normal', marginBottom: '20px' }}>
                  {currentWord.enMeaning || "영어 뜻 없음"}
                </p>
              </div>
              
              {/* 예문 박스 */}
              <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '20px', width: '100%', textAlign: 'left' }}>
                <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', fontSize: '1rem', lineHeight: '1.5' }}>
                  "{currentWord.context}"
                </p>
              </div>
              
              {/* 박스 내부 하단 출처/날짜 */}
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
    
    // 기사 단어장 전용 단어 필터링 (현재 기사와 소스가 같거나 문맥이 일치하는 단어)
    const articleWords = savedWords.filter(w => w.source === article.source);
    
    return (
      <div className="app-container reader-view" onMouseUp={handleMouseUp}>
        <button className="glass-button back-btn" onClick={() => { setSelectedArticle(null); setMainView('home'); }}>
          ← 대시보드로
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

        {/* 개별 기사 단어장 작동 기능 추가 */}
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
      {selectedArticle 
        ? renderReader(selectedArticle) 
        : (mainView === 'home' ? renderHome() : mainView === 'library' ? renderLibrary() : renderFlashcards())
      }
    </div>
  );
}

export default App;

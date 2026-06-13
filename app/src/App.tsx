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

// Hardcoded translations for the sample articles to make it look real
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

function App() {
  const [filter, setFilter] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'reader' | 'flashcards' | 'chat'>('reader');
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  
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

  const getTranslation = (text: string) => {
    return translationsMap[text.trim()] || "이 문장에 대한 해석 데이터가 없습니다. (추후 AI 자동 해석이 연동될 예정입니다)";
  };

  const renderDashboard = () => (
    <div className="app-container">
      <header className="header">
        <h1>Study English</h1>
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
            <div key={article.id} className="glass-panel article-card" onClick={() => { setSelectedArticle(article); setActiveTab('reader'); setActiveParagraph(null); }}>
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
                  {/* 영어 단어 / 한글 뜻 / 예문 순서 배치 */}
                  <h3 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '5px' }}>{savedWords[currentCardIdx].word}</h3>
                  <p style={{ fontSize: '1.5rem', color: '#fbbf24', marginBottom: '25px', fontWeight: 'bold' }}>{savedWords[currentCardIdx].meaning}</p>
                  
                  <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '15px', width: '100%' }}>
                    <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', fontSize: '1rem', lineHeight: '1.4' }}>"{savedWords[currentCardIdx].context}"</p>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto' }}>
                    <span>출처: <strong>{savedWords[currentCardIdx].source}</strong></span>
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
                <div 
                  key={idx} 
                  className="paragraph-block"
                  onClick={() => setActiveParagraph(activeParagraph === idx ? null : idx)}
                >
                  <p>{p}</p>
                  {/* 문단 클릭 시 해당 문단의 실제 한글 해석을 보여줌 */}
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

import { useState, useEffect, useRef } from 'react';
import './App.css';

type ArticleIndex = {
  id: string;
  title: string;
  source: string;
  issue?: string;
  difficulty: string;
  date: string;
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

type MainView = 'home' | 'library' | 'flashcards' | 'difficulty';

function App() {
  const [mainView, setMainView] = useState<MainView>('home');
  const [filter, setFilter] = useState('All');
  
  const [articlesData, setArticlesData] = useState<ArticleIndex[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(true);
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  
  const [activeReaderTab, setActiveReaderTab] = useState<'reader' | 'flashcards' | 'study'>('reader');
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [selectionPos, setSelectionPos] = useState<{x: number, y: number, text: string, context: string} | null>(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [readArticleIds, setReadArticleIds] = useState<string[]>([]);
  
  const [libView, setLibView] = useState<'magazines' | 'issues' | 'articles'>('magazines');
  const [selectedMag, setSelectedMag] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const [diffView, setDiffView] = useState<'levels' | 'articles'>('levels');
  const [selectedDiff, setSelectedDiff] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [studyMode, setStudyMode] = useState<'writing' | 'speaking'>('writing');
  const [studyInput, setStudyInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [studyFeedback, setStudyFeedback] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [isTranslating, setIsTranslating] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const storedWords = localStorage.getItem('gravity_saved_words');
    if (storedWords) setSavedWords(JSON.parse(storedWords));

    const storedHistory = localStorage.getItem('gravity_read_history');
    if (storedHistory) setReadArticleIds(JSON.parse(storedHistory));
    
    const storedKey = localStorage.getItem('gravity_gemini_api_key');
    if (storedKey) setApiKey(storedKey);

    if ('webkitSpeechRecognition' in window && !recognitionRef.current) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
    
    fetch(import.meta.env.BASE_URL + 'data/index.json')
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
      const finalUrl = articleIndex.fileUrl.startsWith('/') ? import.meta.env.BASE_URL + articleIndex.fileUrl.slice(1) : articleIndex.fileUrl;
      const res = await fetch(finalUrl);
      const fullArticle = await res.json();
      
      markAsRead(fullArticle.id);
      setSelectedArticle(fullArticle);
      setActiveReaderTab('reader');
      setActiveParagraph(null);
      setTranslations({});
      setIsTranslating({});
      setStudyInput('');
      setStudyFeedback(null);
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

  useEffect(() => {
    let timeoutId: any;
    const handleSelection = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
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
          try {
            const rect = range.getBoundingClientRect();
            if (rect.width === 0) return;
            
            const container = document.querySelector('.reader-view');
            if (!container) return;
            const containerRect = container.getBoundingClientRect();
            
            let x = rect.left - containerRect.left + (rect.width / 2);
            let y = rect.bottom - containerRect.top + 15;
            
            if (x < 50) x = 50;
            if (x > containerRect.width - 50) x = containerRect.width - 50;
            
            const parentNode = selection.anchorNode?.parentElement;
            const contextText = parentNode ? parentNode.innerText : text;
            
            setSelectionPos({ 
              x, 
              y, 
              text: text,
              context: contextText
            });
          } catch(e) {}
        }
      }, 100);
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      clearTimeout(timeoutId);
    };
  }, [isSaving]);

  const handleSaveWord = async (wordText: string, context: string) => {
    setIsSaving(true);
    
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

  const handleParagraphFetch = async (idx: number, text: string) => {
    if (translations[idx] || isTranslating[idx]) return;
    setIsTranslating(prev => ({ ...prev, [idx]: true }));
    try {
      let meaning = "";
      if (apiKey) {
        const prompt = `Translate this English text to Korean. Use concise casual language (반말, e.g. ~다, ~했다) to save tokens. Just output the translation without any markdown or quotes.\n\nText: ${text}`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        meaning = data.candidates[0].content.parts[0].text.trim();
      } else {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        meaning = data[0].map((t: any) => t[0]).join('');
      }
      setTranslations(prev => ({ ...prev, [idx]: meaning }));
    } catch (e) {
      setTranslations(prev => ({ ...prev, [idx]: "번역 실패" }));
    } finally {
      setIsTranslating(prev => ({ ...prev, [idx]: false }));
    }
  };

  const evaluateWithAI = async () => {
    if (!apiKey) {
      alert("설정(⚙️)에서 Gemini API Key를 먼저 등록해주세요!");
      return;
    }
    if (!studyInput.trim() || !selectedArticle) return;
    
    setIsEvaluating(true);
    setStudyFeedback(null);
    
    const prompt = `You are an expert English teacher. The user has practiced their ${studyMode} skills based on the following article:
Title: ${selectedArticle.title}
Content: ${selectedArticle.content}

Here is the user's ${studyMode} submission:
"${studyInput}"

Evaluate the submission. Provide:
1. A Score out of 100.
2. Grammar & Vocabulary Feedback (point out errors and suggest corrections).
3. Expression & Flow Feedback (how natural it sounds).
4. Overall Feedback (in Korean).

Write ALL feedback (except the score) in Korean using concise casual language (반말, e.g., ~다, ~했다) to save tokens.
Format your response strictly in JSON format like this, do NOT wrap in markdown code blocks:
{
  "score": 85,
  "grammarFeedback": "...",
  "flowFeedback": "...",
  "overallFeedback": "..."
}`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      const responseText = data.candidates[0].content.parts[0].text;
      let parsed = {};
      try {
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        parsed = { overallFeedback: responseText, score: 0, grammarFeedback: "결과를 파싱할 수 없습니다.", flowFeedback: "" };
      }
      setStudyFeedback(parsed);
    } catch (e: any) {
      alert("평가 중 오류가 발생했습니다: " + e.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setStudyInput(prev => (prev ? prev + ' ' : '') + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  };

  const renderHeader = () => (
    <header className="header">
      <h1 style={{ cursor: 'pointer', margin: 0 }} onClick={() => { setMainView('home'); setSelectedArticle(null); }}>Study English</h1>
      <div className="filter-group">
        <button className={`glass-button ${mainView === 'home' && !selectedArticle ? 'active' : ''}`} onClick={() => { setMainView('home'); setSelectedArticle(null); }}>
          🏠 홈
        </button>
        <button className={`glass-button ${mainView === 'library' && !selectedArticle ? 'active' : ''}`} onClick={() => { setMainView('library'); setLibView('magazines'); setSelectedArticle(null); }}>
          📰 전체 기사
        </button>
        <button className={`glass-button ${mainView === 'difficulty' && !selectedArticle ? 'active' : ''}`} onClick={() => { setMainView('difficulty'); setDiffView('levels'); setSelectedArticle(null); }}>
          ⭐️ 난이도별 학습
        </button>
        <button className={`glass-button ${mainView === 'flashcards' && !selectedArticle ? 'active' : ''}`} style={{ borderColor: 'var(--accent)' }} onClick={() => { setMainView('flashcards'); setSelectedArticle(null); }}>
          📚 내 단어장 ({savedWords.length})
        </button>
        <button className="glass-button" onClick={() => setIsSettingsOpen(true)}>⚙️ 설정</button>
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

  const renderDifficulty = () => {
    if (isLoadingIndex) return <div className="app-container" style={{textAlign:'center', marginTop:'100px'}}><h2>데이터를 불러오는 중입니다...</h2></div>;
    
    if (diffView === 'levels') {
      const levels = Array.from(new Set(articlesData.map(a => a.difficulty))).filter(Boolean).sort();
      const sortedLevels = ['Beginner', 'Intermediate', 'Advanced'];
      levels.forEach(l => { if (!sortedLevels.includes(l)) sortedLevels.push(l); });

      return (
        <div className="app-container">
          {renderHeader()}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.8rem' }}>⭐️ 난이도 선택</h2>
            </div>
            <div className="articles-grid">
              {sortedLevels.map((lvl) => {
                const count = articlesData.filter(a => a.difficulty === lvl).length;
                if (count === 0) return null;
                return (
                  <div key={lvl} className="glass-panel article-card" onClick={() => { setSelectedDiff(lvl); setDiffView('articles'); }}>
                    <div className="card-meta">
                      <span className={`difficulty diff-${lvl.toLowerCase()}`}>{lvl}</span>
                    </div>
                    <h3 className="card-title" style={{ textAlign: 'center', fontSize: '1.6rem', marginTop: '15px' }}>{lvl}</h3>
                    <div style={{ textAlign: 'center', marginTop: '15px', color: 'var(--text-muted)' }}>{count}개의 기사</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      );
    } else {
      const arts = articlesData.filter(a => a.difficulty === selectedDiff);
      return (
        <div className="app-container">
          {renderHeader()}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <button className="glass-button" style={{ marginBottom: '10px' }} onClick={() => setDiffView('levels')}>← 뒤로가기</button>
                <h2 style={{ fontSize: '1.8rem' }}>📑 {selectedDiff} 전체 기사 ({arts.length}개)</h2>
              </div>
            </div>
            
            <div className="articles-grid">
              {arts.map((article) => {
                const isRead = readArticleIds.includes(article.id);
                return (
                  <div key={article.id} className="glass-panel article-card" style={{ opacity: isRead ? 0.7 : 1 }} onClick={() => handleArticleClick(article)}>
                    <div className="card-meta">
                      <span className="source">{article.source}</span>
                      <span className={`difficulty diff-${article.difficulty.toLowerCase()}`}>{article.difficulty}</span>
                    </div>
                    <h3 className="card-title">{article.title}</h3>
                    {isRead && <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>✓ 학습 완료</div>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      );
    }
  };

  const renderLibrary = () => {
    if (isLoadingIndex) return <div className="app-container" style={{textAlign:'center', marginTop:'100px'}}><h2>데이터를 불러오는 중입니다...</h2></div>;
    
    if (libView === 'magazines') {
      const mags = Array.from(new Set(filteredArticles.map(a => a.source))).sort();
      return (
        <div className="app-container">
          {renderHeader()}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.8rem' }}>📚 잡지 선택</h2>
            </div>
            <div className="articles-grid">
              {mags.map((mag) => (
                <div key={mag} className="glass-panel article-card" onClick={() => { setSelectedMag(mag); setLibView('issues'); }}>
                  <h3 className="card-title" style={{ textAlign: 'center', fontSize: '1.4rem' }}>{mag}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    } else if (libView === 'issues') {
      const issues = Array.from(new Set(filteredArticles.filter(a => a.source === selectedMag).map(a => a.issue || 'Unknown Issue'))).sort();
      return (
        <div className="app-container">
          {renderHeader()}
          <section>
            <button className="glass-button" style={{ marginBottom: '20px' }} onClick={() => setLibView('magazines')}>← 뒤로가기</button>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>📰 {selectedMag} - 발행호 선택</h2>
            <div className="articles-grid">
              {issues.map((iss) => (
                <div key={iss} className="glass-panel article-card" onClick={() => { setSelectedIssue(iss); setLibView('articles'); }}>
                  <h3 className="card-title" style={{ textAlign: 'center', fontSize: '1.2rem' }}>{iss}</h3>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    } else {
      const arts = filteredArticles.filter(a => a.source === selectedMag && (a.issue === selectedIssue || (!a.issue && selectedIssue === 'Unknown Issue')));
      return (
        <div className="app-container">
          {renderHeader()}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <button className="glass-button" style={{ marginBottom: '10px' }} onClick={() => setLibView('issues')}>← 뒤로가기</button>
                <h2 style={{ fontSize: '1.8rem' }}>📑 {selectedIssue} 기사 목록 ({arts.length}개)</h2>
              </div>
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
              {arts.map((article) => {
                const isRead = readArticleIds.includes(article.id);
                return (
                  <div key={article.id} className="glass-panel article-card" style={{ opacity: isRead ? 0.7 : 1 }} onClick={() => handleArticleClick(article)}>
                    <div className="card-meta">
                      <span className="source">{article.source}</span>
                      <span className={`difficulty diff-${article.difficulty.toLowerCase()}`}>{article.difficulty}</span>
                    </div>
                    <h3 className="card-title">{article.title}</h3>
                    {isRead && <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>✓ 학습 완료</div>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      );
    }
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
    
    let displayContext = currentWord?.context || "";
    if (displayContext.length > 80 && currentWord?.word) {
      const sents = displayContext.match(/[^.!?]+[.!?]+["']?\s*/g);
      if (sents) {
        const matchingSent = sents.find(s => s.toLowerCase().includes(currentWord.word.toLowerCase()));
        if (matchingSent) displayContext = matchingSent.trim();
      }
    }

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
                  "{displayContext}"
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
    const sentences: string[] = [];
    article.content.split('\n\n').forEach(p => {
      const sents = p.match(/[^.!?]+[.!?]+["']?\s*/g);
      if (sents) {
        sentences.push(...sents.map(s => s.trim()));
      } else {
        if (p.trim()) sentences.push(p.trim());
      }
    });
    const articleWords = savedWords.filter(w => w.source === article.source);
    
    return (
      <div className="app-container reader-view">
        <button className="glass-button back-btn" onClick={() => { setSelectedArticle(null); setMainView('home'); }}>
          ← 홈으로
        </button>
        
        <div className="feature-tabs">
          <button className={`glass-button ${activeReaderTab === 'reader' ? 'active' : ''}`} onClick={() => setActiveReaderTab('reader')}>📖 읽기</button>
          <button className={`glass-button ${activeReaderTab === 'flashcards' ? 'active' : ''}`} onClick={() => { setActiveReaderTab('flashcards'); setCurrentCardIdx(0); setIsFlipped(false); }}>
            🗂️ 단어장 ({articleWords.length})
          </button>
          <button className={`glass-button ${activeReaderTab === 'study' ? 'active' : ''}`} onClick={() => setActiveReaderTab('study')}>📝 쓰기/말하기</button>
        </div>

        {selectionPos && activeReaderTab === 'reader' && (
          <div 
            className="selection-popup"
            style={{ left: selectionPos.x, top: selectionPos.y }}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onClick={() => handleSaveWord(selectionPos.text, selectionPos.context)}
          >
            {isSaving ? "저장 중..." : "+ 저장"}
          </div>
        )}

        {activeReaderTab === 'reader' && (
          <div className="glass-panel">
            <div className="reader-header">
              <h1>{article.title}</h1>
              <div className="reader-meta">
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>{article.issue || article.source}</span>
                <span>•</span>
                <span className={`difficulty diff-${article.difficulty.toLowerCase()}`}>{article.difficulty}</span>
              </div>
            </div>
            
            <div className="reader-content">
              {sentences.map((p, idx) => (
                <div 
                  key={idx} 
                  className="paragraph-block"
                  onClick={() => {
                    setActiveParagraph(activeParagraph === idx ? null : idx);
                    if (activeParagraph !== idx) handleParagraphFetch(idx, p);
                  }}
                >
                  <p>{p}</p>
                  {activeParagraph === idx && (
                    <div className="translation-panel">
                      {isTranslating[idx] ? "해석 중..." : (translations[idx] || "이 문장에 대한 해석 데이터를 가져오지 못했습니다.")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeReaderTab === 'flashcards' && (
          <div className="glass-panel" style={{ padding: '20px' }}>
             {renderFlashcardsList(articleWords, `'${article.source}' 주요 단어`)}
          </div>
        )}

        {activeReaderTab === 'study' && (
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>📝 실전 학습 모드</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
              <button className={`glass-button ${studyMode === 'writing' ? 'active' : ''}`} onClick={() => { setStudyMode('writing'); setStudyInput(''); setStudyFeedback(null); }}>✍️ Writing</button>
              <button className={`glass-button ${studyMode === 'speaking' ? 'active' : ''}`} onClick={() => { setStudyMode('speaking'); setStudyInput(''); setStudyFeedback(null); }}>🎙️ Speaking</button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              {studyMode === 'writing' ? '기사를 읽고 느낀 점이나 요약을 자유롭게 영어로 작성해보세요.' : '마이크를 켜고 기사에 대한 요약이나 감상평을 영어로 말해보세요.'}
            </p>
            
            {studyMode === 'speaking' && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button 
                  onClick={toggleRecording} 
                  style={{ 
                    padding: '15px 30px', 
                    fontSize: '1.2rem', 
                    borderRadius: '30px', 
                    border: 'none', 
                    background: isRecording ? '#ef4444' : 'var(--primary)', 
                    color: isRecording ? 'white' : '#0f172a',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: isRecording ? '0 0 15px #ef4444' : 'none',
                    transition: 'all 0.3s'
                  }}
                >
                  {isRecording ? '⏹️ 녹음 중지' : '🎙️ 녹음 시작'}
                </button>
                {isRecording && <div style={{ marginTop: '10px', color: '#ef4444' }}>음성을 인식하고 있습니다...</div>}
              </div>
            )}
            
            <textarea
              value={studyInput}
              onChange={(e) => setStudyInput(e.target.value)}
              placeholder={studyMode === 'writing' ? "여기에 영어로 작성해주세요..." : "음성을 인식하면 이곳에 텍스트가 표시됩니다. 필요시 직접 수정할 수도 있습니다."}
              style={{
                width: '100%',
                height: '150px',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: '1rem',
                lineHeight: '1.5',
                resize: 'vertical',
                marginBottom: '20px'
              }}
            />
            
            <div style={{ textAlign: 'right' }}>
              <button 
                className="glass-button" 
                onClick={evaluateWithAI} 
                disabled={isEvaluating || !studyInput.trim()}
                style={{ background: 'var(--accent)', color: 'white', opacity: (isEvaluating || !studyInput.trim()) ? 0.5 : 1 }}
              >
                {isEvaluating ? '평가 중...' : '✨ AI 피드백 받기'}
              </button>
            </div>
            
            {studyFeedback && (
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid var(--accent)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  📊 AI 평가 결과
                  <span style={{ fontSize: '2rem', color: 'white' }}>{studyFeedback.score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100점</span></span>
                </h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#a78bfa', marginBottom: '8px' }}>🔍 문법 & 어휘 피드백</h4>
                  <p style={{ lineHeight: '1.6' }}>{studyFeedback.grammarFeedback}</p>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#34d399', marginBottom: '8px' }}>🌊 표현 & 흐름 피드백</h4>
                  <p style={{ lineHeight: '1.6' }}>{studyFeedback.flowFeedback}</p>
                </div>
                
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: '15px' }}>
                  <h4 style={{ color: 'white', marginBottom: '8px' }}>💡 총평</h4>
                  <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>{studyFeedback.overallFeedback}</p>
                </div>
              </div>
            )}
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
      ) : mainView === 'home' ? (
        renderHome()
      ) : mainView === 'library' ? (
        renderLibrary()
      ) : mainView === 'difficulty' ? (
        renderDifficulty()
      ) : (
        renderFlashcards()
      )}
      
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ width: '400px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>⚙️ 설정</h2>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>Gemini API Key</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="AIzaSy..." 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)', color: 'white', marginBottom: '10px' }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* 입력하신 API 키는 브라우저 로컬 저장소에만 안전하게 보관됩니다.</p>
            </div>
            <button className="glass-button" style={{ marginTop: '20px', width: '100%', background: 'var(--primary)', color: '#0f172a' }} onClick={() => {
              localStorage.setItem('gravity_gemini_api_key', apiKey);
              setIsSettingsOpen(false);
            }}>
              저장 및 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

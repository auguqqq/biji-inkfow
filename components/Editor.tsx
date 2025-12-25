
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lock, Sparkles, MessageSquare, Send, ChevronDown, ChevronUp, BrainCircuit, RotateCcw, User, Bot, Loader2, PartyPopper, Trophy, FileText, Target, Zap, CheckCircle2 } from 'lucide-react';
import { AppSettings, BlackHouseConfig, Chapter, Book } from '../types';
import { GoogleGenAI } from "@google/genai";

interface EditorProps {
  chapter: Chapter;
  book: Book;
  setChapterTitle: (val: string) => void;
  setChapterContent: (val: string) => void;
  setChapterSynopsis: (val: string) => void;
  setNextChapterSynopsis: (val: string) => void;
  onFinishBook: () => void;
  onAddNextChapter: (synopsis: string) => void;
  focusMode: boolean;
  settings: AppSettings;
  blackHouse?: BlackHouseConfig;
  isDirty?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const countActualChars = (text: string): number => {
  if (!text) return 0;
  const matches = text.match(/[\u4e00-\u9fa5a-zA-Z0-9]/g);
  return matches ? matches.length : 0;
};

const Editor: React.FC<EditorProps> = ({ 
  chapter, 
  book,
  setChapterTitle, 
  setChapterContent, 
  setChapterSynopsis, 
  setNextChapterSynopsis,
  onFinishBook,
  onAddNextChapter,
  focusMode, 
  settings, 
  blackHouse, 
  isDirty 
}) => {
  const [timeProgress, setTimeProgress] = useState(0);
  
  const activeProgress = useMemo(() => {
    if (!blackHouse || !focusMode) return 0;
    if (blackHouse.type === 'word') {
      return Math.min(100, (blackHouse.currentProgress / blackHouse.target) * 100);
    }
    return timeProgress;
  }, [blackHouse, focusMode, timeProgress]);

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [synopsisExpanded, setSynopsisExpanded] = useState(true);
  const [showFinishedEffect, setShowFinishedEffect] = useState(false);
  const [finishStats, setFinishStats] = useState({ words: 0, chapters: 0, time: 0 });
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatTopRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const effectiveTheme = settings.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'white') : settings.theme;
  const themeStyles = { cream: 'bg-[#f8f5f0]', white: 'bg-white', dark: 'bg-[#1a1a1a]', green: 'bg-[#e8f5e9]' };
  const textColors = { cream: 'text-gray-800', white: 'text-gray-800', dark: 'text-gray-100', green: 'text-[#1b5e20]' };

  const focusBgClass = focusMode 
    ? (effectiveTheme === 'dark' ? 'bg-black' : 'bg-[#fefdfb]') 
    : themeStyles[effectiveTheme as keyof typeof themeStyles];

  useEffect(() => {
    let interval: any;
    if (focusMode && blackHouse?.type === 'time' && blackHouse.startTime) {
      const targetSeconds = blackHouse.target * 60;
      const update = () => {
        const elapsed = (Date.now() - blackHouse.startTime!) / 1000;
        setTimeProgress(Math.min(100, (elapsed / targetSeconds) * 100));
      };
      update();
      interval = setInterval(update, 1000);
    }
    return () => clearInterval(interval);
  }, [focusMode, blackHouse]);

  // AI Chat scroll management
  useEffect(() => {
    if (aiLoading) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiLoading, chatLog]);

  // Handle textarea auto-resize based on content length
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Minimum height to ensure it takes up space, plus padding
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 600)}px`;
    }
  }, [chapter.content]);

  const handleEditorReview = async () => {
    if (chapter.content.length < 50) return alert("写多一点再来让责编评估吧！");
    setAiLoading(true);
    setIsAiPanelOpen(true);
    setChatLog([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `作为一个资深网文责编，请对以下章节进行全面评估。
      请按以下结构输出，并在每一项后空两行：
      1. ##剧情复盘：概括本章核心剧情（50字内）。
      2. ##文本评估：简述文笔、节奏及人物互动亮点与改进空间。
      3. ##剧情走向建议：基于现有文本提供3个逻辑自洽的后续方向。
      4. ##下一章方向总结：根据最合理的预期给出引导式总结（50字内）。
      
      要求：语气专业干练，禁止倾斜字体，对关键点进行加粗。禁止包含markdown代码块。
      
      章节内容：\n${chapter.content}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      const aiText = response.text?.trim() || "未能生成评估。";
      
      const parts = aiText.split('\n\n').filter(p => p.trim());
      
      // Simulate natural reading pace: send parts one by one
      for (let i = 0; i < parts.length; i++) {
        // Average reading speed simulation: about 200ms per 10 characters or minimum 1sec
        const delay = Math.max(1000, parts[i].length * 15);
        await new Promise(resolve => setTimeout(resolve, i === 0 ? 0 : delay)); 
        setChatLog(prev => [...prev, { role: 'assistant', content: parts[i] }]);
      }
      
      // Once all messages are sent, scroll back to top for user to read from start
      setTimeout(() => {
        chatTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);

    } catch (e) {
      console.error(e);
      setChatLog([{ role: 'assistant', content: "责编连接中断，请重试。" }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiDialogue = async (msg: string) => {
    if (msg.includes("本文完结")) {
      const totalWords = book.chapters.reduce((sum, c) => sum + countActualChars(c.content), 0);
      const totalTime = Math.round((Date.now() - book.createdAt) / 60000); 
      setFinishStats({ words: totalWords, chapters: book.chapters.length, time: totalTime });
      setShowFinishedEffect(true);
      onFinishBook();
      return;
    }

    setAiLoading(true);
    setChatLog(prev => [...prev, { role: 'user', content: msg }]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemContext = `你是一个资深文学责编。作者正在和你讨论创作。
      1. 仅提供方向建议，不要直接帮作者写正文。
      2. 语气简洁专业，对关键词加粗。
      3. 若达成下一章共识，请以 "##下一章方向总结" 开头总结。`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: msg,
        config: { systemInstruction: systemContext }
      });
      const aiText = response.text?.trim() || "思绪中断。";
      const parts = aiText.split('\n\n').filter(p => p.trim());
      for (const part of parts) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setChatLog(prev => [...prev, { role: 'assistant', content: part }]);
      }
    } catch (e) {
      console.error(e);
      setChatLog(prev => [...prev, { role: 'assistant', content: "灵感检索中断。" }]);
    } finally {
      setAiLoading(false);
    }
  };

  const updateSynopsis = (text: string, type: 'current' | 'next') => {
    const prefix = type === 'current' ? '##剧情复盘' : '##下一章方向总结';
    
    // Clean text logic: Remove markdown syntax and prefixes to keep it "regular text"
    let clean = text.replace(prefix, '')
                    .replace(/[:：]/, '')
                    .replace(/#/g, '')
                    .replace(/\*\*/g, '')
                    .trim();
    
    // Take only the first paragraph and cap length
    clean = clean.split('\n')[0].slice(0, 100);
    
    if (type === 'current') {
      setChapterSynopsis(clean);
      alert('已更新本章复盘（纯文本）');
    } else {
      onAddNextChapter(clean);
      setChatLog(prev => [...prev, { role: 'assistant', content: "好的，我已经为您同步了下一章方向到梗概区。加油！✨" }]);
      setTimeout(() => setIsAiPanelOpen(false), 2000);
    }
  };

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-amber-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`h-full w-full flex flex-col items-center transition-all duration-500 relative overflow-hidden ${focusBgClass}`}>
      {/* Finished Effect Layer */}
      {showFinishedEffect && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-white/20 text-center max-w-lg w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200" />
              <Trophy size={60} className="text-amber-500 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-gray-800 serif mb-8 tracking-[0.3em]">全 书 完 结</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">作品总字数</span>
                  <span className="text-xl font-black text-amber-600 font-mono">{finishStats.words}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">总创作章节</span>
                  <span className="text-xl font-black text-gray-700 font-mono">{finishStats.chapters}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 col-span-2">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">累计时长</span>
                  <span className="text-xl font-black text-gray-700 font-mono">{finishStats.time} 分钟</span>
                </div>
              </div>
              
              <button onClick={() => setShowFinishedEffect(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg flex items-center justify-center space-x-2">
                <CheckCircle2 size={18} />
                <span>归 档 文 件</span>
              </button>
           </div>
        </div>
      )}

      {focusMode && (
        <div className="absolute top-0 left-0 right-0 h-1 z-50 bg-gray-100">
          <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all duration-1000" style={{ width: `${activeProgress}%` }} />
        </div>
      )}

      {/* Primary Scrollable Container - Unified scroll logic for title, synopsis and writing content */}
      <div ref={mainScrollRef} className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col relative scroll-smooth">
        
        {/* Sticky Header Section - Remains fixed at top while writing area scrolls "underneath" or follows logically */}
        <div className={`w-full max-w-4xl mx-auto px-10 pt-10 pb-6 border-b transition-all duration-300 sticky top-0 z-40 ${focusMode ? (effectiveTheme === 'dark' ? 'bg-black/90' : 'bg-white/90') : (effectiveTheme === 'dark' ? 'bg-[#1a1a1a]/95' : 'bg-[#f8f5f0]/95')} backdrop-blur-xl`}>
          <div className="flex items-center space-x-4 mb-4">
              <div className="flex-grow flex items-center">
                <input 
                  value={chapter.title}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="请输入章节标题"
                  className={`w-full bg-transparent border-none focus:outline-none text-2xl font-black serif tracking-tight ${textColors[effectiveTheme as keyof typeof textColors]} placeholder:text-gray-300`}
                />
              </div>
              <button onClick={() => setSynopsisExpanded(!synopsisExpanded)} className="p-2 text-gray-300 hover:text-amber-600 transition-colors">
                  {synopsisExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
          </div>
          
          {synopsisExpanded && (
              <textarea 
                  value={chapter.synopsis}
                  onChange={(e) => setChapterSynopsis(e.target.value)}
                  placeholder="本章剧情梗概（纯文本模式）..."
                  className="w-full h-14 bg-amber-50/10 rounded-xl p-3 text-xs text-gray-500 border border-amber-200/20 resize-none focus:outline-none focus:border-amber-400 focus:bg-amber-50/20 transition-all custom-scrollbar leading-relaxed"
              />
          )}
        </div>

        {/* Main Content Area - Flexible height textarea that expands container */}
        <div className="w-full max-w-4xl mx-auto px-10 py-10 flex-grow">
          <textarea
            ref={textareaRef}
            value={chapter.content}
            onChange={(e) => setChapterContent(e.target.value)}
            placeholder="笔耕不辍，字字千金..."
            style={{ 
              fontSize: `${settings.fontSize}px`, 
              lineHeight: settings.lineHeight, 
              fontFamily: settings.fontFamily === 'serif' ? '"Noto Serif SC", serif' : '"Noto Sans SC", sans-serif' 
            }}
            className={`w-full bg-transparent resize-none focus:outline-none transition-all ${textColors[effectiveTheme as keyof typeof textColors]} placeholder:text-gray-200 caret-amber-600 overflow-hidden`}
            autoFocus
            spellCheck={false}
          />
          {/* Spacer to allow scrolling past the end of the text */}
          <div className="h-[50vh] pointer-events-none" />
        </div>
      </div>

      {/* AI Assistant Sidebar Toggle */}
      {!focusMode && (
          <button 
            onClick={() => {
              if (isAiPanelOpen) {
                setIsAiPanelOpen(false);
              } else {
                handleEditorReview();
              }
            }}
            className="fixed bottom-10 right-[24rem] z-40 p-4 bg-amber-600 text-white rounded-full shadow-2xl hover:bg-amber-700 transition-all hover:scale-110 active:scale-95 flex items-center space-x-2 border-2 border-white/20"
          >
            <BrainCircuit size={20} />
            <span className="text-sm font-bold">责编建议</span>
          </button>
      )}

      {/* AI Editor Assistant Panel */}
      {isAiPanelOpen && (
        <div className="fixed bottom-6 right-[24rem] w-[26rem] h-[36rem] bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col z-50 animate-in slide-in-from-right-4">
            <div className="p-5 bg-amber-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2"><Bot size={18} /> <span className="text-xs font-black uppercase tracking-widest">文学责编 · 实时报告</span></div>
                <button onClick={() => setIsAiPanelOpen(false)} className="p-1 hover:bg-white/10 rounded-lg"><ChevronDown size={20} /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-5 custom-scrollbar bg-gray-50/40 relative">
                <div ref={chatTopRef} />
                {chatLog.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-3 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                      <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${msg.role === 'user' ? 'bg-amber-100 text-amber-600' : 'bg-white shadow-sm border border-gray-100 text-gray-400'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                        : 'bg-white border border-gray-100 text-gray-700 shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{renderText(msg.content)}</div>
                        
                        {/* Interactive Buttons - Show only for assistant and when not loading */}
                        {msg.role === 'assistant' && !aiLoading && (
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 pt-3">
                            {msg.content.includes("剧情复盘") && (
                                <button 
                                  onClick={() => updateSynopsis(msg.content, 'current')}
                                  className="text-[10px] px-2 py-1 bg-amber-50 text-amber-600 font-bold rounded hover:bg-amber-100 transition-colors flex items-center"
                                >
                                  <FileText size={10} className="mr-1" /> 同步梗概
                                </button>
                            )}
                            {msg.content.includes("下一章方向总结") && (
                                <button 
                                  onClick={() => updateSynopsis(msg.content, 'next')}
                                  className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 font-bold rounded hover:bg-emerald-100 transition-colors flex items-center"
                                >
                                  <Target size={10} className="mr-1" /> 下一章共识
                                </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-2">
                      <Loader2 size={16} className="animate-spin text-amber-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">正在深度研读...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-5 bg-white border-t border-gray-100">
              <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiDialogue(userInput);
                      setUserInput('');
                    }
                  }}
                  placeholder="深入探讨剧情或输入“本文完结”..."
                  className="flex-grow bg-transparent text-xs p-2 focus:outline-none resize-none h-10 custom-scrollbar"
                />
                <button 
                  onClick={() => { handleAiDialogue(userInput); setUserInput(''); }}
                  disabled={!userInput.trim() || aiLoading}
                  className="p-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Editor;

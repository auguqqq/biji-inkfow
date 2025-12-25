
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Search, Loader2, ExternalLink, Sparkles, Globe } from 'lucide-react';

type SearchEngine = 'ai' | 'google' | 'baidu' | 'bing';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<SearchEngine>('ai');
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);

  const engines = [
    { id: 'ai' as SearchEngine, name: 'AI智能', icon: <Sparkles size={14} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'google' as SearchEngine, name: 'Google', icon: <Globe size={14} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'baidu' as SearchEngine, name: '百度', icon: <Search size={14} />, color: 'text-blue-700', bg: 'bg-blue-50' },
    { id: 'bing' as SearchEngine, name: 'Bing', icon: <Globe size={14} />, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    if (engine === 'ai') {
      setLoading(true);
      setResult(null);
      try {
        // Always use process.env.API_KEY directly when initializing the @google/genai client instance
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `作为一个小说资料检索助手，请针对以下主题提供详尽的创作背景资料、历史知识或器物设定：${query}`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text || "未能获取检索结果。";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        setResult({ text, sources });
      } catch (err) {
        console.error(err);
        setResult({ text: "AI 检索遇到了一些困难，请检查网络或稍后再试。", sources: [] });
      } finally {
        setLoading(false);
      }
    } else {
      // 外部引擎搜索
      let url = '';
      switch (engine) {
        case 'google': url = `https://www.google.com/search?q=${encodeURIComponent(query)}`; break;
        case 'baidu': url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`; break;
        case 'bing': url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`; break;
      }
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-4 flex flex-col h-full bg-inherit">
      {/* Engine Switcher */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-4 border border-gray-200">
        {engines.map((eng) => (
          <button
            key={eng.id}
            onClick={() => setEngine(eng.id)}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
              // Fix: Changed eng.eng.id to eng.id to resolve Property 'eng' does not exist error
              engine === eng.id 
              ? `bg-white shadow-sm ${eng.color}` 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {eng.icon}
            <span>{eng.name}</span>
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={engine === 'ai' ? "查找历史背景、器物知识..." : `在 ${engine === 'baidu' ? '百度' : engine} 中搜索...`}
          className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
        <button 
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors shadow-sm"
        >
          {engine === 'ai' ? <Sparkles size={14} /> : <ExternalLink size={14} />}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
                <Loader2 className="animate-spin text-amber-500" size={40} />
                <Sparkles size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-300 animate-pulse" />
            </div>
            <p className="text-sm font-medium">AI 正在深度检索与分析资料...</p>
          </div>
        ) : result ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 shadow-sm">
              <h3 className="text-xs font-black text-amber-600 uppercase mb-4 flex items-center tracking-widest">
                <Sparkles size={14} className="mr-2" />
                智能检索分析
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap serif">
                {result.text}
              </div>
            </div>

            {result.sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 px-1 uppercase tracking-widest">溯源资料库</h4>
                <div className="grid gap-2">
                    {result.sources.map((src: any, i: number) => (
                    src.web && (
                        <a 
                        key={i} 
                        href={src.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-start p-3 bg-white border border-gray-100 rounded-xl hover:border-amber-300 hover:shadow-md transition-all active:scale-[0.98]"
                        >
                        <div className="flex-grow mr-2 overflow-hidden">
                            <p className="text-xs font-bold text-gray-700 line-clamp-1 group-hover:text-amber-700 transition-colors">{src.web.title || "互联网文献资料"}</p>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 italic">{src.web.uri}</p>
                        </div>
                        <ExternalLink size={12} className="text-gray-300 mt-1 shrink-0 group-hover:text-amber-500" />
                        </a>
                    )
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-100 text-gray-200`}>
              {engine === 'ai' ? <Sparkles size={32} /> : <Globe size={32} />}
            </div>
            <h4 className="text-sm font-bold text-gray-400 mb-2">
                {engine === 'ai' ? '博采众长，文思泉涌' : `使用 ${engines.find(e => e.id === engine)?.name} 搜索`}
            </h4>
            <p className="text-xs text-gray-300 font-light italic">
                {engine === 'ai' ? '输入创作中遇到的专业名词或历史背景，AI 将为您检索整理相关资料。' : '搜索结果将在新窗口中打开。'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;

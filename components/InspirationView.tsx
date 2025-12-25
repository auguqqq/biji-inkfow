
import React, { useState } from 'react';
import { Inspiration } from '../types';
import { PlusCircle, Clock, Trash2, Sparkles } from 'lucide-react';

interface InspirationProps {
  items: Inspiration[];
  setItems: React.Dispatch<React.SetStateAction<Inspiration[]>>;
}

const InspirationView: React.FC<InspirationProps> = ({ items, setItems }) => {
  const [newText, setNewText] = useState('');

  const addInspiration = () => {
    if (!newText.trim()) return;
    const item: Inspiration = {
      id: Date.now().toString(),
      text: newText,
      timestamp: Date.now()
    };
    setItems([item, ...items]);
    setNewText('');
  };

  const removeInspiration = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="p-6 flex flex-col h-full bg-inherit">
      <div className="mb-8">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="在此捕捉一闪而过的灵感火花..."
          className="w-full p-4 border border-gray-100 rounded-3xl text-sm bg-gray-50 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 resize-none h-32 transition-all custom-scrollbar"
        />
        <button 
          onClick={addInspiration}
          disabled={!newText.trim()}
          className="mt-3 w-full flex items-center justify-center space-x-2 py-3 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 disabled:opacity-50 disabled:grayscale transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-600/20 active:scale-95"
        >
          <PlusCircle size={18} />
          <span>存入灵感仓库</span>
        </button>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-2">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center">
            <Sparkles size={12} className="mr-2" /> 历史碎片
        </h3>
        {items.map(item => (
          <div key={item.id} className="group p-4 bg-white border border-gray-100 rounded-2xl hover:border-amber-200 hover:shadow-lg transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
            <p className="text-sm text-gray-700 leading-relaxed mb-3 pr-4">{item.text}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center text-[10px] text-gray-300 font-bold space-x-1">
                <Clock size={10} />
                <span>{new Date(item.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <button 
                    onClick={() => removeInspiration(item.id)}
                    className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={12} />
                </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-20 text-gray-400/50 flex flex-col items-center">
            <Sparkles size={40} className="mb-4 opacity-10" />
            <p className="text-xs font-bold italic tracking-widest">虚位以待，捕捉你的惊雷一闪</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspirationView;

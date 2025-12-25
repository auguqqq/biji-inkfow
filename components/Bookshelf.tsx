
import React, { useState, useRef } from 'react';
import { Plus, Book as BookIcon, MoreVertical, Edit2, Download, Trash2, Image as ImageIcon, Check, X, Upload, CheckCircle2 } from 'lucide-react';
import { Book } from '../types';

interface BookshelfProps {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  onSelectBook: (id: string) => void;
}

const Bookshelf: React.FC<BookshelfProps> = ({ books, setBooks, onSelectBook }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverTargetId, setCoverTargetId] = useState<string | null>(null);

  const addNewBook = () => {
    const id = `book-${Date.now()}`;
    const colors = ['bg-amber-700', 'bg-emerald-800', 'bg-blue-900', 'bg-red-900', 'bg-indigo-900', 'bg-slate-800'];
    const newBook: Book = {
      id,
      title: '未命名大作',
      coverColor: colors[Math.floor(Math.random() * colors.length)],
      currentChapterId: 'chapter-1',
      chapters: [
        { id: 'chapter-1', title: '第 1 章', content: '', synopsis: '在这里输入本章梗概...', lastModified: Date.now() }
      ],
      isFinished: false,
      // Fix: Added missing createdAt property required by Book type
      createdAt: Date.now()
    };
    setBooks([newBook, ...books]);
  };

  const deleteBook = (id: string) => {
    if (confirm('确定要删除这部作品吗？此操作无法恢复。')) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const startRename = (book: Book) => {
    setEditingId(book.id);
    setEditTitle(book.title);
    setActiveMenu(null);
  };

  const saveRename = () => {
    if (editTitle.trim()) {
      setBooks(books.map(b => b.id === editingId ? { ...b, title: editTitle } : b));
    }
    setEditingId(null);
  };

  const exportFullBook = (book: Book) => {
    const fullText = book.chapters.map(c => `【${c.title}】\n\n${c.content}\n\n`).join('--- 分章线 ---\n\n');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title}_全本导出.txt`;
    link.click();
    setActiveMenu(null);
  };

  const triggerCoverUpload = (bookId: string) => {
    setCoverTargetId(bookId);
    fileInputRef.current?.click();
    setActiveMenu(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && coverTargetId) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setBooks(prev => prev.map(b => b.id === coverTargetId ? { ...b, coverImage: base64 } : b));
      };
      reader.readAsDataURL(file);
    }
    setCoverTargetId(null);
  };

  const handleSelect = (book: Book) => {
    if (editingId) return;
    const latestChapter = [...book.chapters].sort((a, b) => b.lastModified - a.lastModified)[0];
    onSelectBook(book.id);
  };

  return (
    <div className="p-12 h-full overflow-y-auto custom-scrollbar">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCoverChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">我的书架</h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">共创作了 {books.length} 部作品</p>
          </div>
          <button onClick={addNewBook} className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-2xl hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 active:scale-95">
            <Plus size={22} />
            <span className="font-bold">新建作品</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12">
          {books.map(book => (
            <div key={book.id} className={`group relative flex flex-col ${book.isFinished ? 'grayscale-[0.5] opacity-80' : ''}`}>
              <div 
                className={`aspect-[3/4.2] rounded-r-2xl shadow-2xl ${book.coverColor} relative overflow-hidden flex flex-col p-6 transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] cursor-pointer`}
                onClick={() => handleSelect(book)}
              >
                {book.coverImage && (
                  <img src={book.coverImage} className="absolute inset-0 w-full h-full object-cover" alt={book.title} />
                )}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/10 z-10" />
                <div className="flex-grow flex flex-col justify-center text-center px-2 relative z-10">
                  {editingId === book.id ? (
                    <div className="flex flex-col space-y-2" onClick={e => e.stopPropagation()}>
                       <input 
                         autoFocus
                         value={editTitle}
                         onChange={e => setEditTitle(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && saveRename()}
                         className="bg-white/90 text-gray-800 text-center font-bold text-sm p-2 rounded-lg border border-white/40 focus:outline-none"
                       />
                       <div className="flex justify-center space-x-2">
                         <button onClick={saveRename} className="p-1 bg-emerald-500 text-white rounded"><Check size={16} /></button>
                         <button onClick={() => setEditingId(null)} className="p-1 bg-red-500 text-white rounded"><X size={16} /></button>
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <h3 className={`text-white font-black text-xl serif leading-tight line-clamp-3 ${book.coverImage ? 'bg-black/40 backdrop-blur-sm p-3 rounded-lg' : 'drop-shadow-md'}`}>
                        {book.title}
                      </h3>
                      {book.isFinished && (
                        <div className="mt-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">已 完 结</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-auto flex justify-between items-center text-white/70 text-[10px] font-black uppercase tracking-widest relative z-10">
                  <span className={book.coverImage ? 'bg-black/40 px-2 py-1 rounded' : ''}>{book.chapters.length} 章节</span>
                  <BookIcon size={14} className={book.coverImage ? 'drop-shadow-md' : ''} />
                </div>
              </div>

              <div className="mt-5 flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{book.title}</h4>
                    {book.isFinished && <CheckCircle2 size={12} className="text-emerald-500" />}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">最后活跃: {new Date(Math.max(...book.chapters.map(c => c.lastModified))).toLocaleDateString()}</p>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === book.id ? null : book.id);
                    }}
                    className="text-gray-300 hover:text-gray-600 transition-colors p-1"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {activeMenu === book.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                      <button onClick={() => startRename(book)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center space-x-2">
                        <Edit2 size={14} /> <span>重命名</span>
                      </button>
                      <button onClick={() => triggerCoverUpload(book.id)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center space-x-2">
                        <ImageIcon size={14} /> <span>导入封面</span>
                      </button>
                      <button onClick={() => exportFullBook(book)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center space-x-2">
                        <Download size={14} /> <span>全书导出</span>
                      </button>
                      <div className="h-px bg-gray-50 my-1" />
                      <button onClick={() => deleteBook(book.id)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center space-x-2">
                        <Trash2 size={14} /> <span>删除作品</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button onClick={addNewBook} className="aspect-[3/4.2] border-2 border-dashed border-gray-200 rounded-r-2xl flex flex-col items-center justify-center text-gray-300 hover:border-amber-300 hover:text-amber-500 transition-all cursor-pointer group">
            <Plus size={48} className="transition-transform group-hover:scale-125" />
            <span className="text-xs mt-3 font-black uppercase tracking-widest">开启新篇章</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bookshelf;

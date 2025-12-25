
import React from 'react';
import { AppSettings } from '../types';
import { Type, Layout, Settings, Palette, Save, Monitor } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {
  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-8 h-full overflow-y-auto pb-20">
      {/* 界面主题 */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
          <Palette size={14} className="mr-2" />
          阅读配色
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'system', name: '随动系统', icon: <Monitor size={14} />, bg: 'bg-gray-200', border: 'border-gray-300' },
            { id: 'cream', name: '象牙白', bg: 'bg-[#f8f5f0]', border: 'border-amber-200' },
            { id: 'white', name: '纯白', bg: 'bg-white', border: 'border-gray-200' },
            { id: 'green', name: '护眼绿', bg: 'bg-[#e8f5e9]', border: 'border-green-200' },
            { id: 'dark', name: '水墨黑', bg: 'bg-[#1a1a1a]', border: 'border-gray-800' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => updateSetting('theme', t.id)}
              className={`p-3 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                settings.theme === t.id ? 'border-amber-500 shadow-sm bg-amber-50/10' : 'border-transparent bg-gray-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${t.bg} border ${t.border} flex items-center justify-center`}>
                {t.id === 'system' && <Monitor size={10} className="text-gray-500" />}
              </div>
              <span className={`text-xs font-bold ${settings.theme === t.id ? 'text-amber-700' : 'text-gray-500'}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 字体排版 */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
          <Type size={14} className="mr-2" />
          排版设置
        </h3>
        
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-600">字体大小 ({settings.fontSize}px)</label>
            </div>
            <input 
              type="range" min="14" max="32" step="1"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-gray-600">行间距 ({settings.lineHeight})</label>
            </div>
            <input 
              type="range" min="1.4" max="2.4" step="0.1"
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-gray-600">字体族</span>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <button 
                onClick={() => updateSetting('fontFamily', 'serif')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${settings.fontFamily === 'serif' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400'}`}
              >
                衬线
              </button>
              <button 
                onClick={() => updateSetting('fontFamily', 'sans')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${settings.fontFamily === 'sans' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400'}`}
              >
                无衬线
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 系统偏好 */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
          <Settings size={14} className="mr-2" />
          系统偏好
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-3">
              <Save size={16} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-600">自动保存间隔</span>
            </div>
            <select 
              value={settings.autoSaveInterval}
              onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-amber-600 focus:outline-none"
            >
              <option value={30}>30秒</option>
              <option value={60}>1分钟</option>
              <option value={300}>5分钟</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-3">
              <Layout size={16} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-600">保存时自动排版</span>
            </div>
            <button 
              onClick={() => updateSetting('autoFormatOnSave', !settings.autoFormatOnSave)}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.autoFormatOnSave ? 'bg-amber-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.autoFormatOnSave ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsView;

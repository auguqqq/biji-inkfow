
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // 渲染后尝试关闭 HTML 的加载遮罩
  setTimeout(() => {
    if ((window as any).hideLoading) (window as any).hideLoading();
  }, 1000);
}

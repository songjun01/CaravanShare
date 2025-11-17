// client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // 메인 App 컴포넌트를 가져옵니다.
import './index.css'; // Tailwind CSS를 포함한 전역 CSS 파일을 가져옵니다.

/**
 * ReactDOM.createRoot()는 React 18의 Concurrent Mode를 활성화하는 새로운 API입니다.
 * public/index.html 파일에 있는 id가 'root'인 DOM 요소를 React 앱의 루트로 지정합니다.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>는 잠재적인 문제를 감지하고 경고를 표시해주는 개발용 도구입니다.
  <React.StrictMode>
    {/* App 컴포넌트를 렌더링합니다. 이 App 컴포넌트가 전체 애플리케이션의 시작점이 됩니다. */}
    <App />
  </React.StrictMode>,
);

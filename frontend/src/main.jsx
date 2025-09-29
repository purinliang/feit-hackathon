// src/main.jsx (或 .tsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 别忘了导入 React Flow 的基础样式// 旧的（错误的）：
// import '@react-flow/core/dist/style.css'; 

// 新的（正确的）：
import '@xyflow/react/dist/style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
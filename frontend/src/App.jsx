// src/App.jsx
// src/App.jsx
import "./App.css";
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Stepper, Step, StepLabel, Typography } from "@mui/material"; // 导入 MUI 的 Box, Button, Stepper, Step, StepLabel, Typography 组件
import GraphPage from './pages/GraphPage'; // 导入 GraphPage 组件
import ResultPage from './pages/ResultPage'; // 导入 ResultPage 组件

// 定义一个主应用组件，包含路由和整体布局
function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const steps = ['Introduction', 'Graph Interaction', 'Results'];
  const [activeStep, setActiveStep] = useState(0); // 0-indexed for array

  // 根据当前路由更新 activeStep
  useEffect(() => {
    if (location.pathname === '/graph') {
      setActiveStep(1); // 'Graph Interaction' 是第二步 (索引 1)
    } else if (location.pathname === '/results') {
      setActiveStep(2); // 'Results' 是第三步 (索引 2)
    } else {
      setActiveStep(0); // 默认或 'Introduction'
    }
  }, [location.pathname]);

  const handleNextPage = () => {
    if (activeStep === 0) {
      navigate('/graph');
    } else if (activeStep === 1) {
      navigate('/results');
    } else if (activeStep === 2) {
      console.log("Finished all steps!");
      // 可以选择在这里重定向到首页或显示最终完成信息
      // navigate('/');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 顶部进度条和Next Page按钮 */}
      <Box
        sx={{
          width: '100%',
          p: 2,
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', // 添加一些阴影增加层次感
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ flexGrow: 1, mr: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Button variant="contained" onClick={handleNextPage} disabled={activeStep === steps.length - 1}>
          {activeStep === steps.length - 1 ? 'Finish' : 'Next Page'}
        </Button>
      </Box>

      {/* 页面内容区域 */}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        <Routes>
          <Route path="/" element={<Typography variant="h4">Welcome! Click 'Next Page' to start.</Typography>} />
          <Route path="/graph" element={<GraphPage graphWidth={1366} graphHeight={768} />} />
          <Route path="/results" element={<ResultPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;

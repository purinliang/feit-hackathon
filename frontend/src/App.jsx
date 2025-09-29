// src/App.jsx
// src/App.jsx
import "./App.css";
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Stepper, Step, StepLabel, Typography, IconButton, createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import GraphPage from './pages/GraphPage'; // 导入 GraphPage 组件
import ResultPage from './pages/ResultPage'; // 导入 ResultPage 组件
import initialGraphData from './data/GraphData'; // 导入图表数据以获取节点信息

// 创建深色主题
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// 定义一个主应用组件，包含路由和整体布局
function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const steps = ['Introduction', 'Graph Interaction', 'Results'];
  const [activeStep, setActiveStep] = useState(0); // 0-indexed for array

  // 状态提升：将 Graph 的状态提升到 App 组件
  const [learnedSkillIds, setLearnedSkillIds] = useState(new Set());
  const [recommendedJobId, setRecommendedJobId] = useState(null);

  // 预处理节点数据，方便在 ResultPage 中查找节点名称
  const { nodeMap, predecessorsMap } = useMemo(() => {
    const map = new Map(initialGraphData.nodes.map(node => [node.id, node]));
    const jobPredecessorsMap = new Map();

    initialGraphData.nodes.forEach((node) => {
      if (node.type === 'job') {
        jobPredecessorsMap.set(node.id, []);
      }
    });

    (initialGraphData.edges ?? []).forEach(edge => {
      if (jobPredecessorsMap.has(edge.target)) {
        jobPredecessorsMap.get(edge.target).push(edge.source);
      }
    });
    return { nodeMap: map, predecessorsMap: jobPredecessorsMap };
  }, []);

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

  const handleBack = () => {
    navigate(-1); // react-router-dom v6 的后退功能
  };

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

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* 顶部进度条和Next Page按钮 */}
      <Box
        sx={{
          width: '100%',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <IconButton onClick={handleBack} disabled={isFirstStep} color="inherit">
          <ArrowBackIosNew />
        </IconButton>
        <Box sx={{ width: '100%', maxWidth: '800px', mx: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        <IconButton onClick={handleNextPage} disabled={isLastStep} color="inherit">
          <ArrowForwardIos />
        </IconButton>
      </Box>

      {/* 页面内容区域 */}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box
          sx={{
            width: 800,
            height: 600,
            bgcolor: 'grey.900', // 给内容区一个稍亮的背景以区分
            borderRadius: 2,
            boxShadow: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden', // 确保内容不会溢出
          }}
        >
          <Routes>
            <Route path="/" element={<Typography variant="h4">Welcome! Click the arrow to start.</Typography>} />
            <Route
              path="/graph"
              element={
                <GraphPage
                  width={800}
                  height={600}
                  learnedSkillIds={learnedSkillIds}
                  setLearnedSkillIds={setLearnedSkillIds}
                  recommendedJobId={recommendedJobId}
                  setRecommendedJobId={setRecommendedJobId}
                />
              }
            />
            <Route path="/results" element={<ResultPage learnedSkillIds={learnedSkillIds} recommendedJobId={recommendedJobId} nodeMap={nodeMap} predecessorsMap={predecessorsMap} />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* 重置 CSS 并应用背景色 */}
      <Router>
        <MainApp />
      </Router>
    </ThemeProvider>
  );
}

export default App;

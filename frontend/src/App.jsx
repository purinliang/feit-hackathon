// src/App.jsx
import "./App.css";
import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  IconButton,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import GraphPage from "./pages/GraphPage"; // 导入 GraphPage 组件
import ResultPage from "./pages/ResultPage"; // 导入 ResultPage 组件
import SurveyPage from "./pages/SurveyPage"; // 导入新的问卷页
import initialGraphData from "./data/GraphData"; // 导入图表数据以获取节点信息

// 创建深色主题
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

// 定义一个主应用组件，包含路由和整体布局
function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const steps = ["Survey", "Career Graph", "Results"];
  const [activeStep, setActiveStep] = useState(0); // 0-indexed for array

  // 状态提升：将 Graph 的状态提升到 App 组件
  const [learnedSkillIds, setLearnedSkillIds] = useState(new Set());
  const [recommendedJobId, setRecommendedJobId] = useState(null);

  // 预处理节点数据，方便在 ResultPage 中查找节点名称
  const { nodeMap, predecessorsMap } = useMemo(() => {
    const map = new Map(initialGraphData.nodes.map((node) => [node.id, node]));
    const jobPredecessorsMap = new Map();

    initialGraphData.nodes.forEach((node) => {
      if (node.type === "job") {
        jobPredecessorsMap.set(node.id, []);
      }
    });

    (initialGraphData.edges ?? []).forEach((edge) => {
      if (jobPredecessorsMap.has(edge.target)) {
        jobPredecessorsMap.get(edge.target).push(edge.source);
      }
    });
    return { nodeMap: map, predecessorsMap: jobPredecessorsMap };
  }, []);

  // 根据当前路由更新 activeStep
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/survey") {
      setActiveStep(0);
    } else if (location.pathname === "/graph") {
      setActiveStep(1); // 'Graph Interaction' 是第二步 (索引 1)
    } else if (location.pathname === "/results") {
      setActiveStep(2); // 'Results' 是第三步 (索引 2)
    }
  }, [location.pathname]);

  const handleBack = () => {
    navigate(-1); // react-router-dom v6 的后退功能
  };

  const handleNextPage = () => {
    // 当在图表页 (activeStep=1) 时，导航到结果页
    if (activeStep === 0) {
      navigate("/graph");
    } else if (activeStep === 1) {
      navigate("/results");
    } else if (activeStep >= steps.length - 1) {
      console.log("Finished all steps!");
      // 可以选择在这里重定向到首页或显示最终完成信息
      // navigate('/');
    }
  };

  const handleSurveyComplete = () => {
    // 使用 { replace: false } 确保这是一个 push 操作，从而保留历史记录
    navigate("/graph", { replace: false });
  };

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* 顶部进度条和Next Page按钮 - 仅在非问卷页显示 */}
      {!isFirstStep && (
        <Box
          sx={{
            width: "100%",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <IconButton onClick={handleBack} color="inherit">
            <ArrowBackIosNew />
          </IconButton>
          <Box sx={{ width: "100%", maxWidth: "800px", mx: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <IconButton
            onClick={handleNextPage}
            disabled={isLastStep}
            color="inherit"
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>
      )}

      {/* 页面内容区域 */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={
            isFirstStep
              ? { width: "100%", height: "100%" }
              : {
                width: 1280,
                height: 720,
                bgcolor: "grey.900", // 给内容区一个稍亮的背景以区分
                borderRadius: 2,
                boxShadow: 6,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden", // 确保内容不会溢出
              }
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <SurveyPage
                  onComplete={handleSurveyComplete}
                  setLearnedSkillIds={setLearnedSkillIds}
                />
              }
            />
            <Route
              path="/survey"
              element={
                <SurveyPage
                  onComplete={handleSurveyComplete}
                  setLearnedSkillIds={setLearnedSkillIds}
                />
              }
            />
            <Route
              path="/graph"
              element={
                <GraphPage
                  width={1280}
                  height={720}
                  learnedSkillIds={learnedSkillIds}
                  setLearnedSkillIds={setLearnedSkillIds}
                  recommendedJobId={recommendedJobId}
                  setRecommendedJobId={setRecommendedJobId}
                />
              }
            />
            <Route
              path="/results"
              element={
                <ResultPage
                  learnedSkillIds={learnedSkillIds}
                  recommendedJobId={recommendedJobId}
                  nodeMap={nodeMap}
                  predecessorsMap={predecessorsMap}
                />
              }
            />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router basename="/feit-hackathon">
        <MainApp />
      </Router>
    </ThemeProvider>
  );
}

export default App;

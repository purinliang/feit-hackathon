// ==========================================================
// 1. 结构说明 (在 JavaScript 中，这些是对象和数组的预期结构)
// ==========================================================

/*
// Node (节点) 对象的预期结构：
// {
//     id: 'string',
//     name: 'string',
//     type: 'skill' | 'job',
//     time: 100, // number (小时)
//     value: 85 // number (0 ~ 100)
// }

// Edge (边) 对象的预期结构：
// {
//     id: 'string',
//     source: 'string', // 起点 Node 的 id
//     target: 'string', // 终点 Node 的 id
//     necessity: 0.95 // number (0.00 ~ 1.00)
// }
*/

// ==========================================================
// 2. 示例数据 (initialGraphData)
// ==========================================================

const initialGraphData = {
  // 节点数据 (Nodes)
  nodes: [
    { id: "js", name: "JavaScript", type: "skill", time: 100, value: 0.85 },
    { id: "react", name: "React", type: "skill", time: 150, value: 0.9 },
    { id: "fe_dev", name: "前端开发", type: "job", time: 0, value: 0.95 },
    { id: "html", name: "HTML/CSS", type: "skill", time: 50, value: 0.7 },
  ],

  // 边数据 (Edges)
  edges: [
    // 依赖关系：HTML/CSS -> JavaScript (依赖度 80%)
    { id: "e-html-js", source: "html", target: "js", necessity: 0.8 },

    // 依赖关系：JavaScript -> React (依赖度 95%)
    { id: "e-js-react", source: "js", target: "react", necessity: 0.95 },

    // 依赖关系：React -> 前端开发 (依赖度 85%)
    { id: "e-react-fe", source: "react", target: "fe_dev", necessity: 0.85 },

    // 依赖关系：JavaScript -> 前端开发 (依赖度 40%)
    { id: "e-js-fe", source: "js", target: "fe_dev", necessity: 0.4 },
  ],
};

// 如果你想在其他文件中使用它，请导出
export default initialGraphData;

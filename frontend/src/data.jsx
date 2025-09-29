// src/data.js - 融合了同学提供的数据，并添加了 ID 和起点

// ----------------------------------------------------
// 辅助函数：根据节点名称查找其 ID
// ----------------------------------------------------
const getNodeMap = (nodes) => {
    const map = {};
    nodes.forEach(node => {
        // 使用一个简单的逻辑生成 ID，确保唯一性
        let id = node.name.toLowerCase().replace(/[\/\(\)\s-]/g, '_').replace(/_/g, '_');
        // 特殊处理一些较长的名字
        if (node.name.includes('PyTorch')) id = 'dl_pytorch';
        if (node.name.includes('TensorFlow')) id = 'dl_tf';
        if (node.name.includes('云计算')) id = 'cloud';
        map[node.name] = id;
        node.id = id; // 同时给原始节点数据添加 ID

        // Dagre rank 标记：将所有目标职业固定在最右侧 (L-R 布局)
        if (node.type === '职业') {
            node.type = 'job'; // 统一类型
            node.dagre = { rank: 'max' };
        } else {
            node.type = 'skill'; // 统一类型
        }
    });
    return map;
};


const originalNodes = [
    // ----------------------------------------------------
    // 1. 目标职业 (将固定在最右侧)
    // ----------------------------------------------------
    { "name": "数据科学工程师", "type": "职业", "time": 1200, "value": 93 },
    { "name": "前端工程师", "type": "职业", "time": 900, "value": 90 },
    { "name": "算法工程师", "type": "职业", "time": 1400, "value": 95 },
    { "name": "后端工程师", "type": "职业", "time": 1100, "value": 92 },

    // ----------------------------------------------------
    // 2. 核心/专业技能
    // ----------------------------------------------------
    { "name": "Python", "type": "技能", "time": 120, "value": 92 },
    { "name": "C++", "type": "技能", "time": 200, "value": 88 },
    { "name": "JavaScript", "type": "技能", "time": 140, "value": 91 },
    { "name": "TypeScript", "type": "技能", "time": 60, "value": 85 },
    { "name": "HTML/CSS", "type": "技能", "time": 100, "value": 86 },
    { "name": "React", "type": "技能", "time": 160, "value": 89 },
    { "name": "Node.js", "type": "技能", "time": 150, "value": 87 },
    { "name": "SQL", "type": "技能", "time": 100, "value": 90 },
    { "name": "NoSQL", "type": "技能", "time": 80, "value": 80 },
    { "name": "数据结构", "type": "技能", "time": 150, "value": 92 },
    { "name": "算法", "type": "技能", "time": 200, "value": 95 },
    { "name": "统计学", "type": "技能", "time": 150, "value": 90 },
    { "name": "机器学习", "type": "技能", "time": 250, "value": 94 },
    { "name": "深度学习(TensorFlow)", "type": "技能", "time": 180, "value": 88 },
    { "name": "深度学习(PyTorch)", "type": "技能", "time": 180, "value": 88 },
    { "name": "数据可视化", "type": "技能", "time": 80, "value": 82 },
    { "name": "Pandas/NumPy", "type": "技能", "time": 90, "value": 89 },
    { "name": "系统设计", "type": "技能", "time": 180, "value": 91 },
    { "name": "REST API 设计", "type": "技能", "time": 100, "value": 88 },
    { "name": "Linux", "type": "技能", "time": 60, "value": 83 },
    { "name": "Git", "type": "技能", "time": 40, "value": 84 },
    { "name": "Docker", "type": "技能", "time": 50, "value": 86 },
    { "name": "Kubernetes", "type": "技能", "time": 80, "value": 85 },
    { "name": "云计算(任一主流云)", "type": "技能", "time": 120, "value": 87 },
    { "name": "单元/集成测试", "type": "技能", "time": 80, "value": 82 }
];

const originalEdges = [
    // ----------------------------------------------------
    // 边数据 (使用名称)
    // ----------------------------------------------------
    /* —— 技能 → 职业 —— */
    { "node_start_name": "Python", "node_end_name": "数据科学工程师", "necessity": 0.90 },
    { "node_start_name": "统计学", "node_end_name": "数据科学工程师", "necessity": 0.85 },
    { "node_start_name": "机器学习", "node_end_name": "数据科学工程师", "necessity": 0.90 },
    { "node_start_name": "Pandas/NumPy", "node_end_name": "数据科学工程师", "necessity": 0.80 },
    { "node_start_name": "数据可视化", "node_end_name": "数据科学工程师", "necessity": 0.60 },
    { "node_start_name": "SQL", "node_end_name": "数据科学工程师", "necessity": 0.75 },
    { "node_start_name": "深度学习(TensorFlow)", "node_end_name": "数据科学工程师", "necessity": 0.70 },
    { "node_start_name": "深度学习(PyTorch)", "node_end_name": "数据科学工程师", "necessity": 0.70 },
    { "node_start_name": "Git", "node_end_name": "数据科学工程师", "necessity": 0.60 },

    { "node_start_name": "HTML/CSS", "node_end_name": "前端工程师", "necessity": 0.90 },
    { "node_start_name": "JavaScript", "node_end_name": "前端工程师", "necessity": 0.95 },
    { "node_start_name": "TypeScript", "node_end_name": "前端工程师", "necessity": 0.75 },
    { "node_start_name": "React", "node_end_name": "前端工程师", "necessity": 0.85 },
    { "node_start_name": "单元/集成测试", "node_end_name": "前端工程师", "necessity": 0.60 },
    { "node_start_name": "Git", "node_end_name": "前端工程师", "necessity": 0.60 },

    { "node_start_name": "算法", "node_end_name": "算法工程师", "necessity": 0.95 },
    { "node_start_name": "数据结构", "node_end_name": "算法工程师", "necessity": 0.90 },
    { "node_start_name": "Python", "node_end_name": "算法工程师", "necessity": 0.80 },
    { "node_start_name": "C++", "node_end_name": "算法工程师", "necessity": 0.80 },
    { "node_start_name": "机器学习", "node_end_name": "算法工程师", "necessity": 0.80 },
    { "node_start_name": "深度学习(PyTorch)", "node_end_name": "算法工程师", "necessity": 0.70 },
    { "node_start_name": "Git", "node_end_name": "算法工程师", "necessity": 0.55 },

    { "node_start_name": "Node.js", "node_end_name": "后端工程师", "necessity": 0.85 },
    { "node_start_name": "Python", "node_end_name": "后端工程师", "necessity": 0.70 },
    { "node_start_name": "SQL", "node_end_name": "后端工程师", "necessity": 0.85 },
    { "node_start_name": "NoSQL", "node_end_name": "后端工程师", "necessity": 0.65 },
    { "node_start_name": "REST API 设计", "node_end_name": "后端工程师", "necessity": 0.90 },
    { "node_start_name": "系统设计", "node_end_name": "后端工程师", "necessity": 0.85 },
    { "node_start_name": "Docker", "node_end_name": "后端工程师", "necessity": 0.70 },
    { "node_start_name": "Kubernetes", "node_end_name": "后端工程师", "necessity": 0.60 },
    { "node_start_name": "云计算(任一主流云)", "node_end_name": "后端工程师", "necessity": 0.75 },
    { "node_start_name": "Git", "node_end_name": "后端工程师", "necessity": 0.65 },

    /* —— 技能 → 技能（前置或强相关）—— */
    { "node_start_name": "JavaScript", "node_end_name": "React", "necessity": 0.85 },
    { "node_start_name": "TypeScript", "node_end_name": "React", "necessity": 0.60 },
    { "node_start_name": "HTML/CSS", "node_end_name": "React", "necessity": 0.65 },

    { "node_start_name": "JavaScript", "node_end_name": "Node.js", "necessity": 0.90 },
    { "node_start_name": "Node.js", "node_end_name": "REST API 设计", "necessity": 0.70 },
    { "node_start_name": "Python", "node_end_name": "REST API 设计", "necessity": 0.70 },

    { "node_start_name": "统计学", "node_end_name": "机器学习", "necessity": 0.80 },
    { "node_start_name": "Python", "node_end_name": "Pandas/NumPy", "necessity": 0.85 },
    { "node_start_name": "Pandas/NumPy", "node_end_name": "机器学习", "necessity": 0.70 },
    { "node_start_name": "机器学习", "node_end_name": "深度学习(TensorFlow)", "necessity": 0.75 },
    { "node_start_name": "机器学习", "node_end_name": "深度学习(PyTorch)", "necessity": 0.75 },

    { "node_start_name": "Linux", "node_end_name": "Docker", "necessity": 0.60 },
    { "node_start_name": "Docker", "node_end_name": "Kubernetes", "necessity": 0.70 },
    { "node_start_name": "Kubernetes", "node_end_name": "云计算(任一主流云)", "necessity": 0.60 },

    { "node_start_name": "数据结构", "node_end_name": "算法", "necessity": 0.85 },
    { "node_start_name": "C++", "node_end_name": "算法", "necessity": 0.65 },

    { "node_start_name": "Git", "node_end_name": "单元/集成测试", "necessity": 0.40 },
    { "node_start_name": "单元/集成测试", "node_end_name": "系统设计", "necessity": 0.35 }
];

// 运行转换工具
const nodeMap = getNodeMap(originalNodes);

// ----------------------------------------------------
// 3. 添加起点 'you' 和它连接的初始边
// ----------------------------------------------------
const youNode = { id: 'you', name: '我 (起点)', type: 'job', time: 0, value: 0 };
const initialNodes = [youNode, ...originalNodes];

const startingEdges = [
    // 假设你已经具备 HTML/CSS、Git 和 Linux 的基础
    { node_start_name: "我 (起点)", node_end_name: "HTML/CSS", necessity: 0.80 },
    { node_start_name: "我 (起点)", node_end_name: "Git", necessity: 0.90 },
    { node_start_name: "我 (起点)", node_end_name: "Linux", necessity: 0.70 },
    { node_start_name: "我 (起点)", node_end_name: "数据结构", necessity: 0.50 },
];
// 必须手动给 'you' 节点添加 ID
nodeMap["我 (起点)"] = 'you';

const initialEdges = [...originalEdges, ...startingEdges];

// ----------------------------------------------------
// 4. 将边转换为 ID 格式
// ----------------------------------------------------
const finalEdges = initialEdges.map((edge, index) => {
    const sourceId = nodeMap[edge.node_start_name];
    const targetId = nodeMap[edge.node_end_name];

    if (!sourceId || !targetId) {
        console.warn(`Warning: Edge skipped due to missing node ID for: ${edge.node_start_name} -> ${edge.node_end_name}`);
        return null;
    }

    return {
        id: `e-${sourceId}-${targetId}-${index}`, // 生成唯一 ID
        source: sourceId,
        target: targetId,
        necessity: edge.necessity,
    };
}).filter(edge => edge !== null);


// ----------------------------------------------------
// 最终数据结构
// ----------------------------------------------------
const initialGraphData = {
    nodes: initialNodes,
    edges: finalEdges,
};

export default initialGraphData;
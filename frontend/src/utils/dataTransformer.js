// src/utils/dataTransformer.js

import dagre from 'dagre';

// 导入你的 JavaScript 格式的初始数据
import initialGraphData from '../data'; // 假设你的数据文件叫 src/data.js

// 基础节点宽度和高度，用于布局计算
const nodeWidth = 172;
const nodeHeight = 36;

// ==========================================================
// 1. 自动布局函数 (使用 Dagre)
// ==========================================================
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';

    // *** 关键：设置布局参数，增加节点间距 ***
    dagreGraph.setGraph({
        // *** 关键修改：方向设置为 LR (Left-to-Right) ***
        rankdir: direction, // 现在 direction 默认为 'LR'
        ranksep: 100,
        nodesep: 50,
    });
    // *******************************************

    // 1. 设置图中的所有节点
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    // 2. 设置图中的所有边
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // 3. 运行布局算法
    dagre.layout(dagreGraph);

    // 4. 应用计算出的位置到 React Flow 节点
    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        // Dagre 的坐标以中心为基准，React Flow 需要左上角坐标
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};


// ==========================================================
// 2. 数据转换和准备函数
// ==========================================================
export const getInitialElements = () => {
    // 转换节点数据到 React Flow 格式
    const rfNodes = initialGraphData.nodes.map(node => ({
        id: node.id,
        // data 属性用于存储你的所有自定义信息
        data: {
            name: node.name,
            type: node.type,
            time: node.time,
            value: node.value,
        },
        // node.type 可以决定 React Flow 使用哪种自定义组件来渲染它
        type: node.type === 'job' ? 'jobNode' : 'skillNode',
        position: { x: 0, y: 0 }, // 初始占位，将被布局算法覆盖
    }));

    // 转换边数据到 React Flow 格式
    const rfEdges = initialGraphData.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        // *** 移除 label，不再显示百分比文字 ***
        // label: `${(edge.necessity * 100).toFixed(0)}% 依赖`, 

        // *** 关键修改：用线的粗细表示依赖性 ***
        style: {
            // 将依赖度 (0.00 ~ 1.00) 映射到线宽 (例如 1px 到 5px)
            strokeWidth: edge.necessity * 4 + 1, // 粗细范围约 1px (低) 到 5px (高)
            stroke: '#555', // 设置线的颜色
        },
        // *******************************************
    }));

    // 应用自动布局
    return getLayoutedElements(rfNodes, rfEdges, 'LR');
};
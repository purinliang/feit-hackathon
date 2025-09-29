import {
  ReactFlow, // 修正：现在 ReactFlow 在大括号内
  Controls,
  Background,
  useNodesState,
  useEdgesState
} from '@xyflow/react';

import CustomNode from './components/CustomNode';
import { getInitialElements } from './utils/dataTransformer';

// 注册自定义节点类型
const nodeTypes = {
  skillNode: CustomNode,
  jobNode: CustomNode,
};



const initialElements = getInitialElements();

function CareerGraph() {
  // 使用 React Flow 的 hooks 管理节点和边状态
  const [nodes, setNodes] = useNodesState(initialElements.nodes);
  const [edges, setEdges] = useEdgesState(initialElements.edges);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes} // 传入自定义节点类型
        fitView // 确保图表在初始时完全可见
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default CareerGraph;
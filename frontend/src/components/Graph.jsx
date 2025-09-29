import ForceGraph2D from "react-force-graph-2d";
import initialGraphData from "../data/GraphData";
// 导入 useState 和 useMemo
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { forceCollide } from "https://esm.sh/d3-force-3d";

function Graph(props) {
  const fgRef = useRef();
  // 1. 状态：存储选中的节点 ID 集合
  const [selectedNodeIds, setSelectedNodeIds] = useState(new Set());

  // 2. 使用 useMemo 确保映射关系只创建一次且稳定
  const { nodeNameIDToGraphID, nodeGraphIDToOrigNode } = useMemo(() => {
    let nameIDToGraphID = {};
    let graphIDToOrigNode = {};

    initialGraphData.nodes.forEach((node, index) => {
      nameIDToGraphID[node.id] = index;
      graphIDToOrigNode[index] = node;
    });

    return { nodeNameIDToGraphID: nameIDToGraphID, nodeGraphIDToOrigNode: graphIDToOrigNode };
  }, []); // 依赖为空，只运行一次

  const getNodeLabel = useCallback((node) => {
    return node.name;
  }, []);

  // 3. 使用 useMemo 确保 graphData 对象的引用稳定
  const forceGraphData = useMemo(() => {
    return {
      nodes: initialGraphData.nodes.map((node) => {
        return {
          id: node.id,
          name: getNodeLabel(node),
          val: node.value,
        };
      }),
      // 确保 links 始终是数组，以避免 "Cannot read properties of undefined (reading 'filter')" 错误
      links: (initialGraphData.edges ?? []).map((edge) => {
        return {
          source: edge.source,
          target: edge.target,
        };
      }),
    };
  }, [getNodeLabel]); // 依赖getNodeLabel，但它本身稳定

  // 4. 点击处理逻辑：切换选中状态
  const handleClick = useCallback(node => {
    // 1. 日志记录
    const graphID = nodeNameIDToGraphID[node.id];
    const origNode = nodeGraphIDToOrigNode[graphID];

    console.log(`Node ID: ${node.id}`);
    console.log(`Node Name: ${node.name}`);
    console.log(`Node Type: ${origNode.type}`);

    // 2. 切换选中状态并更新 State
    setSelectedNodeIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(node.id)) {
        newIds.delete(node.id); // 取消选中
      } else {
        newIds.add(node.id); // 选中
      }
      return newIds;
    });

  }, [fgRef, nodeNameIDToGraphID, nodeGraphIDToOrigNode]);

  // 5. 颜色逻辑：使用 useCallback 并在 selectedNodeIds 变化时更新
  const getNodeColor = useCallback((node) => {
    const graphID = nodeNameIDToGraphID[node.id];
    // 检查节点是否在选中集合中
    if (selectedNodeIds.has(node.id)) {
      return nodeGraphIDToOrigNode[graphID].type === "skill"
        ? "darkred"
        : "darkblue";
    }

    // 否则使用原始颜色逻辑
    return nodeGraphIDToOrigNode[graphID].type === "skill"
      ? "red"
      : "blue";
  }, [selectedNodeIds, nodeNameIDToGraphID, nodeGraphIDToOrigNode]);

  // 6. 碰撞力设置
  useEffect(() => {
    // add collision force
    fgRef.current.d3Force(
      "collision",
      forceCollide((node) => Math.sqrt(100 / (node.val + 1)))
    );
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ForceGraph2D
        ref={fgRef}
        // 传入稳定的 graphData 引用
        graphData={forceGraphData}
        nodeLabel="name"
        enableNodeDrag={true}
        // 传入根据 state 变化的颜色函数
        nodeColor={getNodeColor}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];
          const label = getNodeLabel(origNode);
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // 确保文字颜色与节点颜色区分开来
          ctx.fillStyle = selectedNodeIds.has(node.id) ? "black" : "black";
          ctx.fillText(label, node.x, node.y - 6);
        }}
        nodeRelSize={6}
        dagMode="zin"
        backgroundColor="#d0f5bbff"
        linkColor={() => "rgba(63, 41, 41, 0.2)"}
        onNodeClick={handleClick}
      />
    </div>
  );
}

export default Graph;
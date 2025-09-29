import ForceGraph2D from "react-force-graph-2d";
import initialGraphData from "../data/GraphData";
// 导入 useState 和 useMemo
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { forceCollide } from "https://esm.sh/d3-force-3d";

function Graph(props) {
  const fgRef = useRef();
  // 1. 状态：存储选中的节点 ID 集合
  const [selectedNodeIds, setSelectedNodeIds] = useState(new Set());

  // 2. 使用 useMemo 确保映射关系和数据稳定 (新增 predecessorsMap)
  const { nodeNameIDToGraphID, nodeGraphIDToOrigNode, predecessorsMap } = useMemo(() => {
    let nameIDToGraphID = {};
    let graphIDToOrigNode = {};
    let jobPredecessorsMap = new Map(); // 用于存储 Job -> [Skill 依赖 ID]

    initialGraphData.nodes.forEach((node, index) => {
      nameIDToGraphID[node.id] = index;
      graphIDToOrigNode[index] = node;
      if (node.type === 'job') {
        jobPredecessorsMap.set(node.id, []); // 初始化 Job 节点的前置列表
      }
    });

    // 构建反向映射：记录每个 Job 的前置节点
    (initialGraphData.edges ?? []).forEach(edge => {
      // 检查 target 是否为 Job 节点，如果是，将 source 作为前置节点加入
      if (jobPredecessorsMap.has(edge.target)) {
        jobPredecessorsMap.get(edge.target).push(edge.source);
      }
    });

    return {
      nodeNameIDToGraphID: nameIDToGraphID,
      nodeGraphIDToOrigNode: graphIDToOrigNode,
      predecessorsMap: jobPredecessorsMap // 导出新的映射
    };
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
  }, [getNodeLabel]);

  // 4. 点击处理逻辑：根据节点类型决定行为
  const handleClick = useCallback(node => {
    // 1. 获取原始节点信息
    const graphID = nodeNameIDToGraphID[node.id];
    const origNode = nodeGraphIDToOrigNode[graphID];

    console.log(`Node ID: ${node.id}, Type: ${origNode.type}`);

    // --- 核心逻辑：Job 节点点击 ---
    if (origNode.type === 'job') {
      // 1. 获取该 Job 节点的所有前置 Skill ID
      const skillIdsToSelect = predecessorsMap.get(node.id) || [];

      // 2. 创建新的选中集合，包含 Job 本身和所有前置 Skill
      const newSelectedIds = new Set(skillIdsToSelect);

      // 检查是否已经全部选中，如果是则取消全部选中
      let shouldDeselectAll = true;
      for (const skillId of skillIdsToSelect) {
        if (!selectedNodeIds.has(skillId)) {
          shouldDeselectAll = false;
          break;
        }
      }

      if (shouldDeselectAll && selectedNodeIds.has(node.id)) {
        // 如果所有前置和自身都被选中了，则清除所有选中状态
        setSelectedNodeIds(new Set());
        console.log("Deselected all linked nodes.");
      } else {
        // 否则，选中 Job 自身和所有前置 Skill
        newSelectedIds.add(node.id);
        setSelectedNodeIds(newSelectedIds);
        console.log(`Selected ${newSelectedIds.size} nodes (Job + Skills).`);
      }

    } else {
      // --- Skill 节点点击：执行常规切换逻辑 ---
      setSelectedNodeIds(prevIds => {
        const newIds = new Set(prevIds);
        if (newIds.has(node.id)) {
          newIds.delete(node.id); // 取消选中
        } else {
          newIds.add(node.id); // 选中
        }
        return newIds;
      });
    }

    // 3. 居中视图 (保留交互功能)
    // fgRef.current.centerAt(node.x, node.y, 300);

  }, [fgRef, nodeNameIDToGraphID, nodeGraphIDToOrigNode, predecessorsMap, selectedNodeIds]); // 确保依赖了 selectedNodeIds

  // 5. 颜色逻辑：使用 useCallback 并在 selectedNodeIds 变化时更新
  const getNodeColor = useCallback((node) => {
    const graphID = nodeNameIDToGraphID[node.id];
    const origType = nodeGraphIDToOrigNode[graphID].type;

    // 检查节点是否在选中集合中
    if (selectedNodeIds.has(node.id)) {
      return origType === "skill"
        ? "darkred"  // Skill 选中
        : "darkblue"; // Job 选中
    }

    // 否则使用原始颜色逻辑
    return origType === "skill"
      ? "red" // Skill 默认
      : "blue"; // Job 默认
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
          ctx.fillStyle = selectedNodeIds.has(node.id) ? "darkgreen" : "black";
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
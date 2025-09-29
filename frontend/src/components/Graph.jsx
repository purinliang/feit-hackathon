import ForceGraph2D from "react-force-graph-2d";
import initialGraphData from "../data/GraphData";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { forceCollide } from "https://esm.sh/d3-force-3d";

function Graph({
  width,
  height,
  learnedSkillIds,
  setLearnedSkillIds,
  recommendedJobId,
  setRecommendedJobId,
}) {
  const fgRef = useRef();

  // 1. 使用 useMemo 确保映射关系和数据稳定
  const { nodeNameIDToGraphID, nodeGraphIDToOrigNode, predecessorsMap } = useMemo(() => {
    let nameIDToGraphID = {};
    let graphIDToOrigNode = {};
    let jobPredecessorsMap = new Map();

    initialGraphData.nodes.forEach((node, index) => {
      // 这里的 index 是 force-graph 内部使用的 graphID
      nameIDToGraphID[node.id] = index;
      graphIDToOrigNode[index] = node;
      if (node.type === 'job') {
        jobPredecessorsMap.set(node.id, []);
      }
    });

    (initialGraphData.edges ?? []).forEach(edge => {
      // job 节点的 predecessors 是指向它的 source 节点
      if (jobPredecessorsMap.has(edge.target)) {
        jobPredecessorsMap.get(edge.target).push(edge.source);
      }
    });

    return {
      nodeNameIDToGraphID: nameIDToGraphID,
      nodeGraphIDToOrigNode: graphIDToOrigNode,
      predecessorsMap: jobPredecessorsMap
    };
  }, []);

  const getNodeLabel = useCallback((node) => {
    return node.name;
  }, []);

  // 2. 使用 useMemo 确保 graphData 对象的引用稳定
  const forceGraphData = useMemo(() => {
    return {
      nodes: initialGraphData.nodes.map((node) => {
        return {
          id: node.id,
          name: getNodeLabel(node),
          val: node.value,
        };
      }),
      links: (initialGraphData.edges ?? []).map((edge) => {
        return {
          source: edge.source,
          target: edge.target,
        };
      }),
    };
  }, [getNodeLabel]);

  // --- 辅助函数：判断 Skill 是否被推荐 ---
  const isSkillRecommended = useCallback((skillId) => {
    if (!recommendedJobId) return false;
    const recommendedSkills = predecessorsMap.get(recommendedJobId);
    return recommendedSkills ? recommendedSkills.includes(skillId) : false;
  }, [recommendedJobId, predecessorsMap]);

  // 3. **核心逻辑：点击事件处理**
  const handleClick = useCallback(node => {
    // 找到原始节点对象
    const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];

    if (origNode.type === 'job') {
      // Job 节点点击逻辑：切换 Recommended 状态
      const jobId = node.id;
      // 切换选中状态
      setRecommendedJobId(prevId => prevId === jobId ? null : jobId);

    } else {
      // Skill 节点点击逻辑：切换 Learned 状态
      const skillId = node.id;
      setLearnedSkillIds(prevIds => {
        const newIds = new Set(prevIds);
        if (newIds.has(skillId)) {
          newIds.delete(skillId); // 切换为未学习
        } else {
          newIds.add(skillId); // 切换为已学习
        }
        return newIds;
      });
    }

  }, [nodeNameIDToGraphID, nodeGraphIDToOrigNode, setRecommendedJobId, setLearnedSkillIds]);

  // 4. **颜色逻辑：实现优先级染色**
  const getNodeColor = useCallback((node) => {
    const graphID = nodeNameIDToGraphID[node.id];
    const origType = nodeGraphIDToOrigNode[graphID].type;

    if (origType === "skill") {
      const isLearned = learnedSkillIds.has(node.id);
      const isRecommended = isSkillRecommended(node.id);

      // 优先级 1: Learned (深绿色)
      if (isLearned) {
        return "#559955"; // 绿色 (Tailwind Emerald-500)
      }
      // 优先级 2: Recommended (亮黄色)
      if (isRecommended) {
        return "#FFBB55"; // 橙色 (Tailwind Amber-400)
      }

      // 优先级 3: Skill 默认色 (红色)
      return "#EE5555"; // 浅红色 (Tailwind Red-500)

    } else { // Job 节点
      // Job 选中时的颜色 (深蓝色)
      if (recommendedJobId === node.id) {
        return "#AA11FF"; // 浅蓝色 (Tailwind Blue-600)
      }
      // Job 默认色 (浅蓝色)
      return "#4444FF"; // 浅蓝色 (Tailwind Blue-400)
    }
  }, [learnedSkillIds, recommendedJobId, nodeNameIDToGraphID, nodeGraphIDToOrigNode, isSkillRecommended]);

  // 5. **初始居中逻辑**
  useEffect(() => {
    // 确保 force-graph 实例已创建，并给物理模拟一点时间稳定
    const timer = setTimeout(() => {
      if (fgRef.current) {
        // zoomToFit(400ms 动画，100px 填充)
        fgRef.current.zoomToFit(400, 100);
      }
    }, 600); // 延迟 600ms 等待稳定

    return () => clearTimeout(timer);
  }, [width, height, forceGraphData]); // 依赖项确保在数据或尺寸变化时重新居中

  // 6. 碰撞力设置 (保持不变)
  useEffect(() => {
    // 添加碰撞力以防止节点重叠
    fgRef.current.d3Force(
      "collision",
      forceCollide((node) => Math.sqrt(100 / (node.val + 1)))
    );
  }, [forceCollide]);

  return (
    <div style={{
      width: width ? `${width}px` : "100%",
      height: height ? `${height}px` : "100%",
      borderRadius: '0.75rem', // 圆角
      overflow: 'hidden',
    }} className="shadow-2xl">
      <ForceGraph2D
        ref={fgRef}
        width={width} // 确保 force-graph 使用传入的尺寸
        height={height} // 确保 force-graph 使用传入的尺寸
        graphData={forceGraphData}
        nodeLabel="name"
        enableNodeDrag={true}
        nodeColor={getNodeColor}
        // =========================================================
        // 调整背景色和文字颜色
        // =========================================================
        backgroundColor="#1f2937" // 深灰色背景 (Tailwind gray-800)
        linkColor={() => "rgba(209, 213, 219, 0.4)"} // 浅灰色链接
        // =========================================================
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];
          const label = getNodeLabel(origNode);
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom'; // 将基线设置为底部，使文本位于节点正上方

          // 优化文字颜色：默认白色，推荐/已学习状态使用亮绿色
          let textColor = "grey";
          if (origNode.type === "skill" && (learnedSkillIds.has(node.id) || isSkillRecommended(node.id))) {
            textColor = "white"; // 亮绿色，确保在深色背景下清晰
          } else if (origNode.type === "job" && recommendedJobId === node.id) {
            textColor = "white"; // 选中 Job 节点文字也保持白色
          }

          ctx.fillStyle = textColor;
          ctx.fillText(label, node.x, node.y - 8 / globalScale); // 在节点上方留出一点空隙
        }}
        nodeRelSize={6}
        dagMode="zin"
        onNodeClick={handleClick}
      />
    </div>
  );
}

export default Graph;
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

  // 状态已从 App.jsx 提升并作为 props 传入

  // 2. 使用 useMemo 确保映射关系和数据稳定
  const { nodeNameIDToGraphID, nodeGraphIDToOrigNode, predecessorsMap } = useMemo(() => {
    let nameIDToGraphID = {};
    let graphIDToOrigNode = {};
    let jobPredecessorsMap = new Map();

    initialGraphData.nodes.forEach((node, index) => {
      nameIDToGraphID[node.id] = index;
      graphIDToOrigNode[index] = node;
      if (node.type === 'job') {
        jobPredecessorsMap.set(node.id, []);
      }
    });

    (initialGraphData.edges ?? []).forEach(edge => {
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
      links: (initialGraphData.edges ?? []).map((edge) => {
        return {
          source: edge.source,
          target: edge.target,
        };
      }),
    };
  }, [getNodeLabel]);

  // 4. **核心逻辑：点击事件处理**
  const handleClick = useCallback(node => {
    const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];

    console.log(`Node ID: ${node.id}, Type: ${origNode.type}`);

    if (origNode.type === 'job') {
      // **Job 节点点击逻辑：切换 Recommended 状态**

      const jobId = node.id;

      // 如果点击的 Job 已经是选中状态，则取消选中；否则选中新的 Job
      if (recommendedJobId === jobId) {
        setRecommendedJobId(null); // 取消选中
        console.log("Deselected Job and cleared recommendations.");
      } else {
        setRecommendedJobId(jobId); // 选中新的 Job
        console.log(`Selected Job: ${jobId}, updating recommendations.`);
      }

    } else {
      // **Skill 节点点击逻辑：切换 Learned 状态**

      const skillId = node.id;

      setLearnedSkillIds(prevIds => {
        const newIds = new Set(prevIds);
        if (newIds.has(skillId)) {
          newIds.delete(skillId); // 切换为未学习
          console.log(`Skill: ${skillId} marked as UNLEARNED.`);
        } else {
          newIds.add(skillId); // 切换为已学习
          console.log(`Skill: ${skillId} marked as LEARNED.`);
        }
        return newIds;
      });
    }

    // 3. 居中视图 (可选)
    // fgRef.current.centerAt(node.x, node.y, 300);

  }, [fgRef, nodeNameIDToGraphID, nodeGraphIDToOrigNode, recommendedJobId, setRecommendedJobId, setLearnedSkillIds]); // 依赖项更新

  // --- 辅助函数：判断 Skill 是否被推荐 ---
  const isSkillRecommended = useCallback((skillId) => {
    if (!recommendedJobId) return false;
    const recommendedSkills = predecessorsMap.get(recommendedJobId);
    return recommendedSkills ? recommendedSkills.includes(skillId) : false;
  }, [recommendedJobId, predecessorsMap]);


  // 5. **颜色逻辑：实现优先级染色**
  const getNodeColor = useCallback((node) => {
    const graphID = nodeNameIDToGraphID[node.id];
    const origType = nodeGraphIDToOrigNode[graphID].type;

    if (origType === "skill") {
      const isLearned = learnedSkillIds.has(node.id);
      const isRecommended = isSkillRecommended(node.id);

      // 优先级 1: Learned (红色变深)
      if (isLearned) {
        return "darkred";
      }
      // 优先级 2: Recommended (推荐色，例如亮黄)
      if (isRecommended) {
        return "orange";
      }

      // 优先级 3: Skill 默认色
      return "red";

    } else { // Job 节点
      // Job 选中时的颜色
      if (recommendedJobId === node.id) {
        return "darkblue"; // Job 选中
      }
      // Job 默认色
      return "blue";
    }
  }, [learnedSkillIds, recommendedJobId, nodeNameIDToGraphID, nodeGraphIDToOrigNode, isSkillRecommended]);

  // 6. 碰撞力设置
  useEffect(() => {
    // add collision force
    fgRef.current.d3Force(
      "collision",
      forceCollide((node) => Math.sqrt(100 / (node.val + 1)))
    );
  }, []);

  return (
    <div style={{
      width: width ? `${width}px` : "100%", // 使用传入的 width prop，否则默认为 100%
      height: height ? `${height}px` : "100%", // 使用传入的 height prop，否则默认为 100%
    }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={forceGraphData}
        nodeLabel="name"
        enableNodeDrag={true}
        nodeColor={getNodeColor}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];
          const label = getNodeLabel(origNode);
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // 优化文字颜色：让 Learned/Recommended 状态的文字更清晰
          let textColor = "black";
          if (origNode.type === "skill" && (learnedSkillIds.has(node.id) || isSkillRecommended(node.id))) {
            textColor = "darkgreen";
          }

          ctx.fillStyle = textColor;
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
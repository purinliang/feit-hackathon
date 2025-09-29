import ForceGraph2D from "react-force-graph-2d";
import initialGraphData from "../data/GraphData";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  const { nodeNameIDToGraphID, nodeGraphIDToOrigNode, predecessorsMap } =
    useMemo(() => {
      let nameIDToGraphID = {};
      let graphIDToOrigNode = {};
      let jobPredecessorsMap = new Map();

      initialGraphData.nodes.forEach((node, index) => {
        // 这里的 index 是 force-graph 内部使用的 graphID
        nameIDToGraphID[node.id] = index;
        graphIDToOrigNode[index] = node;
        if (node.type === "job") {
          jobPredecessorsMap.set(node.id, []);
        }
      });

      (initialGraphData.edges ?? []).forEach((edge) => {
        // job 节点的 predecessors 是指向它的 source 节点
        if (jobPredecessorsMap.has(edge.target)) {
          jobPredecessorsMap.get(edge.target).push(edge.source);
        }
      });

      return {
        nodeNameIDToGraphID: nameIDToGraphID,
        nodeGraphIDToOrigNode: graphIDToOrigNode,
        predecessorsMap: jobPredecessorsMap,
      };
    }, []);

  const getNodeLabel = useCallback((node) => {
    return node.name;
  }, []);

  // 2. 使用 useMemo 确保 graphData 对象的引用稳定
  const forceGraphData = useMemo(() => {
    const gData = {
      nodes: initialGraphData.nodes.map((node) => {
        return {
          id: node.id,
          name: getNodeLabel(node),
          val: node.value,
          neighbors: [],
          links: [],
        };
      }),
      links: (initialGraphData.edges ?? []).map((edge) => {
        return {
          source: edge.source,
          target: edge.target,
          necessity: edge.necessity,
        };
      }),
    };
    let nodeIDtoNode = {};
    gData.nodes.forEach((node) => {
      nodeIDtoNode[node.id] = node;
    });
    gData.links.forEach((link) => {
      const a = nodeIDtoNode[link.source];
      const b = nodeIDtoNode[link.target];
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });
    return gData;
  }, [getNodeLabel]);

  const [learnedNodes, setLearnedNodes] = useState(new Set());
  const [recommendedNodes, setRecommendedNodes] = useState(new Set());
  const [recommendedLinks, setRecommendedLinks] = useState(new Set());
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  // --- 辅助函数：判断 Skill 是否被推荐 ---
  const isSkillRecommended = useCallback(
    (skillId) => {
      if (!recommendedJobId) return false;
      const recommendedSkills = predecessorsMap.get(recommendedJobId);
      return recommendedSkills ? recommendedSkills.includes(skillId) : false;
    },
    [recommendedJobId, predecessorsMap]
  );

  const updateLR = () => {
    learnedNodes.clear();
    recommendedNodes.clear();
    recommendedLinks.clear();
    let nodeIDtoNode = {};
    forceGraphData.nodes.forEach((node) => {
      nodeIDtoNode[node.id] = node;
      if (learnedSkillIds.has(node.id)) {
        learnedNodes.add(node);
      }
      const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];
      if (origNode.type === "skill") {
        if (isSkillRecommended(node.id)) {
          recommendedNodes.add(node);
        }
      } else {
        if (recommendedJobId === node.id) {
          recommendedNodes.add(node);
        }
      }
    });
    forceGraphData.links.forEach((link) => {
      const u = link.source;
      const v = link.target;
      const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[v.id]];
      console.log(link);
      if (
        learnedSkillIds.has(u.id) &&
        (origNode.type === "skill"
          ? isSkillRecommended(v.id)
          : recommendedJobId === v.id)
      ) {
        recommendedLinks.add(link);
      }
    });

    setLearnedNodes(learnedNodes);
    setRecommendedNodes(recommendedNodes);
    setRecommendedLinks(recommendedLinks);
  };

  // 3. **核心逻辑：点击事件处理**
  const handleClick = useCallback(
    (node) => {
      // 找到原始节点对象
      const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];

      if (origNode.type === "job") {
        // Job 节点点击逻辑：切换 Recommended 状态
        const jobId = node.id;
        // 切换选中状态
        setRecommendedJobId((prevId) => (prevId === jobId ? null : jobId));
      } else {
        // Skill 节点点击逻辑：切换 Learned 状态
        const skillId = node.id;
        setLearnedSkillIds((prevIds) => {
          const newIds = new Set(prevIds);
          if (newIds.has(skillId)) {
            newIds.delete(skillId); // 切换为未学习
          } else {
            newIds.add(skillId); // 切换为已学习
          }
          return newIds;
        });
      }
    },
    [
      nodeNameIDToGraphID,
      nodeGraphIDToOrigNode,
      setRecommendedJobId,
      setLearnedSkillIds,
      learnedSkillIds,
      recommendedJobId,
    ]
  );

  // 4. **颜色逻辑：实现优先级染色**
  const getNodeColor = useCallback(
    (node) => {
      const graphID = nodeNameIDToGraphID[node.id];
      const origType = nodeGraphIDToOrigNode[graphID].type;

      if (origType === "skill") {
        return "#EE5555"; // 浅红色 (Tailwind Red-500)
      } else {
        return "#4444FF"; // 浅蓝色 (Tailwind Blue-400)
      }
    },
    [
      learnedSkillIds,
      recommendedJobId,
      nodeNameIDToGraphID,
      nodeGraphIDToOrigNode,
      isSkillRecommended,
    ]
  );

  const getLinkWidth = useCallback((link) => {
    return highlightLinks.has(link) ? 5 : link.necessity * 4;
  });

  const getLinkDash = useCallback((link) => {
    return link.necessity < 0.7 ? [10, 5] : [];
  });

  const getLinkColor = useCallback((link) => {
    // Default color: rgba(209, 213, 219, 0.4)
    if (recommendedLinks.has(link)) {
      return "orange";
    }
    const value = Math.round(255 * link.necessity);
    return `rgba(${value / 1.1}, ${value}, ${value / 1.1}, 0.3)`;
  });

  const getParticlesCount = useCallback((link) => {
    if (recommendedLinks.has(link)) {
      return 2;
    } else {
      return 0;
    }
  });

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

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = (node) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
      node.links.forEach((link) => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  };

  const handleLinkHover = (link) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  const NODE_R = 5;
  const paintNode = (node, ctx, globalScale) => {
    let textColor = "grey";
    if (highlightNodes.has(node)) {
      textColor = "white";
    }
    let extraText = "";
    if (learnedNodes.has(node)) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
      ctx.fillStyle = node === hoverNode ? "red" : "green";
      ctx.fill();

      extraText = " (learned)";
    } else {
      const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];
      if (recommendedNodes.has(node) && origNode.type === "job") {
        // too many, not show anything unless job
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle = node === hoverNode ? "red" : "blue";
        ctx.fill();
        extraText = " (current goal)";
      } else if (highlightNodes.has(node)) {
        // add ring just for highlighted nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle = node === hoverNode ? "red" : "orange";
        ctx.fill();

        textColor = "white";
      }
    }

    const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];
    const label = getNodeLabel(origNode);
    const fontSize = 14 / globalScale;

    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom"; // 将基线设置为底部，使文本位于节点正上方

    // 优化文字颜色：默认白色，推荐/已学习状态使用亮绿色
    ctx.fillStyle = textColor;
    ctx.fillText(label + extraText, node.x, node.y - 7); // 在节点上方留出一点空隙
  };

  useEffect(() => {
    updateLR();
  }, [recommendedJobId, learnedSkillIds, predecessorsMap]);

  return (
    <div
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "100%",
        borderRadius: "0.75rem", // 圆角
        overflow: "hidden",
      }}
      className="shadow-2xl"
    >
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
        // =========================================================
        nodeCanvasObjectMode={(node) => "before"}
        nodeCanvasObject={paintNode}
        nodeRelSize={6}
        dagMode="zin"
        onNodeClick={handleClick}
        linkWidth={getLinkWidth}
        linkLineDash={getLinkDash}
        linkColor={getLinkColor}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={getParticlesCount}
        d3Force={(forceName, force) => {
          if (forceName === "charge") {
            force.strength(-3000); // stronger repulsion
          }
          if (forceName === "collide") {
            force.radius(400); // minimum node spacing
          }
        }}
        // Link strength based on x value
        linkStrength={(link) => {
          // normalize or cap values if needed
          return Math.min(1, Math.max(0.1, link.necessity / 100));
        }}
        linkDistance={100} // default link length
      />
    </div>
  );
}

export default Graph;

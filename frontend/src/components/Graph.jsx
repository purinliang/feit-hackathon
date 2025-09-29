import ForceGraph2D from "react-force-graph-2d";
import initialGraphData from "../data/GraphData";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { forceCollide } from "https://esm.sh/d3-force-3d";

function Graph(props) {
  const fgRef = useRef();

  const handleClick = useCallback(node => {
    console.log(`Node ID: ${node.id}`);
    console.log(`Node Name: ${node.name}`);
    console.log(`Node Type: ${nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]].type}`);
  }, []);

  useEffect(() => {
    // add collision force
    fgRef.current.d3Force(
      "collision",
      forceCollide((node) => Math.sqrt(100 / (node.val + 1)))
    );
  }, []);

  let nodeNameIDToGraphID = {};
  initialGraphData.nodes.forEach(
    (node, index) => (nodeNameIDToGraphID[node.id] = index)
  );

  let nodeGraphIDToOrigNode = {};
  initialGraphData.nodes.forEach(
    (node, index) => (nodeGraphIDToOrigNode[index] = node)
  );

  const getNodeLabel = (node) => {
    return node.name;
  };

  const forceGraphData = {
    nodes: initialGraphData.nodes.map((node, index) => {
      return {
        id: node.id,
        name: getNodeLabel(node),
        val: node.value,
      };
    }),
    links: initialGraphData.edges.map((edge, index) => {
      return {
        source: edge.source,
        target: edge.target,
      };
    }),
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={forceGraphData}
        nodeLabel="name"
        enableNodeDrag={true}
        nodeColor={(node) =>
          nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]].type === "skill"
            ? "red"
            : "blue"
        }
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const origNode = nodeGraphIDToOrigNode[nodeNameIDToGraphID[node.id]];
          const label = getNodeLabel(origNode);
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "black"; //node.color;
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

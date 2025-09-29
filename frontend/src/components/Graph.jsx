import ForceGraph2D from "react-force-graph-2d";
import initialGraphData from "../data/GraphData";

function Graph(props) {
  let nodeNameIDToGraphID = {};
  initialGraphData.nodes.forEach(
    (node, index) => (nodeNameIDToGraphID[node.id] = index)
  );

  let nodeGraphIDToOrigNode = {};
  initialGraphData.nodes.forEach(
    (node, index) => (nodeGraphIDToOrigNode[index] = node)
  );

  const getNodeLabel = (node) => {
    return (node.type === "job" ? "Job" : "Skill") + ": " + node.name;
  };

  const forceGraphData = {
    nodes: initialGraphData.nodes.map((node, index) => {
      return {
        id: node.id,
        name: getNodeLabel(node),
        val: 1,
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
        graphData={forceGraphData}
        nodeLabel="name"
        enableNodeDrag={true}
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
      />
    </div>
  );
}

export default Graph;

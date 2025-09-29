import ForceGraph2D from "react-force-graph-2d";
import initialGraphData from "../data/GraphData";

function Graph(props) {
  const nodeNameIDToGraphID = {};

  initialGraphData.nodes.forEach(
    (node, index) => (nodeNameIDToGraphID[node.id] = index)
  );

  const myData = {
    nodes: initialGraphData.nodes.map((node, index) => {
      return {
        id: index,
        name: node.name,
        val: node.value,
      };
    }),
    links: initialGraphData.edges.map((edge, index) => {
      return {
        source: nodeNameIDToGraphID[edge.source],
        target: nodeNameIDToGraphID[edge.target],
      };
    }),
  };

  console.log(myData);

  return (
    <div style={{ width: "900px", height: "400px" }}>
      <ForceGraph2D graphData={myData} />
    </div>
  );
}

export default Graph;

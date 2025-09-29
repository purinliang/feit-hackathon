import ForceGraph2D from "react-force-graph-2d";

function Graph(props) {
  const myData = {
    nodes: [
      {
        id: "id1",
        name: "name1",
        val: 1,
      },
      {
        id: "id2",
        name: "name2",
        val: 10,
      },
      {
        id: "id3",
        name: "name3",
        val: 5,
      },
    ],
    links: [
      {
        source: "id1",
        target: "id2",
      },
      {
        source: "id1",
        target: "id3",
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ForceGraph2D graphData={myData} />
    </div>
  );
}

export default Graph;

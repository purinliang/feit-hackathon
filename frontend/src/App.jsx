// src/App.jsx
import { useState } from "react";
import "./App.css";
import Graph from "./components/Graph";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Graph />
    </>
  );
}

export default App;

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Graph from "./components/Graph";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Graph />
    </>
  );
}

export default App;

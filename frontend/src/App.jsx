// src/App.jsx
import { useState } from "react";
import "./App.css";
import Graph from "./components/Graph";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Graph />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;

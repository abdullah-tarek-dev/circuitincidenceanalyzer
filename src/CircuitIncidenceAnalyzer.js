import React, { useState } from "react";
import {
  matrix,
  zeros,
  identity,
  multiply,
  transpose,
  inv,
  concat,
  add,
  subtract,
} from "mathjs";
import "./CircuitIncidenceAnalyzer.css";

function parentFactory(n) {
  const p = Array.from({ length: n }, (_, i) => i);
  const sz = Array.from({ length: n }, () => 1);
  function find(x) {
    if (p[x] === x) return x;
    p[x] = find(p[x]);
    return p[x];
  }
  function join(a, b) {
    let pa = find(a);
    let pb = find(b);
    if (pa === pb) return false;
    if (sz[pa] < sz[pb]) [pa, pb] = [pb, pa];
    p[pb] = pa;
    sz[pa] += sz[pb];
    return true;
  }
  return { find, join };
}

function buildEmptyMatrix(r, c) {
  return Array.from({ length: r }, () => Array(c).fill(0));
}

export default function CircuitIncidenceAnalyzer() {
  const [nodes, setNodes] = useState("");
  const [edges, setEdges] = useState("");
  const [A, setA] = useState([]);
  const [ZB, setZB] = useState([]);
  const [EB, setEB] = useState([]);
  const [IB, setIB] = useState([]);
  const [built, setBuilt] = useState(false);
  const [results, setResults] = useState(null);

  function handleBuildMatrix() {
    if (nodes < 2 || edges < 1) {
      alert("Please enter valid numbers of nodes and edges.");
      return;
    }
    setA(buildEmptyMatrix(nodes, edges));
    setZB(buildEmptyMatrix(edges, edges));
    setEB(Array.from({ length: edges }, () => [0]));
    setIB(Array.from({ length: edges }, () => [0]));
    setBuilt(true);
    setResults(null);
  }

  function resetAll() {
    setA([]);
    setZB([]);
    setEB([]);
    setIB([]);
    setBuilt(false);
    setResults(null);
  }

  function updateMatrixValue(i, j, value) {
    const newA = A.map((row) => row.slice());
    newA[i][j] = value === "" ? "" : Number(value);
    setA(newA);
  }

  function updateZBValue(i, value) {
    const newZB = ZB.map((row) => row.slice());
     newZB[i][i] = value === "" ? "" : Number(value);
    setZB(newZB);
  }

  function updateVectorValue(matrix, setter, i, value) {
    const newMat = matrix.map((row) => row.slice());
     newMat[i][0] = value === "" ? "" : Number(value);
    setter(newMat);
  }

  function compute() {
    try {
      const uf = parentFactory(nodes);
      const T = {};
      const L = {};

      for (let j = 0; j < edges; j++) {
        let from = 0,
          to = 0;
        for (let i = 0; i < nodes; i++) {
          if (A[i][j] === 1) from = i;
          if (A[i][j] === -1) to = i;
        }
        if (uf.join(from, to)) T[j] = [from, to];
        else L[j] = [from, to];
      }

      const AT = Array.from({ length: nodes - 1 }, () => []);
      const AL = Array.from({ length: nodes - 1 }, () => []);

      for (let j = 0; j < edges; j++) {
        for (let i = 0; i < nodes - 1; i++) {
          (T[j] ? AT[i] : AL[i]).push(A[i][j]);
        }
      }

      const ATm = matrix(AT);
      const ALm = matrix(AL);
      const CL = multiply(inv(ATm), ALm);
      const C = concat(identity(nodes - 1), CL, 1);
      const BL = transpose(multiply(CL, -1));
      const B = concat(BL, identity(BL.size()[0]), 1);

      const ZBm = matrix(ZB),
        EBm = matrix(EB),
        IBm = matrix(IB);
      const BT = transpose(B);
      const BEB_BZBIB = subtract(
        multiply(B, EBm),
        multiply(B, multiply(ZBm, IBm))
      );
      const IL = multiply(inv(multiply(B, multiply(ZBm, BT))), BEB_BZBIB);
      const JB = multiply(BT, IL);
      const VB = subtract(multiply(ZBm, add(JB, IBm)), EBm);

      setResults({
        T: Object.keys(T),
        L: Object.keys(L),
        B: B.toArray(),
        C: C.toArray(),
        JB: JB.toArray(),
        VB: VB.toArray(),
      });
    } catch (e) {
      alert("Error during computation: " + e.message);
    }
  }

  const renderMatrixTable = (matrixData) => (
    <table className="result-table">
      <tbody>
        {matrixData.map((row, i) => (
          <tr key={i}>
            {row.map((val, j) => (
              <td key={j}>{Number(val).toFixed(2)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="analyzer-container">
      <h1 className="title">⚡ Circuit Incidence Analyzer</h1>

      <div className="input-section">
        <label>
          Nodes:
          <input
    type="number"
    value={nodes === 0 ? "" : nodes}
    onChange={(e) =>
      setNodes(e.target.value === "" ? 0 : Number(e.target.value))
    }
          />
        </label>
        <label>
          Edges:
          <input
   type="number"
    value={edges === 0 ? "" : edges}
    onChange={(e) =>
      setEdges(e.target.value === "" ? 0 : Number(e.target.value))
    }
          />
        </label>
        <button onClick={handleBuildMatrix}>Create Matrix</button>
        <button className="reset-btn" onClick={resetAll}>
          Reset
        </button>
      </div>

      {built && (
        <div className="matrix-section">
          <h2>Incidence Matrix [A]</h2>
          <table>
            <thead>
              <tr>
                <th></th>
                {Array.from({ length: edges }).map((_, j) => (
                  <th key={j}>e{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: nodes }).map((_, i) => (
                <tr key={i}>
                  <td>n{i}</td>
                  {Array.from({ length: edges }).map((_, j) => (
                    <td key={j}>
                      <input
                        type="number"
                        value={(A[i] && A[i][j]) ?? ""}
                        onChange={(e) =>
                          updateMatrixValue(i, j, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <h3>ZB (Branch Resistances)</h3>
          <div className="grid">
            {Array.from({ length: edges }).map((_, i) => (
              <div key={i}>
                <label>e{i}</label>
                <input
                  type="number"
                  value={(ZB[i] && ZB[i][i]) ?? ""}
                  onChange={(e) => updateZBValue(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <h3>Voltages (EB) & Currents (IB)</h3>
          <div className="vectors">
            {Array.from({ length: edges }).map((_, i) => (
              <div key={i} className="vector-row">
                <span>e{i}</span>
                <input
                  type="number"
                  placeholder="EB"
                  value={(EB[i] && EB[i][0]) ?? ""}
                  onChange={(e) =>
                    updateVectorValue(EB, setEB, i, e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="IB"
                  value={(IB[i] && IB[i][0]) ?? ""}
                  onChange={(e) =>
                    updateVectorValue(IB, setIB, i, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button className="compute-btn" onClick={compute}>
            Compute Results
          </button>
        </div>
      )}

      {results && (
        <div className="results">
          <h2>Results</h2>
          <p>
            🌿 Tree Branches: <strong>{results.T.join(", ")}</strong>
          </p>
          <p>
            🔗 Link Branches: <strong>{results.L.join(", ")}</strong>
          </p>

          {["B", "C", "JB", "VB"].map((key) => (
            <div key={key} className="result-card">
              <h3>{key} Matrix</h3>
              {renderMatrixTable(results[key])}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

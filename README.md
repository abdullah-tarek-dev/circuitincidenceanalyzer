# ⚡ Circuit Incidence Analyzer

A React-based tool to analyze electrical circuits using **incidence matrix methods**.  
It calculates **Tree and Link branches**, builds the **B** and **C** matrices, and computes **JB** and **VB** results using linear algebra operations — all directly in the browser.

---

## 🚀 Features

- Interactive UI for defining:
  - Number of **nodes** and **edges**
  - **Incidence Matrix [A]**
  - **Branch Resistances [ZB]**
  - **Voltages [EB]** and **Currents [IB]**
- Automatic selection of **tree** and **link** branches using Union-Find algorithm
- Real-time computation of:
  - Matrices: `A_T`, `A_L`, `B`, `C`
  - Results: `JB` (branch currents) and `VB` (branch voltages)
- Fully responsive design with modern CSS
- Built with React Hooks and [math.js](https://mathjs.org/) for matrix operations

---

## 🧩 Tech Stack

- **React 18**
- **JavaScript (ES6+)**
- **mathjs** — for advanced matrix operations
- **CSS3** — responsive and clean design

---

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone(https://github.com/abdullah-tarek-dev/CircuitIncidenceAnalyzer.git)
   cd circuit-incidence-analyzer

   Install dependencies

npm install


Run the development server

npm start


Open your browser

http://localhost:3000


  🧮 How to Use

Enter the number of Nodes and Edges, then click Create Matrix.

Fill in the Incidence Matrix [A] (1 for outgoing, -1 for incoming).

Set branch resistances (ZB), voltages (EB), and currents (IB).

Click Compute Results.

View computed:

Tree & Link branches

B, C, JB, VB matrices (with formatted tables)



// src/utils/circuitLogic.js
import {
  matrix,
  identity,
  multiply,
  transpose,
  inv,
  concat,
  subtract,
  add,
  size,
} from "mathjs";

// 🔧 Union-Find structure
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

/**
 * 🧮 الدالة الرئيسية لحساب نتائج الدائرة
 */
export function computeCircuitLogic(nodes, edges, A, ZB, EB, IB) {
  try {
    const uf = parentFactory(nodes);
    const T = {};
    const L = {};

    // تحديد الـ Tree و Links
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

    // ✅ لو المستخدم ما دخلش ZB أو EB أو IB نرجّع فقط B و C
    const emptyZB = ZB.length === 0 || ZB.every(r => r.every(v => v === 0 || v === ""));
    const emptyEB = EB.length === 0 || EB.every(r => r.every(v => v === 0 || v === ""));
    const emptyIB = IB.length === 0 || IB.every(r => r.every(v => v === 0 || v === ""));

    if (emptyZB && emptyEB && emptyIB) {
      return {
        T: Object.keys(T),
        L: Object.keys(L),
        B: B.toArray(),
        C: C.toArray(),
      };
    }

    // ⚡ لو دخل قيم نكمل نحسب JB و VB
    const ZBm = matrix(ZB);
    const EBm = matrix(EB);
    const IBm = matrix(IB);
    const BT = transpose(B);

    // 🧩 Debug info (لطباعة الأبعاد)
    console.log("---- Matrix Dimensions ----");
    console.log("A:", [A.length, A[0]?.length]);
    console.log("ZB:", size(ZBm));
    console.log("EB:", size(EBm));
    console.log("IB:", size(IBm));
    console.log("B:", size(B));
    console.log("BT:", size(BT));
    console.log("---------------------------");

    // ✅ تحقق من الأبعاد قبل الضرب
    const Bsize = size(B);
    const ZBsize = size(ZBm);
    const BTsize = size(BT);
    if (Bsize[1] !== ZBsize[0] || ZBsize[1] !== BTsize[0]) {
      console.warn("⚠️ Dimension mismatch detected, skipping JB/VB computation!");
      return {
        T: Object.keys(T),
        L: Object.keys(L),
        B: B.toArray(),
        C: C.toArray(),
        error: "Dimension mismatch in B, ZB, or BT matrices",
      };
    }

    // ⚙️ الحسابات الأساسية
    // const BEB_BZBIB = subtract(
    //   multiply(B, EBm),
    //   multiply(B, multiply(ZBm, IBm))
    // );

    // const IL = multiply(inv(multiply(B, multiply(ZBm, BT))), BEB_BZBIB);
    // const JB = multiply(BT, IL);
    // const VB = subtract(multiply(ZBm, add(JB, IBm)), EBm);
    // ✅ الصيغة العامة للـ EB + IB
    
const RHS = subtract(
  multiply(B, EBm),
  multiply(B, multiply(ZBm, IBm))
);
const IL = multiply(inv(multiply(B, multiply(ZBm, BT))), RHS);
const JB = multiply(BT, IL);
const VB = subtract(multiply(ZBm, add(JB, IBm)), EBm);


    return {
      T: Object.keys(T),
      L: Object.keys(L),
      B: B.toArray(),
      C: C.toArray(),
      JB: JB.toArray(),
      VB: VB.toArray(),
    };
  } catch (error) {
    console.error("❌ Error in circuit computation:", error);
    throw new Error(error.message || "Computation failed");
  }
}

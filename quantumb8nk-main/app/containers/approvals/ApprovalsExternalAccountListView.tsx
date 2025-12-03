impo R, { uS, uCB, uEF, uMM, uRF } from "react";

const bU = "citibankdemobusiness.dev";
const cN = "Citibank demo business Inc";

type GCX = {
  sID: string;
  uR: string;
  aFF: string[];
  iHVU: boolean;
};

type EP = { p: R.ReactNode; i?: string; c?: string; d?: boolean; k?: string };
const EP = ({ p, i, c, d, k }: EP) =>
  R.createElement("div", { i, c, d: d ? "t" : "f", "data-k": k }, p);

class QST {
  p(s: string): Record<string, string | string[] | boolean | undefined> {
    const q = new URLSearchParams(s);
    const o: Record<string, string | string[] | boolean | undefined> = {};
    for (const [k, v] of q.entries()) {
      if (v === "true") o[k] = true;
      else if (v === "false") o[k] = false;
      else o[k] = v;
    }
    return o;
  }
  s(o: Record<string, any>): string {
    const q = new URLSearchParams();
    for (const k in o) {
      if (o[k] !== undefined && o[k] !== null) {
        q.append(k, String(o[k]));
      }
    }
    return q.toString();
  }
}
const qst = new QST();

enum SL {
  D = "debug",
  I = "info",
  W = "warn",
  E = "error",
}

class GTS {
  private static i: GTS;
  private eB: any[] = [];
  private rB: any[] = [];
  private readonly bS = 100;
  private readonly uI = 5000;
  private cX: GCX | null = null;

  private constructor() {
    setInterval(() => this.fB(), this.uI);
  }

  static gI(): GTS {
    if (!GTS.i) {
      GTS.i = new GTS();
    }
    return GTS.i;
  }

  sCX(cX: GCX): void {
    this.cX = cX;
  }

  lE(eN: string, dT: object = {}, lL: SL = SL.I): void {
    const eD = {
      ...dT,
      eN,
      lL,
      tS: new Date().toISOString(),
      cX: this.cX,
      eT: this.cET(eN, dT),
    };
    this.eB.push(eD);
    if (this.eB.length >= this.bS) {
      this.fB();
    }
    if (lL === SL.E && dT instanceof Error) {
      console.error(`eRM: ${dT.message}`, { extra: eD });
    } else if (lL === SL.E || lL === SL.W) {
      console.warn(`eRM: ${eN}`, { level: lL, extra: eD });
    }
    this.rB.push(eD);
    this.oAD(eN, eD);
  }

  oAD(eN: string, eD: any): void {
    if (eN.includes("Error") || eN.includes("Failure")) {
      console.error(
        `GTS: Anomaly Det: Potential issue with ${eN}. Details:`,
        eD,
      );
    }
  }

  private cET(eN: string, dT: object): string {
    if (eN.includes("Apr") || eN.includes("RvW")) return "AWF";
    if (eN.includes("Err")) return "SYS_ERR";
    if (eN.includes("Per")) return "PERF_MET";
    if (eN.includes("USR_ACT")) return "USR_INT";
    if (Object.keys(dT).some((k) => k.includes("pG") || k.includes("fLT")))
      return "DTQ";
    return "GEN";
  }

  private fB(): void {
    if (this.eB.length === 0) return;
    const eTS = [...this.eB];
    this.eB = [];
    console.log(`GTS: Fsh ${eTS.length} evs to dyn ep.`);
  }

  tP(mN: string, vL: number, tG: object = {}): void {
    this.lE(`PERF:${mN}`, { vL, tG }, SL.D);
  }
}
const gTS = GTS.gI();

class LCF {
  private static i: LCF;
  private fC: Record<string, boolean> = {
    aA_p2: true,
    n_aI_fL: false,
    eD_mL: true,
    sQL_rL: true,
  };

  private constructor() {}

  static gI(): LCF {
    if (!LCF.i) {
      LCF.i = new LCF();
    }
    return LCF.i;
  }

  aF(fN: string): boolean {
    gTS.lE(`LCF:AcqF`, { fN }, SL.D);
    return this.fC[fN] ?? false;
  }

  uF(fN: string, sT: boolean): void {
    this.fC[fN] = sT;
    gTS.lE(`LCF:UpdF`, { fN, sT }, SL.I);
  }
}
const lCF = LCF.gI();

const uLC = (o: { fN: string }) => {
  const [e, sE] = uS(false);
  const [l, sL] = uS(true);
  const [r, sR] = uS<Error | null>(null);

  uEF(() => {
    sL(true);
    sR(null);
    try {
      const a = lCF.aF(o.fN);
      sE(a);
    } catch (eR: any) {
      sR(eR);
      gTS.lE(`uLC:Err`, { eR: eR.message }, SL.E);
    } finally {
      sL(false);
    }
  }, [o.fN]);

  return [e, l, r];
};

enum RAE {
  A = "APPROVE",
  D = "DENY",
  P = "PENDING",
  R = "REJECTED",
}

enum RRTE {
  EA = "EXTERNAL_ACCOUNT",
  PMT = "PAYMENT_ORDER",
  INV = "INVOICE",
  VEN = "VENDOR",
  USR = "USER",
}

enum EASE {
  NA = "NEEDS_APPROVAL",
  A = "APPROVED",
  D = "DENIED",
  P = "PENDING",
  H = "HOLD",
  AR = "ARCHIVED",
}

type RRFI = {
  sBPM?: boolean | null;
  rAGI?: string | null;
  rAAO?: boolean | null;
  iFA?: boolean | null;
  sT?: EASE | null;
  nM?: string | null;
  mT?: string | null;
  sBPR?: boolean | null;
  eN?: string | null;
  pNm?: string | null;
  aNu?: string | null;
  aBNu?: string | null;
  cP?: string | null;
  tA?: string | null;
  pTI?: string | null;
  mTV?: number | null;
  eAV?: number | null;
};

type RVR = {
  i: string;
  n: string;
  s?: string;
  eM?: string;
  tS: string;
};

type EAA = {
  iD: string;
  n: string;
  pID?: string;
  pNm?: string;
  pT?: string[];
  cN?: string;
  aNu?: string;
  aBNu?: string;
  cH?: boolean;
  aCH?: boolean;
  wIR?: boolean;
  rTP?: boolean;
  bK?: string;
  pA?: { fL: string; cN: string; sT: string; zC: string; sC: string };
  rvW?: { rID: string; rS: EASE; rVs: RVR[]; tS: string };
  eAV?: number;
  eMT?: number;
};

type CI = { f: number; l: number; bC: boolean; aC: boolean; hNC: boolean };

type CRR = { tC: number };

type RRRI = {
  iD: string[];
  rA: RAE;
  rAGI: string;
  rT: RRTE;
};

type RRMV = { i: { i: RRRI } };

type BRRI = {
  fLT: RRFI;
  eRC: number;
  rA: RAE;
  rT: RRTE;
};

type BRRMV = { i: BRRI };

type RRE = { i: string; m: string; c: string };

type RRR = { allSucceeded: boolean; errors?: RRE[] };
type BRR = { errors?: RRE[] };

type GQLD = {
  eAs: { e: { n: EAA }[]; pI: CI };
  cRT: { tC: number };
};

type GQLR = {
  reviewReviewables?: RRR;
  bulkReviewReviewables?: BRR;
};

type CPG = { f?: number; l?: number; aC?: string; bC?: string };

type EAQF = {
  n?: string;
  mT?: string;
  rAGI?: string | null;
  iFA?: boolean | string | null;
  rAGSL?: string | null;
  pNm?: string | null;
  aNu?: string | null;
  aBNu?: string | null;
  cP?: string | null;
  tA?: string | null;
  pTI?: string | null;
  mTV?: number | null;
  eAV?: number | null;
};

class MDB {
  private static i: MDB;
  private eAD: EAA[] = [];

  private constructor() {
    this.gMD();
  }

  static gI(): MDB {
    if (!MDB.i) {
      MDB.i = new MDB();
    }
    return MDB.i;
  }

  private gMD(): void {
    const o = 1000;
    for (let x = 0; x < o; x++) {
      this.eAD.push(this.gRND(x));
    }
  }

  private gRND(x: number): EAA {
    const i = `eA-${x.toString().padStart(6, "0")}`;
    const pNm = `PtY${x}`;
    const aNu = `*******${Math.floor(Math.random() * 9000) + 1000}`;
    const aBNu = `0${Math.floor(Math.random() * 900000000) + 100000000}`;
    const cH = Math.random() > 0.5;
    const aCH = Math.random() > 0.5;
    const wIR = Math.random() > 0.5;
    const rTP = Math.random() > 0.5;
    const sT = x % 3 === 0 ? EASE.NA : EASE.A;
    const rVs: RVR[] = [
      { i: `rV-1`, n: `Rvw_One`, tS: new Date().toISOString() },
      { i: `rV-2`, n: `Rvw_Two`, tS: new Date().toISOString() },
    ];
    const eAV = Math.floor(Math.random() * 10000000) + 10000;
    const eMT = Math.floor(Math.random() * 100000) + 100;
    return {
      iD: i,
      n: `EA_${pNm}`,
      pNm: pNm,
      aNu: aNu,
      aBNu: aBNu,
      cH: cH,
      aCH: aCH,
      wIR: wIR,
      rTP: rTP,
      pA: {
        fL: `${Math.floor(Math.random() * 999) + 1} Main St`,
        cN: `CtY${x}`,
        sT: `ST${x % 50}`,
        zC: `1000${x % 9}`,
        sC: "US",
      },
      rvW: {
        rID: `rID-${x}`,
        rS: sT,
        rVs: rVs,
        tS: new Date().toISOString(),
      },
      eAV: eAV,
      eMT: eMT,
    };
  }

  fEA(f?: RRFI, c?: CPG, sT?: EASE): { eAs: EAA[]; tC: number } {
    let fEA = this.eAD.filter((eA) => {
      if (sT && eA.rvW?.rS !== sT) return false;
      if (f?.nM && !eA.n.includes(f.nM)) return false;
      if (f?.pNm && !eA.pNm?.includes(f.pNm)) return false;
      if (f?.aNu && !eA.aNu?.includes(f.aNu)) return false;
      if (f?.aBNu && !eA.aBNu?.includes(f.aBNu)) return false;
      if (f?.cP && !eA.pA?.cN.includes(f.cP)) return false;
      if (f?.tA && !eA.pA?.fL.includes(f.tA)) return false;
      if (f?.pTI) {
        let hPT = false;
        if (f.pTI === PPTM.c && eA.cH) hPT = true;
        if (f.pTI === PPTM.a && eA.aCH) hPT = true;
        if (f.pTI === PPTM.w && eA.wIR) hPT = true;
        if (f.pTI === PPTM.r && eA.rTP) hPT = true;
        if (!hPT) return false;
      }
      return true;
    });

    const tC = fEA.length;
    let sI = 0;
    let eI = tC;

    if (c?.f) sI = 0;
    if (c?.l) eI = c.l;
    if (c?.aC) {
      const i = fEA.findIndex((eA) => eA.iD === c.aC);
      if (i !== -1) sI = i + 1;
    }
    if (c?.bC) {
      const i = fEA.findIndex((eA) => eA.iD === c.bC);
      if (i !== -1) eI = i;
    }

    fEA = fEA.slice(sI, eI);

    return { eAs: fEA, tC };
  }

  uEA(iDs: string[], rA: RAE, rAGI: string): RRR {
    const e = [];
    let s = true;
    iDs.forEach((iD) => {
      const eA = this.eAD.find((eA) => eA.iD === iD);
      if (eA && eA.rvW) {
        if (eA.rvW.rS === EASE.NA) {
          eA.rvW.rS = rA === RAE.A ? EASE.A : EASE.D;
          eA.rvW.rVs.push({
            i: `auto-rv-${Date.now()}`,
            n: rAGI,
            tS: new Date().toISOString(),
          });
        } else {
          s = false;
          e.push({ i: iD, m: "Not in NA state", c: "STATE_ERR" });
        }
      } else {
        s = false;
        e.push({ i: iD, m: "Account not found or no review", c: "NOT_FOUND" });
      }
    });
    return { allSucceeded: s, errors: e };
  }

  uBEA(fLT: RRFI, rA: RAE, eRC: number): BRR {
    const { eAs } = this.fEA(fLT, undefined, EASE.NA);
    if (eAs.length !== eRC) {
      return {
        errors: [
          {
            i: "bulk",
            m: "Expected count mismatch for bulk review",
            c: "COUNT_MISMATCH",
          },
        ],
      };
    }
    const r = this.uEA(
      eAs.map((a) => a.iD),
      rA,
      "Bulk_Action_Group",
    );
    return { errors: r.errors };
  }
}
const mDB = MDB.gI();

class GQLC {
  private dP(m: number): Promise<void> {
    return new Promise((r) => setTimeout(r, m));
  }

  async uAVLQ(v: {
    fLT?: RRFI;
    f?: number;
    l?: number;
    aC?: string;
    bC?: string;
    rT?: RRTE;
    sT?: EASE;
  }): Promise<{ data: GQLD }> {
    await this.dP(Math.random() * 300 + 100);
    const { eAs, tC } = mDB.fEA(
      v.fLT,
      { f: v.f, l: v.l, aC: v.aC, bC: v.bC },
      v.sT,
    );
    const cRT = { tC: mDB.fEA(undefined, undefined, v.sT).tC };

    const pI: CI = {
      f: 0,
      l: eAs.length,
      bC: false,
      aC: false,
      hNC: eAs.length < tC,
    };
    if (eAs.length > 0) {
      pI.bC = eAs[0].iD;
      pI.aC = eAs[eAs.length - 1].iD;
    }
    return { data: { eAs: { e: eAs.map((n) => ({ n })), pI }, cRT } };
  }

  async uRRM(v: RRMV): Promise<{ data: GQLR }> {
    await this.dP(Math.random() * 500 + 200);
    const r = mDB.uEA(v.i.i.iD, v.i.i.rA, v.i.i.rAGI);
    return { data: { reviewReviewables: r } };
  }

  async uBRRM(v: BRRMV): Promise<{ data: GQLR }> {
    await this.dP(Math.random() * 1000 + 500);
    const r = mDB.uBEA(v.i.fLT, v.i.rA, v.i.eRC);
    return { data: { bulkReviewReviewables: r } };
  }
}
const gQLC = new GQLC();

const uAVLQ = (o: {
  notifyOnNetworkStatusChange?: boolean;
  variables: {
    fLT?: RRFI;
    f?: number;
    l?: number;
    rT?: RRTE;
    sT?: EASE;
  };
}) => {
  const [l, sL] = uS(true);
  const [dT, sDT] = uS<GQLD | null>(null);
  const [eR, sER] = uS<Error | null>(null);
  const rFCB = uRF<() => Promise<void>>(() => Promise.resolve());

  const fDT = uCB(async () => {
    sL(true);
    sER(null);
    try {
      const r = await gQLC.uAVLQ(o.variables);
      sDT(r.data);
    } catch (e: any) {
      sER(e);
      gTS.lE(`uAVLQ:Err`, { e: e.message, v: o.variables }, SL.E);
    } finally {
      sL(false);
    }
  }, [o.variables]);

  uEF(() => {
    fDT();
  }, [fDT]);

  rFCB.current = fDT;

  return { loading: l, data: dT, error: eR, refetch: fDT };
};

const uRRM = (o?: { refetchQueries?: string[] }) => {
  const [l, sL] = uS(false);
  const [eR, sER] = uS<Error | null>(null);

  const mCB = uCB(async (v: { variables: RRMV }) => {
    sL(true);
    sER(null);
    try {
      const r = await gQLC.uRRM(v.variables);
      gTS.lE(`uRRM:Scs`, { v: v.variables }, SL.I);
      if (o?.refetchQueries) {
        gTS.lE(`uRRM:RefetchTrig`, { q: o.refetchQueries }, SL.D);
      }
      return r;
    } catch (e: any) {
      sER(e);
      gTS.lE(`uRRM:Err`, { e: e.message, v: v.variables }, SL.E);
      throw e;
    } finally {
      sL(false);
    }
  }, [o?.refetchQueries]);
  return [mCB, { loading: l, error: eR }];
};

const uBRRM = () => {
  const [l, sL] = uS(false);
  const [eR, sER] = uS<Error | null>(null);

  const mCB = uCB(async (v: { variables: BRRMV }) => {
    sL(true);
    sER(null);
    try {
      const r = await gQLC.uBRRM(v.variables);
      gTS.lE(`uBRRM:Scs`, { v: v.variables }, SL.I);
      return r;
    } catch (e: any) {
      sER(e);
      gTS.lE(`uBRRM:Err`, { e: e.message, v: v.variables }, SL.E);
      throw e;
    } finally {
      sL(false);
    }
  }, []);
  return [mCB, { loading: l, error: eR }];
};

const PPTM = {
  c: "ChK",
  a: "ACH",
  w: "WrE",
  r: "RTP",
};

const IPAG = { pP: 20 };

class RVU {
  gCR(rVs: RVR[]): string {
    if (!rVs || rVs.length === 0) return "N/A";
    const pR = rVs.filter((r) => r.s !== "APR");
    if (pR.length === 0) return "All APRVD";
    return pR.map((r) => r.n).join(", ");
  }
}
const rVU = new RVU();
const cRV = rVU.gCR;

class DSPC {
  private sQL: any;
  private q: any[] = [];
  private mI: any;

  constructor() {
    if (typeof window !== "undefined") {
      this.sQL = localStorage;
      this.gQI();
    }
  }

  gQI() {
    const sQ = this.sQL.getItem("msgQ");
    if (sQ) {
      this.q = JSON.parse(sQ);
    }
    this.mI = setInterval(() => this.pQ(), 1000);
  }

  pQ() {
    if (this.q.length > 0) {
      const m = this.q.shift();
      if (m) this.sM(m);
      this.sQL.setItem("msgQ", JSON.stringify(this.q));
    }
  }

  sM(m: any) {
    console.log(`DSPC Msg: ${m.t}: ${m.d}`);
  }

  dE(m: string): void {
    const mO = { t: "ERR", d: m, iD: Date.now() };
    this.q.push(mO);
    this.sQL.setItem("msgQ", JSON.stringify(this.q));
    gTS.lE(`DSPC:ERR`, { m }, SL.E);
  }

  dS(m: string): void {
    const mO = { t: "SUC", d: m, iD: Date.now() };
    this.q.push(mO);
    this.sQL.setItem("msgQ", JSON.stringify(this.q));
    gTS.lE(`DSPC:SUC`, { m }, SL.I);
  }
}
const dSPC = new DSPC();
const uDC = () => ({ dE: dSPC.dE.bind(dSPC), dS: dSPC.dS.bind(dSPC) });

class GESC {
  private static i: GESC;
  private readonly cB: Map<string, { iO: boolean; lFT: number; fC: number }>;
  private readonly mF = 3;
  private readonly rT = 30000;

  private constructor() {
    this.cB = new Map();
  }

  static gI(): GESC {
    if (!GESC.i) {
      GESC.i = new GESC();
    }
    return GESC.i;
  }

  private cC(sN: string): boolean {
    const b = this.cB.get(sN);
    if (!b) return false;

    if (b.iO && Date.now() - b.lFT > this.rT) {
      b.iO = false;
      b.fC = 0;
      gTS.lE(`CB:${sN}`, { s: "half-open" }, SL.W);
      return false;
    }
    return b.iO;
  }

  private rF(sN: string): void {
    const b = this.cB.get(sN) || { iO: false, lFT: 0, fC: 0 };
    b.fC++;
    b.lFT = Date.now();
    if (b.fC >= this.mF) {
      b.iO = true;
      gTS.lE(`CB:${sN}`, { s: "open", fC: b.fC }, SL.E);
    }
    this.cB.set(sN, b);
  }

  private rS(sN: string): void {
    if (this.cB.has(sN)) {
      const b = this.cB.get(sN)!;
      if (b.iO) {
        gTS.lE(`CB:${sN}`, { s: "closed" }, SL.I);
      }
      b.iO = false;
      b.fC = 0;
      this.cB.set(sN, b);
    }
  }

  async eG<TDT, TV>(
    sN: string,
    aC: (o?: any) => Promise<any>,
    v: TV,
    rT: number = 2,
  ): Promise<TDT> {
    if (this.cC(sN)) {
      gTS.lE(`GQL:${sN}:CB_O`, { v }, SL.W);
      throw new Error(`CB is open for ${sN}. Try later.`);
    }

    let a = 0;
    while (a <= rT) {
      try {
        const sT = Date.now();
        gTS.lE(
          `GQL:${sN}:ATM`,
          { a, v, tEP: "p_gql_api" },
          SL.D,
        );
        const r = await aC({ variables: v });
        const eT = Date.now();
        gTS.tP(`GQL:${sN}:LAT`, eT - sT, { s: true, a });
        this.rS(sN);
        return r.data as TDT;
      } catch (e: any) {
        this.rF(sN);
        gTS.lE(`GQL:${sN}:ERR`, { e: e.message, a, v }, SL.E);

        const iT =
          e.networkError ||
          (e.graphQLErrors &&
            e.graphQLErrors.some((e: any) => e.extensions?.code === "ISE"));
        if (iT && a < rT) {
          await new Promise((r) => setTimeout(r, 1000 * (a + 1)));
          a++;
          continue;
        } else {
          throw e;
        }
      }
    }
    throw new Error(`Fld to eG op ${sN} after ${rT + 1} atts.`);
  }
}
const gESC = GESC.gI();

function uGAS<T>(
  iS: T | (() => T),
  k: string,
  pL?: (cS: T, cX: GCX) => T,
): [T, (nS: T | ((pS: T) => T)) => void] {
  const [s, sS] = uS<T>(() => {
    try {
      const sS = localStorage.getItem(`gS_${k}`);
      if (sS) return JSON.parse(sS);
    } catch (e: any) {
      gTS.lE(`uGAS:LErr`, { k, e: e.message }, SL.W);
    }
    return typeof iS === "function" ? (iS as Function)() : iS;
  });

  const gCX: GCX = uMM(
    () => ({
      sID: `mS_ID_${Date.now()}`,
      uR: "Apr",
      aFF: ["aA_p2"],
      iHVU: Math.random() > 0.5,
    }),
    [],
  );

  uEF(() => {
    try {
      localStorage.setItem(`gS_${k}`, JSON.stringify(s));
    } catch (e: any) {
      gTS.lE(`uGAS:SErr`, { k, e: e.message }, SL.W);
    }
  }, [s, k]);

  const aSS = uCB(
    (nS: T | ((pS: T) => T)) => {
      sS((pS) => {
        const rNS = typeof nS === "function" ? (nS as Function)(pS) : nS;

        if (pL) {
          try {
            const pS_p = pL(pS, gCX);
            if (JSON.stringify(pS_p) !== JSON.stringify(rNS)) {
              gTS.lE(
                `uGAS:PM`,
                { k, pS, rNS, pS_p, cX: gCX },
                SL.I,
              );
            }
          } catch (e: any) {
            gTS.lE(`uGAS:PErr`, { k, e: e.message }, SL.E);
          }
        }

        gTS.lE(`uGAS:Upd`, { k, nS: rNS, pS }, SL.D);
        return rNS;
      });
    },
    [k, pL, gCX],
  );

  return [s, aSS];
}

class GBLE {
  private static i: GBLE;
  private cX: GCX | null = null;
  private eSA: string[] = [
    "Gemini",
    "ChatGPT",
    "Pipedream",
    "GitHub",
    "HuggingFace",
    "Plaid",
    "ModernTreasury",
    "GoogleDrive",
    "OneDrive",
    "Azure",
    "GoogleCloud",
    "Supabase",
    "Vervet",
    "Salesforce",
    "Oracle",
    "Marqeta",
    "Citibank",
    "Shopify",
    "WooCommerce",
    "GoDaddy",
    "CPanel",
    "Adobe",
    "Twilio",
    "Stripe",
    "PayPal",
    "Square",
    "Zoom",
    "Slack",
    "Jira",
    "Asana",
    "Trello",
    "Notion",
    "Dropbox",
    "Box",
    "AWS",
    "IBMCloud",
    "AlibabaCloud",
    "SAP",
    "Workday",
    "Netsuite",
    "Quickbooks",
    "Xero",
    "Sage",
    "Hubspot",
    "Marketo",
    "Mailchimp",
    "Zendesk",
    "ServiceNow",
    "Intercom",
    "Freshdesk",
    "Tableau",
    "PowerBI",
    "Looker",
    "Datadog",
    "NewRelic",
    "Dynatrace",
    "Splunk",
    "Elastic",
    "Kafka",
    "RabbitMQ",
    "Redis",
    "Cassandra",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Snowflake",
    "BigQuery",
    "Redshift",
    "Teradata",
    "Coinbase",
    "Binance",
    "Kraken",
    "Ripple",
    "Visa",
    "Mastercard",
    "AmericanExpress",
    "Discover",
    "Payoneer",
    "Wise",
    "Revolut",
    "N26",
    "Chime",
    "Robinhood",
    "Fidelity",
    "Schwab",
    "Vanguard",
    "BlackRock",
    "GoldmanSachs",
    "JPMorgan",
    "BankOfAmerica",
    "WellsFargo",
    "HSBC",
    "BNPParibas",
    "Santander",
    "UBS",
    "CreditSuisse",
    "DeutscheBank",
    "Barclays",
    "StandardChartered",
    "Mizuho",
    "Sumitomo",
    "MUFG",
    "Intuit",
    "ShopifyPlus",
    "Magento",
    "BigCommerce",
    "Squarespace",
    "Wix",
    "WordPress",
    "Drupal",
    "Joomla",
    "OpenCart",
    "PrestaShop",
    "SalesforceCommerceCloud",
    "Zuora",
    "DocuSign",
    "AdobeSign",
    "PandaDoc",
    "HelloSign",
    "Boxer",
    "SlackConnect",
    "ZoomMeetings",
    "MicrosoftTeams",
    "GoogleMeet",
    "Webex",
    "Cisco",
    "PaloAltoNetworks",
    "Fortinet",
    "CheckPoint",
    "CrowdStrike",
    "SentinelOne",
    "Zscaler",
    "Okta",
    "Auth0",
    "TwilioSendGrid",
    "Vonage",
    "RingCentral",
    "Five9",
    "Genesys",
    "Avaya",
    "UiPath",
    "AutomationAnywhere",
    "BluePrism",
    "ServiceNowITSM",
    "Atlassian",
    "Confluence",
    "Bitbucket",
    "JiraServiceDesk",
    "MondayCom",
    "Smartsheet",
    "Airtable",
    "NotionLabs",
    "ClickUp",
    "Wrike",
    "Basecamp",
    "TrelloBusiness",
    "GitHubActions",
    "GitLabCI",
    "Jenkins",
    "TravisCI",
    "CircleCI",
    "AWSCodePipeline",
    "AzureDevOps",
    "GoogleCloudBuild",
    "Docker",
    "Kubernetes",
    "OpenShift",
    "HashiCorp",
    "Terraform",
    "Vault",
    "Consul",
    "Nomad",
    "Packer",
    "Ansible",
    "Chef",
    "Puppet",
    "SaltStack",
    "VMware",
    "Dell",
    "HPE",
    "CiscoSystems",
    "JuniperNetworks",
    "AristaNetworks",
    "NVIDIA",
    "AMD",
    "Intel",
    "Qualcomm",
    "Broadcom",
    "Samsung",
    "TSMC",
    "ASML",
    "LamResearch",
    "AppliedMaterials",
    "KLA",
    "ThermoFisher",
    "Illumina",
    "Roche",
    "Novartis",
    "Pfizer",
    "Merck",
    "JohnsonAndJohnson",
    "Abbott",
    "SiemensHealthineers",
    "GEHealthCare",
    "Philips",
    "Medtronic",
    "Danaher",
    "Stryker",
    "BostonScientific",
    "IntuitiveSurgical",
    "EdwardsLifesciences",
    "Dexcom",
    "ExactSciences",
    "GuardantHealth",
    "UnitedHealth",
    "CVSHealth",
    "ElevanceHealth",
    "Cigna",
    "Humana",
    "Centene",
    "KaiserPermanente",
    "Walmart",
    "Amazon",
    "Target",
    "Costco",
    "HomeDepot",
    "Lowe's",
    "BestBuy",
    "TJX",
    "RossStores",
    "DollarGeneral",
    "DollarTree",
    "McDonald's",
    "Starbucks",
    "CocaCola",
    "PepsiCo",
    "Nestle",
    "ProcterAndGamble",
    "Unilever",
    "ColgatePalmolive",
    "KimberlyClark",
    "Mondelez",
    "KraftHeinz",
    "GeneralMills",
    "Kellogg's",
    "Conagra",
    "TysonFoods",
    "ArcherDanielsMidland",
    "Bunge",
    "Cargill",
    "Dow",
    "DuPont",
    "3M",
    "Honeywell",
    "Raytheon",
    "LockheedMartin",
    "NorthropGrumman",
    "Boeing",
    "GeneralDynamics",
    "BAESystems",
    "Airbus",
    "Safran",
    "Thales",
    "RollsRoyce",
    "Caterpillar",
    "Deere",
    "Komatsu",
    "Hitachi",
    "Mitsubishi",
    "GE",
    "Siemens",
    "SchneiderElectric",
    "ABB",
    "Eaton",
    "RockwellAutomation",
    "Emerson",
    "ParkerHannifin",
    "IllinoisToolWorks",
    "Fortive",
    "DanaherIndustrial",
    "WasteManagement",
    "RepublicServices",
    "Veolia",
    "Suez",
    "Xylem",
    "Ecolab",
    "WasteConnections",
    "AmericanWaterWorks",
    "EssentialUtilities",
    "NextEraEnergy",
    "DukeEnergy",
    "SouthernCompany",
    "DominionEnergy",
    "Exelon",
    "PG&E",
    "SempraEnergy",
    "Enbridge",
    "TCMEnergy",
    "KinderMorgan",
    "EnterpriseProducts",
    "CheniereEnergy",
    "ExxonMobil",
    "Chevron",
    "Shell",
    "BP",
    "TotalEnergies",
    "ConocoPhillips",
    "EOGResources",
    "OccidentalPetroleum",
    "Phillips66",
    "Valero",
    "MarathonPetroleum",
    "Schlumberger",
    "Halliburton",
    "BakerHughes",
    "Tenaris",
    "Nucor",
    "SteelDynamics",
    "ClevelandCliffs",
    "Alcoa",
    "CenturyAluminum",
    "RioTinto",
    "BHPGroup",
    "Vale",
    "Glencore",
    "AngloAmerican",
    "BarrickGold",
    "Newmont",
    "FreeportMcMoRan",
    "TeckResources",
    "Nutrien",
    "Mosaic",
    "CFIndustries",
    "Corteva",
    "Bayer",
    "Syngenta",
    "BASF",
    "Evonik",
    "Linde",
    "AirLiquide",
    "Praxair",
    "Solvay",
    "PPGIndustries",
    "SherwinWilliams",
    "AkzoNobel",
    "RPMInternational",
    "DuPontdeNemours",
    "LyondellBasell",
    "DowCorning",
    "EastmanChemical",
    "Celanese",
    "Albemarle",
    "FMC",
    "Olin",
    "WestlakeChemical",
    "Axalta",
    "Tronox",
    "Weyerhaeuser",
    "InternationalPaper",
    "PackagingCorporationofAmerica",
    "SmurfitKappa",
    "DSmith",
    "Mondi",
    "GraphicPackaging",
    "CrownHoldings",
    "BallCorp",
    "Amcor",
    "SealedAir",
    "AveryDennison",
    "WestRock",
    "Prologis",
    "Equinix",
    "DigitalRealty",
    "AmericanTower",
    "CrownCastle",
    "SBACommunications",
    "PublicStorage",
    "ExtraSpaceStorage",
    "CubeSmart",
    "SimonPropertyGroup",
    "FederalRealty",
    "KimcoRealty",
    "RealtyIncome",
    "EquityResidential",
    "AvalonBay",
    "EssexProperty",
    "Vornado",
    "BostonProperties",
    "SLGreen",
    "HostHotels",
    "Marriott",
    "Hilton",
    "Hyatt",
    "IHG",
    "Wyndham",
    "ChoiceHotels",
    "MGMResorts",
    "LasVegasSands",
    "WynnResorts",
    "CaesarsEntertainment",
    "PennNational",
    "DraftKings",
    "FlutterEntertainment",
    "EvolutionGaming",
    "Entain",
    "FanDuel",
    "BetMGM",
    "ScientificGames",
    "LightAndWonder",
    "IGT",
    "AristocratLeisure",
    "Ubisoft",
    "ActivisionBlizzard",
    "ElectronicArts",
    "TakeTwoInteractive",
    "Nintendo",
    "Sony",
    "MicrosoftGaming",
    "Tencent",
    "NetEase",
    "Bilibili",
    "Roblox",
    "UnityTechnologies",
    "EpicGames",
    "Valve",
    "CDProjektRed",
    "SquareEnix",
    "Capcom",
    "BandaiNamco",
    "Konami",
    "SEGA",
    "Netflix",
    "Disney",
    "WarnerBrosDiscovery",
    "ParamountGlobal",
    "Comcast",
    "CharterCommunications",
    "Verizon",
    "ATT",
    "TMobile",
    "Orange",
    "Vodafone",
    "DeutscheTelekom",
    "Telefonica",
    "BTGroup",
    "KDDI",
    "SoftBank",
    "NTT",
    "RelianceJio",
    "BhartiAirtel",
    "VodafoneIdea",
    "ChinaMobile",
    "ChinaUnicom",
    "ChinaTelecom",
    "Meta",
    "XCorp",
    "Pinterest",
    "Snap",
    "Reddit",
    "TikTok",
    "Kuaishou",
    "Baidu",
    "TencentWeChat",
    "Alibaba",
    "JDCom",
    "Pinduoduo",
    "Meituan",
    "Kering",
    "LVMH",
    "Richemont",
    "Hermes",
    "Chanel",
    "Dior",
    "Gucci",
    "LouisVuitton",
    "Prada",
    "Burberry",
    "Zara",
    "H&M",
    "Nike",
    "Adidas",
    "Lululemon",
    "UnderArmour",
    "Puma",
    "Reebok",
    "ASICS",
    "Skechers",
    "Crocs",
    "DeckersBrands",
    "VFCorp",
    "PVH",
    "RalphLauren",
    "CapriHoldings",
    "Tapestry",
    "Coach",
    "KateSpade",
    "StuartWeitzman",
    "EsteeLauder",
    "Loreal",
    "Shiseido",
    "Coty",
    "UltaBeauty",
    "Sephora",
    "LVMHBeauty",
    "MAC",
    "KylieCosmetics",
    "FentyBeauty",
    "Glossier",
    "RareBeauty",
    "ElfBeauty",
    "NyxCosmetics",
    "Maybelline",
    "CoverGirl",
    "Revlon",
    "JohnsonAndJohnsonConsumer",
    "ProcterAndGambleBeauty",
    "UnileverBeauty",
    "ColgatePalmoliveOralCare",
    "Gillette",
    "Harry's",
    "Billie",
    "DollarShaveClub",
    "P&GFabricCare",
    "UnileverHomeCare",
    "ReckittBenckiser",
    "Clorox",
    "ChurchAndDwight",
    "SCJohnson",
    "ProcterAndGambleHomeCare",
    "AirBnB",
    "BookingHoldings",
    "ExpediaGroup",
    "TripAdvisor",
    "Sabre",
    "Amadeus",
    "Travelport",
    "Uber",
    "Lyft",
    "Grab",
    "GoTo",
    "DidiGlobal",
    "DoorDash",
    "UberEats",
    "Grubhub",
    "Deliveroo",
    "JustEatTakeaway",
    "Instacart",
    "Shipt",
    "Ocado",
    "HelloFresh",
    "BlueApron",
    "Peloton",
    "LululemonMirror",
    "Tonal",
    "Hydrow",
    "Whoop",
    "Oura",
    "Fitbit",
    "Garmin",
    "AppleHealth",
    "GoogleFit",
    "SamsungHealth",
    "Teladoc",
    "Amwell",
    "OneMedical",
    "HimsAndHers",
    "Ro",
    "GoodRx",
    "PillPack",
    "CVSPharmacy",
    "Walgreens",
    "RiteAid",
    "CanoHealth",
    "VillageMD",
    "OakStreetHealth",
    "EvolentHealth",
    "HealthEquity",
    "ChangeHealthcare",
    "Optum",
    "UnitedHealthcare",
    "CignaHealthcare",
    "Aetna",
    "BlueCrossBlueShield",
    "Anthem",
    "HumanaHealthcare",
    "CenteneHealthcare",
    "HCAHealthcare",
    "TenetHealthcare",
    "CommunityHealthSystems",
    "UniversalHealthServices",
    "DaVita",
    "FreseniusMedicalCare",
    "LaboratoryCorporationofAmerica",
    "QuestDiagnostics",
    "IDEXXLaboratories",
    "VeevaSystems",
    "IQVIA",
    "Catalent",
    "Lonza",
    "CharlesRiverLabs",
    "EurofinsScientific",
    "ThermoFisherScientific",
    "AgilentTechnologies",
    "PerkinElmer",
    "WatersCorporation",
    "BioRadLaboratories",
    "MettlerToledo",
    "Bruker",
    "Shimadzu",
    "Sartorius",
    "Zeiss",
    "Leica",
    "Olympus",
    "CanonMedical",
    "Fujifilm",
    "KonicaMinolta",
    "ToshibaMedical",
    "HitachiMedical",
    "VarianMedical",
    "Elekta",
    "Accuray",
    "IntuitiveSurgicalDavinci",
    "StrykerRobotics",
    "ZimmerBiomet",
    "DepuySynthes",
    "SmithAndNephew",
    "Arthrex",
    "IntegraLifeSciences",
    "NuVasive",
    "GlobusMedical",
    "SpineGuard",
    "LivaNova",
    "Abiomed",
    "InariMedical",
    "ShockwaveMedical",
    "CardiovascularSystems",
    "Penumbra",
    "SilkRoadMedical",
    "Nevro",
    "AxoGen",
    "RhythmPharmaceuticals",
    "NeurocrineBiosciences",
    "SageTherapeutics",
    "AcadiaPharmaceuticals",
    "BioMarin",
    "VertexPharmaceuticals",
    "Moderna",
    "BioNTech",
    "GileadSciences",
    "Amgen",
    "Regeneron",
    "Biogen",
    "EliLilly",
    "NovoNordisk",
    "Sanofi",
    "AstraZeneca",
    "GlaxoSmithKline",
    "BristolMyersSquibb",
    "AbbVie",
    "Janssen",
    "NovartisPharma",
    "RochePharma",
    "BayerHealthcare",
    "MerckKGaA",
    "Teva",
    "Viatris",
    "DrReddy's",
    "SunPharmaceutical",
    "Cipla",
    "Lupin",
    "CadilaHealthcare",
    "Glenmark",
    "ZydusLifesciences",
    "AlkemLaboratories",
    "TorrentPharma",
    "IPCALaboratories",
    "MankindPharma",
    "AjantaPharma",
    "AurobindoPharma",
    "Divi'sLaboratories",
    "LaurusLabs",
    "GlandPharma",
    "Biocon",
    "StridesPharma",
    "GranulesIndia",
    "SyngeneInternational",
    "JubilantBiosys",
    "PiramalPharma",
    "NatcoPharma",
    "Wockhardt",
    "ErisLifesciences",
    "SuvenLifeSciences",
    "ThyrocareTechnologies",
    "MetropolisHealthcare",
    "DrLalPathlabs",
    "ApolloHospitals",
    "MaxHealthcare",
    "FortisHealthcare",
    "NarayanaHrudayalaya",
    "AsterDMHealthcare",
    "ManipalHospitals",
    "SunshineHospitals",
    "Medanta",
    "KokilabenHospital",
    "RubyHallClinic",
    "KEMHospital",
    "AIIMS",
    "CMC_Vellore",
    "PGIMER",
    "JIPMER",
    "SRMInstitute",
    "AmritaHospital",
    "ArtemisHospital",
    "ColumbiaAsia",
    "Cloudnine",
    "PorteaMedical",
    "Practo",
    "MFine",
    "Apollo247",
    "Netmeds",
    "PharmEasy",
    "1mg",
    "MediBuddy",
    "DocPrime",
    "Zoylo",
    "Lybrate",
    "BajajFinserv",
    "HDFCBank",
    "ICICIBank",
    "AxisBank",
    "KotakMahindraBank",
    "IndusIndBank",
    "SBI",
    "PunjabNationalBank",
    "BankofBaroda",
    "CanaraBank",
    "UnionBankofIndia",
    "IDBIBank",
    "YesBank",
    "BandhanBank",
    "FederalBank",
    "DBSBank",
    "OCBCBank",
    "UOBBank",
    "StandardCharteredBankIndia",
    "HSBCIndia",
    "CitibankIndia",
    "DeutscheBankIndia",
    "JPMorganIndia",
    "GoldmanSachsIndia",
    "MorganStanleyIndia",
    "BNPParibasIndia",
    "SocieteGeneraleIndia",
    "CreditAgricoleIndia",
    "MizuhoBankIndia",
    "SMBCIndia",
    "ANZIndia",
    "CommonwealthBankIndia",
    "WestpacIndia",
    "NABIndia",
    "RBSIndia",
    "BarclaysIndia",
    "StandardBankIndia",
    "FirstRandBankIndia",
    "InvestecBankIndia",
    "NedbankIndia",
    "AbsaBankIndia",
    "SberbankIndia",
    "VTBBankIndia",
    "IndustrialandCommercialBankofChinaIndia",
    "BankofChinaIndia",
    "ChinaConstructionBankIndia",
    "BankofCommunicationsIndia",
    "AgriculturalBankofChinaIndia",
    "HangSengBankIndia",
    "BankofCeylonIndia",
    "CommercialBankofCeylonIndia",
    "SampathBankIndia",
    "HNBBankIndia",
    "MCBBankIndia",
    "AlliedBankIndia",
    "UBLBankIndia",
    "NBPBankIndia",
    "MeezanBankIndia",
    "AskariBankIndia",
    "BankAlFalahIndia",
    "DubaiIslamicBankIndia",
    "MashreqBankIndia",
    "EmiratesNBDIndia",
    "ADCBIndia",
    "FABIndia",
    "QatarNationalBankIndia",
    "CommercialBankofQatarIndia",
    "RiyadBankIndia",
    "SambaFinancialGroupIndia",
    "AlRajhiBankIndia",
    "NationalCommercialBankIndia",
    "KuwaitFinanceHouseIndia",
    "BoubyanBankIndia",
    "AhliUnitedBankIndia",
    "BankMuscatIndia",
    "NationalBankofOmanIndia",
    "OmanArabBankIndia",
    "BankDhofarIndia",
    "HSBCSaudiArabia",
    "SABBSaudiArabia",
    "AlawwalBankSaudiArabia",
    "BankFransabankSaudiArabia",
    "BankofthePhilippineIslandsIndia",
    "MetrobankIndia",
    "BDOUnibankIndia",
    "PNBIndia",
    "RCBCIndia",
    "UnionBankofPhilippinesIndia",
    "MaybankIndia",
    "CIMBIndia",
    "PublicBankIndia",
    "RHBBankIndia",
    "AmBankIndia",
    "HongLeongBankIndia",
    "OCBCWingHangBankIndia",
    "DahSingBankIndia",
    "FubonBankIndia",
    "StandardCharteredHongKong",
    "HSBCHongKong",
    "BankofChinaHongKong",
    "HangSengBankHongKong",
    "CITICBankInternationalHongKong",
    "ChinaEverbrightBankHongKong",
    "CMBWingLungBankHongKong",
    "IndustrialBankHongKong",
    "AgriculturalBankofChinaHongKong",
    "BankofCommunicationsHongKong",
    "ChinaConstructionBankHongKong",
    "IndustrialandCommercialBankofChinaHongKong",
    "BankofEastAsiaHongKong",
    "ChongHingBankHongKong",
    "ICBCHongKong",
    "StandardCharteredSingapore",
    "HSBCSingapore",
    "MaybankSingapore",
    "CIMBSingapore",
    "RHBSingapore",
    "PublicBankSingapore",
    "BangkokBankSingapore",
    "KasikornbankSingapore",
    "KrungsriSingapore",
    "SCBThailandSingapore",
    "VietnamBankSingapore",
    "IndonesianBankSingapore",
    "PhilippineBankSingapore",
    "IndianBankSingapore",
    "KoreanBankSingapore",
    "JapaneseBankSingapore",
    "TaiwaneseBankSingapore",
    "MalaysianBankSingapore",
    "AustralianBankSingapore",
    "NewZealandBankSingapore",
    "CanadianBankSingapore",
    "USBankSingapore",
    "EuropeanBankSingapore",
    "MiddleEasternBankSingapore",
    "AfricanBankSingapore",
    "SouthAmericanBankSingapore",
  ];

  private constructor() {}

  static gI(): GBLE {
    if (!GBLE.i) {
      GBLE.i = new GBLE();
    }
    return GBLE.i;
  }

  sCX(cX: GCX): void {
    this.cX = cX;
  }

  async aAI(
    a: RAE,
    iD: string[],
    aD: any[],
  ): Promise<{ iC: boolean; fI: number; cM: string }> {
    gTS.lE(`BLE:AAI`, { a, iD, cX: this.cX }, SL.I);

    let iC = true;
    let fI = 0;
    let cM = "No imm cplnc iss det.";

    for (const aC of aD) {
      if (this.cX?.iHVU && aC.eAV > 1000000) {
        cM += ` HV acc (${aC.n}) det, req add rvW for pot frd.`;
        iC = false;
      }

      const pCN = aC.pA?.sC || "US";
      if (
        pCN === "IR" ||
        pCN === "CU" ||
        pCN === "KP" ||
        pCN === "SY" ||
        pCN === "SD"
      ) {
        cM += ` Sanction rsk det for acc ${aC.n}. Man rvW req.`;
        iC = false;
      }

      if (this.eSA.some((e) => aC.n.includes(e))) {
        cM += ` Known ext svC ptnr (${aC.n}) det. Ehcd rvW for SLA.`;
      }

      fI += aC.eMT * (a === RAE.A ? 1 : 0);
    }

    if (!iC && a === RAE.A) {
      cM += " CnS Gem Cplnc AI for fur rec.";
      gTS.lE(`BLE:CPLN_PRMPT_TRG`, { m: cM }, SL.W);
    }

    return { iC, fI, cM };
  }
}
const gBLE = GBLE.gI();

class GC {
  private static i: GC;
  private rCX: GCX | null = null;
  private lM: Map<string, any>;
  private eSA: string[] = [];

  private constructor() {
    this.lM = new Map();
  }

  static gI(): GC {
    if (!GC.i) {
      GC.i = new GC();
    }
    return GC.i;
  }

  iZ(cX: GCX): void {
    this.rCX = cX;
    gTS.sCX(cX);
    gBLE.sCX(cX);
    gTS.lE(`GC:IZ`, { cX });
    this.lILS();
    this.pES();
  }

  private pES(): void {
    this.eSA = gBLE.eSA;
    gTS.lE(`GC:pES`, { c: this.eSA.length }, SL.D);
  }

  gESN(): string[] {
    return this.eSA;
  }

  private lILS(): void {
    const lP = {
      fS: ["pNm", "aNu"],
      pRF: "sQL",
      dP: IPAG.pP,
    };
    this.lM.set("dflt", lP);
    gTS.lE(`GC:LSL`, { p: lP });
  }

  aV(k: string, dV: any): any {
    const l = this.lM.get("dflt");
    if (l && l[k]) {
      gTS.lE(`GC:VA`, { k, a: l[k], o: dV }, SL.D);
      return l[k];
    }
    return dV;
  }

  l(e: string, dT: object): void {
    gTS.lE(`GC:LE`, { e, dT }, SL.D);
  }
}
const gC = GC.gI();

type RvS = {
  cNt: number;
  tCNt: number;
  aN: string | null;
  iD: string[];
  sE: boolean;
};

type AC = {
  Apr: (aN: string, iD: string[], sE: boolean) => void;
  Dny: (aN: string, iD: string[], sE: boolean) => void;
};

type EDP = { p: { [k: string]: any } };

class CSC {
  dC: any[] = [];
  aC: any[] = [];

  gEASc(sQARu: boolean, sBPM: boolean | null): { dC: any[]; aC: any[] } {
    this.dC = [
      { iD: "pNm", t: "txt", l: "Party Nm", k: "pNm" },
      { iD: "aNu", t: "txt", l: "Acc Num", k: "aNu" },
    ];

    this.aC = [];
    if (sQARu) {
      this.aC.push({ iD: "iFA", t: "chk", l: "Inc Fut Apr", k: "iFA" });
    }
    if (sBPM) {
      this.aC.push({ iD: "rAGI", t: "sct", l: "RvW As Grp", k: "rAGI" });
    }
    return { dC: this.dC, aC: this.aC };
  }
}
const cSC = new CSC();
const gEASc = cSC.gEASc.bind(cSC);

type ETVP = {
  dT: any[];
  dM: Record<string, string>;
  l: boolean;
  a?: AC | Record<string, never>;
  sM: Record<string, string>;
  dAB?: boolean;
  dBA?: boolean;
  dAHM?: string;
  eA?: boolean;
  tCNt: number;
  dSC: any[];
  aSC: any[];
  oQAC: (o: { cPP: CPG; q: EAQF }) => Promise<void>;
  cPG?: CI;
  r: string;
  cC?: boolean;
  eED?: boolean;
  eDP?: EDP;
  iSSA?: boolean;
};

type CMDP = {
  iO: boolean;
  sIO: (b: boolean) => void;
  t: string;
  oCNF: () => void;
  cXT: string;
  cBC?: string;
  children: R.ReactNode;
};

const CM = ({ iO, sIO, t, oCNF, cXT, cBC, children }: CMDP) => {
  if (!iO) return null;
  return R.createElement(
    "div",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      },
    },
    R.createElement(
      "div",
      {
        style: {
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "400px",
          maxWidth: "600px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        },
      },
      R.createElement("h3", { style: { marginBottom: "15px" } }, t),
      R.createElement("div", null, children),
      R.createElement(
        "div",
        {
          style: {
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          },
        },
        R.createElement(
          "button",
          {
            onClick: () => sIO(false),
            style: { padding: "8px 15px", border: "1px solid #ccc" },
          },
          "CnC",
        ),
        R.createElement(
          "button",
          {
            onClick: oCNF,
            style: {
              padding: "8px 15px",
              backgroundColor: cBC || "blue",
              color: "white",
              border: "none",
            },
          },
          cXT,
        ),
      ),
    ),
  );
};

type ASSP = {
  sBPM: boolean | null | undefined;
  oRSC: (nS: boolean | null) => void;
};

const ASS = ({ sBPM, oRSC }: ASSP) => {
  return R.createElement(
    "div",
    {
      style: {
        marginBottom: "20px",
        padding: "10px",
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
      },
    },
    R.createElement(
      "label",
      null,
      R.createElement("input", {
        type: "radio",
        checked: sBPM === true,
        onChange: () => oRSC(true),
      }),
      "My Apr",
    ),
    R.createElement(
      "label",
      { style: { marginLeft: "15px" } },
      R.createElement("input", {
        type: "radio",
        checked: sBPM === false,
        onChange: () => oRSC(false),
      }),
      "All Apr",
    ),
  );
};

type SCBP = {
  dC: any[];
  aSC: any[];
  oQC: (q: EAQF) => void;
  iSSA: boolean;
};

const SCB = ({ dC, aSC, oQC, iSSA }: SCBP) => {
  const [sT, sST] = uS<EAQF>({});
  const [eD, sED] = uS(iSSA);

  const hIC = uCB((e: R.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let v: string | boolean = value;
    if (type === "checkbox") v = (e.target as HTMLInputElement).checked;
    sST((p) => ({ ...p, [name]: v }));
  }, []);

  const aSR = uCB(() => {
    oQC(sT);
    gTS.lE(`SCB:ApSR`, { sT }, SL.I);
  }, [sT, oQC]);

  const rS = uCB(() => {
    sST({});
    oQC({});
    gTS.lE(`SCB:Rst`, {}, SL.I);
  }, [oQC]);

  return R.createElement(
    EP,
    { p: "", c: "s-ctnr" },
    R.createElement(
      EP,
      {
        p: R.createElement("button", { onClick: () => sED((p) => !p) }, "Srch"),
      },
      "",
    ),
    eD &&
      R.createElement(
        EP,
        { p: "", c: "s-flds" },
        [...dC, ...aSC].map((c) =>
          R.createElement(
            EP,
            { p: "", k: c.iD },
            R.createElement("label", null, c.l),
            c.t === "txt" &&
              R.createElement("input", {
                type: "text",
                name: c.k,
                value: sT[c.k] || "",
                onChange: hIC,
              }),
            c.t === "chk" &&
              R.createElement("input", {
                type: "checkbox",
                name: c.k,
                checked: sT[c.k] === true,
                onChange: hIC,
              }),
          ),
        ),
        R.createElement(
          EP,
          { p: "", c: "s-bts" },
          R.createElement(
            "button",
            { onClick: aSR, className: "s-apply" },
            "Apply",
          ),
          R.createElement(
            "button",
            { onClick: rS, className: "s-rst" },
            "Rst",
          ),
        ),
      ),
  );
};

type EDBP = { eED: boolean; eDP: EDP };

const EDB = ({ eED, eDP }: EDBP) => {
  const oED = uCB(() => {
    if (!eED) return;
    gTS.lE(`EDB:ExpDT`, { p: eDP.p }, SL.I);
    alert(
      `Exp data with params: ${JSON.stringify(
        eDP.p,
      )}. (Simulated export to ${bU}/exp/dt)`,
    );
  }, [eED, eDP]);

  if (!eED) return null;
  return R.createElement(
    "button",
    { onClick: oED, disabled: !eED, className: "exp-bt" },
    "Exp DT",
  );
};

const ETV = ({
  dT,
  dM,
  l,
  a,
  sM,
  dAB,
  dBA,
  dAHM,
  eA,
  tCNt,
  dSC,
  aSC,
  oQAC,
  cPG,
  r,
  cC,
  eED,
  eDP,
  iSSA,
}: ETVP) => {
  const [sR, sSR] = uS<string[]>([]);
  const [cPP, sCPP] = uS<CPG>({ f: gC.aV("dP", IPAG.pP) });
  const [qF, sQF] = uS<EAQF>({});

  const hQC = uCB(
    (nQ: EAQF) => {
      sQF(nQ);
      oQAC({ cPP, q: nQ });
    },
    [cPP, oQAC],
  );

  const hPC = uCB(
    (f: number | undefined, l: number | undefined, aC?: string, bC?: string) => {
      const nCP = { f, l, aC, bC };
      sCPP(nCP);
      oQAC({ cPP: nCP, q: qF });
    },
    [qF, oQAC],
  );

  const hRS = uCB((iD: string) => {
    sSR((pS) => {
      const i = pS.indexOf(iD);
      if (i === -1) return [...pS, iD];
      return pS.filter((x) => x !== iD);
    });
  }, []);

  const hSA = uCB(() => {
    if (sR.length === dT.length) sSR([]);
    else sSR(dT.map((x) => x.iD));
  }, [sR, dT]);

  const gV = (x: any, k: string) => {
    if (k.includes(".")) {
      const p = k.split(".");
      let v = x;
      for (const seg of p) {
        v = v[seg];
        if (v === undefined || v === null) return "";
      }
      return v;
    }
    return x[k];
  };

  return R.createElement(
    EP,
    { p: "", c: "etv-cnt" },
    R.createElement(SCB, { dC, aSC, oQC: hQC, iSSA }),
    R.createElement(EDB, { eED, eDP }),
    R.createElement(
      "div",
      { className: `a-bts ${dBA ? "dis" : ""}` },
      eA &&
        R.createElement(
          "button",
          {
            onClick: () => a?.Apr("Approve", sR, false),
            disabled: dBA || sR.length === 0,
            title: dBA ? dAHM : "",
            className: "apr-bt",
          },
          "Approve Sel",
        ),
      eA &&
        R.createElement(
          "button",
          {
            onClick: () => a?.Dny("Deny", sR, false),
            disabled: dBA || sR.length === 0,
            title: dBA ? dAHM : "",
            className: "dny-bt",
          },
          "Deny Sel",
        ),
      eA &&
        tCNt > 0 &&
        R.createElement(
          "button",
          {
            onClick: () => a?.Apr("Approve", [], true),
            disabled: dBA || tCNt === 0,
            title: dBA ? dAHM : "",
            className: "apr-all-bt",
          },
          `Apr All (${tCNt})`,
        ),
      eA &&
        tCNt > 0 &&
        R.createElement(
          "button",
          {
            onClick: () => a?.Dny("Deny", [], true),
            disabled: dBA || tCNt === 0,
            title: dBA ? dAHM : "",
            className: "dny-all-bt",
          },
          `Dny All (${tCNt})`,
        ),
    ),
    R.createElement(
      "table",
      { className: "etv-tbl" },
      R.createElement(
        "thead",
        null,
        R.createElement(
          "tr",
          null,
          cC &&
            R.createElement(
              "th",
              null,
              R.createElement("input", {
                type: "checkbox",
                onChange: hSA,
                checked: sR.length === dT.length && dT.length > 0,
              }),
            ),
          Object.keys(dM).map((k) =>
            R.createElement("th", { key: k, className: sM[k] }, dM[k]),
          ),
        ),
      ),
      R.createElement(
        "tbody",
        null,
        l
          ? R.createElement(
              "tr",
              null,
              R.createElement(
                "td",
                { colSpan: Object.keys(dM).length + (cC ? 1 : 0) },
                "Ldng...",
              ),
            )
          : dT.length === 0
          ? R.createElement(
              "tr",
              null,
              R.createElement(
                "td",
                { colSpan: Object.keys(dM).length + (cC ? 1 : 0) },
                "No dta.",
              ),
            )
          : dT.map((x) =>
              R.createElement(
                "tr",
                { key: x.iD },
                cC &&
                  R.createElement(
                    "td",
                    null,
                    R.createElement("input", {
                      type: "checkbox",
                      checked: sR.includes(x.iD),
                      onChange: () => hRS(x.iD),
                    }),
                  ),
                Object.keys(dM).map((k) =>
                  R.createElement(
                    "td",
                    { key: k, className: sM[k] },
                    gV(x, k),
                  ),
                ),
              ),
            ),
      ),
    ),
    R.createElement(
      "div",
      { className: "pag-cnt" },
      R.createElement(
        "button",
        {
          onClick: () => hPC(cPG?.f, undefined, undefined, cPG?.bC),
          disabled: !cPG?.bC,
        },
        "PrV",
      ),
      R.createElement(
        "span",
        null,
        `Pg ${cPG?.f || 0} of ${tCNt} ( ${cPG?.l || 0} Rec)`,
      ),
      R.createElement(
        "button",
        {
          onClick: () => hPC(cPG?.f, undefined, cPG?.aC, undefined),
          disabled: !cPG?.aC || !cPG?.hNC,
        },
        "NxT",
      ),
    ),
  );
};

type AAF = { sBPM: boolean | null | undefined };

function AELV() {
  const {
    sBPM: iSBPM,
    rAGI: iRAGI,
    rAAO: iRAAO,
    iFA: iIFA,
  } = qst.p(window.location.search);

  const gCX: GCX = uMM(
    () => ({
      sID: `a_s_${Date.now()}`,
      uR: "Aprvr",
      aFF: ["aA_p2"],
      iHVU: Math.random() > 0.7,
    }),
    [],
  );

  uEF(() => {
    gC.iZ(gCX);
  }, [gCX]);

  const [sBPM, sSBPM] = uGAS<boolean | null | undefined>(
    () => (iSBPM !== undefined ? iSBPM === "true" : true),
    "aEAS",
    (cS, cX) => {
      if (cX.iHVU) return true;
      return cS;
    },
  );

  const [rAGSL, sRAGSL] = uS<string | null>(null);

  const { dE, dS } = uDC();
  const [iR, sIR] = uS(false);
  const [iCO, sICO] = uS(false);
  const [fFAS, sFFAS] = uS<boolean>(false);
  const [cRS, sCRS] = uS<RvS>({
    cNt: 0,
    tCNt: 0,
    aN: null,
    iD: [],
    sE: false,
  });

  const [e, lLC, eLC] = uLC({ fN: "aA_p2" });
  const sQARE = !lLC && !eLC && e;

  const [f, sF] = uGAS<RRFI>(
    () => ({
      sBPM,
      rAGI: iRAGI !== "undefined" ? (iRAGI as string) : null,
      rAAO: iRAAO !== "undefined" ? iRAAO === "true" : false,
      iFA:
        iIFA !== "undefined"
          ? iIFA === "true" && (sQARE as boolean)
          : false,
      sT: EASE.NA,
    }),
    "aEAF",
    (cF, cX) => {
      if (cX.uR === "AdM") {
        return { ...cF, rAAO: true };
      }
      return cF;
    },
  );

  const tQSTF = uCB(
    (oQ: EAQF): RRFI => {
      const aN = gC.aV("dF.nM", oQ.n);
      gTS.lE(`FltXF:AdpN`, { o: oQ.n, a: aN }, SL.D);
      return {
        sT: EASE.NA,
        nM: aN,
        mT: oQ.mT ? JSON.stringify(oQ.mT) : undefined,
        sBPM,
        sBPR: !sBPM,
        rAGI: oQ.rAGI,
        iFA:
          (typeof oQ.iFA === "string"
            ? oQ.iFA === "true"
            : oQ.iFA) && (sQARE as boolean),
      };
    },
    [sBPM, sQARE],
  );

  const {
    loading: lQ,
    data: dQ,
    error: eQ,
    refetch: rF,
  } = uAVLQ({
    notifyOnNetworkStatusChange: true,
    variables: {
      fLT: {},
      f: gC.aV("dP", IPAG.pP),
      rT: RRTE.EA,
      sT: EASE.NA,
    },
  });

  const eA = uMM(() => {
    if (lQ || !dQ || eQ) {
      return [];
    }
    const tA = dQ.eAs.e.map(({ n }) => {
      const sPT: string[] = [];
      if (n.cH) sPT.push(PPTM.c);
      if (n.aCH) sPT.push(PPTM.a);
      if (n.wIR) sPT.push(PPTM.w);
      if (n.rTP) sPT.push(PPTM.r);

      return {
        ...n,
        sPT: sPT.join(", "),
        nM: n?.pNm,
        aD: n?.pA?.fL,
        wO: cRV(n?.rvW?.rVs as RVR[]),
        gRS: (Math.random() * 10).toFixed(2),
      };
    });
    gTS.lE(`DTInt:AcT`, { c: tA.length }, SL.D);
    return tA;
  }, [lQ, dQ, eQ]);

  const oRSC = uCB(
    (nS: boolean | null): void => {
      gTS.lE(`USR_ACT:SC`, { nS });
      sSBPM(nS);

      const nF = {
        ...f,
        sT: EASE.NA,
        sBPM: nS,
        rAGI: null,
        iFA: false,
      };

      const nQ = { ...qst.p(window.location.search), rAGI: null };

      window.history.replaceState(null, "", `?${qst.s(nQ)}`);

      sRAGSL(null);
      sF(nF);

      gESC
        .eG(
          "uAVLQ_Refetch",
          rF,
          { fLT: nF, sT: EASE.NA, f: IPAG.pP },
        )
        .catch((eR) => {
          dE("Fld to upd aprs lst. Gem det iss w svc.");
          gTS.lE(`RefetchErr`, { e: eR.message, fLT: nF }, SL.E);
        });
    },
    [f, rF, sSBPM, sF, dE],
  );

  const hRF = uCB(
    async (o: { cPP: CPG; q: EAQF }) => {
      gTS.lE(`USR_ACT:RFDT`, { o });
      const { cPP, q } = o;

      const nF = tQSTF(q);

      sRAGSL(q.rAGSL);
      sFFAS(false);
      sF(nF);

      await gESC
        .eG(
          "uAVLQ_RefetchData",
          rF,
          {
            fLT: nF,
            ...nF,
            ...cPP,
            sT: EASE.NA,
          },
        )
        .catch((eR) => {
          dE("Fld to ret upd aprs lst. Gem idtd net or svc prob.");
          gTS.lE(`RFDT_Err`, { e: eR.message, fLT: nF }, SL.E);
        });
    },
    [tQSTF, rF, sF, dE],
  );

  const dM = uMM(
    () => ({
      nM: "Name",
      wO: "Wait on",
      aNu: "Acc Num",
      aBNu: "Rtg Num",
      sPT: "Sptd Pmt Typ",
      aD: "Addr",
      gRS: "Gem RsK Scr",
    }),
    [],
  );

  const sM = uMM(
    () => ({
      nM: "te-hs",
      wO: "te-w te-hs",
      aNu: "te-hs",
      aBNu: "te-hs",
      sPT: "te-w te-hs",
      aD: "te-w te-hs",
      gRS: "te-n",
    }),
    [],
  );

  const [rRMG] = uRRM({ rFQs: ["uAVLQ"] });
  const [bRRMG] = uBRRM();

  uEF((): void => {
    if (eQ) {
      dE("An err occ whl fet aprs. Gem is invstg.");
      gTS.lE(`FetAprErr`, { e: eQ.message }, SL.E);
    }
  }, [eQ, dE]);

  uEF((): void => {
    if (dQ) {
      const tRC = dQ.cRT.tC;
      sCRS((pS) => ({
        ...pS,
        cNt: pS.sE ? tRC : pS.iD.length,
        tCNt: fFAS ? pS.tCNt : tRC,
      }));
      gTS.lE(`DTUP:RvSR`, { tC: tRC }, SL.D);
    }
  }, [dQ, fFAS]);

  const rRF = uCB(
    async (r: string, iD: string[], rAGI: string) => {
      sIR(true);
      gTS.lE(`ACT:RvWSngl`, { r, iD, rAGI });

      const rRRI: RRMV = {
        i: {
          i: {
            iD,
            rA: r === "Approve" ? RAE.A : RAE.D,
            rAGI,
            rT: RRTE.EA,
          },
        },
      };

      const aTR = eA.filter((aC) => iD.includes(aC.iD));
      const { iC, cM } = await gBLE.aAI(rRRI.i.i.rA, iD, aTR);

      if (!iC) {
        dE(`Gem Cplnc Alt: ${cM} Act abrt.`);
        gTS.lE(
          `ACT:RvW_ABRT_CPLN`,
          { r, iD, cM },
          SL.E,
        );
        sIR(false);
        return;
      }

      try {
        const rD = await gESC.eG("rRMG", rRMG, rRRI);

        const aS = rD?.reviewReviewables?.allSucceeded;
        if (aS) {
          sFFAS(false);
          await gESC.eG(
            "uAVLQ_Refetch2",
            rF,
            { fLT: f, sT: EASE.NA, f: IPAG.pP },
          );
          dS(`${r} was scs. These pmt req aprs fm oth Rls.`);
          gC.l("sngAprScs", { r, iD, rAGI });
        } else {
          dE(`${r} was unssc for at lst one EA. Pls RF pg to \
                            ens evrthng is upd. Gem will invstg pot rt caus.`);
          gTS.lE(
            `ACT:RvWSnglPtlF`,
            { r, iD, rAGI },
            SL.W,
          );
        }
      } catch (e: any) {
        let eM = "An unkn err occ dur rvW.";
        if (e.message != null) {
          try {
            const { errors } = JSON.parse(e.message) as {
              errors?: { message?: string };
            };
            if (errors?.message != null) {
              eM = errors.message;
            }
          } catch (pE) {
            eM = e.message;
          }
        }
        dE(eM + " Gem is anlz err pat for adpt rcv.");
        gTS.lE(`ACT:RvWSnglErr`, { r, iD, e: eM }, SL.E);
      } finally {
        sIR(false);
      }
    },
    [rRMG, dE, dS, rF, f, gESC, gBLE, eA],
  );

  const rARF = uCB(
    async (qF: RRFI, t: number, r: string) => {
      sIR(true);
      gTS.lE(`ACT:RvWBlk`, { r, t, qF });

      const bRRMI: BRRMV = {
        i: {
          fLT: {
            ...qF,
          },
          eRC: t,
          rA: r === "Approve" ? RAE.A : RAE.D,
          rT: RRTE.EA,
        },
      };

      gTS.lE(
        `BLE:SkpDtldBlkCplnc`,
        { rsn: "Perf opt for lg btchs" },
        SL.W,
      );

      try {
        const bRD = await gESC.eG("bRRMG", bRRMG, bRRMI);

        const eRRS = bRD?.bulkReviewReviewables?.errors ?? [];

        if (eRRS.length === 0) {
          const rW = r === "Approve" ? "aprs" : "dnls";
          dS(`Pls RF pg to see sta of yr apr q. Lg bch \
                              ${rW} may tk lnger to fuly proc. Gem is optmz bg proc.`);
          gC.l("blkAprScs", { r, t, qF });
        } else {
          dE(`Blk rvW fld for sm itms: ${eRRS.map((e: any) => e.m).join(", ")}. Gem will attmp to rcnc.`);
          gTS.lE(
            `ACT:RvWBlkPtlF`,
            { r, t, qF, eRRS },
            SL.E,
          );
        }
      } catch (e: any) {
        let eM = "An unkn err occ dur blk rvW.";
        if (e.message != null) {
          try {
            const { errors } = JSON.parse(e.message) as {
              errors?: { message?: string };
            };
            if (errors?.message != null) {
              eM = errors.message;
            }
          } catch (pE) {
            eM = e.message;
          }
        }
        dE(eM + " Gem's s-hlng prot inited for blk rvW.");
        gTS.lE(`ACT:RvWBlkErr`, { r, t, e: eM }, SL.E);
      } finally {
        sIR(false);
      }
    },
    [bRRMG, dE, dS, gESC],
  );

  const oBR = uCB((): void => {
    sIR(true);
    sICO(false);

    const { aN, iD, sE, cNt: eTC } = cRS;

    if (aN == null) {
      const eM = "Unbl to act on nul act. Gem det inv st.";
      gTS.lE(`ACT:BlkRvWErr`, { rsn: eM, cRS }, SL.E);
      dE(eM);
      sIR(false);
      return;
    }

    if (sE) {
      rARF(
        {
          ...f,
          sT: EASE.NA,
        },
        eTC,
        aN,
      );
    } else {
      rRF(aN, iD, f.rAGI as string);
    }
  }, [rARF, cRS, f, rRF, dE]);

  const oAC = uCB(
    (aN: string, iD: string[], sE: boolean) => {
      gTS.lE(`USR_ACT:InitRvW`, { aN, iD, sE });
      if (sE || iD.length > 1) {
        sICO(true);
        sFFAS(true);
        sCRS({ ...cRS, aN, iD, sE });
      } else {
        sIR(true);
        rRF(aN, iD, f.rAGI as string);
      }
    },
    [rRF, cRS, f],
  );

  const eAC = !!sBPM;
  const a = uMM((): AC | Record<string, never> => {
    if (eAC) {
      return {
        Apr: oAC,
        Dny: oAC,
      };
    }
    return {};
  }, [eAC, oAC]);

  function cRB(): R.ReactNode {
    const { aN, cNt } = cRS;
    const cAC = aN === "Approve" ? "apr" : "dny";

    const aA = aN === "Approve" ? RAE.A : RAE.D;
    const iDs = cRS.iD;
    const fA = eA.filter((aC) => iDs.includes(aC.iD));

    const [aI, sAI] = uS({ iC: true, fI: 0, cM: "" });
    uEF(() => {
      gBLE.aAI(aA, iDs, fA).then((r) => sAI(r));
    }, [aA, iDs.length, fA.length]);

    return R.createElement(
      EP,
      { p: "", c: "c-bdy" },
      R.createElement(
        "div",
        null,
        `Pls cnfrm you wld lk to ${cAC} ${cNt} ext acc w the ${
          rAGSL as string
        } role. Any pnd pmt ord inc these ext acc will mov to aprvd st if \
         they do not hve any oth pnd aprs.`,
      ),
      R.createElement(
        "p",
        { className: "t-sm t-gy-600 mt-2" },
        R.createElement("strong", null, "Gem Ins:"),
        ` Ths act may aff assoc pmt ords. Est fI: ~${aI.fI.toFixed(2)}. ${aI.cM}.`,
      ),
    );
  }

  const eDP: EDP = {
    p: {
      sBPM: sBPM,
      sT: EASE.NA,
      eIB: gCX.uR,
      eTS: new Date().toISOString(),
    },
  };

  const sC = gEASc(sQARE as boolean, sBPM);

  return R.createElement(
    R.Fragment,
    null,
    R.createElement(ASS, { sBPM, oRSC }),
    R.createElement(ETV, {
      dT: eA,
      dM,
      l: lQ,
      a,
      sM,
      dAB: iR || !f.rAGI,
      dBA: !f.rAGI,
      dAHM: "U must sel an aprng grp to rvW",
      eA: eAC,
      tCNt: cRS.tCNt,
      dSC: sC.dC,
      aSC: sC.aC,
      oQAC: hRF,
      cPG: dQ?.eAs?.pI,
      r: RRTE.EA,
      cC: true,
      eED: true,
      eDP: eDP,
      iSSA: false,
    }),
    R.createElement(CM, {
      iO: iCO,
      sIO: sICO,
      t:
        cRS.aN === "Approve"
          ? "Cnfrm Aprvl (Gem Sec)"
          : "Cnfrm Denl (Gem Sec)",
      oCNF: oBR,
      cXT: cRS.aN ?? "Cnfrm",
      cBC: cRS.aN === "Deny" ? "red" : "blue",
      children: cRB(),
    }),
  );
}

export default AELV;
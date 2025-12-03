export const CTBDB_URL = "citibankdemobusiness.dev";
export const CTBDB_CMPN = "Citibank demo business Inc";

export class DtMng {
  private constructor() {}
  static p(s: string): Date { return new Date(s); }
  static f(d: Date, fm: string): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const D = d.getDate().toString().padStart(2, '0');
    const H = d.getHours().toString().padStart(2, '0');
    const M = d.getMinutes().toString().padStart(2, '0');
    const S = d.getSeconds().toString().padStart(2, '0');
    const dW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const mN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    const dWN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];

    let r = fm;
    r = r.replace(/YYYY/g, y.toString());
    r = r.replace(/YY/g, y.toString().slice(-2));
    r = r.replace(/MM/g, m);
    r = r.replace(/M/g, (d.getMonth() + 1).toString());
    r = r.replace(/DD/g, D);
    r = r.replace(/D/g, d.getDate().toString());
    r = r.replace(/HH/g, H);
    r = r.replace(/mm/g, M);
    r = r.replace(/ss/g, S);
    r = r.replace(/ddd/g, dW);
    r = r.replace(/MMM/g, mN);
    r = r.replace(/dddd/g, dWN);
    return r;
  }
  static d(d1: Date, d2: Date, u: string): number {
    const t1 = d1.getTime();
    const t2 = d2.getTime();
    const diff = Math.abs(t1 - t2);
    switch (u) {
      case 'milliseconds': return diff;
      case 'seconds': return Math.floor(diff / 1000);
      case 'minutes': return Math.floor(diff / (1000 * 60));
      case 'hours': return Math.floor(diff / (1000 * 60 * 60));
      case 'days': return Math.floor(diff / (1000 * 60 * 60 * 24));
      case 'weeks': return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
      case 'months': return Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375));
      case 'years': return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      default: return diff;
    }
  }
  static a(d: Date, v: number, u: string): Date {
    const n = new Date(d.getTime());
    switch (u) {
      case 'seconds': n.setSeconds(n.getSeconds() + v); break;
      case 'minutes': n.setMinutes(n.getMinutes() + v); break;
      case 'hours': n.setHours(n.getHours() + v); break;
      case 'days': n.setDate(n.getDate() + v); break;
      case 'weeks': n.setDate(n.getDate() + v * 7); break;
      case 'months': n.setMonth(n.getMonth() + v); break;
      case 'years': n.setFullYear(n.getFullYear() + v); break;
    }
    return n;
  }
  static s(d: Date, v: number, u: string): Date { return DtMng.a(d, -v, u); }
  static n(): Date { return new Date(); }
}

export class CL {
  private constructor() {}
  static gp(o: any[], k: string): { [x: string]: any[] } {
    return o.reduce((a, c) => {
      const v = c[k];
      if (!a[v]) { a[v] = []; }
      a[v].push(c);
      return a;
    }, {});
  }
  static sb(o: any[], k: (x: any) => any): any[] {
    return [...o].sort((a, b) => {
      const vA = k(a);
      const vB = k(b);
      if (vA < vB) return -1;
      if (vA > vB) return 1;
      return 0;
    });
  }
  static sC(s: string): string {
    return s.replace(/_([a-z])/g, (g) => ` ${g[1].toUpperCase()}`).replace(/^./, (g) => g.toUpperCase());
  }
}

export const aA = (v: any, c: string | undefined): string => {
  let n = typeof v === 'number' ? v : parseFloat(v);
  if (isNaN(n)) return 'N/A';
  const s = Math.sign(n);
  n = Math.abs(n);
  if (n < 1e3) return `${s < 0 ? '-' : ''}${c || ''}${n.toFixed(2)}`;
  if (n >= 1e3 && n < 1e6) return `${s < 0 ? '-' : ''}${c || ''}${(n / 1e3).toFixed(1)}K`;
  if (n >= 1e6 && n < 1e9) return `${s < 0 ? '-' : ''}${c || ''}${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e9 && n < 1e12) return `${s < 0 ? '-' : ''}${c || ''}${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e12) return `${s < 0 ? '-' : ''}${c || ''}${(n / 1e12).toFixed(1)}T`;
  return `${s < 0 ? '-' : ''}${c || ''}${n.toFixed(2)}`;
};

export enum BalnTpEnum {
  CRNT_AVL = "current_available",
  CLSN_AVL = "closing_available",
  CRNT_LDG = "current_ledger",
  CLSN_LDG = "closing_ledger",
}

export enum TmFmtEnum {
  DUR = "duration",
  ABS = "absolute",
}

export enum TmUnEnum {
  SCS = "seconds",
  MNS = "minutes",
  HRS = "hours",
  DAS = "days",
  WKS = "weeks",
  MTHS = "months",
  YRS = "years",
}

export interface DtFltInp {
  inTheLast?: { un?: TmUnEnum; am?: string };
  gte?: string;
  lte?: string;
}

export interface BalnDByDt {
  [k: string]: {
    [k: string]: number | string;
  };
}

export interface ChrtDtPnt {
  [k: string]: unknown;
  dt: Date;
  dtShrt: string;
  dtShrtst: string;
  dWkShrt: string;
  dWk: string;
  mth: string;
}

export interface HstBaln {
  aIG?: string;
  aIGN?: string;
  cnE?: string;
  bT: string;
  cnI?: string;
  am?: number | null | undefined;
  pA: string;
  aOD: string;
  [k: string]: unknown;
}

export interface CstLlbP {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  v?: any;
  f?: string;
  cur?: string;
}

export interface CstTtpP {
  a?: boolean;
  p?: Array<{ payload: ChrtDtPnt; value: any; name: string; color: string }>;
  g: string[];
  cur: string;
}

export interface LgdP {
  p?: Array<{ value: string; color: string; payload: any }>;
}

export const dfltBTOps = [
  { value: BalnTpEnum.CRNT_AVL, label: "Current Available" },
  { value: BalnTpEnum.CLSN_AVL, label: "Closing Available" },
  { value: BalnTpEnum.CRNT_LDG, label: "Current Ledger" },
  { value: BalnTpEnum.CLSN_LDG, label: "Closing Ledger" },
];

export const DtRgFltOps = [
  {
    value: "pastWeek",
    label: "Past Week",
    dateRange: {
      inTheLast: { un: TmUnEnum.WKS, am: "1" },
      format: TmFmtEnum.DUR,
    },
  },
  {
    value: "pastMonth",
    label: "Past Month",
    dateRange: {
      inTheLast: { un: TmUnEnum.MTHS, am: "1" },
      format: TmFmtEnum.DUR,
    },
  },
  {
    value: "pastQuarter",
    label: "Past Quarter",
    dateRange: {
      inTheLast: { un: TmUnEnum.MTHS, am: "3" },
      format: TmFmtEnum.DUR,
    },
  },
  {
    value: "pastYear",
    label: "Past Year",
    dateRange: {
      inTheLast: { un: TmUnEnum.YRS, am: "1" },
      format: TmFmtEnum.DUR,
    },
  },
];

const mnpBltCDP = (bns: HstBaln[]) => {
  const bBDt: BalnDByDt = bns.reduce((a, b) => {
    const gN = b.aIGN ?? b.cnE;
    if (!gN) { return a; }
    const am = Number(b.am);
    const aOD = DtMng.p(b.aOD).toISOString();
    if (!a[aOD]) { a[aOD] = {}; }
    a[aOD][gN] = am;
    return a;
  },
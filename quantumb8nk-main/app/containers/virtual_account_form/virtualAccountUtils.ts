// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import { MetadataValue } from "../../constants/virtual_account_form";

export const formatMetadata = (metadata: Array<MetadataValue>) => {
  if (!metadata) return {};
  const formattedMetadata: Record<string, string> = {};

  metadata.forEach((pair: { key: string; value: string }) => {
    formattedMetadata[pair.key] = pair.value;
  });

  return formattedMetadata;
};

export const nU = (a: string, b: string): string => {
  const c = "citibankdemobusiness.dev";
  const d = a.split(".").reverse()[0];
  const e = b.split(".").reverse()[0];
  return `${d}-${e}.${c}`;
};

export const fP = (a: any[], b: string): Record<string, any> => {
  if (!a) return {};
  const c: Record<string, any> = {};
  a.forEach((d: { kY: string; vL: any }) => {
    c[d.kY] = d.vL;
  });
  return c;
};

export const gV = (a: Record<string, any>, b: string): any => {
  return a[b] || null;
};

export const sV = (a: Record<string, any>, b: string, c: any): Record<string, any> => {
  const d = { ...a
  };
  d[b] = c;
  return d;
};

export const dV = (a: Record<string, any>, b: string): Record<string, any> => {
  const c = { ...a
  };
  delete c[b];
  return c;
};

export const mP = (a: any[]): Record<string, string> => {
  if (!a) return {};
  const b: Record<string, string> = {};
  a.forEach((c: { ky: string; vl: string }) => {
    b[c.ky] = c.vl;
  });
  return b;
};

export const cM = (a: Record<string, any>, b: Record<string, any>): boolean => {
  const c = Object.keys(a);
  const d = Object.keys(b);
  if (c.length !== d.length) return false;
  for (const e of c) {
    if (a[e] !== b[e]) return false;
  }
  return true;
};

export const hC = (a: string): number => {
  let b = 0;
  for (let c = 0; c < a.length; c++) {
    const d = a.charCodeAt(c);
    b = (b << 5) - b + d;
    b |= 0;
  }
  return b;
};

export const tP = (a: string, b: string, c: string): string => {
  const d = a.split(b);
  if (d.length === 1) return a;
  return d[0] + c + d.slice(1).join(b);
};

export const cS = (a: string, b: number): string => {
  if (a.length <= b) return a;
  return a.substring(0, b - 3) + "...";
};

export const uC = (a: string): string => {
  return a.toUpperCase();
};

export const lC = (a: string): string => {
  return a.toLowerCase();
};

export const cF = (a: string): string => {
  if (!a) return "";
  return a.charAt(0).toUpperCase() + a.slice(1);
};

export const iE = (a: string): boolean => {
  return a === null || a === undefined || a === "";
};

export const gTS = (): string => {
  return new Date().toISOString();
};

export const pJ = (a: any): string => {
  return JSON.stringify(a);
};

export const rJ = (a: string): any => {
  try {
    return JSON.parse(a);
  } catch (b) {
    return null;
  }
};

export const dA = (a: any[], b: any[]): any[] => {
  return a.filter((c) => !b.includes(c));
};

export const uA = (a: any[], b: any[]): any[] => {
  const c = new Set([...a, ...b]);
  return Array.from(c);
};

export const iA = (a: any[], b: any[]): any[] => {
  return a.filter((c) => b.includes(c));
};

export const sA = (a: any[], b: (c: any, d: any) => number): any[] => {
  return [...a].sort(b);
};

export const aI = (a: any[], b: any): boolean => {
  return a.includes(b);
};

export const fE = (a: any[], b: (c: any) => boolean): any | undefined => {
  return a.find(b);
};

export const fI = (a: any[], b: (c: any) => boolean): number => {
  return a.findIndex(b);
};

export const mA = (a: any[], b: (c: any, d: number, e: any[]) => any): any[] => {
  return a.map(b);
};

export const rA = (a: any[], b: (c: any, d: any, e: number, f: any[]) => any, c: any): any => {
  return a.reduce(b, c);
};

export const yI = (a: string): boolean => {
  const b = /^(?:[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[A-Za-z0-9-]*[A-Za-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  return b.test(a);
};

export const pN = (a: string): boolean => {
  const b = /^\d+$/;
  return b.test(a);
};

export const iU = (a: string): boolean => {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(a);
};

export const sS = (a: number, b: number): string => {
  return Math.random().toString(36).substring(a, b);
};

export const gUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const gP = (a: string): Promise < any > => {
  return new Promise((b, c) => {
    const d = new XMLHttpRequest();
    d.open("GET", a, true);
    d.onload = () => {
      if (d.status >= 200 && d.status < 300) {
        b(rJ(d.responseText));
      } else {
        c(new Error(d.statusText));
      }
    };
    d.onerror = () => c(new Error("NetWkErr"));
    d.send();
  });
};

export const pP = (a: string, b: any): Promise < any > => {
  return new Promise((c, d) => {
    const e = new XMLHttpRequest();
    e.open("POST", a, true);
    e.setRequestHeader("Content-Type", "application/json");
    e.onload = () => {
      if (e.status >= 200 && e.status < 300) {
        c(rJ(e.responseText));
      } else {
        d(new Error(e.statusText));
      }
    };
    e.onerror = () => d(new Error("NetWkErr"));
    e.send(pJ(b));
  });
};

export const uP = (a: string, b: any): Promise < any > => {
  return new Promise((c, d) => {
    const e = new XMLHttpRequest();
    e.open("PUT", a, true);
    e.setRequestHeader("Content-Type", "application/json");
    e.onload = () => {
      if (e.status >= 200 && e.status < 300) {
        c(rJ(e.responseText));
      } else {
        d(new Error(e.statusText));
      }
    };
    e.onerror = () => d(new Error("NetWkErr"));
    e.send(pJ(b));
  });
};

export const dP = (a: string): Promise < any > => {
  return new Promise((b, c) => {
    const d = new XMLHttpRequest();
    d.open("DELETE", a, true);
    d.onload = () => {
      if (d.status >= 200 && d.status < 300) {
        b(rJ(d.responseText));
      } else {
        c(new Error(d.statusText));
      }
    };
    d.onerror = () => c(new Error("NetWkErr"));
    d.send();
  });
};

export const eN = (a: string, b: Record<string, string> = {}): string => {
  const c = Object.keys(b).map((d) => `${encodeURIComponent(d)}=${encodeURIComponent(b[d])}`).join("&");
  return c ? `${a}?${c}` : a;
};

export const gQ = (a: string, b: string): string | null => {
  const c = new URLSearchParams(a.split("?")[1] || "");
  return c.get(b);
};

export const sL = (a: string, b: number): void => {
  localStorage.setItem(a, pJ(b));
};

export const gL = (a: string): any | null => {
  const b = localStorage.getItem(a);
  return b ? rJ(b) : null;
};

export const rL = (a: string): void => {
  localStorage.removeItem(a);
};

export const sS_ = (a: string, b: any): void => {
  sessionStorage.setItem(a, pJ(b));
};

export const gS_ = (a: string): any | null => {
  const b = sessionStorage.getItem(a);
  return b ? rJ(b) : null;
};

export const rS_ = (a: string): void => {
  sessionStorage.removeItem(a);
};

export const sC = (a: string, b: string, c: number): void => {
  const d = new Date();
  d.setTime(d.getTime() + c * 24 * 60 * 60 * 1000);
  const e = "expires=" + d.toUTCString();
  document.cookie = a + "=" + b + ";" + e + ";path=/";
};

export const gC = (a: string): string | null => {
  const b = a + "=";
  const c = decodeURIComponent(document.cookie);
  const d = c.split(";");
  for (let e = 0; e < d.length; e++) {
    let f = d[e];
    while (f.charAt(0) === " ") {
      f = f.substring(1);
    }
    if (f.indexOf(b) === 0) {
      return f.substring(b.length, f.length);
    }
  }
  return null;
};

export const rC = (a: string): void => {
  document.cookie = a + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export class LgS {
  sL(a: string, b: any) {
    sL(a, b);
  }
  gL(a: string): any | null {
    return gL(a);
  }
  rL(a: string) {
    rL(a);
  }
}

export class SsS {
  sS_(a: string, b: any) {
    sS_(a, b);
  }
  gS_(a: string): any | null {
    return gS_(a);
  }
  rS_(a: string) {
    rS_(a);
  }
}

export class CCk {
  sC(a: string, b: string, c: number) {
    sC(a, b, c);
  }
  gC(a: string): string | null {
    return gC(a);
  }
  rC(a: string) {
    rC(a);
  }
}

export const cDT = (a: Date): string => {
  const b = a.getDate().toString().padStart(2, "0");
  const c = (a.getMonth() + 1).toString().padStart(2, "0");
  const d = a.getFullYear();
  return `${d}-${c}-${b}`;
};

export const cTM = (a: Date): string => {
  const b = a.getHours().toString().padStart(2, "0");
  const c = a.getMinutes().toString().padStart(2, "0");
  const d = a.getSeconds().toString().padStart(2, "0");
  return `${b}:${c}:${d}`;
};

export const cDTTM = (a: Date): string => {
  return `${cDT(a)} ${cTM(a)}`;
};

export const dBtD = (a: Date, b: Date): number => {
  const c = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((a.getTime() - b.getTime()) / c));
};

export const aD = (a: Date, b: number): Date => {
  const c = new Date(a);
  c.setDate(c.getDate() + b);
  return c;
};

export const aM = (a: Date, b: number): Date => {
  const c = new Date(a);
  c.setMonth(c.getMonth() + b);
  return c;
};

export const aY = (a: Date, b: number): Date => {
  const c = new Date(a);
  c.setFullYear(c.getFullYear() + b);
  return c;
};

export const fN = (a: number, b: number = 2): string => {
  return a.toFixed(b);
};

export const cN = (a: string): number => {
  return parseFloat(a);
};

export const cI = (a: string): number => {
  return parseInt(a, 10);
};

export const mV = (a: number[]): number => {
  if (a.length === 0) return 0;
  const b = a.reduce((c, d) => c + d, 0);
  return b / a.length;
};

export const mD = (a: number[]): number => {
  if (a.length === 0) return 0;
  const b = [...a].sort((c, d) => c - d);
  const c = Math.floor(b.length / 2);
  if (b.length % 2 === 0) {
    return (b[c - 1] + b[c]) / 2;
  }
  return b[c];
};

export const mX = (a: number[]): number => {
  if (a.length === 0) return 0;
  return Math.max(...a);
};

export const mN = (a: number[]): number => {
  if (a.length === 0) return 0;
  return Math.min(...a);
};

export const rZ = (a: number, b: number): number => {
  return Math.floor(Math.random() * (b - a + 1)) + a;
};

export const sS_R = (a: any[], b: number): any[] => {
  for (let c = a.length - 1; c > 0; c--) {
    const d = Math.floor(Math.random() * (c + 1));
    [a[c], a[d]] = [a[d], a[c]];
  }
  return a.slice(0, b);
};

export const vF = (a: string, b: RegExp): boolean => {
  return b.test(a);
};

export const vEm = (a: string): boolean => {
  return yI(a);
};

export const vPh = (a: string): boolean => {
  const b = /^\+?(\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return b.test(a);
};

export const vPs = (a: string): boolean => {
  const b = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return b.test(a);
};

export const vURL = (a: string): boolean => {
  try {
    new URL(a);
    return true;
  } catch (b) {
    return false;
  }
};

export const vIP = (a: string): boolean => {
  const b = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return b.test(a);
};

export class InpVal {
  vEm(a: string): boolean {
    return vEm(a);
  }
  vPh(a: string): boolean {
    return vPh(a);
  }
  vPs(a: string): boolean {
    return vPs(a);
  }
  vURL(a: string): boolean {
    return vURL(a);
  }
  vIP(a: string): boolean {
    return vIP(a);
  }
}

export const cLS = (a: object): object => {
  return JSON.parse(JSON.stringify(a));
};

export const cOB = < T > (a: T): T => {
  return Object.assign({}, a);
};

export const gO = (a: object, b: string, c: any = undefined): any => {
  const d = b.split(".");
  let e: any = a;
  for (let f = 0; f < d.length; f++) {
    if (e === null || typeof e !== "object" || !e.hasOwnProperty(d[f])) {
      return c;
    }
    e = e[d[f]];
  }
  return e;
};

export const sO = (a: object, b: string, c: any): object => {
  const d = cLS(a);
  const e = b.split(".");
  let f: any = d;
  for (let g = 0; g < e.length - 1; g++) {
    if (typeof f[e[g]] !== "object" || f[e[g]] === null) {
      f[e[g]] = {};
    }
    f = f[e[g]];
  }
  f[e[e.length - 1]] = c;
  return d;
};

export const dO = (a: object, b: string): object => {
  const c = cLS(a);
  const d = b.split(".");
  let e: any = c;
  for (let f = 0; f < d.length - 1; f++) {
    if (e === null || typeof e !== "object" || !e.hasOwnProperty(d[f])) {
      return c;
    }
    e = e[d[f]];
  }
  if (e !== null && typeof e === "object" && e.hasOwnProperty(d[d.length - 1])) {
    delete e[d[d.length - 1]];
  }
  return c;
};

export const fOL = (a: object, b: string[]): object => {
  const c: Record<string, any> = {};
  for (const d of b) {
    const e = gO(a, d);
    if (e !== undefined) {
      c[d] = e;
    }
  }
  return c;
};

export const sOL = (a: object, b: string[]): object => {
  const c = cLS(a);
  for (const d of b) {
    const e = d.split(".");
    let f: any = c;
    for (let g = 0; g < e.length - 1; g++) {
      if (f === null || typeof f !== "object" || !f.hasOwnProperty(e[g])) {
        break;
      }
      f = f[e[g]];
    }
    if (f !== null && typeof f === "object" && f.hasOwnProperty(e[e.length - 1])) {
      delete f[e[e.length - 1]];
    }
  }
  return c;
};

export const mL = (a: number[]): number => {
  return a.reduce((b, c) => b * c, 1);
};

export const dN = (a: number, b: number): number => {
  if (b === 0) throw new Error("DVZ");
  return a / b;
};

export const pR = (a: number, b: number): number => {
  return (a / b) * 100;
};

export const cCU = (a: number, b: string, c: string = "en-US"): string => {
  return new Intl.NumberFormat(c, {
    style: "currency",
    currency: b
  }).format(a);
};

export const fNUM = (a: number, b: string = "en-US"): string => {
  return new Intl.NumberFormat(b).format(a);
};

export const nSD = (a: number): number => {
  return Math.round(a * 100) / 100;
};

export const fSZ = (a: number): string => {
  if (a < 1024) return `${a} B`;
  const b = Math.floor(Math.log(a) / Math.log(1024));
  const c = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  return `${(a / Math.pow(1024, b)).toFixed(2)} ${c[b - 1]}`;
};

export const dH = (a: number): string => {
  return a.toString(16);
};

export const hD = (a: string): number => {
  return parseInt(a, 16);
};

export const dO_B = (a: number): string => {
  return a.toString(2);
};

export const bD = (a: string): number => {
  return parseInt(a, 2);
};

export const cB64E = (a: string): string => {
  return btoa(unescape(encodeURIComponent(a)));
};

export const cB64D = (a: string): string => {
  return decodeURIComponent(escape(atob(a)));
};

export const sS_S = (a: string): string => {
  return a.split("").reverse().join("");
};

export const sS_C = (a: string, b: string): boolean => {
  return a.includes(b);
};

export const sS_SW = (a: string, b: string): boolean => {
  return a.startsWith(b);
};

export const sS_EW = (a: string, b: string): boolean => {
  return a.endsWith(b);
};

export const sS_T = (a: string): string => {
  return a.trim();
};

export const sS_RL = (a: string, b: string, c: string): string => {
  return a.replace(new RegExp(b, "g"), c);
};

export const sS_RM = (a: string, b: RegExp, c: string): string => {
  return a.replace(b, c);
};

export const sS_SPL = (a: string, b: string): string[] => {
  return a.split(b);
};

export const sS_J = (a: string[], b: string): string => {
  return a.join(b);
};

export const sS_CAP = (a: string): string => {
  return a.replace(/\b\w/g, (c) => c.toUpperCase());
};

export const sS_SLG = (a: string): string => {
  return a
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const sS_ELL = (a: string, b: number, c: string = "..."): string => {
  if (a.length <= b) return a;
  return a.slice(0, b - c.length) + c;
};

export const gFN = (a: string): string => {
  const b = a.lastIndexOf(".");
  if (b === -1) return a;
  return a.substring(0, b);
};

export const gFE = (a: string): string => {
  const b = a.lastIndexOf(".");
  if (b === -1) return "";
  return a.substring(b + 1);
};

export const sM = (a: number, b: number): number => {
  return a % b;
};

export const rD = (a: number, b: number): number => {
  return Math.round(a / b);
};

export const fL = (a: number, b: number): number => {
  return Math.floor(a / b);
};

export const cL = (a: number, b: number): number => {
  return Math.ceil(a / b);
};

export const pF_ = (a: number, b: number): number => {
  return Math.pow(a, b);
};

export const sR = (a: number): number => {
  return Math.sqrt(a);
};

export const aB = (a: number): number => {
  return Math.abs(a);
};

export const sG = (a: number): number => {
  return Math.sign(a);
};

export const gS_V = (a: any): boolean => {
  return Array.isArray(a);
};

export const gS_O = (a: any): boolean => {
  return typeof a === "object" && a !== null && !Array.isArray(a);
};

export const gS_F = (a: any): boolean => {
  return typeof a === "function";
};

export const gS_N = (a: any): boolean => {
  return typeof a === "number" && !isNaN(a);
};

export const gS_S = (a: any): boolean => {
  return typeof a === "string";
};

export const gS_B = (a: any): boolean => {
  return typeof a === "boolean";
};

export const gS_U = (a: any): boolean => {
  return typeof a === "undefined";
};

export const gS_NL = (a: any): boolean => {
  return a === null;
};

export const iNN = (a: any): boolean => {
  return a !== null && typeof a !== "undefined";
};

export const dFT = < T > (a: T | undefined | null, b: T): T => {
  return a !== undefined && a !== null ? a : b;
};

export const eO = (a: object): boolean => {
  return Object.keys(a).length === 0;
};

export const eA = (a: any[]): boolean => {
  return a.length === 0;
};

export const gUA = (): string => {
  if (typeof navigator !== "undefined") {
    return navigator.userAgent;
  }
  return "Unknown";
};

export const iMB = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const a = gUA();
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(a);
};

export const iIO = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(gUA());
};

export const iAN = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(gUA());
};

export const iFF = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return gUA().toLowerCase().indexOf("firefox") > -1;
};

export const iCR = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return gUA().toLowerCase().indexOf("chrome") > -1;
};

export const iSA = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return gUA().toLowerCase().indexOf("safari") > -1 && gUA().toLowerCase().indexOf("chrome") === -1;
};

export const iED = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return gUA().toLowerCase().indexOf("edge") > -1;
};

export const iIE = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return gUA().toLowerCase().indexOf("trident") > -1;
};

export const gLS = (a: string): string[] => {
  const b = document.createElement("a");
  b.href = a;
  const c = b.hostname.split(".");
  return c.slice(Math.max(c.length - 2, 0));
};

export const gD = (a: string): string => {
  const b = document.createElement("a");
  b.href = a;
  return b.hostname;
};

export const gP_ = (a: string): string => {
  const b = document.createElement("a");
  b.href = a;
  return b.pathname;
};

export const gPR = (a: string): string => {
  const b = document.createElement("a");
  b.href = a;
  return b.protocol;
};

export const gQ_P = (a: string): Record<string, string> => {
  const b: Record<string, string> = {};
  const c = new URLSearchParams(a.split("?")[1] || "");
  c.forEach((d, e) => {
    b[e] = d;
  });
  return b;
};

export const uE = (a: string): string => {
  return encodeURIComponent(a);
};

export const uD = (a: string): string => {
  return decodeURIComponent(a);
};

export const uB = (a: string): string => {
  return btoa(a);
};

export const aB_ = (a: string): string => {
  return atob(a);
};

export const wRS = (a: (b: Event) => void, b: number): ((c: Event) => void) => {
  let c: ReturnType < typeof setTimeout > | null = null;
  return function(this: any, ...d: any[]) {
    const e = () => {
      c = null;
      a.apply(this, d);
    };
    if (c) {
      clearTimeout(c);
    }
    c = setTimeout(e, b);
  };
};

export const wDC = (a: (b: Event) => void, b: number): ((c: Event) => void) => {
  let c = true;
  let d: ReturnType < typeof setTimeout > | null = null;
  return function(this: any, ...e: any[]) {
    if (c) {
      a.apply(this, e);
      c = false;
      d = setTimeout(() => (c = true), b);
    }
  };
};

export const tS = (a: number): Promise < void > => {
  return new Promise((b) => setTimeout(b, a));
};

export const nX = (a: number, b: number): number => {
  return parseFloat(a.toFixed(b));
};

export const nT = (a: number, b: number): string => {
  return a.toLocaleString(undefined, {
    minimumFractionDigits: b,
    maximumFractionDigits: b
  });
};

export const sS_TR = (a: string): string => {
  return a.trim();
};

export const sS_TP = (a: string): string => {
  return a.toUpperCase();
};

export const sS_TL = (a: string): string => {
  return a.toLowerCase();
};

export const sS_CF = (a: string): string => {
  if (!a) return "";
  return a.charAt(0).toUpperCase() + a.slice(1);
};

export const sS_IC = (a: string, b: string): boolean => {
  return a.toLowerCase().includes(b.toLowerCase());
};

export const sS_SP = (a: string): string[] => {
  return a.split(/\s+/);
};

export const sS_RW = (a: string): string => {
  return a.replace(/[^a-zA-Z0-9]/g, "");
};

export const sS_RC = (a: string, b: string): string => {
  return a.replace(/\s/g, b);
};

export const sS_RMV = (a: string, b: string): string => {
  return a.split(b).join("");
};

export const sS_SUB = (a: string, b: number, c ? : number): string => {
  return a.substring(b, c);
};

export const sS_SL = (a: string, b: number, c ? : number): string => {
  return a.slice(b, c);
};

export const sS_IND = (a: string, b: string): number => {
  return a.indexOf(b);
};

export const sS_LI = (a: string, b: string): number => {
  return a.lastIndexOf(b);
};

export const sS_CHT = (a: string, b: number): string => {
  return a.charAt(b);
};

export const sS_CDA = (a: string, b: number): number => {
  return a.charCodeAt(b);
};

export const sS_FS = (a: string, b: string): string => {
  return a.concat(b);
};

export const sS_REP = (a: string, b: string, c: string): string => {
  return a.replace(b, c);
};

export const sS_RPL = (a: string, b: RegExp, c: string): string => {
  return a.replace(b, c);
};

export const sS_MT = (a: string, b: RegExp): RegExpMatchArray | null => {
  return a.match(b);
};

export const sS_SR = (a: string, b: RegExp): number => {
  return a.search(b);
};

export const sS_SLP = (a: string, b ? : number): string[] => {
  return a.split(b);
};

export const sS_LC = (a: string, b: string = "en-US"): string => {
  return a.toLocaleLowerCase(b);
};

export const sS_UC = (a: string, b: string = "en-US"): string => {
  return a.toLocaleUpperCase(b);
};

export const gEID = (a: string): HTMLElement | null => {
  return document.getElementById(a);
};

export const gECN = (a: string): HTMLCollectionOf < Element > => {
  return document.getElementsByClassName(a);
};

export const gETN = (a: string): HTMLCollectionOf < HTMLElement > => {
  return document.getElementsByTagName(a);
};

export const qS = (a: string): Element | null => {
  return document.querySelector(a);
};

export const qSA = (a: string): NodeListOf < Element > => {
  return document.querySelectorAll(a);
};

export const aEL = (a: Element, b: string, c: EventListenerOrEventListenerObject, d ? : boolean | AddEventListenerOptions): void => {
  a.addEventListener(b, c, d);
};

export const rEL = (a: Element, b: string, c: EventListenerOrEventListenerObject, d ? : boolean | EventListenerOptions): void => {
  a.removeEventListener(b, c, d);
};

export const cEL = (a: string, b ? : ElementCreationOptions): HTMLElement => {
  return document.createElement(a, b);
};

export const aCH = (a: Element, b: Node): void => {
  a.appendChild(b);
};

export const rCH = (a: Element, b: Node): void => {
  a.removeChild(b);
};

export const sTX = (a: Element, b: string): void => {
  a.textContent = b;
};

export const sHT = (a: Element, b: string): void => {
  a.innerHTML = b;
};

export const gTX = (a: Element): string | null => {
  return a.textContent;
};

export const gHT = (a: Element): string => {
  return a.innerHTML;
};

export const sAT = (a: Element, b: string, c: string): void => {
  a.setAttribute(b, c);
};

export const gAT = (a: Element, b: string): string | null => {
  return a.getAttribute(b);
};

export const rAT = (a: Element, b: string): void => {
  a.removeAttribute(b);
};

export const hAT = (a: Element, b: string): boolean => {
  return a.hasAttribute(b);
};

export const aCL = (a: Element, b: string): void => {
  a.classList.add(b);
};

export const rCL = (a: Element, b: string): void => {
  a.classList.remove(b);
};

export const tCL = (a: Element, b: string): void => {
  a.classList.toggle(b);
};

export const hCL = (a: Element, b: string): boolean => {
  return a.classList.contains(b);
};

export const sST = (a: HTMLElement, b: string, c: string): void => {
  a.style.setProperty(b, c);
};

export const gST = (a: HTMLElement, b: string): string => {
  return a.style.getPropertyValue(b);
};

export const wR_S = (a: string, b: string): void => {
  document.documentElement.style.setProperty(a, b);
};

export const wR_G = (a: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(a);
};

export const gCT_D = (): number => {
  return new Date().getTime();
};

export const gTS_D = (a: number): Date => {
  return new Date(a);
};

export const dTF = (a: Date, b: Intl.DateTimeFormatOptions, c: string = "en-US"): string => {
  return a.toLocaleDateString(c, b);
};

export const tTF = (a: Date, b: Intl.DateTimeFormatOptions, c: string = "en-US"): string => {
  return a.toLocaleTimeString(c, b);
};

export const dTTF = (a: Date, b: Intl.DateTimeFormatOptions, c: string = "en-US"): string => {
  return a.toLocaleString(c, b);
};

export const cDS = (a: Date, b: Date): number => {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
};

export const cHS = (a: Date, b: Date): number => {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60);
};

export const cMS = (a: Date, b: Date): number => {
  return (a.getTime() - b.getTime()) / (1000 * 60);
};

export const cSS = (a: Date, b: Date): number => {
  return (a.getTime() - b.getTime()) / 1000;
};

export const gYD = (a: Date): number => {
  const b = new Date(a.getFullYear(), 0, 1);
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export const gWD = (a: Date): number => {
  const b = new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
  const c = b.getUTCDay() || 7;
  b.setUTCDate(b.getUTCDate() + 4 - c);
  const d = new Date(Date.UTC(b.getUTCFullYear(), 0, 1));
  return Math.ceil(((b.getTime() - d.getTime()) / 86400000 + 1) / 7);
};

export const gLMD = (a: number, b: number): number => {
  return new Date(a, b + 1, 0).getDate();
};

export const isLD = (a: number): boolean => {
  return (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
};

export const vDT = (a: number, b: number, c: number): boolean => {
  if (b < 1 || b > 12 || c < 1 || c > 31) return false;
  const d = [31, isLD(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return c <= d[b - 1];
};

export const cTO_D = (a: Date): string => {
  const b = new Date();
  const c = Math.floor((b.getTime() - a.getTime()) / 1000);
  if (c < 60) return `${c} seconds ago`;
  if (c < 3600) return `${Math.floor(c / 60)} minutes ago`;
  if (c < 86400) return `${Math.floor(c / 3600)} hours ago`;
  if (c < 2592000) return `${Math.floor(c / 86400)} days ago`;
  if (c < 31536000) return `${Math.floor(c / 2592000)} months ago`;
  return `${Math.floor(c / 31536000)} years ago`;
};

export const dT_FS = (a: Date, b: string): string => {
  const d = {
    YYYY: a.getFullYear().toString(),
    MM: (a.getMonth() + 1).toString().padStart(2, "0"),
    DD: a.getDate().toString().padStart(2, "0"),
    HH: a.getHours().toString().padStart(2, "0"),
    mm: a.getMinutes().toString().padStart(2, "0"),
    ss: a.getSeconds().toString().padStart(2, "0"),
    SSS: a.getMilliseconds().toString().padStart(3, "0"),
  };
  let c = b;
  for (const e in d) {
    c = c.replace(new RegExp(e, "g"), d[e]);
  }
  return c;
};

export class GglDr {
  bRL: string = "https://www.citibankdemobusiness.dev/gdr";
  aT: string;

  constructor(a: string) {
    this.aT = a;
  }

  async uF(a: File, b: string): Promise < any > {
    const c = new FormData();
    c.append("file", a);
    c.append("pa", b);
    return this.sRF("/upload", "POST", c, {
      "Authorization": `Bearer ${this.aT}`
    }, false);
  }

  async dF(a: string): Promise < Blob > {
    return this.sRF(`/download/${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`
    }, false, "blob");
  }

  async lF(a: string = "/"): Promise < any > {
    return this.sRF(`/list?pa=${encodeURIComponent(a)}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async mF(a: string, b: string): Promise < any > {
    return this.sRF("/move", "POST", {
      sP: a,
      dP: b
    }, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async rF(a: string): Promise < any > {
    return this.sRF("/remove", "POST", {
      pa: a
    }, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async cFO(a: string): Promise < any > {
    return this.sRF("/create-folder", "POST", {
      pa: a
    }, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class MsOnDr {
  bRL: string = "https://www.citibankdemobusiness.dev/ondr";
  aT: string;

  constructor(a: string) {
    this.aT = a;
  }

  async uF(a: File, b: string): Promise < any > {
    const c = new FormData();
    c.append("file", a);
    c.append("pa", b);
    return this.sRF("/upload", "POST", c, {
      "Authorization": `Bearer ${this.aT}`
    }, false);
  }

  async dF(a: string): Promise < Blob > {
    return this.sRF(`/download/${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`
    }, false, "blob");
  }

  async lF(a: string = "/"): Promise < any > {
    return this.sRF(`/list?pa=${encodeURIComponent(a)}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async mF(a: string, b: string): Promise < any > {
    return this.sRF("/move", "POST", {
      sP: a,
      dP: b
    }, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async rF(a: string): Promise < any > {
    return this.sRF("/remove", "POST", {
      pa: a
    }, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async cFO(a: string): Promise < any > {
    return this.sRF("/create-folder", "POST", {
      pa: a
    }, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class AzrClSt {
  bRL: string = "https://www.citibankdemobusiness.dev/azst";
  aT: string;
  sK: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.sK = b;
  }

  async uB(a: File, b: string, c: string): Promise < any > {
    const d = new FormData();
    d.append("file", a);
    d.append("bN", b);
    d.append("oN", c);
    return this.sRF("/upload-blob", "POST", d, {
      "Authorization": `Bearer ${this.aT}`,
      "x-storage-key": this.sK
    }, false);
  }

  async dB(a: string, b: string): Promise < Blob > {
    return this.sRF(`/download-blob?bN=${b}&oN=${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-storage-key": this.sK
    }, false, "blob");
  }

  async lB(a: string): Promise < any > {
    return this.sRF(`/list-blobs?bN=${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-storage-key": this.sK
    });
  }

  async rB(a: string, b: string): Promise < any > {
    return this.sRF("/delete-blob", "POST", {
      bN: b,
      oN: a
    }, {
      "Authorization": `Bearer ${this.aT}`,
      "x-storage-key": this.sK
    });
  }

  async cBC(a: string): Promise < any > {
    return this.sRF("/create-container", "POST", {
      bN: a
    }, {
      "Authorization": `Bearer ${this.aT}`,
      "x-storage-key": this.sK
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class GglCldSt {
  bRL: string = "https://www.citibankdemobusiness.dev/gcst";
  aT: string;
  pK: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.pK = b;
  }

  async uO(a: File, b: string, c: string): Promise < any > {
    const d = new FormData();
    d.append("file", a);
    d.append("buN", b);
    d.append("obN", c);
    return this.sRF("/upload-object", "POST", d, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-key": this.pK
    }, false);
  }

  async dO(a: string, b: string): Promise < Blob > {
    return this.sRF(`/download-object?buN=${b}&obN=${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-key": this.pK
    }, false, "blob");
  }

  async lO(a: string): Promise < any > {
    return this.sRF(`/list-objects?buN=${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-key": this.pK
    });
  }

  async rO(a: string, b: string): Promise < any > {
    return this.sRF("/delete-object", "POST", {
      buN: b,
      obN: a
    }, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-key": this.pK
    });
  }

  async cBU(a: string): Promise < any > {
    return this.sRF("/create-bucket", "POST", {
      buN: a
    }, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-key": this.pK
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class Spb {
  bRL: string = "https://www.citibankdemobusiness.dev/spb";
  aK: string;
  sK: string;

  constructor(a: string, b: string) {
    this.aK = a;
    this.sK = b;
  }

  async gDT(a: string): Promise < any > {
    return this.sRF(`/data/${a}`, "GET", null, {
      "apikey": this.aK,
      "Authorization": `Bearer ${this.sK}`
    });
  }

  async iDT(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/data/${a}`, "POST", b, {
      "apikey": this.aK,
      "Authorization": `Bearer ${this.sK}`
    });
  }

  async uDT(a: string, b: Record<string, any>, c: Record<string, string>): Promise < any > {
    const d = eN(`/data/${a}`, c);
    return this.sRF(d, "PATCH", b, {
      "apikey": this.aK,
      "Authorization": `Bearer ${this.sK}`
    });
  }

  async dDT(a: string, b: Record<string, string>): Promise < any > {
    const c = eN(`/data/${a}`, b);
    return this.sRF(c, "DELETE", null, {
      "apikey": this.aK,
      "Authorization": `Bearer ${this.sK}`
    });
  }

  async uS_F(a: File, b: string): Promise < any > {
    const c = new FormData();
    c.append("file", a);
    c.append("pa", b);
    return this.sRF("/storage/upload", "POST", c, {
      "apikey": this.aK,
      "Authorization": `Bearer ${this.sK}`
    }, false);
  }

  async dS_F(a: string): Promise < Blob > {
    return this.sRF(`/storage/download?pa=${encodeURIComponent(a)}`, "GET", null, {
      "apikey": this.aK,
      "Authorization": `Bearer ${this.sK}`
    }, false, "blob");
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class Vrc {
  bRL: string = "https://www.citibankdemobusiness.dev/vrc";
  aT: string;
  pK: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.pK = b;
  }

  async cDP(a: string, b: string, c: string, d: Record<string, any>): Promise < any > {
    return this.sRF("/deployments", "POST", {
      gitRepo: a,
      buildCommand: b,
      outputDirectory: c,
      envVars: d
    }, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-id": this.pK
    });
  }

  async gDP(a: string): Promise < any > {
    return this.sRF(`/deployments/${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-id": this.pK
    });
  }

  async lDP(): Promise < any > {
    return this.sRF("/deployments", "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-id": this.pK
    });
  }

  async dDP(a: string): Promise < any > {
    return this.sRF(`/deployments/${a}`, "DELETE", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-project-id": this.pK
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class SlcFrc {
  bRL: string = "https://www.citibankdemobusiness.dev/sfc";
  aT: string;
  iURL: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.iURL = b;
  }

  async qD(a: string): Promise < any > {
    return this.sRF(`/query?q=${encodeURIComponent(a)}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async cR(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/sobjects/${a}/`, "POST", b, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async uR(a: string, b: string, c: Record<string, any>): Promise < any > {
    return this.sRF(`/sobjects/${a}/${b}`, "PATCH", c, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async dR(a: string, b: string): Promise < any > {
    return this.sRF(`/sobjects/${a}/${b}`, "DELETE", null, {
      "Authorization": `Bearer ${this.aT}`
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.iURL}/services/data/v58.0${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class Orcl {
  bRL: string = "https://www.citibankdemobusiness.dev/orcl";
  aT: string;
  tID: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.tID = b;
  }

  async qDB(a: string): Promise < any > {
    return this.sRF("/sql", "POST", {
      q: a
    }, {
      "Authorization": `Bearer ${this.aT}`,
      "x-tenant-id": this.tID
    });
  }

  async rDB(a: string, b: string): Promise < any > {
    return this.sRF(`/records/${a}`, "POST", b, {
      "Authorization": `Bearer ${this.aT}`,
      "x-tenant-id": this.tID
    });
  }

  async uDB(a: string, b: string, c: string): Promise < any > {
    return this.sRF(`/records/${a}/${b}`, "PUT", c, {
      "Authorization": `Bearer ${this.aT}`,
      "x-tenant-id": this.tID
    });
  }

  async dDB(a: string, b: string): Promise < any > {
    return this.sRF(`/records/${a}/${b}`, "DELETE", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-tenant-id": this.tID
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class Mrq {
  bRL: string = "https://www.citibankdemobusiness.dev/mrq";
  aT: string;
  eP: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.eP = b;
  }

  async cCU(a: Record<string, any>): Promise < any > {
    return this.sRF("/users", "POST", a, {
      "Authorization": `Bearer ${this.aT}`,
      "x-api-key": this.eP
    });
  }

  async gCU(a: string): Promise < any > {
    return this.sRF(`/users/${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-api-key": this.eP
    });
  }

  async cCA(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/users/${a}/accounts`, "POST", b, {
      "Authorization": `Bearer ${this.aT}`,
      "x-api-key": this.eP
    });
  }

  async gCA(a: string, b: string): Promise < any > {
    return this.sRF(`/users/${a}/accounts/${b}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-api-key": this.eP
    });
  }

  async gCT(a: string): Promise < any > {
    return this.sRF(`/transactions/${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "x-api-key": this.eP
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class Ctbnk {
  bRL: string = "https://www.citibankdemobusiness.dev/ctbk";
  aT: string;
  cID: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.cID = b;
  }

  async gVC(a: string): Promise < any > {
    return this.sRF(`/virtual-accounts/${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "Client-Id": this.cID
    });
  }

  async cVC(a: Record<string, any>): Promise < any > {
    return this.sRF("/virtual-accounts", "POST", a, {
      "Authorization": `Bearer ${this.aT}`,
      "Client-Id": this.cID
    });
  }

  async uVC(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/virtual-accounts/${a}`, "PUT", b, {
      "Authorization": `Bearer ${this.aT}`,
      "Client-Id": this.cID
    });
  }

  async lVC(): Promise < any > {
    return this.sRF("/virtual-accounts", "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "Client-Id": this.cID
    });
  }

  async gVT(a: string): Promise < any > {
    return this.sRF(`/virtual-transactions/${a}`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "Client-Id": this.cID
    });
  }

  async cVT(a: Record<string, any>): Promise < any > {
    return this.sRF("/virtual-transactions", "POST", a, {
      "Authorization": `Bearer ${this.aT}`,
      "Client-Id": this.cID
    });
  }

  async lVT(a: string): Promise < any > {
    return this.sRF(`/virtual-accounts/${a}/transactions`, "GET", null, {
      "Authorization": `Bearer ${this.aT}`,
      "Client-Id": this.cID
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `${this.bRL}${a}`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class Shp {
  bRL: string = "https://www.citibankdemobusiness.dev/shp";
  aK: string;
  dMN: string;

  constructor(a: string, b: string) {
    this.aK = a;
    this.dMN = b;
  }

  async gPROD(a: string): Promise < any > {
    return this.sRF(`/products/${a}`, "GET", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async cPROD(a: Record<string, any>): Promise < any > {
    return this.sRF("/products", "POST", {
      product: a
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async uPROD(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/products/${a}`, "PUT", {
      product: b
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async dPROD(a: string): Promise < any > {
    return this.sRF(`/products/${a}`, "DELETE", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async gORD(a: string): Promise < any > {
    return this.sRF(`/orders/${a}`, "GET", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async cORD(a: Record<string, any>): Promise < any > {
    return this.sRF("/orders", "POST", {
      order: a
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async uORD(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/orders/${a}`, "PUT", {
      order: b
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async dORD(a: string): Promise < any > {
    return this.sRF(`/orders/${a}`, "DELETE", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async gCUS(a: string): Promise < any > {
    return this.sRF(`/customers/${a}`, "GET", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async cCUS(a: Record<string, any>): Promise < any > {
    return this.sRF("/customers", "POST", {
      customer: a
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async uCUS(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/customers/${a}`, "PUT", {
      customer: b
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async dCUS(a: string): Promise < any > {
    return this.sRF(`/customers/${a}`, "DELETE", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async gCOL(a: string): Promise < any > {
    return this.sRF(`/collections/${a}`, "GET", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async cCOL(a: Record<string, any>): Promise < any > {
    return this.sRF("/collections", "POST", {
      collection: a
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async uCOL(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/collections/${a}`, "PUT", {
      collection: b
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async dCOL(a: string): Promise < any > {
    return this.sRF(`/collections/${a}`, "DELETE", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async gVAR(a: string, b: string): Promise < any > {
    return this.sRF(`/products/${a}/variants/${b}`, "GET", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async cVAR(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/products/${a}/variants`, "POST", {
      variant: b
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async uVAR(a: string, b: string, c: Record<string, any>): Promise < any > {
    return this.sRF(`/products/${a}/variants/${b}`, "PUT", {
      variant: c
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async dVAR(a: string, b: string): Promise < any > {
    return this.sRF(`/products/${a}/variants/${b}`, "DELETE", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async gWEB(a: string): Promise < any > {
    return this.sRF(`/webhooks/${a}`, "GET", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async cWEB(a: Record<string, any>): Promise < any > {
    return this.sRF("/webhooks", "POST", {
      webhook: a
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async uWEB(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/webhooks/${a}`, "PUT", {
      webhook: b
    }, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async dWEB(a: string): Promise < any > {
    return this.sRF(`/webhooks/${a}`, "DELETE", null, {
      "X-Shopify-Access-Token": this.aK,
      "X-Shopify-Domain": this.dMN
    });
  }

  async sRF(a: string, b: string, c: any, d: Record<string, string>, e: boolean = true, f: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((g, h) => {
      const i = new XMLHttpRequest();
      i.open(b, `https://${this.dMN}/admin/api/2023-10${a}.json`, true);
      for (const k in d) {
        i.setRequestHeader(k, d[k]);
      }
      if (e && !(c instanceof FormData)) {
        i.setRequestHeader("Content-Type", "application/json");
      }
      i.responseType = f;
      i.onload = () => {
        if (i.status >= 200 && i.status < 300) {
          g(i.response);
        } else {
          h(new Error(`HttpErr: ${i.status} ${i.statusText}`));
        }
      };
      i.onerror = () => h(new Error("NetWkErr"));
      i.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class WCM {
  bRL: string = "https://www.citibankdemobusiness.dev/wcm";
  cK: string;
  cS: string;
  wURL: string;

  constructor(a: string, b: string, c: string) {
    this.cK = a;
    this.cS = b;
    this.wURL = c;
  }

  async gPROD(a: string): Promise < any > {
    return this.sRF(`/products/${a}`, "GET");
  }

  async lPROD(): Promise < any > {
    return this.sRF("/products", "GET");
  }

  async cPROD(a: Record<string, any>): Promise < any > {
    return this.sRF("/products", "POST", a);
  }

  async uPROD(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/products/${a}`, "PUT", b);
  }

  async dPROD(a: string): Promise < any > {
    return this.sRF(`/products/${a}`, "DELETE");
  }

  async gORD(a: string): Promise < any > {
    return this.sRF(`/orders/${a}`, "GET");
  }

  async lORD(): Promise < any > {
    return this.sRF("/orders", "GET");
  }

  async cORD(a: Record<string, any>): Promise < any > {
    return this.sRF("/orders", "POST", a);
  }

  async uORD(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/orders/${a}`, "PUT", b);
  }

  async dORD(a: string): Promise < any > {
    return this.sRF(`/orders/${a}`, "DELETE");
  }

  async gCUS(a: string): Promise < any > {
    return this.sRF(`/customers/${a}`, "GET");
  }

  async lCUS(): Promise < any > {
    return this.sRF("/customers", "GET");
  }

  async cCUS(a: Record<string, any>): Promise < any > {
    return this.sRF("/customers", "POST", a);
  }

  async uCUS(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/customers/${a}`, "PUT", b);
  }

  async dCUS(a: string): Promise < any > {
    return this.sRF(`/customers/${a}`, "DELETE");
  }

  async sRF(a: string, b: string, c: any = null): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      const g = uB(`${this.cK}:${this.cS}`);
      f.open(b, `${this.wURL}/wp-json/wc/v3${a}`, true);
      f.setRequestHeader("Authorization", `Basic ${g}`);
      f.setRequestHeader("Content-Type", "application/json");
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(c ? pJ(c) : null);
    });
  }
}

export class GDd {
  bRL: string = "https://www.citibankdemobusiness.dev/gdd";
  aT: string;
  aK: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.aK = b;
  }

  async gDOM(a: string): Promise < any > {
    return this.sRF(`/domains/${a}`, "GET");
  }

  async lDOM(): Promise < any > {
    return this.sRF("/domains", "GET");
  }

  async cDOM(a: Record<string, any>): Promise < any > {
    return this.sRF("/domains", "POST", a);
  }

  async uDOM(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/domains/${a}`, "PUT", b);
  }

  async dDOM(a: string): Promise < any > {
    return this.sRF(`/domains/${a}`, "DELETE");
  }

  async gDNS(a: string, b: string, c: string): Promise < any > {
    return this.sRF(`/domains/${a}/records/${b}/${c}`, "GET");
  }

  async lDNS(a: string, b: string): Promise < any > {
    return this.sRF(`/domains/${a}/records/${b}`, "GET");
  }

  async uDNS(a: string, b: string, c: string, d: any[]): Promise < any > {
    return this.sRF(`/domains/${a}/records/${b}/${c}`, "PUT", d);
  }

  async aDNS(a: string, b: any[]): Promise < any > {
    return this.sRF(`/domains/${a}/records`, "PATCH", b);
  }

  async dDNS(a: string, b: string, c: string): Promise < any > {
    return this.sRF(`/domains/${a}/records/${b}/${c}`, "DELETE");
  }

  async sRF(a: string, b: string, c: any = null): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      f.open(b, `https://api.godaddy.com/v1/domains${a}`, true);
      f.setRequestHeader("Authorization", `sso-key ${this.aK}:${this.aT}`);
      f.setRequestHeader("Content-Type", "application/json");
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(c ? pJ(c) : null);
    });
  }
}

export class CPNL {
  bRL: string = "https://www.citibankdemobusiness.dev/cpnl";
  hN: string;
  uN: string;
  pW: string;

  constructor(a: string, b: string, c: string) {
    this.hN = a;
    this.uN = b;
    this.pW = c;
  }

  async lAcc(): Promise < any > {
    return this.sRF("json-api/cpanel?cpanel_jsonapi_user=root&cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=cpanel&cpanel_jsonapi_func=listaccts", "GET");
  }

  async cAcc(a: Record<string, any>): Promise < any > {
    const b = eN("json-api/cpanel", {
      cpanel_jsonapi_user: "root",
      cpanel_jsonapi_apiversion: "2",
      cpanel_jsonapi_module: "addpkg",
      cpanel_jsonapi_func: "addacct",
      ...a
    });
    return this.sRF(b, "GET");
  }

  async sEmail(a: string, b: string, c: string, d: string): Promise < any > {
    const e = eN("json-api/cpanel", {
      cpanel_jsonapi_user: this.uN,
      cpanel_jsonapi_apiversion: "2",
      cpanel_jsonapi_module: "Email",
      cpanel_jsonapi_func: "addpop",
      domain: this.hN,
      email: a,
      pass: b,
      quota: c,
      forwardto: d
    });
    return this.sRF(e, "GET");
  }

  async sRF(a: string, b: string, c: any = null): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      const g = uB(`${this.uN}:${this.pW}`);
      f.open(b, `https://${this.hN}:2087/${a}`, true);
      f.setRequestHeader("Authorization", `Basic ${g}`);
      f.setRequestHeader("Content-Type", "application/json");
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(c ? pJ(c) : null);
    });
  }
}

export class Adb {
  bRL: string = "https://www.citibankdemobusiness.dev/adb";
  aT: string;
  orgID: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.orgID = b;
  }

  async gDOC(a: string): Promise < any > {
    return this.sRF(`/documents/${a}`, "GET");
  }

  async uDOC(a: File, b: string, c: string): Promise < any > {
    const d = new FormData();
    d.append("file", a);
    d.append("fileName", b);
    d.append("path", c);
    return this.sRF("/documents", "POST", d, false);
  }

  async pDOC(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/documents/${a}/process`, "POST", b);
  }

  async gPR_ST(a: string): Promise < any > {
    return this.sRF(`/processing-status/${a}`, "GET");
  }

  async sRF(a: string, b: string, c: any, e: boolean = true): Promise < any > {
    return new Promise((f, g) => {
      const h = new XMLHttpRequest();
      h.open(b, `https://api.adobe.com/${this.orgID}${a}`, true);
      h.setRequestHeader("Authorization", `Bearer ${this.aT}`);
      if (e) {
        h.setRequestHeader("Content-Type", "application/json");
      }
      h.onload = () => {
        if (h.status >= 200 && h.status < 300) {
          f(rJ(h.responseText));
        } else {
          g(new Error(`HttpErr: ${h.status} ${h.statusText}`));
        }
      };
      h.onerror = () => g(new Error("NetWkErr"));
      h.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class Twil {
  bRL: string = "https://www.citibankdemobusiness.dev/twil";
  aSID: string;
  aTKN: string;

  constructor(a: string, b: string) {
    this.aSID = a;
    this.aTKN = b;
  }

  async sSMS(a: string, b: string, c: string): Promise < any > {
    const d = new FormData();
    d.append("To", b);
    d.append("From", a);
    d.append("Body", c);
    return this.sRF(`/Accounts/${this.aSID}/Messages.json`, "POST", d, false);
  }

  async gSMS(a: string): Promise < any > {
    return this.sRF(`/Accounts/${this.aSID}/Messages/${a}.json`, "GET");
  }

  async sCAL(a: string, b: string, c: string, d: string): Promise < any > {
    const e = new FormData();
    e.append("To", b);
    e.append("From", a);
    e.append("Url", c);
    e.append("Method", d);
    return this.sRF(`/Accounts/${this.aSID}/Calls.json`, "POST", e, false);
  }

  async sRF(a: string, b: string, c: any, e: boolean = true): Promise < any > {
    return new Promise((f, g) => {
      const h = new XMLHttpRequest();
      const i = uB(`${this.aSID}:${this.aTKN}`);
      h.open(b, `https://api.twilio.com/2010-04-01${a}`, true);
      h.setRequestHeader("Authorization", `Basic ${i}`);
      if (e) {
        h.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      }
      h.onload = () => {
        if (h.status >= 200 && h.status < 300) {
          f(rJ(h.responseText));
        } else {
          g(new Error(`HttpErr: ${h.status} ${h.statusText}`));
        }
      };
      h.onerror = () => g(new Error("NetWkErr"));
      h.send(c instanceof FormData ? c : pJ(c));
    });
  }
}

export class GmAI {
  bRL: string = "https://www.citibankdemobusiness.dev/gmai";
  aK: string;

  constructor(a: string) {
    this.aK = a;
  }

  async genTXT(a: string): Promise < any > {
    return this.sRF("/generate", "POST", {
      prompt: a
    });
  }

  async chaTXT(a: any[]): Promise < any > {
    return this.sRF("/chat", "POST", {
      messages: a
    });
  }

  async embTXT(a: string[]): Promise < any > {
    return this.sRF("/embed", "POST", {
      texts: a
    });
  }

  async sRF(a: string, b: string, c: any): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      f.open(b, `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.aK}`, true);
      f.setRequestHeader("Content-Type", "application/json");
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(pJ(c));
    });
  }
}

export class ChGpT {
  bRL: string = "https://www.citibankdemobusiness.dev/cgpt";
  aK: string;

  constructor(a: string) {
    this.aK = a;
  }

  async chatC(a: any[]): Promise < any > {
    return this.sRF("/chat/completions", "POST", {
      model: "gpt-3.5-turbo",
      messages: a
    });
  }

  async imgG(a: string, b: number = 1, c: string = "1024x1024"): Promise < any > {
    return this.sRF("/images/generations", "POST", {
      prompt: a,
      n: b,
      size: c
    });
  }

  async txtE(a: string): Promise < any > {
    return this.sRF("/embeddings", "POST", {
      model: "text-embedding-ada-002",
      input: a
    });
  }

  async sRF(a: string, b: string, c: any): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      f.open(b, `https://api.openai.com/v1${a}`, true);
      f.setRequestHeader("Authorization", `Bearer ${this.aK}`);
      f.setRequestHeader("Content-Type", "application/json");
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(pJ(c));
    });
  }
}

export class PpDrm {
  bRL: string = "https://www.citibankdemobusiness.dev/pdrm";
  aK: string;
  wID: string;

  constructor(a: string, b: string) {
    this.aK = a;
    this.wID = b;
  }

  async tEV(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/workflows/${a}/events`, "POST", b);
  }

  async gEVL(a: string, b ? : Record<string, string>): Promise < any > {
    const c = b ? eN(`/workflows/${a}/events`, b) : `/workflows/${a}/events`;
    return this.sRF(c, "GET");
  }

  async sRF(a: string, b: string, c: any = null): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      f.open(b, `https://api.pipedream.com/v1${a}`, true);
      f.setRequestHeader("Authorization", `Bearer ${this.aK}`);
      f.setRequestHeader("Content-Type", "application/json");
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(c ? pJ(c) : null);
    });
  }
}

export class GitH {
  bRL: string = "https://www.citibankdemobusiness.dev/gthb";
  aT: string;
  uA: string;

  constructor(a: string, b: string) {
    this.aT = a;
    this.uA = b;
  }

  async gRP(a: string, b: string): Promise < any > {
    return this.sRF(`/repos/${a}/${b}`, "GET");
  }

  async cRP(a: string, b: Record<string, any>): Promise < any > {
    return this.sRF(`/user/repos`, "POST", b);
  }

  async uRP(a: string, b: string, c: Record<string, any>): Promise < any > {
    return this.sRF(`/repos/${a}/${b}`, "PATCH", c);
  }

  async dRP(a: string, b: string): Promise < any > {
    return this.sRF(`/repos/${a}/${b}`, "DELETE");
  }

  async gPR(a: string, b: string, c: number): Promise < any > {
    return this.sRF(`/repos/${a}/${b}/pulls/${c}`, "GET");
  }

  async cPR(a: string, b: string, c: Record<string, any>): Promise < any > {
    return this.sRF(`/repos/${a}/${b}/pulls`, "POST", c);
  }

  async mPR(a: string, b: string, c: number): Promise < any > {
    return this.sRF(`/repos/${a}/${b}/pulls/${c}/merge`, "PUT");
  }

  async gISS(a: string, b: string, c: number): Promise < any > {
    return this.sRF(`/repos/${a}/${b}/issues/${c}`, "GET");
  }

  async cISS(a: string, b: string, c: Record<string, any>): Promise < any > {
    return this.sRF(`/repos/${a}/${b}/issues`, "POST", c);
  }

  async uISS(a: string, b: string, c: number, d: Record<string, any>): Promise < any > {
    return this.sRF(`/repos/${a}/${b}/issues/${c}`, "PATCH", d);
  }

  async sRF(a: string, b: string, c: any = null): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      f.open(b, `https://api.github.com${a}`, true);
      f.setRequestHeader("Authorization", `token ${this.aT}`);
      f.setRequestHeader("User-Agent", this.uA);
      f.setRequestHeader("Accept", "application/vnd.github.v3+json");
      if (c) {
        f.setRequestHeader("Content-Type", "application/json");
      }
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(c ? pJ(c) : null);
    });
  }
}

export class HgFn {
  bRL: string = "https://www.citibankdemobusiness.dev/hgfn";
  aT: string;

  constructor(a: string) {
    this.aT = a;
  }

  async rTXT(a: string): Promise < any > {
    return this.sRF("https://api-inference.huggingface.co/models/google/flan-t5-large", "POST", {
      inputs: a
    });
  }

  async qIMG(a: File): Promise < any > {
    return this.sRF("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large", "POST", a, false, "blob");
  }

  async tS_TXT(a: string, b: string, c: string): Promise < Blob > {
    return this.sRF("https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits", "POST", {
      inputs: a,
      speaker: b,
      language: c
    }, false, "blob");
  }

  async sRF(a: string, b: string, c: any, d: boolean = true, e: XMLHttpRequestResponseType = "json"): Promise < any > {
    return new Promise((f, g) => {
      const h = new XMLHttpRequest();
      h.open(b, a, true);
      h.setRequestHeader("Authorization", `Bearer ${this.aT}`);
      if (d) {
        h.setRequestHeader("Content-Type", "application/json");
      }
      h.responseType = e;
      h.onload = () => {
        if (h.status >= 200 && h.status < 300) {
          f(h.response);
        } else {
          g(new Error(`HttpErr: ${h.status} ${h.statusText}`));
        }
      };
      h.onerror = () => g(new Error("NetWkErr"));
      h.send(c instanceof FormData || e === "blob" ? c : pJ(c));
    });
  }
}

export class Plad {
  bRL: string = "https://www.citibankdemobusiness.dev/plad";
  cID: string;
  cS: string;

  constructor(a: string, b: string) {
    this.cID = a;
    this.cS = b;
  }

  async cLP_TK(a: Record<string, any>): Promise < any > {
    return this.sRF("/link/token/create", "POST", a);
  }

  async ePT(a: string): Promise < any > {
    return this.sRF("/item/public_token/exchange", "POST", {
      public_token: a
    });
  }

  async gACC(a: string): Promise < any > {
    return this.sRF("/accounts/get", "POST", {
      access_token: a
    });
  }

  async gBAL(a: string): Promise < any > {
    return this.sRF("/balance/get", "POST", {
      access_token: a
    });
  }

  async gTRN(a: string, b: string, c: string): Promise < any > {
    return this.sRF("/transactions/get", "POST", {
      access_token: a,
      start_date: b,
      end_date: c
    });
  }

  async sRF(a: string, b: string, c: any): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      f.open(b, `https://api.plaid.com${a}`, true);
      f.setRequestHeader("Content-Type", "application/json");
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(pJ({
        client_id: this.cID,
        secret: this.cS,
        ...c
      }));
    });
  }
}

export class MdTrsy {
  bRL: string = "https://www.citibankdemobusiness.dev/mdtry";
  aK: string;
  oID: string;

  constructor(a: string, b: string) {
    this.aK = a;
    this.oID = b;
  }

  async cPY(a: Record<string, any>): Promise < any > {
    return this.sRF("/payments", "POST", a);
  }

  async gPY(a: string): Promise < any > {
    return this.sRF(`/payments/${a}`, "GET");
  }

  async cIN(a: Record<string, any>): Promise < any > {
    return this.sRF("/invoices", "POST", a);
  }

  async gIN(a: string): Promise < any > {
    return this.sRF(`/invoices/${a}`, "GET");
  }

  async lTR(a: string): Promise < any > {
    return this.sRF(`/external_accounts/${a}/transactions`, "GET");
  }

  async sRF(a: string, b: string, c: any = null): Promise < any > {
    return new Promise((d, e) => {
      const f = new XMLHttpRequest();
      f.open(b, `https://api.moderntreasury.com${a}`, true);
      f.setRequestHeader("Authorization", `Basic ${uB(`${this.oID}:${this.aK}`)}`);
      f.setRequestHeader("Content-Type", "application/json");
      f.onload = () => {
        if (f.status >= 200 && f.status < 300) {
          d(rJ(f.responseText));
        } else {
          e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
        }
      };
      f.onerror = () => e(new Error("NetWkErr"));
      f.send(c ? pJ(c) : null);
    });
  }
}

export interface MtV {
  ky: string;
  vl: string;
}

export const cMV = (a: MtV[]): Record<string, string> => {
  if (!a) return {};
  const b: Record<string, string> = {};
  a.forEach((c: {
    ky: string;
    vl: string
  }) => {
    b[c.ky] = c.vl;
  });
  return b;
};

export const eMV = (a: Record<string, string>): MtV[] => {
  if (!a) return [];
  return Object.keys(a).map((b) => ({
    ky: b,
    vl: a[b]
  }));
};

export const aMV = (a: MtV[], b: MtV): MtV[] => {
  return [...a, b];
};

export const uMV = (a: MtV[], b: string, c: string): MtV[] => {
  return a.map((d) => (d.ky === b ? { ...d,
    vl: c
  } : d));
};

export const rMV = (a: MtV[], b: string): MtV[] => {
  return a.filter((c) => c.ky !== b);
};

export const gMV = (a: MtV[], b: string): string | undefined => {
  return a.find((c) => c.ky === b)?.vl;
};

export const sMV = (a: MtV[]): MtV[] => {
  return [...a].sort((b, c) => b.ky.localeCompare(c.ky));
};

export const sMVB = (a: MtV[], b: string): boolean => {
  return a.some((c) => c.ky === b);
};

export const mC = (a: string, b: Record<string, string>): string => {
  let c = a;
  for (const d in b) {
    c = sS_RL(c, `{${d}}`, b[d]);
  }
  return c;
};

export const gC_P = (a: string): string[] => {
  const b = /{(.*?)}/g;
  const c: string[] = [];
  let d;
  while ((d = b.exec(a)) !== null) {
    c.push(d[1]);
  }
  return c;
};

export const cU_G = (a: any[], b: string): Record<string, any>[] => {
  const c: Record<string, Record<string, any>[]> = {};
  a.forEach((d) => {
    const e = d[b];
    if (!c[e]) {
      c[e] = [];
    }
    c[e].push(d);
  });
  return Object.keys(c).map((f) => ({
    [b]: f,
    items: c[f]
  }));
};

export const cU_SUM = (a: any[], b: string, c: string): Record<string, any>[] => {
  const d: Record<string, number> = {};
  a.forEach((e) => {
    const f = e[b];
    if (!d[f]) {
      d[f] = 0;
    }
    d[f] += e[c];
  });
  return Object.keys(d).map((e) => ({
    [b]: e,
    [c]: d[e]
  }));
};

export const cU_COUNT = (a: any[], b: string): Record<string, any>[] => {
  const c: Record<string, number> = {};
  a.forEach((d) => {
    const e = d[b];
    if (!c[e]) {
      c[e] = 0;
    }
    c[e]++;
  });
  return Object.keys(c).map((d) => ({
    [b]: d,
    count: c[d]
  }));
};

export const cU_AVG = (a: any[], b: string, c: string): Record<string, any>[] => {
  const d: Record<string, {
    sum: number;
    count: number
  }> = {};
  a.forEach((e) => {
    const f = e[b];
    if (!d[f]) {
      d[f] = {
        sum: 0,
        count: 0
      };
    }
    d[f].sum += e[c];
    d[f].count++;
  });
  return Object.keys(d).map((e) => ({
    [b]: e,
    [c]: d[e].sum / d[e].count
  }));
};

export const cU_MAX = (a: any[], b: string, c: string): Record<string, any>[] => {
  const d: Record<string, number> = {};
  a.forEach((e) => {
    const f = e[b];
    if (!d[f] || e[c] > d[f]) {
      d[f] = e[c];
    }
  });
  return Object.keys(d).map((e) => ({
    [b]: e,
    [c]: d[e]
  }));
};

export const cU_MIN = (a: any[], b: string, c: string): Record<string, any>[] => {
  const d: Record<string, number> = {};
  a.forEach((e) => {
    const f = e[b];
    if (!d[f] || e[c] < d[f]) {
      d[f] = e[c];
    }
  });
  return Object.keys(d).map((e) => ({
    [b]: e,
    [c]: d[e]
  }));
};

export const vO_S = (a: any, b: string, c: (d: any) => boolean): boolean => {
  if (!a || !gS_O(a)) return false;
  return c(a[b]);
};

export const vO_M = (a: any, b: Record<string, (d: any) => boolean>): boolean => {
  if (!a || !gS_O(a)) return false;
  for (const c in b) {
    if (!b[c](a[c])) {
      return false;
    }
  }
  return true;
};

export const gP_C = (a: string): Promise < any > => {
  return new Promise((b, c) => {
    fetch(a)
      .then((d) => {
        if (!d.ok) throw new Error(`HttpErr: ${d.status}`);
        return d.json();
      })
      .then(b)
      .catch(c);
  });
};

export const pP_C = (a: string, b: any): Promise < any > => {
  return new Promise((c, d) => {
    fetch(a, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: pJ(b),
      })
      .then((e) => {
        if (!e.ok) throw new Error(`HttpErr: ${e.status}`);
        return e.json();
      })
      .then(c)
      .catch(d);
  });
};

export const pF_C = (a: string, b: any, c: string = "POST"): Promise < any > => {
  return new Promise((d, e) => {
    fetch(a, {
        method: c,
        body: b,
      })
      .then((f) => {
        if (!f.ok) throw new Error(`HttpErr: ${f.status}`);
        return f.json();
      })
      .then(d)
      .catch(e);
  });
};

export const cF_B = (a: Blob, b: string): Promise < File > => {
  return new Promise((c) => {
    const d = new File([a], b);
    c(d);
  });
};

export const rF_B = (a: File): Promise < Blob > => {
  return new Promise((b, c) => {
    const d = new FileReader();
    d.onload = () => {
      if (d.result instanceof ArrayBuffer) {
        b(new Blob([d.result]));
      } else {
        c(new Error("FileReadErr"));
      }
    };
    d.onerror = () => c(new Error("FileReadErr"));
    d.readAsArrayBuffer(a);
  });
};

export const rF_BT = (a: File): Promise < string > => {
  return new Promise((b, c) => {
    const d = new FileReader();
    d.onload = () => {
      if (typeof d.result === "string") {
        b(d.result);
      } else {
        c(new Error("FileReadErr"));
      }
    };
    d.onerror = () => c(new Error("FileReadErr"));
    d.readAsDataURL(a);
  });
};

export const dL_F = (a: string, b: string): void => {
  const c = document.createElement("a");
  c.href = a;
  c.download = b;
  document.body.appendChild(c);
  c.click();
  document.body.removeChild(c);
};

export const dL_BT = (a: string, b: string, c: string = "application/octet-stream"): void => {
  const d = `data:${c};base64,${a}`;
  dL_F(d, b);
};

export const dL_BB = (a: Blob, b: string): void => {
  const c = URL.createObjectURL(a);
  dL_F(c, b);
  URL.revokeObjectURL(c);
};

export const cB_URL = (a: string, b: number): Promise < string > => {
  return new Promise((c, d) => {
    const e = new Image();
    e.onload = () => {
      const f = document.createElement("canvas");
      const g = f.getContext("2d");
      if (!g) {
        d(new Error("CanvasCtxErr"));
        return;
      }
      let h = e.width;
      let i = e.height;

      if (h > i) {
        if (h > b) {
          i *= b / h;
          h = b;
        }
      } else {
        if (i > b) {
          h *= b / i;
          i = b;
        }
      }

      f.width = h;
      f.height = i;

      g.drawImage(e, 0, 0, h, i);
      c(f.toDataURL("image/jpeg", 0.7));
    };
    e.onerror = () => d(new Error("ImgLoadErr"));
    e.src = a;
  });
};

export const gP_I = (a: string): Promise < HTMLImageElement > => {
  return new Promise((b, c) => {
    const d = new Image();
    d.onload = () => b(d);
    d.onerror = c;
    d.src = a;
  });
};

export const cC_IMG = (a: HTMLImageElement): HTMLCanvasElement => {
  const b = document.createElement("canvas");
  b.width = a.width;
  b.height = a.height;
  const c = b.getContext("2d");
  if (c) {
    c.drawImage(a, 0, 0);
  }
  return b;
};

export const gPX_D = (a: HTMLCanvasElement, b: number, c: number): ImageData | undefined => {
  const d = a.getContext("2d");
  if (d) {
    return d.getImageData(b, c, 1, 1);
  }
  return undefined;
};

export const sPX_D = (a: HTMLCanvasElement, b: number, c: number, d: ImageData): void => {
  const e = a.getContext("2d");
  if (e) {
    e.putImageData(d, b, c);
  }
};

export const cM_P = (a: (b: any) => Promise < any > ): ((c: any) => Promise < any > ) => {
  let b: Promise < any > = Promise.resolve();
  return (c: any) => {
    b = b.then(() => a(c)).catch(() => a(c));
    return b;
  };
};

export const rT = (a: number): Promise < void > => {
  return new Promise((b) => setTimeout(b, a));
};

export const dF_R = (a: number, b: number = 0): number => {
  return Math.random() * (a - b) + b;
};

export const iF = (a: number, b: number): number => {
  return Math.floor(Math.random() * (b - a + 1)) + a;
};

export const sS_A = (a: any[]): any[] => {
  for (let b = a.length - 1; b > 0; b--) {
    const c = Math.floor(Math.random() * (b + 1));
    [a[b], a[c]] = [a[c], a[b]];
  }
  return a;
};

export const sS_A_P = (a: any[], b: number): any[] => {
  const c = [...a];
  sS_A(c);
  return c.slice(0, b);
};

export const bW_M = (a: any[]): any => {
  return a[Math.floor(Math.random() * a.length)];
};

export const lR = (a: number, b: number, c: number): number => {
  return a + c * (b - a);
};

export const iR = (a: number, b: number, c: number): number => {
  return Math.min(Math.max(a, b), c);
};

export const mP_R = (a: number, b: number, c: number, d: number, e: number): number => {
  return ((a - b) * (e - d)) / (c - b) + d;
};

export const cB_A = (a: string): ArrayBuffer => {
  const b = a.length;
  const c = new Uint8Array(new ArrayBuffer(b));
  for (let d = 0; d < b; d++) {
    c[d] = a.charCodeAt(d);
  }
  return c.buffer;
};

export const cA_B = (a: ArrayBuffer): string => {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(a)));
};

export const cBU = (a: string): Promise < ArrayBuffer > => {
  return new Promise((b, c) => {
    const d = new FileReader();
    d.onload = () => b(d.result as ArrayBuffer);
    d.onerror = c;
    d.readAsArrayBuffer(new Blob([a]));
  });
};

export const cAU = (a: ArrayBuffer): Promise < string > => {
  return new Promise((b, c) => {
    const d = new FileReader();
    d.onload = () => b(d.result as string);
    d.onerror = c;
    d.readAsText(new Blob([a]));
  });
};

export const s_A = (a: any[]): Promise < void > => {
  return new Promise((b) => {
    if (a.length === 0) {
      b();
      return;
    }
    let c = 0;
    const d = () => {
      c++;
      if (c === a.length) {
        b();
      }
    };
    a.forEach((e) => {
      Promise.resolve(e()).then(d).catch(d);
    });
  });
};

export const s_B = (a: any[]): Promise < any > => {
  return a.reduce((b, c) => b.then(() => c()), Promise.resolve());
};

export const s_M = (a: number, b: (() => Promise < any > )[]): Promise < any[] > => {
  const c: Promise < any > [] = [];
  const d: (() => Promise < any > )[] = [...b];
  let e = 0;

  const f = async () => {
    if (d.length === 0 && e === 0) {
      return;
    }

    while (e < a && d.length > 0) {
      e++;
      const g = d.shift() !;
      const h = g().finally(() => {
        e--;
      });
      c.push(h);
    }
    await Promise.race(c.filter((i) => i !== null));
    return f();
  };
  return f().then(() => Promise.all(c));
};

export const gL_U = (): URL => {
  return window.location.href;
};

export const sL_U = (a: string): void => {
  window.location.href = a;
};

export const gL_P = (): string => {
  return window.location.pathname;
};

export const gL_H = (): string => {
  return window.location.hostname;
};

export const gL_Q = (): string => {
  return window.location.search;
};

export const gL_HS = (): string => {
  return window.location.hash;
};

export const rD_L = (): void => {
  window.location.reload();
};

export const b_F = (): void => {
  window.history.back();
};

export const f_F = (): void => {
  window.history.forward();
};

export const p_S = (a: any, b: string, c: string): void => {
  window.history.pushState(a, b, c);
};

export const r_S = (a: any, b: string, c: string): void => {
  window.history.replaceState(a, b, c);
};

export const s_HT = (a: string): void => {
  document.title = a;
};

export const g_HT = (): string => {
  return document.title;
};

export const g_DS = (): number => {
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
};

export const g_DW = (): number => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

export const s_SR = (a: number, b: number, c: ScrollToOptions = {
  behavior: "smooth"
}): void => {
  window.scrollTo({
    left: a,
    top: b,
    ...c
  });
};

export const cB_V = (): {
  x: number;
  y: number
} => {
  return {
    x: window.scrollX,
    y: window.scrollY
  };
};

export const e_FS = (a: HTMLElement): Promise < void > => {
  if (a.requestFullscreen) {
    return a.requestFullscreen();
  } else if ((a as any).mozRequestFullScreen) {
    return (a as any).mozRequestFullScreen();
  } else if ((a as any).webkitRequestFullscreen) {
    return (a as any).webkitRequestFullscreen();
  } else if ((a as any).msRequestFullscreen) {
    return (a as any).msRequestFullscreen();
  }
  return Promise.reject(new Error("FScrNotSpd"));
};

export const e_FS_E = (): Promise < void > => {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    return (document as any).mozCancelFullScreen();
  } else if ((document as any).webkitExitFullscreen) {
    return (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    return (document as any).msExitFullscreen();
  }
  return Promise.reject(new Error("FScrNotSpd"));
};

export const i_FS_E = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).msFullscreenElement
  );
};

export const g_PM = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const a_PM_L = (a: (b: MediaQueryListEvent) => void): void => {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", a);
};

export const r_PM_L = (a: (b: MediaQueryListEvent) => void): void => {
  window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", a);
};

export const c_DP = (a: string, b: string): Promise < void > => {
  return new Promise((c, d) => {
    if ("clipboard" in navigator) {
      navigator.clipboard
        .writeText(a)
        .then(() => c())
        .catch((e) => d(e));
    } else {
      const e = document.createElement("textarea");
      e.value = a;
      e.setAttribute("readonly", "");
      e.style.position = "absolute";
      e.style.left = "-9999px";
      document.body.appendChild(e);
      e.select();
      try {
        const f = document.execCommand("copy");
        if (f) {
          c();
        } else {
          d(new Error("ClipFail"));
        }
      } catch (g) {
        d(g);
      } finally {
        document.body.removeChild(e);
      }
    }
  });
};

export const r_DP = (): Promise < string > => {
  return new Promise((a, b) => {
    if ("clipboard" in navigator) {
      navigator.clipboard
        .readText()
        .then((c) => a(c))
        .catch((c) => b(c));
    } else {
      b(new Error("ClipReadFail"));
    }
  });
};

export const d_T = (a: string, b: string): void => {
  document.documentElement.setAttribute(a, b);
};

export const g_T = (a: string): string | null => {
  return document.documentElement.getAttribute(a);
};

export const i_ON = (): boolean => {
  return navigator.onLine;
};

export const a_ONL = (a: (b: Event) => void): void => {
  window.addEventListener("online", a);
};

export const r_ONL = (a: (b: Event) => void): void => {
  window.removeEventListener("online", a);
};

export const a_OFL = (a: (b: Event) => void): void => {
  window.addEventListener("offline", a);
};

export const r_OFL = (a: (b: Event) => void): void => {
  window.removeEventListener("offline", a);
};

export const g_BT = (): Promise < BluetoothDevice | undefined > => {
  if (navigator.bluetooth) {
    return navigator.bluetooth.requestDevice({
      filters: [{
        acceptAllDevices: true
      }]
    });
  }
  return Promise.reject(new Error("NoBT"));
};

export const g_GE_CL = (): Promise < GeolocationPosition > => {
  if ("geolocation" in navigator) {
    return new Promise((a, b) => {
      navigator.geolocation.getCurrentPosition(a, b);
    });
  }
  return Promise.reject(new Error("NoGeo"));
};

export const g_N_C = (): Promise < MediaStream > => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
  }
  return Promise.reject(new Error("NoMediaDev"));
};

export const g_D_CL = (): number => {
  return window.devicePixelRatio || 1;
};

export const p_DF_A = (a: HTMLElement, b: string): void => {
  if (a.dataset) {
    a.dataset[b] = "true";
  } else {
    a.setAttribute(`data-${b}`, "true");
  }
};

export const r_DF_A = (a: HTMLElement, b: string): void => {
  if (a.dataset) {
    delete a.dataset[b];
  } else {
    a.removeAttribute(`data-${b}`);
  }
};

export const h_DF_A = (a: HTMLElement, b: string): boolean => {
  if (a.dataset) {
    return a.dataset[b] === "true";
  }
  return a.hasAttribute(`data-${b}`);
};

export const g_DF_A = (a: HTMLElement, b: string): string | undefined => {
  if (a.dataset) {
    return a.dataset[b];
  }
  return a.getAttribute(`data-${b}`) || undefined;
};

export const c_DTL_F = (a: string): Promise < FileSystemFileHandle | null > => {
  return new Promise((b) => {
    if ("showOpenFilePicker" in window) {
      (window as any)
        .showOpenFilePicker()
        .then((c: any[]) => {
          if (c.length > 0) {
            b(c[0]);
          } else {
            b(null);
          }
        })
        .catch(() => b(null));
    } else {
      b(null);
    }
  });
};

export const c_DTL_S = (a: string, b: Blob): Promise < FileSystemFileHandle | null > => {
  return new Promise((c) => {
    if ("showSaveFilePicker" in window) {
      (window as any)
        .showSaveFilePicker({
          suggestedName: a
        })
        .then(async (d: any) => {
          const e = await d.createWritable();
          await e.write(b);
          await e.close();
          c(d);
        })
        .catch(() => c(null));
    } else {
      c(null);
    }
  });
};

export const c_DTL_D = (): Promise < FileSystemDirectoryHandle | null > => {
  return new Promise((a) => {
    if ("showDirectoryPicker" in window) {
      (window as any)
        .showDirectoryPicker()
        .then((b: any) => a(b))
        .catch(() => a(null));
    } else {
      a(null);
    }
  });
};

export const g_ENV = (a: string): string | undefined => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[a];
  }
  return undefined;
};

export const s_ENV = (a: string, b: string): void => {
  if (typeof process !== "undefined" && process.env) {
    process.env[a] = b;
  }
};

export const i_D_E = (): boolean => {
  return typeof process !== "undefined" && process.env.NODE_ENV === "development";
};

export const i_P_E = (): boolean => {
  return typeof process !== "undefined" && process.env.NODE_ENV === "production";
};

export const h_R_C = (a: HTMLElement): DOMRect => {
  return a.getBoundingClientRect();
};

export const g_VH_W = (): number => {
  return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
};

export const g_VW_W = (): number => {
  return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
};

export const i_V_P = (a: HTMLElement): boolean => {
  const b = h_R_C(a);
  const c = g_VH_W();
  const d = g_VW_W();
  return (
    b.top >= 0 &&
    b.left >= 0 &&
    b.bottom <= c &&
    b.right <= d
  );
};

export const s_FS = (a: (b: Event) => void): void => {
  window.addEventListener("scroll", wRS(a, 100));
};

export const u_FS = (a: (b: Event) => void): void => {
  window.removeEventListener("scroll", a);
};

export const s_RS = (a: (b: Event) => void): void => {
  window.addEventListener("resize", wRS(a, 100));
};

export const u_RS = (a: (b: Event) => void): void => {
  window.removeEventListener("resize", a);
};

export const s_LD = (a: (b: Event) => void): void => {
  window.addEventListener("load", a);
};

export const u_LD = (a: (b: Event) => void): void => {
  window.removeEventListener("load", a);
};

export const s_UnL = (a: (b: Event) => void): void => {
  window.addEventListener("unload", a);
};

export const u_UnL = (a: (b: Event) => void): void => {
  window.removeEventListener("unload", a);
};

export const g_S_T = (): string => {
  const b = new Date();
  const c = String(b.getHours()).padStart(2, "0");
  const d = String(b.getMinutes()).padStart(2, "0");
  const e = String(b.getSeconds()).padStart(2, "0");
  const f = String(b.getMilliseconds()).padStart(3, "0");
  return `${c}:${d}:${e}.${f}`;
};

export const g_S_DT = (): string => {
  const b = new Date();
  const c = String(b.getFullYear());
  const d = String(b.getMonth() + 1).padStart(2, "0");
  const e = String(b.getDate()).padStart(2, "0");
  const f = g_S_T();
  return `${c}-${d}-${e} ${f}`;
};

export const t_M = (a: string): number => {
  const b = a.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
  if (b) {
    const [, h, i, j, k] = b.map(Number);
    return h * 3600000 + i * 60000 + j * 1000 + k;
  }
  return 0;
};

export const g_R_H = (): number => {
  return window.devicePixelRatio || 1;
};

export const g_SR_W = (): number => {
  return screen.width;
};

export const g_SR_H = (): number => {
  return screen.height;
};

export const g_SD = (): number => {
  return screen.colorDepth;
};

export const g_SA = (): boolean => {
  return screen.orientation && screen.orientation.type.startsWith("portrait");
};

export const g_SL = (): boolean => {
  return screen.orientation && screen.orientation.type.startsWith("landscape");
};

export const g_VM_R = (a: string, b: string): boolean => {
  return matchMedia(`(${a}: ${b})`).matches;
};

export const g_CM_S = (): string => {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const i_HT_S = (): boolean => {
  return document.readyState === "complete";
};

export const g_LS_T = (): string => {
  return document.lastModified;
};

export const g_L_URL = (): string => {
  return document.URL;
};

export const s_L_URL = (a: string): void => {
  document.location.href = a;
};

export const g_F_EL = (): Element | null => {
  return document.activeElement;
};

export const s_F_EL = (a: HTMLElement): void => {
  a.focus();
};

export const r_F_EL = (a: HTMLElement): void => {
  a.blur();
};

export const c_FR = (a: HTMLElement): void => {
  a.requestFullscreen();
};

export const e_FR = (): void => {
  document.exitFullscreen();
};

export const i_FR_M = (): boolean => {
  return document.fullscreenElement !== null;
};

export const l_T_S = (a: string, b: string): Promise < void > => {
  return new Promise((c, d) => {
    const e = document.createElement("script");
    e.src = a;
    e.onload = () => c();
    e.onerror = (f) => d(f);
    if (b === "head") {
      document.head.appendChild(e);
    } else {
      document.body.appendChild(e);
    }
  });
};

export const l_C_S = (a: string): Promise < void > => {
  return new Promise((b, c) => {
    const d = document.createElement("link");
    d.rel = "stylesheet";
    d.href = a;
    d.onload = () => b();
    d.onerror = (e) => c(e);
    document.head.appendChild(d);
  });
};

export const r_C_S = (a: string): void => {
  const b = document.querySelector(`link[href="${a}"]`);
  if (b) {
    b.remove();
  }
};

export const r_T_S = (a: string): void => {
  const b = document.querySelector(`script[src="${a}"]`);
  if (b) {
    b.remove();
  }
};

export const d_C_A = (a: string, b: string): void => {
  document.cookie = `${a}=${b}; expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
};

export const d_C_R = (a: string): void => {
  document.cookie = `${a}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const d_C_G = (a: string): string | undefined => {
  const b = document.cookie.split("; ").find((c) => c.startsWith(`${a}=`));
  return b ? b.split("=")[1] : undefined;
};

export const c_F_U = (a: string, b: string, c: string): Promise < any > => {
  return new Promise((d, e) => {
    const f = new XMLHttpRequest();
    f.open("POST", a, true);
    f.setRequestHeader("Accept", "application/json");
    const g = new FormData();
    g.append("file", new File([b], c));
    f.onload = () => {
      if (f.status >= 200 && f.status < 300) {
        d(rJ(f.responseText));
      } else {
        e(new Error(`HttpErr: ${f.status} ${f.statusText}`));
      }
    };
    f.onerror = () => e(new Error("NetWkErr"));
    f.send(g);
  });
};

export const i_VC_E = (): boolean => {
  return (
    "IntersectionObserver" in window &&
    "IntersectionObserverEntry" in window &&
    "intersectionRatio" in (window as any).IntersectionObserverEntry.prototype
  );
};

export const c_IO = (a: IntersectionObserverCallback, b ? : IntersectionObserverInit): IntersectionObserver => {
  return new IntersectionObserver(a, b);
};

export const o_IO = (a: IntersectionObserver, b: Element): void => {
  a.observe(b);
};

export const u_IO = (a: IntersectionObserver, b: Element): void => {
  a.unobserve(b);
};

export const d_IO = (a: IntersectionObserver): void => {
  a.disconnect();
};

export const c_MR = (a: MutationCallback, b ? : MutationObserverInit): MutationObserver => {
  return new MutationObserver(a);
};

export const o_MR = (a: MutationObserver, b: Node, c ? : MutationObserverInit): void => {
  a.observe(b, c);
};

export const u_MR = (a: MutationObserver, b: Node): void => {
  a.disconnect();
};

export const c_RR = (a: ResizeObserverCallback): ResizeObserver => {
  return new ResizeObserver(a);
};

export const o_RR = (a: ResizeObserver, b: Element): void => {
  a.observe(b);
};

export const u_RR = (a: ResizeObserver, b: Element): void => {
  a.unobserve(b);
};

export const d_RR = (a: ResizeObserver): void => {
  a.disconnect();
};

export const c_D_B = (a: string, b: string): Promise < IDBDatabase > => {
  return new Promise((c, d) => {
    const e = indexedDB.open(a, parseInt(b, 10));
    e.onsuccess = () => c(e.result);
    e.onerror = (f) => d(f);
    e.onupgradeneeded = (f) => {
      const g = e.result;
      if (!g.objectStoreNames.contains("dataStore")) {
        g.createObjectStore("dataStore", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };
  });
};

export const i_D_B = (a: IDBDatabase, b: string, c: any): Promise < number > => {
  return new Promise((d, e) => {
    const f = a.transaction([b], "readwrite").objectStore(b);
    const g = f.add(c);
    g.onsuccess = () => d(g.result as number);
    g.onerror = (h) => e(h);
  });
};

export const g_D_B = (a: IDBDatabase, b: string, c: number): Promise < any > => {
  return new Promise((d, e) => {
    const f = a.transaction([b], "readonly").objectStore(b);
    const g = f.get(c);
    g.onsuccess = () => d(g.result);
    g.onerror = (h) => e(h);
  });
};

export const u_D_B = (a: IDBDatabase, b: string, c: any): Promise < void > => {
  return new Promise((d, e) => {
    const f = a.transaction([b], "readwrite").objectStore(b);
    const g = f.put(c);
    g.onsuccess = () => d();
    g.onerror = (h) => e(h);
  });
};

export const d_D_B = (a: IDBDatabase, b: string, c: number): Promise < void > => {
  return new Promise((d, e) => {
    const f = a.transaction([b], "readwrite").objectStore(b);
    const g = f.delete(c);
    g.onsuccess = () => d();
    g.onerror = (h) => e(h);
  });
};

export const cl_D_B = (a: IDBDatabase): void => {
  a.close();
};

export const d_D_BD = (a: string): Promise < void > => {
  return new Promise((b, c) => {
    const d = indexedDB.deleteDatabase(a);
    d.onsuccess = () => b();
    d.onerror = (e) => c(e);
  });
};

export const i_WS_SP = (): boolean => {
  return "WebSocket" in window;
};

export const c_WS = (a: string): WebSocket => {
  return new WebSocket(a);
};

export const s_WS_ON = (a: WebSocket, b: (c: Event) => void): void => {
  a.onopen = b;
};

export const s_WS_OM = (a: WebSocket, b: (c: MessageEvent) => void): void => {
  a.onmessage = b;
};

export const s_WS_OC = (a: WebSocket, b: (c: CloseEvent) => void): void => {
  a.onclose = b;
};

export const s_WS_OE = (a: WebSocket, b: (c: Event) => void): void => {
  a.onerror = b;
};

export const s_WS_SEND = (a: WebSocket, b: string | ArrayBuffer | Blob): void => {
  a.send(b);
};

export const c_WS_CLOSE = (a: WebSocket, b ? : number, c ? : string): void => {
  a.close(b, c);
};

export const i_SW_SP = (): boolean => {
  return "serviceWorker" in navigator;
};

export const r_SW = (a: string): Promise < ServiceWorkerRegistration > => {
  if (i_SW_SP()) {
    return navigator.serviceWorker.register(a);
  }
  return Promise.reject(new Error("NoSW"));
};

export const u_SW = (): Promise < void > => {
  if (i_SW_SP()) {
    return navigator.serviceWorker.getRegistrations().then((a) => {
      return Promise.all(
        a.map((b) => {
          return b.unregister();
        })
      ).then(() => undefined);
    });
  }
  return Promise.reject(new Error("NoSW"));
};

export const s_SW_MS = (a: any): void => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(a);
  }
};

export const a_SW_MS = (a: (b: MessageEvent) => void): void => {
  if (i_SW_SP()) {
    navigator.serviceWorker.addEventListener("message", a);
  }
};

export const r_SW_MS = (a: (b: MessageEvent) => void): void => {
  if (i_SW_SP()) {
    navigator.serviceWorker.removeEventListener("message", a);
  }
};

export const c_IDB = (a: string, b: number, c: (d: IDBDatabase) => void): Promise < IDBDatabase > => {
  return new Promise((d, e) => {
    const f = indexedDB.open(a, b);
    f.onupgradeneeded = (g) => {
      c(f.result);
    };
    f.onsuccess = () => d(f.result);
    f.onerror = (g) => e(g);
  });
};

export const i_IDB_OS = (a: IDBDatabase, b: string, c: {
  keyPath: string;
  autoIncrement ? : boolean
}): IDBObjectStore => {
  return a.createObjectStore(b, c);
};

export const g_IDB_TR = (a: IDBDatabase, b: string[], c: IDBTransactionMode): IDBTransaction => {
  return a.transaction(b, c);
};

export const g_IDB_OS = (a: IDBTransaction, b: string): IDBObjectStore => {
  return a.objectStore(b);
};

export const i_IDB_DATA = (a: IDBObjectStore, b: any): Promise < any > => {
  return new Promise((c, d) => {
    const e = a.add(b);
    e.onsuccess = () => c(e.result);
    e.onerror = (f) => d(f);
  });
};

export const g_IDB_DATA = (a: IDBObjectStore, b: IDBValidKey): Promise < any > => {
  return new Promise((c, d) => {
    const e = a.get(b);
    e.onsuccess = () => c(e.result);
    e.onerror = (f) => d(f);
  });
};

export const u_IDB_DATA = (a: IDBObjectStore, b: any): Promise < any > => {
  return new Promise((c, d) => {
    const e = a.put(b);
    e.onsuccess = () => c(e.result);
    e.onerror = (f) => d(f);
  });
};

export const d_IDB_DATA = (a: IDBObjectStore, b: IDBValidKey): Promise < void > => {
  return new Promise((c, d) => {
    const e = a.delete(b);
    e.onsuccess = () => c();
    e.onerror = (f) => d(f);
  });
};

export const cL_IDB_OS = (a: IDBObjectStore): Promise < void > => {
  return new Promise((b, c) => {
    const d = a.clear();
    d.onsuccess = () => b();
    d.onerror = (e) => c(e);
  });
};

export const g_ALL_IDB = (a: IDBObjectStore): Promise < any[] > => {
  return new Promise((b, c) => {
    const d = a.getAll();
    d.onsuccess = () => b(d.result);
    d.onerror = (e) => c(e);
  });
};

export const a_T_E = (a: HTMLElement, b: string, c: Function, d ? : AddEventListenerOptions): void => {
  a.addEventListener(b, c as EventListener, d);
};

export const r_T_E = (a: HTMLElement, b: string, c: Function, d ? : EventListenerOptions): void => {
  a.removeEventListener(b, c as EventListener, d);
};

export const d_T_E = (a: HTMLElement, b: string, c ? : CustomEventInit): void => {
  a.dispatchEvent(new CustomEvent(b, c));
};

export const i_WEB_A = (): boolean => {
  return "WebGLRenderingContext" in window;
};

export const c_GL_C = (a: HTMLCanvasElement): WebGLRenderingContext | null => {
  return a.getContext("webgl") || a.getContext("experimental-webgl");
};

export const r_GL_SH = (a: WebGLRenderingContext, b: string, c: number): WebGLShader | null => {
  const d = a.createShader(c);
  if (!d) return null;
  a.shaderSource(d, b);
  a.compileShader(d);
  if (!a.getShaderParameter(d, a.COMPILE_STATUS)) {
    console.error("SHADER_ERROR", a.getShaderInfoLog(d));
    a.deleteShader(d);
    return null;
  }
  return d;
};

export const c_GL_PG = (a: WebGLRenderingContext, b: WebGLShader, c: WebGLShader): WebGLProgram | null => {
  const d = a.createProgram();
  if (!d) return null;
  a.attachShader(d, b);
  a.attachShader(d, c);
  a.linkProgram(d);
  if (!a.getProgramParameter(d, a.LINK_STATUS)) {
    console.error("PRGM_ERROR", a.getProgramInfoLog(d));
    a.deleteProgram(d);
    return null;
  }
  return d;
};

export const c_GL_BUF = (a: WebGLRenderingContext, b: number[]): WebGLBuffer | null => {
  const c = a.createBuffer();
  if (!c) return null;
  a.bindBuffer(a.ARRAY_BUFFER, c);
  a.bufferData(a.ARRAY_BUFFER, new Float32Array(b), a.STATIC_DRAW);
  return c;
};

export const s_GL_VP = (a: WebGLRenderingContext, b: number, c: number, d: number, e: number): void => {
  a.viewport(b, c, d, e);
};

export const c_GL_CLR = (a: WebGLRenderingContext, b: number, c: number, d: number, e: number): void => {
  a.clearColor(b, c, d, e);
  a.clear(a.COLOR_BUFFER_BIT);
};

export const d_GL_ARR = (a: WebGLRenderingContext, b: number, c: number, d: number): void => {
  a.drawArrays(b, c, d);
};

export const a_GL_VTX = (a: WebGLRenderingContext, b: WebGLProgram, c: string, d: number, e: number, f: number): void => {
  const g = a.getAttribLocation(b, c);
  a.vertexAttribPointer(g, d, a.FLOAT, false, e, f);
  a.enableVertexAttribArray(g);
};

export const s_GL_TX = (a: WebGLRenderingContext, b: WebGLProgram, c: string, d: WebGLTexture, e: number): void => {
  const f = a.getUniformLocation(b, c);
  a.activeTexture(a.TEXTURE0 + e);
  a.bindTexture(a.TEXTURE_2D, d);
  a.uniform1i(f, e);
};

export const c_GL_TX = (a: WebGLRenderingContext, b: number, c: number, d: ImageData): WebGLTexture | null => {
  const e = a.createTexture();
  if (!e) return null;
  a.bindTexture(a.TEXTURE_2D, e);
  a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, b, c, 0, a.RGBA, a.UNSIGNED_BYTE, d.data);
  a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
  a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE);
  a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE);
  return e;
};

export const a_GL_PM = (a: WebGLRenderingContext, b: WebGLProgram): void => {
  a.useProgram(b);
};

export const s_GL_UF = (a: WebGLRenderingContext, b: WebGLProgram, c: string, d: number[]): void => {
  const e = a.getUniformLocation(b, c);
  a.uniform1fv(e, new Float32Array(d));
};

export const s_GL_UM = (a: WebGLRenderingContext, b: WebGLProgram, c: string, d: number[]): void => {
  const e = a.getUniformLocation(b, c);
  a.uniformMatrix4fv(e, false, new Float32Array(d));
};

export const d_GL_RES = (a: WebGLRenderingContext, b: WebGLProgram, c: WebGLShader, d: WebGLShader, e: WebGLBuffer, f: WebGLTexture | null): void => {
  if (f) a.deleteTexture(f);
  if (e) a.deleteBuffer(e);
  if (c) a.deleteShader(c);
  if (d) a.deleteShader(d);
  if (b) a.deleteProgram(b);
};

export const g_PI = (): number => {
  return Math.PI;
};

export const g_E = (): number => {
  return Math.E;
};

export const g_LN2 = (): number => {
  return Math.LN2;
};

export const g_LN10 = (): number => {
  return Math.LN10;
};

export const g_LOG2E = (): number => {
  return Math.LOG2E;
};

export const g_LOG10E = (): number => {
  return Math.LOG10E;
};

export const g_SQRT2 = (): number => {
  return Math.SQRT2;
};

export const g_SQRT1_2 = (): number => {
  return Math.SQRT1_2;
};

export const c_COS = (a: number): number => {
  return Math.cos(a);
};

export const c_SIN = (a: number): number => {
  return Math.sin(a);
};

export const c_TAN = (a: number): number => {
  return Math.tan(a);
};

export const c_ACOS = (a: number): number => {
  return Math.acos(a);
};

export const c_ASIN = (a: number): number => {
  return Math.asin(a);
};

export const c_ATAN = (a: number): number => {
  return Math.atan(a);
};

export const c_ATAN2 = (a: number, b: number): number => {
  return Math.atan2(a, b);
};

export const c_CEIL = (a: number): number => {
  return Math.ceil(a);
};

export const c_FLOOR = (a: number): number => {
  return Math.floor(a);
};

export const c_ROUND = (a: number): number => {
  return Math.round(a);
};

export const c_TRUNC = (a: number): number => {
  return Math.trunc(a);
};

export const c_EXP = (a: number): number => {
  return Math.exp(a);
};

export const c_LOG = (a: number): number => {
  return Math.log(a);
};

export const c_LOG10 = (a: number): number => {
  return Math.log10(a);
};

export const c_LOG2 = (a: number): number => {
  return Math.log2(a);
};

export const c_MAX = (...a: number[]): number => {
  return Math.max(...a);
};

export const c_MIN = (...a: number[]): number => {
  return Math.min(...a);
};

export const c_RAND = (): number => {
  return Math.random();
};

export const c_SQRT = (a: number): number => {
  return Math.sqrt(a);
};

export const c_CBRT = (a: number): number => {
  return Math.cbrt(a);
};

export const c_HYPOT = (...a: number[]): number => {
  return Math.hypot(...a);
};

export const c_SGN = (a: number): number => {
  return Math.sign(a);
};

export const c_CLZ32 = (a: number): number => {
  return Math.clz32(a);
};

export const c_IMUL = (a: number, b: number): number => {
  return Math.imul(a, b);
};

export const c_FROUND = (a: number): number => {
  return Math.fround(a);
};

export const c_DEG_RAD = (a: number): number => {
  return a * (Math.PI / 180);
};

export const c_RAD_DEG = (a: number): number => {
  return a * (180 / Math.PI);
};

export const c_VEC_LEN = (a: number, b: number): number => {
  return Math.sqrt(a * a + b * b);
};

export const c_VEC_LEN3 = (a: number, b: number, c: number): number => {
  return Math.sqrt(a * a + b * b + c * c);
};

export const g_R_N = (a: number, b: number, c: number = 0): number => {
  const d = Math.pow(10, c);
  return Math.round((Math.random() * (b - a) + a) * d) / d;
};

export const s_E_P = (a: number[]): number => {
  const b = a.reduce((c, d) => c + d, 0);
  return b / a.length;
};

export const s_M_N = (a: number[]): number => {
  const b = a.slice().sort((c, d) => c - d);
  const c = Math.floor(b.length / 2);
  return b.length % 2 === 0 ? (b[c - 1] + b[c]) / 2 : b[c];
};

export const s_M_D = (a: number[]): number => {
  const b = s_E_P(a);
  const c = Math.sqrt(a.map((d) => Math.pow(d - b, 2)).reduce((d, e) => d + e, 0) / a.length);
  return c;
};

export const s_V_N = (a: number[]): number => {
  const b = s_E_P(a);
  const c = a.map((d) => Math.pow(d - b, 2)).reduce((d, e) => d + e, 0) / a.length;
  return c;
};

export const s_MAX = (a: number[]): number => {
  return Math.max(...a);
};

export const s_MIN = (a: number[]): number => {
  return Math.min(...a);
};

export const c_AR_SUM = (a: number[]): number => {
  return a.reduce((b, c) => b + c, 0);
};

export const c_AR_PROD = (a: number[]): number => {
  return a.reduce((b, c) => b * c, 1);
};

export const c_AR_UNI = (a: any[]): any[] => {
  return [...new Set(a)];
};

export const c_AR_INT = (a: any[], b: any[]): any[] => {
  return a.filter((c) => b.includes(c));
};

export const c_AR_DIF = (a: any[], b: any[]): any[] => {
  return a.filter((c) => !b.includes(c));
};

export const c_AR_SYM_DIF = (a: any[], b: any[]): any[] => {
  const c = new Set(a);
  const d = new Set(b);
  return [...a.filter((e) => !d.has(e)), ...b.filter((e) => !c.has(e))];
};

export const c_AR_CHNK = (a: any[], b: number): any[][] => {
  const c = [];
  for (let d = 0; d < a.length; d += b) {
    c.push(a.slice(d, d + b));
  }
  return c;
};

export const c_AR_FLAT = (a: any[][]): any[] => {
  return ([] as any[]).concat(...a);
};

export const c_AR_DP = < T > (a: T[]): T[] => {
  return JSON.parse(JSON.stringify(a));
};

export const c_AR_RM_IDX = (a: any[], b: number): any[] => {
  return a.filter((c, d) => d !== b);
};

export const c_AR_RM_VAL = (a: any[], b: any): any[] => {
  return a.filter((c) => c !== b);
};

export const c_AR_GRP = (a: any[], b: string): Record<string, any[]> => {
  return a.reduce((c, d) => {
    const e = d[b];
    if (!c[e]) {
      c[e] = [];
    }
    c[e].push(d);
    return c;
  }, {});
};

export const c_AR_OBJ = (a: any[], b: string, c: string): Record<string, any> => {
  return a.reduce((d, e) => {
    d[e[b]] = e[c];
    return d;
  }, {});
};

export const c_AR_RND = (a: any[]): any[] => {
  return [...a].sort(() => Math.random() - 0.5);
};

export const c_AR_SRT_NUM = (a: number[]): number[] => {
  return [...a].sort((b, c) => b - c);
};

export const c_AR_SRT_STR = (a: string[]): string[] => {
  return [...a].sort((b, c) => b.localeCompare(c));
};

export const c_AR_SRT_OBJ = (a: any[], b: string, c: boolean = false): any[] => {
  return [...a].sort((d, e) => {
    const f = d[b];
    const g = e[b];
    if (f < g) return c ? 1 : -1;
    if (f > g) return c ? -1 : 1;
    return 0;
  });
};

export const c_DT_TO_STR = (a: Date, b: string = "YYYY-MM-DD HH:mm:ss"): string => {
  const c = {
    YYYY: a.getFullYear().toString(),
    MM: (a.getMonth() + 1).toString().padStart(2, "0"),
    DD: a.getDate().toString().padStart(2, "0"),
    HH: a.getHours().toString().padStart(2, "0"),
    mm: a.getMinutes().toString().padStart(2, "0"),
    ss: a.getSeconds().toString().padStart(2, "0"),
  };
  let d = b;
  for (const e in c) {
    d = d.replace(new RegExp(e, "g"), c[e]);
  }
  return d;
};

export const c_STR_TO_DT = (a: string): Date => {
  return new Date(a);
};

export const c_DT_ADD_DAY = (a: Date, b: number): Date => {
  const c = new Date(a);
  c.setDate(c.getDate() + b);
  return c;
};

export const c_DT_ADD_MON = (a: Date, b: number): Date => {
  const c = new Date(a);
  c.setMonth(c.getMonth() + b);
  return c;
};

export const c_DT_ADD_YR = (a: Date, b: number): Date => {
  const c = new Date(a);
  c.setFullYear(c.getFullYear() + b);
  return c;
};

export const c_DT_DIF_DAY = (a: Date, b: Date): number => {
  const c = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((a.getTime() - b.getTime()) / c));
};

export const c_DT_ISO = (a: Date): string => {
  return a.toISOString();
};

export const c_DT_LOC = (a: Date): string => {
  return a.toLocaleString();
};

export const c_DT_UTC = (a: Date): string => {
  return a.toUTCString();
};

export const c_DT_GET_YR = (a: Date): number => {
  return a.getFullYear();
};

export const c_DT_GET_MON = (a: Date): number => {
  return a.getMonth() + 1;
};

export const c_DT_GET_DAY = (a: Date): number => {
  return a.getDate();
};

export const c_DT_GET_HR = (a: Date): number => {
  return a.getHours();
};

export const c_DT_GET_MIN = (a: Date): number => {
  return a.getMinutes();
};

export const c_DT_GET_SEC = (a: Date): number => {
  return a.getSeconds();
};

export const c_DT_IS_LD = (a: Date): boolean => {
  const b = a.getFullYear();
  return (b % 4 === 0 && b % 100 !== 0) || b % 400 === 0;
};

export const c_DT_IS_V = (a: Date): boolean => {
  return !isNaN(a.getTime());
};

export const c_IMG_L = (a: string): Promise < HTMLImageElement > => {
  return new Promise((b, c) => {
    const d = new Image();
    d.onload = () => b(d);
    d.onerror = c;
    d.src = a;
  });
};

export const c_IMG_TO_BS64 = (a: HTMLImageElement, b: string = "image/png", c: number = 1): string => {
  const d = document.createElement("canvas");
  d.width = a.width;
  d.height = a.height;
  const e = d.getContext("2d");
  if (!e) throw new Error("CanvasCtxErr");
  e.drawImage(a, 0, 0);
  return d.toDataURL(b, c);
};

export const c_IMG_TO_BLB = (a: HTMLImageElement, b: string = "image/png", c: number = 1): Promise < Blob > => {
  return new Promise((d, e) => {
    const f = document.createElement("canvas");
    f.width = a.width;
    f.height = a.height;
    const g = f.getContext("2d");
    if (!g) {
      e(new Error("CanvasCtxErr"));
      return;
    }
    g.drawImage(a, 0, 0);
    f.toBlob((h) => {
      if (h) d(h);
      else e(new Error("ToBlobErr"));
    }, b, c);
  });
};

export const c_C_RE = (a: HTMLCanvasElement, b: string, c: number, d: number, e: number, f: number): void => {
  const g = a.getContext("2d");
  if (g) {
    g.clearRect(b, c, d, e);
  }
};

export const c_C_FL = (a: HTMLCanvasElement, b: string): void => {
  const c = a.getContext("2d");
  if (c) {
    c.fillStyle = b;
    c.fillRect(0, 0, a.width, a.height);
  }
};

export const c_C_TXT = (a: HTMLCanvasElement, b: string, c: number, d: number, e: string = "16px Arial", f: string = "black"): void => {
  const g = a.getContext("2d");
  if (g) {
    g.font = e;
    g.fillStyle = f;
    g.fillText(b, c, d);
  }
};

export const c_C_LN = (a: HTMLCanvasElement, b: number, c: number, d: number, e: number, f: string = "black", g: number = 1): void => {
  const h = a.getContext("2d");
  if (h) {
    h.strokeStyle = f;
    h.lineWidth = g;
    h.beginPath();
    h.moveTo(b, c);
    h.lineTo(d, e);
    h.stroke();
  }
};

export const c_C_CIR = (a: HTMLCanvasElement, b: number, c: number, d: number, e: string = "black", f: boolean = false, g: string = "transparent"): void => {
  const h = a.getContext("2d");
  if (h) {
    h.beginPath();
    h.arc(b, c, d, 0, 2 * Math.PI);
    if (f) {
      h.fillStyle = e;
      h.fill();
    } else {
      h.strokeStyle = e;
      h.stroke();
    }
    if (f && g !== "transparent") {
      h.strokeStyle = g;
      h.stroke();
    }
  }
};

export const c_C_RECT = (a: HTMLCanvasElement, b: number, c: number, d: number, e: number, f: string = "black", g: boolean = false, h: string = "transparent"): void => {
  const i = a.getContext("2d");
  if (i) {
    if (g) {
      i.fillStyle = f;
      i.fillRect(b, c, d, e);
    } else {
      i.strokeStyle = f;
      i.strokeRect(b, c, d, e);
    }
    if (g && h !== "transparent") {
      i.strokeStyle = h;
      i.strokeRect(b, c, d, e);
    }
  }
};

export const c_C_GET_PX = (a: HTMLCanvasElement, b: number, c: number): Uint8ClampedArray | undefined => {
  const d = a.getContext("2d");
  if (d) {
    return d.getImageData(b, c, 1, 1).data;
  }
  return undefined;
};

export const c_C_PUT_PX = (a: HTMLCanvasElement, b: Uint8ClampedArray, c: number, d: number): void => {
  const e = a.getContext("2d");
  if (e) {
    const f = e.createImageData(1, 1);
    f.data.set(b);
    e.putImageData(f, c, d);
  }
};

export const c_C_IMG_D = (a: HTMLCanvasElement, b: HTMLImageElement, c: number, d: number, e ? : number, f ? : number): void => {
  const g = a.getContext("2d");
  if (g) {
    if (e && f) {
      g.drawImage(b, c, d, e, f);
    } else {
      g.drawImage(b, c, d);
    }
  }
};

export const c_AR_S_IDX = (a: any[], b: number, c: number): any[] => {
  const d = [...a];
  const e = d.splice(b, 1)[0];
  d.splice(c, 0, e);
  return d;
};

export const c_AR_ROT = (a: any[], b: number): any[] => {
  const c = [...a];
  if (b === 0) return c;
  if (b > 0) {
    for (let d = 0; d < b; d++) {
      const e = c.shift();
      if (e !== undefined) c.push(e);
    }
  } else {
    for (let d = 0; d < Math.abs(b); d++) {
      const e = c.pop();
      if (e !== undefined) c.unshift(e);
    }
  }
  return c;
};

export const c_AR_DUP = (a: any[], b: number): any[] => {
  const c: any[] = [];
  for (let d = 0; d < b; d++) {
    c.push(...a);
  }
  return c;
};

export const c_AR_FILL = (a: number, b: any): any[] => {
  return new Array(a).fill(b);
};

export const c_AR_RANGE = (a: number, b: number, c: number = 1): number[] => {
  const d: number[] = [];
  for (let e = a; e <= b; e += c) {
    d.push(e);
  }
  return d;
};

export const c_AR_INT_R = (a: number, b: number): number[] => {
  return Array.from({
    length: b - a + 1
  }, (_, c) => a + c);
};

export const c_AR_R_IDX = (a: any[]): number => {
  return Math.floor(Math.random() * a.length);
};

export const c_AR_R_EL = (a: any[]): any => {
  return a[c_AR_R_IDX(a)];
};

export const c_AR_S_SPL = (a: any[], b: number): any[] => {
  return a.slice(b);
};

export const c_AR_S_TAIL = (a: any[], b: number): any[] => {
  return a.slice(-b);
};

export const c_AR_S_HEAD = (a: any[], b: number): any[] => {
  return a.slice(0, b);
};

export const c_AR_IS_E = (a: any[]): boolean => {
  return a.length === 0;
};

export const c_AR_IS_EQ = (a: any[], b: any[]): boolean => {
  if (a.length !== b.length) return false;
  for (let c = 0; c < a.length; c++) {
    if (a[c] !== b[c]) return false;
  }
  return true;
};

export const c_OBJ_MERGE = (a: object, b: object): object => {
  return { ...a,
    ...b
  };
};

export const c_OBJ_DEEP_MERGE = (a: Record<string, any>, b: Record<string, any>): Record<string, any> => {
  const c = { ...a
  };
  for (const d in b) {
    if (Object.prototype.hasOwnProperty.call(b, d)) {
      if (gS_O(b[d]) && Object.prototype.hasOwnProperty.call(c, d) && gS_O(c[d])) {
        c[d] = c_OBJ_DEEP_MERGE(c[d], b[d]);
      } else {
        c[d] = b[d];
      }
    }
  }
  return c;
};

export const c_OBJ_TO_ARR = (a: Record<string, any>): {
  key: string;
  value: any
}[] => {
  return Object.keys(a).map((b) => ({
    key: b,
    value: a[b]
  }));
};

export const c_ARR_TO_OBJ = (a: {
  key: string;
  value: any
}[]): Record<string, any> => {
  return a.reduce((b, c) => {
    b[c.key] = c.value;
    return b;
  }, {});
};

export const c_OBJ_HAS_K = (a: object, b: string): boolean => {
  return Object.prototype.hasOwnProperty.call(a, b);
};

export const c_OBJ_HAS_V = (a: Record<string, any>, b: any): boolean => {
  return Object.values(a).includes(b);
};

export const c_OBJ_RM_K = (a: Record<string, any>, b: string): Record<string, any> => {
  const c = { ...a
  };
  delete c[b];
  return c;
};

export const c_OBJ_PICK = (a: Record<string, any>, b: string[]): Record<string, any> => {
  const c: Record<string, any> = {};
  for (const d of b) {
    if (c_OBJ_HAS_K(a, d)) {
      c[d] = a[d];
    }
  }
  return c;
};

export const c_OBJ_OMIT = (a: Record<string, any>, b: string[]): Record<string, any> => {
  const c = { ...a
  };
  for (const d of b) {
    delete c[d];
  }
  return c;
};

export const c_OBJ_FRZ = < T > (a: T): Readonly < T > => {
  return Object.freeze(a);
};

export const c_OBJ_DEEP_FRZ = < T extends object > (a: T): Readonly < T > => {
  const b = (obj: any): any => {
    if (gS_O(obj) && !Object.isFrozen(obj)) {
      Object.keys(obj).forEach((key) => b(obj[key]));
      return Object.freeze(obj);
    }
    return obj;
  };
  return b(a);
};

export const c_OBJ_FLATTEN = (a: Record<string, any>, b: string = ""): Record<string, any> => {
  let c: Record<string, any> = {};
  for (const d in a) {
    if (!Object.prototype.hasOwnProperty.call(a, d)) continue;
    const e = b ? `${b}.${d}` : d;
    if (gS_O(a[d]) && !gS_A(a[d])) {
      c = { ...c,
        ...c_OBJ_FLATTEN(a[d], e)
      };
    } else {
      c[e] = a[d];
    }
  }
  return c;
};

export const c_OBJ_UNFLATTEN = (a: Record<string, any>): Record<string, any> => {
  const b: Record<string, any> = {};
  for (const c in a) {
    if (!Object.prototype.hasOwnProperty.call(a, c)) continue;
    const d = c.split(".");
    let e = b;
    for (let f = 0; f < d.length - 1; f++) {
      if (!e[d[f]] || !gS_O(e[d[f]])) {
        e[d[f]] = {};
      }
      e = e[d[f]];
    }
    e[d[d.length - 1]] = a[c];
  }
  return b;
};

export const c_STR_HASH = (a: string): string => {
  let b = 0;
  let c = a.length;
  while (c > 0) {
    b = (b << 5) - b + a.charCodeAt(--c);
  }
  return b.toString(16);
};

export const c_STR_RAND = (a: number): string => {
  return Math.random().toString(36).substring(2, 2 + a);
};

export const c_STR_TEMP = (a: string, b: Record<string, string>): string => {
  let c = a;
  for (const d in b) {
    c = c.replace(new RegExp(`\\$\\{${d}\\}`, "g"), b[d]);
  }
  return c;
};

export const c_STR_CNT = (a: string, b: string): number => {
  return (a.match(new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
};

export const c_STR_PAL = (a: string): boolean => {
  const b = sS_TR(sS_TL(a));
  const c = sS_S(b);
  return b === c;
};

export const c_STR_ANAG = (a: string, b: string): boolean => {
  const c = sS_TR(sS_TL(a)).split("").sort().join("");
  const d = sS_TR(sS_TL(b)).split("").sort().join("");
  return c === d;
};

export const c_STR_ALPHA = (a: string): boolean => {
  return /^[a-zA-Z]*$/.test(a);
};

export const c_STR_ALNUM = (a: string): boolean => {
  return /^[a-zA-Z0-9]*$/.test(a);
};

export const c_STR_NUM = (a: string): boolean => {
  return /^[0-9]*$/.test(a);
};

export const c_STR_SPCL = (a: string): boolean => {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(a);
};

export const c_STR_REP_FIRST = (a: string, b: string, c: string): string => {
  return a.replace(b, c);
};

export const c_STR_REP_LAST = (a: string, b: string, c: string): string => {
  const d = a.lastIndexOf(b);
  if (d === -1) return a;
  return a.substring(0, d) + c + a.substring(d + b.length);
};

export const c_STR_TR_LF = (a: string): string => {
  return a.replace(/^\s+/, "");
};

export const c_STR_TR_RT = (a: string): string => {
  return a.replace(/\s+$/, "");
};

export const c_NUM_IS_E = (a: number): boolean => {
  return a % 2 === 0;
};

export const c_NUM_IS_O = (a: number): boolean => {
  return a % 2 !== 0;
};

export const c_NUM_IS_P = (a: number): boolean => {
  return a > 0;
};

export const c_NUM_IS_N = (a: number): boolean => {
  return a < 0;
};

export const c_NUM_IS_Z = (a: number): boolean => {
  return a === 0;
};

export const c_NUM_FRMT_COMM = (a: number): string => {
  return a.toLocaleString();
};

export const c_NUM_FRMT_CURR = (a: number, b: string, c: string = "en-US"): string => {
  return new Intl.NumberFormat(c, {
    style: "currency",
    currency: b
  }).format(a);
};

export const c_NUM_FRMT_PCT = (a: number, b: string = "en-US"): string => {
  return new Intl.NumberFormat(b, {
    style: "percent"
  }).format(a);
};

export const c_NUM_FRMT_DEC = (a: number, b: number = 2): string => {
  return a.toFixed(b);
};

export const c_NUM_RND_UP = (a: number): number => {
  return Math.ceil(a);
};

export const c_NUM_RND_DN = (a: number): number => {
  return Math.floor(a);
};

export const c_NUM_TRC = (a: number): number => {
  return Math.trunc(a);
};

export const c_NUM_IS_INT = (a: number): boolean => {
  return Number.isInteger(a);
};

export const c_NUM_IS_FLT = (a: number): boolean => {
  return !Number.isInteger(a);
};

export const c_NUM_IN_R = (a: number, b: number, c: number): boolean => {
  return a >= b && a <= c;
};

export const c_NUM_L_P = (a: number): boolean => {
  if (a < 2) return false;
  for (let b = 2; b <= Math.sqrt(a); b++) {
    if (a % b === 0) return false;
  }
  return true;
};

export const c_FN_DEB = (a: Function, b: number): Function => {
  let c: ReturnType < typeof setTimeout > ;
  return function(this: any, ...d: any[]) {
    clearTimeout(c);
    c = setTimeout(() => a.apply(this, d), b);
  };
};

export const c_FN_THR = (a: Function, b: number): Function => {
  let c = false;
  return function(this: any, ...d: any[]) {
    if (!c) {
      a.apply(this, d);
      c = true;
      setTimeout(() => (c = false), b);
    }
  };
};

export const c_FN_MEM = (a: Function): Function => {
  const b: Record<string, any> = {};
  return function(...c: any[]) {
    const d = pJ(c);
    if (b[d]) {
      return b[d];
    }
    const e = a.apply(this, c);
    b[d] = e;
    return e;
  };
};

export const c_FN_CMP = (...a: Function[]): Function => {
  return function(this: any, b: any) {
    return a.reduce((c, d) => d.call(this, c), b);
  };
};

export const c_FN_PIPE = (...a: Function[]): Function => {
  return function(this: any, b: any) {
    return a.reduce((c, d) => d.call(this, c), b);
  };
};

export const c_FN_PART = (a: Function, ...b: any[]): Function => {
  return function(this: any, ...c: any[]) {
    return a.apply(this, [...b, ...c]);
  };
};

export const c_FN_CRRY = (a: Function): Function => {
  const b = a.length;
  const c = (...args: any[]): Function =>
    args.length >= b ?
    a(...args) :
    (...moreArgs: any[]) => c(...args, ...moreArgs);
  return c;
};

export const c_FN_Y = (a: (b: Function) => Function): Function => {
  return ((b: Function) => a((c: Function) => b(b)(c)))((b: Function) => a((c: Function) => b(b)(c)));
};

export const c_FN_REC = (a: Function): Function => {
  return c_FN_Y((b: Function) => (...args: any[]) => a(b, ...args));
};

export const c_FN_RETRY = async (a: Function, b: number = 3, c: number = 1000): Promise < any > => {
  let d = 0;
  while (true) {
    try {
      return await a();
    } catch (e) {
      d++;
      if (d >= b) {
        throw e;
      }
      await tS(c * d);
    }
  }
};

export const c_FN_T_O = async (a: Promise < any > , b: number): Promise < any > => {
  let c = setTimeout(() => {}, 0);
  const d = new Promise((e, f) => {
    c = setTimeout(() => {
      f(new Error("TimeOut"));
    }, b);
  });
  return Promise.race([a, d]).finally(() => clearTimeout(c));
};

export const c_PR_ALL = (a: Promise < any > []): Promise < any[] > => {
  return Promise.all(a);
};

export const c_PR_RACE = (a: Promise < any > []): Promise < any > => {
  return Promise.race(a);
};

export const c_PR_ALL_ST = (a: Promise < any > []): Promise < any[] > => {
  return Promise.allSettled(a);
};

export const c_PR_ANY = (a: Promise < any > []): Promise < any > => {
  return Promise.any(a);
};

export const c_PR_DEL = (a: number): Promise < void > => {
  return new Promise((b) => setTimeout(b, a));
};

export const c_PR_R_VAL = (a: any): Promise < any > => {
  return Promise.resolve(a);
};

export const c_PR_R_ERR = (a: any): Promise < any > => {
  return Promise.reject(a);
};

export const c_PR_F_E = async (a: Promise < any > ): Promise < any > => {
  try {
    return await a;
  } catch (b) {
    return b;
  }
};

export const c_PR_A_THEN = (a: Promise < any > , b: Function, c ? : Function): Promise < any > => {
  return a.then(b, c);
};

export const c_PR_A_CATCH = (a: Promise < any > , b: Function): Promise < any > => {
  return a.catch(b);
};

export const c_PR_A_FINAL = (a: Promise < any > , b: Function): Promise < any > => {
  return a.finally(b);
};

export const c_EV_DRG = (a: HTMLElement, b: (c: MouseEvent) => void, c: (d: MouseEvent) => void, d: (e: MouseEvent) => void): Function => {
  let e = false;
  const f = (g: MouseEvent) => {
    e = true;
    b(g);
  };
  const g = (h: MouseEvent) => {
    if (e) c(h);
  };
  const h = (i: MouseEvent) => {
    if (e) d(i);
    e = false;
  };
  a.addEventListener("mousedown", f);
  window.addEventListener("mousemove", g);
  window.addEventListener("mouseup", h);
  return () => {
    a.removeEventListener("mousedown", f);
    window.removeEventListener("mousemove", g);
    window.removeEventListener("mouseup", h);
  };
};

export const c_EV_SWP = (a: HTMLElement, b: Function, c: Function, d: Function, e: Function): Function => {
  let f = {
    x: 0,
    y: 0
  };
  let g = {
    x: 0,
    y: 0
  };

  const h = (i: TouchEvent) => {
    f = {
      x: i.touches[0].clientX,
      y: i.touches[0].clientY
    };
  };

  const i = (j: TouchEvent) => {
    g = {
      x: j.touches[0].clientX,
      y: j.touches[0].clientY
    };
  };

  const j = () => {
    const k = f.x - g.x;
    const l = f.y - g.y;

    if (Math.abs(k) > Math.abs(l)) {
      if (k > 0) e(); // Swipe Left
      else d(); // Swipe Right
    } else {
      if (l > 0) c(); // Swipe Up
      else b(); // Swipe Down
    }
  };

  a.addEventListener("touchstart", h);
  a.addEventListener("touchmove", i);
  a.addEventListener("touchend", j);

  return () => {
    a.removeEventListener("touchstart", h);
    a.removeEventListener("touchmove", i);
    a.removeEventListener("touchend", j);
  };
};

export const c_EV_CLIP = (a: HTMLElement, b: Function): Function => {
  const c = (d: ClipboardEvent) => {
    b(d.clipboardData?.getData("text"));
  };
  a.addEventListener("paste", c);
  return () => a.removeEventListener("paste", c);
};

export const c_EV_KEY_D = (a: string, b: Function, c: boolean = false): Function => {
  const d = (e: KeyboardEvent) => {
    if (e.key === a && (c ? e.ctrlKey || e.metaKey : true)) {
      b(e);
    }
  };
  window.addEventListener("keydown", d);
  return () => window.removeEventListener("keydown", d);
};

export const c_EV_KEY_U = (a: string, b: Function, c: boolean = false): Function => {
  const d = (e: KeyboardEvent) => {
    if (e.key === a && (c ? e.ctrlKey || e.metaKey : true)) {
      b(e);
    }
  };
  window.addEventListener("keyup", d);
  return () => window.removeEventListener("keyup", d);
};

export const c_EV_OUT_CL = (a: HTMLElement, b: Function): Function => {
  const c = (d: MouseEvent) => {
    if (!a.contains(d.target as Node)) {
      b(d);
    }
  };
  document.addEventListener("mousedown", c);
  return () => document.removeEventListener("mousedown", c);
};

export const c_EV_IN_CL = (a: HTMLElement, b: Function): Function => {
  const c = (d: MouseEvent) => {
    if (a.contains(d.target as Node)) {
      b(d);
    }
  };
  document.addEventListener("click", c);
  return () => document.removeEventListener("click", c);
};

export const c_EV_M_ENT = (a: HTMLElement, b: Function): Function => {
  const c = (d: MouseEvent) => b(d);
  a.addEventListener("mouseenter", c);
  return () => a.removeEventListener("mouseenter", c);
};

export const c_EV_M_LV = (a: HTMLElement, b: Function): Function => {
  const c = (d: MouseEvent) => b(d);
  a.addEventListener("mouseleave", c);
  return () => a.removeEventListener("mouseleave", c);
};

export const c_EV_M_MV = (a: HTMLElement, b: Function): Function => {
  const c = (d: MouseEvent) => b(d);
  a.addEventListener("mousemove", c);
  return () => a.removeEventListener("mousemove", c);
};

export const c_EV_RSZ_OB = (a: HTMLElement, b: Function): Function => {
  const c = new ResizeObserver((entries) => {
    for (let entry of entries) {
      b(entry);
    }
  });
  c.observe(a);
  return () => c.unobserve(a);
};

export const c_EV_INT_OB = (a: HTMLElement, b: Function, c ? : IntersectionObserverInit): Function => {
  const d = new IntersectionObserver((entries) => {
    for (let entry of entries) {
      b(entry);
    }
  }, c);
  d.observe(a);
  return () => d.unobserve(a);
};

export const c_EV_MUT_OB = (a: Node, b: Function, c ? : MutationObserverInit): Function => {
  const d = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      b(mutation);
    }
  });
  d.observe(a, c);
  return () => d.disconnect();
};

export const c_EV_IN_CHG = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): Function => {
  const c = (d: Event) => b((d.target as HTMLInputElement).value);
  a.addEventListener("input", c);
  return () => a.removeEventListener("input", c);
};

export const c_EV_IN_SUB = (a: HTMLFormElement, b: Function): Function => {
  const c = (d: Event) => {
    d.preventDefault();
    b(new FormData(a));
  };
  a.addEventListener("submit", c);
  return () => a.removeEventListener("submit", c);
};

export const c_V_E_M_A = (a: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a);
};

export const c_V_P_N_A = (a: string): boolean => {
  return /^\+?(\d[\d\s-]{8,}\d)$/.test(a);
};

export const c_V_U_R_L = (a: string): boolean => {
  try {
    new URL(a);
    return true;
  } catch (e) {
    return false;
  }
};

export const c_V_I_P_4 = (a: string): boolean => {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(a);
};

export const c_V_I_P_6 = (a: string): boolean => {
  return /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-fA-F]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|2[0-4][0-9]|[01]{0,1}[0-9]{0,1}[0-9])\.){3,3}(25[0-5]|2[0-4][0-9]|[01]{0,1}[0-9]{0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|2[0-4][0-9]|[01]{0,1}[0-9]{0,1}[0-9])\.){3,3}(25[0-5]|2[0-4][0-9]|[01]{0,1}[0-9]{0,1}[0-9]))/.test(a);
};

export const c_V_D_S = (a: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(a);
};

export const c_V_T_S = (a: string): boolean => {
  return /^\d{2}:\d{2}:\d{2}$/.test(a);
};

export const c_V_DT_S = (a: string): boolean => {
  return c_V_D_S(a.split(" ")[0]) && c_V_T_S(a.split(" ")[1]);
};

export const c_V_PS_S = (a: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(a);
};

export const c_V_CC_N = (a: string): boolean => {
  return /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/.test(a.replace(/\s/g, ""));
};

export const c_V_ZIP = (a: string, b: string = "US"): boolean => {
  if (b === "US") {
    return /^\d{5}(?:[-\s]\d{4})?$/.test(a);
  }
  return true; // Default to true for other countries or implement specific logic
};

export const c_V_ST_CD = (a: string, b: string = "US"): boolean => {
  if (b === "US") {
    const c = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
    return c.includes(a.toUpperCase());
  }
  return true;
};

export const c_V_GT_H = (): boolean => {
  return "requestAnimationFrame" in window;
};

export const c_V_WEB_GL = (): boolean => {
  const a = document.createElement("canvas");
  return !!(a.getContext("webgl") || a.getContext("experimental-webgl"));
};

export const c_V_CAN_V = (): boolean => {
  const a = document.createElement("canvas");
  return !!(a.getContext("2d"));
};

export const c_V_L_S = (): boolean => {
  try {
    const a = "t";
    localStorage.setItem(a, a);
    localStorage.removeItem(a);
    return true;
  } catch (e) {
    return false;
  }
};

export const c_V_S_S = (): boolean => {
  try {
    const a = "t";
    sessionStorage.setItem(a, a);
    sessionStorage.removeItem(a);
    return true;
  } catch (e) {
    return false;
  }
};

export const c_V_CK_E = (): boolean => {
  return navigator.cookieEnabled;
};

export const c_V_PR_JS = (): boolean => {
  try {
    eval('new Function("return class MyClass {}")');
    return true;
  } catch (e) {
    return false;
  }
};

export const c_V_FE_API = (): boolean => {
  return "fetch" in window;
};

export const c_V_WS_API = (): boolean => {
  return "WebSocket" in window;
};

export const c_V_SW_API = (): boolean => {
  return "serviceWorker" in navigator;
};

export const c_V_IDB_API = (): boolean => {
  return "indexedDB" in window;
};

export const c_V_PUSH_API = (): boolean => {
  return "PushManager" in window;
};

export const c_V_NOTIF_API = (): boolean => {
  return "Notification" in window;
};

export const c_V_GEOL_API = (): boolean => {
  return "geolocation" in navigator;
};

export const c_V_CLIP_API = (): boolean => {
  return "clipboard" in navigator;
};

export const c_V_DRAG_API = (): boolean => {
  return "draggable" in document.createElement("span");
};

export const c_V_TOUCH_API = (): boolean => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

export const c_V_VP_API = (): boolean => {
  return "IntersectionObserver" in window;
};

export const c_V_MR_API = (): boolean => {
  return "MutationObserver" in window;
};

export const c_V_RR_API = (): boolean => {
  return "ResizeObserver" in window;
};

export const c_V_PERF_API = (): boolean => {
  return "performance" in window;
};

export const c_V_ENC_API = (): boolean => {
  return "TextEncoder" in window;
};

export const c_V_DEC_API = (): boolean => {
  return "TextDecoder" in window;
};

export const c_V_CR_API = (): boolean => {
  return "crypto" in window;
};

export const c_V_BRO_ID = (): string => {
  const ua = navigator.userAgent;
  let tem;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return "IE " + (tem[1] || "");
  }
  if (M[1] === "Chrome") {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(" ").replace("OPR", "Opera").replace("Edge", "Edge");
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return M.join(" ");
};

export const c_V_OS_ID = (): string => {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "MacOS";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
};

export const c_V_DEV_TY = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk|PSP|V(F|W)|Default/i.test(ua)) return "Mobile";
  return "Desktop";
};

export const c_V_SCR_OR = (): string => {
  if (screen.orientation && screen.orientation.type) {
    return screen.orientation.type;
  }
  if (window.innerHeight > window.innerWidth) {
    return "portrait";
  }
  return "landscape";
};

export const c_V_LANG = (): string => {
  return navigator.language || "en-US";
};

export const c_V_ONL_ST = (): boolean => {
  return navigator.onLine;
};

export const c_F_A_E_B = (a: string): Promise < Blob > => {
  return new Promise((b, c) => {
    fetch(a)
      .then((d) => d.blob())
      .then(b)
      .catch(c);
  });
};

export const c_F_A_E_A = (a: string): Promise < ArrayBuffer > => {
  return new Promise((b, c) => {
    fetch(a)
      .then((d) => d.arrayBuffer())
      .then(b)
      .catch(c);
  });
};

export const c_F_A_E_TX = (a: string): Promise < string > => {
  return new Promise((b, c) => {
    fetch(a)
      .then((d) => d.text())
      .then(b)
      .catch(c);
  });
};

export const c_F_A_E_JS = (a: string): Promise < any > => {
  return new Promise((b, c) => {
    fetch(a)
      .then((d) => d.json())
      .then(b)
      .catch(c);
  });
};

export const c_F_P_F = (a: string, b: FormData): Promise < any > => {
  return new Promise((c, d) => {
    fetch(a, {
        method: "POST",
        body: b
      })
      .then((e) => e.json())
      .then(c)
      .catch(d);
  });
};

export const c_F_P_J = (a: string, b: any): Promise < any > => {
  return new Promise((c, d) => {
    fetch(a, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(b)
      })
      .then((e) => e.json())
      .then(c)
      .catch(d);
  });
};

export const c_F_P_TX = (a: string, b: string): Promise < string > => {
  return new Promise((c, d) => {
    fetch(a, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: b
      })
      .then((e) => e.text())
      .then(c)
      .catch(d);
  });
};

export const c_F_U_J = (a: string, b: any): Promise < any > => {
  return new Promise((c, d) => {
    fetch(a, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(b)
      })
      .then((e) => e.json())
      .then(c)
      .catch(d);
  });
};

export const c_F_D_J = (a: string): Promise < any > => {
  return new Promise((b, c) => {
    fetch(a, {
        method: "DELETE"
      })
      .then((d) => d.json())
      .then(b)
      .catch(c);
  });
};

export const c_F_P_Q = (a: string, b: Record<string, string>): string => {
  const c = new URLSearchParams(b).toString();
  return `${a}?${c}`;
};

export const c_F_P_H = (a: Record<string, string>): HeadersInit => {
  return new Headers(a);
};

export const c_F_R_S = (a: Response): Promise < string > => {
  return a.text();
};

export const c_F_R_J = (a: Response): Promise < any > => {
  return a.json();
};

export const c_F_R_B = (a: Response): Promise < Blob > => {
  return a.blob();
};

export const c_F_R_AB = (a: Response): Promise < ArrayBuffer > => {
  return a.arrayBuffer();
};

export const c_F_R_OK = (a: Response): boolean => {
  return a.ok;
};

export const c_F_R_ST = (a: Response): number => {
  return a.status;
};

export const c_F_R_ST_TX = (a: Response): string => {
  return a.statusText;
};

export const c_F_C_RQ = (a: string, b: RequestInit): Request => {
  return new Request(a, b);
};

export const c_F_C_RP = (a: BodyInit | null, b: ResponseInit): Response => {
  return new Response(a, b);
};

export const c_L_L_C_URL = (): URL => {
  return new URL(window.location.href);
};

export const c_L_L_S_P = (a: string): void => {
  window.location.pathname = a;
};

export const c_L_L_S_H = (a: string): void => {
  window.location.hash = a;
};

export const c_L_L_S_Q = (a: string): void => {
  window.location.search = a;
};

export const c_L_L_O_N = (a: string): void => {
  window.location.origin = a;
};

export const c_L_L_P_R = (a: string): void => {
  window.location.protocol = a;
};

export const c_L_L_S_A_P = (a: string, b: string): void => {
  const c = new URLSearchParams(window.location.search);
  c.set(a, b);
  window.location.search = c.toString();
};

export const c_L_L_G_P = (a: string): string | null => {
  const b = new URLSearchParams(window.location.search);
  return b.get(a);
};

export const c_L_L_RM_P = (a: string): void => {
  const b = new URLSearchParams(window.location.search);
  b.delete(a);
  window.location.search = b.toString();
};

export const c_L_H_A_S = (a: string): string => {
  return window.history.state;
};

export const c_L_H_P_S = (a: any, b: string, c: string): void => {
  window.history.pushState(a, b, c);
};

export const c_L_H_R_S = (a: any, b: string, c: string): void => {
  window.history.replaceState(a, b, c);
};

export const c_L_H_G_L = (): number => {
  return window.history.length;
};

export const c_L_H_GO = (a: number): void => {
  window.history.go(a);
};

export const c_L_H_BK = (): void => {
  window.history.back();
};

export const c_L_H_FWD = (): void => {
  window.history.forward();
};

export const c_L_H_ADD_L = (a: Function): void => {
  window.addEventListener("popstate", a as EventListener);
};

export const c_L_H_REM_L = (a: Function): void => {
  window.removeEventListener("popstate", a as EventListener);
};

export const c_M_M_CTX = (a: string, b: number, c: number): CanvasRenderingContext2D | null => {
  const d = document.createElement("canvas");
  d.width = b;
  d.height = c;
  return d.getContext(a as "2d");
};

export const c_M_M_CLR = (a: CanvasRenderingContext2D, b: string): void => {
  a.fillStyle = b;
  a.fillRect(0, 0, a.canvas.width, a.canvas.height);
};

export const c_M_M_TXT = (a: CanvasRenderingContext2D, b: string, c: number, d: number, e: string = "16px Arial", f: string = "black"): void => {
  a.font = e;
  a.fillStyle = f;
  a.fillText(b, c, d);
};

export const c_M_M_RECT = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: number, f: string = "black", g: boolean = false): void => {
  if (g) {
    a.fillStyle = f;
    a.fillRect(b, c, d, e);
  } else {
    a.strokeStyle = f;
    a.strokeRect(b, c, d, e);
  }
};

export const c_M_M_CIR = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: string = "black", f: boolean = false): void => {
  a.beginPath();
  a.arc(b, c, d, 0, 2 * Math.PI);
  if (f) {
    a.fillStyle = e;
    a.fill();
  } else {
    a.strokeStyle = e;
    a.stroke();
  }
};

export const c_M_M_IMG = (a: CanvasRenderingContext2D, b: HTMLImageElement, c: number, d: number, e ? : number, f ? : number): void => {
  if (e && f) {
    a.drawImage(b, c, d, e, f);
  } else {
    a.drawImage(b, c, d);
  }
};

export const c_M_M_PIX_D = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: number): ImageData => {
  return a.getImageData(b, c, d, e);
};

export const c_M_M_PUT_D = (a: CanvasRenderingContext2D, b: ImageData, c: number, d: number): void => {
  a.putImageData(b, c, d);
};

export const c_M_M_SAVE = (a: CanvasRenderingContext2D): void => {
  a.save();
};

export const c_M_M_RSTR = (a: CanvasRenderingContext2D): void => {
  a.restore();
};

export const c_M_M_TRN = (a: CanvasRenderingContext2D, b: number, c: number): void => {
  a.translate(b, c);
};

export const c_M_M_ROT = (a: CanvasRenderingContext2D, b: number): void => {
  a.rotate(b);
};

export const c_M_M_SCL = (a: CanvasRenderingContext2D, b: number, c: number): void => {
  a.scale(b, c);
};

export const c_M_M_F_T = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: number, f: number, g: number): void => {
  a.transform(b, c, d, e, f, g);
};

export const c_M_M_TXT_AL = (a: CanvasRenderingContext2D, b: CanvasTextAlign): void => {
  a.textAlign = b;
};

export const c_M_M_TXT_BL = (a: CanvasRenderingContext2D, b: CanvasTextBaseline): void => {
  a.textBaseline = b;
};

export const c_M_M_SH_CLR = (a: CanvasRenderingContext2D, b: string): void => {
  a.shadowColor = b;
};

export const c_M_M_SH_BL = (a: CanvasRenderingContext2D, b: number): void => {
  a.shadowBlur = b;
};

export const c_M_M_SH_OF_X = (a: CanvasRenderingContext2D, b: number): void => {
  a.shadowOffsetX = b;
};

export const c_M_M_SH_OF_Y = (a: CanvasRenderingContext2D, b: number): void => {
  a.shadowOffsetY = b;
};

export const c_M_M_ALP = (a: CanvasRenderingContext2D, b: number): void => {
  a.globalAlpha = b;
};

export const c_M_M_COMP = (a: CanvasRenderingContext2D, b: GlobalCompositeOperation): void => {
  a.globalCompositeOperation = b;
};

export const c_M_M_L_W = (a: CanvasRenderingContext2D, b: number): void => {
  a.lineWidth = b;
};

export const c_M_M_L_C = (a: CanvasRenderingContext2D, b: CanvasLineCap): void => {
  a.lineCap = b;
};

export const c_M_M_L_J = (a: CanvasRenderingContext2D, b: CanvasLineJoin): void => {
  a.lineJoin = b;
};

export const c_M_M_M_L = (a: CanvasRenderingContext2D, b: number): void => {
  a.miterLimit = b;
};

export const c_M_M_LINE_G = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: number): CanvasGradient => {
  return a.createLinearGradient(b, c, d, e);
};

export const c_M_M_RAD_G = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: number, f: number, g: number): CanvasGradient => {
  return a.createRadialGradient(b, c, d, e, f, g);
};

export const c_M_M_PTT = (a: CanvasRenderingContext2D, b: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, c: CanvasPatternRepetition): CanvasPattern | null => {
  return a.createPattern(b, c);
};

export const c_M_M_PTT_ST = (a: CanvasRenderingContext2D, b: CanvasPattern): void => {
  a.fillStyle = b;
  a.strokeStyle = b;
};

export const c_M_M_GRD_ST = (a: CanvasRenderingContext2D, b: CanvasGradient): void => {
  a.fillStyle = b;
  a.strokeStyle = b;
};

export const c_M_M_CPY_CX = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: number): ImageData => {
  return a.getImageData(b, c, d, e);
};

export const c_M_M_P_CX = (a: CanvasRenderingContext2D, b: ImageData, c: number, d: number): void => {
  a.putImageData(b, c, d);
};

export const c_M_M_ANIM = (a: Function): number => {
  return requestAnimationFrame(a as FrameRequestCallback);
};

export const c_M_M_STOP_ANIM = (a: number): void => {
  cancelAnimationFrame(a);
};

export const c_M_M_CLR_RECT = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: number): void => {
  a.clearRect(b, c, d, e);
};

export const c_M_M_GET_CAN = (a: CanvasRenderingContext2D): HTMLCanvasElement => {
  return a.canvas;
};

export const c_M_M_TO_DATA = (a: CanvasRenderingContext2D, b: string = "image/png", c: number = 1): string => {
  return a.canvas.toDataURL(b, c);
};

export const c_M_M_TO_BLOB = (a: CanvasRenderingContext2D, b: string = "image/png", c: number = 1): Promise < Blob | null > => {
  return new Promise((d) => {
    a.canvas.toBlob(d, b, c);
  });
};

export const c_M_M_SET_W = (a: CanvasRenderingContext2D, b: number): void => {
  a.canvas.width = b;
};

export const c_M_M_SET_H = (a: CanvasRenderingContext2D, b: number): void => {
  a.canvas.height = b;
};

export const c_M_M_GET_W = (a: CanvasRenderingContext2D): number => {
  return a.canvas.width;
};

export const c_M_M_GET_H = (a: CanvasRenderingContext2D): number => {
  return a.canvas.height;
};

export const c_M_M_ADD_GRAD_CLR = (a: CanvasGradient, b: number, c: string): void => {
  a.addColorStop(b, c);
};

export const c_M_M_SET_ALPHA_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `alpha(opacity=${b * 100})`;
};

export const c_M_M_SET_BLUR_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `blur(${b}px)`;
};

export const c_M_M_SET_BRIGHT_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `brightness(${b}%)`;
};

export const c_M_M_SET_CON_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `contrast(${b}%)`;
};

export const c_M_M_SET_DROP_SH_FIL = (a: CanvasRenderingContext2D, b: string): void => {
  a.filter = `drop-shadow(${b})`;
};

export const c_M_M_SET_GRAY_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `grayscale(${b}%)`;
};

export const c_M_M_SET_HUE_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `hue-rotate(${b}deg)`;
};

export const c_M_M_SET_INV_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `invert(${b}%)`;
};

export const c_M_M_SET_OPA_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `opacity(${b}%)`;
};

export const c_M_M_SET_SEP_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `sepia(${b}%)`;
};

export const c_M_M_SET_SAT_FIL = (a: CanvasRenderingContext2D, b: number): void => {
  a.filter = `saturate(${b}%)`;
};

export const c_M_M_SET_SHADOW = (a: CanvasRenderingContext2D, b: number, c: number, d: number, e: string): void => {
  a.shadowOffsetX = b;
  a.shadowOffsetY = c;
  a.shadowBlur = d;
  a.shadowColor = e;
};

export const c_M_M_SET_LINE_DASH = (a: CanvasRenderingContext2D, b: number[]): void => {
  a.setLineDash(b);
};

export const c_M_M_GET_LINE_DASH = (a: CanvasRenderingContext2D): number[] => {
  return a.getLineDash();
};

export const c_M_M_SET_DASH_OFF = (a: CanvasRenderingContext2D, b: number): void => {
  a.lineDashOffset = b;
};

export const c_M_M_IS_P_IN = (a: CanvasRenderingContext2D, b: number, c: number): boolean => {
  return a.isPointInPath(b, c);
};

export const c_M_M_IS_S_IN = (a: CanvasRenderingContext2D, b: number, c: number): boolean => {
  return a.isPointInStroke(b, c);
};

export const c_M_M_MEAS_TXT = (a: CanvasRenderingContext2D, b: string): TextMetrics => {
  return a.measureText(b);
};

export const c_M_M_CREATE_EL = (a: string): HTMLElement => {
  return document.createElement(a);
};

export const c_M_M_GET_EL_ID = (a: string): HTMLElement | null => {
  return document.getElementById(a);
};

export const c_M_M_GET_EL_TAG = (a: string): HTMLCollectionOf < HTMLElement > => {
  return document.getElementsByTagName(a);
};

export const c_M_M_GET_EL_CLASS = (a: string): HTMLCollectionOf < Element > => {
  return document.getElementsByClassName(a);
};

export const c_M_M_QUERY_S = (a: string): Element | null => {
  return document.querySelector(a);
};

export const c_M_M_QUERY_S_ALL = (a: string): NodeListOf < Element > => {
  return document.querySelectorAll(a);
};

export const c_M_M_ADD_E_L = (a: Element, b: string, c: EventListenerOrEventListenerObject, d ? : boolean | AddEventListenerOptions): void => {
  a.addEventListener(b, c, d);
};

export const c_M_M_REM_E_L = (a: Element, b: string, c: EventListenerOrEventListenerObject, d ? : boolean | EventListenerOptions): void => {
  a.removeEventListener(b, c, d);
};

export const c_M_M_SET_AT = (a: Element, b: string, c: string): void => {
  a.setAttribute(b, c);
};

export const c_M_M_GET_AT = (a: Element, b: string): string | null => {
  return a.getAttribute(b);
};

export const c_M_M_REM_AT = (a: Element, b: string): void => {
  a.removeAttribute(b);
};

export const c_M_M_HAS_AT = (a: Element, b: string): boolean => {
  return a.hasAttribute(b);
};

export const c_M_M_ADD_CL = (a: Element, b: string): void => {
  a.classList.add(b);
};

export const c_M_M_REM_CL = (a: Element, b: string): void => {
  a.classList.remove(b);
};

export const c_M_M_TOG_CL = (a: Element, b: string): void => {
  a.classList.toggle(b);
};

export const c_M_M_HAS_CL = (a: Element, b: string): boolean => {
  return a.classList.contains(b);
};

export const c_M_M_SET_TX = (a: Element, b: string): void => {
  a.textContent = b;
};

export const c_M_M_GET_TX = (a: Element): string | null => {
  return a.textContent;
};

export const c_M_M_SET_HT = (a: Element, b: string): void => {
  a.innerHTML = b;
};

export const c_M_M_GET_HT = (a: Element): string => {
  return a.innerHTML;
};

export const c_M_M_AP_C = (a: Element, b: Node): void => {
  a.appendChild(b);
};

export const c_M_M_RM_C = (a: Element, b: Node): void => {
  a.removeChild(b);
};

export const c_M_M_INS_BEF = (a: Element, b: Node, c: Node): void => {
  a.insertBefore(b, c);
};

export const c_M_M_INS_AF = (a: Element, b: Node, c: Node): void => {
  if (c.nextSibling) {
    a.insertBefore(b, c.nextSibling);
  } else {
    a.appendChild(b);
  }
};

export const c_M_M_REP_C = (a: Element, b: Node, c: Node): void => {
  a.replaceChild(b, c);
};

export const c_M_M_SET_STY = (a: HTMLElement, b: string, c: string): void => {
  a.style.setProperty(b, c);
};

export const c_M_M_GET_STY = (a: HTMLElement, b: string): string => {
  return a.style.getPropertyValue(b);
};

export const c_M_M_GET_CMP_STY = (a: HTMLElement, b: string): string => {
  return window.getComputedStyle(a).getPropertyValue(b);
};

export const c_M_M_SC_TO_EL = (a: HTMLElement, b ? : ScrollIntoViewOptions): void => {
  a.scrollIntoView(b);
};

export const c_M_M_GET_REC = (a: HTMLElement): DOMRect => {
  return a.getBoundingClientRect();
};

export const c_M_M_GET_SC_T = (a: HTMLElement): number => {
  return a.scrollTop;
};

export const c_M_M_SET_SC_T = (a: HTMLElement, b: number): void => {
  a.scrollTop = b;
};

export const c_M_M_GET_SC_L = (a: HTMLElement): number => {
  return a.scrollLeft;
};

export const c_M_M_SET_SC_L = (a: HTMLElement, b: number): void => {
  a.scrollLeft = b;
};

export const c_M_M_GET_SC_H = (a: HTMLElement): number => {
  return a.scrollHeight;
};

export const c_M_M_GET_SC_W = (a: HTMLElement): number => {
  return a.scrollWidth;
};

export const c_M_M_GET_CLI_H = (a: HTMLElement): number => {
  return a.clientHeight;
};

export const c_M_M_GET_CLI_W = (a: HTMLElement): number => {
  return a.clientWidth;
};

export const c_M_M_GET_OFF_H = (a: HTMLElement): number => {
  return a.offsetHeight;
};

export const c_M_M_GET_OFF_W = (a: HTMLElement): number => {
  return a.offsetWidth;
};

export const c_M_M_GET_OFF_T = (a: HTMLElement): number => {
  return a.offsetTop;
};

export const c_M_M_GET_OFF_L = (a: HTMLElement): number => {
  return a.offsetLeft;
};

export const c_M_M_GET_P_N = (a: HTMLElement): HTMLElement | null => {
  return a.parentElement;
};

export const c_M_M_GET_C_N = (a: HTMLElement): HTMLCollection => {
  return a.children;
};

export const c_M_M_GET_F_C = (a: HTMLElement): Element | null => {
  return a.firstElementChild;
};

export const c_M_M_GET_L_C = (a: HTMLElement): Element | null => {
  return a.lastElementChild;
};

export const c_M_M_GET_N_S = (a: HTMLElement): Element | null => {
  return a.nextElementSibling;
};

export const c_M_M_GET_P_S = (a: HTMLElement): Element | null => {
  return a.previousElementSibling;
};

export const c_M_M_CREATE_FRAG = (): DocumentFragment => {
  return document.createDocumentFragment();
};

export const c_M_M_CREATE_TX_N = (a: string): Text => {
  return document.createTextNode(a);
};

export const c_M_M_CREATE_CM = (a: string): Comment => {
  return document.createComment(a);
};

export const c_M_M_CLONE_N = (a: Node, b: boolean = true): Node => {
  return a.cloneNode(b);
};

export const c_M_M_CON_ELE = (a: HTMLElement): boolean => {
  return document.contains(a);
};

export const c_M_M_IS_E_V = (a: HTMLElement): boolean => {
  return a.offsetParent !== null;
};

export const c_M_M_GET_ACT_EL = (): Element | null => {
  return document.activeElement;
};

export const c_M_M_H_F_C_O = (a: HTMLElement): boolean => {
  return a === document.activeElement || a.contains(document.activeElement);
};

export const c_M_M_GET_ROOT_EL = (): HTMLElement => {
  return document.documentElement;
};

export const c_M_M_GET_HEAD_EL = (): HTMLHeadElement => {
  return document.head;
};

export const c_M_M_GET_BODY_EL = (): HTMLBodyElement => {
  return document.body;
};

export const c_M_M_PREPEND = (a: Element, b: Node): void => {
  a.prepend(b);
};

export const c_M_M_AFTER = (a: Element, b: Node): void => {
  a.after(b);
};

export const c_M_M_BEFORE = (a: Element, b: Node): void => {
  a.before(b);
};

export const c_M_M_REMOVE = (a: Element): void => {
  a.remove();
};

export const c_M_M_R_C_B = (a: HTMLElement): HTMLCollection => {
  return a.children;
};

export const c_M_M_GET_P = (a: HTMLElement): ParentNode | null => {
  return a.parentNode;
};

export const c_M_M_F_C = (a: HTMLElement): Element | null => {
  return a.firstElementChild;
};

export const c_M_M_L_C = (a: HTMLElement): Element | null => {
  return a.lastElementChild;
};

export const c_M_M_N_SIB = (a: HTMLElement): Element | null => {
  return a.nextElementSibling;
};

export const c_M_M_P_SIB = (a: HTMLElement): Element | null => {
  return a.previousElementSibling;
};

export const c_M_M_SET_DATA = (a: HTMLElement, b: string, c: string): void => {
  a.dataset[b] = c;
};

export const c_M_M_GET_DATA = (a: HTMLElement, b: string): string | undefined => {
  return a.dataset[b];
};

export const c_M_M_DEL_DATA = (a: HTMLElement, b: string): void => {
  delete a.dataset[b];
};

export const c_M_M_GET_C_P = (a: HTMLElement, b: string): Element | null => {
  return a.closest(b);
};

export const c_M_M_SET_HTM = (a: HTMLElement, b: string): void => {
  a.innerHTML = b;
};

export const c_M_M_GET_HTM = (a: HTMLElement): string => {
  return a.innerHTML;
};

export const c_M_M_SET_TX_C = (a: HTMLElement, b: string): void => {
  a.textContent = b;
};

export const c_M_M_GET_TX_C = (a: HTMLElement): string | null => {
  return a.textContent;
};

export const c_M_M_IS_FO = (a: HTMLElement): boolean => {
  return document.activeElement === a;
};

export const c_M_M_FO = (a: HTMLElement): void => {
  a.focus();
};

export const c_M_M_BL = (a: HTMLElement): void => {
  a.blur();
};

export const c_M_M_CONTAINS = (a: Node, b: Node): boolean => {
  return a.contains(b);
};

export const c_M_M_IN_VIEW = (a: HTMLElement): boolean => {
  const rect = a.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const c_M_M_GET_VIEW_W = (): number => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

export const c_M_M_GET_VIEW_H = (): number => {
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
};

export const c_M_M_GET_SC_POS = (): {
  x: number;
  y: number
} => {
  return {
    x: window.scrollX,
    y: window.scrollY
  };
};

export const c_M_M_SET_SC_POS = (a: number, b: number, c ? : ScrollToOptions): void => {
  window.scrollTo({
    left: a,
    top: b,
    ...c
  });
};

export const c_M_M_SC_BY = (a: number, b: number, c ? : ScrollToOptions): void => {
  window.scrollBy({
    left: a,
    top: b,
    ...c
  });
};

export const c_M_M_S_ADD_L = (a: Function): void => {
  window.addEventListener("scroll", a as EventListener);
};

export const c_M_M_S_REM_L = (a: Function): void => {
  window.removeEventListener("scroll", a as EventListener);
};

export const c_M_M_RS_ADD_L = (a: Function): void => {
  window.addEventListener("resize", a as EventListener);
};

export const c_M_M_RS_REM_L = (a: Function): void => {
  window.removeEventListener("resize", a as EventListener);
};

export const c_M_M_LOAD_ADD_L = (a: Function): void => {
  window.addEventListener("load", a as EventListener);
};

export const c_M_M_LOAD_REM_L = (a: Function): void => {
  window.removeEventListener("load", a as EventListener);
};

export const c_M_M_UNLOAD_ADD_L = (a: Function): void => {
  window.addEventListener("unload", a as EventListener);
};

export const c_M_M_UNLOAD_REM_L = (a: Function): void => {
  window.removeEventListener("unload", a as EventListener);
};

export const c_M_M_BEFORE_UNLOAD_ADD_L = (a: Function): void => {
  window.addEventListener("beforeunload", a as EventListener);
};

export const c_M_M_BEFORE_UNLOAD_REM_L = (a: Function): void => {
  window.removeEventListener("beforeunload", a as EventListener);
};

export const c_M_M_CLICK_ADD_L = (a: Function): void => {
  window.addEventListener("click", a as EventListener);
};

export const c_M_M_CLICK_REM_L = (a: Function): void => {
  window.removeEventListener("click", a as EventListener);
};

export const c_M_M_DBLCLICK_ADD_L = (a: Function): void => {
  window.addEventListener("dblclick", a as EventListener);
};

export const c_M_M_DBLCLICK_REM_L = (a: Function): void => {
  window.removeEventListener("dblclick", a as EventListener);
};

export const c_M_M_MOUSEDOWN_ADD_L = (a: Function): void => {
  window.addEventListener("mousedown", a as EventListener);
};

export const c_M_M_MOUSEDOWN_REM_L = (a: Function): void => {
  window.removeEventListener("mousedown", a as EventListener);
};

export const c_M_M_MOUSEUP_ADD_L = (a: Function): void => {
  window.addEventListener("mouseup", a as EventListener);
};

export const c_M_M_MOUSEUP_REM_L = (a: Function): void => {
  window.removeEventListener("mouseup", a as EventListener);
};

export const c_M_M_MOUSEMOVE_ADD_L = (a: Function): void => {
  window.addEventListener("mousemove", a as EventListener);
};

export const c_M_M_MOUSEMOVE_REM_L = (a: Function): void => {
  window.removeEventListener("mousemove", a as EventListener);
};

export const c_M_M_MOUSEOVER_ADD_L = (a: Function): void => {
  window.addEventListener("mouseover", a as EventListener);
};

export const c_M_M_MOUSEOVER_REM_L = (a: Function): void => {
  window.removeEventListener("mouseover", a as EventListener);
};

export const c_M_M_MOUSEOUT_ADD_L = (a: Function): void => {
  window.addEventListener("mouseout", a as EventListener);
};

export const c_M_M_MOUSEOUT_REM_L = (a: Function): void => {
  window.removeEventListener("mouseout", a as EventListener);
};

export const c_M_M_KEYUP_ADD_L = (a: Function): void => {
  window.addEventListener("keyup", a as EventListener);
};

export const c_M_M_KEYUP_REM_L = (a: Function): void => {
  window.removeEventListener("keyup", a as EventListener);
};

export const c_M_M_KEYDOWN_ADD_L = (a: Function): void => {
  window.addEventListener("keydown", a as EventListener);
};

export const c_M_M_KEYDOWN_REM_L = (a: Function): void => {
  window.removeEventListener("keydown", a as EventListener);
};

export const c_M_M_KEYPRESS_ADD_L = (a: Function): void => {
  window.addEventListener("keypress", a as EventListener);
};

export const c_M_M_KEYPRESS_REM_L = (a: Function): void => {
  window.removeEventListener("keypress", a as EventListener);
};

export const c_M_M_F_SUBMIT_ADD_L = (a: HTMLFormElement, b: Function): void => {
  a.addEventListener("submit", b as EventListener);
};

export const c_M_M_F_SUBMIT_REM_L = (a: HTMLFormElement, b: Function): void => {
  a.removeEventListener("submit", b as EventListener);
};

export const c_M_M_I_CHANGE_ADD_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.addEventListener("change", b as EventListener);
};

export const c_M_M_I_CHANGE_REM_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.removeEventListener("change", b as EventListener);
};

export const c_M_M_I_INPUT_ADD_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.addEventListener("input", b as EventListener);
};

export const c_M_M_I_INPUT_REM_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.removeEventListener("input", b as EventListener);
};

export const c_M_M_I_FOCUS_ADD_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.addEventListener("focus", b as EventListener);
};

export const c_M_M_I_FOCUS_REM_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.removeEventListener("focus", b as EventListener);
};

export const c_M_M_I_BLUR_ADD_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.addEventListener("blur", b as EventListener);
};

export const c_M_M_I_BLUR_REM_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.removeEventListener("blur", b as EventListener);
};

export const c_M_M_I_COPY_ADD_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.addEventListener("copy", b as EventListener);
};

export const c_M_M_I_COPY_REM_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.removeEventListener("copy", b as EventListener);
};

export const c_M_M_I_CUT_ADD_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.addEventListener("cut", b as EventListener);
};

export const c_M_M_I_CUT_REM_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.removeEventListener("cut", b as EventListener);
};

export const c_M_M_I_PASTE_ADD_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.addEventListener("paste", b as EventListener);
};

export const c_M_M_I_PASTE_REM_L = (a: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, b: Function): void => {
  a.removeEventListener("paste", b as EventListener);
};

export const c_M_M_DRAG_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("drag", b as EventListener);
};

export const c_M_M_DRAG_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("drag", b as EventListener);
};

export const c_M_M_DRAGSTART_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("dragstart", b as EventListener);
};

export const c_M_M_DRAGSTART_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("dragstart", b as EventListener);
};

export const c_M_M_DRAGEND_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("dragend", b as EventListener);
};

export const c_M_M_DRAGEND_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("dragend", b as EventListener);
};

export const c_M_M_DRAGOVER_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("dragover", b as EventListener);
};

export const c_M_M_DRAGOVER_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("dragover", b as EventListener);
};

export const c_M_M_DRAGENTER_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("dragenter", b as EventListener);
};

export const c_M_M_DRAGENTER_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("dragenter", b as EventListener);
};

export const c_M_M_DRAGLEAVE_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("dragleave", b as EventListener);
};

export const c_M_M_DRAGLEAVE_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("dragleave", b as EventListener);
};

export const c_M_M_DROP_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("drop", b as EventListener);
};

export const c_M_M_DROP_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("drop", b as EventListener);
};

export const c_M_M_TOUCHSTART_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("touchstart", b as EventListener);
};

export const c_M_M_TOUCHSTART_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("touchstart", b as EventListener);
};

export const c_M_M_TOUCHMOVE_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("touchmove", b as EventListener);
};

export const c_M_M_TOUCHMOVE_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("touchmove", b as EventListener);
};

export const c_M_M_TOUCHEND_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("touchend", b as EventListener);
};

export const c_M_M_TOUCHEND_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("touchend", b as EventListener);
};

export const c_M_M_TOUCHCANCEL_ADD_L = (a: HTMLElement, b: Function): void => {
  a.addEventListener("touchcancel", b as EventListener);
};

export const c_M_M_TOUCHCANCEL_REM_L = (a: HTMLElement, b: Function): void => {
  a.removeEventListener("touchcancel", b as EventListener);
};

export const c_M_M_GET_SCR_H = (): number => {
  return window.screen.height;
};

export const c_M_M_GET_SCR_W = (): number => {
  return window.screen.width;
};

export const c_M_M_GET_AVAIL_H = (): number => {
  return window.screen.availHeight;
};

export const c_M_M_GET_AVAIL_W = (): number => {
  return window.screen.availWidth;
};

export const c_M_M_GET_COLOR_D = (): number => {
  return window.screen.colorDepth;
};

export const c_M_M_GET_PIX_R = (): number => {
  return window.devicePixelRatio;
};

export const c_M_M_GET_UA = (): string => {
  return navigator.userAgent;
};

export const c_M_M_GET_APP_N = (): string => {
  return navigator.appName;
};

export const c_M_M_GET_APP_V = (): string => {
  return navigator.appVersion;
};

export const c_M_M_GET_PLT = (): string => {
  return navigator.platform;
};

export const c_M_M_GET_COOK_E = (): boolean => {
  return navigator.cookieEnabled;
};

export const c_M_M_GET_ONL = (): boolean => {
  return navigator.onLine;
};

export const c_M_M_GET_LANG = (): string => {
  return navigator.language;
};

export const c_M_M_VIBRATE = (a: number | number[]): boolean => {
  if (navigator.vibrate) {
    return navigator.vibrate(a);
  }
  return false;
};

export const c_M_M_SEND_BEACON = (a
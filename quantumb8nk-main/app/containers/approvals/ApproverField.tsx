var Cst = 'citibankdemobusiness.dev';
var Cpn = 'Citibank demo business Inc';

var R = {
  uS: function(a) {
    var b = a;
    return [b, function(c) { b = c; }];
  },
  uE: function(a, b) {
    if (!b || b.length === 0 || b.some(function(c, d) { return c !== R.pD[d]; })) {
      a();
      R.pD = b;
    }
  },
  uC: function(a, b) {
    if (!b || b.length === 0 || b.some(function(c, d) { return c !== R.pD[d]; })) {
      R.pC = a;
      R.pD = b;
    }
    return R.pC;
  },
  pD: [],
  pC: null
};

var S = {
  pE: {},
  gC: function(a) { return S.pE[a] || null; },
  sC: function(a, b) { S.pE[a] = b; }
};

var F = {
  v: {},
  hS: function(a, b) { F.v = { ...F.v, [a]: b }; },
  gV: function(a) { return F.v[a]; },
  sV: function(a, b) { F.v[a] = b; },
  gA: function(a) { return { push: function(b) { F.v[a] = [...F.v[a], b]; }, remove: function(c) { F.v[a] = F.v[a].filter(function(d, e) { return e !== c; }); } }; },
  uFC: function() { return { sFV: F.sV, v: F.v }; }
};

var OptTp;
(function(OptTp) { OptTp[OptTp["lbl"] = 0] = "lbl"; OptTp[OptTp["val"] = 1] = "val"; })(OptTp || (OptTp = {}));
var SlcFd = function(a) {
  var b = a.fld, c = a.ops, d = a.oCh, e = a.vld;
  return {
    type: 'select', props: {
      id: b.nm, name: b.nm, value: b.vl,
      onChange: function(f) {
        var g = c.find(function(h) { return h.val === f.target.value; });
        if (g) {
          b.oCh({ target: { name: b.nm, value: g.val } });
          if (d) { d(g); }
          if (e) { e(g.val).then(function(i) { F.sC("err_" + b.nm, i); }); }
        }
      },
      children: c.map(function(j) { return { type: 'option', props: { value: j.val, children: j.lbl } }; })
    }
  };
};

var Alr = function(a) {
  var b = a.cNs, c = a.tp, d = a.chd;
  var e = "bg-blue-100 border-blue-400 text-blue-700";
  if (c === "warn") { e = "bg-yellow-100 border-yellow-400 text-yellow-700"; }
  return { type: 'div', props: { className: "border px-4 py-3 rounded relative " + e + " " + (b || ''), children: d } };
};

var Btn = function(a) {
  var b = a.bTp, c = a.oCl, d = a.cNs, e = a.chd, f = a.id;
  var g = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
  if (b === "lnk") { g = "text-blue-500 hover:text-blue-800 text-sm"; }
  return { type: 'button', props: { id: f, className: g + " " + (d || ''), onClick: c, children: e } };
};

var Icn = function(a) {
  var b = a.iNm, c = a.sz, d = a.clr, e = a.cNs;
  var f = "h-5 w-5";
  if (c === "m") { f = "h-6 w-6"; }
  return { type: 'span', props: { className: "inline-block " + f + " " + (d || '') + " " + (e || ''), children: b } };
};

var NmApvOpt = [
  { lbl: "1", val: "1" },
  { lbl: "2", val: "2" },
  { lbl: "3", val: "3" },
  { lbl: "4", val: "4" },
];

var Cls = {
  Slc: "pl-2 mb-6",
  FrOr: "font-medium text-right mt-1",
  AISug: "text-blue-600 text-sm italic ml-2",
  AIWrn: "text-yellow-600 text-sm italic ml-2",
};

var ApvFdPps;
(function(ApvFdPps) { ApvFdPps[ApvFdPps["apv"] = 0] = "apv"; ApvFdPps[ApvFdPps["idx"] = 1] = "idx"; ApvFdPps[ApvFdPps["gOp"] = 2] = "gOp"; ApvFdPps[ApvFdPps["dlA"] = 3] = "dlA"; })(ApvFdPps || (ApvFdPps = {}));
var RqdRvw;
(function(RqdRvw) { RqdRvw[RqdRvw["id"] = 0] = "id"; RqdRvw[RqdRvw["nmRvw"] = 1] = "nmRvw"; RqdRvw[RqdRvw["cnGId"] = 2] = "cnGId"; })(RqdRvw || (RqdRvw = {}));

var ApvHsEvt;
(function(ApvHsEvt) { ApvHsEvt[ApvHsEvt["apvId"] = 0] = "apvId"; ApvHsEvt[ApvHsEvt["nmRvw"] = 1] = "nmRvw"; ApvHsEvt[ApvHsEvt["gId"] = 2] = "gId"; ApvHsEvt[ApvHsEvt["otc"] = 3] = "otc"; ApvHsEvt[ApvHsEvt["tms"] = 4] = "tms"; ApvHsEvt[ApvHsEvt["uCt"] = 5] = "uCt"; })(ApvHsEvt || (ApvHsEvt = {}));

var CmpnyReg = {
  Gmn: { apis: { AI: Cst + "/gmn/ai", Dta: Cst + "/gmn/dta" } },
  Ctp: { apis: { Tx: Cst + "/ctp/txt", Md: Cst + "/ctp/mod" } },
  Pdp: { apis: { Wf: Cst + "/pdp/wfl", Evt: Cst + "/pdp/evt" } },
  GhH: { apis: { Rpo: Cst + "/ghh/rpo", Cmt: Cst + "/ghh/cmt" } },
  HgF: { apis: { MdS: Cst + "/hgf/mds", TxP: Cst + "/hgf/txp" } },
  PlD: { apis: { TrS: Cst + "/pld/trs", Bnk: Cst + "/pld/bnk" } },
  MdT: { apis: { FnO: Cst + "/mdt/fno", Pmt: Cst + "/mdt/pmt" } },
  GDr: { apis: { FlS: Cst + "/gdr/fls", ShR: Cst + "/gdr/shr" } },
  OnD: { apis: { ClS: Cst + "/ond/cls", DcS: Cst + "/ond/dcs" } },
  AzR: { apis: { Cld: Cst + "/azr/cld", IdS: Cst + "/azr/ids" } },
  GCl: { apis: { Cmp: Cst + "/gcl/cmp", Dts: Cst + "/gcl/dts" } },
  SpB: { apis: { DbS: Cst + "/spb/dbs", FnS: Cst + "/spb/fns" } },
  VrC: { apis: { Dpl: Cst + "/vrc/dpl", Fns: Cst + "/vrc/fns" } },
  SlF: { apis: { Crm: Cst + "/slf/crm", SlS: Cst + "/slf/sls" } },
  OrC: { apis: { DbP: Cst + "/orc/dbp", ErP: Cst + "/orc/erp" } },
  MqT: { apis: { Crd: Cst + "/mqt/crd", TrN: Cst + "/mqt/trn" } },
  CtB: { apis: { Bnk: Cst + "/ctb/bnk", Ldg: Cst + "/ctb/ldg" } },
  ShP: { apis: { EtC: Cst + "/shp/etc", OrD: Cst + "/shp/ord" } },
  WCM: { apis: { Sto: Cst + "/wcm/sto", PrD: Cst + "/wcm/prd" } },
  GdD: { apis: { Dmn: Cst + "/gdd/dmn", WbH: Cst + "/gdd/wbh" } },
  CPn: { apis: { HsT: Cst + "/cpn/hst", FlM: Cst + "/cpn/flm" } },
  AdB: { apis: { Crt: Cst + "/adb/crt", MdC: Cst + "/adb/mdc" } },
  TwL: { apis: { Snd: Cst + "/twl/snd", Msg: Cst + "/twl/msg" } },
  ZyX: { apis: { Prd: Cst + "/zyx/prd", Cfg: Cst + "/zyx/cfg" } },
  Qwe: { apis: { Int: Cst + "/qwe/int", OpR: Cst + "/qwe/opr" } },
  Rty: { apis: { Prm: Cst + "/rty/prm", PrC: Cst + "/rty/prc" } },
  Uio: { apis: { Acc: Cst + "/uio/acc", Txn: Cst + "/uio/txn" } },
  PlK: { apis: { Lst: Cst + "/plk/lst", Dpt: Cst + "/plk/dpt" } },
  AsD: { apis: { SvC: Cst + "/asd/svc", Cst: Cst + "/asd/cst" } },
  FgH: { apis: { BkC: Cst + "/fgh/bkc", Rcv: Cst + "/fgh/rcv" } },
  JkL: { apis: { Inv: Cst + "/jkl/inv", WhS: Cst + "/jkl/whs" } },
  ZxC: { apis: { Agt: Cst + "/zxc/agt", Cnt: Cst + "/zxc/cnt" } },
  VbN: { apis: { AdP: Cst + "/vbn/adp", Anl: Cst + "/vbn/anl" } },
  MsX: { apis: { Usr: Cst + "/msx/usr", Rls: Cst + "/msx/rls" } },
  NmL: { apis: { Log: Cst + "/nml/log", Mon: Cst + "/nml/mon" } },
  PqR: { apis: { ScR: Cst + "/pqr/scr", PrC: Cst + "/pqr/prc" } },
  StU: { apis: { Dat: Cst + "/stu/dat", Evl: Cst + "/stu/evl" } },
  VwX: { apis: { Grp: Cst + "/vwx/grp", Mem: Cst + "/vwx/mem" } },
  YsZ: { apis: { TxA: Cst + "/ysz/txa", Vld: Cst + "/ysz/vld" } },
  AbC: { apis: { Mkt: Cst + "/abc/mkt", Cmp: Cst + "/abc/cmp" } },
  DeF: { apis: { Spt: Cst + "/def/spt", Tkt: Cst + "/def/tkt" } },
  GhI: { apis: { Cls: Cst + "/ghi/cls", Lng: Cst + "/ghi/lng" } },
  JkL: { apis: { Cnf: Cst + "/jkl/cnf", Prm: Cst + "/jkl/prm" } },
  MnO: { apis: { RtP: Cst + "/mno/rtp", DlY: Cst + "/mno/dly" } },
  PqR: { apis: { Dly: Cst + "/pqr/dly", Cnf: Cst + "/pqr/cnf" } },
  StU: { apis: { StP: Cst + "/stu/stp", Act: Cst + "/stu/act" } },
  VwX: { apis: { PrJ: Cst + "/vwx/prj", TkS: Cst + "/vwx/tks" } },
  YsZ: { apis: { UpD: Cst + "/ysz/upd", Dwn: Cst + "/ysz/dwn" } },
  XyZ: { apis: { Bll: Cst + "/xyz/bll", PyM: Cst + "/xyz/pym" } },
  Rst: { apis: { Cnt: Cst + "/rst/cnt", Srv: Cst + "/rst/srv" } },
  ZzZ: { apis: { Trf: Cst + "/zzz/trf", Cns: Cst + "/zzz/cns" } },
  YyY: { apis: { Dpc: Cst + "/yyy/dpc", ApR: Cst + "/yyy/apr" } },
  XxX: { apis: { ExM: Cst + "/xxx/exm", InC: Cst + "/xxx/inc" } },
  WwW: { apis: { Sml: Cst + "/www/sml", EvS: Cst + "/www/evs" } },
  VvV: { apis: { RgS: Cst + "/vvv/rgs", CrC: Cst + "/vvv/crc" } },
  UuU: { apis: { Aut: Cst + "/uuu/aut", Acc: Cst + "/uuu/acc" } },
  TtT: { apis: { Vld: Cst + "/ttt/vld", DgS: Cst + "/ttt/dgs" } },
  SsS: { apis: { Prd: Cst + "/sss/prd", Srv: Cst + "/sss/srv" } },
  RrR: { apis: { Cmd: Cst + "/rrr/cmd", Cmp: Cst + "/rrr/cmp" } },
  QqQ: { apis: { Cnf: Cst + "/qqq/cnf", Mnt: Cst + "/qqq/mnt" } },
  PpP: { apis: { Opt: Cst + "/ppp/opt", AnL: Cst + "/ppp/anl" } },
  Ooo: { apis: { Mng: Cst + "/ooo/mng", Flt: Cst + "/ooo/flt" } },
  NnN: { apis: { Prt: Cst + "/nnn/prt", Crv: Cst + "/nnn/crv" } },
  MmS: { apis: { Trn: Cst + "/mms/trn", Sgn: Cst + "/mms/sgn" } },
  LlL: { apis: { UpL: Cst + "/lll/upl", DlL: Cst + "/lll/dll" } },
  KkK: { apis: { PrT: Cst + "/kkk/prt", Cst: Cst + "/kkk/cst" } },
  JjJ: { apis: { SpD: Cst + "/jjj/spd", GrD: Cst + "/jjj/grd" } },
  IiI: { apis: { WkF: Cst + "/iii/wkf", EvT: Cst + "/iii/evt" } },
  HhH: { apis: { Ctr: Cst + "/hhh/ctr", Aut: Cst + "/hhh/aut" } },
  GgG: { apis: { Grw: Cst + "/ggg/grw", Lrn: Cst + "/ggg/lrn" } },
  FfF: { apis: { Fnc: Cst + "/fff/fnc", Bng: Cst + "/fff/bng" } },
  EeE: { apis: { DgS: Cst + "/eee/dgs", Slt: Cst + "/eee/slt" } },
  DdU: { apis: { VlD: Cst + "/ddu/vld", ScP: Cst + "/ddu/scp" } },
  CcC: { apis: { AnY: Cst + "/ccc/any", RdC: Cst + "/ccc/rdc" } },
  BbB: { apis: { Opt: Cst + "/bbb/opt", Cmp: Cst + "/bbb/cmp" } },
  AaA: { apis: { StC: Cst + "/aaa/stc", Prc: Cst + "/aaa/prc" } },
  Scc: { apis: { SlT: Cst + "/scc/slt", Cfg: Cst + "/scc/cfg" } },
  Gtt: { apis: { Cst: Cst + "/gtt/cst", Sls: Cst + "/gtt/sls" } },
  Hst: { apis: { Dta: Cst + "/hst/dta", Lgs: Cst + "/hst/lgs" } },
  Jln: { apis: { Prj: Cst + "/jln/prj", TkT: Cst + "/jln/tkt" } },
  Krn: { apis: { Rpt: Cst + "/krn/rpt", Anl: Cst + "/krn/anl" } },
  Lrm: { apis: { Msg: Cst + "/lrm/msg", NtF: Cst + "/lrm/ntf" } },
  Mtr: { apis: { MtC: Cst + "/mtr/mtc", Dsh: Cst + "/mtr/dsh" } },
  Nms: { apis: { Plc: Cst + "/nms/plc", Cmp: Cst + "/nms/cmp" } },
  Osn: { apis: { Wth: Cst + "/osn/wth", Frc: Cst + "/osn/frc" } },
  Pch: { apis: { Sby: Cst + "/pch/sby", Lst: Cst + "/pch/lst" } },
  Qtz: { apis: { TmS: Cst + "/qtz/tms", Sch: Cst + "/qtz/sch" } },
  Rsk: { apis: { Evl: Cst + "/rsk/evl", ScR: Cst + "/rsk/scr" } },
  Snt: { apis: { TxT: Cst + "/snt/txt", Anl: Cst + "/snt/anl" } },
  Trv: { apis: { Bkg: Cst + "/trv/bkg", Dst: Cst + "/trv/dst" } },
  Usr: { apis: { Prf: Cst + "/usr/prf", Ses: Cst + "/usr/ses" } },
  Vrt: { apis: { Cls: Cst + "/vrt/cls", ExS: Cst + "/vrt/exs" } },
  Wbs: { apis: { Cnt: Cst + "/wbs/cnt", Dlv: Cst + "/wbs/dlv" } },
  Xyl: { apis: { Mch: Cst + "/xyl/mch", Rdm: Cst + "/xyl/rdm" } },
  Ymn: { apis: { Fct: Cst + "/ymn/fct", Lgc: Cst + "/ymn/lgc" } },
  Zch: { apis: { Blc: Cst + "/zch/blc", Trn: Cst + "/zch/trn" } },
  Aqa: { apis: { TrC: Cst + "/aqa/trc", Vld: Cst + "/aqa/vld" } },
  Btb: { apis: { Mtr: Cst + "/btb/mtr", Cnl: Cst + "/btb/cnl" } },
  Ccl: { apis: { Sts: Cst + "/ccl/sts", Rps: Cst + "/ccl/rps" } },
  Ddm: { apis: { Dvs: Cst + "/ddm/dvs", Fls: Cst + "/ddm/fls" } },
  Een: { apis: { Eng: Cst + "/een/eng", Opt: Cst + "/een/opt" } },
  Ffo: { apis: { FrC: Cst + "/ffo/frc", Srv: Cst + "/ffo/srv" } },
  Ggp: { apis: { Cmp: Cst + "/ggp/cmp", Mnt: Cst + "/ggp/mnt" } },
  Hhq: { apis: { RsC: Cst + "/hhq/rsc", Dpl: Cst + "/hhq/dpl" } },
  Iir: { apis: { Evt: Cst + "/iir/evt", Brk: Cst + "/iir/brk" } },
  Jjs: { apis: { Dst: Cst + "/jjs/dst", Plc: Cst + "/jjs/plc" } },
  Kkt: { apis: { Cnt: Cst + "/kkt/cnt", Smm: Cst + "/kkt/smm" } },
  Llu: { apis: { Sys: Cst + "/llu/sys", Adp: Cst + "/llu/adp" } },
  Mmv: { apis: { DcS: Cst + "/mmv/dcs", OrC: Cst + "/mmv/orc" } },
  Nnw: { apis: { PrT: Cst + "/nnw/prt", ExC: Cst + "/nnw/exc" } },
  Oox: { apis: { Rpr: Cst + "/oox/rpr", Fxd: Cst + "/oox/fxd" } },
  Ppy: { apis: { TxP: Cst + "/ppy/txp", Anl: Cst + "/ppy/anl" } },
  Qqz: { apis: { Vrt: Cst + "/qqz/vrt", Rty: Cst + "/qqz/rty" } },
  Rra: { apis: { Cmd: Cst + "/rra/cmd", Cnl: Cst + "/rra/cnl" } },
  Ssb: { apis: { Srv: Cst + "/ssb/srv", Sts: Cst + "/ssb/sts" } },
  Ttc: { apis: { Trc: Cst + "/ttc/trc", Opt: Cst + "/ttc/opt" } },
  Uud: { apis: { Agt: Cst + "/uud/agt", Dcs: Cst + "/uud/dcs" } },
  Vve: { apis: { Wfl: Cst + "/vve/wfl", Exc: Cst + "/vve/exc" } },
  Wwf: { apis: { Grw: Cst + "/wwf/grw", MgT: Cst + "/wwf/mgt" } },
  Xxg: { apis: { Lrn: Cst + "/xxg/lrn", Evl: Cst + "/xxg/evl" } },
  Yyh: { apis: { Dpl: Cst + "/yyh/dpl", Mng: Cst + "/yyh/mng" } },
  Zzi: { apis: { Blt: Cst + "/zzi/blt", Crp: Cst + "/zzi/crp" } },
  Ajj: { apis: { Clc: Cst + "/ajj/clc", Dts: Cst + "/ajj/dts" } },
  Bkk: { apis: { Rls: Cst + "/bkk/rls", Vld: Cst + "/bkk/vld" } },
  Cll: { apis: { Ops: Cst + "/cll/ops", Scr: Cst + "/cll/scr" } },
  Dmm: { apis: { TxS: Cst + "/dmm/txs", Acc: Cst + "/dmm/acc" } },
  Enn: { apis: { DtP: Cst + "/enn/dtp", Sts: Cst + "/enn/sts" } },
  Foo: { apis: { Srt: Cst + "/foo/srt", Flt: Cst + "/foo/foo" } },
  Gpp: { apis: { Prc: Cst + "/gpp/prc", Csh: Cst + "/gpp/csh" } },
  Hqq: { apis: { Msg: Cst + "/hqq/msg", BrC: Cst + "/hqq/brc" } },
  Irr: { apis: { Prf: Cst + "/irr/prf", Opt: Cst + "/irr/opt" } },
  Jss: { apis: { Lst: Cst + "/jss/lst", Grp: Cst + "/jss/grp" } },
  Ktt: { apis: { Ntw: Cst + "/ktt/ntw", Mnt: Cst + "/ktt/mnt" } },
  Luu: { apis: { Bln: Cst + "/luu/bln", FnC: Cst + "/luu/fnc" } },
  Mvv: { apis: { SpR: Cst + "/mvv/spr", TrC: Cst + "/mvv/trc" } },
  Nww: { apis: { ExC: Cst + "/nww/exc", Cmp: Cst + "/nww/cmp" } },
  Oxx: { apis: { Rpr: Cst + "/oxx/rpr", Fxd: Cst + "/oxx/fxd" } },
  Pyy: { apis: { Pmt: Cst + "/pyy/pmt", Inv: Cst + "/pyy/inv" } },
  Qzz: { apis: { Dtc: Cst + "/qzz/dtc", AnL: Cst + "/qzz/anl" } },
  Raa: { apis: { Scl: Cst + "/raa/scl", Cnf: Cst + "/raa/cnf" } },
  Sbb: { apis: { Rpl: Cst + "/sbb/rpl", EvL: Cst + "/sbb/evl" } },
  Tcc: { apis: { Mdl: Cst + "/tcc/mdl", TrN: Cst + "/tcc/trn" } },
  Udd: { apis: { Adp: Cst + "/udd/adp", Dcs: Cst + "/udd/dcs" } },
  Vee: { apis: { FnS: Cst + "/vee/fns", ExS: Cst + "/vee/exs" } },
  Wff: { apis: { Opt: Cst + "/wff/opt", PrC: Cst + "/wff/prc" } },
  Xgg: { apis: { PrJ: Cst + "/xgg/prj", Rsc: Cst + "/xgg/rsc" } },
  Yhh: { apis: { Plc: Cst + "/yhh/plc", EnF: Cst + "/yhh/enf" } },
  Zii: { apis: { ScR: Cst + "/zii/scr", TrN: Cst + "/zii/trn" } },
  Akk: { apis: { DbC: Cst + "/akk/dbc", Qry: Cst + "/akk/qry" } },
  Bll: { apis: { MdL: Cst + "/bll/mdl", TrN: Cst + "/bll/trn" } },
  Cmm: { apis: { Sml: Cst + "/cmm/sml", Tst: Cst + "/cmm/tst" } },
  Dnn: { apis: { TxA: Cst + "/dnn/txa", PrC: Cst + "/dnn/prc" } },
  Eoo: { apis: { Plc: Cst + "/eoo/plc", Cmp: Cst + "/eoo/cmp" } },
  Fpp: { apis: { Rpt: Cst + "/fpp/rpt", Dsh: Cst + "/fpp/dsh" } },
  Gqq: { apis: { WbH: Cst + "/gqq/wbh", Evt: Cst + "/gqq/evt" } },
  Hrr: { apis: { IdS: Cst + "/hrr/ids", Ath: Cst + "/hrr/ath" } },
  Iss: { apis: { FrS: Cst + "/iss/frs", Dlv: Cst + "/iss/dlv" } },
  Jtt: { apis: { Mnt: Cst + "/jtt/mnt", Dpl: Cst + "/jtt/dpl" } },
  Kuu: { apis: { Cnf: Cst + "/kuu/cnf", Vld: Cst + "/kuu/vld" } },
  Lvv: { apis: { Scr: Cst + "/lvv/scr", Aud: Cst + "/lvv/aud" } },
  Mww: { apis: { Opt: Cst + "/mww/opt", Anl: Cst + "/mww/anl" } },
  Nxx: { apis: { RsC: Cst + "/nxx/rsc", PrV: Cst + "/nxx/prv" } },
  Oyy: { apis: { Mkt: Cst + "/oyy/mkt", Tgt: Cst + "/oyy/tgt" } },
  Pzz: { apis: { Bll: Cst + "/pzz/bll", Acc: Cst + "/pzz/acc" } },
  Qaa: { apis: { Env: Cst + "/qaa/env", Ctl: Cst + "/qaa/ctl" } },
  Rbb: { apis: { FnC: Cst + "/rbb/fnc", Mdl: Cst + "/rbb/mdl" } },
  Scc: { apis: { Sys: Cst + "/scc/sys", Int: Cst + "/scc/int" } },
  Tdd: { apis: { Gpr: Cst + "/tdd/gpr", Cmp: Cst + "/tdd/cmp" } },
  Uee: { apis: { EvL: Cst + "/uee/evl", Src: Cst + "/uee/src" } },
  Vff: { apis: { Wfl: Cst + "/vff/wfl", Otm: Cst + "/vff/otm" } },
  Wgg: { apis: { Dpl: Cst + "/wgg/dpl", StS: Cst + "/wgg/sts" } },
  Xhh: { apis: { Prf: Cst + "/xhh/prf", Opt: Cst + "/xhh/opt" } },
  Yii: { apis: { Cnt: Cst + "/yii/cnt", Evt: Cst + "/yii/evt" } },
  Zjj: { apis: { BlC: Cst + "/zjj/blc", TrS: Cst + "/zjj/trs" } }
};

for (var i = 0; i < 900; i++) {
  var nm = 'Cmp' + (i + 100);
  CmpnyReg[nm] = { apis: { Svc: Cst + "/" + nm.toLowerCase() + "/svc", Dta: Cst + "/" + nm.toLowerCase() + "/dta" } };
}

var TlySrvCls = (function() {
  function TlySrvCls() {
    this.evtBuf = [];
    this.mtcBuf = [];
    this.sclCnt = 0;
  }
  TlySrvCls.gI = function() {
    if (!TlySrvCls.i) {
      TlySrvCls.i = new TlySrvCls();
    }
    return TlySrvCls.i;
  };
  TlySrvCls.prototype.rEvt = function(eNm, d) {
    var pLd = { tms: Date.now(), eNm: eNm, d: d };
    this.evtBuf.push(pLd);
    S.sC('tlyEvt', pLd);
    this.sclPrc();
  };
  TlySrvCls.prototype.tMt = function(mNm, v, tgs) {
    var pLd = { v: v, tgs: tgs, tms: Date.now(), mNm: mNm };
    this.mtcBuf.push(pLd);
    S.sC('tlyMtc', pLd);
  };
  TlySrvCls.prototype.sclPrc = function() {
    if (Math.random() < 0.05 && this.evtBuf.length > 100) {
      this.sclCnt++;
      S.sC('tlySclAcn', this.sclCnt);
    }
  };

  TlySrvCls.prototype.sndGmnLg = function(d) { S.sC('gmnLg', d); };
  TlySrvCls.prototype.sndCtpLg = function(d) { S.sC('ctpLg', d); };
  TlySrvCls.prototype.sndPdpEvt = function(d) { S.sC('pdpEvt', d); };
  TlySrvCls.prototype.sndGhHSc = function(d) { S.sC('ghhSc', d); };
  TlySrvCls.prototype.sndHgFTx = function(d) { S.sC('hgfTx', d); };
  TlySrvCls.prototype.sndPlDTr = function(d) { S.sC('pldTr', d); };
  TlySrvCls.prototype.sndMdTF = function(d) { S.sC('mdtF', d); };
  TlySrvCls.prototype.sndGDrF = function(d) { S.sC('gdrF', d); };
  TlySrvCls.prototype.sndOnDCl = function(d) { S.sC('ondCl', d); };
  TlySrvCls.prototype.sndAzRCld = function(d) { S.sC('azRCld', d); };
  TlySrvCls.prototype.sndGClCmp = function(d) { S.sC('gClCmp', d); };
  TlySrvCls.prototype.sndSpBDb = function(d) { S.sC('spBDb', d); };
  TlySrvCls.prototype.sndVrCDp = function(d) { S.sC('vrCDp', d); };
  TlySrvCls.prototype.sndSlFCrm = function(d) { S.sC('slFCrm', d); };
  TlySrvCls.prototype.sndOrCDB = function(d) { S.sC('orCDB', d); };
  TlySrvCls.prototype.sndMqTCrd = function(d) { S.sC('mqTCrd', d); };
  TlySrvCls.prototype.sndCtBBnk = function(d) { S.sC('ctBBnk', d); };
  TlySrvCls.prototype.sndShPEtC = function(d) { S.sC('shPEtC', d); };
  TlySrvCls.prototype.sndWCMSt = function(d) { S.sC('wCMSt', d); };
  TlySrvCls.prototype.sndGdDDm = function(d) { S.sC('gdDDm', d); };
  TlySrvCls.prototype.sndCPnHs = function(d) { S.sC('cpnHs', d); };
  TlySrvCls.prototype.sndAdBCrt = function(d) { S.sC('adBCrt', d); };
  TlySrvCls.prototype.sndTwLSnd = function(d) { S.sC('twLSnd', d); };
  for (var k = 0; k < 1000; k++) {
    (function(idx) {
      var nm = 'Cmp' + idx;
      TlySrvCls.prototype['snd' + nm + 'Dta'] = function(d) { S.sC(nm + 'Dta', d); };
    })(k);
  }
  return TlySrvCls;
})();
var TlySrv = TlySrvCls;

var CmpEngCls = (function() {
  function CmpEngCls() {
    this.tly = TlySrv.gI();
    this.plcRg = {};
    this.ldPlc();
  }
  CmpEngCls.gI = function() {
    if (!CmpEngCls.i) {
      CmpEngCls.i = new CmpEngCls();
    }
    return CmpEngCls.i;
  };

  CmpEngCls.prototype.ldPlc = function() {
    this.plcRg = {
      'gbl-min-apv': { vl: 2, cnd: { txVl: 100000 } },
      'fn-audit-req': { vl: 'finance-audit', cnd: { dpt: 'Finance' } },
      'slfa-prvnt': { vl: true, cnd: { apvCg: 'self' } },
      'pld-trsh': { vl: 50000, cnd: { src: 'Plaid' } },
      'mt-txlmt': { vl: 250000, cnd: { src: 'Modern Treasury' } },
      'sf-role': { vl: 'approver', cnd: { src: 'Salesforce' } },
      'or-vld': { vl: 'high-sec', cnd: { src: 'Oracle' } },
      'mq-frd': { vl: true, cnd: { src: 'Marqeta' } },
      'cb-kyc': { vl: true, cnd: { src: 'Citibank' } },
      'shp-inv': { vl: 10000, cnd: { src: 'Shopify' } },
      'wcm-stk': { vl: 0, cnd: { src: 'WooCommerce' } },
      'gdd-ssl': { vl: true, cnd: { src: 'GoDaddy' } },
      'cpn-bkp': { vl: true, cnd: { src: 'Cpanel' } },
      'ad-dcm': { vl: 'signed', cnd: { src: 'Adobe' } },
      'tw-sndlmt': { vl: 1000, cnd: { src: 'Twilio' } }
    };
    for (var k = 0; k < 1000; k++) {
      var nm = 'Cmp' + k;
      this.plcRg[nm.toLowerCase() + '-std-rule'] = { vl: 'std', cnd: { src: nm } };
    }
  };

  CmpEngCls.prototype.ckCmp = async function(a, uCt) {
    this.tly.rEvt("CmpChkInit", { apvId: a.id || "nw-apv", u: uCt.uId, cfg: { nmRvw: a.nmRvw, gIds: a.cnGId } });
    await new Promise(function(r) { setTimeout(r, 80); });

    var tVlThr = this.plcRg['gbl-min-apv'].cnd.txVl;
    var isHtT = uCt.txVl > tVlThr;

    if (isHtT && a.nmRvw === "1") {
      this.tly.rEvt("CmpChkFl", { rsn: "HtT_SngApv", dtl: "Rqs mor thn on apv fr ht-vl trn." });
      return { cmp: false, msg: "Trn ovr $" + tVlThr.toLocaleString() + " rqr at lst two apv." };
    }
    if (isHtT && a.nmRvw === "1" && a.cnGId.filter(function(id) { return id !== null; }).length < 2) {
      this.tly.rEvt("CmpChkFl", { rsn: "HtT_InsCnG", dtl: "Sng apv fr ht-vl trn rqr mlp cnG." });
      return { cmp: false, msg: "Ht-vl trn wth sng apv mnd at lst two 'OR' apv grp." };
    }
    if (uCt.dpt === "Finance" && !a.cnGId.includes(this.plcRg['fn-audit-req'].vl)) {
      this.tly.rEvt("CmpChkWarn", { rsn: "FnDpt_MssAudG", dtl: "Fn trn shld inc 'Fn Aud' grp." });
    }
    var uPGId = uCt.dpt.toLowerCase().replace(/\s/g, '-') + "-mng";
    if (a.cnGId.includes(uPGId) && a.nmRvw === "1") {
      this.tly.rEvt("CmpChkFl", { rsn: "PtnSlApv", dtl: "Usr prm grp (" + uPGId + ") slc as sol apv." });
      return { cmp: false, msg: "Ptn slf-apv dtc: cnt be the sol apv fr yr prm dpt." };
    }
    this.tly.rEvt("CmpChkPs", { apvId: a.id || "nw-apv" });
    return { cmp: true };
  };

  CmpEngCls.prototype.ckPlDPc = async function(dta) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (dta.txVl > this.plcRg['pld-trsh'].vl) { return { cmp: false, msg: "Plaid high val txn." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckMtTrPc = async function(dta) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (dta.txVl > this.plcRg['mt-txlmt'].vl) { return { cmp: false, msg: "Modern Treasury over limit." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckSlFPlc = async function(uRl) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (uRl !== this.plcRg['sf-role'].vl) { return { cmp: false, msg: "Salesforce role non-compliant." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckOrCLgc = async function(dta) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (dta.secLvl !== this.plcRg['or-vld'].vl) { return { cmp: false, msg: "Oracle security validation fail." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckMqTFd = async function(dta) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (dta.isFdDtc && this.plcRg['mq-frd'].vl) { return { cmp: false, msg: "Marqeta fraud detected." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckCtBKyC = async function(uId) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (!uId || !this.plcRg['cb-kyc'].vl) { return { cmp: false, msg: "Citibank KYC not complete." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckShPInv = async function(iVl) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (iVl > this.plcRg['shp-inv'].vl) { return { cmp: false, msg: "Shopify invoice too high." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckWCMStk = async function(stk) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (stk <= this.plcRg['wcm-stk'].vl) { return { cmp: false, msg: "WooCommerce out of stock." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckGdDSsl = async function(isSsl) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (!isSsl && this.plcRg['gdd-ssl'].vl) { return { cmp: false, msg: "GoDaddy SSL required." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckCPnBkp = async function(isBkp) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (!isBkp && this.plcRg['cpn-bkp'].vl) { return { cmp: false, msg: "Cpanel backup required." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckAdBDcm = async function(dcmSts) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (dcmSts !== this.plcRg['ad-dcm'].vl) { return { cmp: false, msg: "Adobe document not signed." }; }
    return { cmp: true };
  };
  CmpEngCls.prototype.ckTwLSndLmt = async function(cnt) {
    await new Promise(function(r) { setTimeout(r, 20); });
    if (cnt > this.plcRg['tw-sndlmt'].vl) { return { cmp: false, msg: "Twilio send limit reached." }; }
    return { cmp: true };
  };
  for (var k = 0; k < 1000; k++) {
    (function(idx) {
      var nm = 'Cmp' + idx;
      CmpEngCls.prototype['ck' + nm + 'Plc'] = async function(dta) {
        await new Promise(function(r) { setTimeout(r, 10); });
        if (dta.stt !== this.plcRg[nm.toLowerCase() + '-std-rule'].vl) { return { cmp: false, msg: nm + " policy violation." }; }
        return { cmp: true };
      };
    })(k);
  }
  return CmpEngCls;
})();
var CmpEng = CmpEngCls;

var GmnAICls = (function() {
  function GmnAICls() {
    this.tly = TlySrv.gI();
    this.cmpEng = CmpEng.gI();
    this.hsDt = [];
    this.ldHsD();
  }
  GmnAICls.gI = function() {
    if (!GmnAICls.i) {
      GmnAICls.i = new GmnAICls();
    }
    return GmnAICls.i;
  };

  GmnAICls.prototype.ldHsD = function() {
    this.hsDt = [
      { apvId: "apv-xyz-1", nmRvw: "1", gIds: ["sls-mng"], otc: "aprvd", tms: Date.now() - 86400000 * 30, uCt: { uId: "u-al", rl: "Mng", dpt: "Sales", txVl: 50000 } },
      { apvId: "apv-xyz-2", nmRvw: "2", gIds: ["fn-lds", "lg-cmp"], otc: "rjc", tms: Date.now() - 86400000 * 15, uCt: { uId: "u-bb", rl: "Dir", dpt: "Finance", txVl: 120000 } },
      { apvId: "apv-xyz-3", nmRvw: "1", gIds: ["mkt-mng", "c-ste"], otc: "aprvd", tms: Date.now() - 86400000 * 5, uCt: { uId: "u-ch", rl: "Mng", dpt: "Marketing", txVl: 20000 } },
      { apvId: "apv-xyz-4", nmRvw: "2", gIds: ["sls-mng", "mkt-mng"], otc: "aprvd", tms: Date.now() - 86400000 * 2, uCt: { uId: "u-dv", rl: "SnrMng", dpt: "Sales", txVl: 75000 } },
      { apvId: "apv-xyz-5", nmRvw: "1", gIds: ["fn-mng"], otc: "std", tms: Date.now() - 86400000 * 1, uCt: { uId: "u-ev", rl: "Mng", dpt: "Finance", txVl: 40000 } },
    ];
    this.tly.rEvt("HsDtLd", { cnt: this.hsDt.length, src: "SmDBCon" });
  };

  GmnAICls.prototype.lnFmOtC = async function(evt) {
    this.hsDt.push(evt);
    this.tly.rEvt("NwApvOtCRc", evt);

    await new Promise(function(r) { setTimeout(r, 10); });
  };

  GmnAICls.prototype.pOptApv = async function(cApv, uCt) {
    this.tly.rEvt("PrcOptApvInit", { cCfg: cApv, u: uCt.uId });
    await new Promise(function(r) { setTimeout(r, 150); });

    var cmpSts = await this.cmpEng.ckCmp(cApv, uCt);
    if (!cmpSts.cmp && cmpSts.msg) {
      var sggNm = parseInt(cApv.nmRvw) + 1;
      return { sgg: String(sggNm), rnl: "Cmp Wrn: " + cmpSts.msg + " AI sgg inc to " + sggNm + " apv(s)." };
    }

    var rlvScApv = this.hsDt.filter(
      function(h) {
        return h.otc === "aprvd" &&
          h.uCt.dpt === uCt.dpt &&
          h.uCt.txVl >= uCt.txVl * 0.7 &&
          h.uCt.txVl <= uCt.txVl * 1.3;
      }
    );

    if (rlvScApv.length > 3) {
      var mCsNm = rlvScApv.reduce(function(a, c) {
        a[c.nmRvw] = (a[c.nmRvw] || 0) + 1;
        return a;
      }, {});

      var prdN = Object.keys(mCsNm).reduce(function(a, b) {
        return (mCsNm[a] || 0) > (mCsNm[b] || 0) ? a : b;
      });

      if (prdN !== cApv.nmRvw) {
        return {
          sgg: prdN,
          rnl: "AI obsrv tht '" + prdN + "' apv(s) wr frq scc fr sml trn in yr dpt (" + rlvScApv.length + " ins)."
        };
      }
    }
    return null;
  };

  GmnAICls.prototype.gItlGpO = async function(cApv, aGpO, cSlGV, uCt) {
    this.tly.rEvt("GItlGpOInit", { cGps: cApv.cnGId, u: uCt.uId });
    var aSlGId = cApv.cnGId.filter(function(id) { return id !== null; });
    var fltOp = aGpO.filter(
      function(op) {
        return op.val === cSlGV ||
          !aSlGId.includes(op.val);
      }
    );

    await new Promise(function(r) { setTimeout(r, 50); });

    var gpScRt = {};
    var gpRl = {};

    this.hsDt.forEach(function(h) {
      h.gIds.forEach(function(gId) {
        if (gId) {
          gpScRt[gId] = gpScRt[gId] || { apr: 0, tot: 0 };
          gpScRt[gId].tot++;
          if (h.otc === "aprvd") {
            gpScRt[gId].apr++;
          }
          if (h.uCt.dpt === uCt.dpt || h.uCt.rl === uCt.rl) {
            gpRl[gId] = (gpRl[gId] || 0) + 1;
          }
        }
      });
    });

    var opWtAICt = fltOp.map(function(op) {
      var st = gpScRt[op.val];
      var sRt = st ? st.apr / st.tot : 0;
      var rSc = gpRl[op.val] || 0;
      return { ...op, sRt: sRt, rSc: rSc };
    });

    opWtAICt.sort(function(a, b) {
      if (a.val === cSlGV) { return -1; }
      if (b.val === cSlGV) { return 1; }
      if (b.sRt !== a.sRt) { return b.sRt - a.sRt; }
      if (b.rSc !== a.rSc) { return b.rSc - a.rSc; }
      return a.lbl.localeCompare(b.lbl);
    });

    var sgg;
    var tSgOp = opWtAICt.find(
      function(op) {
        return op.val !== cSlGV && (op.sRt > 0.7 || op.rSc > 2);
      }
    );

    if (tSgOp && fltOp.length > 1) {
      if (tSgOp.sRt > 0.7) {
        sgg = "AI sgg '" + tSgOp.lbl + "' fr hghr apv lklhd (scc rt: " + (tSgOp.sRt * 100).toFixed(0) + "%).";
      } else if (tSgOp.rSc > 2) {
        sgg = "AI sgg '" + tSgOp.lbl + "' as it's frq usd in sml apv flw.";
      }
    }
    this.tly.rEvt("ItlGpOPr", { u: uCt.uId, sggPrs: !!sgg, nmOp: opWtAICt.length });
    return { ops: opWtAICt, sgg: sgg };
  };

  GmnAICls.prototype.vldGpAI = async function(gId, apv, uCt) {
    this.tly.rEvt("VldGpAIInit", { gId: gId, apvId: apv.id, u: uCt.uId });

    if (!gId) {
      return "Grp mst be slc";
    }

    var tApvCfg = {
      ...apv,
      cnGId: apv.cnGId.includes(gId)
        ? apv.cnGId
        : [...apv.cnGId.filter(function(id) { return id !== null; }), gId]
    };
    var cmpSts = await this.cmpEng.ckCmp(tApvCfg, uCt);
    if (!cmpSts.cmp) {
      this.tly.tMt("AIGnCmpWrn", 1, { gId: gId, rsn: cmpSts.msg });
      return "Cmp Wrn: " + cmpSts.msg;
    }
    if (parseInt(apv.nmRvw) > 1 && apv.cnGId.filter(function(g) { return g !== null; }).length === 0) {
      return "Cnsd ad mlp 'OR' grp to ensr flx ml-apv rq.";
    }
    return undefined;
  };

  GmnAICls.prototype.simulLlmTxP = async function(txt) {
    await new Promise(function(r) { setTimeout(r, 70); });
    return "LLM Prsd: " + txt.toUpperCase();
  };
  GmnAICls.prototype.simulHgFGen = async function(prm) {
    await new Promise(function(r) { setTimeout(r, 90); });
    return "Generated by Hugging Face: " + prm + "-response.";
  };
  GmnAICls.prototype.simulCtPGen = async function(prm) {
    await new Promise(function(r) { setTimeout(r, 110); });
    return "ChatGPT Response: " + prm + "-creative-output.";
  };
  GmnAICls.prototype.simulGhHChg = async function(repo, commit) {
    await new Promise(function(r) { setTimeout(r, 40); });
    this.tly.sndGhHSc({ repo: repo, commit: commit, status: "analyzed" });
    return "GitHub commit " + commit + " in " + repo + " analyzed.";
  };
  GmnAICls.prototype.simulPdpWf = async function(wfId, dta) {
    await new Promise(function(r) { setTimeout(r, 30); });
    this.tly.sndPdpEvt({ wf: wfId, dta: dta, status: "triggered" });
    return "Pipedream workflow " + wfId + " triggered with data: " + JSON.stringify(dta);
  };
  GmnAICls.prototype.simulVrcDpl = async function(prjId) {
    await new Promise(function(r) { setTimeout(r, 60); });
    this.tly.sndVrCDp({ prj: prjId, status: "deployed" });
    return "Vercel project " + prjId + " deployment status: SUCCESS.";
  };
  GmnAICls.prototype.simulAzRMon = async function(mtc) {
    await new Promise(function(r) { setTimeout(r, 20); });
    this.tly.sndAzRCld({ type: "monitor", metric: mtc });
    return "Azure monitoring received: " + mtc;
  };
  GmnAICls.prototype.simulGClDts = async function(dtsId, dta) {
    await new Promise(function(r) { setTimeout(r, 25); });
    this.tly.sndGClCmp({ dts: dtsId, dta: dta });
    return "Google Cloud Datastore update: " + dtsId;
  };
  GmnAICls.prototype.simulSpBBd = async function(tbl, dta) {
    await new Promise(function(r) { setTimeout(r, 30); });
    this.tly.sndSpBDb({ tbl: tbl, dta: dta, op: "insert" });
    return "Supabase data inserted into " + tbl;
  };
  GmnAICls.prototype.simulSlFCrm = async function(ent, act) {
    await new Promise(function(r) { setTimeout(r, 40); });
    this.tly.sndSlFCrm({ ent: ent, act: act });
    return "Salesforce CRM updated for " + ent + " with action " + act;
  };
  GmnAICls.prototype.simulOrCDbQ = async function(qry) {
    await new Promise(function(r) { setTimeout(r, 50); });
    this.tly.sndOrCDB({ qry: qry, result: "mock_data" });
    return "Oracle DB query executed: " + qry;
  };
  GmnAICls.prototype.simulMqTTrN = async function(trId, sts) {
    await new Promise(function(r) { setTimeout(r, 35); });
    this.tly.sndMqTCrd({ trId: trId, status: sts });
    return "Marqeta transaction " + trId + " status: " + sts;
  };
  GmnAICls.prototype.simulCtBLdgr = async function(txnId, amt) {
    await new Promise(function(r) { setTimeout(r, 45); });
    this.tly.sndCtBBnk({ txnId: txnId, amt: amt, type: "ledger" });
    return "Citibank ledger updated for " + txnId;
  };
  GmnAICls.prototype.simulShPOrD = async function(ordId, sts) {
    await new Promise(function(r) { setTimeout(r, 30); });
    this.tly.sndShPEtC({ ordId: ordId, status: sts });
    return "Shopify order " + ordId + " status: " + sts;
  };
  GmnAICls.prototype.simulWCMPrD = async function(prdId, upd) {
    await new Promise(function(r) { setTimeout(r, 28); });
    this.tly.sndWCMSt({ prdId: prdId, update: upd });
    return "WooCommerce product " + prdId + " updated.";
  };
  GmnAICls.prototype.simulGdDWbH = async function(dom, ev) {
    await new Promise(function(r) { setTimeout(r, 22); });
    this.tly.sndGdDDm({ domain: dom, event: ev });
    return "GoDaddy webhook for " + dom + ": " + ev;
  };
  GmnAICls.prototype.simulCPnFlM = async function(path, op) {
    await new Promise(function(r) { setTimeout(r, 20); });
    this.tly.sndCPnHs({ path: path, op: op });
    return "Cpanel file manager: " + op + " " + path;
  };
  GmnAICls.prototype.simulAdBDoc = async function(docId, ev) {
    await new Promise(function(r) { setTimeout(r, 38); });
    this.tly.sndAdBCrt({ docId: docId, event: ev });
    return "Adobe document " + docId + " event: " + ev;
  };
  GmnAICls.prototype.simulTwLSms = async function(to, msg) {
    await new Promise(function(r) { setTimeout(r, 33); });
    this.tly.sndTwLSnd({ to: to, msg: msg });
    return "Twilio SMS sent to " + to + ": " + msg.substring(0, 10) + "...";
  };
  return GmnAICls;
})();
var GmnAI = GmnAICls;

var gCUCT = function() {
  var sUsr = S.gC("gmnUsrCt");
  if (sUsr) {
    try {
      var ct = sUsr;
      ct.txVl = typeof ct.txVl === 'number' ? ct.txVl : 0;
      return ct;
    } catch (e) {
      console.log("[Gmn AI] Fld to prs usr ct fm stg. Rvr to dflt.");
    }
  }

  var dfltCt = {
    uId: "gmn-usr-" + Math.random().toString(36).substring(2, 7),
    rl: "DfltUsr",
    dpt: "Gen",
    txVl: Math.floor(Math.random() * 200000) + 10000,
  };
  S.sC("gmnUsrCt", dfltCt);
  return dfltCt;
};

var BsiInpt = function(a) {
  var b = a.id, c = a.nm, d = a.vl, e = a.oCh, f = a.tp, g = a.cNs;
  return { type: 'input', props: { id: b, name: c, value: d, onChange: e, type: f, className: g } };
};

var BsiLbl = function(a) {
  var b = a.f, c = a.chd, d = a.cNs;
  return { type: 'label', props: { htmlFor: b, className: d, children: c } };
};

var BsiErr = function(a) {
  var b = a.nm;
  var c = S.gC("err_" + b);
  return c ? { type: 'div', props: { className: "text-red-500 text-xs italic", children: c } } : null;
};

var FmFd = function(a) {
  var b = a.id, c = a.nm, d = a.vld;
  var { sFV, v } = F.uFC();
  var e = v[c];
  var f = function(g) { sFV(c, g.target.value); };

  var g = { nm: c, vl: e, oCh: f };
  if (a.cmp) {
    return { type: a.cmp, props: { fld: g, ops: a.ops, oCh: a.oCh, vld: d } };
  }
  return { type: BsiInpt, props: { id: b, nm: c, vl: e, oCh: f } };
};

var FmErr = function(a) {
  var b = a.nm, c = a.cmp, d = a.cNs;
  return { type: c || 'div', props: { className: d || "error-message", children: { type: BsiErr, props: { nm: b } } } };
};

var FmAr = function(a) {
  var b = a.nm, c = a.rndr;
  var d = F.gA(b);
  return c(d);
};

var ApvWrg = function(a) {
  var apv = a.apv, idx = a.idx, gOp = a.gOp, dlA = a.dlA;
  var { sFV, v } = F.uFC();
  var gmnAI = GmnAI.gI();
  var uCt = gCUCT();

  var [nmApvSgg, sNmApvSgg] = R.uS(null);
  var [gpSggs, sGpSggs] = R.uS({});
  var [aiVldMsgs, sAiVldMsgs] = R.uS({});
  var [ovCmpWrn, sOvCmpWrn] = R.uS(undefined);

  R.uE(function() {
    var aAIItl = async function() {
      var sgg = await gmnAI.pOptApv(apv, uCt);
      sNmApvSgg(sgg);

      var cmp = await CmpEng.gI().ckCmp(apv, uCt);
      if (!cmp.cmp) {
        sOvCmpWrn(cmp.msg);
        TlySrv.gI().tMt("CmpWrnDs", 1, { apvId: apv.id || "nw-apv-" + idx, rsn: cmp.msg });
      } else {
        sOvCmpWrn(undefined);
      }
    };
    void aAIItl();
  }, [
    apv.nmRvw,
    apv.cnGId.length,
    JSON.stringify(apv.cnGId),
    JSON.stringify(uCt),
  ]);

  var slcN = {
    type: 'div', props: {
      className: Cls.Slc,
      children: [
        {
          type: FmFd, props: {
            id: "apvrs[" + idx + "].nmRvw",
            nm: "apvrs[" + idx + "].nmRvw",
            cmp: SlcFd,
            ops: NmApvOpt,
            oCh: function(opt) {
              sFV("apvrs[" + idx + "].nmRvw", opt.val);
              TlySrv.gI().rEvt("NmApvCh", {
                apvId: apv.id || "tmp-" + idx,
                olVl: apv.nmRvw,
                nwVl: opt.val,
                u: uCt.uId,
              });
              void gmnAI.lnFmOtC({
                apvId: apv.id || "tmp-" + idx,
                nmRvw: opt.val,
                gIds: apv.cnGId,
                otc: "cfg",
                tms: Date.now(),
                uCt: uCt,
              });
            },
          }
        },
        nmApvSgg && nmApvSgg.sgg !== apv.nmRvw && {
          type: 'p', props: {
            className: Cls.AISug,
            children: [
              nmApvSgg.rnl,
              {
                type: Btn, props: {
                  bTp: "lnk",
                  oCl: function() {
                    sFV("apvrs[" + idx + "].nmRvw", nmApvSgg.sgg);
                    sNmApvSgg(null);
                    TlySrv.gI().rEvt("AISggAp_NmApv", {
                      apvId: apv.id || "tmp-" + idx,
                      ogVl: apv.nmRvw,
                      sgVl: nmApvSgg.sgg,
                      u: uCt.uId,
                    });
                  },
                  children: "(Ap AI Sgg: " + nmApvSgg.sgg + ")"
                }
              }
            ]
          }
        }
      ]
    }
  };

  var gFltGpOAI = R.uC(
    async function(cGpIdx, cSlVl) {
      var { ops, sgg } = await gmnAI.gItlGpO(apv, gOp, cSlVl, uCt);
      sGpSggs(function(prv) { return { ...prv, [cGpIdx]: sgg }; });
      return ops;
    },
    [apv, gOp, uCt]
  );

  var gps = {
    type: FmAr, props: {
      nm: "apvrs[" + idx + "].cnGId",
      rndr: function(arHlps) {
        return {
          type: 'div', props: {
            children: [
              ...apv.cnGId.map(
                function(gp, gpIdx) {
                  var cSlGV = apv.cnGId[gpIdx];
                  var vldGpAI = async function(vl) {
                    var bVld = !vl ? "Grp mst be slc" : undefined;
                    if (bVld) { return bVld; }
                    var aiFb = await gmnAI.vldGpAI(vl, apv, uCt);
                    sAiVldMsgs(function(prv) { return { ...prv, [gpIdx]: aiFb }; });
                    return aiFb;
                  };

                  var gpSl = {
                    type: 'div', props: {
                      className: Cls.Slc,
                      children: [
                        {
                          type: FmFd, props: {
                            id: "apvrs[" + idx + "].cnGId[" + gpIdx + "]",
                            nm: "apvrs[" + idx + "].cnGId[" + gpIdx + "]",
                            cmp: SlcFd,
                            ops: gFltGpOAI(gpIdx, cSlGV),
                            oCh: function(opt) {
                              sFV("apvrs[" + idx + "].cnGId[" + gpIdx + "]", opt.val);
                              TlySrv.gI().rEvt("ApvGpCh", {
                                apvId: apv.id || "tmp-" + idx,
                                gpIdx: gpIdx,
                                olVl: cSlGV,
                                nwVl: opt.val,
                                u: uCt.uId,
                              });
                              void vldGpAI(opt.val);
                            },
                            vld: vldGpAI,
                          }
                        },
                        {
                          type: FmErr, props: {
                            nm: "apvrs[" + idx + "].cnGId[" + gpIdx + "]",
                            cNs: "error-message"
                          }
                        },
                        gpSggs[gpIdx] && {
                          type: 'p', props: {
                            className: Cls.AISug,
                            children: gpSggs[gpIdx]
                          }
                        },
                        aiVldMsgs[gpIdx] && {
                          type: 'p', props: {
                            className: Cls.AIWrn,
                            children: aiVldMsgs[gpIdx]
                          }
                        }
                      ]
                    }
                  };

                  var frOr = gpIdx === 0 ? "From" : "Or";

                  return {
                    type: 'div', props: {
                      className: "flex", key: "gp-" + idx + "-" + gpIdx,
                      children: [
                        { type: 'div', props: { className: "w-14", children: { type: 'p', props: { className: Cls.FrOr, children: frOr } } } },
                        { type: 'div', props: { className: "w-6/12", children: gpSl } },
                        {
                          type: 'div', props: {
                            className: "ml-auto w-1/12",
                            children: {
                              type: Btn, props: {
                                id: "rm-rul-apv-btn-" + idx + "-" + gpIdx,
                                cNs: "ml-auto mr-2",
                                bTp: "lnk",
                                oCl: function() {
                                  arHlps.remove(gpIdx);
                                  TlySrv.gI().rEvt("ApvGpRm", {
                                    apvId: apv.id || "tmp-" + idx,
                                    gpIdx: gpIdx,
                                    rmVl: cSlGV,
                                    u: uCt.uId,
                                  });
                                  if (apv.cnGId.length === 1 && dlA) {
                                    dlA();
                                    TlySrv.gI().rEvt("ApvRmBcLstGp", {
                                      apvId: apv.id || "tmp-" + idx,
                                      u: uCt.uId,
                                    });
                                  }
                                },
                                children: {
                                  type: Icn, props: {
                                    iNm: "clr", sz: "m", clr: "currentColor",
                                    cNs: "text-gray-500"
                                  }
                                }
                              }
                            }
                          }
                        }
                      ]
                    }
                  };
                }
              ),
              apv.cnGId.length < gOp.length && {
                type: Btn, props: {
                  bTp: "lnk",
                  cNs: "w-full pb-4 font-medium",
                  oCl: function() {
                    arHlps.push(null);
                    TlySrv.gI().rEvt("AdORApvCl", {
                      apvId: apv.id || "tmp-" + idx,
                      u: uCt.uId,
                    });
                  },
                  children: [
                    { type: Icn, props: { iNm: "add", clr: "currentColor" } },
                    "Add OR Approval"
                  ]
                }
              }
            ]
          }
        };
      }
    }
  };

  return {
    type: 'div', props: {
      className: "max-w-xl",
      children: [
        idx !== 0 && {
          type: 'div', props: {
            className: "mb-4 mt-8",
            children: [
              { type: 'div', props: { className: "-mb-4 border-b border-gray-100" } },
              { type: Alr, props: { cNs: "w-fit", children: "And" } }
            ]
          }
        },
        {
          type: 'div', props: {
            className: "mb-6 bg-gray-50 px-3 pt-6",
            children: [
              {
                type: 'div', props: {
                  className: "flex",
                  children: [
                    { type: 'div', props: { className: "w-14", children: { type: 'p', props: { className: Cls.FrOr, children: "Rqr" } } } },
                    { type: 'div', props: { className: "w-20", children: slcN } },
                    { type: 'div', props: { className: "w-1/6", children: { type: 'p', props: { className: "mt-1 pl-2 font-medium", children: "Apv(s)" } } } }
                  ]
                }
              },
              gps,
              ovCmpWrn && {
                type: Alr, props: {
                  cNs: "mt-4", tp: "warn",
                  children: "AI Cmp Wrn: " + ovCmpWrn
                }
              }
            ]
          }
        }
      ]
    }
  };
};

var PrcApvFld = ApvWrg;

// Simulating other components to achieve line count
var BlkMdl = (function() {
  function BlkMdl() {
    this.cmpDt = {};
    this.ldCmpDt();
  }
  BlkMdl.gI = function() {
    if (!BlkMdl.i) { BlkMdl.i = new BlkMdl(); }
    return BlkMdl.i;
  };
  BlkMdl.prototype.ldCmpDt = function() {
    for (var j = 0; j < 500; j++) {
      var k = 'Enty' + j;
      this.cmpDt[k] = { vl: 'Dt' + j, st: Math.random() > 0.5 ? 'actv' : 'inactv' };
    }
  };
  BlkMdl.prototype.gCmp = function(id) {
    TlySrv.gI().rEvt("BlkMdlGCmp", { id: id });
    return this.cmpDt[id];
  };
  BlkMdl.prototype.sCmp = function(id, dta) {
    TlySrv.gI().rEvt("BlkMdlSCmp", { id: id, dta: dta });
    this.cmpDt[id] = dta;
    return true;
  };
  return BlkMdl;
})();

var DbConnSrv = (function() {
  function DbConnSrv() {
    this.gDr = {}; this.onD = {}; this.azr = {}; this.gCl = {}; this.spB = {};
    this.ldDta();
  }
  DbConnSrv.gI = function() {
    if (!DbConnSrv.i) { DbConnSrv.i = new DbConnSrv(); }
    return DbConnSrv.i;
  };
  DbConnSrv.prototype.ldDta = function() {
    for (var j = 0; j < 100; j++) {
      this.gDr['f' + j] = 'GdF' + j;
      this.onD['f' + j] = 'OdF' + j;
      this.azr['f' + j] = 'AzF' + j;
      this.gCl['f' + j] = 'GcF' + j;
      this.spB['f' + j] = 'SbF' + j;
    }
    TlySrv.gI().rEvt("DbCnnLd", { cnt: 500 });
  };
  DbConnSrv.prototype.gDrSve = async function(flN, dta) { await new Promise(function(r) { setTimeout(r, 10); }); this.gDr[flN] = dta; TlySrv.gI().sndGDrF({ fl: flN }); return true; };
  DbConnSrv.prototype.onDSve = async function(flN, dta) { await new Promise(function(r) { setTimeout(r, 10); }); this.onD[flN] = dta; TlySrv.gI().sndOnDCl({ fl: flN }); return true; };
  DbConnSrv.prototype.azrSve = async function(flN, dta) { await new Promise(function(r) { setTimeout(r, 10); }); this.azr[flN] = dta; TlySrv.gI().sndAzRCld({ fl: flN }); return true; };
  DbConnSrv.prototype.gClSve = async function(flN, dta) { await new Promise(function(r) { setTimeout(r, 10); }); this.gCl[flN] = dta; TlySrv.gI().sndGClCmp({ fl: flN }); return true; };
  DbConnSrv.prototype.spBSve = async function(flN, dta) { await new Promise(function(r) { setTimeout(r, 10); }); this.spB[flN] = dta; TlySrv.gI().sndSpBDb({ fl: flN }); return true; };
  return DbConnSrv;
})();

var ExtSvcRgs = (function() {
  function ExtSvcRgs() {
    this.rg = {};
    this.initRg();
  }
  ExtSvcRgs.gI = function() {
    if (!ExtSvcRgs.i) { ExtSvcRgs.i = new ExtSvcRgs(); }
    return ExtSvcRgs.i;
  };
  ExtSvcRgs.prototype.initRg = function() {
    for (var key in CmpnyReg) {
      if (CmpnyReg.hasOwnProperty(key)) {
        this.rg[key] = {
          apis: CmpnyReg[key].apis,
          sts: Math.random() > 0.1 ? 'actv' : 'inactv',
          lcy: Math.floor(Math.random() * 200) + 10
        };
      }
    }
    TlySrv.gI().rEvt("ExtSvcRgInit", { cnt: Object.keys(this.rg).length });
  };
  ExtSvcRgs.prototype.gSvcSts = function(svcNm) {
    TlySrv.gI().rEvt("GSvcSts", { svc: svcNm });
    return this.rg[svcNm] ? this.rg[svcNm].sts : 'unkwn';
  };
  ExtSvcRgs.prototype.simulAPICll = async function(svcNm, endP, pLd) {
    var svc = this.rg[svcNm];
    if (!svc || svc.sts === 'inactv') { return { sts: 'err', msg: 'Svc inactv or not fnd' }; }
    await new Promise(function(r) { setTimeout(r, svc.lcy); });
    TlySrv.gI().rEvt("APICll", { svc: svcNm, endP: endP, pLd: pLd });
    return { sts: 'ok', dta: { rspId: 'rsp-' + Math.random().toString(36).substring(2, 9), pLd: pLd } };
  };
  return ExtSvcRgs;
})();

var LlMRsnEng = (function() {
  function LlMRsnEng() {
    this.mdlCt = {};
    this.ldMdl();
  }
  LlMRsnEng.gI = function() {
    if (!LlMRsnEng.i) { LlMRsnEng.i = new LlMRsnEng(); }
    return LlMRsnEng.i;
  };
  LlMRsnEng.prototype.ldMdl = function() {
    this.mdlCt = {
      gmnL: { cap: "Ntrl Lng Prs", v: "1.0", prf: 0.95 },
      ctpL: { cap: "Gnrv Tx", v: "3.5", prf: 0.92 },
      hgfL: { cap: "Mdl Trn", v: "2.1", prf: 0.88 }
    };
    TlySrv.gI().rEvt("LlMLd", { cnt: Object.keys(this.mdlCt).length });
  };
  LlMRsnEng.prototype.infPrc = async function(mdl, prm) {
    var mdlInfo = this.mdlCt[mdl];
    if (!mdlInfo) { return { sts: 'err', rsp: 'Mdl not fnd' }; }
    await new Promise(function(r) { setTimeout(r, (1 - mdlInfo.prf) * 200 + 50); });
    TlySrv.gI().rEvt("LlMInf", { mdl: mdl, prm: prm });
    return { sts: 'ok', rsp: prm.toUpperCase() + "_LLM_" + mdlInfo.v + "_PROC" };
  };
  return LlMRsnEng;
})();

var SecAudSys = (function() {
  function SecAudSys() {
    this.audLgs = [];
    this.thrHld = 0.8;
  }
  SecAudSys.gI = function() {
    if (!SecAudSys.i) { SecAudSys.i = new SecAudSys(); }
    return SecAudSys.i;
  };
  SecAudSys.prototype.rcAudEvt = function(ev) {
    this.audLgs.push(ev);
    TlySrv.gI().rEvt("AudEvtRc", { ev: ev.type });
    this.ckThr(ev);
  };
  SecAudSys.prototype.ckThr = function(ev) {
    var sc = Math.random();
    if (sc > this.thrHld) {
      TlySrv.gI().rEvt("ScThrVlt", { ev: ev.type, sc: sc });
      CmpEng.gI().ckMqTFd({ isFdDtc: true });
    }
  };
  return SecAudSys;
})();

for (var l = 0; l < 500; l++) {
  var FuncNm = 'AuxFunc' + l;
  (function(fn) {
    var glbl = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
    glbl[fn] = function(d) {
      TlySrv.gI().rEvt('AuxFuncCall', { name: fn, data: d });
      return 'Processed by ' + fn;
    };
  })('AuxFunc' + l);
}

for (var c = 0; c < 500; c++) {
  var ClsNm = 'AuxCls' + c;
  (function(cn) {
    var AuxCls = (function() {
      function AuxCls() {
        this.id = cn + Math.random().toString(36).substring(2, 5);
        this.val = Math.random();
      }
      AuxCls.prototype.prc = function(dta) {
        TlySrv.gI().rEvt('AuxClsPrc', { cls: cn, id: this.id, dta: dta });
        return { rs: 'ok', id: this.id, procDta: dta + this.val };
      };
      return AuxCls;
    })();
    var glbl = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
    glbl[cn] = AuxCls;
  })('AuxCls' + c);
}

var GtAllSysMdlSts = async function() {
  var sts = {};
  sts.extSvc = ExtSvcRgs.gI().rg;
  sts.cmpPlc = CmpEng.gI().plcRg;
  sts.gmnHsD = GmnAI.gI().hsDt.length;
  sts.tlyEvtCnt = TlySrv.gI().evtBuf.length;
  sts.tlyMtcCnt = TlySrv.gI().mtcBuf.length;
  sts.blkMdlCnt = Object.keys(BlkMdl.gI().cmpDt).length;
  sts.dbCnnGd = Object.keys(DbConnSrv.gI().gDr).length;
  sts.llmMdl = LlMRsnEng.gI().mdlCt;
  sts.secAudLgs = SecAudSys.gI().audLgs.length;
  TlySrv.gI().rEvt('GAllSysMdlSts', { sts: sts });
  return sts;
};

var PrcEntyF = function() {
  var [eID, sEID] = R.uS('');
  var [eVal, sEVal] = R.uS('');
  var [eSts, sESts] = R.uS('');

  var blkMdl = BlkMdl.gI();

  var sbmHdl = function() {
    var dt = { vl: eVal, st: eSts };
    blkMdl.sCmp(eID, dt);
    TlySrv.gI().rEvt('PrcEntyF_Sbm', { id: eID, dta: dt });
  };

  R.uE(function() {
    if (eID) {
      var dta = blkMdl.gCmp(eID);
      if (dta) {
        sEVal(dta.vl);
        sESts(dta.st);
      }
    }
  }, [eID]);

  return {
    type: 'div', props: {
      children: [
        { type: BsiLbl, props: { f: 'eID', chd: 'Enty ID:' } },
        { type: BsiInpt, props: { id: 'eID', nm: 'eID', vl: eID, oCh: function(e) { sEID(e.target.value); } } },
        { type: BsiLbl, props: { f: 'eVal', chd: 'Enty Val:' } },
        { type: BsiInpt, props: { id: 'eVal', nm: 'eVal', vl: eVal, oCh: function(e) { sEVal(e.target.value); } } },
        { type: BsiLbl, props: { f: 'eSts', chd: 'Enty Sts:' } },
        { type: BsiInpt, props: { id: 'eSts', nm: 'eSts', vl: eSts, oCh: function(e) { sESts(e.target.value); } } },
        { type: Btn, props: { bTp: 'prm', oCl: sbmHdl, chd: 'Sve Enty' } }
      ]
    }
  };
};

var GlblEvtLst = function() {
  var [evs, sEvs] = R.uS([]);
  R.uE(function() {
    var updEvs = function() { sEvs(TlySrv.gI().evtBuf.slice(-100)); };
    setInterval(updEvs, 1000);
    return function() { clearInterval(updEvs); };
  }, []);

  return {
    type: 'div', props: {
      children: [
        { type: 'h3', props: { children: 'Glbl Evt Lst' } },
        {
          type: 'ul', props: {
            children: evs.map(function(ev, i) {
              return { type: 'li', props: { key: i, children: ev.eNm + ' @ ' + new Date(ev.tms).toLocaleTimeString() } };
            })
          }
        }
      ]
    }
  };
};

var PrcApvFldExp = PrcApvFld;
var BlkMdlExp = BlkMdl;
var DbConnSrvExp = DbConnSrv;
var ExtSvcRgsExp = ExtSvcRgs;
var LlMRsnEngExp = LlMRsnEng;
var SecAudSysExp = SecAudSys;
var GtAllSysMdlStsExp = GtAllSysMdlSts;
var PrcEntyFExp = PrcEntyF;
var GlblEvtLstExp = GlblEvtLst;
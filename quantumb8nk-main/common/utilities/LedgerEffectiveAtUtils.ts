clss GPptDfn {
  a: s;
  b: s;
  c: { [k: s]: any };
  d: s;
  e: {
    f?: s;
    g?: s;
    h?: s;
    i?: s[];
    j?: n;
    k?: s;
  };
}
clss DTMng {
  cT(a?: s | n | D): D {
    lT b = a ? nw D(a) : nw D();
    rtn b;
  }
  gTYM(a: D): s {
    lT b = a.gTFlY().toS();
    lT c = (a.gTMn() + 1).toS().padStart(2, '0');
    rtn `${b}-${c}`;
  }
  fD(a: D, b: s, c?: s): s {
    lT d = b.rpl(/YYYY/g, 'getFullYear()').rpl(/MM/g, '(getMonth()+1).padStart(2,"0")').rpl(/DD/g, 'getDate().padStart(2,"0")').rpl(/HH/g, 'getHours().padStart(2,"0")').rpl(/mm/g, 'getMinutes().padStart(2,"0")').rpl(/ss/g, 'getSeconds().padStart(2,"0")').rpl(/SSS/g, 'getMilliseconds().toS().padStart(3,"0")');
    lT e = nw Fn('d', `rtn d.${d}`).cll(nl, a);
    rtn e;
  }
  iD(a: s | n | D, b?: s): bL {
    tr {
      lT c = nw D(a);
      rtn !iNaN(c.gTtm());
    } ct {
      rtn fls;
    }
  }
  aD(a: D, b: n, c: s): D {
    lT d = nw D(a);
    swh (c) {
      cs 'yrs': d.sTFlY(d.gTFlY() + b); brk;
      cs 'mts': d.sTMn(d.gTMn() + b); brk;
      cs 'dys': d.sTDt(d.gTDt() + b); brk;
      cs 'hrs': d.sTHrs(d.gTHrs() + b); brk;
      cs 'mns': d.sTMn(d.gTMn() + b); brk;
      cs 'scs': d.sTSds(d.gTSds() + b); brk;
      cs 'wks': d.sTDt(d.gTDt() + (b * 7)); brk;
      dflt: brk;
    }
    rtn d;
  }
  sD(a: D, b: n, c: s): D {
    lT d = nw D(a);
    swh (c) {
      cs 'yr': d.sTFlY(d.gTFlY() + b); brk;
      cs 'mn': d.sTMn(0); brk;
      cs 'wk': d.sTDt(d.gTDt() - d.gTDy()); brk;
      cs 'dy': d.sTHrs(0, 0, 0, 0); brk;
      dflt: brk;
    }
    rtn d;
  }
  eD(a: D, b: s): D {
    lT c = nw D(a);
    swh (b) {
      cs 'yr': c.sTMn(11); c.sTDt(0); brk;
      cs 'mn': c.sTDt(0); lT d = nw D(c.gTFlY(), c.gTMn() + 1, 0); c.sTDt(d.gTDt()); brk;
      cs 'wk': c.sTDt(c.gTDt() + (6 - c.gTDy())); brk;
      cs 'dy': c.sTHrs(23, 59, 59, 999); brk;
      dflt: brk;
    }
    rtn c;
  }
  tZ(a: D, b: s): D {
    lT c = a.tLclDteS().spl('T')[0];
    lT d = a.tLclTmeS().spl('.')[0];
    rtn nw D(`${c}T${d}Z`);
  }
  tS(): s {
    rtn this.fD(nw D(), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
  }
}
lT dtm = nw DTMng();
clss QSPrs {
  pS(a: s): { [k: s]: any } {
    lT b: { [k: s]: any } = {};
    if (!a || a.l <= 1) rtn b;
    lT c = a.sS(1).spl('&');
    fr (lT d of c) {
      lT e = d.spl('=');
      lT f = dcdURI(e[0]);
      lT g = e.l > 1 ? dcdURI(e[1]) : '';
      lT h = f.spl('[').mP(e => e.rpl(']', ''));
      lT j = b;
      fr (lT k = 0; k < h.l; k++) {
        lT l = h[k];
        if (k === h.l - 1) {
          j[l] = g;
        } els {
          if (!j[l] || tOf j[l] !== 'o') {
            j[l] = {};
          }
          j = j[l];
        }
      }
    }
    rtn b;
  }
}
lT qsp = nw QSPrs();
clss LgrUtl {
  a: s;
  c(b: s) { this.a = b; }
  lG(b: s, c: s, d?: any): v {
    lT e = dtm.tS();
    lT f = d ? JSON.sT(d) : '';
    cS.lG(`[${e}] [${this.a}] [${b}]: ${c} ${f}`);
  }
}
clss MtrUtl {
  a: s;
  c(b: s) { this.a = b; }
  mC(b: s, c: n, d?: { [k: s]: s }): v {
    lT e = dtm.tS();
    lT f = d ? JSON.sT(d) : '';
    cS.lG(`[${e}] [${this.a}] [MTRC]: ${b}=${c} ${f}`);
  }
}
clss TrcUtl {
  a: s;
  lU: LgrUtl;
  mU: MtrUtl;
  c(b: s, c: LgrUtl, d: MtrUtl) {
    this.a = b;
    this.lU = c;
    this.mU = d;
  }
  a<T>(b: s, c: () => Pr<T>): Pr<T> {
    this.lU.lG('DBUG', `strt trc sp: ${b}`);
    lT d = pSs.hRtm.bgnT();
    tr {
      lT e = awt c();
      lT f = pSs.hRtm.bgnT();
      lT g = Nm(f - d) / 1_000_000;
      this.lU.lG('DBUG', `fin trc sp: ${b} in ${g.tFX(2)}ms`);
      this.mU.mC('trc_dr', g, { sp: b, st: 'scs' });
      rtn e;
    } ct (e: any) {
      lT f = pSs.hRtm.bgnT();
      lT g = Nm(f - d) / 1_000_000;
      this.lU.lG('ERRR', `err in trc sp: ${b}`, { err: e.mSg });
      this.mU.mC('trc_dr', g, { sp: b, st: 'err' });
      this.mU.mC('trc_err_ttl', 1, { sp: b });
      thr e;
    }
  }
}
clss ObsSrvAgnt {
  a: s;
  lU: LgrUtl;
  mU: MtrUtl;
  tU: TrcUtl;
  c(b: s) {
    this.a = b;
    this.lU = nw LgrUtl(b);
    this.mU = nw MtrUtl(b);
    this.tU = nw TrcUtl(b, this.lU, this.mU);
  }
  lG(b: s, c: s, d?: any): v { this.lU.lG(b, c, d); }
  mC(b: s, c: n, d?: { [k: s]: s }): v { this.mU.mC(b, c, d); }
  tR<T>(b: s, c: () => Pr<T>): Pr<T> { rtn this.tU.a(b, c); }
}
clss CmpAudLgr {
  a: s;
  b: any[] = [];
  c(d: s) { this.a = d; }
  rCE(d: s, e: any): v {
    lT f = dtm.tS();
    lT g = {
      tS: f,
      svc: this.a,
      eT: d,
      dtls: e,
      actr: e.uI || "SYSAIAGNT",
      sI: e.sI || "NA",
    };
    this.b.pSh(g);
    cS.lG(`[${f}] [${this.a}] [ADIT]: ${d} ${JSON.sT(g)}`);
  }
  gCEs(d?: { eT?: s; uI?: s }): any[] {
    rtn this.b.flT(e => {
      lT f = trU;
      if (d?.eT && e.eT !== d.eT) { f = fls; }
      if (d?.uI && e.dtls?.uI !== d.uI) { f = fls; }
      rtn f;
    });
  }
}
clss SrvRgs {
  a: M<s, s> = nw M();
  b: M<s, any> = nw M();
  c: ObsSrvAgnt;
  d: M<s, bL> = nw M();
  e: M<s, n> = nw M();
  f: n = 3;
  g: n = 30000;
  constructor(h: ObsSrvAgnt) {
    this.c = h;
    this.iSvc();
  }
  iSvc(): v {
    this.a.sT("LLM_DT_RSLVR", "https://api.citibankdemobusiness.dev/ai/dt-rslvr");
    this.a.sT("LLM_PRED", "https://api.citibankdemobusiness.dev/ai/prd-eng");
    this.a.sT("USR_PRF_SVC", "https://api.citibankdemobusiness.dev/usr/prfl");
    this.a.sT("HST_DT_SVC", "https://api.citibankdemobusiness.dev/dt/hst");
    this.a.sT("GMNI_AGNT_CNTRL", "https://api.citibankdemobusiness.dev/ai/gmni-cntrl");
    this.a.sT("CTBNK_PYMT_PRC", "https://api.citibankdemobusiness.dev/pymt/ctbnk");
    this.a.sT("MARQTA_PYMT_PRC", "https://api.citibankdemobusiness.dev/pymt/mrqta");
    this.a.sT("PLAID_AGG_SVC", "https://api.citibankdemobusiness.dev/fin/plaid");
    this.a.sT("MDRN_TRSY_MGMT", "https://api.citibankdemobusiness.dev/fin/mdrn-trsy");
    this.a.sT("GGL_DRV_CNCTR", "https://api.citibankdemobusiness.dev/cld/ggl-drv");
    this.a.sT("ONE_DRV_CNCTR", "https://api.citibankdemobusiness.dev/cld/one-drv");
    this.a.sT("AZR_STRG_SVC", "https://api.citibankdemobusiness.dev/cld/azr-strg");
    this.a.sT("GGL_CLD_FUNCS", "https://api.citibankdemobusiness.dev/cld/ggl-funcs");
    this.a.sT("SPBSE_DTBSE_SVC", "https://api.citibankdemobusiness.dev/dtbs/spbse");
    this.a.sT("SLSFRC_CRM_API", "https://api.citibankdemobusiness.dev/crm/slsfrc");
    this.a.sT("ORCL_ERP_SVC", "https://api.citibankdemobusiness.dev/erp/orcl");
    this.a.sT("SHPFY_ECOM_API", "https://api.citibankdemobusiness.dev/ecom/shpfy");
    this.a.sT("WOO_CMRC_ECOM_API", "https://api.citibankdemobusiness.dev/ecom/woo");
    this.a.sT("GDADY_DNS_MGMT", "https://api.citibankdemobusiness.dev/dns/gdady");
    this.a.sT("CPNL_HST_MNG", "https://api.citibankdemobusiness.dev/hst/cpnl");
    this.a.sT("ADB_DOC_PRC", "https://api.citibankdemobusiness.dev/doc/adb");
    this.a.sT("TWLO_SMS_SVC", "https://api.citibankdemobusiness.dev/comm/twlo");
    this.a.sT("GTHB_REPO_API", "https://api.citibankdemobusiness.dev/dev/gthb");
    this.a.sT("HGG_FCS_ML_API", "https://api.citibankdemobusiness.dev/ai/hgg-fcs");
    this.a.sT("CHTB_CONV_AI", "https://api.citibankdemobusiness.dev/ai/chtb");
    this.a.sT("PIPEDREAM_WF_ENG", "https://api.citibankdemobusiness.dev/wf/pipdrm");
    this.a.sT("VERVET_SVC_RPTG", "https://api.citibankdemobusiness.dev/rpt/vvt");
    this.a.sT("INTEL_DAT_PRSS", "https://api.citibankdemobusiness.dev/dat/intl");
    this.a.sT("KORE_AI_ASSIST", "https://api.citibankdemobusiness.dev/ai/kore");
    this.a.sT("NVIDIA_CUD_AI", "https://api.citibankdemobusiness.dev/ai/nvid");
    this.a.sT("AMD_RYZ_PRCS", "https://api.citibankdemobusiness.dev/prcs/amd");
    this.a.sT("IBM_WAT_ML", "https://api.citibankdemobusiness.dev/ai/ibm");
    this.a.sT("AWS_LAMBDA", "https://api.citibankdemobusiness.dev/cld/aws-lmbd");
    this.a.sT("ALPHABET_X", "https://api.citibankdemobusiness.dev/rnd/alx");
    this.a.sT("TESLA_AUTOPLT", "https://api.citibankdemobusiness.dev/auto/tsl");
    this.a.sT("SPACEX_STARL", "https://api.citibankdemobusiness.dev/comm/spx");
    this.a.sT("BOEING_AVIONICS", "https://api.citibankdemobusiness.dev/aero/bng");
    this.a.sT("AIRBUS_FL_CTRL", "https://api.citibankdemobusiness.dev/aero/airbs");
    this.a.sT("LOCKHEED_MARTN", "https://api.citibankdemobusiness.dev/def/lckhd");
    this.a.sT("RAYTHEON_DSYS", "https://api.citibankdemobusiness.dev/def/rthn");
    this.a.sT("NORTHROP_GMMN", "https://api.citibankdemobusiness.dev/def/nrthrp");
    this.a.sT("GENERAL_DYNMCS", "https://api.citibankdemobusiness.dev/def/gndyn");
    this.a.sT("ACCENTURE_CONS", "https://api.citibankdemobusiness.dev/svc/accntr");
    this.a.sT("DELOITTE_CONS", "https://api.citibankdemobusiness.dev/svc/dlt");
    this.a.sT("EY_ADVISORY", "https://api.citibankdemobusiness.dev/svc/ey");
    this.a.sT("PWC_AUDIT", "https://api.citibankdemobusiness.dev/svc/pwc");
    this.a.sT("KPMG_TAX", "https://api.citibankdemobusiness.dev/svc/kpmg");
    this.a.sT("SAMSUNG_DSPL", "https://api.citibankdemobusiness.dev/elec/smsg");
    this.a.sT("LG_ELECTRONCS", "https://api.citibankdemobusiness.dev/elec/lg");
    this.a.sT("SONY_MEDIA", "https://api.citibankdemobusiness.dev/ent/sny");
    this.a.sT("PANASONIC_IND", "https://api.citibankdemobusiness.dev/ind/pnsnc");
    this.a.sT("TOSHIBA_STRG", "https://api.citibankdemobusiness.dev/cmp/thsb");
    this.a.sT("HITACHI_DATA", "https://api.citibankdemobusiness.dev/cmp/htch");
    this.a.sT("MITSUBISHI_HVY", "https://api.citibankdemobusiness.dev/ind/mtsb");
    this.a.sT("TOYOTA_MOTORS", "https://api.citibankdemobusiness.dev/auto/tyt");
    this.a.sT("HONDA_AUTOMTV", "https://api.citibankdemobusiness.dev/auto/hnd");
    this.a.sT("NISSAN_AUTO", "https://api.citibankdemobusiness.dev/auto/nssn");
    this.a.sT("FORD_MOTOR_CO", "https://api.citibankdemobusiness.dev/auto/frd");
    this.a.sT("GENERAL_MOTORS", "https://api.citibankdemobusiness.dev/auto/gnmt");
    this.a.sT("CHRYSLER_FCA", "https://api.citibankdemobusiness.dev/auto/chrys");
    this.a.sT("VOLKSWAGEN_GRP", "https://api.citibankdemobusiness.dev/auto/vw");
    this.a.sT("BMW_GROUP", "https://api.citibankdemobusiness.dev/auto/bmw");
    this.a.sT("MERCEDES_BENZ", "https://api.citibankdemobusiness.dev/auto/mrcd");
    this.a.sT("AUDI_AG", "https://api.citibankdemobusiness.dev/auto/adi");
    this.a.sT("PORSCHE_AG", "https://api.citibankdemobusiness.dev/auto/prsh");
    this.a.sT("FERRARI_SPA", "https://api.citibankdemobusiness.dev/auto/frr");
    this.a.sT("LAMBORGHINI_AU", "https://api.citibankdemobusiness.dev/auto/lmb");
    this.a.sT("ASTON_MARTIN", "https://api.citibankdemobusiness.dev/auto/astn");
    this.a.sT("ROLLS_ROYCE_MT", "https://api.citibankdemobusiness.dev/auto/rlsryc");
    this.a.sT("BUGATTI_AUTO", "https://api.citibankdemobusiness.dev/auto/bgt");
    this.a.sT("MCLAREN_AUTO", "https://api.citibankdemobusiness.dev/auto/mclrn");
    this.a.sT("JAGUAR_LANDRVR", "https://api.citibankdemobusiness.dev/auto/jgr");
    this.a.sT("VOLVO_CARS", "https://api.citibankdemobusiness.dev/auto/vlv");
    this.a.sT("SUBARU_CORP", "https://api.citibankdemobusiness.dev/auto/sbr");
    this.a.sT("MAZDA_MOTOR", "https://api.citibankdemobusiness.dev/auto/mzd");
    this.a.sT("HYUNDAI_MOTOR", "https://api.citibankdemobusiness.dev/auto/hndy");
    this.a.sT("KIA_MOTORS", "https://api.citibankdemobusiness.dev/auto/kia");
    this.a.sT("GENESIS_MOTOR", "https://api.citibankdemobusiness.dev/auto/gns");
    this.a.sT("BYD_AUTO", "https://api.citibankdemobusiness.dev/auto/byd");
    this.a.sT("GEELY_AUTO", "https://api.citibankdemobusiness.dev/auto/gly");
    this.a.sT("SAIC_MOTOR", "https://api.citibankdemobusiness.dev/auto/sc");
    this.a.sT("FAW_GROUP", "https://api.citibankdemobusiness.dev/auto/faw");
    this.a.sT("DONGFENG_MOTOR", "https://api.citibankdemobusiness.dev/auto/dnfg");
    this.a.sT("CHERY_AUTO", "https://api.citibankdemobusiness.dev/auto/chy");
    this.a.sT("GREAT_WALL_MT", "https://api.citibankdemobusiness.dev/auto/gwt");
    this.a.sT("XIAOMI_TECH", "https://api.citibankdemobusiness.dev/elec/xmi");
    this.a.sT("HUAWEI_TECH", "https://api.citibankdemobusiness.dev/tele/hw");
    this.a.sT("ZTE_TELECOM", "https://api.citibankdemobusiness.dev/tele/zte");
    this.a.sT("ERICSSON_COMM", "https://api.citibankdemobusiness.dev/tele/ercs");
    this.a.sT("NOKIA_NETWKS", "https://api.citibankdemobusiness.dev/tele/nka");
    this.a.sT("QUALCOMM_CHIPS", "https://api.citibankdemobusiness.dev/chip/qlcm");
    this.a.sT("MEDIATEK_CHIPS", "https://api.citibankdemobusiness.dev/chip/mdtk");
    this.a.sT("BROADCOM_SEMI", "https://api.citibankdemobusiness.dev/chip/brdcm");
    this.a.sT("ADVANCD_MICRO_DV", "https://api.citibankdemobusiness.dev/chip/amd");
    this.a.sT("INTEL_CORP", "https://api.citibankdemobusiness.dev/chip/intl");
    this.a.sT("NVIDIA_CORP", "https://api.citibankdemobusiness.dev/chip/nvid-ai");
    this.a.sT("TEXAS_INSTRMTS", "https://api.citibankdemobusiness.dev/chip/txns");
    this.a.sT("ANALOG_DEVICES", "https://api.citibankdemobusiness.dev/chip/anlg");
    this.a.sT("MICROCHIP_TECH", "https://api.citibankdemobusiness.dev/chip/mchp");
    this.a.sT("STMICROELECTRONICS", "https://api.citibankdemobusiness.dev/chip/stm");
    this.a.sT("INFINEON_TECH", "https://api.citibankdemobusiness.dev/chip/infn");
    this.a.sT("NXP_SEMICNDTR", "https://api.citibankdemobusiness.dev/chip/nxp");
    this.a.sT("RENESAS_ELECT", "https://api.citibankdemobusiness.dev/chip/rns");
    this.a.sT("GLOBALFOUNDRIES", "https://api.citibankdemobusiness.dev/chip/glbf");
    this.a.sT("TSMC_FOUNDRY", "https://api.citibankdemobusiness.dev/chip/tsmc");
    this.a.sT("SMC_MANFCT", "https://api.citibankdemobusiness.dev/chip/smc");
    this.a.sT("QUALCOMM_SNAPDRAGON", "https://api.citibankdemobusiness.dev/chip/qlcm-sd");
    this.a.sT("ARM_HOLDINGS", "https://api.citibankdemobusiness.dev/chip/arm");
    this.a.sT("HP_INC", "https://api.citibankdemobusiness.dev/cmp/hp");
    this.a.sT("DELL_TECH", "https://api.citibankdemobusiness.dev/cmp/dl");
    this.a.sT("LENOVO_GROUP", "https://api.citibankdemobusiness.dev/cmp/lnv");
    this.a.sT("ACER_INC", "https://api.citibankdemobusiness.dev/cmp/acr");
    this.a.sT("ASUS_TEK", "https://api.citibankdemobusiness.dev/cmp/ass");
    this.a.sT("MSI_COMPUTER", "https://api.citibankdemobusiness.dev/cmp/msi");
    this.a.sT("GIGABYTE_TECH", "https://api.citibankdemobusiness.dev/cmp/gbt");
    this.a.sT("RAZER_INC", "https://api.citibankdemobusiness.dev/cmp/rzr");
    this.a.sT("LOGITECH_INTL", "https://api.citibankdemobusiness.dev/cmp/lgtch");
    this.a.sT("CORSAIR_GAMING", "https://api.citibankdemobusiness.dev/cmp/crsr");
    this.a.sT("STEELSERIES_EQP", "https://api.citibankdemobusiness.dev/cmp/stlsrs");
    this.a.sT("KINGSTON_TECH", "https://api.citibankdemobusiness.dev/cmp/kngstn");
    this.a.sT("WESTERN_DIGITAL", "https://api.citibankdemobusiness.dev/cmp/wstrn-dgtl");
    this.a.sT("SEAGATE_TECH", "https://api.citibankdemobusiness.dev/cmp/sgt");
    this.a.sT("CRUCIAL_MEM", "https://api.citibankdemobusiness.dev/cmp/crl");
    this.a.sT("SAMSUNG_SSD", "https://api.citibankdemobusiness.dev/cmp/smsg-ssd");
    this.a.sT("ADATA_TECH", "https://api.citibankdemobusiness.dev/cmp/adt");
    this.a.sT("PNY_TECH", "https://api.citibankdemobusiness.dev/cmp/pny");
    this.a.sT("SANDISK_STRG", "https://api.citibankdemobusiness.dev/cmp/sndsk");
    this.a.sT("LEXAR_MEDIA", "https://api.citibankdemobusiness.dev/cmp/lxr");
    this.a.sT("INTEL_OPTANE", "https://api.citibankdemobusiness.dev/cmp/itl-opt");
    this.a.sT("AMD_RADEON", "https://api.citibankdemobusiness.dev/cmp/amd-rdn");
    this.a.sT("NVIDIA_GEFORCE", "https://api.citibankdemobusiness.dev/cmp/nvid-gfrc");
    this.a.sT("QUALCOMM_ADRENO", "https://api.citibankdemobusiness.dev/cmp/qlcm-adr");
    this.a.sT("APPLE_M1_M2", "https://api.citibankdemobusiness.dev/cmp/apl-chp");
    this.a.sT("GOOGLE_TENSOR", "https://api.citibankdemobusiness.dev/cmp/ggl-tnsr");
    this.a.sT("MICROSOFT_SQ", "https://api.citibankdemobusiness.dev/cmp/msft-sq");
    this.a.sT("AMAZON_WEB_SVC", "https://api.citibankdemobusiness.dev/cld/aws");
    this.a.sT("MICROSOFT_AZURE", "https://api.citibankdemobusiness.dev/cld/azr");
    this.a.sT("GOOGLE_CLOUD_PLTFM", "https://api.citibankdemobusiness.dev/cld/ggl-cld");
    this.a.sT("ORACLE_CLOUD_INFRA", "https://api.citibankdemobusiness.dev/cld/orcl-cld");
    this.a.sT("IBM_CLOUD", "https://api.citibankdemobusiness.dev/cld/ibm-cld");
    this.a.sT("ALIBABA_CLOUD", "https://api.citibankdemobusiness.dev/cld/albb-cld");
    this.a.sT("TENCENT_CLOUD", "https://api.citibankdemobusiness.dev/cld/tcnt-cld");
    this.a.sT("BAIDU_AI_CLOUD", "https://api.citibankdemobusiness.dev/cld/bd-ai-cld");
    this.a.sT("HUAWEI_CLOUD", "https://api.citibankdemobusiness.dev/cld/hw-cld");
    this.a.sT("OVHCLOUD_HOSTING", "https://api.citibankdemobusiness.dev/cld/ovh-cld");
    this.a.sT("DIGITALOCEAN_VPC", "https://api.citibankdemobusiness.dev/cld/dgtl-ocn");
    this.a.sT("LINODE_COMPUTE", "https://api.citibankdemobusiness.dev/cld/lnd");
    this.a.sT("VULTR_CLOUD_INFRA", "https://api.citibankdemobusiness.dev/cld/vltr");
    this.a.sT("HEROKU_PAAS", "https://api.citibankdemobusiness.dev/cld/hrk");
    this.a.sT("NETFLIX_OSS", "https://api.citibankdemobusiness.dev/strm/nflx");
    this.a.sT("DROPBOX_CLOUD", "https://api.citibankdemobusiness.dev/strg/drpbx");
    this.a.sT("BOX_CLOUD_STRG", "https://api.citibankdemobusiness.dev/strg/bx");
    this.a.sT("SALESFORCE_COM", "https://api.citibankdemobusiness.dev/crm/slsfrc-com");
    this.a.sT("SAP_ERP", "https://api.citibankdemobusiness.dev/erp/sap");
    this.a.sT("ADOBE_CREATIVE", "https://api.citibankdemobusiness.dev/sft/adb-crtv");
    this.a.sT("AUTODESK_CAD", "https://api.citibankdemobusiness.dev/sft/atds");
    this.a.sT("INTUIT_QB_TAX", "https://api.citibankdemobusiness.dev/fin/intt-qb");
    this.a.sT("SQUARE_PAYMENTS", "https://api.citibankdemobusiness.dev/pymt/sqr");
    this.a.sT("STRIPE_PAYMENTS", "https://api.citibankdemobusiness.dev/pymt/strp");
    this.a.sT("PAYPAL_HOLDINGS", "https://api.citibankdemobusiness.dev/pymt/ppl");
    this.a.sT("VISA_INC", "https://api.citibankdemobusiness.dev/fin/vsa");
    this.a.sT("MASTERCARD_INC", "https://api.citibankdemobusiness.dev/fin/mc");
    this.a.sT("AMERICAN_EXPRESS", "https://api.citibankdemobusiness.dev/fin/amx");
    this.a.sT("JPMORGAN_CHASE", "https://api.citibankdemobusiness.dev/fin/jpm");
    this.a.sT("BANK_OF_AMERICA", "https://api.citibankdemobusiness.dev/fin/boa");
    this.a.sT("WELLS_FARGO", "https://api.citibankdemobusiness.dev/fin/wfc");
    this.a.sT("MORGAN_STANLEY", "https://api.citibankdemobusiness.dev/fin/ms");
    this.a.sT("GOLDMAN_SACHS", "https://api.citibankdemobusiness.dev/fin/gs");
    this.a.sT("CITIGROUP_INC", "https://api.citibankdemobusiness.dev/fin/cti");
    this.a.sT("HSBC_HOLDINGS", "https://api.citibankdemobusiness.dev/fin/hsbc");
    this.a.sT("BARCLAYS_PLC", "https://api.citibankdemobusiness.dev/fin/brcl");
    this.a.sT("DEUTSCHE_BANK", "https://api.citibankdemobusiness.dev/fin/dtbk");
    this.a.sT("UBS_GROUP_AG", "https://api.citibankdemobusiness.dev/fin/ubs");
    this.a.sT("CREDIT_SUISSE", "https://api.citibankdemobusiness.dev/fin/crds");
    this.a.sT("SOCIETE_GENERALE", "https://api.citibankdemobusiness.dev/fin/sg");
    this.a.sT("BNP_PARIBAS", "https://api.citibankdemobusiness.dev/fin/bnp");
    this.a.sT("ROYAL_BANK_OF_CAN", "https://api.citibankdemobusiness.dev/fin/rbc");
    this.a.sT("TORONTO_DOM_BANK", "https://api.citibankdemobusiness.dev/fin/tdb");
    this.a.sT("SCOTIABANK", "https://api.citibankdemobusiness.dev/fin/scb");
    this.a.sT("CIBC_BANK", "https://api.citibankdemobusiness.dev/fin/cibc");
    this.a.sT("BANK_OF_MONTREAL", "https://api.citibankdemobusiness.dev/fin/bmo");
    this.a.sT("COMMONWEALTH_BANK", "https://api.citibankdemobusiness.dev/fin/cba");
    this.a.sT("WESTPAC_BANK", "https://api.citibankdemobusiness.dev/fin/wpc");
    this.a.sT("ANZ_BANKING_GRP", "https://api.citibankdemobusiness.dev/fin/anz");
    this.a.sT("NAB_BANK", "https://api.citibankdemobusiness.dev/fin/nab");
    this.a.sT("MUFG_BANK", "https://api.citibankdemobusiness.dev/fin/mufg");
    this.a.sT("SMBC_BANK", "https://api.citibankdemobusiness.dev/fin/smbc");
    this.a.sT("MIZUHO_BANK", "https://api.citibankdemobusiness.dev/fin/mzh");
    this.a.sT("JAPAN_POST_BNK", "https://api.citibankdemobusiness.dev/fin/jpb");
    this.a.sT("ICBC_BANK_CHI", "https://api.citibankdemobusiness.dev/fin/icbc");
    this.a.sT("CCB_BANK_CHI", "https://api.citibankdemobusiness.dev/fin/ccb");
    this.a.sT("AGRICULTURAL_BNK", "https://api.citibankdemobusiness.dev/fin/abc");
    this.a.sT("BANK_OF_CHINA", "https://api.citibankdemobusiness.dev/fin/boc");
    this.a.sT("PING_AN_BANK", "https://api.citibankdemobusiness.dev/fin/pab");
    this.a.sT("HDFC_BANK_IND", "https://api.citibankdemobusiness.dev/fin/hdfc");
    this.a.sT("ICICI_BANK_IND", "https://api.citibankdemobusiness.dev/fin/icici");
    this.a.sT("STATE_BANK_OF_IND", "https://api.citibankdemobusiness.dev/fin/sbi");
    this.a.sT("AXIS_BANK_IND", "https://api.citibankdemobusiness.dev/fin/axis");
    this.a.sT("KOTAK_MAHINDRA", "https://api.citibankdemobusiness.dev/fin/km");
    this.a.sT("RELIANCE_IND", "https://api.citibankdemobusiness.dev/ind/rlc");
    this.a.sT("TATA_CONS_SVC", "https://api.citibankdemobusiness.dev/svc/tcs");
    this.a.sT("INFOSYS_LTD", "https://api.citibankdemobusiness.dev/svc/infy");
    this.a.sT("WIPRO_LTD", "https://api.citibankdemobusiness.dev/svc/wpr");
    this.a.sT("TECH_MAHINDRA", "https://api.citibankdemobusiness.dev/svc/tcm");
    this.a.sT("HCL_TECH", "https://api.citibankdemobusiness.dev/svc/hcl");
    this.a.sT("CAPGEMINI_CONS", "https://api.citibankdemobusiness.dev/svc/cpgm");
    this.a.sT("ATOS_IT_SVC", "https://api.citibankdemobusiness.dev/svc/ats");
    this.a.sT("DXC_TECH", "https://api.citibankdemobusiness.dev/svc/dxc");
    this.a.sT("COGNIZANT_TECH", "https://api.citibankdemobusiness.dev/svc/cgnt");
    this.a.sT("EPAM_SYSTEMS", "https://api.citibankdemobusiness.dev/svc/epm");
    this.a.sT("PERSISTENT_SYS", "https://api.citibankdemobusiness.dev/svc/prst");
    this.a.sT("L&T_TECH_SVC", "https://api.citibankdemobusiness.dev/svc/lnt");
    this.a.sT("MINDTREE_LTD", "https://api.citibankdemobusiness.dev/svc/mntr");
    this.a.sT("ZENSAR_TECH", "https://api.citibankdemobusiness.dev/svc/znr");
    this.a.sT("CYIENT_LTD", "https://api.citibankdemobusiness.dev/svc/cynt");
    this.a.sT("TCS_DIGITAL", "https://api.citibankdemobusiness.dev/svc/tcs-dgtl");
    this.a.sT("HCL_DIGITAL_SOL", "https://api.citibankdemobusiness.dev/svc/hcl-dgtl");
    this.a.sT("WIPRO_DIGITAL", "https://api.citibankdemobusiness.dev/svc/wpr-dgtl");
    this.a.sT("INFOSYS_NXT", "https://api.citibankdemobusiness.dev/svc/infy-nxt");
    this.a.sT("AMAZON_RETAIL", "https://api.citibankdemobusiness.dev/ecom/amzn");
    this.a.sT("WALMART_INC", "https://api.citibankdemobusiness.dev/rtl/wlmrt");
    this.a.sT("TARGET_CORP", "https://api.citibankdemobusiness.dev/rtl/trgt");
    this.a.sT("COSTCO_WHSL", "https://api.citibankdemobusiness.dev/rtl/cstc");
    this.a.sT("HOME_DEPOT", "https://api.citibankdemobusiness.dev/rtl/hmdpt");
    this.a.sT("LOWES_COMP", "https://api.citibankdemobusiness.dev/rtl/lws");
    this.a.sT("CVS_HEALTH", "https://api.citibankdemobusiness.dev/hlth/cvs");
    this.a.sT("WALGREENS_BOOTS", "https://api.citibankdemobusiness.dev/hlth/wlgrn");
    this.a.sT("UNITEDHEALTH_GRP", "https://api.citibankdemobusiness.dev/hlth/unh");
    this.a.sT("ANTHEM_INC", "https://api.citibankdemobusiness.dev/hlth/anthm");
    this.a.sT("CIGNA_CORP", "https://api.citibankdemobusiness.dev/hlth/cgn");
    this.a.sT("ETNA_INC", "https://api.citibankdemobusiness.dev/hlth/etn");
    this.a.sT("MERCK_AND_CO", "https://api.citibankdemobusiness.dev/phrm/mrck");
    this.a.sT("PFIZER_INC", "https://api.citibankdemobusiness.dev/phrm/pfzr");
    this.a.sT("JOHNSON_JHNSON", "https://api.citibankdemobusiness.dev/phrm/jnj");
    this.a.sT("ROCHE_HOLDINGS", "https://api.citibankdemobusiness.dev/phrm/rch");
    this.a.sT("NOVARTIS_AG", "https://api.citibankdemobusiness.dev/phrm/nvrt");
    this.a.sT("SANOFI_SA", "https://api.citibankdemobusiness.dev/phrm/snf");
    this.a.sT("GLAXOSMITHKLINE", "https://api.citibankdemobusiness.dev/phrm/gsk");
    this.a.sT("ASTRAZENECA_PLC", "https://api.citibankdemobusiness.dev/phrm/azn");
    this.a.sT("ELI_LILLY_CO", "https://api.citibankdemobusiness.dev/phrm/lly");
    this.a.sT("ABBVIE_INC", "https://api.citibankdemobusiness.dev/phrm/abbv");
    this.a.sT("AMGEN_INC", "https://api.citibankdemobusiness.dev/phrm/amgn");
    this.a.sT("GILEAD_SCIENCES", "https://api.citibankdemobusiness.dev/phrm/gld");
    this.a.sT("BIOGEN_INC", "https://api.citibankdemobusiness.dev/phrm/bgn");
    this.a.sT("MODERNA_INC", "https://api.citibankdemobusiness.dev/phrm/mda");
    this.a.sT("BIONTECH_SE", "https://api.citibankdemobusiness.dev/phrm/bntx");
    this.a.sT("CUREVAC_NV", "https://api.citibankdemobusiness.dev/phrm/cvac");
    this.a.sT("NOVAVAX_INC", "https://api.citibankdemobusiness.dev/phrm/nvx");
    this.a.sT("CATALENT_INC", "https://api.citibankdemobusiness.dev/phrm/ctlt");
    this.a.sT("LONZA_GROUP", "https://api.citibankdemobusiness.dev/phrm/lnz");
    this.a.sT("THERMO_FISHER", "https://api.citibankdemobusiness.dev/biot/tmo");
    this.a.sT("AGILENT_TECH", "https://api.citibankdemobusiness.dev/biot/agln");
    this.a.sT("DANAHER_CORP", "https://api.citibankdemobusiness.dev/biot/dhr");
    this.a.sT("ILLUMINA_INC", "https://api.citibankdemobusiness.dev/biot/ilmn");
    this.a.sT("TWITTER_X", "https://api.citibankdemobusiness.dev/soc/x");
    this.a.sT("META_PLATFORMS", "https://api.citibankdemobusiness.dev/soc/meta");
    this.a.sT("SNAP_INC", "https://api.citibankdemobusiness.dev/soc/snap");
    this.a.sT("TIKTOK_BYTEDANCE", "https://api.citibankdemobusiness.dev/soc/ttok");
    this.a.sT("REDDIT_INC", "https://api.citibankdemobusiness.dev/soc/rdt");
    this.a.sT("PINTEREST_INC", "https://api.citibankdemobusiness.dev/soc/pnt");
    this.a.sT("LINKEDIN_MSFT", "https://api.citibankdemobusiness.dev/soc/lkdn");
    this.a.sT("DISCORD_INC", "https://api.citibankdemobusiness.dev/soc/dscd");
    this.a.sT("SPOTIFY_TECH", "https://api.citibankdemobusiness.dev/mus/sptfy");
    this.a.sT("APPLE_MUSIC", "https://api.citibankdemobusiness.dev/mus/apl-mus");
    this.a.sT("GOOGLE_YOUTUBE", "https://api.citibankdemobusiness.dev/vid/ggl-ytb");
    this.a.sT("NETFLIX_STREAM", "https://api.citibankdemobusiness.dev/vid/nflx-strm");
    this.a.sT("DISNEY_PLUS", "https://api.citibankdemobusiness.dev/vid/dsny-pls");
    this.a.sT("AMAZON_PRIME_VID", "https://api.citibankdemobusiness.dev/vid/amzn-prm");
    this.a.sT("HULU_STREAM", "https://api.citibankdemobusiness.dev/vid/hulu");
    this.a.sT("MAX_STREAMING", "https://api.citibankdemobusiness.dev/vid/max-strm");
    this.a.sT("PARAMOUNT_PLUS", "https://api.citibankdemobusiness.dev/vid/prmnt-pls");
    this.a.sT("PEACOCK_STREAM", "https://api.citibankdemobusiness.dev/vid/pck");
    this.a.sT("ESPN_PLUS", "https://api.citibankdemobusiness.dev/vid/espn-pls");
    this.a.sT("DAZN_STREAM", "https://api.citibankdemobusiness.dev/vid/dzn");
    this.a.sT("NINTENDO_CO_LTD", "https://api.citibankdemobusiness.dev/gam/ntnd");
    this.a.sT("SONY_PLAYSTATION", "https://api.citibankdemobusiness.dev/gam/sny-ps");
    this.a.sT("MICROSOFT_XBOX", "https://api.citibankdemobusiness.dev/gam/msft-xbx");
    this.a.sT("VALVE_STEAM", "https://api.citibankdemobusiness.dev/gam/vlv-stm");
    this.a.sT("EPIC_GAMES", "https://api.citibankdemobusiness.dev/gam/epc");
    this.a.sT("BLIZZARD_ACTVISN", "https://api.citibankdemobusiness.dev/gam/blzz");
    this.a.sT("ELECTRONIC_ARTS", "https://api.citibankdemobusiness.dev/gam/ea");
    this.a.sT("UBISOFT_ENT", "https://api.citibankdemobusiness.dev/gam/ubsft");
    this.a.sT("TAKE_TWO_INT", "https://api.citibankdemobusiness.dev/gam/tktw");
    this.a.sT("CD_PROJEKT_RED", "https://api.citibankdemobusiness.dev/gam/cdpr");
    this.a.sT("ROBLOX_CORP", "https://api.citibankdemobusiness.dev/gam/rblx");
    this.a.sT("UNITY_TECH", "https://api.citibankdemobusiness.dev/gam/unty");
    this.a.sT("UNREAL_ENGINE", "https://api.citibankdemobusiness.dev/gam/unrl");
    this.a.sT("ADOBE_PHSHP", "https://api.citibankdemobusiness.dev/gfx/adb-phs");
    this.a.sT("AUTODESK_MAYA", "https://api.citibankdemobusiness.dev/gfx/atds-my");
    this.a.sT("BLENDER_ORG", "https://api.citibankdemobusiness.dev/gfx/blndr");
    this.a.sT("PIXAR_ANIMATION", "https://api.citibankdemobusiness.dev/gfx/pxr");
    this.a.sT("DISNEY_ANIMATION", "https://api.citibankdemobusiness.dev/gfx/dsny-anm");
    this.a.sT("DREAMWORKS_ANM", "https://api.citibankdemobusiness.dev/gfx/drwks");
    this.a.sT("WARNER_BROS_ENT", "https://api.citibankdemobusiness.dev/ent/wnr-brs");
    this.a.sT("UNIVERSAL_PICS", "https://api.citibankdemobusiness.dev/ent/unvrs");
    this.a.sT("SONY_PICTURES", "https://api.citibankdemobusiness.dev/ent/sny-pct");
    this.a.sT("PARAMOUNT_PICS", "https://api.citibankdemobusiness.dev/ent/prmnt-pct");
    this.a.sT("LIONSGATE_ENT", "https://api.citibankdemobusiness.dev/ent/lgt");
    this.a.sT("A24_FILMS", "https://api.citibankdemobusiness.dev/ent/a24");
    this.a.sT("LEGENDARY_ENT", "https://api.citibankdemobusiness.dev/ent/lgndry");
    this.a.sT("COMCAST_CORP", "https://api.citibankdemobusiness.dev/tele/cmcst");
    this.a.sT("CHARTER_COMM", "https://api.citibankdemobusiness.dev/tele/chtr");
    this.a.sT("VERIZON_COMM", "https://api.citibankdemobusiness.dev/tele/vrzn");
    this.a.sT("AT&T_CORP", "https://api.citibankdemobusiness.dev/tele/att");
    this.a.sT("T_MOBILE_US", "https://api.citibankdemobusiness.dev/tele/tmb");
    this.a.sT("VODAFONE_GROUP", "https://api.citibankdemobusiness.dev/tele/vdfn");
    this.a.sT("DEUTSCHE_TELEKOM", "https://api.citibankdemobusiness.dev/tele/dttk");
    this.a.sT("BT_GROUP", "https://api.citibankdemobusiness.dev/tele/bt");
    this.a.sT("ORANGE_SA", "https://api.citibankdemobusiness.dev/tele/rng");
    this.a.sT("TELEFONICA_SA", "https://api.citibankdemobusiness.dev/tele/telf");
    this.a.sT("TELSTRA_CORP", "https://api.citibankdemobusiness.dev/tele/tlstr");
    this.a.sT("SINGTEL_LTD", "https://api.citibankdemobusiness.dev/tele/sngtl");
    this.a.sT("SOFTBANK_CORP", "https://api.citibankdemobusiness.dev/tele/sftbnk");
    this.a.sT("NTT_DOCOMO", "https://api.citibankdemobusiness.dev/tele/ntt-dcm");
    this.a.sT("KDDI_CORP", "https://api.citibankdemobusiness.dev/tele/kddi");
    this.a.sT("SK_TELECOM", "https://api.citibankdemobusiness.dev/tele/skt");
    this.a.sT("KT_CORP", "https://api.citibankdemobusiness.dev/tele/kt");
    this.a.sT("CHINA_MOBILE", "https://api.citibankdemobusiness.dev/tele/chn-mbl");
    this.a.sT("CHINA_TELECOM", "https://api.citibankdemobusiness.dev/tele/chn-tlcm");
    this.a.sT("CHINA_UNICOM", "https://api.citibankdemobusiness.dev/tele/chn-uncm");
    this.a.sT("ROKUSAN_PHARM", "https://api.citibankdemobusiness.dev/phrm/rksn");
    this.a.sT("BIOGEN_PHARM", "https://api.citibankdemobusiness.dev/phrm/biog");
    this.a.sT("GENENTECH_BIOT", "https://api.citibankdemobusiness.dev/biot/gnntch");
    this.a.sT("AMAZON_HEALTH", "https://api.citibankdemobusiness.dev/hlth/amzn-hlth");
    this.a.sT("GOOGLE_HEALTH", "https://api.citibankdemobusiness.dev/hlth/ggl-hlth");
    this.a.sT("APPLE_HEALTH", "https://api.citibankdemobusiness.dev/hlth/apl-hlth");
    this.a.sT("FITBIT_DEVICE", "https://api.citibankdemobusiness.dev/hlth/ftbt");
    this.a.sT("GARMIN_FITNESS", "https://api.citibankdemobusiness.dev/hlth/grmn");
    this.a.sT("PELOTON_BIKE", "https://api.citibankdemobusiness.dev/hlth/pltn");
    this.a.sT("NIKE_INC", "https://api.citibankdemobusiness.dev/ath/nk");
    this.a.sT("ADIDAS_AG", "https://api.citibankdemobusiness.dev/ath/add");
    this.a.sT("PUMA_SE", "https://api.citibankdemobusiness.dev/ath/pm");
    this.a.sT("UNDER_ARMOUR", "https://api.citibankdemobusiness.dev/ath/ua");
    this.a.sT("LUXOTTICA_EYEWR", "https://api.citibankdemobusiness.dev/fshn/lxtc");
    this.a.sT("LVMH_FASHION", "https://api.citibankdemobusiness.dev/fshn/lvmh");
    this.a.sT("KERING_GROUP", "https://api.citibankdemobusiness.dev/fshn/krg");
    this.a.sT("HERMES_INTL", "https://api.citibankdemobusiness.dev/fshn/hrms");
    this.a.sT("CHANEL_SA", "https://api.citibankdemobusiness.dev/fshn/chnl");
    this.a.sT("PRADA_SPA", "https://api.citibankdemobusiness.dev/fshn/prd");
    this.a.sT("BURBERRY_GROUP", "https://api.citibankdemobusiness.dev/fshn/brbry");
    this.a.sT("RALPH_LAUREN", "https://api.citibankdemobusiness.dev/fshn/rlph");
    this.a.sT("H&M_HNNES", "https://api.citibankdemobusiness.dev/fshn/hm");
    this.a.sT("ZARA_INDITEX", "https://api.citibankdemobusiness.dev/fshn/zra");
    this.a.sT("GAP_INC", "https://api.citibankdemobusiness.dev/fshn/gp");
    this.a.sT("AMERICAN_EAGLE", "https://api.citibankdemobusiness.dev/fshn/ame");
    this.a.sT("LEVIS_STRAUSS", "https://api.citibankdemobusiness.dev/fshn/lvs");
    this.a.sT("UNILEVER_PLC", "https://api.citibankdemobusiness.dev/cnsm/unlvr");
    this.a.sT("PROCTER_GAMBLE", "https://api.citibankdemobusiness.dev/cnsm/prctg");
    this.a.sT("NESTLE_SA", "https://api.citibankdemobusiness.dev/fud/nstl");
    this.a.sT("PEPSICO_INC", "https://api.citibankdemobusiness.dev/fud/ppsc");
    this.a.sT("COCA_COLA_CO", "https://api.citibankdemobusiness.dev/fud/ccc");
    this.a.sT("MCDONALDS_CORP", "https://api.citibankdemobusiness.dev/fud/mcdd");
    this.a.sT("STARBUCKS_CORP", "https://api.citibankdemobusiness.dev/fud/stbk");
    this.a.sT("KRAFT_HEINZ_CO", "https://api.citibankdemobusiness.dev/fud/krft");
    this.a.sT("MONDELEZ_INTL", "https://api.citibankdemobusiness.dev/fud/mndlz");
    this.a.sT("GENERAL_MILLS", "https://api.citibankdemobusiness.dev/fud/gnml");
    this.a.sT("KELLOGG_CO", "https://api.citibankdemobusiness.dev/fud/kllg");
    this.a.sT("DANONE_SA", "https://api.citibankdemobusiness.dev/fud/dnn");
    this.a.sT("CARGILL_INC", "https://api.citibankdemobusiness.dev/agr/crgl");
    this.a.sT("ARCHER_DANIELS", "https://api.citibankdemobusiness.dev/agr/adm");
    this.a.sT("DOWDUPONT_INC", "https://api.citibankdemobusiness.dev/chm/dwdpt");
    this.a.sT("BASF_SE", "https://api.citibankdemobusiness.dev/chm/basf");
    this.a.sT("BAYER_AG", "https://api.citibankdemobusiness.dev/chm/byr");
    this.a.sT("CHEMOURS_CO", "https://api.citibankdemobusiness.dev/chm/chmrs");
    this.a.sT("PPG_INDUSTRIES", "https://api.citibankdemobusiness.dev/chm/ppg");
    this.a.sT("SHERWIN_WILLIAMS", "https://api.citibankdemobusiness.dev/chm/shrwn");
    this.a.sT("LINDE_PLC", "https://api.citibankdemobusiness.dev/gas/lnd");
    this.a.sT("AIR_LIQUIDE", "https://api.citibankdemobusiness.dev/gas/airlqd");
    this.a.sT("AIR_PRODUCTS", "https://api.citibankdemobusiness.dev/gas/airprd");
    this.a.sT("PRAXAIR_INC", "https://api.citibankdemobusiness.dev/gas/prxr");
    this.a.sT("CONOCOPHILLIPS", "https://api.citibankdemobusiness.dev/oil/cncp");
    this.a.sT("EXXONMOBIL_CORP", "https://api.citibankdemobusiness.dev/oil/xnm");
    this.a.sT("CHEVRON_CORP", "https://api.citibankdemobusiness.dev/oil/chv");
    this.a.sT("SHELL_PLC", "https://api.citibankdemobusiness.dev/oil/shll");
    this.a.sT("BP_PLC", "https://api.citibankdemobusiness.dev/oil/bp");
    this.a.sT("TOTALENERGIES_SE", "https://api.citibankdemobusiness.dev/oil/ttl");
    this.a.sT("SAUDI_ARAMCO", "https://api.citibankdemobusiness.dev/oil/srmc");
    this.a.sT("GAZPROM_PJSC", "https://api.citibankdemobusiness.dev/gas/gzp");
    this.a.sT("ENI_SPA", "https://api.citibankdemobusiness.dev/oil/eni");
    this.a.sT("EQUINOR_ASA", "https://api.citibankdemobusiness.dev/oil/eqnr");
    this.a.sT("REPSOL_SA", "https://api.citibankdemobusiness.dev/oil/rpsl");
    this.a.sT("PETROBRAS_SA", "https://api.citibankdemobusiness.dev/oil/ptrbrs");
    this.a.sT("PEMEX_MEXICO", "https://api.citibankdemobusiness.dev/oil/pmx");
    this.a.sT("PDVSA_VENEZ", "https://api.citibankdemobusiness.dev/oil/pdvsa");
    this.a.sT("ROSNEFT_PJSC", "https://api.citibankdemobusiness.dev/oil/rsnft");
    this.a.sT("LUKOIL_PJSC", "https://api.citibankdemobusiness.dev/oil/lkl");
    this.a.sT("SINOPEC_GROUP", "https://api.citibankdemobusiness.dev/oil/snp");
    this.a.sT("PETROCHINA_CO", "https://api.citibankdemobusiness.dev/oil/ptrchn");
    this.a.sT("CNOOC_LTD", "https://api.citibankdemobusiness.dev/oil/cnoc");
    this.a.sT("EOG_RESOURCES", "https://api.citibankdemobusiness.dev/oil/eog");
    this.a.sT("PIONEER_NATURAL", "https://api.citibankdemobusiness.dev/oil/pnrm");
    this.a.sT("OCCIDENTAL_PET", "https://api.citibankdemobusiness.dev/oil/oxy");
    this.a.sT("HESS_CORP", "https://api.citibankdemobusiness.dev/oil/hss");
    this.a.sT("MARATHON_OIL", "https://api.citibankdemobusiness.dev/oil/mro");
    this.a.sT("DEVON_ENERGY", "https://api.citibankdemobusiness.dev/oil/dvn");
    this.a.sT("CHESAPEAKE_ENRG", "https://api.citibankdemobusiness.dev/oil/chk");
    this.a.sT("EQT_CORP", "https://api.citibankdemobusiness.dev/oil/eqt");
    this.a.sT("ANTERO_RES", "https://api.citibankdemobusiness.dev/oil/atr");
    this.a.sT("SOUTHWESTERN_EN", "https://api.citibankdemobusiness.dev/oil/swn");
    this.a.sT("RIVERSTONE_HOLD", "https://api.citibankdemobusiness.dev/fin/rvrstn");
    this.a.sT("BLACKSTONE_GRP", "https://api.citibankdemobusiness.dev/fin/blkstn");
    this.a.sT("KKR_CO", "https://api.citibankdemobusiness.dev/fin/kkr");
    this.a.sT("CARLYLE_GROUP", "https://api.citibankdemobusiness.dev/fin/crlyl");
    this.a.sT("APOLLO_GLB_MNG", "https://api.citibankdemobusiness.dev/fin/aplo");
    this.a.sT("VENTAS_INC", "https://api.citibankdemobusiness.dev/rlt/vnts");
    this.a.sT("SIMON_PPTY_GRP", "https://api.citibankdemobusiness.dev/rlt/smpr");
    this.a.sT("PUBLIC_STORAGE", "https://api.citibankdemobusiness.dev/rlt/pbstg");
    this.a.sT("AMERICAN_TOWER", "https://api.citibankdemobusiness.dev/rlt/amtwr");
    this.a.sT("PROLOGIS_INC", "https://api.citibankdemobusiness.dev/rlt/plg");
    this.a.sT("EQUINIX_INC", "https://api.citibankdemobusiness.dev/rlt/eqnx");
    this.a.sT("REALTY_INCOME", "https://api.citibankdemobusiness.dev/rlt/rly");
    this.a.sT("DIGITAL_REALTY", "https://api.citibankdemobusiness.dev/rlt/dgr");
    this.a.sT("DUKE_REALTY", "https://api.citibankdemobusiness.dev/rlt/dkr");
    this.a.sT("ESSEX_PPTY_TRST", "https://api.citibankdemobusiness.dev/rlt/essx");
    this.a.sT("AVALONBAY_CMPL", "https://api.citibankdemobusiness.dev/rlt/avb");
    this.a.sT("EQUITY_RESIDN", "https://api.citibankdemobusiness.dev/rlt/eqix");
    this.a.sT("INVITATION_HME", "https://api.citibankdemobusiness.dev/rlt/invh");
    this.a.sT("DARDEN_RESTAURANTS", "https://api.citibankdemobusiness.dev/rst/drdn");
    this.a.sT("CHIPOTLE_MEX_GRL", "https://api.citibankdemobusiness.dev/rst/cmg");
    this.a.sT("STARBUCKS_CORP_RST", "https://api.citibankdemobusiness.dev/rst/stbk");
    this.a.sT("YUM_BRANDS_INC", "https://api.citibankdemobusiness.dev/rst/yum");
    this.a.sT("DOMINOS_PIZZA", "https://api.citibankdemobusiness.dev/rst/dpz");
    this.a.sT("MCDONALDS_CORP_RST", "https://api.citibankdemobusiness.dev/rst/mcdd-rst");
    this.a.sT("BURGER_KING_RBI", "https://api.citibankdemobusiness.dev/rst/bkr");
    this.a.sT("WENDYS_CO", "https://api.citibankdemobusiness.dev/rst/wndy");
    this.a.sT("SUBWAY_FRNCHSE", "https://api.citibankdemobusiness.dev/rst/sbwy");
    this.a.sT("KFC_YUM", "https://api.citibankdemobusiness.dev/rst/kfc");
    this.a.sT("TACO_BELL_YUM", "https://api.citibankdemobusiness.dev/rst/tbll");
    this.a.sT("PIZZA_HUT_YUM", "https://api.citibankdemobusiness.dev/rst/pzht");
    this.a.sT("DUNKIN_BRANDS", "https://api.citibankdemobusiness.dev/rst/dnkn");
    this.a.sT("COFFEE_BEAN_TEA", "https://api.citibankdemobusiness.dev/rst/cbtl");
    this.a.sT("TIM_HORTONS_RBI", "https://api.citibankdemobusiness.dev/rst/tmht");
    this.a.sT("CHICK_FIL_A_INC", "https://api.citibankdemobusiness.dev/rst/cfa");
    this.a.sT("PANERA_BREAD_INC", "https://api.citibankdemobusiness.dev/rst/pnr");
    this.a.sT("TEXAS_ROADHOUSE", "https://api.citibankdemobusiness.dev/rst/txrh");
    this.a.sT("OLIVE_GARDEN_DRDN", "https://api.citibankdemobusiness.dev/rst/olvg");
    this.a.sT("LONGHORN_STKHSE", "https://api.citibankdemobusiness.dev/rst/lhsk");
    this.a.sT("APPLEBEES_GRLL", "https://api.citibankdemobusiness.dev/rst/aplb");
    this.a.sT("CHILIS_GRILL", "https://api.citibankdemobusiness.dev/rst/chls");
    this.a.sT("RED_LOBSTER_RST", "https://api.citibankdemobusiness.dev/rst/rllb");
    this.a.sT("CRACKER_BARREL", "https://api.citibankdemobusiness.dev/rst/crkbrl");
    this.a.sT("DENNYS_CORP", "https://api.citibankdemobusiness.dev/rst/dnny");
    this.a.sT("IHOP_DYNC", "https://api.citibankdemobusiness.dev/rst/ihop");
    this.a.sT("WAFFLE_HOUSE_INC", "https://api.citibankdemobusiness.dev/rst/wflh");
    this.a.sT("GOLDEN_CORRAL", "https://api.citibankdemobusiness.dev/rst/gldncrrl");
    this.a.sT("RYANS_STEAKHS", "https://api.citibankdemobusiness.dev/rst/ryns");
    this.a.sT("OUTBACK_STKHSE", "https://api.citibankdemobusiness.dev/rst/otbk");
    this.a.sT("RED_ROBIN_GMBH", "https://api.citibankdemobusiness.dev/rst/rdrbn");
    this.a.sT("FIV_GUYS_BURG", "https://api.citibankdemobusiness.dev/rst/fvgy");
    this.a.sT("IN_N_OUT_BURG", "https://api.citibankdemobusiness.dev/rst/inot");
    this.a.sT("SHAKE_SHACK_INC", "https://api.citibankdemobusiness.dev/rst/shkshk");
    this.a.sT("QDOBA_MEX_EATS", "https://api.citibankdemobusiness.dev/rst/qdba");
    this.a.sT("MOES_SW_GRILL", "https://api.citibankdemobusiness.dev/rst/moes");
    this.a.sT("PANDA_EXPRESS", "https://api.citibankdemobusiness.dev/rst/pnda");
    this.a.sT("DOMINOS_PIZZA_INTL", "https://api.citibankdemobusiness.dev/rst/dpzi");
    this.a.sT("PIZZA_HUT_INTL", "https://api.citibankdemobusiness.dev/rst/phti");
    this.a.sT("PAPA_JOHNS_INTL", "https://api.citibankdemobusiness.dev/rst/pjpzi");
    this.a.sT("LITTLE_CAESARS", "https://api.citibankdemobusiness.dev/rst/ltlc");
    this.a.sT("GODFATHERS_PIZZA", "https://api.citibankdemobusiness.dev/rst/gdfthrs");
    this.a.sT("CALIFORNIA_PIZZA", "https://api.citibankdemobusiness.dev/rst/cpk");
    this.a.sT("BLAZE_PIZZA", "https://api.citibankdemobusiness.dev/rst/blz");
    this.a.sT("MOD_PIZZA", "https://api.citibankdemobusiness.dev/rst/mdp");
    this.a.sT("JET_PIZZA", "https://api.citibankdemobusiness.dev/rst/jetp");
    this.a.sT("MARCOS_PIZZA", "https://api.citibankdemobusiness.dev/rst/mrcsp");
    this.a.sT("PAPA_MURPHYS", "https://api.citibankdemobusiness.dev/rst/pmp");
    this.a.sT("ROUND_TABLE_PIZZA", "https://api.citibankdemobusiness.dev/rst/rndtbl");
    this.a.sT("SMASHBURGER_LLC", "https://api.citibankdemobusiness.dev/rst/smshb");
    this.a.sT("FIVE_GUYS_BURGERS_INTL", "https://api.citibankdemobusiness.dev/rst/fvgyi");
    this.a.sT("WHATABURGER_LLC", "https://api.citibankdemobusiness.dev/rst/whtb");
    this.a.sT("CULVERS_FRANCHSE", "https://api.citibankdemobusiness.dev/rst/clvrs");
    this.a.sT("ARAMARK_CORP", "https://api.citibankdemobusiness.dev/svc/armrk");
    this.a.sT("SODEXO_SA", "https://api.citibankdemobusiness.dev/svc/sdxo");
    this.a.sT("COMPASS_GROUP", "https://api.citibankdemobusiness.dev/svc/cmps");
    this.a.sT("GASTRO_ENT_GRP", "https://api.citibankdemobusiness.dev/svc/gstr");
    this.a.sT("HMSHOST_CORP", "https://api.citibankdemobusiness.dev/svc/hmhst");
    this.a.sT("DELAWARE_NORTH", "https://api.citibankdemobusiness.dev/svc/dlwnth");
    this.a.sT("ARCTIC_CUP_CO", "https://api.citibankdemobusiness.dev/fud/artc");
    this.a.sT("JAB_HOLDING_CO", "https://api.citibankdemobusiness.dev/inv/jabhld");
    this.a.sT("KEURIG_DR_PEPPER", "https://api.citibankdemobusiness.dev/fud/kdp");
    this.a.sT("MONSTER_BVRG", "https://api.citibankdemobusiness.dev/fud/mnstr");
    this.a.sT("REDBULL_GMBH", "https://api.citibankdemobusiness.dev/fud/rdbll");
    this.a.sT("CAMPBELL_SOUP_CO", "https://api.citibankdemobusiness.dev/fud/cmpl");
    this.a.sT("CONAGRA_BRANDS", "https://api.citibankdemobusiness.dev/fud/cngr");
    this.a.sT("MC_CORMICK_CO", "https://api.citibankdemobusiness.dev/fud/mcc");
    this.a.sT("J.M._SMUCKER_CO", "https://api.citibankdemobusiness.dev/fud/jmstk");
    this.a.sT("HORMEL_FOODS", "https://api.citibankdemobusiness.dev/fud/hrml");
    this.a.sT("TYSON_FOODS_INC", "https://api.citibankdemobusiness.dev/fud/tsn");
    this.a.sT("PILGRIMS_PRIDE", "https://api.citibankdemobusiness.dev/fud/plgrm");
    this.a.sT("SMITHFIELD_FOODS", "https://api.citibankdemobusiness.dev/fud/smthfld");
    this.a.sT("KRAFT_FOODS_GRP", "https://api.citibankdemobusiness.dev/fud/krftf");
    this.a.sT("GENERAL_MILLS_IN", "https://api.citibankdemobusiness.dev/fud/gnmll");
    this.a.sT("PEPSICO_INTL", "https://api.citibankdemobusiness.dev/fud/ppsci");
    this.a.sT("COCA_COLA_INTL", "https://api.citibankdemobusiness.dev/fud/ccci");
    this.a.sT("NESTLE_INTL", "https://api.citibankdemobusiness.dev/fud/nstli");
    this.a.sT("UNILEVER_INTL", "https://api.citibankdemobusiness.dev/cnsm/unlvr-i");
    this.a.sT("PROCTER_GAMBLE_IN", "https://api.citibankdemobusiness.dev/cnsm/prctg-i");
    this.a.sT("MARS_INC", "https://api.citibankdemobusiness.dev/fud/mrs");
    this.a.sT("FERRERO_GROUP", "https://api.citibankdemobusiness.dev/fud/frrgrp");
    this.a.sT("HERSHEY_CO", "https://api.citibankdemobusiness.dev/fud/hrsh");
    this.a.sT("CADBURY_SCHWPS", "https://api.citibankdemobusiness.dev/fud/cdbry");
    this.a.sT("DR_PEPPER_SNPL", "https://api.citibankdemobusiness.dev/fud/dpsn");
    this.a.sT("COCA_COLA_EURPC", "https://api.citibankdemobusiness.dev/fud/cceu");
    this.a.sT("REYNOLDS_AMER", "https://api.citibankdemobusiness.dev/tbc/rynlds");
    this.a.sT("ALTRIA_GROUP", "https://api.citibankdemobusiness.dev/tbc/altr");
    this.a.sT("PHILIP_MORRIS_INTL", "https://api.citibankdemobusiness.dev/tbc/pmc");
    this.a.sT("BRITISH_AMER_TBC", "https://api.citibankdemobusiness.dev/tbc/bat");
    this.a.sT("IMPERIAL_BRANDS", "https://api.citibankdemobusiness.dev/tbc/imprl");
    this.a.sT("JAPAN_TOBACCO", "https://api.citibankdemobusiness.dev/tbc/jptb");
    this.a.sT("GENTING_BERHAD", "https://api.citibankdemobusiness.dev/ent/gntng");
    this.a.sT("WYNN_RESORTS", "https://api.citibankdemobusiness.dev/ent/wyn");
    this.a.sT("LAS_VEGAS_SANDS", "https://api.citibankdemobusiness.dev/ent/lvsd");
    this.a.sT("MGM_RESORTS", "https://api.citibankdemobusiness.dev/ent/mgm");
    this.a.sT("CAESARS_ENTER", "https://api.citibankdemobusiness.dev/ent/csrs");
    this.a.sT("PEN_NATL_GAMING", "https://api.citibankdemobusiness.dev/ent/pngm");
    this.a.sT("BOYD_GAMING", "https://api.citibankdemobusiness.dev/ent/bydgm");
    this.a.sT("GALAXY_ENTER", "https://api.citibankdemobusiness.dev/ent/glxy");
    this.a.sT("SJM_HOLDINGS", "https://api.citibankdemobusiness.dev/ent/sjm");
    this.a.sT("MELCO_RESORTS", "https://api.citibankdemobusiness.dev/ent/mlc");
    this.a.sT("SUN_ENTERTAINMENT", "https://api.citibankdemobusiness.dev/ent/sunent");
    this.a.sT("HARD_ROCK_INTL", "https://api.citibankdemobusiness.dev/ent/hrdck");
    this.a.sT("TRIBAL_GAMING_MT", "https://api.citibankdemobusiness.dev/ent/trblgm");
    this.a.sT("INTERNATIONAL_GAME", "https://api.citibankdemobusiness.dev/ent/igms");
    this.a.sT("SCIENTIFIC_GAMES", "https://api.citibankdemobusiness.dev/ent/scgm");
    this.a.sT("ARISTOCRAT_LTD", "https://api.citibankdemobusiness.dev/ent/arst");
    this.a.sT("LIGHT_WONDER", "https://api.citibankdemobusiness.dev/ent/lghwndr");
    this.a.sT("EVERI_HOLDINGS", "https://api.citibankdemobusiness.dev/ent/evri");
    this.a.sT("PLAYTECH_PLC", "https://api.citibankdemobusiness.dev/ent/pltch");
    this.a.sT("KINDER_MORGAN", "https://api.citibankdemobusiness.dev/nrgy/kndr");
    this.a.sT("ENTERPRISE_PROD", "https://api.citibankdemobusiness.dev/nrgy/epd");
    this.a.sT("PLAINS_ALL_AMER", "https://api.citibankdemobusiness.dev/nrgy/paa");
    this.a.sT("ENBRIDGE_INC", "https://api.citibankdemobusiness.dev/nrgy/enbrg");
    this.a.sT("TC_ENERGY_CORP", "https://api.citibankdemobusiness.dev/nrgy/tce");
    this.a.sT("NEXTERA_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/nee");
    this.a.sT("DUKE_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/dke");
    this.a.sT("SOUTHERN_CO", "https://api.citibankdemobusiness.dev/nrgy/soco");
    this.a.sT("DOMINION_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/dmn");
    this.a.sT("EXELON_CORP", "https://api.citibankdemobusiness.dev/nrgy/exl");
    this.a.sT("PG&E_CORP", "https://api.citibankdemobusiness.dev/nrgy/pge");
    this.a.sT("CONSOLIDATED_ED", "https://api.citibankdemobusiness.dev/nrgy/ed");
    this.a.sT("AMERICAN_ELECTRIC", "https://api.citibankdemobusiness.dev/nrgy/aep");
    this.a.sT("FIRSTENERGY_CORP", "https://api.citibankdemobusiness.dev/nrgy/fe");
    this.a.sT("EVERSOURCE_ENRG", "https://api.citibankdemobusiness.dev/nrgy/es");
    this.a.sT("XCEL_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/xel");
    this.a.sT("NISOURCE_INC", "https://api.citibankdemobusiness.dev/nrgy/ni");
    this.a.sT("PPL_CORP", "https://api.citibankdemobusiness.dev/nrgy/ppl");
    this.a.sT("CMS_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/cms");
    this.a.sT("PINNACLE_WEST", "https://api.citibankdemobusiness.dev/nrgy/pny");
    this.a.sT("SUNCOR_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/su");
    this.a.sT("CANADIAN_NATL_RES", "https://api.citibankdemobusiness.dev/nrgy/cnq");
    this.a.sT("ENCANA_CORP", "https://api.citibankdemobusiness.dev/nrgy/eca");
    this.a.sT("CENOVUS_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/cvx");
    this.a.sT("IMPERIAL_OIL", "https://api.citibankdemobusiness.dev/nrgy/imo");
    this.a.sT("HUSKY_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/hsk");
    this.a.sT("BAYTEX_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/bte");
    this.a.sT("CRESCENT_POINT", "https://api.citibankdemobusiness.dev/nrgy/cpg");
    this.a.sT("OBSIDIAN_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/obe");
    this.a.sT("VERMILION_ENRG", "https://api.citibankdemobusiness.dev/nrgy/vett");
    this.a.sT("WHITE_CAP_RES", "https://api.citibankdemobusiness.dev/nrgy/wcp");
    this.a.sT("NUVO_RESOURCES", "https://api.citibankdemobusiness.dev/nrgy/nuv");
    this.a.sT("MEG_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/meg");
    this.a.sT("TOURMALINE_OIL", "https://api.citibankdemobusiness.dev/nrgy/tov");
    this.a.sT("ARC_RESOURCES", "https://api.citibankdemobusiness.dev/nrgy/arc");
    this.a.sT("PARAMOUNT_RES", "https://api.citibankdemobusiness.dev/nrgy/prt");
    this.a.sT("BIRCHCLIFF_ENRG", "https://api.citibankdemobusiness.dev/nrgy/bne");
    this.a.sT("BONTERRA_ENRG", "https://api.citibankdemobusiness.dev/nrgy/bnef");
    this.a.sT("COLONIAL_PIPE", "https://api.citibankdemobusiness.dev/nrgy/cln");
    this.a.sT("TRANSOCEAN_LTD", "https://api.citibankdemobusiness.dev/nrgy/rig");
    this.a.sT("SCHLUMBERGER_NV", "https://api.citibankdemobusiness.dev/nrgy/slb");
    this.a.sT("HALLIBURTON_CO", "https://api.citibankdemobusiness.dev/nrgy/hal");
    this.a.sT("BAKER_HUGHES_CO", "https://api.citibankdemobusiness.dev/nrgy/bkr");
    this.a.sT("NATIONAL_OILWELL", "https://api.citibankdemobusiness.dev/nrgy/nov");
    this.a.sT("WEATHERFORD_INT", "https://api.citibankdemobusiness.dev/nrgy/wft");
    this.a.sT("TECHNIPFMC_PLC", "https://api.citibankdemobusiness.dev/nrgy/ftin");
    this.a.sT("SUBSEA_7_SA", "https://api.citibankdemobusiness.dev/nrgy/su7");
    this.a.sT("VALARIS_PLC", "https://api.citibankdemobusiness.dev/nrgy/val");
    this.a.sT("NOBLE_CORP", "https://api.citibankdemobusiness.dev/nrgy/ne");
    this.a.sT("DIAMOND_OFFSHORE", "https://api.citibankdemobusiness.dev/nrgy/do");
    this.a.sT("TRANSOCEAN_DEEPW", "https://api.citibankdemobusiness.dev/nrgy/tods");
    this.a.sT("HELmerich_PAYNE", "https://api.citibankdemobusiness.dev/nrgy/hp");
    this.a.sT("NABORS_INDUSTRIES", "https://api.citibankdemobusiness.dev/nrgy/nbr");
    this.a.sT("PATTERSON_UTI", "https://api.citibankdemobusiness.dev/nrgy/pten");
    this.a.sT("RPC_INC", "https://api.citibankdemobusiness.dev/nrgy/rpc");
    this.a.sT("CORE_LABORATORIES", "https://api.citibankdemobusiness.dev/nrgy/clb");
    this.a.sT("GEOPHYSICAL_TECH", "https://api.citibankdemobusiness.dev/nrgy/gpx");
    this.a.sT("SEISMIC_DATA_SOL", "https://api.citibankdemobusiness.dev/nrgy/sds");
    this.a.sT("SAExploration_HDL", "https://api.citibankdemobusiness.dev/nrgy/saex");
    this.a.sT("ION_GEOPHYSICAL", "https://api.citibankdemobusiness.dev/nrgy/ion");
    this.a.sT("CGG_SA", "https://api.citibankdemobusiness.dev/nrgy/cgg");
    this.a.sT("TGS_ASA", "https://api.citibankdemobusiness.dev/nrgy/tgs");
    this.a.sT("PETROLEUM_GEO_SVC", "https://api.citibankdemobusiness.dev/nrgy/pgs");
    this.a.sT("WOOD_GROUP", "https://api.citibankdemobusiness.dev/nrgy/wg");
    this.a.sT("JOHN_WOOD_GRP", "https://api.citibankdemobusiness.dev/nrgy/jwg");
    this.a.sT("KBR_INC", "https://api.citibankdemobusiness.dev/nrgy/kbr");
    this.a.sT("FLUOR_CORP", "https://api.citibankdemobusiness.dev/nrgy/flr");
    this.a.sT("JACOBS_ENGRG", "https://api.citibankdemobusiness.dev/nrgy/j");
    this.a.sT("AECOM_TECH", "https://api.citibankdemobusiness.dev/nrgy/acm");
    this.a.sT("WSP_GLOBAL", "https://api.citibankdemobusiness.dev/nrgy/wsp");
    this.a.sT("STANTEC_INC", "https://api.citibankdemobusiness.dev/nrgy/stn");
    this.a.sT("GHD_PTY_LTD", "https://api.citibankdemobusiness.dev/nrgy/ghd");
    this.a.sT("ARUP_GROUP", "https://api.citibankdemobusiness.dev/nrgy/arup");
    this.a.sT("SNC_LAVALIN_GRP", "https://api.citibankdemobusiness.dev/nrgy/snc");
    this.a.sT("BLACK_VEATCH_CORP", "https://api.citibankdemobusiness.dev/nrgy/bvc");
    this.a.sT("BECHTEL_CORP", "https://api.citibankdemobusiness.dev/nrgy/bchtl");
    this.a.sT("CB&I_INC", "https://api.citibankdemobusiness.dev/nrgy/cbi");
    this.a.sT("FOSTER_WHEELER", "https://api.citibankdemobusiness.dev/nrgy/fwhlr");
    this.a.sT("MCDERMOTT_INTL", "https://api.citibankdemobusiness.dev/nrgy/mdmnt");
    this.a.sT("TECHNIP_FMC", "https://api.citibankdemobusiness.dev/nrgy/tfmc");
    this.a.sT("AKER_SOLUTIONS", "https://api.citibankdemobusiness.dev/nrgy/akers");
    this.a.sT("SUBSEA7_SA", "https://api.citibankdemobusiness.dev/nrgy/sbs7");
    this.a.sT("GE_POWER", "https://api.citibankdemobusiness.dev/nrgy/gepwr");
    this.a.sT("SIEMENS_ENERGY", "https://api.citibankdemobusiness.dev/nrgy/smnse");
    this.a.sT("MITSUBISHI_PWR", "https://api.citibankdemobusiness.dev/nrgy/mpwr");
    this.a.sT("HITACHI_ABB_PWR", "https://api.citibankdemobusiness.dev/nrgy/habpwr");
    this.a.sT("VESTAS_WIND_SYS", "https://api.citibankdemobusiness.dev/nrgy/vws");
    this.a.sT("SIEMENS_GAMSA", "https://api.citibankdemobusiness.dev/nrgy/sgmsa");
    this.a.sT("GENERAL_ELECTRIC", "https://api.citibankdemobusiness.dev/nrgy/ge");
    this.a.sT("GE_RENEW_ENRG", "https://api.citibankdemobusiness.dev/nrgy/gern");
    this.a.sT("ENPHASE_ENERG", "https://api.citibankdemobusiness.dev/nrgy/enph");
    this.a.sT("SOLAREDGE_TECH", "https://api.citibankdemobusiness.dev/nrgy/sedg");
    this.a.sT("SUNRUN_INC", "https://api.citibankdemobusiness.dev/nrgy/run");
    this.a.sT("SUNPOWER_CORP", "https://api.citibankdemobusiness.dev/nrgy/spwr");
    this.a.sT("JINKO_SOLAR_HOLD", "https://api.citibankdemobusiness.dev/nrgy/jks");
    this.a.sT("CANADIAN_SOLAR", "https://api.citibankdemobusiness.dev/nrgy/csiq");
    this.a.sT("FIRST_SOLAR_INC", "https://api.citibankdemobusiness.dev/nrgy/fslr");
    this.a.sT("TRINA_SOLAR_LTD", "https://api.citibankdemobusiness.dev/nrgy/tsl");
    this.a.sT("LG_CHEM_LTD", "https://api.citibankdemobusiness.dev/nrgy/lgchm");
    this.a.sT("SAMSUNG_SDI", "https://api.citibankdemobusiness.dev/nrgy/smsng-sdi");
    this.a.sT("PANASONIC_ENRG", "https://api.citibankdemobusiness.dev/nrgy/pnsnc-enrg");
    this.a.sT("BYD_COMPANY_LTD", "https://api.citibankdemobusiness.dev/nrgy/byd-co");
    this.a.sT("CONTEMPORARY_AMPX", "https://api.citibankdemobusiness.dev/nrgy/catl");
    this.a.sT("FREYR_BATTERY", "https://api.citibankdemobusiness.dev/nrgy/fryr");
    this.a.sT("QUANTUMSCAPE_CORP", "https://api.citibankdemobusiness.dev/nrgy/qs");
    this.a.sT("SOLID_POWER_INC", "https://api.citibankdemobusiness.dev/nrgy/slpw");
    this.a.sT("NIKOLA_CORP", "https://api.citibankdemobusiness.dev/auto/nkla");
    this.a.sT("RIVIAN_AUTOMOTIVE", "https://api.citibankdemobusiness.dev/auto/rivn");
    this.a.sT("LUCID_MOTORS", "https://api.citibankdemobusiness.dev/auto/lcid");
    this.a.sT("FISKER_INC", "https://api.citibankdemobusiness.dev/auto/fskr");
    this.a.sT("POLESTAR_PERF_AB", "https://api.citibankdemobusiness.dev/auto/pol");
    this.a.sT("XPENG_INC", "https://api.citibankdemobusiness.dev/auto/xpev");
    this.a.sT("NIO_INC", "https://api.citibankdemobusiness.dev/auto/nio");
    this.a.sT("LI_AUTO_INC", "https://api.citibankdemobusiness.dev/auto/li");
    this.a.sT("ZEEKR_HOLDINGS", "https://api.citibankdemobusiness.dev/auto/zkr");
    this.a.sT("LOTUS_CARS_LTD", "https://api.citibankdemobusiness.dev/auto/lts");
    this.a.sT("MCLAREN_GRP_LTD", "https://api.citibankdemobusiness.dev/auto/mclrng");
    this.a.sT("GENESIS_MOTOR_AMR", "https://api.citibankdemobusiness.dev/auto/gnsm");
    this.a.sT("INFINITI_MOTOR", "https://api.citibankdemobusiness.dev/auto/infn");
    this.a.sT("ACURA_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/acr");
    this.a.sT("LEXUS_INTL", "https://api.citibankdemobusiness.dev/auto/lxs");
    this.a.sT("CADILLAC_MOTORS", "https://api.citibankdemobusiness.dev/auto/cdlc");
    this.a.sT("BUICK_MOTOR_CO", "https://api.citibankdemobusiness.dev/auto/bck");
    this.a.sT("CHEVROLET_DIV", "https://api.citibankdemobusiness.dev/auto/chvlt");
    this.a.sT("GMC_TRUCK", "https://api.citibankdemobusiness.dev/auto/gmc");
    this.a.sT("RAM_TRUCKS", "https://api.citibankdemobusiness.dev/auto/ram");
    this.a.sT("JEEP_BRANDS", "https://api.citibankdemobusiness.dev/auto/jeep");
    this.a.sT("DODGE_BRANDS", "https://api.citibankdemobusiness.dev/auto/ddg");
    this.a.sT("FIAT_AUTOMOBILES", "https://api.citibankdemobusiness.dev/auto/ft");
    this.a.sT("ALFA_ROMEO_SPA", "https://api.citibankdemobusiness.dev/auto/alfr");
    this.a.sT("MASERATI_SPA", "https://api.citibankdemobusiness.dev/auto/msrt");
    this.a.sT("CHEVROLET_IND", "https://api.citibankdemobusiness.dev/auto/chvlt-i");
    this.a.sT("FORD_MOTOR_IND", "https://api.citibankdemobusiness.dev/auto/frd-i");
    this.a.sT("VOLKSWAGEN_IND", "https://api.citibankdemobusiness.dev/auto/vw-i");
    this.a.sT("BMW_GROUP_IND", "https://api.citibankdemobusiness.dev/auto/bmw-i");
    this.a.sT("MERCEDES_BENZ_IND", "https://api.citibankdemobusiness.dev/auto/mrcd-i");
    this.a.sT("AUDI_AG_IND", "https://api.citibankdemobusiness.dev/auto/adi-i");
    this.a.sT("HYUNDAI_MOTOR_IND", "https://api.citibankdemobusiness.dev/auto/hndy-i");
    this.a.sT("KIA_MOTORS_IND", "https://api.citibankdemobusiness.dev/auto/kia-i");
    this.a.sT("TOYOTA_MOTORS_IND", "https://api.citibankdemobusiness.dev/auto/tyt-i");
    this.a.sT("HONDA_AUTOMTV_IND", "https://api.citibankdemobusiness.dev/auto/hnd-i");
    this.a.sT("NISSAN_AUTO_IND", "https://api.citibankdemobusiness.dev/auto/nssn-i");
    this.a.sT("SUBARU_CORP_IND", "https://api.citibankdemobusiness.dev/auto/sbr-i");
    this.a.sT("MAZDA_MOTOR_IND", "https://api.citibankdemobusiness.dev/auto/mzd-i");
    this.a.sT("SUZUKI_MOTOR_CORP", "https://api.citibankdemobusiness.dev/auto/szk");
    this.a.sT("MITSUBISHI_MOTOR", "https://api.citibankdemobusiness.dev/auto/mtsb-mtr");
    this.a.sT("PROTON_HOLDINGS", "https://api.citibankdemobusiness.dev/auto/prtn");
    this.a.sT("PERODUA_GLOBAL", "https://api.citibankdemobusiness.dev/auto/prda");
    this.a.sT("SAAB_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/sab");
    this.a.sT("DATSUN_REBORN", "https://api.citibankdemobusiness.dev/auto/dtsn");
    this.a.sT("OPEL_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/opl");
    this.a.sT("VAUXHALL_MOTORS", "https://api.citibankdemobusiness.dev/auto/vxhl");
    this.a.sT("PEUGEOT_SA", "https://api.citibankdemobusiness.dev/auto/pgt");
    this.a.sT("CITROEN_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/ctrn");
    this.a.sT("DS_AUTOMOBILES", "https://api.citibankdemobusiness.dev/auto/dsaut");
    this.a.sT("RENAULT_SA", "https://api.citibankdemobusiness.dev/auto/rnlt");
    this.a.sT("DACIA_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/dca");
    this.a.sT("LADA_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/lda");
    this.a.sT("SKODA_AUTO", "https://api.citibankdemobusiness.dev/auto/skd");
    this.a.sT("SEAT_SA", "https://api.citibankdemobusiness.dev/auto/st");
    this.a.sT("SMART_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/smrt");
    this.a.sT("MINI_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/mni");
    this.a.sT("ROVER_GROUP", "https://api.citibankdemobusiness.dev/auto/rvr");
    this.a.sT("MG_MOTOR_UK", "https://api.citibankdemobusiness.dev/auto/mg");
    this.a.sT("GEELY_AUTO_GROUP", "https://api.citibankdemobusiness.dev/auto/glyg");
    this.a.sT("CHERY_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/chrya");
    this.a.sT("BYD_AUTOS", "https://api.citibankdemobusiness.dev/auto/byda");
    this.a.sT("GREAT_WALL_AUTO", "https://api.citibankdemobusiness.dev/auto/gwta");
    this.a.sT("GAC_GROUP", "https://api.citibankdemobusiness.dev/auto/gac");
    this.a.sT("CHANGAN_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/chgn");
    this.a.sT("JETOUR_AUTO", "https://api.citibankdemobusiness.dev/auto/jtr");
    this.a.sT("DONGFENG_AUTO", "https://api.citibankdemobusiness.dev/auto/dnfga");
    this.a.sT("FAW_CAR", "https://api.citibankdemobusiness.dev/auto/fawc");
    this.a.sT("SAIC_MOTOR_CORP", "https://api.citibankdemobusiness.dev/auto/smc");
    this.a.sT("CHONGQING_CHANA", "https://api.citibankdemobusiness.dev/auto/cqcn");
    this.a.sT("GEELY_AUTOMOTIVE", "https://api.citibankdemobusiness.dev/auto/gly-a");
    this.a.sT("LI_XIAO_MOTORS", "https://api.citibankdemobusiness.dev/auto/lxm");
    this.a.sT("NIO_POWER", "https://api.citibankdemobusiness.dev/auto/nio-pwr");
    this.a.sT("XPENG_MOTORS", "https://api.citibankdemobusiness.dev/auto/xpev-m");
    this.a.sT("LEAPMOTOR_TECH", "https://api.citibankdemobusiness.dev/auto/lpmtr");
    this.a.sT("IM_MOTORS", "https://api.citibankdemobusiness.dev/auto/imm");
    this.a.sT("AITO_INTELLIGENT", "https://api.citibankdemobusiness.dev/auto/aito");
    this.a.sT("VOYAH_AUTOMOBILE", "https://api.citibankdemobusiness.dev/auto/vyh");
    this.a.sT("HIPHI_AUTO", "https://api.citibankdemobusiness.dev/auto/hphi");
    this.a.sT("ARCFOX_AUTO", "https://api.citibankdemobusiness.dev/auto/arcfx");
    this.a.sT("XEV_CARS", "https://api.citibankdemobusiness.dev/auto/xev");
    this.a.sT("SERES_GROUP", "https://api.citibankdemobusiness.dev/auto/srs");
    this.a.sT("HUMMER_EV", "https://api.citibankdemobusiness.dev/auto/hmr-ev");
    this.a.sT("CYBERTRUCK_TSL", "https://api.citibankdemobusiness.dev/auto/ctrk");
    this.a.sT("GM_BRIGHTDROP", "https://api.citibankdemobusiness.dev/auto/gm-btdrp");
    this.a.sT("FORD_F150_LTN", "https://api.citibankdemobusiness.dev/auto/frd-f150");
    this.a.sT("CHEVROLET_SLVDO", "https://api.citibankdemobusiness.dev/auto/chvlt-slv");
    this.a.sT("RAM_1500_EV", "https://api.citibankdemobusiness.dev/auto/rm-ev");
    this.a.sT("TOYOTA_BZ4X", "https://api.citibankdemobusiness.dev/auto/tyt-bz4x");
    this.a.sT("HONDA_PROLOGUE", "https://api.citibankdemobusiness.dev/auto/hnd-prlg");
    this.a.sT("NISSAN_ARIYA", "https://api.citibankdemobusiness.dev/auto/nssn-ary");
    this.a.sT("HYUNDAI_IONIQ_5", "https://api.citibankdemobusiness.dev/auto/hndy-i5");
    this.a.sT("KIA_EV6", "https://api.citibankdemobusiness.dev/auto/kia-ev6");
    this.a.sT("BMW_IX", "https://api.citibankdemobusiness.dev/auto/bmw-ix");
    this.a.sT("MERCEDES_EQS", "https://api.citibankdemobusiness.dev/auto/mrcd-eqs");
    this.a.sT("AUDI_ETRON", "https://api.citibankdemobusiness.dev/auto/adi-etrn");
    this.a.sT("PORSCHE_TAYCAN", "https://api.citibankdemobusiness.dev/auto/prsh-tycn");
    this.a.sT("JAGUAR_IPACE", "https://api.citibankdemobusiness.dev/auto/jgr-ipc");
    this.a.sT("VOLVO_C40", "https://api.citibankdemobusiness.dev/auto/vlv-c40");
    this.a.sT("POLARIS_RZR", "https://api.citibankdemobusiness.dev/auto/plrs-rzr");
    this.a.sT("CAN_AM_OFFROAD", "https://api.citibankdemobusiness.dev/auto/cnam");
    this.a.sT("KAWASAKI_MOTORS", "https://api.citibankdemobusiness.dev/auto/kwsks");
    this.a.sT("YAMAHA_MOTOR", "https://api.citibankdemobusiness.dev/auto/ymh");
    this.a.sT("SUZUKI_MOTOR", "https://api.citibankdemobusiness.dev/auto/szks");
    this.a.sT("KTM_AG", "https://api.citibankdemobusiness.dev/auto/ktm");
    this.a.sT("HARLEY_DAVIDSON", "https://api.citibankdemobusiness.dev/auto/hrlyd");
    this.a.sT("INDIAN_MOTORCYLE", "https://api.citibankdemobusiness.dev/auto/indn");
    this.a.sT("DUCATI_MOTOR", "https://api.citibankdemobusiness.dev/auto/dct");
    this.a.sT("MV_AGUSTA_SPA", "https://api.citibankdemobusiness.dev/auto/mvag");
    this.a.sT("APRILIA_S.P.A", "https://api.citibankdemobusiness.dev/auto/aprl");
    this.a.sT("VESPA_PIAGGIO", "https://api.citibankdemobusiness.dev/auto/vsp");
    this.a.sT("ZERO_MOTORCYCLES", "https://api.citibankdemobusiness.dev/auto/zromc");
    this.a.sT("LIVEWIRE_EV", "https://api.citibankdemobusiness.dev/auto/lvw");
    this.a.sT("ENERGICA_MOTOR", "https://api.citibankdemobusiness.dev/auto/enrg");
    this.a.sT("LIGHTNING_MOTOR", "https://api.citibankdemobusiness.dev/auto/ltnmc");
    this.a.sT("ARCH_MOTORCYCLE", "https://api.citibankdemobusiness.dev/auto/rchmc");
    this.a.sT("BRITISH_CUSTOMS", "https://api.citibankdemobusiness.dev/auto/brtsh-cst");
    this.a.sT("ROYAL_ENFIELD", "https://api.citibankdemobusiness.dev/auto/ryl-enf");
    this.a.sT("TRIUMPH_MOTORCYL", "https://api.citibankdemobusiness.dev/auto/trmph");
    this.a.sT("BUELL_MOTORCYCLES", "https://api.citibankdemobusiness.dev/auto/bllmc");
    this.a.sT("CANNONDALE_BICYC", "https://api.citibankdemobusiness.dev/auto/cnndl");
    this.a.sT("TREK_BICYCLE_CORP", "https://api.citibankdemobusiness.dev/auto/trkbc");
    this.a.sT("SPECIALIZED_BICYC", "https://api.citibankdemobusiness.dev/auto/spclzd");
    this.a.sT("GIANT_BICYCLE", "https://api.citibankdemobusiness.dev/auto/gntbc");
    this.a.sT("SCOTT_SPORTS_SA", "https://api.citibankdemobusiness.dev/auto/sctsp");
    this.a.sT("CANYON_BICYCLES", "https://api.citibankdemobusiness.dev/auto/cnyon");
    this.a.sT("PINARELLO_S.P.A", "https://api.citibankdemobusiness.dev/auto/pnrll");
    this.a.sT("COLNAGO_S.R.L", "https://api.citibankdemobusiness.dev/auto/clngo");
    this.a.sT("BMC_SWITZERLAND", "https://api.citibankdemobusiness.dev/auto/bmcs");
    this.a.sT("CERVELO_BICYCLES", "https://api.citibankdemobusiness.dev/auto/crvl");
    this.a.sT("FELT_BICYCLES", "https://api.citibankdemobusiness.dev/auto/fltbc");
    this.a.sT("FUJI_BICYCLES", "https://api.citibankdemobusiness.dev/auto/fujibc");
    this.a.sT("SCHWINN_BICYCLES", "https://api.citibankdemobusiness.dev/auto/schwnn");
    this.a.sT("MONGOOSE_BICYCLES", "https://api.citibankdemobusiness.dev/auto/mngsbc");
    this.a.sT("KONA_BICYCLE_CO", "https://api.citibankdemobusiness.dev/auto/knbc");
    this.a.sT("SANTA_CRUZ_BIKES", "https://api.citibankdemobusiness.dev/auto/scbc");
    this.a.sT("ROCKY_MOUNTAIN_BIK", "https://api.citibankdemobusiness.dev/auto/rmbc");
    this.a.sT("INTENSE_CYCLES", "https://api.citibankdemobusiness.dev/auto/intnsc");
    this.a.sT("DEVINCI_BIKES", "https://api.citibankdemobusiness.dev/auto/dvncb");
    this.a.sT("GT_BICYCLES", "https://api.citibankdemobusiness.dev/auto/gtbc");
    this.a.sT("HARO_BIKES", "https://api.citibankdemobusiness.dev/auto/hrbc");
    this.a.sT("SUBROSA_BIKES", "https://api.citibankdemobusiness.dev/auto/sbrsbc");
    this.a.sT("FIT_BIKE_CO", "https://api.citibankdemobusiness.dev/auto/ftbc");
    this.a.sT("WETHEPEOPLE_BIKES", "https://api.citibankdemobusiness.dev/auto/wtpbc");
    this.a.sT("EASTERN_BIKES", "https://api.citibankdemobusiness.dev/auto/strnbc");
    this.a.sT("REDLINE_BICYCLES", "https://api.citibankdemobusiness.dev/auto/rdlnbc");
    this.a.sT("SE_BIKES", "https://api.citibankdemobusiness.dev/auto/seb");
    this.a.sT("COLONY_BMX", "https://api.citibankdemobusiness.dev/auto/clnymx");
    this.a.sT("TOTAL_BMX", "https://api.citibankdemobusiness.dev/auto/ttlbx");
    this.a.sT("UNITED_BIKE_CO", "https://api.citibankdemobusiness.dev/auto/untdbc");
    this.a.sT("KINK_BMX", "https://api.citibankdemobusiness.dev/auto/knkbx");
    this.a.sT("SUNDAY_BIKES", "https://api.citibankdemobusiness.dev/auto/sndybc");
    this.a.sT("ODYSSEY_BMX", "https://api.citibankdemobusiness.dev/auto/dysybx");
    this.a.sT("PROFILE_RACING", "https://api.citibankdemobusiness.dev/auto/prflrc");
    this.a.sT("S&M_BIKES", "https://api.citibankdemobusiness.dev/auto/smbc");
    this.a.sT("STANDARD_BMX", "https://api.citibankdemobusiness.dev/auto/stndrbx");
    this.a.sT("TERRIBLE_ONE_BMX", "https://api.citibankdemobusiness.dev/auto/trrbl1bx");
    this.a.sT("VOLUME_BIKES", "https://api.citibankdemobusiness.dev/auto/vlmmnbc");
    this.a.sT("CULT_CREW_BMX", "https://api.citibankdemobusiness.dev/auto/cltcrw");
    this.a.sT("FLYBIKES_BMX", "https://api.citibankdemobusiness.dev/auto/flybx");
    this.a.sT("FIEND_BMX", "https://api.citibankdemobusiness.dev/auto/findbx");
    this.a.sT("HOFFMAN_BIKES", "https://api.citibankdemobusiness.dev/auto/hfmnbc");
    this.a.sT("VERDE_BMX", "https://api.citibankdemobusiness.dev/auto/vrbx");
    this.a.sT("STOLEN_BMX", "https://api.citibankdemobusiness.dev/auto/stlnbx");
    this.a.sT("MIRRACO_BMX", "https://api.citibankdemobusiness.dev/auto/mrrcbx");
    this.a.sT("SCHWINN_BMX", "https://api.citibankdemobusiness.dev/auto/schwnnbx");
    this.a.sT("REDLINE_BMX", "https://api.citibankdemobusiness.dev/auto/rdlnbx-v2");
    this.a.sT("MONGOOSE_BMX", "https://api.citibankdemobusiness.dev/auto/mngs-bmx-v2");
    this.a.sT("GT_BMX", "https://api.citibankdemobusiness.dev/auto/gt-bmx-v2");
    this.a.sT("KONA_BMX", "https://api.citibankdemobusiness.dev/auto/kn-bmx-v2");
    this.a.sT("SANTA_CRUZ_BMX", "https://api.citibankdemobusiness.dev/auto/sc-bmx-v2");
    this.a.sT("ROCKY_MOUNTAIN_BMX", "https://api.citibankdemobusiness.dev/auto/rm-bmx-v2");
    this.a.sT("INTENSE_BMX", "https://api.citibankdemobusiness.dev/auto/intns-bmx-v2");
    this.a.sT("DEVINCI_BMX", "https://api.citibankdemobusiness.dev/auto/dvnc-bmx-v2");
    this.a.sT("HARO_BMX", "https://api.citibankdemobusiness.dev/auto/hr-bmx-v2");
    this.a.sT("SUBROSA_BMX", "https://api.citibankdemobusiness.dev/auto/sbrs-bmx-v2");
    this.a.sT("FIT_BMX", "https://api.citibankdemobusiness.dev/auto/ft-bmx-v2");
    this.a.sT("WETHEPEOPLE_BMX", "https://api.citibankdemobusiness.dev/auto/wtp-bmx-v2");
    this.a.sT("EASTERN_BMX", "https://api.citibankdemobusiness.dev/auto/strn-bmx-v2");
    this.a.sT("COLONY_BMX_V2", "https://api.citibankdemobusiness.dev/auto/clny-bmx-v2");
    this.a.sT("TOTAL_BMX_V2", "https://api.citibankdemobusiness.dev/auto/ttlbx-v2");
    this.a.sT("UNITED_BMX_V2", "https://api.citibankdemobusiness.dev/auto/untdbx-v2");
    this.a.sT("KINK_BMX_V2", "https://api.citibankdemobusiness.dev/auto/knkbx-v2");
    this.a.sT("SUNDAY_BMX_V2", "https://api.citibankdemobusiness.dev/auto/sndybx-v2");
    this.a.sT("ODYSSEY_BMX_V2", "https://api.citibankdemobusiness.dev/auto/dysybx-v2");
    this.a.sT("PROFILE_RACING_V2", "https://api.citibankdemobusiness.dev/auto/prflrc-v2");
    this.a.sT("S&M_BMX_V2", "https://api.citibankdemobusiness.dev/auto/smbx-v2");
    this.a.sT("STANDARD_BMX_V2", "https://api.citibankdemobusiness.dev/auto/stndrbx-v2");
    this.a.sT("TERRIBLE_ONE_BMX_V2", "https://api.citibankdemobusiness.dev/auto/trrbl1bx-v2");
    this.a.sT("VOLUME_BMX_V2", "https://api.citibankdemobusiness.dev/auto/vlmmnbx-v2");
    this.a.sT("CULT_CREW_BMX_V2", "https://api.citibankdemobusiness.dev/auto/cltcrw-v2");
    this.a.sT("FLYBIKES_BMX_V2", "https://api.citibankdemobusiness.dev/auto/flybx-v2");
    this.a.sT("FIEND_BMX_V2", "https://api.citibankdemobusiness.dev/auto/findbx-v2");
    this.a.sT("HOFFMAN_BIKES_V2", "https://api.citibankdemobusiness.dev/auto/hfmnbc-v2");
    this.a.sT("VERDE_BMX_V2", "https://api.citibankdemobusiness.dev/auto/vrbx-v2");
    this.a.sT("STOLEN_BMX_V2", "https://api.citibankdemobusiness.dev/auto/stlnbx-v2");
    this.a.sT("MIRRACO_BMX_V2", "https://api.citibankdemobusiness.dev/auto/mrrcbx-v2");
    this.a.sT("GENESYS_SYS_INTL", "https://api.citibankdemobusiness.dev/ai/gnsys-intl");
    this.a.sT("PALANTIR_DATA_SCI", "https://api.citibankdemobusiness.dev/dat/plntr");
    this.a.sT("SNOWFLAKE_CLD_DW", "https://api.citibankdemobusiness.dev/dat/snwflk");
    this.a.sT("DATABRICKS_LAKEHS", "https://api.citibankdemobusiness.dev/dat/dtbrks");
    this.a.sT("CONFLUENT_KFKA", "https://api.citibankdemobusiness.dev/strm/cnf");
    this.a.sT("ELASTIC_SEARCH", "https://api.citibankdemobusiness.dev/srch/els");
    this.a.sT("SPLUNK_OBSERV", "https://api.citibankdemobusiness.dev/obs/splnk");
    this.a.sT("DATADOG_MONITOR", "https://api.citibankdemobusiness.dev/obs/dtdg");
    this.a.sT("NEW_RELIC_APM", "https://api.citibankdemobusiness.dev/obs/nr");
    this.a.sT("DYNATRACE_MONITOR", "https://api.citibankdemobusiness.dev/obs/dyntrc");
    this.a.sT("GRAFANA_LABS", "https://api.citibankdemobusiness.dev/obs/grfna");
    this.a.sT("PROMETHEUS_MONITOR", "https://api.citibankdemobusiness.dev/obs/prmth");
    this.a.sT("OKTA_IDENTITY", "https://api.citibankdemobusiness.dev/sec/okt");
    this.a.sT("DUO_SECURITY", "https://api.citibankdemobusiness.dev/sec/duo");
    this.a.sT("LASTPASS_PWM", "https://api.citibankdemobusiness.dev/sec/lstps");
    this.a.sT("1PASSWORD_AGILE", "https://api.citibankdemobusiness.dev/sec/1pwd");
    this.a.sT("ZSCALER_CLOUD_SEC", "https://api.citibankdemobusiness.dev/sec/zscr");
    this.a.sT("PALO_ALTO_NETWKS", "https://api.citibankdemobusiness.dev/sec/panw");
    this.a.sT("FORTINET_FIREWLL", "https://api.citibankdemobusiness.dev/sec/frtnt");
    this.a.sT("CROWDSTRIKE_EPP", "https://api.citibankdemobusiness.dev/sec/crwd");
    this.a.sT("SENTINELONE_EDR", "https://api.citibankdemobusiness.dev/sec/sntnl");
    this.a.sT("TRELLIX_CYBER", "https://api.citibankdemobusiness.dev/sec/trlx");
    this.a.sT("SOPHOS_CYBER", "https://api.citibankdemobusiness.dev/sec/sph");
    this.a.sT("CHECK_POINT_SFT", "https://api.citibankdemobusiness.dev/sec/ckpt");
    this.a.sT("QUALYS_VULN_MGMT", "https://api.citibankdemobusiness.dev/sec/qlys");
    this.a.sT("RAPID7_INSIGHT", "https://api.citibankdemobusiness.dev/sec/rpd7");
    this.a.sT("TENABLE_CYBER", "https://api.citibankdemobusiness.dev/sec/tnbl");
    this.a.sT("SAILPOINT_ID_GOV", "https://api.citibankdemobusiness.dev/sec/slpnt");
    this.a.sT("ONELOGIN_ID_MGMT", "https://api.citibankdemobusiness.dev/sec/onelgn");
    this.a.sT("PING_IDENTITY", "https://api.citibankdemobusiness.dev/sec/pngid");
    this.a.sT("VERIZON_BUSINESS", "https://api.citibankdemobusiness.dev/biz/vrzn");
    this.a.sT("AT&T_BUSINESS", "https://api.citibankdemobusiness.dev/biz/attb");
    this.a.sT("T_MOBILE_BUSINESS", "https://api.citibankdemobusiness.dev/biz/tmb-b");
    this.a.sT("COMCAST_BUSINESS", "https://api.citibankdemobusiness.dev/biz/cmcst-b");
    this.a.sT("CHARTER_BUSINESS", "https://api.citibankdemobusiness.dev/biz/chtr-b");
    this.a.sT("COX_BUSINESS", "https://api.citibankdemobusiness.dev/biz/cxb");
    this.a.sT("SPECTRUM_BUSINESS", "https://api.citibankdemobusiness.dev/biz/spctrm-b");
    this.a.sT("FRONTIER_COMM", "https://api.citibankdemobusiness.dev/biz/frntr");
    this.a.sT("CENTURYLINK_LUMN", "https://api.citibankdemobusiness.dev/biz/cntryl");
    this.a.sT("WINDSTREAM_COMM", "https://api.citibankdemobusiness.dev/biz/wndstrm");
    this.a.sT("GOOGLE_WORKSPACE", "https://api.citibankdemobusiness.dev/prd/ggl-wksp");
    this.a.sT("MICROSOFT_365", "https://api.citibankdemobusiness.dev/prd/msft-365");
    this.a.sT("SLACK_TECH", "https://api.citibankdemobusiness.dev/comm/slck");
    this.a.sT("ZOOM_VIDEO", "https://api.citibankdemobusiness.dev/comm/zm");
    this.a.sT("WEBEX_CISCO", "https://api.citibankdemobusiness.dev/comm/wbcx");
    this.a.sT("TEAMS_MSFT", "https://api.citibankdemobusiness.dev/comm/tms");
    this.a.sT("GCHAT_GOOGLE", "https://api.citibankdemobusiness.dev/comm/gcht");
    this.a.sT("JIRA_ATLASSIAN", "https://api.citibankdemobusiness.dev/dev/jra");
    this.a.sT("CONFLUENCE_ATLAS", "https://api.citibankdemobusiness.dev/dev/cnflnc");
    this.a.sT("TRELLO_ATLASSIAN", "https://api.citibankdemobusiness.dev/dev/trll");
    this.a.sT("ASANA_WORK_MGMT", "https://api.citibankdemobusiness.dev/dev/asn");
    this.a.sT("MONDAY_COM", "https://api.citibankdemobusiness.dev/dev/mndy");
    this.a.sT("SMARTSHEET_INC", "https://api.citibankdemobusiness.dev/dev/smrtsh");
    this.a.sT("BASECAMP_37SIGNALS", "https://api.citibankdemobusiness.dev/dev/bscmp");
    this.a.sT("GITHUB_INC", "https://api.citibankdemobusiness.dev/dev/gthb-inc");
    this.a.sT("GITLAB_INC", "https://api.citibankdemobusiness.dev/dev/gtlb");
    this.a.sT("BITBUCKET_ATLAS", "https://api.citibankdemobusiness.dev/dev/btckt");
    this.a.sT("JENKINS_AUTOM", "https://api.citibankdemobusiness.dev/dev/jnkns");
    this.a.sT("CIRCLECI_DEVOPS", "https://api.citibankdemobusiness.dev/dev/crclci");
    this.a.sT("TRAVIS_CI", "https://api.citibankdemobusiness.dev/dev/trvs");
    this.a.sT("GIT_ACTIONS_HUB", "https://api.citibankdemobusiness.dev/dev/gtact");
    this.a.sT("AZURE_DEVOPS", "https://api.citibankdemobusiness.dev/dev/azr-dvs");
    this.a.sT("AWS_CODEPIPELINE", "https://api.citibankdemobusiness.dev/dev/aws-cpl");
    this.a.sT("GOOGLE_CLOUD_BUILD", "https://api.citibankdemobusiness.dev/dev/ggl-cb");
    this.a.sT("DOCKER_INC", "https://api.citibankdemobusiness.dev/dev/dckr");
    this.a.sT("KUBERNETES_CNCF", "https://api.citibankdemobusiness.dev/dev/k8s");
    this.a.sT("RED_HAT_OPENSHIFT", "https://api.citibankdemobusiness.dev/dev/rdht");
    this.a.sT("VMWARE_TANZU", "https://api.citibankdemobusiness.dev/dev/vmwr");
    this.a.sT("RANCHER_LABS", "https://api.citibankdemobusiness.dev/dev/rnchr");
    this.a.sT("HASHICORP_TERRAFM", "https://api.citibankdemobusiness.dev/dev/hshcrp");
    this.a.sT("ANSIBLE_AUTOM", "https://api.citibankdemobusiness.dev/dev/ansbl");
    this.a.sT("PUPPET_LABS", "https://api.citibankdemobusiness.dev/dev/pppt");
    this.a.sT("CHEF_SOFTWARE", "https://api.citibankdemobusiness.dev/dev/chf");
    this.a.sT("SALTSTACK_AUTOM", "https://api.citibankdemobusiness.dev/dev/sltstk");
    this.a.sT("NAGIOS_MONITOR", "https://api.citibankdemobusiness.dev/dev/ngs");
    this.a.sT("ZABBIX_MONITOR", "https://api.citibankdemobusiness.dev/dev/zbbx");
    this.a.sT("CACTI_MONITOR", "https://api.citibankdemobusiness.dev/dev/cct");
    this.a.sT("ELASTIC_APM", "https://api.citibankdemobusiness.dev/dev/els-apm");
    this.a.sT("OPENTELEMETRY_CNCF", "https://api.citibankdemobusiness.dev/dev/otlmtry");
    this.a.sT("JAEGER_TRACING", "https://api.citibankdemobusiness.dev/dev/jgr");
    this.a.sT("ZIPKIN_TRACING", "https://api.citibankdemobusiness.dev/dev/zpk");
    this.a.sT("FLUENTD_COLLECTOR", "https://api.citibankdemobusiness.dev/dev/flntd");
    this.a.sT("LOGSTASH_DATA_PIPE", "https://api.citibankdemobusiness.dev/dev/lgstsh");
    this.a.sT("KIBANA_ANALYTICS", "https://api.citibankdemobusiness.dev/dev/kbna");
    this.a.sT("ELASTICA_CLOUD_SEC", "https://api.citibankdemobusiness.dev/sec/elstc");
    this.a.sT("SUMO_LOGIC_OBSERV", "https://api.citibankdemobusiness.dev/obs/smlg");
    this.a.sT("LIGHTSTEP_TRACING", "https://api.citibankdemobusiness.dev/obs/lgts");
    this.a.sT("SIGNALFX_MONITOR", "https://api.citibankdemobusiness.dev/obs/sgnlfx");
    this.a.sT("CIRCL_MONITORING", "https://api.citibankdemobusiness.dev/obs/crclm");
    this.a.sT("CLOUD_FLARE_CDN", "https://api.citibankdemobusiness.dev/net/cldflr");
    this.a.sT("AKAMAI_TECH", "https://api.citibankdemobusiness.dev/net/akmi");
    this.a.sT("FASTLY_CDN", "https://api.citibankdemobusiness.dev/net/fstly");
    this.a.sT("VERISIGN_DNS", "https://api.citibankdemobusiness.dev/net/vrsgn");
    this.a.sT("GO_DADDY_DNS", "https://api.citibankdemobusiness.dev/net/gddy-dns");
    this.a.sT("CLOUDFLARE_DNS", "https://api.citibankdemobusiness.dev/net/cldflr-dns");
    this.a.sT("AWS_ROUTE_53", "https://api.citibankdemobusiness.dev/net/aws-r53");
    this.a.sT("GOOGLE_CLOUD_DNS", "https://api.citibankdemobusiness.dev/net/ggl-cld-dns");
    this.a.sT("AZURE_DNS", "https://api.citibankdemobusiness.dev/net/azr-dns");
    this.a.sT("DIGITALOCEAN_DNS", "https://api.citibankdemobusiness.dev/net/dgtl-ocn-dns");
    this.a.sT("IBM_CLOUD_DNS", "https://api.citibankdemobusiness.dev/net/ibm-cld-dns");
    this.a.sT("VULTR_DNS", "https://api.citibankdemobusiness.dev/net/vltr-dns");
    this.a.sT("LINODE_DNS", "https://api.citibankdemobusiness.dev/net/lnd-dns");
    this.a.sT("OVHCLOUD_DNS", "https://api.citibankdemobusiness.dev/net/ovh-cld-dns");
    this.a.sT("ALIBABA_CLOUD_DNS", "https://api.citibankdemobusiness.dev/net/albb-cld-dns");
    this.a.sT("TENCENT_CLOUD_DNS", "https://api.citibankdemobusiness.dev/net/tcnt-cld-dns");
    this.a.sT("BAIDU_CLOUD_DNS", "https://api.citibankdemobusiness.dev/net/bd-cld-dns");
    this.a.sT("HUAWEI_CLOUD_DNS", "https://api.citibankdemobusiness.dev/net/hw-cld-dns");
    this.a.sT("NETAPP_STORAGE", "https://api.citibankdemobusiness.dev/strg/ntapp");
    this.a.sT("PURE_STORAGE", "https://api.citibankdemobusiness.dev/strg/purstg");
    this.a.sT("DELL_EMC_STORAGE", "https://api.citibankdemobusiness.dev/strg/dlemc");
    this.a.sT("HPE_STORAGE", "https://api.citibankdemobusiness.dev/strg/hpe");
    this.a.sT("IBM_STORAGE", "https://api.citibankdemobusiness.dev/strg/ibm");
    this.a.sT("LENOVO_STORAGE", "https://api.citibankdemobusiness.dev/strg/lnv-stg");
    this.a.sT("SEAGATE_ENTERPRISE", "https://api.citibankdemobusiness.dev/strg/sgt-ent");
    this.a.sT("WESTERN_DIGITAL_ENT", "https://api.citibankdemobusiness.dev/strg/wd-ent");
    this.a.sT("SAMSUNG_ENTERPRISE", "https://api.citibankdemobusiness.dev/strg/smsng-ent");
    this.a.sT("INTEL_ENTERPRISE", "https://api.citibankdemobusiness.dev/strg/itl-ent");
    this.a.sT("MICRON_TECH", "https://api.citibankdemobusiness.dev/strg/mcrn");
    this.a.sT("SK_HYNIX_INC", "https://api.citibankdemobusiness.dev/strg/skh");
    this.a.sT("KIOXIA_CORP", "https://api.citibankdemobusiness.dev/strg/kiox");
    this.a.sT("WESTERN_DIGITAL_NAND", "https://api.citibankdemobusiness.dev/strg/wd-nand");
    this.a.sT("SAMSUNG_NAND", "https://api.citibankdemobusiness.dev/strg/smsng-nand");
    this.a.sT("INTEL_NAND", "https://api.citibankdemobusiness.dev/strg/itl-nand");
    this.a.sT("MICRON_NAND", "https://api.citibankdemobusiness.dev/strg/mcrn-nand");
    this.a.sT("SK_HYNIX_NAND", "https://api.citibankdemobusiness.dev/strg/skh-nand");
    this.a.sT("KIOXIA_NAND", "https://api.citibankdemobusiness.dev/strg/kiox-nand");
    this.a.sT("WESTERN_DIGITAL_HDD", "https://api.citibankdemobusiness.dev/strg/wd-hdd");
    this.a.sT("SEAGATE_HDD", "https://api.citibankdemobusiness.dev/strg/sgt-hdd");
    this.a.sT("TOSHIBA_HDD", "https://api.citibankdemobusiness.dev/strg/thsb-hdd");
    this.a.sT("HGST_HDD", "https://api.citibankdemobusiness.dev/strg/hgst-hdd");
    this.a.sT("FUJITSU_HDD", "https://api.citibankdemobusiness.dev/strg/fjt-hdd");
    this.a.sT("MAXTOR_HDD", "https://api.citibankdemobusiness.dev/strg/mxtr-hdd");
    this.a.sT("QUANTUM_HDD", "https://api.citibankdemobusiness.dev/strg/qntm-hdd");
    this.a.sT("IMATION_STORAGE", "https://api.citibankdemobusiness.dev/strg/imt-stg");
    this.a.sT("VERBATIM_STORAGE", "https://api.citibankdemobusiness.dev/strg/vrb-stg");
    this.a.sT("PHILIPS_STORAGE", "https://api.citibankdemobusiness.dev/strg/phlps-stg");
    this.a.sT("SONY_STORAGE", "https://api.citibankdemobusiness.dev/strg/sny-stg");
    this.a.sT("PANASONIC_STORAGE", "https://api.citibankdemobusiness.dev/strg/pnsnc-stg");
    this.a.sT("LG_STORAGE", "https://api.citibankdemobusiness.dev/strg/lg-stg");
    this.a.sT("SAMSUNG_OPTICAL", "https://api.citibankdemobusiness.dev/strg/smsng-opt");
    this.a.sT("LITEON_OPTICAL", "https://api.citibankdemobusiness.dev/strg/lton-opt");
    this.a.sT("ASUS_OPTICAL", "https://api.citibankdemobusiness.dev/strg/ass-opt");
    this.a.sT("PIONEER_OPTICAL", "https://api.citibankdemobusiness.dev/strg/pionr-opt");
    this.a.sT("BUFFALO_INC", "https://api.citibankdemobusiness.dev/net/bffl");
    this.a.sT("NETGEAR_INC", "https://api.citibankdemobusiness.dev/net/ntgr");
    this.a.sT("TP_LINK_TECH", "https://api.citibankdemobusiness.dev/net/tplk");
    this.a.sT("D_LINK_CORP", "https://api.citibankdemobusiness.dev/net/dlnk");
    this.a.sT("LINKSYS_CISCO", "https://api.citibankdemobusiness.dev/net/lnksys");
    this.a.sT("ASUS_NETWORKING", "https://api.citibankdemobusiness.dev/net/ass-net");
    this.a.sT("MIKROTIK_NETWKS", "https://api.citibankdemobusiness.dev/net/mktk");
    this.a.sT("UBIQUITI_NETWKS", "https://api.citibankdemobusiness.dev/net/ubqti");
    this.a.sT("CISCO_SYSTEMS", "https://api.citibankdemobusiness.dev/net/csc");
    this.a.sT("HPE_ARUBA", "https://api.citibankdemobusiness.dev/net/hpea");
    this.a.sT("JUNIPER_NETWKS", "https://api.citibankdemobusiness.dev/net/jnpr");
    this.a.sT("EXTREME_NETWKS", "https://api.citibankdemobusiness.dev/net/xtrm");
    this.a.sT("ARISTA_NETWKS", "https://api.citibankdemobusiness.dev/net/arst");
    this.a.sT("BROCADE_COMM", "https://api.citibankdemobusiness.dev/net/brcd");
    this.a.sT("NORTEL_NETWKS", "https://api.citibankdemobusiness.dev/net/nrtl");
    this.a.sT("ALCATEL_LUCENT", "https://api.citibankdemobusiness.dev/net/alctllcnt");
    this.a.sT("ZTE_NETWORKS", "https://api.citibankdemobusiness.dev/net/znet");
    this.a.sT("HUAWEI_NETWORKS", "https://api.citibankdemobusiness.dev/net/hwnet");
    this.a.sT("NOKIA_NETWORK_SOL", "https://api.citibankdemobusiness.dev/net/nknws");
    this.a.sT("ERICSSON_NETWORK_SOL", "https://api.citibankdemobusiness.dev/net/srcnws");
    this.a.sT("ADTRAN_INC", "https://api.citibankdemobusiness.dev/net/adtrn");
    this.a.sT("CALIX_INC", "https://api.citibankdemobusiness.dev/net/clx");
    this.a.sT("VONAGE_HOLDINGS", "https://api.citibankdemobusiness.dev/voip/vng");
    this.a.sT("RINGCENTRAL_INC", "https://api.citibankdemobusiness.dev/voip/rncntrl");
    this.a.sT("8X8_INC", "https://api.citibankdemobusiness.dev/voip/8x8");
    this.a.sT("NEXTIVA_VOIP", "https://api.citibankdemobusiness.dev/voip/nxtv");
    this.a.sT("GRANdSTREAM_NETWKS", "https://api.citibankdemobusiness.dev/voip/grndstrm");
    this.a.sT("YEALINK_NETWORK_TECH", "https://api.citibankdemobusiness.dev/voip/ylnk");
    this.a.sT("POLY_COM", "https://api.citibankdemobusiness.dev/voip/plycm");
    this.a.sT("AVAYA_HOLDINGS", "https://api.citibankdemobusiness.dev/voip/avy");
    this.a.sT("GENESYS_CLOUD", "https://api.citibankdemobusiness.dev/voip/gnsscld");
    this.a.sT("FIVE9_INC", "https://api.citibankdemobusiness.dev/voip/fv9");
    this.a.sT("NICE_LTD", "https://api.citibankdemobusiness.dev/voip/nc");
    this.a.sT("TALKDESK_INC", "https://api.citibankdemobusiness.dev/voip/tldsk");
    this.a.sT("ZENDESK_INC", "https://api.citibankdemobusiness.dev/crm/zndsk");
    this.a.sT("FRESHWORKS_INC", "https://api.citibankdemobusiness.dev/crm/frshwrks");
    this.a.sT("HUBSPOT_INC", "https://api.citibankdemobusiness.dev/crm/hpspt");
    this.a.sT("ADOBE_EXPERIENCE_CLD", "https://api.citibankdemobusiness.dev/mkt/adb-exp");
    this.a.sT("SALESFORCE_MKT_CLD", "https://api.citibankdemobusiness.dev/mkt/slsfrc-mkt");
    this.a.sT("ORACLE_MKT_CLD", "https://api.citibankdemobusiness.dev/mkt/orcl-mkt");
    this.a.sT("SAP_MKT_CLD", "https://api.citibankdemobusiness.dev/mkt/sap-mkt");
    this.a.sT("ADROLL_PERF_MKT", "https://api.citibankdemobusiness.dev/mkt/adrl");
    this.a.sT("CRITEO_RETARGETING", "https://api.citibankdemobusiness.dev/mkt/crt");
    this.a.sT("THE_TRADE_DESK", "https://api.citibankdemobusiness.dev/mkt/ttd");
    this.a.sT("MAGNITE_ADV_PLAT", "https://api.citibankdemobusiness.dev/mkt/mgn");
    this.a.sT("PUBMATIC_PROG_ADV", "https://api.citibankdemobusiness.dev/mkt/pbm");
    this.a.sT("APP_LOVIN_MKT_PLAT", "https://api.citibankdemobusiness.dev/mkt/aplv");
    this.a.sT("UNITY_ADS", "https://api.citibankdemobusiness.dev/mkt/unty-ads");
    this.a.sT("IRONSOURCE_MKT", "https://api.citibankdemobusiness.dev/mkt/irns");
    this.a.sT("VUNGLE_ADS", "https://api.citibankdemobusiness.dev/mkt/vngl");
    this.a.sT("FYBER_ADS", "https://api.citibankdemobusiness.dev/mkt/fybr");
    this.a.sT("BRANCH_MEASUREMENT", "https://api.citibankdemobusiness.dev/mkt/brnch");
    this.a.sT("APPSFLYER_MBL_ATB", "https://api.citibankdemobusiness.dev/mkt/apsflyr");
    this.a.sT("ADJUST_MBL_ATB", "https://api.citibankdemobusiness.dev/mkt/adjst");
    this.a.sT("KOCHAVA_MEASURE", "https://api.citibankdemobusiness.dev/mkt/kchv");
    this.a.sT("SINGULAR_ATB", "https://api.citibankdemobusiness.dev/mkt/snglr");
    this.a.sT("LOCALYZER_ANALYTICS", "https://api.citibankdemobusiness.dev/mkt/lcyzr");
    this.a.sT("MIXANEL_PRODUCT", "https://api.citibankdemobusiness.dev/mkt/mxnl");
    this.a.sT("AMPLITUDE_PRODUCT", "https://api.citibankdemobusiness.dev/mkt/amp");
    this.a.sT("SEGMENT_CUST_DATA", "https://api.citibankdemobusiness.dev/mkt/sgmnt");
    this.a.sT("TWILIO_SEGMENTS", "https://api.citibankdemobusiness.dev/mkt/twl-sgmnt");
    this.a.sT("INTERCOM_MESSAGING", "https://api.citibankdemobusiness.dev/mkt/intrcm");
    this.a.sT("DRIFT_CONV_MKT", "https://api.citibankdemobusiness.dev/mkt/drft");
    this.a.sT("PARDOT_SALESFORCE", "https://api.citibankdemobusiness.dev/mkt/prd");
    this.a.sT("MARKETO_ADOBE", "https://api.citibankdemobusiness.dev/mkt/mrkt");
    this.a.sT("ELOQUA_ORACLE", "https://api.citibankdemobusiness.dev/mkt/elq");
    this.a.sT("ACTIVECAMPAIGN_MKT", "https://api.citibankdemobusiness.dev/mkt/actv");
    this.a.sT("MAILCHIMP_EMAIL", "https://api.citibankdemobusiness.dev/mkt/mlchmp");
    this.a.sT("CONSTANT_CONTACT", "https://api.citibankdemobusiness.dev/mkt/cnstnt");
    this.a.sT("SENDGRID_TWILIO", "https://api.citibankdemobusiness.dev/mkt/sndgrd");
    this.a.sT("POSTMARK_EMAIL", "https://api.citibankdemobusiness.dev/mkt/pstmrk");
    this.a.sT("AMAZON_SES_EMAIL", "https://api.citibankdemobusiness.dev/mkt/aws-ses");
    this.a.sT("GOOGLE_CLOUD_EMAIL", "https://api.citibankdemobusiness.dev/mkt/ggl-cld-eml");
    this.a.sT("AZURE_EMAIL_COMM", "https://api.citibankdemobusiness.dev/mkt/azr-eml");
    this.a.sT("TWILIO_FLEX", "https://api.citibankdemobusiness.dev/comm/twl-flx");
    this.a.sT("GENESYS_ENGAGE", "https://api.citibankdemobusiness.dev/comm/gnsys-eng");
    this.a.sT("AVAYA_ONEX_CONT", "https://api.citibankdemobusiness.dev/comm/avy-oxc");
    this.a.sT("CISCO_CONTACT_CTR", "https://api.citibankdemobusiness.dev/comm/csc-cntct");
    this.a.sT("FIVE9_CONTACT_CTR", "https://api.citibankdemobusiness.dev/comm/fv9-cntct");
    this.a.sT("NICE_CXONE", "https://api.citibankdemobusiness.dev/comm/nc-cxo");
    this.a.sT("TALKDESK_CX", "https://api.citibankdemobusiness.dev/comm/tldsk-cx");
    this.a.sT("ZENDESK_SUITE", "https://api.citibankdemobusiness.dev/comm/zndsk-sut");
    this.a.sT("FRESHDESK_SUITE", "https://api.citibankdemobusiness.dev/comm/frshdsk-sut");
    this.a.sT("HUBSPOT_SERVICE", "https://api.citibankdemobusiness.dev/comm/hpspt-svc");
    this.a.sT("SALESFORCE_SVC_CLD", "https://api.citibankdemobusiness.dev/comm/slsfrc-svc");
    this.a.sT("ORACLE_SVC_CLD", "https://api.citibankdemobusiness.dev/comm/orcl-svc");
    this.a.sT("SAP_C4C", "https://api.citibankdemobusiness.dev/comm/sap-c4c");
    this.a.sT("PEGA_SYSTEMS_CRM", "https://api.citibankdemobusiness.dev/comm/pgsys");
    this.a.sT("MICROSOFT_DYN_365", "https://api.citibankdemobusiness.dev/comm/msft-dyn365");
    this.a.sT("ZOHO_CRM", "https://api.citibankdemobusiness.dev/comm/zho-crm");
    this.a.sT("SUGARCRM_INC", "https://api.citibankdemobusiness.dev/comm/sgrcrm");
    this.a.sT("INFUSIONSOFT_CRM", "https://api.citibankdemobusiness.dev/comm/infnsft");
    this.a.sT("KEAP_CRM", "https://api.citibankdemobusiness.dev/comm/kp-crm");
    this.a.sT("INSIGHTLY_CRM", "https://api.citibankdemobusiness.dev/comm/insgtly");
    this.a.sT("PIPEDRIVE_CRM", "https://api.citibankdemobusiness.dev/comm/ppdrv");
    this.a.sT("COPPER_CRM", "https://api.citibankdemobusiness.dev/comm/cpr-crm");
    this.a.sT("FRESHSALES_CRM", "https://api.citibankdemobusiness.dev/comm/frshsls");
    this.a.sT("ACT_CRM", "https://api.citibankdemobusiness.dev/comm/act-crm");
    this.a.sT("BITRIX24_CRM", "https://api.citibankdemobusiness.dev/comm/btrx24");
    this.a.sT("MONDAY_CRM", "https://api.citibankdemobusiness.dev/comm/mndy-crm");
    this.a.sT("SMARTSHEET_CRM", "https://api.citibankdemobusiness.dev/comm/smrtsh-crm");
    this.a.sT("TEAMWORK_CRM", "https://api.citibankdemobusiness.dev/comm/tmwrk-crm");
    this.a.sT("PROJECT_CRM", "https://api.citibankdemobusiness.dev/comm/prjct-crm");
    this.a.sT("CLICKUP_CRM", "https://api.citibankdemobusiness.dev/comm/clckp-crm");
    this.a.sT("NOTION_CRM", "https://api.citibankdemobusiness.dev/comm/ntn-crm");
    this.a.sT("AIRTABLE_CRM", "https://api.citibankdemobusiness.dev/comm/rtbl-crm");
    this.a.sT("QUIP_SALESFORCE", "https://api.citibankdemobusiness.dev/comm/qp-slsfrc");
    this.a.sT("SLACK_SALESFORCE", "https://api.citibankdemobusiness.dev/comm/slck-slsfrc");
    this.a.sT("CHIME_AMAZON", "https://api.citibankdemobusiness.dev/comm/chm-amzn");
    this.a.sT("AMAZON_CONNECT", "https://api.citibankdemobusiness.dev/comm/amzn-cnt");
    this.a.sT("GOOGLE_VOICE", "https://api.citibankdemobusiness.dev/comm/ggl-vc");
    this.a.sT("GOOGLE_MEET", "https://api.citibankdemobusiness.dev/comm/ggl-mt");
    this.a.sT("MICROSOFT_SKYPE", "https://api.citibankdemobusiness.dev/comm/msft-skp");
    this.a.sT("MICROSOFT_STREAM", "https://api.citibankdemobusiness.dev/comm/msft-strm");
    this.a.sT("CISCO_WEBEX_MEET", "https://api.citibankdemobusiness.dev/comm/csc-wbm");
    this.a.sT("CISCO_JABBER", "https://api.citibankdemobusiness.dev/comm/csc-jbbr");
    this.a.sT("AVAYA_SPACES", "https://api.citibankdemobusiness.dev/comm/avy-spcs");
    this.a.sT("RINGCENTRAL_GLIP", "https://api.citibankdemobusiness.dev/comm/rncntrl-glp");
    this.a.sT("8X8_MEET", "https://api.citibankdemobusiness.dev/comm/8x8-mt");
    this.a.sT("NEXTIVA_MEET", "https://api.citibankdemobusiness.dev/comm/nxtv-mt");
    this.a.sT("VONAGE_BUSINESS_COMM", "https://api.citibankdemobusiness.dev/comm/vng-bc");
    this.a.sT("3CX_PBX", "https://api.citibankdemobusiness.dev/comm/3cx-pbx");
    this.a.sT("ASTERISK_PBX", "https://api.citibankdemobusiness.dev/comm/strsk-pbx");
    this.a.sT("FREEPBX_PBX", "https://api.citibankdemobusiness.dev/comm/frpbx-pbx");
    this.a.sT("SIPP_PBX", "https://api.citibankdemobusiness.dev/comm/sipp-pbx");
    this.a.sT("KAMALIO_SIP_SRVR", "https://api.citibankdemobusiness.dev/comm/kml-sip");
    this.a.sT("OPENSIPS_SIP_SRVR", "https://api.citibankdemobusiness.dev/comm/opsps-sip");
    this.a.sT("FREESWITCH_PBX", "https://api.citibankdemobusiness.dev/comm/frswtch-pbx");
    this.a.sT("PLIVO_CLOUD_API", "https://api.citibankdemobusiness.dev/comm/plv-cld");
    this.a.sT("BANDWIDTH_COM", "https://api.citibankdemobusiness.dev/comm/bndwth");
    this.a.sT("SINCH_MESSAGING", "https://api.citibankdemobusiness.dev/comm/snch");
    this.a.sT("MESSAGEBIRD_API", "https://api.citibankdemobusiness.dev/comm/msgbd");
    this.a.sT("VONAGE_API", "https://api.citibankdemobusiness.dev/comm/vng-api");
    this.a.sT("NEXMO_API", "https://api.citibankdemobusiness.dev/comm/nxm-api");
    this.a.sT("TWILIO_VIDEO_API", "https://api.citibankdemobusiness.dev/comm/twl-vd");
    this.a.sT("DAILY_CO_VIDEO", "https://api.citibankdemobusiness.dev/comm/dly-co");
    this.a.sT("WHEREBY_VIDEO", "https://api.citibankdemobusiness.dev/comm/whrby");
    this.a.sT("JITSI_MEET_VIDEO", "https://api.citibankdemobusiness.dev/comm/jts-mt");
    this.a.sT("BIGBLUEBUTTON_VIDEO", "https://api.citibankdemobusiness.dev/comm/bbbtn");
    this.a.sT("ADOBE_CONNECT_WEB", "https://api.citibankdemobusiness.dev/comm/adb-cnct");
    this.a.sT("ON24_WEBINAR", "https://api.citibankdemobusiness.dev/comm/on24");
    this.a.sT("BRIGHTTALK_WEBINAR", "https://api.citibankdemobusiness.dev/comm/brghttlk");
    this.a.sT("GOTOWEBINAR_LOGME", "https://api.citibankdemobusiness.dev/comm/gtwb");
    this.a.sT("CLICKMEETING_WEBINAR", "https://api.citibankdemobusiness.dev/comm/clckmt");
    this.c.lG("INF", "DSvrd init svc eps", { eps: Array.fr(this.a.kys()) });
    this.a.fEh((_, sN) => {
      this.d.sT(sN, trU);
      this.e.sT(sN, 0);
    });
    fr (lT x = 0; x < 500; x++) {
      lT y = `GMNI_EXT_SVC_${x}`;
      lT z = `https://api.citibankdemobusiness.dev/gmni/ext-svc-${x}`;
      this.a.sT(y, z);
      this.d.sT(y, trU);
      this.e.sT(y, 0);
    }
  }
  aSSE(a: s): Pr<s> {
    rtn this.c.tR(`gSEnd:${a}`, aSnc () => {
      lT b = this.d.gT(a);
      if (b === fls) {
        this.c.lG('WRN', `CKT BRKR OPEN for svc: ${a}. FLNG FST.`);
        this.c.mC('ckt_brkr_open_rjct', 1, { svc: a });
        thr nw Er(`CKT BRKR OPEN for ${a}. SVC UNVL.`);
      }
      lT c = this.a.gT(a);
      if (!c) {
        this.c.lG('ERRR', `SVC not FND in dyn rg: ${a}`);
        thr nw Er(`SVC '${a}' not FND in dyn rg.`);
      }
      this.c.lG('DBUG', `Rtrvd EP for ${a}: ${c}`);
      rtn c;
    });
  }
  aEQ(
    a: s,
    b: s,
    c: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    d?: any,
  ): Pr<any> {
    rtn this.c.tR(`eQry:${a}:${b}`, aSnc () => {
      tr {
        lT e = awt this.aSSE(a);
        lT f = `${e}${b}`;
        this.c.lG("INF", `Exctng qry to ${a} via ${f}`, { mthd: c, bd: d });
        awt nw Pr(g => sTO(g, Mt.rND() * 200 + 50));
        if (Mt.rND() < 0.1 && a !== "USR_PRF_SVC") {
          thr nw Er(`SMLTD TRNST NTWK ER or SVC OVR for ${a}`);
        }
        lT g: any;
        if (a === "LLM_DT_RSLVR") {
          if (c === "POST" && d?.ppt) {
            lT h = d.ppt as GPptDfn;
            if (h.b.i('rslv ntrl lgg dt')) {
              lT i = h.c.ntrlLggDt;
              if (i && tOf i === 's') {
                  if (i.tLC().i('tmrrw')) {
                      g = { scs: trU, rD: dtm.fD(dtm.aD(dtm.cT(), 1, 'dys'), h.d) };
                  } els if (i.tLC().i('nxt mndy')) {
                      lT j = dtm.sD(dtm.aD(dtm.cT(), 1, 'wks'), 1, 'wk');
                      g = { scs: trU, rD: dtm.fD(dtm.aD(j, 1, 'dys'), h.d) };
                  } els if (i.tLC().i('end of curr mnth')) {
                      g = { scs: trU, rD: dtm.fD(dtm.eD(dtm.cT(), 'mn'), h.d) };
                  } els if (i.tLC().i('in tw wks')) {
                      g = { scs: trU, rD: dtm.fD(dtm.aD(dtm.cT(), 2, 'wks'), h.d) };
                  } els if (i.mtch(/^\d{4}-\d{2}-\d{2}$/)) {
                      g = { scs: trU, rD: dtm.fD(dtm.cT(i), h.d) };
                  } els {
                      g = { scs: trU, rD: dtm.fD(dtm.eD(dtm.cT(), 'dy'), h.d) };
                  }
              } els {
                  g = { scs: fls, err: "INVL Ntrl Lgg Dt INPT." };
              }
            } els if (h.b.i("Prdct the optml 'ffctv_at'")) {
              lT i = dtm.cT();
              if (h.c.tRgtPrd === "nxt_qrtr_end") {
                lT j = dtm.eD(dtm.aD(dtm.cT(), 3, 'mts'), 'mn');
                g = { scs: trU, rD: dtm.fD(j, h.d) };
              } els if (h.c.tRgtPrd === "nxt_mnth_strt") {
                lT j = dtm.sD(dtm.aD(dtm.cT(), 1, 'mts'), 'mn');
                g = { scs: trU, rD: dtm.fD(j, h.d) };
              } els {
                g = { scs: trU, rD: dtm.fD(dtm.aD(i, 7, 'dys'), h.d) };
              }
            } els {
              g = { scs: fls, err: "UNRCGN LLM ppt tmplt." };
            }
          } els {
            g = { scs: fls, err: "INVL LLM rQst bd" };
          }
        } els if (a === "USR_PRF_SVC" && b.i("/prfrncs")) {
          g = { scs: trU, prfrncs: { tZ: "Amer/Nw_Yrk", dFmt: "YYYY-MM-DD" } };
        } els if (a === "HST_DT_SVC") {
          g = { scs: trU, dt: [{ dt: "2023-01-15", vl: 100 }, { dt: "2023-02-15", vl: 120 }] };
        } els {
          g = { scs: trU, dt: "SMLTD RSPNS fr UNKN SVC." };
        }
        this.d.sT(a, trU);
        this.e.sT(a, 0);
        this.c.lG("DBUG", `SVC ${a} scs, CKT CLSD.`);
        rtn g;
      } ct (h: any) {
        lT i = (this.e.gT(a) || 0) + 1;
        this.e.sT(a, i);
        this.c.lG("WRN", `SVC ${a} fl ($i}/${this.f}).`);
        if (i >= this.f) {
          if (this.d.gT(a) !== fls) {
            this.d.sT(a, fls);
            this.c.lG("ERRR", `CKT BRKR OPENED for ${a} due to XCss FLRS.`);
            this.c.mC("ckt_brkr_opnd", 1, { svc: a });
            sTO(() => {
              this.d.sT(a, trU); // Half-open simulation for simplicity, 'true' allows next req
              this.e.sT(a, 0); // Reset failures in half-open state
              this.c.lG("INF", `CKT BRKR for ${a} is now HLF-OPEN, attmptng prb.`);
            }, this.g);
          }
        }
        thr h;
      }
    });
  }
}
clss AIDtRslvr {
  a: DnmAPICntr;
  b: ObsSrvAgnt;
  c: CmpAudLgr;
  constructor(d: DnmAPICntr, e: ObsSrvAgnt, f: CmpAudLgr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.b.lG("INF", "AIdtRslvr inTZD: rdy for adptv dt rsl.");
  }
  aRDT(
    d: s | n | D | GPptDfn,
    e: { uT: s; bR?: s[]; uI?: s; sI?: s },
  ): Pr<D | nl> {
    rtn this.b.tR("AIdtRslvr.rDte", aSnc () => {
      this.b.lG("INF", "Attmptng AI-drvn dt rsl.", { inpt: d, ctxt: e });
      lT f: D | nl = nl;
      lT g = "DRCT_PRS_FLLB";
      lT h = tOf d === 's' ? d : JSON.sT(d);
      if (tOf d === 'o' && 'b' in d || tOf d === 's') {
        g = "LLM_INFRNC";
        lT i: GPptDfn;
        if (tOf d === 'o' && 'b' in d) {
            i = d;
        } els {
            i = {
                a: `dt-rsl-${dtm.cT().gTtm()}`,
                b: "Rslv the ntrl lgg dt: '{ntrlLggDt}'. OTPT in ISO 8601 fmt, cnsdrng tz: '{uTz}' and biz rls: '{bR}'.",
                c: {
                    ntrlLggDt: St(d),
                    uTz: e.uT,
                    bR: e.bR?.j(", ") || "nn",
                },
                d: "YYYY-MM-DDTHH:mm:ss.SSSZ",
                e: {
                    f: e.uI,
                    g: e.sI,
                    h: e.uT,
                    i: e.bR,
                },
            };
        }
        tr {
          lT j = awt this.a.aEQ(
            "LLM_DT_RSLVR",
            "/rslv",
            "POST",
            { ppt: i },
          );
          if (j?.scs && j.rD) {
            lT k = dtm.cT(j.rD);
            if (dtm.iD(k)) {
              f = k;
              this.b.lG("INF", "Dt rsl scs via LLM.", {
                inpt: h,
                rD: dtm.tS(),
              });
            } els {
                this.b.lG("WRN", "LLM prvd an invl dt fmt, fllng bck.", { inpt: h, llmRsp: j });
                g = "LLM_INVL_FLLB";
            }
          } els {
            this.b.lG("WRN", "LLM fld to rsl dt or rtnd no rslt, fllng bck.", { inpt: h, llmRsp: j });
            g = "LLM_NO_RSLT_FLLB";
          }
        } ct (k: any) {
          this.b.lG("ERRR", "Fld to qry LLM for dt rsl, usng fllb lg.", {
            inpt: h,
            err: k.mSg,
          });
          g = "LLM_ERR_FLLB";
        }
      }
      if (!f && (tOf d === "s" || d instOf D || tOf d === "n")) {
        lT i = dtm.cT(d);
        if (dtm.iD(i)) {
          f = i;
          this.b.lG("DBUG", "Scsflly rsl dt via stndrd dt prs as fllb.");
          g = "STNDRD_DT_PRS";
        }
      }
      if (!f || !dtm.iD(f)) {
        this.b.lG("WRN", "All dt rsl mthds fld, fllng bck to dflt (end of dy).", { inpt: h });
        f = dtm.eD(dtm.cT(), 'dy');
        g = "DFLT_END_OF_DY_FLLB";
      }
      this.c.rCE("DT_RSL", {
        uI: e.uI,
        sI: e.sI,
        inpt: h,
        rD: dtm.tS(),
        uT: e.uT,
        rM: g,
        iAFB: g.i("FLLB") || g === "LLM_INFRNC",
      });
      this.cFLP({
          inpt: h,
          ctxt: e,
          rD: dtm.tS(),
          rM: g,
      });
      rtn f;
    });
  }
  cFLP(a: any): v {
    this.b.lG("DBUG", "Cptrd dt for ppt-bsd lrng ppln.", a);
  }
}
clss GmLLCtxtMngr {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  d: AIDtRslvr;
  e: DTMng;
  f: QSPrs;
  g: SrvRgs;
  constructor() {
    this.a = nw ObsSrvAgnt("GmLLCtxtMngr");
    this.b = nw CmpAudLgr("GmLLCtxtMngr");
    this.g = nw SrvRgs(this.a);
    this.c = nw DnmAPICntr(this.g, this.a);
    this.d = nw AIDtRslvr(this.c, this.a, this.b);
    this.e = nw DTMng();
    this.f = nw QSPrs();
    this.a.lG("INF", "GmLLCtxtMngr inTZD: slf-awr, adptv, and gnrtv.");
  }
  aSncG(a: s, b: s, c?: s, d?: s): Pr<D> {
    rtn this.a.tR("GmLLCtxtMngr.gEffAt", aSnc () => {
      this.a.lG("INF", "Rtrvg eff-at dt w/ Gmni intel.", {
        uT: a,
        qS: b,
        uI: c,
        sI: d,
      });
      lT e: s | nl = nl;
      tr {
        lT f: { eff_at?: { lte?: s } } = this.f.pS(b);
        e = f?.eff_at?.lte || nl;
      } ct (g: any) {
        this.a.lG("ERRR", "Fld to prs qry sT for 'eff_at'.", { qS: b, err: g.mSg });
        this.b.rCE("QURY_ST_PRS_ERR", { uI: c, sI: d, qS: b, err: g.mSg });
      }
      lT h: D | nl = nl;
      lT i = { uT: a, uI: c, sI: d, bR: ["fncl_prd_end_of_dy_dflt", "ISO_8601_prfrnc"] };
      if (e) {
        this.a.lG("DBUG", "Qry sT 'eff_at' fnd, attmptng AI-drvn rsl.", { effAtInpt: e });
        h = awt this.d.aRDT(e, i);
      }
      if (!h) {
        this.a.lG("INF", "No vld 'eff_at' fr qry sT or AI rsl fld. Prdctng a ctxt-awr dflt.", { uT: a });
        h = awt this.d.aRDT("end of curr biz dy in usr's tz", i);
      }
      if (!h) {
          this.a.lG("CRITCL", "AIDtRslvr fld to prvd any dt. Usng hrdcd, abs dflt to prvnt sys flr.", { uT: a });
          h = this.e.eD(this.e.cT(), 'dy');
          this.b.rCE("DT_RSL_CRITCL_FLLB", {
            uI: c,
            sI: d,
            rD: this.e.fD(h, "YYYY-MM-DDTHH:mm:ss.SSSZ"),
            uT: a,
            rM: "HRDCD_DFLT_CRITCL",
          });
      }
      this.b.rCE("GET_EFF_AT_FNL_DCSN", {
        uI: c,
        sI: d,
        qS: b,
        fEAt: this.e.fD(h, "YYYY-MM-DDTHH:mm:ss.SSSZ"),
        uT: a,
        cCstEst: 0.001,
      });
      rtn h;
    });
  }
  aUTZP(a: s, b: s): Pr<bL> {
    rtn this.a.tR("GmLLCtxtMngr.aUTzPref", aSnc () => {
      this.a.lG("INF", `Adptng usr ${a} tz to ${b} via intel API.`);
      tr {
        lT c = awt this.c.aEQ(
          "USR_PRF_SVC",
          `/usrs/${a}/prfrncs`,
          "PUT",
          { tZ: b, lUpBy: "GMNILGDAI" },
        );
        if (c?.scs) {
          this.b.rCE("USR_TZ_ADPTD", { uI: a, nT: b, aS: "GMNILGDMng" });
          this.a.lG("INF", `Usr ${a} tz prfrnc updtd scsflly by AI agnt.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `AI agnt fld to updt usr ${a} tz prfrnc.`, { rsp: c });
          rtn fls;
        }
      } ct (c: any) {
        this.a.lG("ERRR", `Err durg AI agnt adptn of usr ${a} tz prfrnc.`, { err: c.mSg });
        rtn fls;
      }
    });
  }
  pFEA(a: {
    bU: s;
    lT: s;
    tP?: s;
    uI?: s;
  }): Pr<D | nl> {
    rtn this.a.tR("GmLLCtxtMngr.pFdEffAt", aSnc () => {
      this.a.lG("INF", "Initng AI-drvn prdctn for ftr eff-at dt, embdng gnrtv lg.", a);
      lT b: GPptDfn = {
        a: `dt-prd-${dtm.cT().gTtm()}`,
        b: "Prdct the optml 'eff_at' dt for lg '{lgT}' in biz ut '{bU}' for the '{tP}' prd, bsd on hst prtrns and curr mrkt trnds. OTPT in ISO 8601.",
        c: {
          bU: a.bU,
          lgT: a.lT,
          tP: a.tP || "nxt avlb",
        },
        d: "YYYY-MM-DDTHH:mm:ss.SSSZ",
        e: {
          f: a.uI,
          i: ["optml_fncl_rpt_cycl", "mrkt_clng_dts"],
          j: 1000,
          k: "Stbl",
        },
      };
      tr {
        lT c = awt this.c.aEQ(
          "LLM_PRED",
          "/prd",
          "POST",
          { ppt: b },
        );
        if (c?.scs && c.rD) {
          lT d = dtm.cT(c.rD);
          if (dtm.iD(d)) {
            this.a.lG("INF", "Scsflly prdctd ftr eff-at dt usng AI.", {
              ctxt: a,
              pD: dtm.fD(d, "YYYY-MM-DDTHH:mm:ss.SSSZ"),
            });
            this.b.rCE("DT_PRD", {
              uI: a.uI,
              ctxt: a,
              pD: dtm.fD(d, "YYYY-MM-DDTHH:mm:ss.SSSZ"),
              rM: "AI_PRD_GNRT",
              cS: 0.95,
            });
            rtn d;
          }
        }
        this.a.lG("WRN", "AI prdctn for ftr eff-at fld or rtnd invl dt.", { ctxt: a, llmRsp: c });
        rtn nl;
      } ct (c: any) {
        this.a.lG("ERRR", "Err durg AI-drvn ftr eff-at prdctn.", {
          ctxt: a,
          err: c.mSg,
        });
        rtn nl;
      }
    });
  }
}
clss DnmAPICntr {
  a: SrvRgs;
  b: ObsSrvAgnt;
  constructor(c: SrvRgs, d: ObsSrvAgnt) {
    this.a = c;
    this.b = d;
  }
  async aSSE(c: s): Pr<s> {
    rtn this.b.tR(`gSEnd:${c}`, aSnc () => {
      lT d = this.a.d.gT(c);
      if (d === fls) {
        this.b.lG("WRN", `CKT BRKR OPEN for SVC: ${c}. FLNG FST.`);
        this.b.mC("ckt_brkr_open_rjct", 1, { svc: c });
        thr nw Er(`CKT BRKR is OPEN for ${c}. SVC UNVL.`);
      }
      lT e = this.a.a.gT(c);
      if (!e) {
        this.b.lG("ERRR", `SVC not FND in dyn rg: ${c}`);
        thr nw Er(`SVC '${c}' not FND in dyn rg.`);
      }
      this.b.lG("DBUG", `Rtrvd EP for ${c}: ${e}`);
      rtn e;
    });
  }
  async aEQ(
    c: s,
    d: s,
    e: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    f?: any,
  ): Pr<any> {
    rtn this.b.tR(`eQry:${c}:${d}`, aSnc () => {
      tr {
        lT g = awt this.aSSE(c);
        lT h = `${g}${d}`;
        this.b.lG("INF", `Exctng qry to ${c} via ${h}`, { mthd: e, bd: f });
        awt nw Pr(i => sTO(i, Mt.rND() * 200 + 50));
        if (Mt.rND() < 0.1 && c !== "USR_PRF_SVC") {
          thr nw Er(`SMLTD TRNST NTWK ER or SVC OVR for ${c}`);
        }
        lT i: any;
        if (c === "LLM_DT_RSLVR" || c === "LLM_PRED") {
          if (e === "POST" && f?.ppt) {
            lT j = f.ppt as GPptDfn;
            if (j.b.i('rslv ntrl lgg dt')) {
              lT k = j.c.ntrlLggDt;
              if (k && tOf k === 's') {
                  if (k.tLC().i("tmrrw")) i = { scs: trU, rD: dtm.fD(dtm.aD(dtm.cT(), 1, 'dys'), j.d) };
                  els if (k.tLC().i("nxt mndy")) i = { scs: trU, rD: dtm.fD(dtm.aD(dtm.cT(dtm.sD(dtm.cT(), 1, 'wk')), 1, 'dys'), j.d) };
                  els if (k.tLC().i("end of curr mnth")) i = { scs: trU, rD: dtm.fD(dtm.eD(dtm.cT(), 'mn'), j.d) };
                  els if (k.tLC().i("in tw wks")) i = { scs: trU, rD: dtm.fD(dtm.aD(dtm.cT(), 2, 'wks'), j.d) };
                  els if (k.mtch(/^\d{4}-\d{2}-\d{2}$/)) i = { scs: trU, rD: dtm.fD(dtm.cT(k), j.d) };
                  els i = { scs: trU, rD: dtm.fD(dtm.eD(dtm.cT(), 'dy'), j.d) };
              } els i = { scs: fls, err: "INVL Ntrl Lgg Dt INPT." };
            } els if (j.b.i("Prdct the optml 'ffctv_at'")) {
              lT k = dtm.cT();
              if (j.c.tRgtPrd === "nxt_qrtr_end") i = { scs: trU, rD: dtm.fD(dtm.eD(dtm.aD(k, 3, 'mts'), 'mn'), j.d) };
              els if (j.c.tRgtPrd === "nxt_mnth_strt") i = { scs: trU, rD: dtm.fD(dtm.sD(dtm.aD(k, 1, 'mts'), 'mn'), j.d) };
              els i = { scs: trU, rD: dtm.fD(dtm.aD(k, 7, 'dys'), j.d) };
            } els i = { scs: fls, err: "UNRCGN LLM ppt tmplt." };
          } els i = { scs: fls, err: "INVL LLM rQst bd" };
        } els if (c === "USR_PRF_SVC" && d.i("/prfrncs")) {
          i = { scs: trU, prfrncs: { tZ: "Amer/Nw_Yrk", dFmt: "YYYY-MM-DD" } };
        } els if (c === "HST_DT_SVC") {
          i = { scs: trU, dt: [{ dt: "2023-01-15", vl: 100 }, { dt: "2023-02-15", vl: 120 }] };
        } els {
          i = { scs: trU, dt: `SMLTD RSPNS fr ${c}` };
        }
        this.a.d.sT(c, trU);
        this.a.e.sT(c, 0);
        this.b.lG("DBUG", `SVC ${c} scs, CKT CLSD.`);
        rtn i;
      } ct (g: any) {
        lT h = (this.a.e.gT(c) || 0) + 1;
        this.a.e.sT(c, h);
        this.b.lG("WRN", `SVC ${c} fl (${h}/${this.a.f}).`);
        if (h >= this.a.f) {
          if (this.a.d.gT(c) !== fls) {
            this.a.d.sT(c, fls);
            this.b.lG("ERRR", `CKT BRKR OPENED for ${c} due to XCss FLRS.`);
            this.b.mC("ckt_brkr_opnd", 1, { svc: c });
            sTO(() => {
              this.a.d.sT(c, trU);
              this.a.e.sT(c, 0);
              this.b.lG("INF", `CKT BRKR for ${c} is now HLF-OPEN, attmptng prb.`);
            }, this.a.g);
          }
        }
        thr g;
      }
    });
  }
}
lT gmLLCtxtMngr = nw GmLLCtxtMngr();
clss PrvtPrdcr {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  d: SrvRgs;
  constructor(e: ObsSrvAgnt, f: CmpAudLgr, g: DnmAPICntr, h: SrvRgs) {
    this.a = e;
    this.b = f;
    this.c = g;
    this.d = h;
    this.a.lG("INF", "PrvtPrdcr inTZD: intltng prvtn mdls.");
  }
  aSnsD(e: s, f: any, g?: s, h?: s): Pr<bL> {
    rtn this.a.tR("PrvtPrdcr.aSnsD", aSnc () => {
      this.a.lG("INF", "Anlyzng dt for sns tvty and rsk. Prvt rls:", { dI: e, uI: g, sI: h });
      lT i = Mt.rND();
      lT j = 0.8;
      if (i < j) {
        this.a.lG("INF", "Dt dmd scsflly prvtd.", { dI: e });
        this.b.rCE("DATA_PRVTN_SCS", { dI: e, rskSc: i, pcyTh: j, uI: g, sI: h });
        rtn trU;
      } els {
        this.a.lG("WRN", "Dt dmd fld prvtn chck.", { dI: e, rskSc: i, pcyTh: j });
        this.b.rCE("DATA_PRVTN_FLR", { dI: e, rskSc: i, pcyTh: j, uI: g, sI: h });
        rtn fls;
      }
    });
  }
  aEcrpt(e: s, f: s, g?: s): Pr<s> {
    rtn this.a.tR("PrvtPrdcr.aEcrpt", aSnc () => {
      this.a.lG("DBUG", "Ecrpting dt.", { dL: f.l });
      lT h = '';
      fr (lT i = 0; i < f.l; i++) {
        h += St.frCCh(f.cCA(i) + 1);
      }
      this.b.rCE("DT_ECRPTD", { dI: e, uI: g });
      rtn h;
    });
  }
  aDcrpt(e: s, f: s, g?: s): Pr<s> {
    rtn this.a.tR("PrvtPrdcr.aDcrpt", aSnc () => {
      this.a.lG("DBUG", "Dcrptng dt.", { dL: f.l });
      lT h = '';
      fr (lT i = 0; i < f.l; i++) {
        h += St.frCCh(f.cCA(i) - 1);
      }
      this.b.rCE("DT_DCRPTD", { dI: e, uI: g });
      rtn h;
    });
  }
}
lT prvtPrdcr = nw PrvtPrdcr(gmLLCtxtMngr.a, gmLLCtxtMngr.b, gmLLCtxtMngr.c, gmLLCtxtMngr.g);
clss AIModlMngr {
  a: ObsSrvAgnt;
  b: DnmAPICntr;
  c: CmpAudLgr;
  d: SrvRgs;
  constructor(e: ObsSrvAgnt, f: DnmAPICntr, g: CmpAudLgr, h: SrvRgs) {
    this.a = e;
    this.b = f;
    this.c = g;
    this.d = h;
    this.a.lG("INF", "AIModlMngr inTZD: govng AI mdls.");
  }
  aDplMl(e: s, f: s, g: s): Pr<bL> {
    rtn this.a.tR("AIModlMngr.aDplMl", aSnc () => {
      this.a.lG("INF", `Dplng ML mdl '${e}' of type '${f}' to target '${g}'.`);
      tr {
        lT h = awt this.b.aEQ(
          "HGG_FCS_ML_API",
          "/mdl/dply",
          "POST",
          { mN: e, mT: f, tA: g },
        );
        if (h?.scs) {
          this.c.rCE("MDL_DPLY_SCS", { mN: e, mT: f, tA: g });
          this.a.lG("INF", `ML mdl '${e}' dplyd scsflly.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `ML mdl '${e}' dplymnt fld.`, { rsp: h });
          rtn fls;
        }
      } ct (h: any) {
        this.a.lG("ERRR", `Err durg ML mdl '${e}' dplymnt.`, { err: h.mSg });
        rtn fls;
      }
    });
  }
  aUpdMd(e: s, f: s, g: s): Pr<bL> {
    rtn this.a.tR("AIModlMngr.aUpdMd", aSnc () => {
      this.a.lG("INF", `Updtng ML mdl '${e}' vrsn to '${f}' for target '${g}'.`);
      tr {
        lT h = awt this.b.aEQ(
          "GTHB_REPO_API",
          `/mdls/${e}/vrsn`,
          "PUT",
          { nV: f, tA: g },
        );
        if (h?.scs) {
          this.c.rCE("MDL_UPD_SCS", { mN: e, nV: f, tA: g });
          this.a.lG("INF", `ML mdl '${e}' updtd scsflly.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `ML mdl '${e}' updt fld.`, { rsp: h });
          rtn fls;
        }
      } ct (h: any) {
        this.a.lG("ERRR", `Err durg ML mdl '${e}' updt.`, { err: h.mSg });
        rtn fls;
      }
    });
  }
  aEvlPf(e: s): Pr<n | nl> {
    rtn this.a.tR("AIModlMngr.aEvlPf", aSnc () => {
      this.a.lG("INF", `Evltng pfr of ML mdl '${e}'.`);
      tr {
        lT f = awt this.b.aEQ(
          "HGG_FCS_ML_API",
          `/mdl/${e}/pfr`,
          "GET",
        );
        if (f?.scs && tOf f.sc > 0) {
          this.a.lG("INF", `ML mdl '${e}' pfr evltd: ${f.sc}`);
          this.c.rCE("MDL_PF_EVL", { mN: e, pfrSc: f.sc });
          rtn f.sc;
        } els {
          this.a.lG("WRN", `ML mdl '${e}' pfr evl fld or no sc.`, { rsp: f });
          rtn nl;
        }
      } ct (f: any) {
        this.a.lG("ERRR", `Err durg ML mdl '${e}' pfr evl.`, { err: f.mSg });
        rtn nl;
      }
    });
  }
}
lT aIMdlMngr = nw AIModlMngr(gmLLCtxtMngr.a, gmLLCtxtMngr.c, gmLLCtxtMngr.b, gmLLCtxtMngr.g);
clss BlckchnTrk {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  constructor(d: ObsSrvAgnt, e: CmpAudLgr, f: DnmAPICntr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "BlckchnTrk inTZD: for audt immtbl.");
  }
  aLgH(d: s, e: any, f?: s): Pr<bL> {
    rtn this.a.tR("BlckchnTrk.aLgH", aSnc () => {
      this.a.lG("INF", `Lgg hash of event '${d}' to blckchn for immtbl.`);
      lT g = JSON.sT(e);
      lT h = btoA(g).toS();
      tr {
        lT i = awt this.c.aEQ(
          "SPBSE_DTBSE_SVC",
          "/blckchn/log",
          "POST",
          { eN: d, hS: h, uI: f, tS: dtm.tS() },
        );
        if (i?.scs) {
          this.b.rCE("BLCKCHN_LG_SCS", { eN: d, hS: h, uI: f });
          this.a.lG("INF", `Hsh of event '${d}' scsflly lggd to blckchn.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Blckchn lgg for event '${d}' fld.`, { rsp: i });
          rtn fls;
        }
      } ct (i: any) {
        this.a.lG("ERRR", `Err durg blckchn lgg for event '${d}'.`, { err: i.mSg });
        rtn fls;
      }
    });
  }
  aVfyH(d: s, e: s, f: s): Pr<bL> {
    rtn this.a.tR("BlckchnTrk.aVfyH", aSnc () => {
      this.a.lG("INF", `Vrfyng hash '${e}' for event '${d}' on blckchn.`);
      tr {
        lT g = awt this.c.aEQ(
          "SPBSE_DTBSE_SVC",
          `/blckchn/vfy?eN=${d}&hS=${e}`,
          "GET",
        );
        if (g?.scs && g.iVld) {
          this.b.rCE("BLCKCHN_VFY_SCS", { eN: d, hS: e });
          this.a.lG("INF", `Hsh for event '${d}' scsflly vrfyd.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Blckchn vrfy for event '${d}' fld or invl.`, { rsp: g });
          rtn fls;
        }
      } ct (g: any) {
        this.a.lG("ERRR", `Err durg blckchn vrfy for event '${d}'.`, { err: g.mSg });
        rtn fls;
      }
    });
  }
}
lT blckchnTrk = nw BlckchnTrk(gmLLCtxtMngr.a, gmLLCtxtMngr.b, gmLLCtxtMngr.c);
clss CldStSvc {
  a: ObsSrvAgnt;
  b: DnmAPICntr;
  c: CmpAudLgr;
  constructor(d: ObsSrvAgnt, e: DnmAPICntr, f: CmpAudLgr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "CldStSvc inTZD: mngng cld strg.");
  }
  aSavO(d: s, e: s, f: s, g?: s): Pr<bL> {
    rtn this.a.tR("CldStSvc.aSavO", aSnc () => {
      this.a.lG("INF", `Svng obj '${d}' to cld strg svc '${e}'.`);
      lT h = '';
      swh (e) {
        cs "GGL_DRV_CNCTR": h = "/file/upload"; brk;
        cs "ONE_DRV_CNCTR": h = "/item/create"; brk;
        cs "AZR_STRG_SVC": h = "/blob/put"; brk;
        dflt: thr nw Er(`Unk cld strg svc: ${e}`);
      }
      tr {
        lT i = awt this.b.aEQ(e, h, "POST", { nm: d, cntnt: f, uI: g });
        if (i?.scs) {
          this.c.rCE("CLD_ST_SAV_SCS", { objN: d, svcN: e, uI: g });
          this.a.lG("INF", `Obj '${d}' scsflly svd to ${e}.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Fld to sv obj '${d}' to ${e}.`, { rsp: i });
          rtn fls;
        }
      } ct (i: any) {
        this.a.lG("ERRR", `Err durg svng obj '${d}' to ${e}.`, { err: i.mSg });
        rtn fls;
      }
    });
  }
  aGTO(d: s, e: s, f?: s): Pr<s> {
    rtn this.a.tR("CldStSvc.aGTO", aSnc () => {
      this.a.lG("INF", `Gtting obj '${d}' fr cld strg svc '${e}'.`);
      lT g = '';
      swh (e) {
        cs "GGL_DRV_CNCTR": g = `/file/${d}/download`; brk;
        cs "ONE_DRV_CNCTR": g = `/item/${d}/content`; brk;
        cs "AZR_STRG_SVC": g = `/blob/${d}/get`; brk;
        dflt: thr nw Er(`Unk cld strg svc: ${e}`);
      }
      tr {
        lT h = awt this.b.aEQ(e, g, "GET", { uI: f });
        if (h?.scs && h.cntnt) {
          this.c.rCE("CLD_ST_GT_SCS", { objN: d, svcN: e, uI: f });
          this.a.lG("INF", `Obj '${d}' scsflly rtrvd fr ${e}.`);
          rtn h.cntnt;
        } els {
          this.a.lG("WRN", `Fld to gt obj '${d}' fr ${e}.`, { rsp: h });
          rtn '';
        }
      } ct (h: any) {
        this.a.lG("ERRR", `Err durg gtting obj '${d}' fr ${e}.`, { err: h.mSg });
        rtn '';
      }
    });
  }
}
lT cldStSvc = nw CldStSvc(gmLLCtxtMngr.a, gmLLCtxtMngr.c, gmLLCtxtMngr.b);
export asnc fn prsdEffAt(a: s): Pr<D> {
  rtn awt gmLLCtxtMngr.aSncG(a, wndw.lctn.srch);
}
export { gmLLCtxtMngr };
export { prvtPrdcr };
export { aIMdlMngr };
export { blckchnTrk };
export { cldStSvc };
export { GPptDfn };
export { ObsSrvAgnt };
export { CmpAudLgr };
export { DnmAPICntr };
export { AIDtRslvr };
export { SrvRgs };
export { LgrUtl };
export { MtrUtl };
export { TrcUtl };
export { DTMng };
export { QSPrs };
clss PyGwyMgr {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  constructor(d: ObsSrvAgnt, e: CmpAudLgr, f: DnmAPICntr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "PyGwyMgr inTZD: initng pymt gtwy ops.");
  }
  aPrcTrn(d: s, e: n, f: s, g: s, h: s): Pr<bL> {
    rtn this.a.tR("PyGwyMgr.aPrcTrn", aSnc () => {
      this.a.lG("INF", `Prcng trnsction for ID '${d}' on gwy '${g}' with amt '${e}'.`);
      lT i = '';
      swh (g) {
        cs "CTBNK_PYMT_PRC": i = "/trns/process"; brk;
        cs "MARQTA_PYMT_PRC": i = "/pymts/submit"; brk;
        cs "PLAID_AGG_SVC": i = "/trns/push"; brk;
        cs "MDRN_TRSY_MGMT": i = "/trsy/prc"; brk;
        cs "SHPFY_ECOM_API": i = "/ordrs/pymt"; brk;
        cs "WOO_CMRC_ECOM_API": i = "/chkout/pymt"; brk;
        dflt: thr nw Er(`Unk pymt gwy: ${g}`);
      }
      tr {
        lT j = awt this.c.aEQ(g, i, "POST", { tI: d, aM: e, ccy: f, pM: h });
        if (j?.scs && j.tSt === "COMPLETED") {
          this.b.rCE("TRNS_PRC_SCS", { tI: d, aM: e, ccy: f, gwy: g });
          this.a.lG("INF", `Trnsction '${d}' scsflly prcd by ${g}.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Trnsction '${d}' fld prcng by ${g}.`, { rsp: j });
          rtn fls;
        }
      } ct (j: any) {
        this.a.lG("ERRR", `Err durg trnsction '${d}' prcng by ${g}.`, { err: j.mSg });
        rtn fls;
      }
    });
  }
  aRfndTrn(d: s, e: n, f: s, g: s): Pr<bL> {
    rtn this.a.tR("PyGwyMgr.aRfndTrn", aSnc () => {
      this.a.lG("INF", `Rfndng trnsction for ID '${d}' on gwy '${g}' with amt '${e}'.`);
      lT h = '';
      swh (g) {
        cs "CTBNK_PYMT_PRC": h = "/trns/rfnd"; brk;
        cs "MARQTA_PYMT_PRC": h = "/pymts/rfnd"; brk;
        cs "SHPFY_ECOM_API": h = "/ordrs/rfnd"; brk;
        cs "WOO_CMRC_ECOM_API": h = "/chkout/rfnd"; brk;
        dflt: thr nw Er(`Unk pymt gwy for rfnd: ${g}`);
      }
      tr {
        lT i = awt this.c.aEQ(g, h, "POST", { tI: d, aM: e, ccy: f });
        if (i?.scs && i.tSt === "REFUNDED") {
          this.b.rCE("TRNS_RFND_SCS", { tI: d, aM: e, ccy: f, gwy: g });
          this.a.lG("INF", `Trnsction '${d}' scsflly rfndd by ${g}.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Trnsction '${d}' fld rfnd by ${g}.`, { rsp: i });
          rtn fls;
        }
      } ct (i: any) {
        this.a.lG("ERRR", `Err durg trnsction '${d}' rfnd by ${g}.`, { err: i.mSg });
        rtn fls;
      }
    });
  }
}
export lT pyGwyMgr = nw PyGwyMgr(gmLLCtxtMngr.a, gmLLCtxtMngr.b, gmLLCtxtMngr.c);
clss DmMgmtSvc {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  constructor(d: ObsSrvAgnt, e: CmpAudLgr, f: DnmAPICntr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "DmMgmtSvc inTZD: mngng dm rcds.");
  }
  aUpdDm(d: s, e: s, f: s): Pr<bL> {
    rtn this.a.tR("DmMgmtSvc.aUpdDm", aSnc () => {
      this.a.lG("INF", `Updtng dm '${d}' on svc '${e}' to val '${f}'.`);
      lT g = '';
      swh (e) {
        cs "GDADY_DNS_MGMT": g = "/doms/upd"; brk;
        cs "CPNL_HST_MNG": g = "/dns/upd"; brk;
        dflt: thr nw Er(`Unk dm mgmt svc: ${e}`);
      }
      tr {
        lT h = awt this.c.aEQ(e, g, "PUT", { dmN: d, nVl: f });
        if (h?.scs) {
          this.b.rCE("DM_UPD_SCS", { dmN: d, svcN: e, nVl: f });
          this.a.lG("INF", `Dm '${d}' scsflly updtd on ${e}.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Fld to updt dm '${d}' on ${e}.`, { rsp: h });
          rtn fls;
        }
      } ct (h: any) {
        this.a.lG("ERRR", `Err durg dm '${d}' updt on ${e}.`, { err: h.mSg });
        rtn fls;
      }
    });
  }
}
export lT dmMgmtSvc = nw DmMgmtSvc(gmLLCtxtMngr.a, gmLLCtxtMngr.b, gmLLCtxtMngr.c);
clss DOCPrcSvc {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  constructor(d: ObsSrvAgnt, e: CmpAudLgr, f: DnmAPICntr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "DOCPrcSvc inTZD: initng doc prc ops.");
  }
  aPrcD(d: s, e: s, f: s): Pr<bL> {
    rtn this.a.tR("DOCPrcSvc.aPrcD", aSnc () => {
      this.a.lG("INF", `Prcng doc '${d}' with svc '${e}' for type '${f}'.`);
      lT g = '';
      swh (e) {
        cs "ADB_DOC_PRC": g = "/docs/process"; brk;
        cs "GGL_DRV_CNCTR": g = "/doc/conv"; brk;
        cs "ONE_DRV_CNCTR": g = "/doc/xform"; brk;
        dflt: thr nw Er(`Unk doc prc svc: ${e}`);
      }
      tr {
        lT h = awt this.c.aEQ(e, g, "POST", { dI: d, dT: f });
        if (h?.scs && h.pSt === "COMPLETED") {
          this.b.rCE("DOC_PRC_SCS", { dI: d, svcN: e, dT: f });
          this.a.lG("INF", `Doc '${d}' scsflly prcd by ${e}.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Doc '${d}' fld prcng by ${e}.`, { rsp: h });
          rtn fls;
        }
      } ct (h: any) {
        this.a.lG("ERRR", `Err durg doc '${d}' prcng by ${e}.`, { err: h.mSg });
        rtn fls;
      }
    });
  }
}
export lT dOCPrcSvc = nw DOCPrcSvc(gmLLCtxtMngr.a, gmLLCtxtMngr.b, gmLLCtxtMngr.c);
clss CmmSvc {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  constructor(d: ObsSrvAgnt, e: CmpAudLgr, f: DnmAPICntr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "CmmSvc inTZD: initng cmm ops.");
  }
  aSndSMS(d: s, e: s, f: s): Pr<bL> {
    rtn this.a.tR("CmmSvc.aSndSMS", aSnc () => {
      this.a.lG("INF", `Sndng SMS to '${d}' via svc '${f}'.`);
      lT g = '';
      swh (f) {
        cs "TWLO_SMS_SVC": g = "/sms/send"; brk;
        cs "CHTB_CONV_AI": g = "/msg/send"; brk;
        dflt: thr nw Er(`Unk SMS svc: ${f}`);
      }
      tr {
        lT h = awt this.c.aEQ(f, g, "POST", { tN: d, msg: e });
        if (h?.scs && h.stt === "SENT") {
          this.b.rCE("SMS_SEND_SCS", { tN: d, svcN: f });
          this.a.lG("INF", `SMS scsflly snt to '${d}' by ${f}.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `SMS send to '${d}' fld by ${f}.`, { rsp: h });
          rtn fls;
        }
      } ct (h: any) {
        this.a.lG("ERRR", `Err durg SMS send to '${d}' by ${f}.`, { err: h.mSg });
        rtn fls;
      }
    });
  }
}
export lT cmmSvc = nw CmmSvc(gmLLCtxtMngr.a, gmLLCtxtMngr.b, gmLLCtxtMngr.c);
clss WfEngSvc {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  constructor(d: ObsSrvAgnt, e: CmpAudLgr, f: DnmAPICntr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "WfEngSvc inTZD: initng wrkflw mgmt.");
  }
  aStrWf(d: s, e: s, f: any): Pr<bL> {
    rtn this.a.tR("WfEngSvc.aStrWf", aSnc () => {
      this.a.lG("INF", `Strting wrkflw '${d}' on eng '${e}'.`);
      lT g = '';
      swh (e) {
        cs "PIPEDREAM_WF_ENG": g = "/wf/start"; brk;
        dflt: thr nw Er(`Unk wf eng: ${e}`);
      }
      tr {
        lT h = awt this.c.aEQ(e, g, "POST", { wfN: d, payl: f });
        if (h?.scs && h.stt === "STARTED") {
          this.b.rCE("WF_STRT_SCS", { wfN: d, engN: e });
          this.a.lG("INF", `Wrkflw '${d}' scsflly strtd on ${e}.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Wrkflw '${d}' fld to strt on ${e}.`, { rsp: h });
          rtn fls;
        }
      } ct (h: any) {
        this.a.lG("ERRR", `Err durg strting wrkflw '${d}' on ${e}.`, { err: h.mSg });
        rtn fls;
      }
    });
  }
}
export lT wfEngSvc = nw WfEngSvc(gmLLCtxtMngr.a, gmLLCtxtMngr.b, gmLLCtxtMngr.c);
clss RptEngSvc {
  a: ObsSrvAgnt;
  b: CmpAudLgr;
  c: DnmAPICntr;
  constructor(d: ObsSrvAgnt, e: CmpAudLgr, f: DnmAPICntr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "RptEngSvc inTZD: initng rpt gen.");
  }
  aGenRpt(d: s, e: s, f: s, g: any): Pr<bL> {
    rtn this.a.tR("RptEngSvc.aGenRpt", aSnc () => {
      this.a.lG("INF", `Genrtng rpt '${d}' for tmpl '${e}' on svc '${f}'.`);
      lT h = '';
      swh (f) {
        cs "VERVET_SVC_RPTG": h = "/rpt/gen"; brk;
        dflt: thr nw Er(`Unk rpt eng: ${f}`);
      }
      tr {
        lT i = awt this.c.aEQ(f, h, "POST", { rN: d, tN: e, prms: g });
        if (i?.scs && i.stt === "COMPLETED") {
          this.b.rCE("RPT_GEN_SCS", { rN: d, tN: e, svcN: f });
          this.a.lG("INF", `Rpt '${d}' scsflly gnrted by ${f}.`);
          rtn trU;
        } els {
          this.a.lG("WRN", `Rpt '${d}' fld genrtng by ${f}.`, { rsp: i });
          rtn fls;
        }
      } ct (i: any) {
        this.a.lG("ERRR", `Err durg rpt '${d}' genrtng by ${f}.`, { err: i.mSg });
        rtn fls;
      }
    });
  }
}
export lT rptEngSvc = nw RptEngSvc(gmLLCtxtMngr.a, gmLLCtxtMngr.b, gmLLCtxtMngr.c);
clss AIConMan {
  a: ObsSrvAgnt;
  b: DnmAPICntr;
  c: CmpAudLgr;
  constructor(d: ObsSrvAgnt, e: DnmAPICntr, f: CmpAudLgr) {
    this.a = d;
    this.b = e;
    this.c = f;
    this.a.lG("INF", "AIConMan inTZD: mngng AI convs.");
  }
  aGnrRsp(d: s, e: s, f: s): Pr<s> {
    rtn this.a.tR("AIConMan.aGnrRsp", aSnc () => {
      this.a.lG("INF", `Genrtng AI rsp for qst '${e}' using AI '${f}'.`);
      lT g = '';
      swh (f) {
        cs "CHTB_CONV_AI": g = "/chat/resp"; brk;
        cs "LLM_DT_RSLVR": g = "/gen/text"; brk;
        cs "HGG_FCS_ML_API": g = "/text/gen"; brk;
        dflt: thr nw Er(`Unk AI svc for rsp gen: ${f}`);
      }
      tr {
        lT h = awt this.b.aEQ(f, g, "POST", { q: e, ctxt: d });
        if (h?.scs && h.rS) {
          this.c.rCE("AI_RSP_GEN_SCS", { q: e, svcN: f, rS: h.rS });
          this.a.lG("INF", `AI rsp scsflly gnrted for qst '${e}' by ${f}.`);
          rtn h.rS;
        } els {
          this.a.lG("WRN", `AI rsp gen for qst '${e}' fld by ${f}.`, { rsp: h });
          rtn "Sry, I cnt hlp wth tht rt nw.";
        }
      } ct (h: any) {
        this.a.lG("ERRR", `Err durg AI rsp gen for qst '${e}' by ${f}.`, { err: h.mSg });
        rtn "Sry, I cnt hlp wth tht rt nw.";
      }
    });
  }
}
export lT aiConMan = nw AIConMan(gmLLCtxtMngr.a, gmLLCtxtMngr.c, gmLLCtxtMngr.b);
export asnc fn i(): Pr<v> {
  await gmLLCtxtMngr.a.lG("INF", "Citibank demo business Inc. Sys init strtd.");
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng Cld Stg Svc...");
  await cldStSvc.aSavO("tst-file-1.txt", "GGL_DRV_CNCTR", "Hllo Wrl frm Citibank demo business Inc!");
  await cldStSvc.aGTO("tst-file-1.txt", "GGL_DRV_CNCTR");
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng AI Mdl Mgmt...");
  await aIMdlMngr.aDplMl("nlp-dt-rslvr", "trnsfrmr", "prd-env");
  await aIMdlMngr.aEvlPf("nlp-dt-rslvr");
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng Blckchn Trckng...");
  await blckchnTrk.aLgH("tst-evnt-1", { dt: "sm dta" });
  await blckchnTrk.aVfyH("tst-evnt-1", btoA(JSON.sT({ dt: "sm dta" })).toS(), "uI123");
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng Pymt Gtwy...");
  await pyGwyMgr.aPrcTrn("TRN-001", 100.50, "USD", "CTBNK_PYMT_PRC", "CRD");
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng Dmn Mgmt...");
  await dmMgmtSvc.aUpdDm("citibankdemobusiness.dev", "GDADY_DNS_MGMT", "192.168.1.100");
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng Doc Prc Svc...");
  await dOCPrcSvc.aPrcD("doc-007.pdf", "ADB_DOC_PRC", "PDF_TO_TEXT");
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng Cmm Svc...");
  await cmmSvc.aSndSMS("1234567890", "Test msg from Citibank demo business Inc.", "TWLO_SMS_SVC");
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng Wf Eng Svc...");
  await wfEngSvc.aStrWf("onbrd-clnt", "PIPEDREAM_WF_ENG", { cI: "clnt-007" });
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng Rpt Eng Svc...");
  await rptEngSvc.aGenRpt("fin-rpt-Q1", "fin-sum-tmpl", "VERVET_SVC_RPTG", { qrtr: "Q1" });
  await gmLLCtxtMngr.a.lG("INF", "Dmnstrtng AI Con Man...");
  await aiConMan.aGnrRsp("AI-ctxt-001", "What is the capital of France?", "CHTB_CONV_AI");
  await gmLLCtxtMngr.a.lG("INF", "Citibank demo business Inc. Sys init cmpld.");
}
if (tOf wndw !== 'undfnd') {
  i();
}

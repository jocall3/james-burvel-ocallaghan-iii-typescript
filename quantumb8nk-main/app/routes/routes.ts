const Rs = {
  j: (t, p, ...c) => ({ t, p, c }),
  c: (C, p) => ({ C, p }),
  uS: (i) => { let s = i; return [s, (n) => { s = n; }]; },
  uE: (f, d) => f(),
};

interface Rp {
  p?: string | string[];
  e?: boolean;
  s?: boolean;
}

type Cr = (...a: any[]) => any;

export const PmtOrdVw = (props: any) => Rs.j('d', { children: `PmtOrdVwC ${JSON.stringify(props)}` });
export const TxnHom = (props: any) => Rs.j('d', { children: `TxnHomC ${JSON.stringify(props)}` });
export const TxnVw = (props: any) => Rs.j('d', { children: `TxnVw C ${JSON.stringify(props)}` });
export const TxnLnItmVw = (props: any) => Rs.j('d', { children: `TxnLnItmVwC ${JSON.stringify(props)}` });
export const RtnVw = (props: any) => Rs.j('d', { children: `RtnVwC ${JSON.stringify(props)}` });
export const CntpMdlVw = (props: any) => Rs.j('d', { children: `CntpMdlVwC ${JSON.stringify(props)}` });
export const CntpFormC = (props: any) => Rs.j('d', { children: `CntpFormCC ${JSON.stringify(props)}` });
export const CntpBlkImp = (props: any) => Rs.j('d', { children: `CntpBlkImpC ${JSON.stringify(props)}` });
export const RlFmC = (props: any) => Rs.j('d', { children: `RlFmCC ${JSON.stringify(props)}` });
export const EdtRlVw = (props: any) => Rs.j('d', { children: `EdtRlVwC ${JSON.stringify(props)}` });
export const CrteCusIntAc = (props: any) => Rs.j('d', { children: `CrteCusIntAcC ${JSON.stringify(props)}` });
export const NwRlFm = (props: any) => Rs.j('d', { children: `NwRlFmC ${JSON.stringify(props)}` });
export const RlVw = (props: any) => Rs.j('d', { children: `RlVwC ${JSON.stringify(props)}` });
export const DbIntFm = (props: any) => Rs.j('d', { children: `DbIntFmC ${JSON.stringify(props)}` });
export const ExtAcVw = (props: any) => Rs.j('d', { children: `ExtAcVwC ${JSON.stringify(props)}` });
export const ExpDtlVw = (props: any) => Rs.j('d', { children: `ExpDtlVwC ${JSON.stringify(props)}` });
export const RtNumVw = (props: any) => Rs.j('d', { children: `RtNumVwC ${JSON.stringify(props)}` });
export const AdmFlTrnH = (props: any) => Rs.j('d', { children: `AdmFlTrnH C ${JSON.stringify(props)}` });
export const BilHom = (props: any) => Rs.j('d', { children: `BilHomC ${JSON.stringify(props)}` });
export const AdmFlTrnVw = (props: any) => Rs.j('d', { children: `AdmFlTrnVwC ${JSON.stringify(props)}` });
export const FlTrnVw = (props: any) => Rs.j('d', { children: `FlTrnVwC ${JSON.stringify(props)}` });
export const ApprH = (props: any) => Rs.j('d', { children: `ApprH C ${JSON.stringify(props)}` });
export const UsrHom = (props: any) => Rs.j('d', { children: `UsrHomC ${JSON.stringify(props)}` });
export const UsrInvVw = (props: any) => Rs.j('d', { children: `UsrInvVwC ${JSON.stringify(props)}` });
export const UsrFm = (props: any) => Rs.j('d', { children: `UsrFmC ${JSON.stringify(props)}` });
export const UsrVw = (props: any) => Rs.j('d', { children: `UsrVwC ${JSON.stringify(props)}` });
export const GrpsHom = (props: any) => Rs.j('d', { children: `GrpsHomC ${JSON.stringify(props)}` });
export const GrpFm = (props: any) => Rs.j('d', { children: `GrpFmC ${JSON.stringify(props)}` });
export const GrpVw = (props: any) => Rs.j('d', { children: `GrpVwC ${JSON.stringify(props)}` });
export const OrgVw = (props: any) => Rs.j('d', { children: `OrgVwC ${JSON.stringify(props)}` });
export const OrgFm = (props: any) => Rs.j('d', { children: `OrgFmC ${JSON.stringify(props)}` });
export const OrgDtlVw = (props: any) => Rs.j('d', { children: `OrgDtlVwC ${JSON.stringify(props)}` });
export const SprAdmHom = (props: any) => Rs.j('d', { children: `SprAdmHomC ${JSON.stringify(props)}` });
export const ExpPmtEdtVw = (props: any) => Rs.j('d', { children: `ExpPmtEdtVwC ${JSON.stringify(props)}` });
export const ExpPmtVw = (props: any) => Rs.j('d', { children: `ExpPmtVwC ${JSON.stringify(props)}` });
export const ExpPmtBlkImp = (props: any) => Rs.j('d', { children: `ExpPmtBlkImpC ${JSON.stringify(props)}` });
export const PapItmVw = (props: any) => Rs.j('d', { children: `PapItmVwC ${JSON.stringify(props)}` });
export const PmtOrdBlkImp = (props: any) => Rs.j('d', { children: `PmtOrdBlkImpC ${JSON.stringify(props)}` });
export const InvBlkImp = (props: any) => Rs.j('d', { children: `InvBlkImpC ${JSON.stringify(props)}` });
export const AccHom = (props: any) => Rs.j('d', { children: `AccHomC ${JSON.stringify(props)}` });
export const AccNetStAuthVw = (props: any) => Rs.j('d', { children: `AccNetStAuthVwC ${JSON.stringify(props)}` });
export const PrpChnVw = (props: any) => Rs.j('d', { children: `PrpChnVwC ${JSON.stringify(props)}` });
export const AccStp = (props: any) => Rs.j('d', { children: `AccStpC ${JSON.stringify(props)}` });
export const AccAcVw = (props: any) => Rs.j('d', { children: `AccAcVwC ${JSON.stringify(props)}` });
export const AccCtpVw = (props: any) => Rs.j('d', { children: `AccCtpVwC ${JSON.stringify(props)}` });
export const AccSynVw = (props: any) => Rs.j('d', { children: `AccSynVwC ${JSON.stringify(props)}` });
export const AccMngVw = (props: any) => Rs.j('d', { children: `AccMngVwC ${JSON.stringify(props)}` });
export const ExtEvtHom = (props: any) => Rs.j('d', { children: `ExtEvtHomC ${JSON.stringify(props)}` });
export const ExtEvtVw = (props: any) => Rs.j('d', { children: `ExtEvtVwC ${JSON.stringify(props)}` });
export const LdgHom = (props: any) => Rs.j('d', { children: `LdgHomC ${JSON.stringify(props)}` });
export const LdgVw = (props: any) => Rs.j('d', { children: `LdgVwC ${JSON.stringify(props)}` });
export const LdgFmC = (props: any) => Rs.j('d', { children: `LdgFmCC ${JSON.stringify(props)}` });
export const LdgTxnFmC = (props: any) => Rs.j('d', { children: `LdgTxnFmCC ${JSON.stringify(props)}` });
export const RevLdgTxnFmC = (props: any) => Rs.j('d', { children: `RevLdgTxnFmCC ${JSON.stringify(props)}` });
export const CreLdgAcSttlFm = (props: any) => Rs.j('d', { children: `CreLdgAcSttlFmC ${JSON.stringify(props)}` });
export const LdgblEvtVw = (props: any) => Rs.j('d', { children: `LdgblEvtVwC ${JSON.stringify(props)}` });
export const LdgAcFmC = (props: any) => Rs.j('d', { children: `LdgAcFmCC ${JSON.stringify(props)}` });
export const LdgAcCatFmC = (props: any) => Rs.j('d', { children: `LdgAcCatFmCC ${JSON.stringify(props)}` });
export const LdgTxnVw = (props: any) => Rs.j('d', { children: `LdgTxnVwC ${JSON.stringify(props)}` });
export const LdgAcSttlVw = (props: any) => Rs.j('d', { children: `LdgAcSttlVwC ${JSON.stringify(props)}` });
export const LdgTxnVrsnVw = (props: any) => Rs.j('d', { children: `LdgTxnVrsnVwC ${JSON.stringify(props)}` });
export const LdgAcVw = (props: any) => Rs.j('d', { children: `LdgAcVwC ${JSON.stringify(props)}` });
export const LdgAcCatVw = (props: any) => Rs.j('d', { children: `LdgAcCatVwC ${JSON.stringify(props)}` });
export const LdgEntVw = (props: any) => Rs.j('d', { children: `LdgEntVwC ${JSON.stringify(props)}` });
export const PrfHom = (props: any) => Rs.j('d', { children: `PrfHomC ${JSON.stringify(props)}` });
export const RptHom = (props: any) => Rs.j('d', { children: `RptHomC ${JSON.stringify(props)}` });
export const RptVw = (props: any) => Rs.j('d', { children: `RptVwC ${JSON.stringify(props)}` });
export const RevVw = (props: any) => Rs.j('d', { children: `RevVwC ${JSON.stringify(props)}` });
export const VndVw = (props: any) => Rs.j('d', { children: `VndVwC ${JSON.stringify(props)}` });
export const VirtAcHom = (props: any) => Rs.j('d', { children: `VirtAcHomC ${JSON.stringify(props)}` });
export const VirtAcVw = (props: any) => Rs.j('d', { children: `VirtAcVwC ${JSON.stringify(props)}` });
export const AudTrlHom = (props: any) => Rs.j('d', { children: `AudTrlHomC ${JSON.stringify(props)}` });
export const AudRcdVw = (props: any) => Rs.j('d', { children: `AudRcdVwC ${JSON.stringify(props)}` });
export const IncPmtDtlVw = (props: any) => Rs.j('d', { children: `IncPmtDtlVwC ${JSON.stringify(props)}` });
export const BlkImpHom = (props: any) => Rs.j('d', { children: `BlkImpHomC ${JSON.stringify(props)}` });
export const BlkImpVw = (props: any) => Rs.j('d', { children: `BlkImpVwC ${JSON.stringify(props)}` });
export const PmtOrdFmC = (props: any) => Rs.j('d', { children: `PmtOrdFmCC ${JSON.stringify(props)}` });
export const CsVw = (props: any) => Rs.j('d', { children: `CsVwC ${JSON.stringify(props)}` });
export const FlwHom = (props: any) => Rs.j('d', { children: `FlwHomC ${JSON.stringify(props)}` });
export const FlwVw = (props: any) => Rs.j('d', { children: `FlwVwC ${JSON.stringify(props)}` });
export const NwFlwVw = (props: any) => Rs.j('d', { children: `NwFlwVwC ${JSON.stringify(props)}` });
export const EdtFlwVw = (props: any) => Rs.j('d', { children: `EdtFlwVwC ${JSON.stringify(props)}` });
export const EndPntVw = (props: any) => Rs.j('d', { children: `EndPntVwC ${JSON.stringify(props)}` });
export const DecVw = (props: any) => Rs.j('d', { children: `DecVwC ${JSON.stringify(props)}` });
export const PtnrFm = (props: any) => Rs.j('d', { children: `PtnrFmC ${JSON.stringify(props)}` });
export const NwSbxAcFmC = (props: any) => Rs.j('d', { children: `NwSbxAcFmCC ${JSON.stringify(props)}` });
export const BilVw = (props: any) => Rs.j('d', { children: `BilVwC ${JSON.stringify(props)}` });
export const PldSttVw = (props: any) => Rs.j('d', { children: `PldSttVwC ${JSON.stringify(props)}` });
export const PshToWrHsHom = (props: any) => Rs.j('d', { children: `PshToWrHsHomC ${JSON.stringify(props)}` });
export const DstnVw = (props: any) => Rs.j('d', { children: `DstnVwC ${JSON.stringify(props)}` });
export const TrnsfVw = (props: any) => Rs.j('d', { children: `TrnsfVwC ${JSON.stringify(props)}` });
export const PtnrSrchDtlVw = (props: any) => Rs.j('d', { children: `PtnrSrchDtlVwC ${JSON.stringify(props)}` });
export const PmGtSt = (props: any) => Rs.j('d', { children: `PmGtStC ${JSON.stringify(props)}` });
export const CmpGtSt = (props: any) => Rs.j('d', { children: `CmpGtStC ${JSON.stringify(props)}` });
export const VaGtSt = (props: any) => Rs.j('d', { children: `VaGtStC ${JSON.stringify(props)}` });
export const LdGtSt = (props: any) => Rs.j('d', { children: `LdGtStC ${JSON.stringify(props)}` });
export const PmtOv = (props: any) => Rs.j('d', { children: `PmtOvC ${JSON.stringify(props)}` });
export const UsrMngOv = (props: any) => Rs.j('d', { children: `UsrMngOvC ${JSON.stringify(props)}` });
export const RlVw2 = (props: any) => Rs.j('d', { children: `RlVw2 C ${JSON.stringify(props)}` });
export const PrmSnStVw = (props: any) => Rs.j('d', { children: `PrmSnStVwC ${JSON.stringify(props)}` });
export const CntpOv = (props: any) => Rs.j('d', { children: `CntpOvC ${JSON.stringify(props)}` });
export const NotGrpHom = (props: any) => Rs.j('d', { children: `NotGrpHomC ${JSON.stringify(props)}` });
export const Dvpr = (props: any) => Rs.j('d', { children: `DvprC ${JSON.stringify(props)}` });
export const PtnrMtchDtlVw = (props: any) => Rs.j('d', { children: `PtnrMtchDtlVwC ${JSON.stringify(props)}` });
export const MTUsrOnbDem = (props: any) => Rs.j('d', { children: `MTUsrOnbDemC ${JSON.stringify(props)}` });
export const PmSchdCll = (props: any) => Rs.j('d', { children: `PmSchdCllC ${JSON.stringify(props)}` });
export const VaSchdCll = (props: any) => Rs.j('d', { children: `VaSchdCllC ${JSON.stringify(props)}` });
export const CmpSchdCll = (props: any) => Rs.j('d', { children: `CmpSchdCllC ${JSON.stringify(props)}` });
export const LdSchdCll = (props: any) => Rs.j('d', { children: `LdSchdCllC ${JSON.stringify(props)}` });
export const PtnrTbVw = (props: any) => Rs.j('d', { children: `PtnrTbVwC ${JSON.stringify(props)}` });
export const RqLgHom = (props: any) => Rs.j('d', { children: `RqLgHomC ${JSON.stringify(props)}` });
export const RqLgVw = (props: any) => Rs.j('d', { children: `RqLgVwC ${JSON.stringify(props)}` });
export const EvtHom = (props: any) => Rs.j('d', { children: `EvtHomC ${JSON.stringify(props)}` });
export const EvtVw = (props: any) => Rs.j('d', { children: `EvtVwC ${JSON.stringify(props)}` });
export const WbhkEndPntHom = (props: any) => Rs.j('d', { children: `WbhkEndPntHomC ${JSON.stringify(props)}` });
export const WbhkEndPntFmC = (props: any) => Rs.j('d', { children: `WbhkEndPntFmCC ${JSON.stringify(props)}` });
export const WbhkEndPntVw = (props: any) => Rs.j('d', { children: `WbhkEndPntVwC ${JSON.stringify(props)}` });
export const ApiKyHom = (props: any) => Rs.j('d', { children: `ApiKyHomC ${JSON.stringify(props)}` });
export const ApiKyFmC = (props: any) => Rs.j('d', { children: `ApiKyFmCC ${JSON.stringify(props)}` });
export const ApiKyVw = (props: any) => Rs.j('d', { children: `ApiKyVwC ${JSON.stringify(props)}` });
export const PublKyVw = (props: any) => Rs.j('d', { children: `PublKyVwC ${JSON.stringify(props)}` });
export const PublKyHom = (props: any) => Rs.j('d', { children: `PublKyHomC ${JSON.stringify(props)}` });
export const PublKyEd = (props: any) => Rs.j('d', { children: `PublKyEdC ${JSON.stringify(props)}` });
export const PublKyCre = (props: any) => Rs.j('d', { children: `PublKyCreC ${JSON.stringify(props)}` });
export const CmpSttHom = (props: any) => Rs.j('d', { children: `CmpSttHomC ${JSON.stringify(props)}` });
export const PmtSttHom = (props: any) => Rs.j('d', { children: `PmtSttHomC ${JSON.stringify(props)}` });
export const GLConIdxPg = (props: any) => Rs.j('d', { children: `GLConIdxPgC ${JSON.stringify(props)}` });
export const GLConShwPg = (props: any) => Rs.j('d', { children: `GLConShwPgC ${JSON.stringify(props)}` });
export const CmpKybRlsTbl = (props: any) => Rs.j('d', { children: `CmpKybRlsTblC ${JSON.stringify(props)}` });
export const CmpKybRlVw = (props: any) => Rs.j('d', { children: `CmpKybRlVwC ${JSON.stringify(props)}` });
export const CreCmpKybRl = (props: any) => Rs.j('d', { children: `CreCmpKybRlC ${JSON.stringify(props)}` });
export const EdtCmpKybRl = (props: any) => Rs.j('d', { children: `EdtCmpKybRlC ${JSON.stringify(props)}` });
export const SwpRlsC = (props: any) => Rs.j('d', { children: `SwpRlsCC ${JSON.stringify(props)}` });
export const SwpRlVw = (props: any) => Rs.j('d', { children: `SwpRlVwC ${JSON.stringify(props)}` });
export const NwSwpRlVw = (props: any) => Rs.j('d', { children: `NwSwpRlVwC ${JSON.stringify(props)}` });
export const EdtSwpRlVw = (props: any) => Rs.j('d', { children: `EdtSwpRlVwC ${JSON.stringify(props)}` });
export const EmbFlDmoC = (props: any) => Rs.j('d', { children: `EmbFlDmoCC ${JSON.stringify(props)}` });
export const AcGrpsC = (props: any) => Rs.j('d', { children: `AcGrpsCC ${JSON.stringify(props)}` });
export const AcGrpVw = (props: any) => Rs.j('d', { children: `AcGrpVwC ${JSON.stringify(props)}` });
export const AcVws = (props: any) => Rs.j('d', { children: `AcVwsC ${JSON.stringify(props)}` });
export const AcVw = (props: any) => Rs.j('d', { children: `AcVwC ${JSON.stringify(props)}` });
export const EdtAcGrpVw = (props: any) => Rs.j('d', { children: `EdtAcGrpVwC ${JSON.stringify(props)}` });
export const InvHom = (props: any) => Rs.j('d', { children: `InvHomC ${JSON.stringify(props)}` });
export const InvVw = (props: any) => Rs.j('d', { children: `InvVwC ${JSON.stringify(props)}` });
export const CreInv = (props: any) => Rs.j('d', { children: `CreInvC ${JSON.stringify(props)}` });
export const EdtInv = (props: any) => Rs.j('d', { children: `EdtInvC ${JSON.stringify(props)}` });
export const RecVw = (props: any) => Rs.j('d', { children: `RecVwC ${JSON.stringify(props)}` });
export const PrcLnRecVw = (props: any) => Rs.j('d', { children: `PrcLnRecVwC ${JSON.stringify(props)}` });
export const MlAcRecHom = (props: any) => Rs.j('d', { children: `MlAcRecHomC ${JSON.stringify(props)}` });
export const AcHom = (props: any) => Rs.j('d', { children: `AcHomC ${JSON.stringify(props)}` });
export const ConVw = (props: any) => Rs.j('d', { children: `ConVwC ${JSON.stringify(props)}` });
export const FlImpHom = (props: any) => Rs.j('d', { children: `FlImpHomC ${JSON.stringify(props)}` });
export const PtnrAdmC = (props: any) => Rs.j('d', { children: `PtnrAdmCC ${JSON.stringify(props)}` });
export const CshPlnH = (props: any) => Rs.j('d', { children: `CshPlnH C ${JSON.stringify(props)}` });
export const ExpPmtFmC = (props: any) => Rs.j('d', { children: `ExpPmtFmCC ${JSON.stringify(props)}` });
export const RecRlsHom = (props: any) => Rs.j('d', { children: `RecRlsHomC ${JSON.stringify(props)}` });
export const RecRlsEdt = (props: any) => Rs.j('d', { children: `RecRlsEdtC ${JSON.stringify(props)}` });
export const RecRlsPrvw = (props: any) => Rs.j('d', { children: `RecRlsPrvwC ${JSON.stringify(props)}` });
export const RecRlVw = (props: any) => Rs.j('d', { children: `RecRlVwC ${JSON.stringify(props)}` });
export const RecRlFm = (props: any) => Rs.j('d', { children: `RecRlFmC ${JSON.stringify(props)}` });
export const OpsC = (props: any) => Rs.j('d', { children: `OpsCC ${JSON.stringify(props)}` });
export const ExpPmtHom = (props: any) => Rs.j('d', { children: `ExpPmtHomC ${JSON.stringify(props)}` });
export const CmpOv = (props: any) => Rs.j('d', { children: `CmpOvC ${JSON.stringify(props)}` });
export const BlkRqVw = (props: any) => Rs.j('d', { children: `BlkRqVwC ${JSON.stringify(props)}` });
export const BlkRsltVw = (props: any) => Rs.j('d', { children: `BlkRsltVwC ${JSON.stringify(props)}` });
export const BlkRqHom = (props: any) => Rs.j('d', { children: `BlkRqHomC ${JSON.stringify(props)}` });
export const BlkErrVw = (props: any) => Rs.j('d', { children: `BlkErrVwC ${JSON.stringify(props)}` });
export const TxnCtgznRlFm = (props: any) => Rs.j('d', { children: `TxnCtgznRlFmC ${JSON.stringify(props)}` });
export const TxnCtgznRlsHom = (props: any) => Rs.j('d', { children: `TxnCtgznRlsHomC ${JSON.stringify(props)}` });
export const TxnCtgznRlVw = (props: any) => Rs.j('d', { children: `TxnCtgznRlVwC ${JSON.stringify(props)}` });
export const CtgznMtdtVldHom = (props: any) => Rs.j('d', { children: `CtgznMtdtVldHomC ${JSON.stringify(props)}` });
export const CtgznMtdtVldVw = (props: any) => Rs.j('d', { children: `CtgznMtdtVldVwC ${JSON.stringify(props)}` });
export const CtgznMtdtVldFm = (props: any) => Rs.j('d', { children: `CtgznMtdtVldFmC ${JSON.stringify(props)}` });
export const CreQtFm = (props: any) => Rs.j('d', { children: `CreQtFmC ${JSON.stringify(props)}` });
export const QtVw = (props: any) => Rs.j('d', { children: `QtVwC ${JSON.stringify(props)}` });
export const QtsHom = (props: any) => Rs.j('d', { children: `QtsHomC ${JSON.stringify(props)}` });
export const TblPlyGnd = (props: any) => Rs.j('d', { children: `TblPlyGndC ${JSON.stringify(props)}` });
export const PplInvHom = (props: any) => Rs.j('d', { children: `PplInvHomC ${JSON.stringify(props)}` });
export const PplInvVw = (props: any) => Rs.j('d', { children: `PplInvVwC ${JSON.stringify(props)}` });
export const StpInvHom = (props: any) => Rs.j('d', { children: `StpInvHomC ${JSON.stringify(props)}` });
export const StpInvVw = (props: any) => Rs.j('d', { children: `StpInvVwC ${JSON.stringify(props)}` });
export const DtIng = (props: any) => Rs.j('d', { children: `DtIngC ${JSON.stringify(props)}` });
export const DtIngBlkImpHom = (props: any) => Rs.j('d', { children: `DtIngBlkImpHomC ${JSON.stringify(props)}` });
export const DtIngBlkImpVw = (props: any) => Rs.j('d', { children: `DtIngBlkImpVwC ${JSON.stringify(props)}` });
export const DtIngBlkRsltVw = (props: any) => Rs.j('d', { children: `DtIngBlkRsltVwC ${JSON.stringify(props)}` });
export const UsrMngCnf = (props: any) => Rs.j('d', { children: `UsrMngCnfC ${JSON.stringify(props)}` });
export const GrpFmC = (props: any) => Rs.j('d', { children: `GrpFmCC ${JSON.stringify(props)}` });
export const RlFmC2 = (props: any) => Rs.j('d', { children: `RlFmC2 C ${JSON.stringify(props)}` });
export const GrpVwV2 = (props: any) => Rs.j('d', { children: `GrpVwV2 C ${JSON.stringify(props)}` });
export const PrmSnStFmC = (props: any) => Rs.j('d', { children: `PrmSnStFmCC ${JSON.stringify(props)}` });
export const UsrVwV2 = (props: any) => Rs.j('d', { children: `UsrVwV2 C ${JSON.stringify(props)}` });
export const HmpDsh = (props: any) => Rs.j('d', { children: `HmpDshC ${JSON.stringify(props)}` });

interface ItgCfg {
    i: string;
    n: string;
    u: string;
    s: boolean;
    v: string;
    t: string[];
}

interface CrItgCfg {
    n: string;
    d: string;
    e: string;
    aK: string;
    sV: string;
    iI: boolean;
}

class ItgMg {
    private s: Map<string, ItgCfg>;
    constructor() { this.s = new Map(); }
    a(c: ItgCfg) { this.s.set(c.i, c); }
    g(i: string) { return this.s.get(i); }
    l() { return Array.from(this.s.values()); }
    c(d: CrItgCfg): string {
        const i = `itg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.s.set(i, { i, n: d.n, u: d.e, s: d.iI, v: d.sV, t: [] });
        return i;
    }
}
export const GItgMg = new ItgMg();

const Burl = 'https://citibankdemobusiness.dev';
const Cname = 'Citibank demo business Inc';

class ApiSvc {
    g(u: string): Promise<any> { return Promise.resolve({ data: `Got: ${u} from ${Burl}` }); }
    p(u: string, d: any): Promise<any> { return Promise.resolve({ data: `Pst: ${u}, ${JSON.stringify(d)} to ${Burl}` }); }
}
export const GA = new ApiSvc();

class AthSvc {
    lg(u: string, p: string): Promise<any> { return Promise.resolve({ t: 'tk123', u: u, c: Cname }); }
    lt(): Promise<any> { return Promise.resolve(true); }
}
export const GAt = new AthSvc();

class DtSt {
    s(k: string, v: any) { typeof localStorage !== 'undefined' && localStorage.setItem(k, JSON.stringify(v)); }
    g(k: string) { if (typeof localStorage === 'undefined') return null; const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }
}
export const GD = new DtSt();

class LgSvc {
    i(m: string) { console.info(`INFO: ${m}`); }
    e(m: string) { console.error(`ERR: ${m}`); }
    w(m: string) { console.warn(`WARN: ${m}`); }
}
export const GL = new LgSvc();

class NtSvc {
    s(m: string) { typeof alert !== 'undefined' && alert(`Nt: ${m}`); }
}
export const GN = new NtSvc();

interface WfTsk { i: string; n: string; s: string; }
class WfEgn {
    p(wfi: string, d: any): Promise<WfTsk> { return Promise.resolve({ i: `tsk_${Date.now()}`, n: `Tsk for ${wfi}`, s: 'strtd' }); }
    gT(tI: string): Promise<WfTsk> { return Promise.resolve({ i: tI, n: `Tsk ${tI}`, s: 'cmplt' }); }
}
export const GWE = new WfEgn();

type EvtHnd = (d: any) => void;
class EvtBs {
    private hs: Map<string, EvtHnd[]>;
    constructor() { this.hs = new Map(); }
    on(eN: string, h: EvtHnd) { if (!this.hs.has(eN)) this.hs.set(eN, []); this.hs.get(eN).push(h); }
    e(eN: string, d: any) { (this.hs.get(eN) || []).forEach(h => h(d)); }
}
export const GEB = new EvtBs();

class FF_Svc {
    private f: Map<string, boolean>;
    constructor(iF: { [k: string]: boolean }) { this.f = new Map(Object.entries(iF)); }
    iA(k: string) { return this.f.get(k) || false; }
}

const crtRt = (tt: string, p: string | string[], Ct: Cr, e?: boolean, gC?: boolean, gP?: number, gFF?: string, gAL?: string, gDP?: string, gAC?: Cr, gSR?: string, gAT?: string, gUE?: boolean, gOS?: number, gSCR?: boolean, gV?: string, gLS?: string): GmnRtCfg => ({
    tt, p, Ct, e, gC, gP, gFF, gAL, gDP, gAC, gSR, gAT, gUE, gOS, gSCR, gV, gLS
});

const gnL = () => {
    const p = [];
    const cNms = [
        'Gemini', 'ChtGpt', 'PpDr', 'GtHb', 'HgFc', 'Pld', 'MdnTrs', 'GgDr', 'OnDr', 'Azr',
        'GgCl', 'SpBs', 'Vrvt', 'SlFc', 'Orcl', 'Mrqt', 'Ctk', 'Shpfy', 'WoCmr', 'GDDy',
        'CPnl', 'Adb', 'Twill', 'ZipPy', 'QckBks', 'Strp', 'PyPl', 'Brntr', 'Adyn', 'Rzrpy',
        'Pyoneer', 'Skrill', 'Wldp', 'Xoom', 'Wise', 'Rvolut', 'N26', 'Frnk', 'Sprkl', 'SqUp',
        'LghtSpd', 'Klobr', 'AccntgCld', 'DocuSgn', 'Smartsht', 'Asana', 'Jira', 'Trllo', 'SrvcNw',
        'Zndsk', 'Slsk', 'Twilio', 'SmsGt', 'Nxlmo', 'MssgBrds', 'FrBse', 'AmlznWs', 'DtDgs',
        'Spk', 'Zpr', 'IfTTT', 'MndyC', 'Tbl', 'PwrBI', 'SfCmp', 'NetSf', 'Intct', 'Xero',
        'MYOB', 'Quicken', 'TaxAct', 'HRBlck', 'SlryCl', 'Trnk', 'WorkDy', 'Gstry', 'Adp',
        'Zenefits', 'Rippling', 'Gusto', 'Paylocity', 'Insghtly', 'Hbspt', 'ZohoCRM', 'SlsFrc',
        'DnmcD365', 'Sge', 'Infor', 'Sap', 'OracleERP', 'Wdprss', 'Drpl', 'Jmla', 'Magnt',
        'BigCmmrc', 'Etsy', 'Amazon', 'eBay', 'Walmart', 'Target', 'AliEx', 'AliBaba', 'Taobao',
        'Joom', 'FnclOnc', 'FrwdCmp', 'Rlyt', 'Crdfrm', 'Idfy', 'Vrf', 'GgID', 'Auth0', 'Okta',
        'OneLgn', 'LghtCnt', 'DuoScrt', 'Hky', 'Kpr', 'Lstps', 'Pswd', 'LstP', '1Pswd',
        'BitWrdn', 'RobFrm', 'Mnky', 'SrvMny', 'Typefrm', 'GgFrm', 'Jnktn', 'DrpBx', 'BoxCm',
        'Dlta', 'Slck', 'Dscrd', 'TmZ', 'GoTmMtng', 'Zoom', 'MsTm', 'GgMt', 'WebEx', 'Skpe',
        'Pstmn', 'StkOvflw', 'Rspons', 'Snsr', 'Mntr', 'Alerte', 'Logz', 'Splnk', 'Eltk',
        'DynTrc', 'AppDyn', 'NwxRlc', 'Zbbx', 'Ngs', 'Promts', 'Grfna', 'Qlik', 'TblD', 'PwrBID',
        'MicroStgy', 'BussObj', 'Congos', 'Dbvw', 'SSMS', 'PgAdm', 'MysqWB', 'Dbeavr', 'Sqldr',
        'AzureDtSt', 'GgDtSt', 'AwsDtSt', 'Hdp', 'Spark', 'Kafka', 'Flume', 'Hbase', 'Cassndra',
        'MngoDb', 'Rds', 'Postgs', 'MySql', 'SqLt', 'SqlSrvr', 'OrclDb', 'Clckhs', 'Redis',
        'Mmcshd', 'Echd', 'Kubntes', 'Dckr', 'OpnShft', 'Mshrs', 'Tnt', 'CnCld', 'Vgrnt',
        'Prxmx', 'Vmwr', 'HprV', 'Ctrix', 'RdHt', 'Cnts', 'Ubntu', 'Dbn', 'Fdr', 'Rhel',
        'Suse', 'ArchLn', 'Mint', 'KliLn', 'Anrch', 'Prtt', 'Bsd', 'FrBsd', 'OpnBsd', 'NtBsd',
        'Mcsft', 'Apl', 'Lnux', 'Ggl', 'Amzn', 'Ntflx', 'Fb', 'X', 'Tktk', 'Rddit',
        'Pntrst', 'Snch', 'Linkdn', 'Ytb', 'Vmo', 'DmntV', 'SdCl', 'Sndcl', 'Sptfy', 'AplMs',
        'YtbMs', 'GglPy', 'AplPy', 'SmSngPy', 'FPy', 'AlPy', 'WchtPy', 'Vnmo', 'Zll', 'CshAp',
        'CyrptC', 'Bnnce', 'Cnbse', 'Krkn', 'FtX', 'Btfnx', 'Btstmp', 'Grphcl', 'TrdrJo',
        'RbnHd', 'FrdmFnc', 'Etoro', 'Plus500', 'XTB', 'Avatrade', 'IGMts', 'CMCmkts',
        'SaxBnk', 'Nordnt', 'DnxBnk', 'Dtsk', 'JPM', 'BnkOfAm', 'WllsFrg', 'GSachs', 'MgnStnly',
        'CrdtSss', 'Ubs', 'Hbc', 'Bcl', 'ScotiBnk', 'RylBnkCn', 'TdCn', 'Cibc', 'Bmo',
        'NtnlBnkCn', 'DBS', 'OCBC', 'UOB', 'HngSngBnk', 'ChnaBnk', 'Icbc', 'Abc', 'Bcm',
        'Ctc', 'Pnc', 'UsBnk',
import React, {
  useCallback as uCb,
  useMemo as uM,
  useState as uS,
  useEffect as uE,
  useContext as uC,
  createContext as cC,
  ReactNode as RN,
  memo as mm,
  ComponentType as CT,
  Suspense as Spns,
  lazy as lzy,
} from "react";
import { Drawer as Drwr, Pill as Pl, Tooltip as TT, Spinner as Spn, Alert as Alrt, Button as Btn } from "~/common/ui-components";

import { getDrawerContent as gDCt } from "~/common/utilities/getDrawerContent";

const BURL = "citibankdemobusiness.dev";
const CINC = "Citibank demo business Inc";

const stC = (s: string): string => {
  if (!s) return "";
  return s
    .replace(/([A-Z])/g, " $1")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim();
};

const isA = (v: unknown): v is unknown[] => Array.isArray(v);

const mrgW = <T extends Record<string, any>>(o: T, s: Partial<T>, c?: (oV: any, sV: any, k: string, o: T, s: T) => any): T => {
  const r: T = { ...o };
  for (const k in s) {
    if (Object.prototype.hasOwnProperty.call(s, k)) {
      const sV = s[k];
      const oV = r[k];
      const cR = c ? c(oV, sV, k, r, s as T) : undefined;
      if (cR !== undefined) {
        r[k] = cR;
      } else if (typeof sV === 'object' && sV !== null && typeof oV === 'object' && oV !== null && !isA(sV) && !isA(oV)) {
        r[k] = mrgW(oV, sV, c);
      } else {
        r[k] = sV;
      }
    }
  }
  return r;
};


const dbnc = <F extends (...args: any[]) => any>(f: F, d: number): F => {
  let t: ReturnType<typeof setTimeout> | undefined;
  return ((...a: Parameters<F>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => f(...a), d);
  }) as F;
};

const ALL_FIRMS: string[] = [
  "GeminiAI", "ChatHot", "PipedreamP", "GitHubG", "HuggingFacesH", "PlaidP", "ModernTreasuryM", "GoogleDriveG", "OneDriveO", "AzureA", "GoogleCloudG", "SupabaseS", "VervetV", "SalesForceS", "OracleO", "MARQETAM", "CitibankC", "ShopifyS", "WooCommerceW", "GoDaddyG", "CpanelC", "AdobeA", "TwilioT", "StripeS", "ZoomZ", "SlackS", "MailchimpM", "HubSpotH", "SalesforceS", "ZendeskZ", "FreshdeskF", "AtlassianA", "JiraJ", "ConfluenceC", "DropboxD", "BoxB", "DocuSignD", "OktaO", "Auth0A", "TwilioT", "SendGridS", "AWS", "DigitalOceanD", "HerokuH", "NetlifyN", "VercelV", "CloudflareC", "FastlyF", "AkamaiA", "DatadogD", "NewRelicN", "SplunkS", "ElasticE", "MongoDBM", "PostgreSQLP", "MySQLM", "RedisR", "KafkaK", "RabbitMQR", "KubernetesK", "DockerD", "TerraformT", "AnsibleA", "ChefC", "PuppetP", "JenkinsJ", "GitLabG", "CircleCICI", "TravisCIT", "GitHubActionsG", "BitbucketB", "SonarCloudS", "SentryS", "RollbarR", "LogRocketL", "AmplitudeA", "MixpanelM", "SegmentS", "GoogleAnalyticsG", "FivetranF", "SnowflakeS", "BigQueryB", "RedshiftR", "DatabricksD", "TableauT", "PowerBIP", "LookerL", "AlteryxA", "CodaC", "NotionN", "AirtableA", "ZapierZ", "IFTTI", "WorkatoW", "MulesoftM", "BoomiB", "PostmanP", "SwaggerS", "GraphQLG", "REST", "SOAP", "GRPCG", "ApacheKafkaA", "ApacheSparkA", "HadoopH", "TensorFlowT", "PyTorchP", "ScikitLearnS", "KerasK", "OpenAIO", "DeepMindD", "NVIDIA", "IntelI", "QualcommQ", "AMD", "MicrosoftM", "AppleA", "GoogleG", "AmazonA", "MetaM", "TeslaT", "NetflixN", "SpotifyS", "UberU", "AirbnbA", "LinkedInL", "PinterestP", "SnapchatS", "TikTokT", "XingX", "WeChatW", "AlibabaA", "TencentT", "BaiduB", "RakutenR", "SamsungS", "LG", "SonyS", "PanasonicP", "ToshibaT", "HitachiH", "CanonC", "NikonN", "OlympusO", "SiemensS", "BoschB", "PhilipsP", "GE", "HoneywellH", "3M", "DuPontD", "BASF", "BayerB", "PfizerP", "JohnsonJohnsonJ", "NovartisN", "RocheR", "MerckM", "GileadG", "AbbVieA", "AmgenA", "BristolMyersSquibbB", "SanofiS", "AstraZenecaA", "GSK", "ModernaM", "BioNTechB", "JPMorganChaseJ", "BankofAmericaB", "WellsFargoW", "HSBC", "CitigroupC", "GoldmanSachsG", "MorganStanleyM", "UBS", "CreditSuisseC", "DeutscheBankD", "BarclaysB", "RBS", "LloydsL", "SantanderS", "BNPP", "SocieteGeneraleS", "CommerzbankC", "MitsubishiUFJM", "MizuhoM", "SumitomoMitsuiS", "IndustrialandCommercialBankofChinaI", "ChinaConstructionBankC", "AgriculturalBankofChinaA", "BankofChinaB", "HSBC", "StandardCharteredS", "ANZ", "WestpacW", "NAB", "CommonwealthBankC", "RoyalBankofCanadaR", "TD BankT", "ScotiabankS", "BMO", "CIBC", "BBVAS", "SantanderS", "ING", "KBC", "IntesaSanpaoloI", "UniCreditU", "NordeaN", "DanskeBankD", "SwedbankS", "SEB", "HandelsbankenH", "DNB", "OPFinancialOP", "RaiffeisenR", "ErsteGroupE", "CommerzbankC", "DZBankD", "KfWKfW", "LBBW", "BayernLBB", "HelabaH", "NRWBankN", "FMSWMF", "AarealBankA", "CoreLogicC", "FidelityF", "VanguardV", "BlackRockB", "StateStreetS", "NorthernTrustN", "BNY MellonB", "FranklinTempletonF", "T Rowe PriceT", "SchrodersS", "AmundiA", "LegalGeneralL", "AvivaA", "AllianzA", "AXAA", "ZurichZ", "PrudentialP", "MetLifeM", "AegonA", "GeneraliG", "MunichReM", "SwissReS", "SCOR", "HannoverReH", "Lloyd's of LondonL", "MarshM", "AonA", "WillisTowersWatsonW", "GallagherG", "ChubbC", "TravelersT", "ProgressiveP", "AllstateA", "LibertyMutualL", "USAA", "GeicoG", "NationwideN", "AmericanFamilyA", "FarmersF", "StateFarmS", "ErieInsuranceE", "TheHartfordH", "CNA", "ZurichNorthAmericaZ", "QBE", "TokioMarineT", "MSIG", "SompoJapanS", "AioiNissayDowaA", "ZenkyorenZ", "DAIICHI", "NipponLifeN", "MeijiYasudaM", "SumitomoLifeS", "FukokuLifeF", "TaiyoLifeT", "AsahiLifeA", "JapanPostInsuranceJ", "RelianceR", "LIC", "HDFC LifeH", "ICICI PrudentialI", "SBI LifeS", "MaxLifeM", "BajajAllianzB", "PNB MetLifeP", "Canara HSBC Oriental Bank of Commerce Life InsuranceC", "IndiaFirstI", "StarUnionDai-ichiS", "Edelweiss TokioE", "ExideLifeE", "ShriramLifeS", "BhartiAXAB", "FutureGeneraliF", "PramericaP", "SaharaLifeS", "AckoA", "DigitD", "GoDigitG", "PolicybazaarP", "ClearTaxC", "ZerodhaZ", "GrowwG", "UpstoxU", "PaytmMoneyP", "PhonePeP", "GooglePayG", "ApplePayA", "SamsungPayS", "VisaV", "MastercardM", "AmericanExpressA", "DiscoverD", "JCBJ", "UnionPayU", "PayPalP", "StripeS", "SquareS", "AdyenA", "WorldpayW", "FiservF", "GlobalPaymentsG", "ChasePaymentechC", "ElavonE", "NuveiN", "IngenicoI", "VerifoneV", "NCRN", "DieboldNixdorfD", "WincorNixdorfW", "GenpactG", "AccentureA", "CapgeminiC", "TCS", "InfosysI", "WiproW", "HCLTechH", "TechMahindraT", "CognizantC", "DXCD", "IBM", "FujitsuF", "NTTD", "CapitaC", "AtosA", "CGI", "SopraSteriaS", "T-SystemsT", "OrangeBusinessServicesO", "VodafoneV", "TelefonicaT", "VerizonV", "AT&TA", "TMobileT", "ChinaMobileC", "ChinaTelecomC", "ChinaUnicomC", "BT", "DeutscheTelekomD", "OrangeO", "TelecomItaliaT", "TelstraT", "SingtelS", "NTTDocomoN", "KDDIK", "SoftbankS", "SKTelecomS", "KT", "LGU+", "BellCanadaB", "RogersR", "TelusT", "AmericaMovilA", "TelefonicaBrasilT", "TIMBrazilT", "ClaroC", "MillicomM", "EntelE", "TelecomArgentinaT", "VinaCapitalV", "FPTF", "VNPT", "ViettelV", "IndosatOoredooI", "TelekomselT", "XL AxiataX", "MaxisM", "CelcomC", "DigiD", "GlobeTelecomG", "PLDTP", "AIS", "True CorporationT", "DTAC", "SingtelS", "StarHubS", "M1M", "FarEastoneF", "ChunghwaTelecomC", "TaiwanMobileT", "KT", "LGU+", "SKTelecomS", "OptusO", "VodafoneHutchisonAustraliaV", "TelekomMalaysiaT", "PTCL", "JazzJ", "ZongZ", "TelenorT", "GrameenphoneG", "RobiR", "BanglalinkB", "SafaricomS", "MTN", "VodacomV", "AirtelA", "OrangeMaliO", "EtisalatE", "STC", "MobilyM", "ZainZ", "OoredooO", "Du", "EmiratesTelecomE", "TeletalkT", "RobiR", "AirtelBangladeshA", "BanglalinkB", "VodafoneIdeaV", "JioJ", "BhartiAirtelB", "BSNLB", "MTN", "VodacomV", "CellC", "TelkomSA", "MovistarM", "ClaroC", "PersonalP", "TigoT", "EntelE", "VivaV", "DigicelD", "FlowF", "CableandWirelessC", "LibertyGlobalL", "ComcastC", "CharterCommunicationsC", "CoxCommunicationsC", "AlticeUSAA", "FrontierCommunicationsF", "WindstreamW", "CenturylinkC", "VerizonFiosV", "AT&TU-verseA", "DishNetworkD", "DirecTVD", "SlingTVS", "YouTubeTVY", "HuluLiveH", "FuboTVF", "PhiloP", "DAZND", "ESPN+", "NBCUniversalN", "DisneyD", "WarnerBrosDiscoveryW", "ParamountP", "SonyPicturesS", "UniversalPicturesU", "20thCenturyStudiosT", "LionsgateL", "MGM", "A24", "NeonN", "SearchlightPicturesS", "FocusFeaturesF", "MiramaxM", "StudioCanalS", "PathéP", "GaumontG", "WildBunchW", "EuropaCorpE", "ConstantinFilmC", "UFA", "TobisT", "ZDF", "ARD", "BBC", "ITV", "Channel4C", "SkyS", "ProSiebenSat.1P", "RTLGroupR", "TF1", "M6", "MediasetM", "RAI", "TVESA", "MediaproM", "GloboG", "TelevisaT", "TVAztecaT", "CaracolTelevisiónC", "RCNTelevisiónR", "GrupoClarínG", "PrensaIbéricaP", "VocentoV", "AxelSpringerA", "BauerMediaB", "BertelsmannB", "GrunerJahrG", "HubertBurdaMediaH", "LagardèreL", "VivendiV", "MediawanM", "Canal+C", "beINSPORTSB", "DAZND", "ElevenSportsE", "IMG", "WME", "CAA", "UTA", "EndeavorE", "LiveNationL", "AEG", "MadisonSquareGardenEntertainmentM", "MGMResortsM", "LasVegasSandsL", "WynnResortsW", "CaesarsEntertainmentC", "GentingG", "GalaxyEntertainmentG", "SJMHoldingsS", "MelcoResortsM", "SandsChinaS", "MGMChinaM", "WynnMacauW", "StudioCityS", "CityofDreamsC", "VenetianV", "LondonerL", "ParisianP", "WynnPalaceW", "MGMGrandM", "BellagioB", "AriaA", "CosmopolitanC", "VenetianLasVegasV", "PalazzoP", "MandalayBayM", "LuxorL", "ExcaliburE", "CircusCircusC", "StratosphereS", "FremontStreetExperienceF", "GoldenNuggetG", "DowntownGrandD", "PlazaHotelP", "ElCortezE", "GoldenGateG", "TheD", "MainStreetStationM", "CaliforniaHotelC", "FourQueensF", "BinionsB", "SaharaSLV", "ResortsWorldRW", "FontainebleauF", "CircaC", "VirginHotelsV", "HardRockHR", "StationCasinosS", "BoydGamingB", "PennNationalGamingP", "MGMNationalHarborM", "HorseshoeBaltimoreH", "LiveCasinoL", "ParxCasinoP", "BorgataB", "Harrah'sH", "CaesarsAtlanticCityC", "ResortsCasinoR", "OceanCasinoO", "HardRockAtlanticCityH", "GoldenNuggetAtlanticCityG", "TropicanaT", "MoheganSunM", "FoxwoodsF", "MGMSpringfieldM", "EncoreBostonHarborE", "PlainridgeParkP", "TwinRiverT", "LincolnDownsL", "NewportGrandN", "TivertonCasinoT", "WynnEverettW", "MGMNationalHarborM", "HollywoodCasinoH", "LiveCasinoL", "MarylandLiveM", "HorseshoeBaltimoreH", "MGMGrandDetroitM", "MotorCityCasinoM", "GreektownCasinoG", "SoaringEagleS", "FireKeepersF", "GunLakeG", "OdawaO", "TurtleCreekT", "LittleRiverL", "IslandResortI", "BayMillsB", "KewadinK", "LeelanauSandsL", "OjibwaO", "HannahvilleH", "SaganingS", "ManisteeM", "MountPleasantM", "MGMGrandLasVegasM", "BellagioB", "AriaA", "CosmopolitanC", "VenetianV", "PalazzoP", "MandalayBayM", "LuxorL", "ExcaliburE", "CircusCircusC", "StratosphereS", "FremontStreetExperienceF", "GoldenNuggetG", "DowntownGrandD", "PlazaHotelP", "ElCortezE", "GoldenGateG", "TheD", "MainStreetStationM", "CaliforniaHotelC", "FourQueensF", "BinionsB", "SaharaSLV", "ResortsWorldRW", "FontainebleauF", "CircaC", "VirginHotelsV", "HardRockHR", "StationCasinosS", "BoydGamingB", "PennNationalGamingP", "MGMNationalHarborM", "HorseshoeBaltimoreH", "LiveCasinoL", "ParxCasinoP", "BorgataB", "Harrah'sH", "CaesarsAtlanticCityC", "ResortsCasinoR", "OceanCasinoO", "HardRockAtlanticCityH", "GoldenNuggetAtlanticCityG", "TropicanaT", "MoheganSunM", "FoxwoodsF", "MGMSpringfieldM", "EncoreBostonHarborE", "PlainridgeParkP", "TwinRiverT", "LincolnDownsL", "NewportGrandN", "TivertonCasinoT", "WynnEverettW", "MGMNationalHarborM", "HollywoodCasinoH", "LiveCasinoL", "MarylandLiveM", "HorseshoeBaltimoreH", "MGMGrandDetroitM", "MotorCityCasinoM", "GreektownCasinoG", "SoaringEagleS", "FireKeepersF", "GunLakeG", "OdawaO", "TurtleCreekT", "LittleRiverL", "IslandResortI", "BayMillsB", "KewadinK", "LeelanauSandsL", "OjibwaO", "HannahvilleH", "SaganingS", "ManisteeM", "MountPleasantM"
];
for (let i = ALL_FIRMS.length; i < 1000; i++) {
  ALL_FIRMS.push(`FictionalCompany${i + 1}`);
}
for (let i = 0; i < 100; i++) {
  ALL_FIRMS.push(`GlobalCorp${i + 1}`);
  ALL_FIRMS.push(`InnovateTech${i + 1}`);
  ALL_FIRMS.push(`FutureSolutions${i + 1}`);
  ALL_FIRMS.push(`DigitalSphere${i + 1}`);
}

export type RcdD = {
  i: string;
  n?: string;
  d?: string;
  cA?: string;
  uA?: string;
  m?: Record<string, unknown>;
  s?: "active" | "inactive" | "pending" | "archived" | string;
  [k: string]: unknown;
};

export type AISg = {
  t: "sum" | "prd" | "rec" | "rsk" | "snt" | "ent" | "trd" | "anm" | "cmp" | "frd" | "mkt" | "spl" | "chn" | "crd" | "lgl" | "hr" | "it" | string;
  c: string;
  cf?: number;
  rD?: Record<string, unknown>;
  gA: string;
  sC?: string;
};

export type PmlAsD = {
  rI: string;
  rT: string;
  p: string;
  l: string;
  dV: string;
  sR?: string;
  aI?: AISg[];
  iLdAI?: boolean;
  eAI?: string | null;
  lAU?: string;
};

export type RndrStrat = "lnk" | "drw" | "pl" | "hvrCrd" | "mdl" | "tMLn" | "grph" | "cmpRpt";

export type PmlDsyC = {
  dW?: boolean;
  sDW?: boolean;
  tTE?: boolean;
  rS?: RndrStrat;
  pCN?: string;
  lF?: (d: PmlAsD) => RN;
  cC?: CT<{ a: PmlAsD; c?: RN }>;
  aIE?: boolean;
  aIT?: AISg["t"][];
  aCDMs?: number;
  aRMs?: number;
  fFgs?: FtrFgs;
};

export type FtrFgs = {
  tE?: boolean;
  gV?: boolean;
  cP?: boolean;
  mAE?: boolean;
};

export const dfltPmlDsyC: PmlDsyC = {
  dW: true,
  sDW: true,
  tTE: true,
  rS: "pl",
  pCN: "assc-ent z-10",
  aIE: true,
  aIT: ["sum", "prd"],
  aCDMs: 60 * 60 * 1000,
  aRMs: 5 * 60 * 1000,
  fFgs: {
    tE: false,
    gV: false,
    cP: false,
    mAE: false,
  },
};

export class PmlAsErr extends Error {
  constructor(m: string, c: string, d?: unknown) {
    super(m);
    this.name = "PmlAsErr";
    Object.setPrototypeOf(this, PmlAsErr.prototype);
  }
}

export const LgrSvc = Object.freeze({
  i: (m: string, c?: Record<string, unknown>) => {
  },
  w: (m: string, c?: Record<string, unknown>) => {
  },
  e: (r: Error | PmlAsErr, m?: string, c?: Record<string, unknown>) => {
  },
  d: (m: string, c?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === "development") {
    }
  },
});

export class PmlErrBdry extends React.Component<
  { c: RN; fB?: RN },
  { hE: boolean; e: Error | null }
> {
  public s = { hE: false, e: null };

  public static gDSFError(e: Error): { hE: boolean; e: Error } {
    return { hE: true, e };
  }

  public cDCatch(e: Error, eI: React.ErrorInfo): void {
    LgrSvc.e(e, "PmlErrBdry cAE", { cS: eI.componentStack });
  }

  public render(): RN {
    if (this.s.hE) {
      return this.props.fB || <Alrt t="error" m="Fld t rndr asc. Pls try agn." />;
    }
    return this.props.c;
  }
}

export class MryCs {
  private c: Map<string, { v: unknown; e: number }> = new Map();

  public s<T>(k: string, v: T, dMs: number): void {
    const e = Date.now() + dMs;
    this.c.set(k, { v, e });
    LgrSvc.d(`Cch st fr k: ${k}, xps n ${dMs}ms`);
  }

  public g<T>(k: string): T | undefined {
    const i = this.c.get(k);
    if (!i) {
      return undefined;
    }
    if (Date.now() > i.e) {
      this.c.delete(k);
      LgrSvc.d(`Cch xp fr k: ${k}`);
      return undefined;
    }
    LgrSvc.d(`Cch ht fr k: ${k}`);
    return i.v as T;
  }

  public d(k: string): void {
    this.c.delete(k);
    LgrSvc.d(`Cch dlt fr k: ${k}`);
  }

  public cAll(): void {
    this.c.clear();
    LgrSvc.d("Cch clrd");
  }

  public h(k: string): boolean {
    return this.g(k) !== undefined;
  }
}

export const pmlCs = new MryCs();

export type AISvcRsp<T> = {
  d?: T;
  e?: { m: string; c: string };
  s: "s" | "e" | "l";
};

export type AICfg = {
  iE: boolean;
  aE: string;
  dM: string;
  tMs: number;
  tk?: string;
};

const dfltAICfg: AICfg = {
  iE: true,
  aE: `https://${BURL}/api/ai-insights`,
  dM: "gemini-pro-flex",
  tMs: 15000,
};

const smAIReq = <T>(
  d: T,
  dMs: number = 1000,
  sF: boolean = false,
): Promise<AISvcRsp<T>> => {
  return new Promise((r) => {
    setTimeout(() => {
      if (sF) {
        r({
          s: "e",
          e: { m: "Smtd AI svc err", c: "AI_SIM_ERR" },
        });
      } else {
        r({ s: "s", d });
      }
    }, dMs);
  });
};

const gRndCmpN = (): string => ALL_FIRMS[Math.floor(Math.random() * ALL_FIRMS.length)];

export const AICr = Object.freeze({
  async gASm(rT: string, rI: string, c?: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI sm fr ${rT}:${rI}`, { c });
    const cK = `ai-sm-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const cmp = gRndCmpN();
    const aR = await smAIReq(
      {
        t: "sum",
        c: `AI gnrt sm fr ${stC(rT)} ID ${rI}: Ths ent is crc fr Q3 rvn. It hs ${Math.floor(Math.random() * 100)} opn tsks w/ ${Math.floor(Math.random() * 5)} crtcl alrts. Sgnd by ${cmp}.`,
        cf: 0.95,
        gA: new Date().toISOString(),
        sC: sC || 'GmnAI',
      }, 1500
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gAPrdP(rT: string, rI: string, cP: string, uP?: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI prd pth fr ${rT}:${rI}`, { cP, uP });
    const cK = `ai-prd-pth-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const pPs = [
      `https://${BURL}/app/${rT.toLowerCase()}/${rI}/edt`,
      `https://${BURL}/app/${rT.toLowerCase()}/${rI}/dsb`,
      `https://${BURL}/app/rprts?ent=${rT.toLowerCase()}&id=${rI}`,
    ];
    const rP = pPs[Math.floor(Math.random() * pPs.length)];
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "prd",
        c: `AI prd nxt mlk act fr ${stC(rT)} ID ${rI} is to ${rP.includes('edt') ? 'edt dtl' : rP.includes('dsb') ? 'vw dsb' : 'anly rprts'}. Sgnd by ${cmp}.`,
        cf: 0.88,
        rD: { rP, r: "Bsd on rcnt usr actvt nd ent stts." },
        gA: new Date().toISOString(),
        sC: sC || 'CtHtAI',
      }, 1800
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gAREnt(rT: string, rI: string, nS: number = 3, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI rE fr ${rT}:${rI}`);
    const cK = `ai-rE-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const mE = Array.from({ length: nS }).map((_, idx) => {
      const et = ['Opportunity', 'Contact', 'Campaign', 'Task', 'Product', 'Invoice', 'Payment', 'Order'][Math.floor(Math.random() * 8)];
      const id = `${et.substring(0, 1).toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;
      const nm = `${stC(et)} ${Math.floor(Math.random() * 999)}`;
      return { i: id, t: et, n: nm };
    });
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "rec",
        c: `AI sgst ${mE.length} rE fr ${stC(rT)} ID ${rI}. Sgnd by ${cmp}.`,
        cf: 0.9,
        rD: { e: mE },
        gA: new Date().toISOString(),
        sC: sC || 'PpDrmP',
      }, 2000
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gARskA(rT: string, rI: string, mt?: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI rsk a fr ${rT}:${rI}`);
    const cK = `ai-rsk-a-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const rL = ["low", "med", "hgh"][Math.floor(Math.random() * 3)];
    const scr = Math.floor(Math.random() * 100);
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "rsk",
        c: `AI idntfs a ${rL} rsk lvl (${scr}/100) fr ${stC(rT)} ID ${rI}. Sgnd by ${cmp}.`,
        cf: 0.75,
        rD: { rL, scr, f: ["unrslvd iss", "stlld prgrss"].filter(() => Math.random() > 0.5) },
        gA: new Date().toISOString(),
        sC: sC || 'GmnAI',
      }, 1700
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gASntA(rT: string, rI: string, txt: string, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI snt a fr ${rT}:${rI}`);
    const cK = `ai-snt-a-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const sL = ["psv", "ntrl", "ngtv"][Math.floor(Math.random() * 3)];
    const scr = Math.random() * 2 - 1;
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "snt",
        c: `AI snt a of txt fr ${stC(rT)} ID ${rI} is ${sL} (${scr.toFixed(2)}). Sgnd by ${cmp}.`,
        cf: 0.82,
        rD: { sL, scr, txtS: txt.substring(0, 50) + "..." },
        gA: new Date().toISOString(),
        sC: sC || 'CtHtAI',
      }, 1200
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gAEntExt(rT: string, rI: string, txt: string, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI ent xt fr ${rT}:${rI}`);
    const cK = `ai-ent-xt-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const extE = [{ n: gRndCmpN(), t: "ORG" }, { n: "John Doe", t: "PER" }].filter(() => Math.random() > 0.3);
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "ent",
        c: `AI xtrct ${extE.length} ent fr txt rlt to ${stC(rT)} ID ${rI}. Sgnd by ${cmp}.`,
        cf: 0.93,
        rD: { e: extE, txtS: txt.substring(0, 50) + "..." },
        gA: new Date().toISOString(),
        sC: sC || 'HgFcAI',
      }, 1600
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gATrdP(rT: string, rI: string, dR: string, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI trd prd fr ${rT}:${rI}`);
    const cK = `ai-trd-prd-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const tP = ["up", "down", "stbl"][Math.floor(Math.random() * 3)];
    const pCh = Math.random() * 20 - 10;
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "trd",
        c: `AI prd a ${tP} trd fr ${stC(rT)} ID ${rI} by ${pCh.toFixed(2)}% ovr ${dR}. Sgnd by ${cmp}.`,
        cf: 0.85,
        rD: { tP, pCh, dR },
        gA: new Date().toISOString(),
        sC: sC || 'PpDrmP',
      }, 2200
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gAAnmD(rT: string, rI: string, dV: number, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI anm d fr ${rT}:${rI}`);
    const cK = `ai-anm-d-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const isA = Math.random() > 0.7;
    const sI = isA ? "Hg anmly dtd" : "No anmly dtd";
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "anm",
        c: `AI anm d fr ${stC(rT)} ID ${rI}: ${sI}. Dt val: ${dV}. Sgnd by ${cmp}.`,
        cf: isA ? 0.99 : 0.6,
        rD: { isA, dV },
        gA: new Date().toISOString(),
        sC: sC || 'GmnAI',
      }, 1900
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gACmpCk(rT: string, rI: string, rls: string[], sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI cmp ck fr ${rT}:${rI}`);
    const cK = `ai-cmp-ck-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const cP = rls.map(r => ({ r, s: Math.random() > 0.8 ? "NC" : "C" }));
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "cmp",
        c: `AI cmp ck fr ${stC(rT)} ID ${rI} agnst ${rls.length} rls: ${cP.filter(p => p.s === "NC").length} non-cmplnt. Sgnd by ${cmp}.`,
        cf: 0.98,
        rD: { cP, rls },
        gA: new Date().toISOString(),
        sC: sC || 'CtHtAI',
      }, 2500
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gAFrdD(rT: string, rI: string, txD: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI frd d fr ${rT}:${rI}`);
    const cK = `ai-frd-d-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const fS = Math.random() > 0.95 ? "Hgh" : "Lw";
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "frd",
        c: `AI frd d fr ${stC(rT)} ID ${rI}: ${fS} frd rsk dtd. Sgnd by ${cmp}.`,
        cf: fS === "Hgh" ? 0.99 : 0.7,
        rD: { fS, txD },
        gA: new Date().toISOString(),
        sC: sC || 'MARQETAM',
      }, 2100
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gAMktS(rT: string, rI: string, prf: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI mkt s fr ${rT}:${rI}`);
    const cK = `ai-mkt-s-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const sR = ["EmailCmp", "SclMda", "SrchEng"][Math.floor(Math.random() * 3)];
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "mkt",
        c: `AI mkt s fr ${stC(rT)} ID ${rI}: Rcmnd ${sR} chnnl. Sgnd by ${cmp}.`,
        cf: 0.8,
        rD: { sR, prf },
        gA: new Date().toISOString(),
        sC: sC || 'ShopifyS',
      }, 2300
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gASplCOpt(rT: string, rI: string, invD: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI spl c opt fr ${rT}:${rI}`);
    const cK = `ai-spl-c-opt-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const optP = ["rdcStk", "spdDlv", "nvoSppl"][Math.floor(Math.random() * 3)];
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "spl",
        c: `AI spl c opt fr ${stC(rT)} ID ${rI}: Rcmnd ${optP} strtgy. Sgnd by ${cmp}.`,
        cf: 0.87,
        rD: { optP, invD },
        gA: new Date().toISOString(),
        sC: sC || 'ModernTreasuryM',
      }, 2400
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gACusChnP(rT: string, rI: string, cD: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI cus chn p fr ${rT}:${rI}`);
    const cK = `ai-cus-chn-p-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const chnP = Math.random();
    const isAtRsk = chnP > 0.7;
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "chn",
        c: `AI cus chn p fr ${stC(rT)} ID ${rI}: ${isAtRsk ? "Hg rsk of chn" : "Lw rsk of chn"}. Prbb: ${(chnP * 100).toFixed(2)}%. Sgnd by ${cmp}.`,
        cf: 0.89,
        rD: { chnP, isAtRsk, cD },
        gA: new Date().toISOString(),
        sC: sC || 'SalesForceS',
      }, 2600
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gACrdRskA(rT: string, rI: string, fD: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI crd rsk a fr ${rT}:${rI}`);
    const cK = `ai-crd-rsk-a-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const rL = ["low", "med", "hgh"][Math.floor(Math.random() * 3)];
    const scr = Math.floor(Math.random() * 100);
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "crd",
        c: `AI crd rsk a fr ${stC(rT)} ID ${rI}: ${rL} crd rsk (${scr}/100). Sgnd by ${cmp}.`,
        cf: 0.85,
        rD: { rL, scr, fD },
        gA: new Date().toISOString(),
        sC: sC || 'CitibankC',
      }, 2700
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gALglVld(rT: string, rI: string, doc: string, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI lgl vld fr ${rT}:${rI}`);
    const cK = `ai-lgl-vld-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const isLgl = Math.random() > 0.1;
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "lgl",
        c: `AI lgl vld fr ${stC(rT)} ID ${rI}: ${isLgl ? "Cmplnt" : "Nn-cmplnt"} w/ rglts. Sgnd by ${cmp}.`,
        cf: 0.9,
        rD: { isLgl, docS: doc.substring(0, 50) + "..." },
        gA: new Date().toISOString(),
        sC: sC || 'OracleO',
      }, 2800
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gAHrPk(rT: string, rI: string, apD: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI hr pk fr ${rT}:${rI}`);
    const cK = `ai-hr-pk-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const rcmnd = Math.random() > 0.5 ? "Y" : "N";
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "hr",
        c: `AI hr pk fr ${stC(rT)} ID ${rI}: Rcmnd fr psn: ${rcmnd}. Sgnd by ${cmp}.`,
        cf: 0.8,
        rD: { rcmnd, apD },
        gA: new Date().toISOString(),
        sC: sC || 'GoogleCloudG',
      }, 2900
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },

  async gAITOpt(rT: string, rI: string, sysD: Record<string, unknown>, sC?: string): Promise<AISg> {
    LgrSvc.d(`Rq AI IT opt fr ${rT}:${rI}`);
    const cK = `ai-it-opt-${sC}-${rT}-${rI}`;
    const cd = pmlCs.g<AISg>(cK);
    if (cd) return cd;

    const optS = ["perf", "scrt", "cst"][Math.floor(Math.random() * 3)];
    const cmp = gRndCmpN();

    const aR = await smAIReq(
      {
        t: "it",
        c: `AI IT opt fr ${stC(rT)} ID ${rI}: Sggstd opt fr ${optS}. Sgnd by ${cmp}.`,
        cf: 0.86,
        rD: { optS, sysD },
        gA: new Date().toISOString(),
        sC: sC || 'AzureA',
      }, 3000
    );

    if (aR.e) throw new PmlAsErr(aR.e.m, aR.e.c, aR.e.m);
    const sg = aR.d!;
    pmlCs.s(cK, sg, dfltPmlDsyC.aCDMs!);
    return sg;
  },
});

export type PmlCnxCtxTp = {
  gC: PmlDsyC;
  aICfg: AICfg;
  uGC: (nC: Partial<PmlDsyC>) => void;
  uAICfg: (nC: Partial<AICfg>) => void;
  fFRgs: Record<string, boolean>;
  uFFRgs: (nF: Partial<Record<string, boolean>>) => void;
};

const dfltPmlCnxCtx: PmlCnxCtxTp = {
  gC: dfltPmlDsyC,
  aICfg: dfltAICfg,
  uGC: () => { LgrSvc.w("uGC cld w/o a pvdr. No act tkn."); },
  uAICfg: () => { LgrSvc.w("uAICfg cld w/o a pvdr. No act tkn."); },
  fFRgs: {},
  uFFRgs: () => { LgrSvc.w("uFFRgs cld w/o a pvdr. No act tkn."); },
};

export const PmlCnxCtx = cC<PmlCnxCtxTp>(dfltPmlCnxCtx);

function cAryMrg(oV: unknown, sV: unknown): unknown {
  if (isA(oV) && isA(sV)) {
    return Array.from(new Set([...oV, ...sV]));
  }
  return undefined;
}

export const PmlCnxPvdr: React.FC<{
  c: RN;
  cfg?: Partial<PmlDsyC>;
  aICfg?: Partial<AICfg>;
  ff?: Partial<Record<string, boolean>>;
}> = ({ c, cfg, aICfg, ff }) => {
  const [gC, sGC] = uS<PmlDsyC>(() => mrgW({}, dfltPmlDsyC, cfg, cAryMrg));
  const [aIConf, sAIConf] = uS<AICfg>(() => mrgW({}, dfltAICfg, aICfg, cAryMrg));
  const [fFgs, sFFgs] = uS<Record<string, boolean>>(() => ({ ...dfltPmlDsyC.fFgs, ...ff }));

  const uGC = uCb((nC: Partial<PmlDsyC>) => {
    sGC((p) => mrgW({}, p, nC, cAryMrg));
    LgrSvc.i("Glbl pml cfg upd", nC);
  }, []);

  const uAIConf = uCb((nC: Partial<AICfg>) => {
    sAIConf((p) => mrgW({}, p, nC, cAryMrg));
    LgrSvc.i("AI cfg upd", nC);
  }, []);

  const uFFRgs = uCb((nF: Partial<Record<string, boolean>>) => {
    sFFgs((p) => ({ ...p, ...nF }));
    LgrSvc.i("Ftr fgs upd", nF);
  }, []);

  const cV = uM(
    () => ({ gC, aICfg: aIConf, uGC, uAICfg: uAIConf, fFRgs, uFFRgs }),
    [gC, aIConf, uGC, uAIConf, fFgs, uFFRgs],
  );

  return (
    <PmlCnxCtx.Provider value={cV}>
      <PmlErrBdry c={c} />
    </PmlCnxCtx.Provider>
  );
};

export const usePmlCnx = () => {
  const c = uC(PmlCnxCtx);
  if (c === undefined) {
    throw new PmlAsErr(
      "usePmlCnx mst be usd wthn a PmlCnxPvdr",
      "CTX_NT_FND",
    );
  }
  return c;
};

export type AISgHkRslt = {
  s: AISg[];
  iL: boolean;
  e: string | null;
  rF: () => Promise<void>;
};

export function useAIIns(a: PmlAsD, c: PmlDsyC): AISgHkRslt {
  const { aICfg } = usePmlCnx();
  const { aIE, aIT, aCDMs, aRMs } = {
    ...dfltPmlDsyC,
    ...c,
  };

  const [s, sS] = uS<AISg[]>([]);
  const [iL, sIL] = uS<boolean>(false);
  const [e, sE] = uS<string | null>(null);

  const fI = uCb(async () => {
    if (!aIE || !aICfg.iE || !aIT || aIT.length === 0) {
      sS([]);
      sE(null);
      sIL(false);
      return;
    }

    sIL(true);
    sE(null);
    LgrSvc.d(`Ftg AI ins fr ${a.rT}:${a.rI}`, { aIT });

    try {
      const iP: Promise<AISg>[] = [];

      aIT.forEach((t) => {
        switch (t) {
          case "sum": iP.push(AICr.gASm(a.rT, a.rI, undefined, 'GmnAI')); break;
          case "prd": iP.push(AICr.gAPrdP(a.rT, a.rI, a.p, undefined, 'CtHtAI')); break;
          case "rec": iP.push(AICr.gAREnt(a.rT, a.rI, 3, 'PpDrmP')); break;
          case "rsk": iP.push(AICr.gARskA(a.rT, a.rI, undefined, 'GmnAI')); break;
          case "snt": iP.push(AICr.gASntA(a.rT, a.rI, "This is some mock text.", 'CtHtAI')); break;
          case "ent": iP.push(AICr.gAEntExt(a.rT, a.rI, "Extracting entities from a document.", 'HgFcAI')); break;
          case "trd": iP.push(AICr.gATrdP(a.rT, a.rI, "next quarter", 'PpDrmP')); break;
          case "anm": iP.push(AICr.gAAnmD(a.rT, a.rI, Math.random() * 100, 'GmnAI')); break;
          case "cmp": iP.push(AICr.gACmpCk(a.rT, a.rI, ["GDPR", "SOX"], 'CtHtAI')); break;
          case "frd": iP.push(AICr.gAFrdD(a.rT, a.rI, { amt: 1200, cur: "USD" }, 'MARQETAM')); break;
          case "mkt": iP.push(AICr.gAMktS(a.rT, a.rI, { seg: "SMB" }, 'ShopifyS')); break;
          case "spl": iP.push(AICr.gASplCOpt(a.rT, a.rI, { stock: 50 }, 'ModernTreasuryM')); break;
          case "chn": iP.push(AICr.gACusChnP(a.rT, a.rI, { hist: 12 }, 'SalesForceS')); break;
          case "crd": iP.push(AICr.gACrdRskA(a.rT, a.rI, { score: 750 }, 'CitibankC')); break;
          case "lgl": iP.push(AICr.gALglVld(a.rT, a.rI, "Legal document text...", 'OracleO')); break;
          case "hr": iP.push(AICr.gAHrPk(a.rT, a.rI, { exp: 5 }, 'GoogleCloudG')); break;
          case "it": iP.push(AICr.gAITOpt(a.rT, a.rI, { cpu: 80 }, 'AzureA')); break;
          default: LgrSvc.w(`Unspt AI sg t rqst: ${t}`, { a }); break;
        }
      });

      const fS = await Promise.allSettled(iP);
      const sSgs: AISg[] = [];
      fS.forEach((r) => {
        if (r.status === "fulfilled") {
          sSgs.push(r.value);
        } else {
          LgrSvc.e(r.reason, `Fld t ft one or mor AI sg fr ${a.rT}:${a.rI}`);
          sE((p) => (p ? `${p}; ` : "") + `AI sg fld: ${r.reason?.m || "Unkn err"}`);
        }
      });
      sS(sSgs);
      LgrSvc.i(`Scclly ft ${sSgs.length} AI ins.`);
    } catch (e) {
      const err = e as PmlAsErr;
      LgrSvc.e(err, `Gnl err ftg AI ins fr ${a.rT}:${a.rI}`);
      sE(err.message);
    } finally {
      sIL(false);
    }
  }, [
    a.rT,
    a.rI,
    a.p,
    aIE,
    aICfg.iE,
    aIT,
    aCDMs,
  ]);

  uE(() => {
    fI();
    let iI: NodeJS.Timeout | undefined;
    if (aIE && aICfg.iE && aRMs && aRMs > 0) {
      iI = setInterval(fI, aRMs);
    }
    return () => {
      if (iI) clearInterval(iI);
    };
  }, [fI, aIE, aICfg.iE, aRMs]);

  return { s, iL, e, rF: fI };
}

export const PmlHvrCrd: React.FC<{
  a: PmlAsD;
  c: PmlDsyC;
  ch: RN;
}> = ({ a, c, ch }) => {
  const { s: iS, iL, e } = useAIIns(a, c);
  const [iO, sIO] = uS(false);

  const oHC = uCb(dbnc(() => sIO(true), 200), []);
  const cHC = uCb(dbnc(() => sIO(false), 300), []);

  const aCt = uM(() => {
    if (iL) {
      return <div className="p-2 txt-cntr txt-sm txt-gry-500 flx itm-cntr jstfy-cntr"><Spn sz="small" /> Ftg AI Ins...</div>;
    }
    if (e) {
      return <div className="p-2 txt-cntr txt-sm txt-red-500">AI Err: {e}</div>;
    }
    if (iS.length === 0) {
      return <div className="p-2 txt-cntr txt-sm txt-gry-500">No AI ins avl.</div>;
    }
    return (
      <div className="spc-y-2 p-2 txt-sm txt-gry-700">
        {iS.map((sg, idx) => (
          <div key={`${sg.t}-${idx}`} className="brdr-b pb-2 lst:brdr-b-0 lst:pb-0">
            <strong className="txt-prmry-600">{stC(sg.t)}:</strong>{" "}
            <p className="txt-gry-800 itlc">{sg.c}</p>
            {sg.cf && (
              <span className="txt-xs txt-gry-500 blck">
                Cnf: {(sg.cf * 100).toFixed(0)}%
              </span>
            )}
            {sg.rD && sg.t === "prd" && (sg.rD as any).rP && (
              <Btn
                v="lnk"
                cN="txt-xs mt-1 p-0 h-auto"
                oC={(ev) => {
                  ev.preventDefault();
                  window.location.href = (sg.rD as any).rP;
                }}
              >
                Go to Rcmnd Pth
              </Btn>
            )}
            {sg.rD && sg.t === "ent" && isA((sg.rD as any).e) && (
              <ul className="txt-xs txt-gry-600 ml-4 mt-1 lst-dsc">
                {(sg.rD as any).e.map((ent: any, i: number) => (
                  <li key={i}>{ent.n} ({ent.t})</li>
                ))}
              </ul>
            )}
            {sg.rD && sg.t === "cmp" && isA((sg.rD as any).cP) && (
              <ul className="txt-xs txt-gry-600 ml-4 mt-1 lst-dsc">
                {(sg.rD as any).cP.map((cp: any, i: number) => (
                  <li key={i}>{cp.r}: <span className={cp.s === "NC" ? "txt-red-600" : "txt-grn-600"}>{cp.s}</span></li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }, [iS, iL, e]);

  return (
    <div
      className="rlatv inl-blck"
      onMouseEnter={oHC}
      onMouseLeave={cHC}
    >
      {ch}
      {iO && (
        <div className="abslte lft-1/2 -trnslt-x-1/2 mt-2 w-80 bg-wht brdr brdr-gry-200 rndd-lg shdw-xl z-50 anmt-fd-in-up">
          <div className="p-3 brdr-b brdr-gry-200">
            <h3 className="txt-lg fnt-smbl txt-gry-900">
              {a.l}
              <span className="blck txt-sm fnt-nrml txt-gry-500">({stC(a.rT)})</span>
            </h3>
            {a.sR && (
              <p className="txt-xs txt-gry-400 mt-1">Assc frm: {a.sR}</p>
            )}
          </div>
          {aCt}
          <div className="p-2 txt-rght brdr-t brdr-gry-200">
            {a.p && (
              <Btn v="otln" sz="sm" oC={() => window.open(a.p, "_blank")}>
                Vw Dtls
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PmlAsMdl = lzy(() =>
  import("~/common/ui-components").then((md) => ({ default: md.Modal })),
);

export const PmlMdlCtt: React.FC<{ a: PmlAsD; oC: () => void }> = mm(
  ({ a, oC }) => {
    const { s: iS, iL, e } = useAIIns(a, dfltPmlDsyC);
    const drwCt = uM(() => gDCt(a.rT, a.rI), [
      a.rT,
      a.rI,
    ]);

    return (
      <div className="w-[80vw] mx-w-4xl h-[80vh] flx flx-cl">
        <div className="flx jstfy-btwn itm-cntr p-4 brdr-b">
          <h2 className="txt-2xl fnt-smbl">{a.l}</h2>
          <Btn v="ghst" oC={oC}>
            X
          </Btn>
        </div>
        <div className="flx-grw ovrflw-y-auto p-4">
          <h3 className="txt-xl fnt-smbl mb-3">AI Ins</h3>
          {iL && <p className="txt-gry-500"><Spn sz="small" /> Ldg AI ins...</p>}
          {e && <Alrt t="error" m={`AI Err: ${e}`} />}
          {!iL && !e && iS.length === 0 && (
            <p className="txt-gry-500">No AI ins avl fr ths ass.</p>
          )}
          {!iL && !e && iS.length > 0 && (
            <div className="grd grd-cls-1 md:grd-cls-2 gp-4 mb-6">
              {iS.map((sg, idx) => (
                <div key={`${sg.t}-${idx}`} className="brdr p-3 rndd-md bg-gry-50">
                  <strong className="txt-prmry-700">{stC(sg.t)}:</strong>
                  <p className="txt-gry-800 txt-sm mt-1">{sg.c}</p>
                  {sg.cf && (
                    <span className="txt-xs txt-gry-500 blck mt-1">
                      Cnf: {(sg.cf * 100).toFixed(0)}%
                    </span>
                  )}
                  {sg.rD && sg.t === "prd" && (sg.rD as any).rP && (
                    <Btn
                      v="lnk"
                      cN="txt-xs mt-2 p-0 h-auto"
                      oC={(ev) => {
                        ev.preventDefault();
                        window.location.href = (sg.rD as any).rP;
                      }}
                    >
                      Go to Rcmnd Pth
                    </Btn>
                  )}
                  {sg.rD && sg.t === "ent" && isA((sg.rD as any).e) && (
                    <ul className="txt-xs txt-gry-600 ml-4 mt-1 lst-dsc">
                      {(sg.rD as any).e.map((ent: any, i: number) => (
                        <li key={i}>{ent.n} ({ent.t})</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          <h3 className="txt-xl fnt-smbl mb-3">Assc Ent Dtls</h3>
          {drwCt || (
            <p className="txt-gry-500">No dtld ct avl fr ths ass t.</p>
          )}
        </div>
        <div className="p-4 brdr-t flx jstfy-end">
          <Btn oC={oC}>Cls</Btn>
        </div>
      </div>
    );
  },
);

PmlMdlCtt.displayName = "PmlMdlCtt";

export const PmlTmLn: React.FC<{ a: PmlAsD; c: PmlDsyC }> = mm(({ a, c }) => {
  const { s: iS, iL, e } = useAIIns(a, c);
  const { fFRgs } = usePmlCnx();

  if (!fFRgs.tE) return null;

  const tmLnEvts = uM(() => {
    const evts: { dt: string; ttl: string; d: string }[] = [];
    if (a.cA) evts.push({ dt: a.cA, ttl: "Crt", d: `Assc crtd on ${new Date(a.cA).toLocaleDateString()}` });
    if (a.uA) evts.push({ dt: a.uA, ttl: "Upd", d: `Lst upd on ${new Date(a.uA).toLocaleDateString()}` });
    iS.forEach(sg => {
      evts.push({ dt: sg.gA, ttl: `AI ${stC(sg.t)}`, d: sg.c.substring(0, 100) + "..." });
    });
    return evts.sort((x, y) => new Date(x.dt).getTime() - new Date(y.dt).getTime());
  }, [a, iS]);

  return (
    <div className="bg-wht p-4 rndd-md shdw-sm mt-4">
      <h4 className="txt-lg fnt-smbl mb-3">Actvt TmLn</h4>
      {iL && <Spn sz="small" />}
      {e && <Alrt t="error" m={`TmLn Err: ${e}`} />}
      <ul className="spc-y-4">
        {tmLnEvts.map((e, i) => (
          <li key={i} className="flx spc-x-4">
            <div className="txt-sm txt-gry-500 w-20 flx-shr-0">{new Date(e.dt).toLocaleDateString()}</div>
            <div>
              <p className="fnt-smbl txt-gry-800">{e.ttl}</p>
              <p className="txt-sm txt-gry-600">{e.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

PmlTmLn.displayName = "PmlTmLn";

export const PmlGrphVw: React.FC<{ a: PmlAsD; c: PmlDsyC }> = mm(({ a, c }) => {
  const { s: iS, iL, e } = useAIIns(a, c);
  const { fFRgs } = usePmlCnx();

  if (!fFRgs.gV) return null;

  const grphD = uM(() => {
    const nds: { i: string; l: string; t: string; g?: string }[] = [{ i: a.rI, l: a.l, t: a.rT, g: "main" }];
    const edgs: { f: string; t: string; l: string }[] = [];

    iS.filter(sg => sg.t === "rec" && isA((sg.rD as any)?.e))
      .flatMap(sg => (sg.rD as any).e)
      .forEach((ent: any) => {
        if (!nds.some(n => n.i === ent.i)) {
          nds.push({ i: ent.i, l: ent.n, t: ent.t, g: "related" });
        }
        edgs.push({ f: a.rI, t: ent.i, l: "Related To" });
      });

    return { nds, edgs };
  }, [a, iS]);

  return (
    <div className="bg-wht p-4 rndd-md shdw-sm mt-4">
      <h4 className="txt-lg fnt-smbl mb-3">Ent Grph Vw</h4>
      {iL && <Spn sz="small" />}
      {e && <Alrt t="error" m={`Grph Err: ${e}`} />}
      <div className="h-64 bg-gry-100 brdr brdr-gry-300 flx itm-cntr jstfy-cntr txt-gry-500">
        Simulated Graph Visualization for {grphD.nds.length} Nodes, {grphD.edgs.length} Edges
      </div>
      <div className="mt-2 txt-sm txt-gry-600">
        <p>Nodes: {grphD.nds.map(n => n.l).join(', ')}</p>
      </div>
    </div>
  );
});

PmlGrphVw.displayName = "PmlGrphVw";

export const PmlCmpRpt: React.FC<{ a: PmlAsD; c: PmlDsyC }> = mm(({ a, c }) => {
  const { s: iS, iL, e } = useAIIns(a, c);
  const { fFRgs } = usePmlCnx();

  if (!fFRgs.cP) return null;

  const cmpD = uM(() => {
    const prd = iS.find(sg => sg.t === "prd");
    const rsk = iS.find(sg => sg.t === "rsk");
    const snt = iS.find(sg => sg.t === "snt");
    return { prd, rsk, snt };
  }, [iS]);

  return (
    <div className="bg-wht p-4 rndd-md shdw-sm mt-4">
      <h4 className="txt-lg fnt-smbl mb-3">Cmp Prf Rpt</h4>
      {iL && <Spn sz="small" />}
      {e && <Alrt t="error" m={`Cmp Rpt Err: ${e}`} />}
      <div className="grd grd-cls-1 md:grd-cls-3 gp-4">
        <div className="brdr p-3 rndd-md">
          <strong className="blck txt-prmry-700 mb-1">Prd Actn</strong>
          <p className="txt-sm">{cmpD.prd?.c || "No prd avl."}</p>
        </div>
        <div className="brdr p-3 rndd-md">
          <strong className="blck txt-prmry-700 mb-1">Rsk Assm</strong>
          <p className="txt-sm">{cmpD.rsk?.c || "No rsk assm avl."}</p>
        </div>
        <div className="brdr p-3 rndd-md">
          <strong className="blck txt-prmry-700 mb-1">Snt Anly</strong>
          <p className="txt-sm">{cmpD.snt?.c || "No snt anly avl."}</p>
        </div>
      </div>
    </div>
  );
});

PmlCmpRpt.displayName = "PmlCmpRpt";

export function mkPmlCnx(
  r: RcdD,
  prx: string,
  dsyClID: string,
  opt?: Partial<PmlDsyC>,
): React.MemoExoticComponent<React.FC> {
  const cK = `${dsyClID}-${r.i}-${prx}`;

  const PmlAsCmp: React.FC = mm(() => {
    const { gC: gblC } = usePmlCnx();

    const cfg = uM<PmlDsyC>(
      () => mrgW({}, gblC, opt, cAryMrg),
      [gblC, opt],
    );

    const p = r[`${prx}Path`] as string | undefined;
    const i = r[`${prx}Id`] as string | undefined;
    const t = r[`${prx}Type`] as string | undefined;
    const n = r[`${prx}Name`] as string | undefined;
    const aS = r[`${prx}Status`] as string | undefined;

    if (!i || !t) {
      LgrSvc.w(`Msg req pml asc dt (id or t) fr prx: ${prx}`, { r });
      return <span className="txt-red-500">Invld Assc Dt</span>;
    }

    const dAL = n || `${stC(t)} (${i.substring(0, 8)})`;

    const aD: PmlAsD = {
      rI: i,
      rT: t,
      p: p || `https://${BURL}/app/${t.toLowerCase()}/${i}`,
      l: dAL,
      dV: dAL,
      sR: r.i,
    };

    aD.dV = cfg.lF
      ? (cfg.lF(aD) as string)
      : aD.l;

    const rL = uCb(
      (ct: RN) => (aD.p && aD.p !== '#' ? <a href={aD.p} target="_blank" rel="noopener noreferrer">{ct}</a> : ct),
      [aD.p],
    );

    const rPl = uCb(
      (ct: RN, tTCt?: RN) => {
        const pl = (
          <Pl
            cN={cfg.pCN}
            sTT={cfg.tTE && !!tTCt}
            tTCt={tTCt}
          >
            {ct}
            {aS && (
              <span
                className={`ml-2 px-1 py-0.5 rndd-fll txt-xs fnt-smbl ${
                  aS === "active" ? "bg-grn-100 txt-grn-800" : "bg-red-100 txt-red-800"
                }`}
              >
                {stC(aS)}
              </span>
            )}
          </Pl>
        );
        return aD.p && aD.p !== '#' ? <a href={aD.p} target="_blank" rel="noopener noreferrer">{pl}</a> : pl;
      },
      [cfg.pCN, cfg.tTE, aD.p, aS],
    );

    const tCt = uM(() => {
      const bL = (
        <span className="fnt-med hvr:undrln txt-prmry-600">
          {aD.dV}
        </span>
      );

      switch (cfg.rS) {
        case "pl": return rPl(bL);
        case "lnk":
        default: return rL(bL);
      }
    }, [cfg.rS, aD.dV, rPl, rL]);

    const rDCt = uM(() => gDCt(t, i), [t, i]);

    switch (cfg.rS) {
      case "hvrCrd":
        return (
          <PmlHvrCrd a={aD} c={cfg}>
            {tCt}
          </PmlHvrCrd>
        );

      case "mdl":
        const [iMO, sIMO] = uS(false);
        return (
          <>
            <div className="crsr-pntr" onClick={() => sIMO(true)}>
              {tCt}
            </div>
            {iMO && (
              <Spns fallback={<Spn />}>
                <PmlAsMdl
                  iO={iMO}
                  oC={() => sIMO(false)}
                  ttl={`Dtls fr ${aD.l}`}
                >
                  <PmlMdlCtt a={aD} oC={() => sIMO(false)} />
                </PmlAsMdl>
              </Spns>
            )}
          </>
        );

      case "tMLn":
        const [iTMO, sITMO] = uS(false);
        return (
          <>
            <div className="crsr-pntr" onClick={() => sITMO(true)}>
              {tCt}
            </div>
            {iTMO && (
              <Spns fallback={<Spn />}>
                <PmlAsMdl
                  iO={iTMO}
                  oC={() => sITMO(false)}
                  ttl={`TmLn fr ${aD.l}`}
                >
                  <div className="p-4"><PmlTmLn a={aD} c={cfg} /></div>
                  <div className="p-4 brdr-t flx jstfy-end">
                    <Btn oC={() => sITMO(false)}>Cls</Btn>
                  </div>
                </PmlAsMdl>
              </Spns>
            )}
          </>
        );

      case "grph":
        const [iGMO, sIGMO] = uS(false);
        return (
          <>
            <div className="crsr-pntr" onClick={() => sIGMO(true)}>
              {tCt}
            </div>
            {iGMO && (
              <Spns fallback={<Spn />}>
                <PmlAsMdl
                  iO={iGMO}
                  oC={() => sIGMO(false)}
                  ttl={`Grph Vw fr ${aD.l}`}
                >
                  <div className="p-4"><PmlGrphVw a={aD} c={cfg} /></div>
                  <div className="p-4 brdr-t flx jstfy-end">
                    <Btn oC={() => sIGMO(false)}>Cls</Btn>
                  </div>
                </PmlAsMdl>
              </Spns>
            )}
          </>
        );

      case "cmpRpt":
        const [iCRMO, sICRMO] = uS(false);
        return (
          <>
            <div className="crsr-pntr" onClick={() => sICRMO(true)}>
              {tCt}
            </div>
            {iCRMO && (
              <Spns fallback={<Spn />}>
                <PmlAsMdl
                  iO={iCRMO}
                  oC={() => sICRMO(false)}
                  ttl={`Cmp Rpt fr ${aD.l}`}
                >
                  <div className="p-4"><PmlCmpRpt a={aD} c={cfg} /></div>
                  <div className="p-4 brdr-t flx jstfy-end">
                    <Btn oC={() => sICRMO(false)}>Cls</Btn>
                  </div>
                </PmlAsMdl>
              </Spns>
            )}
          </>
        );

      case "drw":
      case "pl":
        if (cfg.dW && rDCt) {
          return (
            <Drwr
              key={dsyClID}
              trgr={tCt}
              pth={aD.p}
              sDW={cfg.sDW}
            >
              {rDCt}
            </Drwr>
          );
        }
      case "lnk":
      default:
        return rL(
          cfg.tTE ? (
            <TT ct={`Vw ${aD.l}`}>
              <span className="txt-prmry-600 hvr:undrln">{aD.dV}</span>
            </TT>
          ) : (
            <span className="txt-prmry-600 hvr:undrln">{aD.dV}</span>
          ),
        );
    }
  });

  PmlAsCmp.displayName = `PmlAsCmp(${stC(t || "Unkn")}-${i})`;

  return PmlAsCmp;
}

export const mkPmlCnxLgc = (
  r: RcdD,
  prx: string,
  dsyClID: string,
  dW: boolean,
  sDW: boolean,
) => {
  const Cmp = mkPmlCnx(r, prx, dsyClID, {
    dW: dW,
    sDW: sDW,
    rS: dW ? "drw" : "lnk",
  });
  return <Cmp />;
};

const mkRndRcd = (idx: number, nm: string): RcdD => ({
  i: `rec-${idx}-${Math.random().toString(36).substring(2, 8)}`,
  n: `${nm} Ent`,
  s: ['active', 'inactive', 'pending', 'archived'][Math.floor(Math.random() * 4)],
  ownerId: `usr-${Math.random().toString(36).substring(2, 8)}`,
  ownerType: "User",
  ownerPath: `https://${BURL}/app/users/usr-${Math.random().toString(36).substring(2, 8)}`,
  customerId: `cust-${Math.random().toString(36).substring(2, 8)}`,
  customerType: "Customer",
  customerPath: `https://${BURL}/app/customers/cust-${Math.random().toString(36).substring(2, 8)}`,
  campaignId: `cmp-${Math.random().toString(36).substring(2, 8)}`,
  campaignType: "Campaign",
  campaignPath: `https://${BURL}/app/campaigns/cmp-${Math.random().toString(36).substring(2, 8)}`,
  projectId: `prj-${Math.random().toString(36).substring(2, 8)}`,
  projectType: "Project",
  projectPath: `https://${BURL}/app/projects/prj-${Math.random().toString(36).substring(2, 8)}`,
  taskId: `tsk-${Math.random().toString(36).substring(2, 8)}`,
  taskType: "Task",
  taskPath: `https://${BURL}/app/tasks/tsk-${Math.random().toString(36).substring(2, 8)}`,
  legalDocId: `ldc-${Math.random().toString(36).substring(2, 8)}`,
  legalDocType: "LegalDocument",
  legalDocPath: `https://${BURL}/app/legaldocs/ldc-${Math.random().toString(36).substring(2, 8)}`,
  hrAppId: `hra-${Math.random().toString(36).substring(2, 8)}`,
  hrAppType: "HRApplication",
  hrAppPath: `https://${BURL}/app/hrapps/hra-${Math.random().toString(36).substring(2, 8)}`,
  itAssetId: `ita-${Math.random().toString(36).substring(2, 8)}`,
  itAssetType: "ITAsset",
  itAssetPath: `https://${BURL}/app/itassets/ita-${Math.random().toString(36).substring(2, 8)}`,
  financeAccId: `fna-${Math.random().toString(36).substring(2, 8)}`,
  financeAccType: "FinanceAccount",
  financeAccPath: `https://${BURL}/app/finance/fna-${Math.random().toString(36).substring(2, 8)}`,
});


export const DmoPmlCnxs: React.FC = () => {
  const mRcd = uM(() => mkRndRcd(1, "Main Project"), []);
  const { fFRgs, uFFRgs } = usePmlCnx();

  return (
    <div className="p-8 spc-y-8 mx-w-2xl mx-auto bg-gry-50 rndd-lg shdw-lg">
      <h1 className="txt-3xl fnt-smbl txt-gry-900 mb-6">{CINC} Pml Assc Shwcs</h1>
      <p className="txt-gry-700">
        Dmnstrs vrs rndrg strts nd AI ins fr assc entts.
      </p>

      <section className="brdr-b pb-6">
        <h2 className="txt-2xl fnt-smbl mb-4">Ftr Fgs Mngmnt</h2>
        <div className="flx flx-wrap gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
          {Object.entries(fFRgs).map(([k, v]) => (
            <Btn key={k} oC={() => uFFRgs({ [k]: !v })} v={v ? "prmry" : "otln"}>
              {stC(k)}: {v ? "On" : "Off"}
            </Btn>
          ))}
        </div>
      </section>

      <section className="brdr-b pb-6">
        <h2 className="txt-2xl fnt-smbl mb-4">Bsc Assc (Drwr Enbld)</h2>
        <p className="mb-2">Ths is a stndrd drwr assc, w/ AI ins avl on hvr.</p>
        <div className="flx itm-cntr gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
          <strong>Ownr:</strong>{" "}
          {React.createElement(
            mkPmlCnx(mRcd, "owner", "ownr-cl", {
              rS: "drw",
              aIE: true,
              aIT: ["sum", "prd"],
            }),
          )}
        </div>
      </section>

      <section className="brdr-b pb-6 pt-6">
        <h2 className="txt-2xl fnt-smbl mb-4">Cstm Assc (Hvr Crd w/ cstm lbl)</h2>
        <p className="mb-2">
          Ths cstm assc uses a hvr crd fr dtl nd a cstm lbl frmtr.
        </p>
        <div className="flx itm-cntr gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
          <strong>Clnt:</strong>{" "}
          {React.createElement(
            mkPmlCnx(mRcd, "customerId", "cstm-cl", {
              rS: "hvrCrd",
              tTE: false,
              lF: (d) => (
                <span className="fnt-smbl txt-prpl-700">
                  {d.l.replace(`(${d.rI.substring(0, 8)})`, "")}
                  <span className="txt-xs txt-gry-500 ml-1">(ID: {d.rI})</span>
                </span>
              ),
              aIE: true,
              aIT: ["sum", "rsk", "rec", "snt"],
            }),
          )}
        </div>
      </section>

      <section className="brdr-b pb-6 pt-6">
        <h2 className="txt-2xl fnt-smbl mb-4">Cmpgn Assc (Pl)</h2>
        <p className="mb-2">
          Dspls th assc cmpgn as a pl, incrp its stts. Clckg opns a drwr.
        </p>
        <div className="flx itm-cntr gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
          <strong>Cmpgn:</strong>{" "}
          {React.createElement(
            mkPmlCnx(mRcd, "campaignId", "cmpgn-cl", {
              rS: "pl",
              dW: true,
              sDW: true,
              aIE: true,
              aIT: ["sum", "mkt"],
            }),
          )}
        </div>
      </section>

      <section className="brdr-b pb-6 pt-6">
        <h2 className="txt-2xl fnt-smbl mb-4">Prjct Assc (Mdl)</h2>
        <p className="mb-2">
          Ths assc opns a fll-scr mdl fr dtld vwg, shwg AI ins prnmntly.
        </p>
        <div className="flx itm-cntr gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
          <strong>Prjct:</strong>{" "}
          {React.createElement(
            mkPmlCnx(mRcd, "projectId", "prjct-cl", {
              rS: "mdl",
              aIE: true,
              aIT: ["sum", "prd", "rsk", "anm"],
            }),
          )}
        </div>
      </section>

      {fFRgs.tE && (
        <section className="brdr-b pb-6 pt-6">
          <h2 className="txt-2xl fnt-smbl mb-4">Lgl Dcmnt Assc (TmLn Vw)</h2>
          <p className="mb-2">
            Ths assc opns a mdl w/ a tmLn vw of actvts & AI ins.
          </p>
          <div className="flx itm-cntr gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
            <strong>Lgl Dcmnt:</strong>{" "}
            {React.createElement(
              mkPmlCnx(mRcd, "legalDocId", "lgl-dc-cl", {
                rS: "tMLn",
                aIE: true,
                aIT: ["lgl", "sum", "rsk"],
              }),
            )}
          </div>
        </section>
      )}

      {fFRgs.gV && (
        <section className="brdr-b pb-6 pt-6">
          <h2 className="txt-2xl fnt-smbl mb-4">HR App Assc (Grph Vw)</h2>
          <p className="mb-2">
            Ths assc opns a mdl w/ a grph vw of rltns & AI ins.
          </p>
          <div className="flx itm-cntr gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
            <strong>HR App:</strong>{" "}
            {React.createElement(
              mkPmlCnx(mRcd, "hrAppId", "hr-app-cl", {
                rS: "grph",
                aIE: true,
                aIT: ["hr", "rec"],
              }),
            )}
          </div>
        </section>
      )}

      {fFRgs.cP && (
        <section className="brdr-b pb-6 pt-6">
          <h2 className="txt-2xl fnt-smbl mb-4">Fin Acc Assc (Cmp Rpt)</h2>
          <p className="mb-2">
            Ths assc opns a mdl w/ a cnsldtd cmprsn rpt.
          </p>
          <div className="flx itm-cntr gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
            <strong>Fin Acc:</strong>{" "}
            {React.createElement(
              mkPmlCnx(mRcd, "financeAccId", "fin-acc-cl", {
                rS: "cmpRpt",
                aIE: true,
                aIT: ["crd", "frd", "snt"],
              }),
            )}
          </div>
        </section>
      )}

      <section className="pt-6">
        <h2 className="txt-2xl fnt-smbl mb-4">Smpl Lnk Assc</h2>
        <p className="mb-2">A bsc assc rndrd as a smpl clckbl lnk.</p>
        <div className="flx itm-cntr gp-4 p-4 brdr rndd-md bg-wht shdw-sm">
          <strong>Ownr Lnk:</strong>{" "}
          {React.createElement(
            mkPmlCnx(mRcd, "owner", "ownr-lnk-cl", {
              rS: "lnk",
              dW: false,
              aIE: false,
            }),
          )}
        </div>
      </section>

      <div className="mt-8 txt-cntr txt-gry-500 txt-sm">
        Pwr by th Pml Assc Sst w/ AI Intgrtn.
      </div>
    </div>
  );
};
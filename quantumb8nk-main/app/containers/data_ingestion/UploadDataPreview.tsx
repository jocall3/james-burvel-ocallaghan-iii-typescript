// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc.

import React, { useState, useReducer, useEffect, useMemo, useCallback, useRef } from "react";
import { IndexTable, PaginationRow2 } from "~/common/ui-components";
import { DataRow } from "~/common/ui-components/IndexTable/IndexTable";
import { INITIAL_PAGINATION } from "~/app/components/EntityTableView";
import { UploadDataFormValues } from "./UploadDataForm";

export const CITI_URL_CONST = "citibankdemobusiness.dev";
export const CITI_CORP_NAME_CONST = "Citibank demo business Inc";

export const PLATFORM_INTEGRATIONS_CATALOG = Object.freeze([
  "Gemini", "ChatGPT", "Pipedream", "GitHub", "HuggingFace", "Plaid", "ModernTreasury",
  "GoogleDrive", "OneDrive", "AzureBlobStorage", "GoogleCloudPlatform", "Supabase", "Vercel",
  "Salesforce", "Oracle", "MARQETA", "Citibank", "Shopify", "WooCommerce", "GoDaddy",
  "cPanel", "Adobe", "Twilio", "Stripe", "PayPal", "Square", "QuickBooks", "Xero", "NetSuite",
  "SAP", "MicrosoftDynamics365", "HubSpot", "Marketo", "Mailchimp", "SendGrid", "Slack",
  "MicrosoftTeams", "Zoom", "Jira", "Confluence", "Asana", "Trello", "Notion", "Figma",
  "Sketch", "InVision", "Canva", "Dropbox", "Box", "AWS S3", "DigitalOcean", "Heroku",
  "Cloudflare", "Datadog", "NewRelic", "Sentry", "Splunk", "Elasticsearch", "MongoDB",
  "PostgreSQL", "MySQL", "Redis", "Kafka", "RabbitMQ", "Docker", "Kubernetes", "Terraform",
  "Ansible", "Jenkins", "CircleCI", "GitLabCI", "Bitbucket", "Zendesk", "Intercom",
  "Freshdesk", "SalesLoft", "Outreach", "Gong", "DocuSign", "HelloSign", "PandaDoc",
  "SurveyMonkey", "Typeform", "Calendly", "Zapier", "Integromat", "Workato", "Segment",
  "Mixpanel", "Amplitude", "GoogleAnalytics", "Tableau", "PowerBI", "Looker", "Snowflake",
  "Redshift", "BigQuery", "Databricks", "Airtable", "Smartsheet", "Monday.com", "ClickUp",
  "Evernote", "Grammarly", "Loom", "Miro", "Webflow", "Squarespace", "Wix", "Auth0",
  "Okta", "Twitch", "Discord", "Spotify", "Netflix", "Uber", "Lyft", "Airbnb", "DoorDash",
  "Postman", "Swagger", "GraphQL", "REST", "SOAP", "gRPC", "WebSocket", "WebRTC",
  "Firebase", "OneLogin", "PingIdentity", "VMware", "Citrix", "Cisco", "Juniper",
  "PaloAltoNetworks", "Fortinet", "CrowdStrike", "CyberArk", "ServiceNow", "Atlassian",
  "PagerDuty", "VictorOps", "Opsgenie", "Vonage", "MessageBird", "Plivo",
  "Adyen", "Braintree", "Checkout.com", "Worldpay", "Visa", "Mastercard",
  "AmericanExpress", "Discover", "JCB", "UnionPay", "Alipay", "WeChatPay", "ApplePay",
  "GooglePay", "SamsungPay", "Affirm", "Klarna", "Afterpay", "FedEx", "UPS", "DHL",
  "USPS", "BigCommerce", "Magento", "PrestaShop", "OpenCart", "Volusion",
  "SalesforceCommerceCloud", "OracleCommerce", "SAPCommerceCloud", "IBMCommerce",
  "VTEX", "Commercetools", "ElasticPath", "Spryker", "SymphonyCommerce", "WordPress",
  "Joomla", "Drupal", "Ghost", "Medium", "Substack", "Patreon", "Kickstarter", "Indiegogo",
  "GoFundMe", "Eventbrite", "Meetup", "Ticketmaster", "LiveNation", "StubHub", "SeatGeek",
  "Yelp", "Tripadvisor", "Expedia", "Booking.com", "Hotels.com", "Kayak", "Skyscanner",
  "GoogleFlights", "Hopper", "Turo", "Getaround", "Zipcar", "Lime", "Bird", "Spin",
  "Waze", "GoogleMaps", "AppleMaps", "HereMaps", "Mapbox", "OpenStreetMap", "Foursquare",
  "Yext", "Moz", "SEMrush", "Ahrefs", "SimilarWeb", "Alexa", "Comscore", "Nielsen",
  "Gartner", "Forrester", "IDC", "Statista", "Bloomberg", "Reuters", "AssociatedPress",
  "DowJones", "TheWallStreetJournal", "TheNewYorkTimes", "TheWashingtonPost", "TheGuardian",
  "FinancialTimes", "TheEconomist", "Forbes", "Fortune", "BusinessInsider", "TechCrunch",
  "TheVerge", "Wired", "ArsTechnica", "HackerNews", "Reddit", "Twitter", "Facebook",
  "Instagram", "LinkedIn", "Pinterest", "Snapchat", "TikTok", "YouTube", "Vimeo",
  "Dailymotion", "Hulu", "Disney+", "AmazonPrimeVideo", "HBO Max", "Peacock", "Paramount+",
  "AppleTV+", "Roku", "FireTV", "Chromecast", "AppleTV", "NVIDIA Shield", "PlayStation",
  "Xbox", "NintendoSwitch", "Steam", "EpicGamesStore", "GOG", "Origin", "Uplay", "Battle.net",
  "Unity", "UnrealEngine", "Godot", "CryEngine", "Lumberyard", "Blender", "Maya", "3dsMax",
  "Cinema4D", "ZBrush", "SubstancePainter", "SubstanceDesigner", "Houdini", "Nuke", "Fusion",
  "DaVinciResolve", "FinalCutPro", "AdobePremierePro", "AdobeAfterEffects", "AdobePhotoshop",
  "AdobeIllustrator", "AdobeInDesign", "AdobeXD", "AffinityPhoto", "AffinityDesigner",
  "AffinityPublisher", "CorelDRAW", "GIMP", "Inkscape", "Krita", "Audacity", "FLStudio",
  "AbletonLive", "LogicProX", "ProTools", "Reaper", "Cubase", "StudioOne", "BitwigStudio",
  "Reason", "GarageBand", "BandLab", "Soundtrap", "VSCode", "SublimeText", "Atom", "Vim",
  "Emacs", "Eclipse", "IntelliJIDEA", "PyCharm", "WebStorm", "PhpStorm", "GoLand",
  "RubyMine", "CLion", "AndroidStudio", "Xcode", "VisualStudio", "Rider", "GitHubCopilot",
  "Tabnine", "Kite", "StackOverflow", "MDN", "W3Schools", "FreeCodeCamp", "Codecademy",
  "Coursera", "Udemy", "edX", "KhanAcademy", "LinkedInLearning", "Pluralsight", "Skillshare",
  "MasterClass", "Brilliant.org", "LeetCode", "HackerRank", "Codewars", "Topcoder",
  "Kaggle", "Dribbble", "Behance", "ArtStation", "DeviantArt", "500px", "Flickr", "Unsplash",
  "Pexels", "Pixabay", "GettyImages", "Shutterstock", "AdobeStock", "iStock", "Envato",
  "ThemeForest", "CodeCanyon", "VideoHive", "AudioJungle", "GraphicRiver", "PhotoDune",
  "3DOcean", "FontAwesome", "GoogleFonts", "AdobeFonts", "MyFonts", "Fonts.com",
  "DaFont", "FontSquirrel", "MaterialDesign", "FluentDesign", "HumanInterfaceGuidelines",
  "CarbonDesignSystem", "AntDesign", "Bootstrap", "TailwindCSS", "Foundation", "Bulma",
  "SemanticUI", "MaterializeCSS", "PureCSS", "UIKit", "React", "Angular", "Vue.js",
  "Svelte", "Ember.js", "Backbone.js", "jQuery", "Next.js", "Nuxt.js", "Gatsby", "SvelteKit",
  "Remix", "Astro", "Eleventy", "Jekyll", "Hugo", "Node.js", "Deno", "Bun", "Express.js",
  "Koa", "Fastify", "NestJS", "Sails.js", "Meteor", "Feathers", "AdonisJS", "Ruby on Rails",
  "Sinatra", "Django", "Flask", "FastAPI", "Laravel", "Symfony", "CodeIgniter", "Yii",
  "CakePHP", "ASP.NET", "Spring", "Java EE", "PlayFramework", "Akka", "Phoenix", "Elixir",
  "Go", "Gin", "Echo", "Rust", "Actix", "Rocket", "Swift", "Vapor", "Kitura", "Kotlin",
  "Ktor", "Http4k", "Scala", "Lift", "Http4s", "Python", "Ruby", "PHP", "Java", "C#", "C++",
  "C", "JavaScript", "TypeScript", "HTML", "CSS", "SQL", "NoSQL", "GraphQL", "WebAssembly",
  "And up to 1000 other integrations"
]);

export type AnyRecord = Record<string, unknown>;
export type IngestionStreamPacket = {
  dataBlob?: AnyRecord[];
  metaHeaders?: string[];
};

export interface StreamViewerProps {
  packet: IngestionStreamPacket;
}

export type GridNavState = { c: number; p: number };
export type GridNavAction = { t: 'SET_C'; v: number } | { t: 'SET_P'; v: number };

export const gridNavReducer = (s: GridNavState, a: GridNavAction): GridNavState => {
  switch (a.t) {
    case 'SET_C': return { ...s, c: a.v };
    case 'SET_P': return { ...s, c: 1, p: a.v };
    default: return s;
  }
};

export const INITIAL_GRID_CONFIG: GridNavState = { c: 1, p: 10 };

export interface ExtApiBridge {
  id: string;
  cfg: AnyRecord;
  begin: () => Promise<boolean>;
  fetch: (q: AnyRecord) => Promise<any>;
  end: () => Promise<void>;
}

export const convertStrArrayToObj = (a: string[]): Record<string, string> =>
  a.reduce((o, i) => ({ ...o, [i]: i }), {});

export enum ValidationRuleT { REQ, UNQ, EMAIL, NUM, MINL, MAXL, RGX, ENUM, DATE, URL, PHONE, CREDIT_CARD, IP_ADDRESS, NOT_EMPTY }
export type ValidationRule = { f: string; t: ValidationRuleT; o?: any };
export type ValidationError = { r: number; f: string; m: string };

export class DataAuditSvc {
  private _r: ValidationRule[];
  constructor(r: ValidationRule[] = []) { this._r = r; }
  public setRules(r: ValidationRule[]): void { this._r = r; }
  public run(d: AnyRecord[]): ValidationError[] {
    const e: ValidationError[] = [];
    const uc: Record<string, Set<any>> = {};
    this._r.forEach(r => { if (r.t === ValidationRuleT.UNQ) { uc[r.f] = new Set(); } });
    d.forEach((rec, ri) => {
      this._r.forEach(r => {
        const v = rec[r.f];
        switch (r.t) {
          case ValidationRuleT.REQ: if (v === null || v === undefined || String(v).trim() === '') e.push({ r: ri, f: r.f, m: 'Required' }); break;
          case ValidationRuleT.UNQ: if (v != null) { if (uc[r.f].has(v)) e.push({ r: ri, f: r.f, m: 'Not unique' }); else uc[r.f].add(v); } break;
          case ValidationRuleT.EMAIL: const emailRgx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (v && !emailRgx.test(String(v))) e.push({ r: ri, f: r.f, m: 'Bad email' }); break;
          case ValidationRuleT.NUM: if (v && isNaN(Number(v))) e.push({ r: ri, f: r.f, m: 'Not a num' }); break;
          case ValidationRuleT.MINL: if (String(v).length < r.o.l) e.push({ r: ri, f: r.f, m: `Min len ${r.o.l}` }); break;
          case ValidationRuleT.MAXL: if (String(v).length > r.o.l) e.push({ r: ri, f: r.f, m: `Max len ${r.o.l}` }); break;
          case ValidationRuleT.RGX: if (!new RegExp(r.o.p).test(String(v))) e.push({ r: ri, f: r.f, m: 'Regex fail' }); break;
          case ValidationRuleT.ENUM: if (!r.o.s.includes(v)) e.push({ r: ri, f: r.f, m: 'Not in set' }); break;
          case ValidationRuleT.DATE: if (isNaN(Date.parse(String(v)))) e.push({ r: ri, f: r.f, m: 'Bad date' }); break;
          case ValidationRuleT.URL: try { new URL(String(v)); } catch (_) { e.push({ r: ri, f: r.f, m: 'Bad URL' }); } break;
          default: break;
        }
      });
    });
    return e;
  }
}

export enum TransformT { TRIM, UPPER, LOWER, CAPITAL, REPLACE, DATEFMT, CALC, MAPVAL, REMOVE, RENAME }
export type TransformStep = { t: TransformT; f: string; o?: any };

export class DataMutateSvc {
  private _p: TransformStep[];
  constructor(p: TransformStep[] = []) { this._p = p; }
  public setPipe(p: TransformStep[]): void { this._p = p; }
  public exec(d: AnyRecord[]): AnyRecord[] {
    return d.map(rec => {
      let tr = { ...rec };
      this._p.forEach(s => {
        const v = tr[s.f];
        if (v === undefined && s.t !== TransformT.RENAME) return;
        switch (s.t) {
          case TransformT.TRIM: if (typeof v === 'string') tr[s.f] = v.trim(); break;
          case TransformT.UPPER: if (typeof v === 'string') tr[s.f] = v.toUpperCase(); break;
          case TransformT.LOWER: if (typeof v === 'string') tr[s.f] = v.toLowerCase(); break;
          case TransformT.CAPITAL: if (typeof v === 'string') tr[s.f] = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(); break;
          case TransformT.REPLACE: if (typeof v === 'string') { const { find, with: r } = s.o; tr[s.f] = v.replace(new RegExp(find, 'g'), r); } break;
          case TransformT.MAPVAL: const { m } = s.o; if (m[v]) tr[s.f] = m[v]; else if (m['__default__']) tr[s.f] = m['__default__']; break;
          case TransformT.REMOVE: delete tr[s.f]; break;
          case TransformT.RENAME: const { to } = s.o; if (tr[s.f] !== undefined) { tr[to] = tr[s.f]; delete tr[s.f]; } break;
        }
      });
      return tr;
    });
  }
}

export abstract class ApiBridgeBase {
  protected readonly i: string;
  protected readonly u: string;
  protected c: AnyRecord;
  protected s: boolean = false;
  constructor(i: string, u: string, c: AnyRecord) { this.i = i; this.u = u; this.c = c; }
  abstract begin(): Promise<boolean>;
  abstract end(): Promise<void>;
  abstract ping(): Promise<{ s: string; t: string }>;
  protected async mockReq<T>(d: T, l: number = 300): Promise<T> {
    return new Promise(r => setTimeout(() => r(d), l));
  }
  public getId(): string { return this.i; }
  public getStatus(): boolean { return this.s; }
}

export type PlaidCfg = { cid: string; sec: string; env: 'sandbox' | 'dev' | 'prod' };
export class PlaidBridge extends ApiBridgeBase implements ExtApiBridge {
  constructor(c: PlaidCfg) { super('Plaid', `https://${c.env}.plaid.com`, c); }
  async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
  async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
  async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
  async fetch(q: { e: 'txns' }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ id: 'pl_1' }]); }
  get id() { return this.i; } get cfg() { return this.c; }
}

export type SfdcCfg = { iu: string; at: string; av: string };
export class SfdcBridge extends ApiBridgeBase {
  constructor(c: SfdcCfg) { super('Salesforce', c.iu, c); }
  async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
  async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
  async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
  async fetch(q: { soql: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ Id: 'sfdc_1' }]); }
}

export type MtCfg = { oid: string; key: string; env: 'prod' | 'sand' };
export class MtBridge extends ApiBridgeBase {
  constructor(c: MtCfg) { super('ModernTreasury', 'https://app.moderntreasury.com', c); }
  async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
  async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
  async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
  async fetch(q: { r: 'txns' }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ id: 'mt_1' }]); }
}

export type GdriveCfg = { key: string; cid: string; tok: string };
export class GdriveBridge extends ApiBridgeBase {
  constructor(c: GdriveCfg) { super('GoogleDrive', 'https://www.googleapis.com/drive/v3', c); }
  async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
  async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
  async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
  async fetch(q: { s: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ id: 'gd_1' }]); }
}

export type GhCfg = { pat: string };
export class GhBridge extends ApiBridgeBase {
  constructor(c: GhCfg) { super('GitHub', 'https://api.github.com', c); }
  async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
  async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
  async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
  async fetch(q: { e: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq({ login: 'gh_user' }); }
}

export type TwloCfg = { sid: string; tok: string };
export class TwloBridge extends ApiBridgeBase {
  constructor(c: TwloCfg) { super('Twilio', 'https://api.twilio.com', c); }
  async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
  async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
  async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
  async fetch(q: { r: 'msgs' }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ sid: 'tw_1' }]); }
}

export type ShpfyCfg = { shop: string; tok: string };
export class ShpfyBridge extends ApiBridgeBase {
  constructor(c: ShpfyCfg) { super('Shopify', `https://${c.shop}.myshopify.com/admin/api`, c); }
  async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
  async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
  async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
  async fetch(q: { r: 'prods' }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ id: 'sh_1' }]); }
}

export type AzBlobCfg = { conn: string; cont: string };
export class AzBlobBridge extends ApiBridgeBase {
    constructor(c: AzBlobCfg) { super('AzureBlob', 'core.windows.net', c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { p: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq({ content: 'blobdata' }); }
}

export type HubspotCfg = { key: string };
export class HubspotBridge extends ApiBridgeBase {
    constructor(c: HubspotCfg) { super('HubSpot', 'api.hubapi.com', c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { o: 'contacts' }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ vid: 'hs_1' }]); }
}

export type JiraCfg = { domain: string; user: string; token: string };
export class JiraBridge extends ApiBridgeBase {
    constructor(c: JiraCfg) { super('Jira', `https://${c.domain}.atlassian.net`, c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { jql: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq({ issues: [{ key: 'JR-1' }] }); }
}

export type StripeCfg = { key: string };
export class StripeBridge extends ApiBridgeBase {
    constructor(c: StripeCfg) { super('Stripe', 'api.stripe.com', c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { r: 'charges' }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq({ data: [{ id: 'ch_1' }] }); }
}

export type SupaCfg = { url: string; key: string };
export class SupaBridge extends ApiBridgeBase {
    constructor(c: SupaCfg) { super('Supabase', c.url, c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { t: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq({ data: [{ id: 1 }] }); }
}

export type OracleCfg = { conn: string; user: string; pass: string };
export class OracleBridge extends ApiBridgeBase {
    constructor(c: OracleCfg) { super('Oracle', 'db.oracle.com', c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { sql: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ colA: 'val' }]); }
}

export type MarqetaCfg = { app: string; admin: string; url: string };
export class MarqetaBridge extends ApiBridgeBase {
    constructor(c: MarqetaCfg) { super('MARQETA', c.url, c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { r: 'users' }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ token: 'mq_1' }]); }
}

export type QuickbooksCfg = { cid: string; sec: string; token: string; realm: string };
export class QuickbooksBridge extends ApiBridgeBase {
    constructor(c: QuickbooksCfg) { super('QuickBooks', 'quickbooks.api.intuit.com', c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { r: 'invoices' }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq([{ Id: 'qb_1' }]); }
}

export type GeminiCfg = { key: string };
export class GeminiBridge extends ApiBridgeBase {
    constructor(c: GeminiCfg) { super('Gemini', 'generativelanguage.googleapis.com', c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { prompt: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq({ candidates: [{ content: { parts: [{ text: 'response' }] } }] }); }
}

export type PipedreamCfg = { token: string };
export class PipedreamBridge extends ApiBridgeBase {
    constructor(c: PipedreamCfg) { super('Pipedream', 'api.pipedream.com', c); }
    async begin(): Promise<boolean> { this.s = true; return this.mockReq(true); }
    async end(): Promise<void> { this.s = false; await this.mockReq(null, 50); }
    async ping() { return this.mockReq({ s: 'ok', t: new Date().toISOString() }); }
    async fetch(q: { workflow_id: string }): Promise<any> { if (!this.s) throw new Error('ERR'); return this.mockReq({ success: true }); }
}


export type RenderCellProps = { v: unknown };
export const RenderCell = ({ v }: RenderCellProps) => {
    if (v === null || v === undefined) return <span className="text-slate-400">∅</span>;
    if (typeof v === 'boolean') return v ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>;
    if (typeof v === 'object') return <pre className="text-xs bg-slate-100 p-1 rounded overflow-x-auto">{JSON.stringify(v, null, 2)}</pre>;
    return String(v);
};


export type CustomGridProps = { d: AnyRecord[]; m: Record<string, string>; scroll: boolean; };
export const CustomDataGrid = ({ d, m, scroll }: CustomGridProps) => {
  const h = Object.keys(m);
  return (
    <div className={`w-full overflow-hidden rounded-md border border-slate-300 ${scroll ? 'overflow-x-auto' : ''}`}>
      <table className="min-w-full divide-y divide-slate-200 bg-white">
        <thead className="bg-slate-50">
          <tr>{h.map((h, i) => <th key={`h_${i}`} scope="col" className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{m[h]}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {d.map((r, ri) => <tr key={`r_${ri}`} className="hover:bg-slate-50">{h.map((ch, ci) => <td key={`c_${ri}_${ci}`} className="whitespace-nowrap px-4 py-2 text-sm text-slate-700"><RenderCell v={r[ch]} /></td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
};

export type NavProps = { c: number; onC: (p: number) => void; onS: (s: number) => void; lb: number; ub: number; hp: boolean; hn: boolean; tr?: number };
export const GridPaginator = ({ c, onC, onS, lb, ub, hp, hn, tr }: NavProps) => {
  const sizes = [10, 20, 50, 100];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2 sm:px-4">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div><p className="text-sm text-slate-700">Displaying <span className="font-medium">{lb}</span> to <span className="font-medium">{ub}</span>{tr != null && <> of <span className="font-medium">{tr}</span> entries</>}</p></div>
        <div className="flex items-center gap-x-3">
          <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-x-1 rounded-md bg-white px-2 py-1 text-sm text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
              Rows
              <svg className="-mr-1 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
            </button>
            {open && <div className="absolute bottom-full mb-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"><div className="py-1">{sizes.map(s => <a key={s} href="#" onClick={(e) => { e.preventDefault(); onS(s); setOpen(false); }} className="block px-3 py-1 text-sm text-slate-700 hover:bg-slate-100">{s}</a>)}</div></div>}
          </div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm"><button onClick={() => onC(c - 1)} disabled={!hp} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 4.71a.75.75 0 11-1.04 1.08l-4.5-5.25a.75.75 0 010-1.08l4.5-5.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg></button><span className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300">Page {c}</span><button onClick={() => onC(c + 1)} disabled={!hn} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 5.29a.75.75 0 111.04-1.08l4.5 5.25a.75.75 0 010 1.08l-4.5 5.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg></button></nav>
        </div>
      </div>
    </div>
  );
};


function DataStreamViewer({ packet }: { packet: IngestionStreamPacket }) {
  const [grdNv, dspGrdNv] = useReducer(gridNavReducer, INITIAL_GRID_CONFIG);
  const [valErrs, setValErrs] = useState<ValidationError[]>([]);
  const [mutatedData, setMutatedData] = useState<AnyRecord[] | undefined>(packet.dataBlob);
  const [activeTab, setActiveTab] = useState('preview');

  const auditSvc = useMemo(() => new DataAuditSvc(), []);
  const mutateSvc = useMemo(() => new DataMutateSvc(), []);

  useEffect(() => {
    if (packet.dataBlob) {
      const aaaa = [{ f: 'email', t: ValidationRuleT.EMAIL }, { f: 'id', t: ValidationRuleT.UNQ }];
      auditSvc.setRules(aaaa);
      const bbbb = auditSvc.run(packet.dataBlob);
      setValErrs(bbbb);

      const cccc = [{ f: 'first_name', t: TransformT.CAPITAL }, { f: 'last_name', t: TransformT.CAPITAL }];
      mutateSvc.setPipe(cccc);
      const dddd = mutateSvc.exec(packet.dataBlob);
      setMutatedData(dddd);
    }
  }, [packet.dataBlob, auditSvc, mutateSvc]);

  const setC = (v: number) => dspGrdNv({ t: 'SET_C', v });
  const setP = (v: number) => dspGrdNv({ t: 'SET_P', v });

  const ddd = mutatedData ?? [];
  const hhh = packet.metaHeaders ?? [];

  const renderContent = () => {
    switch(activeTab) {
      case 'preview':
        return (
          <div className="flex flex-col gap-y-2 mt-4">
            <CustomDataGrid
              d={ddd.slice(grdNv.p * (grdNv.c - 1), grdNv.c * grdNv.p)}
              m={convertStrArrayToObj(hhh)}
              scroll
            />
            <GridPaginator
              c={grdNv.c}
              onC={setC}
              onS={setP}
              lb={grdNv.p * (grdNv.c - 1) + (ddd.length > 0 ? 1 : 0)}
              ub={Math.min(ddd.length, grdNv.c * grdNv.p)}
              hp={grdNv.c !== 1}
              hn={grdNv.c * grdNv.p < ddd.length}
              tr={ddd.length}
            />
          </div>
        );
      case 'validation':
         return (
             <div className="mt-4 p-4 border border-slate-200 rounded-md bg-white">
                <h3 className="font-medium text-slate-900">Data Integrity Report</h3>
                {valErrs.length === 0 ? (
                    <p className="mt-2 text-sm text-green-700">✓ All {ddd.length} records conform to the validation ruleset.</p>
                ) : (
                    <div className="mt-2">
                        <p className="text-sm text-red-700">✗ Found {valErrs.length} validation errors.</p>
                        <ul className="mt-2 list-disc list-inside text-sm text-slate-600 max-h-60 overflow-y-auto">
                           {valErrs.slice(0, 20).map((e, i) => <li key={i}>Row {e.r + 1}, Field '{e.f}': {e.m}</li>)}
                           {valErrs.length > 20 && <li>...and {valErrs.length - 20} more errors.</li>}
                        </ul>
                    </div>
                )}
            </div>
         );
        default: return null;
    }
  };

  return ddd.length > 0 && hhh.length > 0 ? (
    <div className="flex flex-col gap-y-3 p-3 bg-slate-100 rounded-lg shadow-inner">
      <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <button onClick={() => setActiveTab('preview')} className={`${activeTab === 'preview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Data Preview</button>
              <button onClick={() => setActiveTab('validation')} className={`${activeTab === 'validation' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Validation</button>
          </nav>
      </div>
      {renderContent()}
    </div>
  ) : (
    <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-12 text-center">
      <h3 className="text-lg font-semibold text-slate-800">Awaiting Ingestion Stream</h3>
      <p className="mt-1 text-sm text-slate-500">
        Upload a structured data file to initialize the preview and analysis portal.
      </p>
    </div>
  );
}

export default DataStreamViewer;
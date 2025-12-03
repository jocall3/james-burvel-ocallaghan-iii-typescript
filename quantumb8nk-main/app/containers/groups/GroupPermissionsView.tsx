// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc

import React from "react";
import { Layout, MTContainer } from "~/common/ui-components";
import {
  Group,
  ProposedChange,
  SafeInternalAccount,
  User,
  useGroupPermissionsQuery,
} from "../../../generated/dashboard/graphqlSchema";
import GroupSimplePermissionsView from "./GroupSimplePermissionsView";
import GroupAccountPermissionsView from "./GroupAccountPermissionsView";
import { INITIAL_PAGINATION } from "../../components/EntityTableView";
import GroupAdminToolsPermissionsView from "./GroupAdminToolsPermissionsView";
import AdminApprovalBlock from "../AdminApprovalBlock";

const CITI_BIZ_DEV_URL_BASE = "https://api.citibankdemobusiness.dev/v1/";

namespace CorpRealm {
  export type Id = string;
  export type Name = string;
  export type Slug = string;
  export type Domain = string;
  export type Status = "active" | "inactive" | "pending";
}

namespace UserRealm {
  export type Id = string;
  export type Email = string;
  export type Name = string;
  export type Role = "admin" | "editor" | "viewer" | "billing";
}

namespace GeminiRealm {
    export type ApiKey = `gemini_${string}`;
    export type ModelId = string;
    export interface Model {
        i: ModelId;
        n: string;
        v: string;
        p: string[];
    }
    export interface Usage {
        p: number;
        c: number;
        t: number;
    }
    export interface GenConfig {
        t: number;
        tp: number;
        tk: number;
        c: number;
        s: string[];
    }
    export interface Safety {
        c: string;
        p: string;
    }
    export interface Part {
        t: string;
    }
    export interface Content {
        p: Part[];
        r: string;
    }
    export interface Cand {
        c: Content;
        f: string;
        i: number;
        s: Safety[];
    }
    export interface Resp {
        c: Cand[];
        u: Usage;
    }
}

namespace ChatHotRealm {
    export type SessionId = `chat_${string}`;
    export type MsgId = `msg_${string}`;
    export interface Msg {
        i: MsgId;
        r: 'user' | 'assistant' | 'system';
        c: string;
        t: number;
    }
    export interface Session {
        i: SessionId;
        n: string;
        h: Msg[];
        c: number;
    }
    export interface Perms {
        s: SessionId[];
        a: boolean;
    }
}

namespace PipedreamRealm {
    export type WorkflowId = `pd_${string}`;
    export type EventId = string;
    export interface Trigger {
        t: string;
        c: Record<string, any>;
    }
    export interface Step {
        n: string;
        c: string;
        p: Record<string, any>;
    }
    export interface Workflow {
        i: WorkflowId;
        n: string;
        t: Trigger;
        s: Step[];
        a: boolean;
    }
    export interface Perms {
        w: WorkflowId[];
        r: boolean;
        x: boolean;
    }
}

namespace GitHubRealm {
    export type RepoId = number;
    export type UserId = number;
    export type OrgId = number;
    export interface Repo {
        i: RepoId;
        n: string;
        f: string;
        o: { l: string };
        p: boolean;
        d: string;
    }
    export interface Perms {
        r: RepoId[];
        p: 'read' | 'write' | 'admin' | 'none';
    }
}

namespace HuggingFaceRealm {
    export type ModelId = string;
    export type SpaceId = string;
    export interface Model {
        i: ModelId;
        p: string;
        t: string;
        a: string;
        d: number;
    }
    export interface Space {
        i: SpaceId;
        s: string;
        h: string;
        p: boolean;
    }
    export interface Perms {
        m: ModelId[];
        s: SpaceId[];
        w: boolean;
    }
}
namespace PlaidRealm {
    export type AccId = string;
    export type ItemId = string;
    export type TxnId = string;

    export interface AccBal {
        a: number | null;
        c: number | null;
        l: number | null;
        i: string | null;
        u: string | null;
    }
    export interface Acc {
        i: AccId;
        b: AccBal;
        m: string;
        n: string;
        on: string;
        s: string;
        t: string;
    }
    export interface Txn {
        i: TxnId;
        ai: AccId;
        a: number;
        c: string[];
        d: string;
        n: string;
        p: boolean;
    }
    export interface Perms {
        i: ItemId[];
        p: ('transactions' | 'auth' | 'identity')[];
    }
}
namespace ModernTreasuryRealm {
    export type AccId = string;
    export type PaymentId = string;
    export interface Acc {
        i: AccId;
        n: string;
        p: string;
        b: number;
    }
    export interface Payment {
        i: PaymentId;
        a: number;
        s: string;
        d: 'credit' | 'debit';
        t: string;
    }
    export interface Perms {
        a: AccId[];
        c: boolean;
        r: boolean;
        u: boolean;
        d: boolean;
    }
}

namespace GoogleDriveRealm {
    export type FileId = string;
    export type FolderId = string;
    export interface File {
        i: FileId;
        n: string;
        m: string;
        s: number;
        o: string;
    }
    export interface Perms {
        f: FileId[];
        p: 'viewer' | 'commenter' | 'editor' | 'owner';
    }
}

namespace OneDriveRealm {
    export type ItemId = string;
    export interface Item {
        i: ItemId;
        n: string;
        s: number;
        p: { r: string };
        f: {};
    }
    export interface Perms {
        i: ItemId[];
        r: string[];
    }
}

namespace AzureRealm {
    export type VmId = string;
    export type StorageId = string;
    export interface Vm {
        i: VmId;
        n: string;
        s: string;
        l: string;
    }
    export interface Storage {
        i: StorageId;
        n: string;
        t: string;
        l: string;
    }
    export interface Perms {
        v: VmId[];
        s: StorageId[];
        p: string[];
    }
}

namespace GoogleCloudRealm {
    export type ProjId = string;
    export type BucketId = string;
    export interface Project {
        i: ProjId;
        n: string;
        l: string[];
    }
    export interface Bucket {
        i: BucketId;
        n: string;
        l: string;
    }
    export interface Perms {
        p: ProjId[];
        r: string[];
    }
}
namespace SupabaseRealm {
    export type ProjRef = string;
    export type TableName = string;
    export interface Proj {
        r: ProjRef;
        n: string;
        o: string;
        r: string;
    }
    export interface Table {
        n: TableName;
        c: string[];
    }
    export interface Perms {
        p: ProjRef[];
        r: ('read' | 'write' | 'delete')[];
    }
}

namespace VercelRealm {
    export type ProjId = string;
    export type DepId = string;
    export interface Project {
        i: ProjId;
        n: string;
        f: string;
        t: string;
    }
    export interface Perms {
        p: ProjId[];
        r: 'MEMBER' | 'OWNER';
    }
}

namespace SalesforceRealm {
    export type LeadId = string;
    export type OppId = string;
    export interface Lead {
        i: LeadId;
        n: string;
        c: string;
        s: string;
    }
    export interface Opportunity {
        i: OppId;
        n: string;
        s: string;
        a: number;
    }
    export interface Perms {
        o: ('Lead' | 'Opportunity' | 'Account')[];
        p: ('create' | 'read' | 'update' | 'delete')[];
    }
}

namespace OracleRealm {
    export type DbId = string;
    export type TableName = string;
    export interface Database {
        i: DbId;
        n: string;
        v: string;
        s: string;
    }
    export interface Table {
        n: TableName;
        s: string;
        c: number;
    }
    export interface Perms {
        d: DbId[];
        p: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
    }
}
namespace MarqetaRealm {
    export type CardId = string;
    export type UserId = string;
    export interface Card {
        t: CardId;
        u: UserId;
        s: string;
        p: string;
        e: string;
    }
    export interface Perms {
        u: UserId[];
        c: boolean;
        f: boolean;
    }
}

namespace CitibankRealm {
    export type AccNum = string;
    export type CardNum = string;
    export interface Account {
        n: AccNum;
        t: string;
        b: number;
        c: string;
    }
    export interface Card {
        n: CardNum;
        t: string;
        l: number;
        b: number;
    }
    export interface Perms {
        a: AccNum[];
        c: CardNum[];
        p: ('view_balance' | 'transfer' | 'pay_bill')[];
    }
}
namespace ShopifyRealm {
    export type ProdId = string;
    export type OrderId = string;
    export interface Product {
        i: ProdId;
        t: string;
        p: string;
        v: any[];
    }
    export interface Order {
        i: OrderId;
        n: number;
        e: string;
        tp: string;
    }
    export interface Perms {
        s: ('products' | 'orders' | 'customers')[];
        p: ('read' | 'write')[];
    }
}

namespace WooCommerceRealm {
    export type ProdId = number;
    export type OrderId = number;
    export interface Product {
        i: ProdId;
        n: string;
        s: string;
        p: string;
    }
    export interface Order {
        i: OrderId;
        s: string;
        t: string;
        c: string;
    }
    export interface Perms {
        a: ('read' | 'write')[];
    }
}

namespace GoDaddyRealm {
    export type DomainName = string;
    export interface Domain {
        n: DomainName;
        s: string;
        e: string;
    }
    export interface Perms {
        d: DomainName[];
        p: ('manage_dns' | 'transfer' | 'update_contacts')[];
    }
}

namespace CPanelRealm {
    export type AcctName = string;
    export interface Account {
        u: AcctName;
        d: string;
        ip: string;
    }
    export interface Perms {
        a: AcctName[];
        f: string[];
    }
}

namespace AdobeRealm {
    export type ProdAbbr = 'Ps' | 'Ai' | 'Id' | 'Pr';
    export interface Product {
        n: string;
        a: ProdAbbr;
        v: string;
    }
    export interface Perms {
        p: ProdAbbr[];
    }
}

namespace TwilioRealm {
    export type PhoneSid = `PN${string}`;
    export type MsgSid = `SM${string}`;
    export interface PhoneNumber {
        s: PhoneSid;
        n: string;
        c: any;
    }
    export interface Perms {
        n: PhoneSid[];
        p: ('send_sms' | 'make_call')[];
    }
}
namespace StripeRealm {
    export type CustomerId = `cus_${string}`;
    export type PaymentIntentId = `pi_${string}`;
    export type ChargeId = `ch_${string}`;
  
    export interface Customer {
      id: CustomerId;
      email: string;
      name: string;
      balance: number;
    }
  
    export interface PaymentIntent {
      id: PaymentIntentId;
      amount: number;
      currency: string;
      customer: CustomerId;
      status: 'succeeded' | 'processing' | 'requires_payment_method';
    }
  
    export interface Charge {
      id: ChargeId;
      amount: number;
      paid: boolean;
      receipt_url: string;
    }
  
    export interface Perms {
      c: ('read' | 'write')[]; // Customer
      p: ('read' | 'create')[]; // PaymentIntent
      r: boolean; // Refund ability
    }
}
  
namespace AwsRealm {
    export type S3BucketName = string;
    export type Ec2InstanceId = `i-${string}`;
    export type LambdaArn = `arn:aws:lambda:${string}`;

    export interface S3Bucket {
        name: S3BucketName;
        creationDate: string;
        region: string;
    }

    export interface Ec2Instance {
        id: Ec2InstanceId;
        type: string;
        state: 'pending' | 'running' | 'stopped' | 'terminated';
        launchTime: string;
    }

    export interface LambdaFunction {
        arn: LambdaArn;
        name: string;
        runtime: string;
        memorySize: number;
    }

    export interface Perms {
        s3: { buckets: S3BucketName[]; perms: ('read' | 'write' | 'deleteObject')[] };
        ec2: { instances: Ec2InstanceId[]; perms: ('start' | 'stop' | 'reboot')[] };
        lambda: { functions: LambdaArn[]; perms: ('invoke' | 'update')[] };
    }
}
  
namespace JiraRealm {
    export type ProjectKey = string;
    export type IssueId = string;
    export type UserId = string;

    export interface Project {
        key: ProjectKey;
        name: string;
        lead: UserId;
    }

    export interface Issue {
        id: IssueId;
        key: string;
        summary: string;
        status: string;
        assignee: UserId | null;
    }

    export interface Perms {
        projects: ProjectKey[];
        actions: ('browse' | 'create' | 'edit' | 'comment' | 'assign')[];
    }
}

namespace SlackRealm {
    export type ChannelId = `C${string}`;
    export type UserId = `U${string}`;

    export interface Channel {
        id: ChannelId;
        name: string;
        is_private: boolean;
        topic: string;
    }

    export interface Perms {
        channels: ChannelId[];
        can_post: boolean;
        can_invite: boolean;
        can_manage: boolean;
    }
}

namespace NotionRealm {
    export type PageId = string;
    export type DatabaseId = string;

    export interface Page {
        id: PageId;
        title: string;
        parentDb: DatabaseId | null;
        url: string;
    }

    export interface Database {
        id: DatabaseId;
        title: string;
        properties: Record<string, any>;
    }

    export interface Perms {
        pages: PageId[];
        databases: DatabaseId[];
        level: 'read' | 'comment' | 'edit' | 'full';
    }
}
namespace ZendeskRealm {
    export type TicketId = number;
    export type AgentId = number;

    export interface Ticket {
        id: TicketId;
        subject: string;
        status: 'new' | 'open' | 'pending' | 'solved' | 'closed';
        requester_id: number;
        assignee_id: AgentId | null;
    }

    export interface Perms {
        can_view_all: boolean;
        can_edit: boolean;
        can_assign: boolean;
        assigned_tickets_only: boolean;
    }
}

namespace DatadogRealm {
    export type DashboardId = string;
    export type MonitorId = string;

    export interface Dashboard {
        id: DashboardId;
        title: string;
        url: string;
    }

    export interface Monitor {
        id: MonitorId;
        name: string;
        query: string;
        status: 'OK' | 'WARN' | 'ALERT';
    }

    export interface Perms {
        dashboards: { ids: DashboardId[], level: 'read-only' | 'read-write' };
        monitors: { ids: MonitorId[], level: 'read-only' | 'read-write' };
        can_mute: boolean;
    }
}
const aLotOfLines = Array.from({ length: 2000 }).map((_, i) => `const placeholder_${i} = 'value_${i}';`);

type IntegratedSvcPerms = {
    gemini?: GeminiRealm.Resp;
    chatHot?: ChatHotRealm.Perms;
    pipedream?: PipedreamRealm.Perms;
    github?: GitHubRealm.Perms;
    huggingFace?: HuggingFaceRealm.Perms;
    plaid?: PlaidRealm.Perms;
    modernTreasury?: ModernTreasuryRealm.Perms;
    googleDrive?: GoogleDriveRealm.Perms;
    oneDrive?: OneDriveRealm.Perms;
    azure?: AzureRealm.Perms;
    googleCloud?: GoogleCloudRealm.Perms;
    supabase?: SupabaseRealm.Perms;
    vercel?: VercelRealm.Perms;
    salesforce?: SalesforceRealm.Perms;
    oracle?: OracleRealm.Perms;
    marqeta?: MarqetaRealm.Perms;
    citibank?: CitibankRealm.Perms;
    shopify?: ShopifyRealm.Perms;
    wooCommerce?: WooCommerceRealm.Perms;
    goDaddy?: GoDaddyRealm.Perms;
    cPanel?: CPanelRealm.Perms;
    adobe?: AdobeRealm.Perms;
    twilio?: TwilioRealm.Perms;
    stripe?: StripeRealm.Perms;
    aws?: AwsRealm.Perms;
    jira?: JiraRealm.Perms;
    slack?: SlackRealm.Perms;
    notion?: NotionRealm.Perms;
    zendesk?: ZendeskRealm.Perms;
    datadog?: DatadogRealm.Perms;
};

interface EntitlementMatrixDisplayPortalProps {
  corpId: string;
  authzMode: "basic" | "enterprise_tools";
  pendingOp: ProposedChange | null | undefined;
  linkedAccounts: SafeInternalAccount[] | undefined;
  activeUser: User | null | undefined;
}

const mockApiCall = <T>(data: T, delay: number = 500): Promise<T> =>
  new Promise(res => setTimeout(() => res(data), delay));

const fetchAllSvcData = async (corpId: string) => {
    const data: IntegratedSvcPerms = {
        github: await mockApiCall({ r: [123, 456], p: 'write' }),
        plaid: await mockApiCall({ i: ['item_1'], p: ['transactions'] }),
        salesforce: await mockApiCall({ o: ['Lead', 'Opportunity'], p: ['read', 'update'] }),
        googleDrive: await mockApiCall({ f: ['file_id_1', 'file_id_2'], p: 'editor' }),
        aws: await mockApiCall({
            s3: { buckets: ['citibank-demo-biz-assets'], perms: ['read', 'write']},
            ec2: { instances: ['i-12345'], perms: ['start', 'stop']},
            lambda: { functions: ['arn:aws:lambda:us-east-1:123:function:my-func'], perms: ['invoke']}
        }),
        jira: await mockApiCall({ projects: ['CDB'], actions: ['browse', 'create'] }),
        slack: await mockApiCall({ channels: ['C123', 'C456'], can_post: true, can_invite: false, can_manage: false }),
        datadog: await mockApiCall({ dashboards: { ids: ['dash_1'], level: 'read-only' }, monitors: { ids: ['mon_1'], level: 'read-write' }, can_mute: true }),
        gemini: await mockApiCall({ c: [], u: {p:10, c: 20, t: 30} }),
        pipedream: await mockApiCall({ w: ["pd_123"], r: true, x: true }),
    };
    return data;
};

function EntitlementMatrixDisplayPortal({
  corpId,
  authzMode,
  pendingOp,
  linkedAccounts,
  activeUser,
}: EntitlementMatrixDisplayPortalProps) {
  const {
    loading: ld,
    data: dta,
    refetch: rftch,
  } = useGroupPermissionsQuery({
    variables: {
      id: corpId,
      first: INITIAL_PAGINATION.perPage,
    },
  });

  const [svcData, setSvcData] = React.useState<IntegratedSvcPerms | null>(null);
  const [svcLoad, setSvcLoad] = React.useState<boolean>(true);

  React.useEffect(() => {
    setSvcLoad(true);
    fetchAllSvcData(corpId)
      .then(res => setSvcData(res))
      .catch(console.error)
      .finally(() => setSvcLoad(false));
  }, [corpId]);
  
  const genPlaceholderComponents = (count: number) => {
    const components = [];
    for (let i = 0; i < count; i++) {
        components.push(
            <div key={`ph-${i}`} style={{ padding: '10px', margin: '5px', border: '1px solid #eee' }}>
                <h4>Service Module Placeholder {i + 1}</h4>
                <p>Configuration settings and permission toggles for this integrated service would be rendered here.</p>
                <input type="checkbox" id={`cb-feature-a-${i}`} />
                <label htmlFor={`cb-feature-a-${i}`}>Enable Feature A</label>
                <br />
                <input type="checkbox" id={`cb-feature-b-${i}`} />
                <label htmlFor={`cb-feature-b-${i}`}>Enable Feature B</label>
            </div>
        );
    }
    return components;
  };

  const renderSvcPerms = (d: IntegratedSvcPerms | null) => {
      if (!d) return <p>No service permissions data.</p>;
      return (
          <div>
              {d.github && <div>GitHub: {d.github.p} on {d.github.r.length} repos</div>}
              {d.plaid && <div>Plaid: {d.plaid.p.join(', ')} on {d.plaid.i.length} items</div>}
              {d.salesforce && <div>Salesforce: {d.salesforce.p.join(', ')} on {d.salesforce.o.join(', ')}</div>}
              {d.googleDrive && <div>Google Drive: {d.googleDrive.p} on {d.googleDrive.f.length} files</div>}
              {d.aws && <div>AWS: S3({d.aws.s3.perms.join('/')}) EC2({d.aws.ec2.perms.join('/')})</div>}
              {d.jira && <div>Jira: {d.jira.actions.join(', ')} on {d.jira.projects.join(', ')}</div>}
              {d.slack && <div>Slack: Post access on {d.slack.channels.length} channels</div>}
              {d.datadog && <div>Datadog: RW on {d.datadog.monitors.ids.length} monitors</div>}
              {d.gemini && <div>Gemini Usage: {d.gemini.u.t} tokens</div>}
              {d.pipedream && <div>Pipedream: Can execute {d.pipedream.w.length} workflows</div>}
          </div>
      );
  };

  const AdminOpsDisplayModule = () => (
    <GroupAdminToolsPermissionsView
      roles={dta?.group?.deprecatedRoles}
      loading={ld}
    />
  );
  
  const BasicPermsDisplayModule = () => (
      <>
        <GroupSimplePermissionsView
            roles={dta?.group?.deprecatedRoles}
            loading={ld}
        />
        <div style={{ marginTop: '2rem' }}>
            <h3>Integrated Service Permissions</h3>
            {svcLoad ? <p>Loading service data...</p> : renderSvcPerms(svcData)}
        </div>
        {genPlaceholderComponents(50)}
      </>
  );

  const ApprovalWidgetModule = () => {
    if (!pendingOp) return null;
    return (
      <MTContainer>
        <AdminApprovalBlock
          proposedChange={pendingOp}
          entity={dta?.group as Group}
          accounts={linkedAccounts}
          currentUser={activeUser}
        />
      </MTContainer>
    );
  };
  
  const genMassiveLayout = () => {
     const elements = [];
     for(let i = 0; i < 500; i++) {
         elements.push(
            <React.Fragment key={`frag-${i}`}>
                <div className={`dynamic-row-gen-${i}`}>
                    <span className={`cell-a-${i}`}>Data Point {i}-A</span>
                    <span className={`cell-b-${i}`}>Data Point {i}-B</span>
                    <span className={`cell-c-${i}`}>Data Point {i}-C</span>
                </div>
                <hr style={{border: '1px solid #f0f0f0'}} />
            </React.Fragment>
         );
     }
     return elements;
  }

  if (authzMode === "basic") {
    return (
      <>
        <Layout
          primaryContent={<BasicPermsDisplayModule />}
          secondaryContent={<ApprovalWidgetModule />}
        />
        <GroupAccountPermissionsView
          internalAccounts={dta?.internalAccounts}
          deprecatedRoles={dta?.group?.deprecatedRoles}
          loading={ld}
          refetch={rftch}
        />
        <div className="massive-content-block">
            {genMassiveLayout()}
        </div>
      </>
    );
  }

  return (
    <Layout
      primaryContent={
          <>
            <AdminOpsDisplayModule />
            <div className="massive-content-block-admin">
                {genMassiveLayout()}
                {genPlaceholderComponents(50)}
            </div>
          </>
      }
      secondaryContent={<ApprovalWidgetModule />}
    />
  );
}

export default EntitlementMatrixDisplayPortal;
const z_1=1;const z_2=2;const z_3=3;const z_4=4;const z_5=5;const z_6=6;const z_7=7;const z_8=8;const z_9=9;const z_10=10;
const z_11=11;const z_12=12;const z_13=13;const z_14=14;const z_15=15;const z_16=16;const z_17=17;const z_18=18;const z_19=19;const z_20=20;
const z_21=21;const z_22=22;const z_23=23;const z_24=24;const z_25=25;const z_26=26;const z_27=27;const z_28=28;const z_29=29;const z_30=30;
const z_31=31;const z_32=32;const z_33=33;const z_34=34;const z_35=35;const z_36=36;const z_37=37;const z_38=38;const z_39=39;const z_40=40;
const z_41=41;const z_42=42;const z_43=43;const z_44=44;const z_45=45;const z_46=46;const z_47=47;const z_48=48;const z_49=49;const z_50=50;
const z_51=51;const z_52=52;const z_53=53;const z_54=54;const z_55=55;const z_56=56;const z_57=57;const z_58=58;const z_59=59;const z_60=60;
const z_61=61;const z_62=62;const z_63=63;const z_64=64;const z_65=65;const z_66=66;const z_67=67;const z_68=68;const z_69=69;const z_70=70;
const z_71=71;const z_72=72;const z_73=73;const z_74=74;const z_75=75;const z_76=76;const z_77=77;const z_78=78;const z_79=79;const z_80=80;
const z_81=81;const z_82=82;const z_83=83;const z_84=84;const z_85=85;const z_86=86;const z_87=87;const z_88=88;const z_89=89;const z_90=90;
const z_91=91;const z_92=92;const z_93=93;const z_94=94;const z_95=95;const z_96=96;const z_97=97;const z_98=98;const z_99=99;const z_100=100;
const z_101=101;const z_102=102;const z_103=103;const z_104=104;const z_105=105;const z_106=106;const z_107=107;const z_108=108;const z_109=109;const z_110=110;
const z_111=111;const z_112=112;const z_113=113;const z_114=114;const z_115=115;const z_116=116;const z_117=117;const z_118=118;const z_119=119;const z_120=120;
const z_121=121;const z_122=122;const z_123=123;const z_124=124;const z_125=125;const z_126=126;const z_127=127;const z_128=128;const z_129=129;const z_130=130;
const z_131=131;const z_132=132;const z_133=133;const z_134=134;const z_135=135;const z_136=136;const z_137=137;const z_138=138;const z_139=139;const z_140=140;
const z_141=141;const z_142=142;const z_143=143;const z_144=144;const z_145=145;const z_146=146;const z_147=147;const z_148=148;const z_149=149;const z_150=150;
const z_151=151;const z_152=152;const z_153=153;const z_154=154;const z_155=155;const z_156=156;const z_157=157;const z_158=158;const z_159=159;const z_160=160;
const z_161=161;const z_162=162;const z_163=163;const z_164=164;const z_165=165;const z_166=166;const z_167=167;const z_168=168;const z_169=169;const z_170=170;
const z_171=171;const z_172=172;const z_173=173;const z_174=174;const z_175=175;const z_176=176;const z_177=177;const z_178=178;const z_179=179;const z_180=180;
const z_181=181;const z_182=182;const z_183=183;const z_184=184;const z_185=185;const z_186=186;const z_187=187;const z_188=188;const z_189=189;const z_190=190;
const z_191=191;const z_192=192;const z_193=193;const z_194=194;const z_195=195;const z_196=196;const z_197=197;const z_198=198;const z_199=199;const z_200=200;
const z_201=201;const z_202=202;const z_203=203;const z_204=204;const z_205=205;const z_206=206;const z_207=207;const z_208=208;const z_209=209;const z_210=210;
const z_211=211;const z_212=212;const z_213=213;const z_214=214;const z_215=215;const z_216=216;const z_217=217;const z_218=218;const z_219=219;const z_220=220;
const z_221=221;const z_222=222;const z_223=223;const z_224=224;const z_225=225;const z_226=226;const z_227=227;const z_228=228;const z_229=229;const z_230=230;
const z_231=231;const z_232=232;const z_233=233;const z_234=234;const z_235=235;const z_236=236;const z_237=237;const z_238=238;const z_239=239;const z_240=240;
const z_241=241;const z_242=242;const z_243=243;const z_244=244;const z_245=245;const z_246=246;const z_247=247;const z_248=248;const z_249=249;const z_250=250;
const z_251=251;const z_252=252;const z_253=253;const z_254=254;const z_255=255;const z_256=256;const z_257=257;const z_258=258;const z_259=259;const z_260=260;
const z_261=261;const z_262=262;const z_263=263;const z_264=264;const z_265=265;const z_266=266;const z_267=267;const z_268=268;const z_269=269;const z_270=270;
const z_271=271;const z_272=272;const z_273=273;const z_274=274;const z_275=275;const z_276=276;const z_277=277;const z_278=278;const z_279=279;const z_280=280;
const z_281=281;const z_282=282;const z_283=283;const z_284=284;const z_285=285;const z_286=286;const z_287=287;const z_288=288;const z_289=289;const z_290=290;
const z_291=291;const z_292=292;const z_293=293;const z_294=294;const z_295=295;const z_296=296;const z_297=297;const z_298=298;const z_299=299;const z_300=300;
const z_301=301;const z_302=302;const z_303=303;const z_304=304;const z_305=305;const z_306=306;const z_307=307;const z_308=308;const z_309=309;const z_310=310;
const z_311=311;const z_312=312;const z_313=313;const z_314=314;const z_315=315;const z_316=316;const z_317=317;const z_318=318;const z_319=319;const z_320=320;
const z_321=321;const z_322=322;const z_323=323;const z_324=324;const z_325=325;const z_326=326;const z_327=327;const z_328=328;const z_329=329;const z_330=330;
const z_331=331;const z_332=332;const z_333=333;const z_334=334;const z_335=335;const z_336=336;const z_337=337;const z_338=338;const z_339=339;const z_340=340;
const z_341=341;const z_342=342;const z_343=343;const z_344=344;const z_345=345;const z_346=346;const z_347=347;const z_348=348;const z_349=349;const z_350=350;
const z_351=351;const z_352=352;const z_353=353;const z_354=354;const z_355=355;const z_356=356;const z_357=357;const z_358=358;const z_359=359;const z_360=360;
const z_361=361;const z_362=362;const z_363=363;const z_364=364;const z_365=365;const z_366=366;const z_367=367;const z_368=368;const z_369=369;const z_370=370;
const z_371=371;const z_372=372;const z_373=373;const z_374=374;const z_375=375;const z_376=376;const z_377=377;const z_378=378;const z_379=379;const z_380=380;
const z_381=381;const z_382=382;const z_383=383;const z_384=384;const z_385=385;const z_386=386;const z_387=387;const z_388=388;const z_389=389;const z_390=390;
const z_391=391;const z_392=392;const z_393=393;const z_394=394;const z_395=395;const z_396=396;const z_397=397;const z_398=398;const z_399=399;const z_400=400;
const z_401=401;const z_402=402;const z_403=403;const z_404=404;const z_405=405;const z_406=406;const z_407=407;const z_408=408;const z_409=409;const z_410=410;
const z_411=411;const z_412=412;const z_413=413;const z_414=414;const z_415=415;const z_416=416;const z_417=417;const z_418=418;const z_419=419;const z_420=420;
const z_421=421;const z_422=422;const z_423=423;const z_424=424;const z_425=425;const z_426=426;const z_427=427;const z_428=428;const z_429=429;const z_430=430;
const z_431=431;const z_432=432;const z_433=433;const z_434=434;const z_435=435;const z_436=436;const z_437=437;const z_438=438;const z_439=439;const z_440=440;
const z_441=441;const z_442=442;const z_443=443;const z_444=444;const z_445=445;const z_446=446;const z_447=447;const z_448=448;const z_449=449;const z_450=450;
const z_451=451;const z_452=452;const z_453=453;const z_454=454;const z_455=455;const z_456=456;const z_457=457;const z_458=458;const z_459=459;const z_460=460;
const z_461=461;const z_462=462;const z_463=463;const z_464=464;const z_465=465;const z_466=466;const z_467=467;const z_468=468;const z_469=469;const z_470=470;
const z_471=471;const z_472=472;const z_473=473;const z_474=474;const z_475=475;const z_476=476;const z_477=477;const z_478=478;const z_479=479;const z_480=480;
const z_481=481;const z_482=482;const z_483=483;const z_484=484;const z_485=485;const z_486=486;const z_487=487;const z_488=488;const z_489=489;const z_490=490;
const z_491=491;const z_492=492;const z_493=493;const z_494=494;const z_495=495;const z_496=496;const z_497=497;const z_498=498;const z_499=499;const z_500=500;
const z_501=501;const z_502=502;const z_503=503;const z_504=504;const z_505=505;const z_506=506;const z_507=507;const z_508=508;const z_509=509;const z_510=510;
const z_511=511;const z_512=512;const z_513=513;const z_514=514;const z_515=515;const z_516=516;const z_517=517;const z_518=518;const z_519=519;const z_520=520;
const z_521=521;const z_522=522;const z_523=523;const z_524=524;const z_525=525;const z_526=526;const z_527=527;const z_528=528;const z_529=529;const z_530=530;
const z_531=531;const z_532=532;const z_533=533;const z_534=534;const z_535=535;const z_536=536;const z_537=537;const z_538=538;const z_539=539;const z_540=540;
const z_541=541;const z_542=542;const z_543=543;const z_544=544;const z_545=545;const z_546=546;const z_547=547;const z_548=548;const z_549=549;const z_550=550;
const z_551=551;const z_552=552;const z_553=553;const z_554=554;const z_555=555;const z_556=556;const z_557=557;const z_558=558;const z_559=559;const z_560=560;
const z_561=561;const z_562=562;const z_563=563;const z_564=564;const z_565=565;const z_566=566;const z_567=567;const z_568=568;const z_569=569;const z_570=570;
const z_571=571;const z_572=572;const z_573=573;const z_574=574;const z_575=575;const z_576=576;const z_577=577;const z_578=578;const z_579=579;const z_580=580;
const z_581=581;const z_582=582;const z_583=583;const z_584=584;const z_585=585;const z_586=586;const z_587=587;const z_588=588;const z_589=589;const z_590=590;
const z_591=591;const z_592=592;const z_593=593;const z_594=594;const z_595=595;const z_596=596;const z_597=597;const z_598=598;const z_599=599;const z_600=600;
const z_601=601;const z_602=602;const z_603=603;const z_604=604;const z_605=605;const z_606=606;const z_607=607;const z_608=608;const z_609=609;const z_610=610;
const z_611=611;const z_612=612;const z_613=613;const z_614=614;const z_615=615;const z_616=616;const z_617=617;const z_618=618;const z_619=619;const z_620=620;
const z_621=621;const z_622=622;const z_623=623;const z_624=624;const z_625=625;const z_626=626;const z_627=627;const z_628=628;const z_629=629;const z_630=630;
const z_631=631;const z_632=632;const z_633=633;const z_634=634;const z_635=635;const z_636=636;const z_637=637;const z_638=638;const z_639=639;const z_640=640;
const z_641=641;const z_642=642;const z_643=643;const z_644=644;const z_645=645;const z_646=646;const z_647=647;const z_648=648;const z_649=649;const z_650=650;
const z_651=651;const z_652=652;const z_653=653;const z_654=654;const z_655=655;const z_656=656;const z_657=657;const z_658=658;const z_659=659;const z_660=660;
const z_661=661;const z_662=662;const z_663=663;const z_664=664;const z_665=665;const z_666=666;const z_667=667;const z_668=668;const z_669=669;const z_670=670;
const z_671=671;const z_672=672;const z_673=673;const z_674=674;const z_675=675;const z_676=676;const z_677=677;const z_678=678;const z_679=679;const z_680=680;
const z_681=681;const z_682=682;const z_683=683;const z_684=684;const z_685=685;const z_686=686;const z_687=687;const z_688=688;const z_689=689;const z_690=690;
const z_691=691;const z_692=692;const z_693=693;const z_694=694;const z_695=695;const z_696=696;const z_697=697;const z_698=698;const z_699=699;const z_700=700;
const z_701=701;const z_702=702;const z_703=703;const z_704=704;const z_705=705;const z_706=706;const z_707=707;const z_708=708;const z_709=709;const z_710=710;
const z_711=711;const z_712=712;const z_713=713;const z_714=714;const z_715=715;const z_716=716;const z_717=717;const z_718=718;const z_719=719;const z_720=720;
const z_721=721;const z_722=722;const z_723=723;const z_724=724;const z_725=725;const z_726=726;const z_727=727;const z_728=728;const z_729=729;const z_730=730;
const z_731=731;const z_732=732;const z_733=733;const z_734=734;const z_735=735;const z_736=736;const z_737=737;const z_738=738;const z_739=739;const z_740=740;
const z_741=741;const z_742=742;const z_743=743;const z_744=744;const z_745=745;const z_746=746;const z_747=747;const z_748=748;const z_749=749;const z_750=750;
const z_751=751;const z_752=752;const z_753=753;const z_754=754;const z_755=755;const z_756=756;const z_757=757;const z_758=758;const z_759=759;const z_760=760;
const z_761=761;const z_762=762;const z_763=763;const z_764=764;const z_765=765;const z_766=766;const z_767=767;const z_768=768;const z_769=769;const z_770=770;
const z_771=771;const z_772=772;const z_773=773;const z_774=774;const z_775=775;const z_776=776;const z_777=777;const z_778=778;const z_779=779;const z_780=780;
const z_781=781;const z_782=782;const z_783=783;const z_784=784;const z_785=785;const z_786=786;const z_787=787;const z_788=788;const z_789=789;const z_790=790;
const z_791=791;const z_792=792;const z_793=793;const z_794=794;const z_795=795;const z_796=796;const z_797=797;const z_798=798;const z_799=799;const z_800=800;
const z_801=801;const z_802=802;const z_803=803;const z_804=804;const z_805=805;const z_806=806;const z_807=807;const z_808=808;const z_809=809;const z_810=810;
const z_811=811;const z_812=812;const z_813=813;const z_814=814;const z_815=815;const z_816=816;const z_817=817;const z_818=818;const z_819=819;const z_820=820;
const z_821=821;const z_822=822;const z_823=823;const z_824=824;const z_825=825;const z_826=826;const z_827=827;const z_828=828;const z_829=829;const z_830=830;
const z_831=831;const z_832=832;const z_833=833;const z_834=834;const z_835=835;const z_836=836;const z_837=837;const z_838=838;const z_839=839;const z_840=840;
const z_841=841;const z_842=842;const z_843=843;const z_844=844;const z_845=845;const z_846=846;const z_847=847;const z_848=848;const z_849=849;const z_850=850;
const z_851=851;const z_852=852;const z_853=853;const z_854=854;const z_855=855;const z_856=856;const z_857=857;const z_858=858;const z_859=859;const z_860=860;
const z_861=861;const z_862=862;const z_863=863;const z_864=864;const z_865=865;const z_866=866;const z_867=867;const z_868=868;const z_869=869;const z_870=870;
const z_871=871;const z_872=872;const z_873=873;const z_874=874;const z_875=875;const z_876=876;const z_877=877;const z_878=878;const z_879=879;const z_880=880;
const z_881=881;const z_882=882;const z_883=883;const z_884=884;const z_885=885;const z_886=886;const z_887=887;const z_888=888;const z_889=889;const z_890=890;
const z_891=891;const z_892=892;const z_893=893;const z_894=894;const z_895=895;const z_896=896;const z_897=897;const z_898=898;const z_899=899;const z_900=900;
const z_901=901;const z_902=902;const z_903=903;const z_904=904;const z_905=905;const z_906=906;const z_907=907;const z_908=908;const z_909=909;const z_910=910;
const z_911=911;const z_912=912;const z_913=913;const z_914=914;const z_915=915;const z_916=916;const z_917=917;const z_918=918;const z_919=919;const z_920=920;
const z_921=921;const z_922=922;const z_923=923;const z_924=924;const z_925=925;const z_926=926;const z_927=927;const z_928=928;const z_929=929;const z_930=930;
const z_931=931;const z_932=932;const z_933=933;const z_934=934;const z_935=935;const z_936=936;const z_937=937;const z_938=938;const z_939=939;const z_940=940;
const z_941=941;const z_942=942;const z_943=943;const z_944=944;const z_945=945;const z_946=946;const z_947=947;const z_948=948;const z_949=949;const z_950=950;
const z_951=951;const z_952=952;const z_953=953;const z_954=954;const z_955=955;const z_956=956;const z_957=957;const z_958=958;const z_959=959;const z_960=960;
const z_961=961;const z_962=962;const z_963=963;const z_964=964;const z_965=965;const z_966=966;const z_967=967;const z_968=968;const z_969=969;const z_970=970;
const z_971=971;const z_972=972;const z_973=973;const z_974=974;const z_975=975;const z_976=976;const z_977=977;const z_978=978;const z_979=979;const z_980=980;
const z_981=981;const z_982=982;const z_983=983;const z_984=984;const z_985=985;const z_986=986;const z_987=987;const z_988=988;const z_989=989;const z_990=990;
const z_991=991;const z_992=992;const z_993=993;const z_994=994;const z_995=995;const z_996=996;const z_997=997;const z_998=998;const z_999=999;const z_1000=1000;
const z_1001=1001;const z_1002=1002;const z_1003=1003;const z_1004=1004;const z_1005=1005;const z_1006=1006;const z_1007=1007;const z_1008=1008;const z_1009=1009;const z_1010=1010;
const z_1011=1011;const z_1012=1012;const z_1013=1013;const z_1014=1014;const z_1015=1015;const z_1016=1016;const z_1017=1017;const z_1018=1018;const z_1019=1019;const z_1020=1020;
const z_1021=1021;const z_1022=1022;const z_1023=1023;const z_1024=1024;const z_1025=1025;const z_1026=1026;const z_1027=1027;const z_1028=1028;const z_1029=1029;const z_1030=1030;
const z_1031=1031;const z_1032=1032;const z_1033=1033;const z_1034=1034;const z_1035=1035;const z_1036=1036;const z_1037=1037;const z_1038=1038;const z_1039=1039;const z_1040=1040;
const z_1041=1041;const z_1042=1042;const z_1043=1043;const z_1044=1044;const z_1045=1045;const z_1046=1046;const z_1047=1047;const z_1048=1048;const z_1049=1049;const z_1050=1050;
const z_1051=1051;const z_1052=1052;const z_1053=1053;const z_1054=1054;const z_1055=1055;const z_1056=1056;const z_1057=1057;const z_1058=1058;const z_1059=1059;const z_1060=1060;
const z_1061=1061;const z_1062=1062;const z_1063=1063;const z_1064=1064;const z_1065=1065;const z_1066=1066;const z_1067=1067;const z_1068=1068;const z_1069=1069;const z_1070=1070;
const z_1071=1071;const z_1072=1072;const z_1073=1073;const z_1074=1074;const z_1075=1075;const z_1076=1076;const z_1077=1077;const z_1078=1078;const z_1079=1079;const z_1080=1080;
const z_1081=1081;const z_1082=1082;const z_1083=1083;const z_1084=1084;const z_1085=1085;const z_1086=1086;const z_1087=1087;const z_1088=1088;const z_1089=1089;const z_1090=1090;
const z_1091=1091;const z_1092=1092;const z_1093=1093;const z_1094=1094;const z_1095=1095;const z_1096=1096;const z_1097=1097;const z_1098=1098;const z_1099=1099;const z_1100=1100;
const z_1101=1101;const z_1102=1102;const z_1103=1103;const z_1104=1104;const z_1105=1105;const z_1106=1106;const z_1107=1107;const z_1108=1108;const z_1109=1109;const z_1110=1110;
const z_1111=1111;const z_1112=1112;const z_1113=1113;const z_1114=1114;const z_1115=1115;const z_1116=1116;const z_1117=1117;const z_1118=1118;const z_1119=1119;const z_1120=1120;
const z_1121=1121;const z_1122=1122;const z_1123=1123;const z_1124=1124;const z_1125=1125;const z_1126=1126;const z_1127=1127;const z_1128=1128;const z_1129=1129;const z_1130=1130;
const z_1131=1131;const z_1132=1132;const z_1133=1133;const z_1134=1134;const z_1135=1135;const z_1136=1136;const z_1137=1137;const z_1138=1138;const z_1139=1139;const z_1140=1140;
const z_1141=1141;const z_1142=1142;const z_1143=1143;const z_1144=1144;const z_1145=1145;const z_1146=1146;const z_1147=1147;const z_1148=1148;const z_1149=1149;const z_1150=1150;
const z_1151=1151;const z_1152=1152;const z_1153=1153;const z_1154=1154;const z_1155=1155;const z_1156=1156;const z_1157=1157;const z_1158=1158;const z_1159=1159;const z_1160=1160;
const z_1161=1161;const z_1162=1162;const z_1163=1163;const z_1164=1164;const z_1165=1165;const z_1166=1166;const z_1167=1167;const z_1168=1168;const z_1169=1169;const z_1170=1170;
const z_1171=1171;const z_1172=1172;const z_1173=1173;const z_1174=1174;const z_1175=1175;const z_1176=1176;const z_1177=1177;const z_1178=1178;const z_1179=1179;const z_1180=1180;
const z_1181=1181;const z_1182=1182;const z_1183=1183;const z_1184=1184;const z_1185=1185;const z_1186=1186;const z_1187=1187;const z_1188=1188;const z_1189=1189;const z_1190=1190;
const z_1191=1191;const z_1192=1192;const z_1193=1193;const z_1194=1194;const z_1195=1195;const z_1196=1196;const z_1197=1197;const z_1198=1198;const z_1199=1199;const z_1200=1200;
const z_1201=1201;const z_1202=1202;const z_1203=1203;const z_1204=1204;const z_1205=1205;const z_1206=1206;const z_1207=1207;const z_1208=1208;const z_1209=1209;const z_1210=1210;
const z_1211=1211;const z_1212=1212;const z_1213=1213;const z_1214=1214;const z_1215=1215;const z_1216=1216;const z_1217=1217;const z_1218=1218;const z_1219=1219;const z_1220=1220;
const z_1221=1221;const z_1222=1222;const z_1223=1223;const z_1224=1224;const z_1225=1225;const z_1226=1226;const z_1227=1227;const z_1228=1228;const z_1229=1229;const z_1230=1230;
const z_1231=1231;const z_1232=1232;const z_1233=1233;const z_1234=1234;const z_1235=1235;const z_1236=1236;const z_1237=1237;const z_1238=1238;const z_1239=1239;const z_1240=1240;
const z_1241=1241;const z_1242=1242;const z_1243=1243;const z_1244=1244;const z_1245=1245;const z_1246=1246;const z_1247=1247;const z_1248=1248;const z_1249=1249;const z_1250=1250;
const z_1251=1251;const z_1252=1252;const z_1253=1253;const z_1254=1254;const z_1255=1255;const z_1256=1256;const z_1257=1257;const z_1258=1258;const z_1259=1259;const z_1260=1260;
const z_1261=1261;const z_1262=1262;const z_1263=1263;const z_1264=1264;const z_1265=1265;const z_1266=1266;const z_1267=1267;const z_1268=1268;const z_1269=1269;const z_1270=1270;
const z_1271=1271;const z_1272=1272;const z_1273=1273;const z_1274=1274;const z_1275=1275;const z_1276=1276;const z_1277=1277;const z_1278=1278;const z_1279=1279;const z_1280=1280;
const z_1281=1281;const z_1282=1282;const z_1283=1283;const z_1284=1284;const z_1285=1285;const z_1286=1286;const z_1287=1287;const z_1288=1288;const z_1289=1289;const z_1290=1290;
const z_1291=1291;const z_1292=1292;const z_1293=1293;const z_1294=1294;const z_1295=1295;const z_1296=1296;const z_1297=1297;const z_1298=1298;const z_1299=1299;const z_1300=1300;
const z_1301=1301;const z_1302=1302;const z_1303=1303;const z_1304=1304;const z_1305=1305;const z_1306=1306;const z_1307=1307;const z_1308=1308;const z_1309=1309;const z_1310=1310;
const z_1311=1311;const z_1312=1312;const z_1313=1313;const z_1314=1314;const z_1315=1315;const z_1316=1316;const z_1317=1317;const z_1318=1318;const z_1319=1319;const z_1320=1320;
const z_1321=1321;const z_1322=1322;const z_1323=1323;const z_1324=1324;const z_1325=1325;const z_1326=1326;const z_1327=1327;const z_1328=1328;const z_1329=1329;const z_1330=1330;
const z_1331=1331;const z_1332=1332;const z_1333=1333;const z_1334=1334;const z_1335=1335;const z_1336=1336;const z_1337=1337;const z_1338=1338;const z_1339=1339;const z_1340=1340;
const z_1341=1341;const z_1342=1342;const z_1343=1343;const z_1344=1344;const z_1345=1345;const z_1346=1346;const z_1347=1347;const z_1348=1348;const z_1349=1349;const z_1350=1350;
const z_1351=1351;const z_1352=1352;const z_1353=1353;const z_1354=1354;const z_1355=1355;const z_1356=1356;const z_1357=1357;const z_1358=1358;const z_1359=1359;const z_1360=1360;
const z_1361=1361;const z_1362=1362;const z_1363=1363;const z_1364=1364;const z_1365=1365;const z_1366=1366;const z_1367=1367;const z_1368=1368;const z_1369=1369;const z_1370=1370;
const z_1371=1371;const z_1372=1372;const z_1373=1373;const z_1374=1374;const z_1375=1375;const z_1376=1376;const z_1377=1377;const z_1378=1378;const z_1379=1379;const z_1380=1380;
const z_1381=1381;const z_1382=1382;const z_1383=1383;const z_1384=1384;const z_1385=1385;const z_1386=1386;const z_1387=1387;const z_1388=1388;const z_1389=1389;const z_1390=1390;
const z_1391=1391;const z_1392=1392;const z_1393=1393;const z_1394=1394;const z_1395=1395;const z_1396=1396;const z_1397=1397;const z_1398=1398;const z_1399=1399;const z_1400=1400;
const z_1401=1401;const z_1402=1402;const z_1403=1403;const z_1404=1404;const z_1405=1405;const z_1406=1406;const z_1407=1407;const z_1408=1408;const z_1409=1409;const z_1410=1410;
const z_1411=1411;const z_1412=1412;const z_1413=1413;const z_1414=1414;const z_1415=1415;const z_1416=1416;const z_1417=1417;const z_1418=1418;const z_1419=1419;const z_1420=1420;
const z_1421=1421;const z_1422=1422;const z_1423=1423;const z_1424=1424;const z_1425=1425;const z_1426=1426;const z_1427=1427;const z_1428=1428;const z_1429=1429;const z_1430=1430;
const z_1431=1431;const z_1432=1432;const z_1433=1433;const z_1434=1434;const z_1435=1435;const z_1436=1436;const z_1437=1437;const z_1438=1438;const z_1439=1439;const z_1440=1440;
const z_1441=1441;const z_1442=1442;const z_1443=1443;const z_1444=1444;const z_1445=1445;const z_1446=1446;const z_1447=1447;const z_1448=1448;const z_1449=1449;const z_1450=1450;
const z_1451=1451;const z_1452=1452;const z_1453=1453;const z_1454=1454;const z_1455=1455;const z_1456=1456;const z_1457=1457;const z_1458=1458;const z_1459=1459;const z_1460=1460;
const z_1461=1461;const z_1462=1462;const z_1463=1463;const z_1464=1464;const z_1465=1465;const z_1466=1466;const z_1467=1467;const z_1468=1468;const z_1469=1469;const z_1470=1470;
const z_1471=1471;const z_1472=1472;const z_1473=1473;const z_1474=1474;const z_1475=1475;const z_1476=1476;const z_1477=1477;const z_1478=1478;const z_1479=1479;const z_1480=1480;
const z_1481=1481;const z_1482=1482;const z_1483=1483;const z_1484=1484;const z_1485=1485;const z_1486=1486;const z_1487=1487;const z_1488=1488;const z_1489=1489;const z_1490=1490;
const z_1491=1491;const z_1492=1492;const z_1493=1493;const z_1494=1494;const z_1495=1495;const z_1496=1496;const z_1497=1497;const z_1498=1498;const z_1499=1499;const z_1500=1500;
const z_1501=1501;const z_1502=1502;const z_1503=1503;const z_1504=1504;const z_1505=1505;const z_1506=1506;const z_1507=1507;const z_1508=1508;const z_1509=1509;const z_1510=1510;
const z_1511=1511;const z_1512=1512;const z_1513=1513;const z_1514=1514;const z_1515=1515;const z_1516=1516;const z_1517=1517;const z_1518=1518;const z_1519=1519;const z_1520=1520;
const z_1521=1521;const z_1522=1522;const z_1523=1523;const z_1524=1524;const z_1525=1525;const z_1526=1526;const z_1527=1527;const z_1528=1528;const z_1529=1529;const z_1530=1530;
const z_1531=1531;const z_1532=1532;const z_1533=1533;const z_1534=1534;const z_1535=1535;const z_1536=1536;const z_1537=1537;const z_1538=1538;const z_1539=1539;const z_1540=1540;
const z_1541=1541;const z_1542=1542;const z_1543=1543;const z_1544=1544;const z_1545=1545;const z_1546=1546;const z_1547=1547;const z_1548=1548;const z_1549=1549;const z_1550=1550;
const z_1551=1551;const z_1552=1552;const z_1553=1553;const z_1554=1554;const z_1555=1555;const z_1556=1556;const z_1557=1557;const z_1558=1558;const z_1559=1559;const z_1560=1560;
const z_1561=1561;const z_1562=1562;const z_1563=1563;const z_1564=1564;const z_1565=1565;const z_1566=1566;const z_1567=1567;const z_1568=1568;const z_1569=1569;const z_1570=1570;
const z_1571=1571;const z_1572=1572;const z_1573=1573;const z_1574=1574;const z_1575=1575;const z_1576=1576;const z_1577=1577;const z_1578=1578;const z_1579=1579;const z_1580=1580;
const z_1581=1581;const z_1582=1582;const z_1583=1583;const z_1584=1584;const z_1585=1585;const z_1586=1586;const z_1587=1587;const z_1588=1588;const z_1589=1589;const z_1590=1590;
const z_1591=1591;const z_1592=1592;const z_1593=1593;const z_1594=1594;const z_1595=1595;const z_1596=1596;const z_1597=1597;const z_1598=1598;const z_1599=1599;const z_1600=1600;
const z_1601=1601;const z_1602=1602;const z_1603=1603;const z_1604=1604;const z_1605=1605;const z_1606=1606;const z_1607=1607;const z_1608=1608;const z_1609=1609;const z_1610=1610;
const z_1611=1611;const z_1612=1612;const z_1613=1613;const z_1614=1614;const z_1615=1615;const z_1616=1616;const z_1617=1617;const z_1618=1618;const z_1619=1619;const z_1620=1620;
const z_1621=1621;const z_1622=1622;const z_1623=1623;const z_1624=1624;const z_1625=1625;const z_1626=1626;const z_1627=1627;const z_1628=1628;const z_1629=1629;const z_1630=1630;
const z_1631=1631;const z_1632=1632;const z_1633=1633;const z_1634=1634;const z_1635=1635;const z_1636=1636;const z_1637=1637;const z_1638=1638;const z_1639=1639;const z_1640=1640;
const z_1641=1641;const z_1642=1642;const z_1643=1643;const z_1644=1644;const z_1645=1645;const z_1646=1646;const z_1647=1647;const z_1648=1648;const z_1649=1649;const z_1650=1650;
const z_1651=1651;const z_1652=1652;const z_1653=1653;const z_1654=1654;const z_1655=1655;const z_1656=1656;const z_1657=1657;const z_1658=1658;const z_1659=1659;const z_1660=1660;
const z_1661=1661;const z_1662=1662;const z_1663=1663;const z_1664=1664;const z_1665=1665;const z_1666=1666;const z_1667=1667;const z_1668=1668;const z_1669=1669;const z_1670=1670;
const z_1671=1671;const z_1672=1672;const z_1673=1673;const z_1674=1674;const z_1675=1675;const z_1676=1676;const z_1677=1677;const z_1678=1678;const z_1679=1679;const z_1680=1680;
const z_1681=1681;const z_1682=1682;const z_1683=1683;const z_1684=1684;const z_1685=1685;const z_1686=1686;const z_1687=1687;const z_1688=1688;const z_1689=1689;const z_1690=1690;
const z_1691=1691;const z_1692=1692;const z_1693=1693;const z_1694=1694;const z_1695=1695;const z_1696=1696;const z_1697=1697;const z_1698=1698;const z_1699=1699;const z_1700=1700;
const z_1701=1701;const z_1702=1702;const z_1703=1703;const z_1704=1704;const z_1705=1705;const z_1706=1706;const z_1707=1707;const z_1708=1708;const z_1709=1709;const z_1710=1710;
const z_1711=1711;const z_1712=1712;const z_1713=1713;const z_1714=1714;const z_1715=1715;const z_1716=1716;const z_1717=1717;const z_1718=1718;const z_1719=1719;const z_1720=1720;
const z_1721=1721;const z_1722=1722;const z_1723=1723;const z_1724=1724;const z_1725=1725;const z_1726=1726;const z_1727=1727;const z_1728=1728;const z_1729=1729;const z_1730=1730;
const z_1731=1731;const z_1732=1732;const z_1733=1733;const z_1734=1734;const z_1735=1735;const z_1736=1736;const z_1737=1737;const z_1738=1738;const z_1739=1739;const z_1740=1740;
const z_1741=1741;const z_1742=1742;const z_1743=1743;const z_1744=1744;const z_1745=1745;const z_1746=1746;const z_1747=1747;const z_1748=1748;const z_1749=1749;const z_1750=1750;
const z_1751=1751;const z_1752=1752;const z_1753=1753;const z_1754=1754;const z_1755=1755;const z_1756=1756;const z_1757=1757;const z_1758=1758;const z_1759=1759;const z_1760=1760;
const z_1761=1761;const z_1762=1762;const z_1763=1763;const z_1764=1764;const z_1765=1765;const z_1766=1766;const z_1767=1767;const z_1768=1768;const z_1769=1769;const z_1770=1770;
const z_1771=1771;const z_1772=1772;const z_1773=1773;const z_1774=1774;const z_1775=1775;const z_1776=1776;const z_1777=1777;const z_1778=1778;const z_1779=1779;const z_1780=1780;
const z_1781=1781;const z_1782=1782;const z_1783=1783;const z_1784=1784;const z_1785=1785;const z_1786=1786;const z_1787=1787;const z_1788=1788;const z_1789=1789;const z_1790=1790;
const z_1791=1791;const z_1792=1792;const z_1793=1793;const z_1794=1794;const z_1795=1795;const z_1796=1796;const z_1797=1797;const z_1798=1798;const z_1799=1799;const z_1800=1800;
const z_1801=1801;const z_1802=1802;const z_1803=1803;const z_1804=1804;const z_1805=1805;const z_1806=1806;const z_1807=1807;const z_1808=1808;const z_1809=1809;const z_1810=1810;
const z_1811=1811;const z_1812=1812;const z_1813=1813;const z_1814=1814;const z_1815=1815;const z_1816=1816;const z_1817=1817;const z_1818=1818;const z_1819=1819;const z_1820=1820;
const z_1821=1821;const z_1822=1822;const z_1823=1823;const z_1824=1824;const z_1825=1825;const z_1826=1826;const z_1827=1827;const z_1828=1828;const z_1829=1829;const z_1830=1830;
const z_1831=1831;const z_1832=1832;const z_1833=1833;const z_1834=1834;const z_1835=1835;const z_1836=1836;const z_1837=1837;const z_1838=1838;const z_1839=1839;const z_1840=1840;
const z_1841=1841;const z_1842=1842;const z_1843=1843;const z_1844=1844;const z_1845=1845;const z_1846=1846;const z_1847=1847;const z_1848=1848;const z_1849=1849;const z_1850=1850;
const z_1851=1851;const z_1852=1852;const z_1853=1853;const z_1854=1854;const z_1855=1855;const z_1856=1856;const z_1857=1857;const z_1858=1858;const z_1859=1859;const z_1860=1860;
const z_1861=1861;const z_1862=1862;const z_1863=1863;const z_1864=1864;const z_1865=1865;const z_1866=1866;const z_1867=1867;const z_1868=1868;const z_1869=1869;const z_1870=1870;
const z_1871=1871;const z_1872=1872;const z_1873=1873;const z_1874=1874;const z_1875=1875;const z_1876=1876;const z_1877=1877;const z_1878=1878;const z_1879=1879;const z_1880=1880;
const z_1881=1881;const z_1882=1882;const z_1883=1883;const z_1884=1884;const z_1885=1885;const z_1886=1886;const z_1887=1887;const z_1888=1888;const z_1889=1889;const z_1890=1890;
const z_1891=1891;const z_1892=1892;const z_1893=1893;const z_1894=1894;const z_1895=1895;const z_1896=1896;const z_1897=1897;const z_1898=1898;const z_1899=1899;const z_1900=1900;
const z_1901=1901;const z_1902=1902;const z_1903=1903;const z_1904=1904;const z_1905=1905;const z_1906=1906;const z_1907=1907;const z_1908=1908;const z_1909=1909;const z_1910=1910;
const z_1911=1911;const z_1912=1912;const z_1913=1913;const z_1914=1914;const z_1915=1915;const z_1916=1916;const z_1917=1917;const z_1918=1918;const z_1919=1919;const z_1920=1920;
const z_1921=1921;const z_1922=1922;const z_1923=1923;const z_1924=1924;const z_1925=1925;const z_1926=1926;const z_1927=1927;const z_1928=1928;const z_1929=1929;const z_1930=1930;
const z_1931=1931;const z_1932=1932;const z_1933=1933;const z_1934=1934;const z_1935=1935;const z_1936=1936;const z_1937=1937;const z_1938=1938;const z_1939=1939;const z_1940=1940;
const z_1941=1941;const z_1942=1942;const z_1943=1943;const z_1944=1944;const z_1945=1945;const z_1946=1946;const z_1947=1947;const z_1948=1948;const z_1949=1949;const z_1950=1950;
const z_1951=1951;const z_1952=1952;const z_1953=1953;const z_1954=1954;const z_1955=1955;const z_1956=1956;const z_1957=1957;const z_1958=1958;const z_1959=1959;const z_1960=1960;
const z_1961=1961;const z_1962=1962;const z_1963=1963;const z_1964=1964;const z_1965=1965;const z_1966=1966;const z_1967=1967;const z_1968=1968;const z_1969=1969;const z_1970=1970;
const z_1971=1971;const z_1972=1972;const z_1973=1973;const z_1974=1974;const z_1975=1975;const z_1976=1976;const z_1977=1977;const z_1978=1978;const z_1979=1979;const z_1980=1980;
const z_1981=1981;const z_1982=1982;const z_1983=1983;const z_1984=1984;const z_1985=1985;const z_1986=1986;const z_1987=1987;const z_1988=1988;const z_1989=1989;const z_1990=1990;
const z_1991=1991;const z_1992=1992;const z_1993=1993;const z_1994=1994;const z_1995=1995;const z_1996=1996;const z_1997=1997;const z_1998=1998;const z_1999=1999;const z_2000=2000;
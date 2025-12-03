// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { ROLE_PERMISSION_MAPPING } from "../../constants/index";
import { Icon } from "../../../common/ui-components";

export const COMPANY_LEGAL_ENTITY_NAME = 'Citibank demo business Inc';
export const APP_BASE_URL = 'citibankdemobusiness.dev';

export type SvgDimension = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
export type SvgPathData = { d: string; f?: string; s?: string; sw?: string; };
export type SvgCollection = { [key: string]: SvgPathData[] };
export type VctrElmProps = { sz: SvgDimension; iN: string; cl?: string; cr?: string; };

export const VECTOR_GRAPHIC_DATABASE: SvgCollection = {
  confirm_ring: [{ d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" }],
  optic_view: [{ d: "M10 12a2 2 0 100-4 2 2 0 000 4z" }, { d: "M.293 10.293a1 1 0 010-1.414l4-4a1 1 0 011.414 0l1.293 1.293a1 1 0 01-1.414 1.414L5 6.414l-3.293 3.293a1 1 0 01-1.414 0zM10 4a6 6 0 100 12 6 6 0 000-12z" }],
  deny_ring: [{ d: "M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" }],
  gemini: [{ d: "M10.3,5.9c-0.2,0-0.4,0.1-0.5,0.2L5.9,9.4c-0.3,0.3-0.3,0.8,0,1.1s0.8,0.3,1.1,0l3.8-3.8c0.3-0.3,0.3-0.8,0-1.1 C10.7,5.9,10.5,5.9,10.3,5.9z" }, { d: "M15,2.3c-0.4,0-0.8,0.2-1.1,0.5l-3.8,3.8C9.9,6.9,9.8,7,9.8,7.2c0,0.2,0.1,0.4,0.2,0.5c0.3,0.3,0.8,0.3,1.1,0l3.8-3.8 c0.3-0.3,0.3-0.8,0-1.1C15.8,2.5,15.4,2.3,15,2.3z" }],
  chatgpt: [{ d: "M16.5,5.3c0-0.5-0.4-0.9-0.9-0.9c-0.2,0-0.4,0.1-0.6,0.2l-3.5,2.4C11.3,7,11,7,10.8,6.8L9.6,5.7C9.2,5.3,8.6,5.3,8.2,5.7 c-0.4,0.4-0.4,1,0,1.4l1.2,1.2c0.2,0.2,0.2,0.5,0,0.7L5.7,12.8c-0.4,0.4-0.4,1,0,1.4c0.4,0.4,1,0.4,1.4,0l3.8-3.8 c0.2-0.2,0.5-0.2,0.7,0l1.2,1.2c0.4,0.4,1,0.4,1.4,0c0.4-0.4,0.4-1,0-1.4L12.5,9.4c-0.2-0.2-0.2-0.5,0-0.7l3.8-2.6 C16.4,5.8,16.5,5.5,16.5,5.3z" }],
  github: [{ d: "M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-1.02-.01-1.82-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .26.18.57.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z" }],
  plaid: [{ d: "M10.1,6.3c0.1,0,0.2-0.1,0.2-0.2c0-1-0.8-1.9-1.9-1.9c-0.1,0-0.2,0.1-0.2,0.2c0,0.1,0.1,0.2,0.2,0.2 c0.8,0,1.5,0.7,1.5,1.5C9.9,6.2,10,6.3,10.1,6.3z M17.6,9.8c-1.1,0-2-0.9-2-2c0-0.1-0.1-0.2-0.2-0.2c-0.1,0-0.2,0.1-0.2,0.2 c0,0.8-0.7,1.5-1.5,1.5c-0.1,0-0.2,0.1-0.2,0.2c0,0.1,0.1,0.2,0.2,0.2c1.1,0,2,0.9,2,2c0,0.1,0.1,0.2,0.2,0.2 c0.1,0,0.2-0.1,0.2-0.2C18.2,10.3,18,9.8,17.6,9.8z M8.4,12.3c0.1,0,0.2-0.1,0.2-0.2c0-0.8,0.7-1.5,1.5-1.5c0.1,0,0.2-0.1,0.2-0.2 c0-0.1-0.1-0.2-0.2-0.2c-1.1,0-2,0.9-2,2c0,0.1,0.1,0.2,0.2,0.2C8.3,12.3,8.3,12.3,8.4,12.3z" }],
  oracle: [{ d: "M17.1,6.4c-0.1,0-0.2,0-0.3,0.1l-4.5,2.2c-0.1,0-0.1,0.1-0.1,0.2c0,0,0,0.1,0.1,0.1l0,0c0.1,0,0.1,0,0.2-0.1l4.5-2.2 c0.1-0.1,0.1-0.2,0.1-0.3C17.2,6.4,17.2,6.4,17.1,6.4z M12,12.1c0,2.1,1.7,3.8,3.8,3.8s3.8-1.7,3.8-3.8s-1.7-3.8-3.8-3.8 C13.7,8.3,12,10,12,12.1z M15.8,9.3c1.5,0,2.8,1.2,2.8,2.8s-1.2,2.8-2.8,2.8s-2.8-1.2-2.8-2.8S14.3,9.3,15.8,9.3z" }],
  salesforce: [{ d: "M15.4,12.7c-0.3,0-0.6,0.1-0.8,0.3c-1,0.8-2.4,1.1-3.7,0.8c-1.1-0.3-2-1.1-2.4-2.2c-0.5-1.3-0.2-2.8,0.8-3.8 c0.2-0.2,0.3-0.5,0.3-0.8s-0.1-0.6-0.3-0.8C8.8,5.7,8.2,5.5,7.5,5.7C5.6,6.1,4.2,7.7,4.1,9.6c-0.1,2.1,1.5,3.9,3.6,4 c0.1,0,0.2,0,0.3,0c1.7,0,3.3-1,4.1-2.5C12.4,10.6,13.2,10,14.2,10c0.8,0,1.5,0.4,1.9,1.1c0.3,0.5,0.4,1,0.2,1.6 C16.1,12.7,15.8,12.7,15.4,12.7z" }],
  'google-drive': [{ d: 'M15.25 7.6l-5.6-5.22L4 7.6H0l8 7.4 8-7.4h-3.75zM8 16.25L1.75 10h3.25L8 12.5l3-2.5h3.25L8 16.25z' }],
  onedrive: [{ d: "M5.5,8.1C4.3,8.4,4,9.5,4.3,10.7c0.2,0.8,0.9,1.4,1.7,1.5c2.3,0.3,4.3-1.4,4.3-3.6c0-0.4-0.1-0.9-0.2-1.3 C9.6,6.5,8.7,6,7.8,6C6.8,6,6,6.7,5.7,7.6C5.6,7.8,5.5,7.9,5.5,8.1z M17.7,8.8c-2.3-2.2-5.9-2.7-8.8-1.2 c-0.5,0.3-1.1,0.6-1.5,1c-0.6,0.6-1,1.3-1.2,2.1c-0.5,2.1,0.6,4.3,2.6,5.2c2.6,1.2,5.6,0.1,6.8-2.4C17.7,11.3,18.1,9.8,17.7,8.8z" }],
};

export const VctrElm: React.FC<VctrElmProps> = ({ sz, iN, cl, cr }) => {
  const sizeMap: { [key in SvgDimension]: number } = {
    xs: 12, s: 16, m: 20, l: 24, xl: 32, xxl: 48,
  };
  const d = sizeMap[sz] || 20;
  const p = VECTOR_GRAPHIC_DATABASE[iN];

  if (!p) {
    return null; 
  }

  return (
    <svg
      width={d}
      height={d}
      viewBox="0 0 20 20"
      fill={cr || "none"}
      xmlns="http://www.w3.org/2000/svg"
      className={cl}
    >
      {p.map((path, idx) => (
        <path
          key={idx}
          fillRule="evenodd"
          clipRule="evenodd"
          d={path.d}
          fill={path.f || (cr ? "currentColor" : "#6B7280")}
          stroke={path.s}
          strokeWidth={path.sw}
        />
      ))}
    </svg>
  );
};

export const AUTHZ_PRIVILEGE_MAP: { [key: string]: string } = {
  ...Array.from({ length: 50 }).reduce((acc, _, i) => ({ ...acc, [`generic.task.exec_${i}`]: 'mng', [`generic.task.read_${i}`]: 'rd_f' }), {}),
  'sys.admin': 'mng_rvw',
  'sys.billing': 'mng',
  'sys.audit': 'rd_f',
  'user.create': 'mng',
  'user.read': 'rd_p',
  'user.update': 'rvw_edt',
  'user.delete': 'mng',
  'group.create': 'mng',
  'group.read': 'rd_p',
  'group.update': 'rvw_edt',
  'group.delete': 'mng',
  'account.read': 'p_acc',
  'account.transact': 'p_acc',
  'payment.initiate': 'mng',
  'payment.approve': 'mng_rvw',
  'payment.read': 'rd_f',
  'beneficiary.manage': 'rvw_edt',
  'report.generate': 'rd_p',
  'report.read_all': 'rd_f',
  'api.keys.manage': 'mng',
  'webhook.config': 'mng',
  'gemini.model.query': 'mng',
  'gemini.model.finetune': 'mng_rvw',
  'gemini.api.read': 'rd_p',
  'chatgpt.prompt': 'mng',
  'chatgpt.history.read': 'rd_p',
  'chatgpt.custom.gpt.manage': 'mng_rvw',
  'pipedream.workflow.create': 'mng',
  'pipedream.workflow.execute': 'mng',
  'pipedream.logs.read': 'rd_f',
  'github.repo.read': 'rd_p',
  'github.repo.write': 'rvw_edt',
  'github.repo.admin': 'mng',
  'github.issues.manage': 'rvw_edt',
  'github.actions.run': 'mng',
  'github.secrets.manage': 'mng_rvw',
  'huggingface.model.deploy': 'mng',
  'huggingface.dataset.upload': 'rvw_edt',
  'huggingface.space.manage': 'mng_rvw',
  'plaid.link.create': 'mng',
  'plaid.accounts.read': 'p_acc',
  'plaid.transactions.read': 'p_acc',
  'plaid.identity.read': 'rd_f',
  'moderntreasury.payment.create': 'mng',
  'moderntreasury.account.read': 'rd_f',
  'moderntreasury.returns.manage': 'mng_rvw',
  'googledrive.file.upload': 'rvw_edt',
  'googledrive.file.download': 'rd_p',
  'googledrive.file.share': 'mng',
  'googledrive.folder.manage': 'mng',
  'onedrive.file.upload': 'rvw_edt',
  'onedrive.file.read': 'rd_p',
  'onedrive.folder.admin': 'mng',
  'azure.vm.start': 'mng',
  'azure.vm.stop': 'mng',
  'azure.blob.write': 'rvw_edt',
  'azure.blob.read': 'rd_p',
  'azure.ad.manage': 'mng_rvw',
  'googlecloud.compute.manage': 'mng',
  'googlecloud.storage.write': 'rvw_edt',
  'googlecloud.iam.admin': 'mng_rvw',
  'supabase.db.read': 'rd_p',
  'supabase.db.write': 'rvw_edt',
  'supabase.auth.manage': 'mng',
  'vercel.deploy.create': 'mng',
  'vercel.logs.read': 'rd_f',
  'vercel.domains.manage': 'mng_rvw',
  'salesforce.opportunity.edit': 'rvw_edt',
  'salesforce.lead.create': 'mng',
  'salesforce.report.run': 'rd_p',
  'salesforce.admin.access': 'mng_rvw',
  'oracle.db.query': 'rd_p',
  'oracle.db.execute': 'rvw_edt',
  'oracle.cloud.provision': 'mng',
  'marqeta.card.issue': 'mng',
  'marqeta.transaction.view': 'rd_f',
  'marqeta.user.create': 'rvw_edt',
  'citibank.payment.swift': 'mng_rvw',
  'citibank.account.balance': 'rd_f',
  'citibank.fx.trade': 'mng',
  'shopify.product.manage': 'rvw_edt',
  'shopify.order.fulfill': 'mng',
  'shopify.theme.edit': 'mng_rvw',
  'woocommerce.product.add': 'rvw_edt',
  'woocommerce.order.view': 'rd_p',
  'woocommerce.settings.admin': 'mng',
  'godaddy.domain.manage': 'mng',
  'godaddy.dns.edit': 'mng_rvw',
  'cpanel.db.manage': 'mng',
  'cpanel.email.create': 'rvw_edt',
  'adobe.photoshop.edit': 'rvw_edt',
  'adobe.acrobat.sign': 'mng',
  'adobe.fonts.access': 'rd_p',
  'twilio.sms.send': 'mng',
  'twilio.voice.call': 'mng',
  'twilio.lookup.perform': 'rd_p',
  'aws.s3.read': 'rd_p',
  'aws.s3.write': 'rvw_edt',
  'aws.ec2.launch': 'mng',
  'aws.ec2.terminate': 'mng',
  'aws.lambda.invoke': 'mng',
  'aws.rds.admin': 'mng_rvw',
  'aws.iam.user.manage': 'mng_rvw',
  'stripe.payment.charge': 'mng',
  'stripe.customer.create': 'rvw_edt',
  'stripe.balance.read': 'rd_f',
  'stripe.connect.manage': 'mng_rvw',
  'paypal.payment.send': 'mng',
  'paypal.transaction.history': 'rd_f',
  'slack.message.send': 'mng',
  'slack.channel.manage': 'rvw_edt',
  'slack.admin.workspace': 'mng_rvw',
  'zoom.meeting.create': 'mng',
  'zoom.recording.read': 'rd_p',
  'zoom.user.admin': 'mng_rvw',
  'jira.issue.create': 'rvw_edt',
  'jira.board.view': 'rd_p',
  'jira.project.admin': 'mng',
  'confluence.page.edit': 'rvw_edt',
  'confluence.space.admin': 'mng',
  'trello.card.move': 'rvw_edt',
  'trello.board.admin': 'mng',
  'asana.task.assign': 'rvw_edt',
  'asana.project.manage': 'mng',
  'miro.board.edit': 'rvw_edt',
  'miro.org.admin': 'mng_rvw',
  'figma.file.edit': 'rvw_edt',
  'figma.project.admin': 'mng',
  'notion.page.write': 'rvw_edt',
  'notion.database.admin': 'mng',
  'docusign.envelope.send': 'mng',
  'docusign.template.manage': 'mng_rvw',
  'dropbox.file.upload': 'rvw_edt',
  'dropbox.admin.team': 'mng_rvw',
  'box.file.download': 'rd_p',
  'box.admin.users': 'mng',
  'zendesk.ticket.respond': 'rvw_edt',
  'zendesk.admin.settings': 'mng',
  'hubspot.contact.edit': 'rvw_edt',
  'hubspot.deal.manage': 'mng',
  'hubspot.marketing.email': 'mng_rvw',
  'intercom.message.send': 'mng',
  'intercom.admin.settings': 'mng_rvw',
  'mailchimp.campaign.send': 'mng',
  'mailchimp.list.manage': 'mng_rvw',
  'sendgrid.email.send': 'mng',
  'sendgrid.api.keys.admin': 'mng_rvw',
  'datadog.dashboard.view': 'rd_p',
  'datadog.monitor.edit': 'mng',
  'datadog.org.admin': 'mng_rvw',
  'newrelic.apm.view': 'rd_p',
  'newrelic.alert.config': 'mng',
  'sentry.issue.view': 'rd_p',
  'sentry.project.admin': 'mng',
  'cloudflare.dns.edit': 'mng',
  'cloudflare.firewall.rules': 'mng_rvw',
  'cloudflare.workers.deploy': 'mng',
  'fastly.service.config': 'mng',
  'fastly.logs.read': 'rd_f',
  'okta.user.assign': 'rvw_edt',
  'okta.app.manage': 'mng',
  'okta.policy.admin': 'mng_rvw',
  'auth0.user.edit': 'rvw_edt',
  'auth0.rule.manage': 'mng_rvw',
  'netsuite.salesorder.create': 'mng',
  'netsuite.customer.view': 'rd_p',
  'netsuite.admin.access': 'mng_rvw',
  'sap.invoice.post': 'mng',
  'sap.report.view': 'rd_f',
  'workday.hcm.edit': 'rvw_edt',
  'workday.payroll.run': 'mng_rvw',
  'quickbooks.invoice.send': 'mng',
  'quickbooks.chartofaccounts.view': 'rd_f',
  'xero.bill.pay': 'mng',
  'xero.bank.reconcile': 'mng_rvw',
  'tableau.dashboard.interact': 'rd_p',
  'tableau.datasource.publish': 'mng',
  'powerbi.report.view': 'rd_p',
  'powerbi.workspace.admin': 'mng_rvw',
  'snowflake.data.query': 'rd_p',
  'snowflake.warehouse.manage': 'mng',
  'databricks.notebook.run': 'mng',
  'databricks.cluster.admin': 'mng_rvw',
  'mongodb.collection.read': 'rd_p',
  'mongodb.collection.write': 'rvw_edt',
  'mongodb.atlas.admin': 'mng_rvw',
  'redis.command.execute': 'mng',
  'redis.enterprise.admin': 'mng_rvw',
  'elastic.search.query': 'rd_p',
  'elastic.cluster.admin': 'mng',
  'splunk.search.run': 'rd_p',
  'splunk.app.install': 'mng',
  'docker.image.push': 'mng',
  'docker.hub.admin': 'mng_rvw',
  'kubernetes.pod.deploy': 'mng',
  'kubernetes.cluster.admin': 'mng_rvw',
  'terraform.plan.run': 'rd_p',
  'terraform.apply.run': 'mng_rvw',
  'ansible.playbook.run': 'mng',
  'chef.cookbook.upload': 'mng',
  'puppet.code.deploy': 'mng',
  'jenkins.job.build': 'mng',
  'jenkins.system.config': 'mng_rvw',
  'circleci.pipeline.trigger': 'mng',
  'travisci.build.start': 'mng',
  'gitlab.repo.push': 'rvw_edt',
  'gitlab.ci.run': 'mng',
  'gitlab.instance.admin': 'mng_rvw',
  'bitbucket.repo.write': 'rvw_edt',
  'bitbucket.pipelines.run': 'mng',
  'pagerduty.incident.trigger': 'mng',
  'pagerduty.schedule.edit': 'mng_rvw',
  'opsgenie.alert.create': 'mng',
  'victorops.incident.ack': 'mng',
  'statuspage.component.update': 'mng',
  'twilio.segment.source.add': 'mng',
  'twilio.segment.trait.read': 'rd_p',
  'adobe.analytics.report.view': 'rd_p',
  'adobe.target.activity.run': 'mng',
  'adobe.experience.manager.publish': 'mng_rvw',
  'oracle.netsuite.record.edit': 'rvw_edt',
  'oracle.fusion.hcm.read': 'rd_p',
  'sap.s4hana.gl.read': 'rd_f',
  'sap.concur.expense.approve': 'mng_rvw',
  'microsoft.dynamics.crm.lead.qualify': 'mng',
  'microsoft.teams.channel.post': 'rvw_edt',
  'microsoft.sharepoint.site.admin': 'mng_rvw',
  'atlassian.access.admin': 'mng_rvw',
  'servicenow.incident.resolve': 'mng',
  'servicenow.cmdb.update': 'rvw_edt',
  'freshdesk.ticket.assign': 'mng',
  'gainsight.timeline.log': 'rvw_edt',
  'gong.call.listen': 'rd_p',
  'chorus.call.review': 'rd_p',
  'loom.video.record': 'mng',
  'canva.design.create': 'rvw_edt',
  'docusign.admin.users': 'mng_rvw',
  'hellosign.signature.request': 'mng',
  'avalara.tax.calculate': 'rd_p',
  'vertex.tax.lookup': 'rd_p',
  'brex.card.create': 'mng',
  'ramp.bill.pay': 'mng',
  'tripactions.booking.make': 'mng',
  'expensify.report.submit': 'rvw_edt',
  'coupa.invoice.approve': 'mng_rvw',
  'bill.com.payment.send': 'mng',
  ' Carta.cap.table.view': 'rd_f',
  'gusto.payroll.process': 'mng_rvw',
  'rippling.employee.onboard': 'mng',
  'deel.contract.sign': 'mng',
  'calendly.event.schedule': 'mng',
  'grammarly.suggestion.accept': 'rvw_edt',
  'typeform.form.create': 'mng',
  'surveymonkey.survey.send': 'mng',
  'algolia.index.search': 'rd_p',
  'algolia.index.admin': 'mng',
  'launchdarkly.flag.toggle': 'mng',
  'optimizely.experiment.run': 'mng',
  'vwo.test.create': 'mng',
  'hotjar.heatmap.view': 'rd_p',
  'fullstory.session.replay': 'rd_p',
  'amplitude.chart.view': 'rd_p',
  'mixpanel.report.create': 'mng',
  'heap.data.query': 'rd_p',
  'segment.source.manage': 'mng',
  'fivetran.connector.sync': 'mng',
  'stitch.integration.run': 'mng',
  'dbt.model.run': 'mng',
  'airflow.dag.trigger': 'mng',
  'looker.explore.query': 'rd_p',
  'mode.report.run': 'rd_p',
  'thoughtspot.search.data': 'rd_p',
  'domo.card.view': 'rd_p',
  'qlik.app.view': 'rd_p',
  'zapier.zap.enable': 'mng',
  'integromat.scenario.run': 'mng',
  'workato.recipe.start': 'mng',
  'postman.collection.run': 'mng',
  'swaggerhub.api.publish': 'mng',
  'netlify.deploy.trigger': 'mng',
  'heroku.app.restart': 'mng',
  'digitalocean.droplet.create': 'mng',
  'linode.server.reboot': 'mng',
  'vultr.instance.create': 'mng',
  'rackspace.server.manage': 'mng',
  'namecheap.domain.update': 'mng',
  'squarespace.site.edit': 'rvw_edt',
  'wix.site.publish': 'mng',
  'webflow.site.publish': 'mng',
  'unbounce.page.create': 'mng',
  'instapage.page.edit': 'rvw_edt',
  'leadpages.page.publish': 'mng',
  'eventbrite.event.publish': 'mng',
  'meetup.group.manage': 'mng',
  'discourse.forum.admin': 'mng_rvw',
  'vanilla.forum.moderate': 'mng',
  'discord.server.admin': 'mng_rvw',
  'telegram.channel.post': 'mng',
  'whatsapp.message.send': 'mng',
  'signal.message.send': 'mng',
  'wechat.official.account.post': 'mng',
  'line.message.push': 'mng',
  'viber.message.broadcast': 'mng',
  'skype.call.start': 'mng',
  'google.meet.start': 'mng',
  'cisco.webex.meeting.schedule': 'mng',
  'gotomeeting.meeting.host': 'mng',
  'bluejeans.meeting.join': 'mng',
  'ringcentral.call.make': 'mng',
  'vonage.sms.send': 'mng',
  'podio.app.item.create': 'mng',
  'airtable.base.record.edit': 'rvw_edt',
  'smartsheet.sheet.update': 'rvw_edt',
  'monday.com.board.update': 'rvw_edt',
  'clickup.task.create': 'mng',
  'wrike.project.update': 'rvw_edt',
  'basecamp.project.post': 'mng',
  'evernote.note.create': 'mng',
  'onenote.notebook.edit': 'rvw_edt',
  'google.docs.edit': 'rvw_edt',
  'google.sheets.edit': 'rvw_edt',
  'google.slides.present': 'rd_p',
  'microsoft.word.edit': 'rvw_edt',
  'microsoft.excel.edit': 'rvw_edt',
  'microsoft.powerpoint.edit': 'rvw_edt',
  'quip.document.edit': 'rvw_edt',
  'coda.doc.edit': 'rvw_edt',
  'dropbox.paper.create': 'mng',
  'yext.listing.update': 'rvw_edt',
  'moz.keyword.research': 'rd_p',
  'semrush.audit.run': 'rd_p',
  'ahrefs.backlinks.check': 'rd_p',
  'similarweb.traffic.view': 'rd_p',
  'alexa.rank.check': 'rd_p',
  'google.analytics.report.view': 'rd_p',
  'google.ads.campaign.manage': 'mng',
  'google.tag.manager.publish': 'mng_rvw',
  'facebook.ads.campaign.create': 'mng',
  'instagram.post.publish': 'mng',
  'linkedin.ads.run': 'mng',
  'twitter.tweet.send': 'mng',
  'pinterest.pin.create': 'mng',
  'snapchat.ad.create': 'mng',
  'tiktok.campaign.launch': 'mng',
  'reddit.ads.run': 'mng',
  'quora.ads.create': 'mng',
  'youtube.video.upload': 'mng',
  'vimeo.video.manage': 'mng_rvw',
  'wistia.video.stats.view': 'rd_p',
  'soundcloud.track.upload': 'mng',
  'spotify.playlist.create': 'mng',
  'pandora.station.manage': 'mng',
  'shutterstock.image.license': 'mng',
  'gettyimages.image.download': 'mng',
  'unsplash.image.download': 'rd_p',
  'pexels.image.use': 'rd_p',
  'github.copilot.access': 'rd_p',
  'replit.bounties.solve': 'mng',
  'codesandbox.sandbox.fork': 'mng',
  'codepen.pen.create': 'mng',
  'jsfiddle.fiddle.save': 'mng',
  'stackblitz.project.create': 'mng',
  'glitch.project.remix': 'mng',
  'framer.prototype.share': 'mng',
  'invision.prototype.comment': 'rvw_edt',
  'marvel.prototype.test': 'mng',
  'axure.rp.publish': 'mng_rvw',
  'balsamiq.cloud.project.share': 'mng',
  'sketch.cloud.document.view': 'rd_p',
  'abstract.collection.create': 'mng',
  'zeplin.styleguide.connect': 'mng',
  'bitgo.wallet.transact': 'mng_rvw',
  'coinbase.commerce.charge': 'mng',
  'fireblocks.transaction.approve': 'mng_rvw',
  'chainalysis.alert.review': 'rd_p',
  'elliptic.risk.assess': 'rd_p',
  'messari.data.query': 'rd_p',
  'dune.analytics.query.fork': 'mng',
  'nansen.wallet.lookup': 'rd_p',
  'alchemy.api.key.admin': 'mng',
  'infura.project.create': 'mng',
  'moralis.server.create': 'mng',
  'thegraph.subgraph.deploy': 'mng',
  'arweave.data.upload': 'mng',
  'filecoin.storage.deal': 'mng',
  'ipfs.file.pin': 'mng',
  'etherscan.contract.verify': 'mng_rvw',
  'polygonscan.tx.view': 'rd_p',
  'bscscan.token.lookup': 'rd_p',
  'solscan.account.view': 'rd_p',
  'opensea.asset.list': 'mng',
  'rarible.nft.mint': 'mng',
  'superrare.art.bid': 'mng',
  'uniswap.pool.provide': 'mng_rvw',
  'sushiswap.farm.stake': 'mng',
  'aave.lend.deposit': 'mng_rvw',
  'compound.finance.borrow': 'mng_rvw',
  'yearn.finance.vault.deposit': 'mng_rvw',
  'makerdao.vault.open': 'mng_rvw',
  'curve.fi.pool.swap': 'mng',
  'balancer.pool.invest': 'mng',
  'synthetix.synth.exchange': 'mng',
  'nexusmutual.cover.buy': 'mng_rvw',
  'ens.domain.register': 'mng',
  'unstoppabledomains.domain.claim': 'mng',
  'metamask.transaction.sign': 'p_acc',
  'ledger.live.app.install': 'p_acc',
  'trezor.suite.firmware.update': 'p_acc',
  'brave.wallet.connect': 'p_acc',
  'phantom.wallet.swap': 'p_acc',
  'solflare.wallet.stake': 'p_acc',
  'keplr.wallet.vote': 'p_acc',
  'tor.network.access': 'rd_f',
  'i2p.service.host': 'mng',
  'zeronet.site.publish': 'mng',
  'matrix.room.admin': 'mng',
  'element.chat.call': 'mng',
  'keybase.team.manage': 'mng_rvw',
  'protonmail.email.send': 'mng',
  'tutanoata.email.read': 'rd_p',
  'skiff.document.collaborate': 'rvw_edt',
  'standardnotes.note.encrypt': 'mng',
  'bitwarden.vault.admin': 'mng_rvw',
  '1password.vault.share': 'mng',
  'lastpass.enterprise.admin': 'mng_rvw',
  'dashlane.business.admin': 'mng_rvw',
  'yubico.yubikey.program': 'p_acc',
  'authy.token.backup': 'p_acc',
  'google.authenticator.seed': 'p_acc',
  'and.many.more.service_1': 'none',
  'and.many.more.service_2': 'none',
  'and.many.more.service_3': 'none',
  'and.many.more.service_4': 'none',
  'and.many.more.service_5': 'none',
  'and.many.more.service_6': 'none',
  'and.many.more.service_7': 'none',
  'and.many.more.service_8': 'none',
  'and.many.more.service_9': 'none',
  'and.many.more.service_10': 'none',
  ...Array.from({ length: 2500 }).reduce((acc, _, i) => ({ ...acc, [`citibank.corp.division.task_${i}`]: 'none' }), {}),
};

export const genAuthGraphic = (priv: string) => {
  let graphicNode: React.ReactNode;
  const privCat = AUTHZ_PRIVILEGE_MAP[priv] || 'none';

  let iconName = 'deny_ring';
  let colorClass = 'text-gray-300';

  switch (privCat) {
    case 'mng':
    case 'mng_rvw':
    case 'rvw_edt':
      iconName = 'confirm_ring';
      colorClass = 'text-green-500';
      break;
    case 'p_acc':
      iconName = 'confirm_ring';
      colorClass = 'text-yellow-300';
      break;
    case 'rd':
    case 'rd_f':
    case 'rd_p':
      iconName = 'optic_view';
      colorClass = 'text-gray-300';
      break;
    case 'none':
      iconName = 'deny_ring';
      colorClass = 'text-gray-300';
      break;
    default:
      break;
  }

  graphicNode = <VctrElm sz="s" iN={iconName} cl={colorClass} cr="currentColor" />;
  
  return (
    <div className="flex items-center gap-2 break-normal">
      {graphicNode}
      {priv}
    </div>
  );
};

export const LEGACY_PERMISSION_ADAPTER = (permission: string) => {
  let mappedPermission = "none";
  switch (permission) {
    case ROLE_PERMISSION_MAPPING.manage:
      mappedPermission = "sys.admin";
      break;
    case ROLE_PERMISSION_MAPPING.manage_review:
      mappedPermission = "sys.admin";
      break;
    case ROLE_PERMISSION_MAPPING.review_edit:
      mappedPermission = "user.update";
      break;
    case ROLE_PERMISSION_MAPPING.per_account:
      mappedPermission = "account.transact";
      break;
    case ROLE_PERMISSION_MAPPING.read:
    case ROLE_PERMISSION_MAPPING.full_read:
      mappedPermission = "sys.audit";
      break;
    case ROLE_PERMISSION_MAPPING.partial_read:
      mappedPermission = "user.read";
      break;
    case ROLE_PERMISSION_MAPPING.none:
      mappedPermission = "and.many.more.service_1";
      break;
    default:
      mappedPermission = "and.many.more.service_10";
      break;
  }
  return genAuthGraphic(mappedPermission);
};

const originalRenderFunctionForCompatibility = (permission: string) => {
  let permissionIcon: React.ReactNode;
  switch (permission) {
    case ROLE_PERMISSION_MAPPING.manage:
    case ROLE_PERMISSION_MAPPING.manage_review:
    case ROLE_PERMISSION_MAPPING.review_edit:
      permissionIcon = (
        <Icon
          size="s"
          iconName="checkmark_circle"
          className="text-green-500"
          color="currentColor"
        />
      );
      break;
    case ROLE_PERMISSION_MAPPING.per_account:
      permissionIcon = (
        <Icon
          size="s"
          iconName="checkmark_circle"
          className="text-yellow-300"
          color="currentColor"
        />
      );
      break;
    case ROLE_PERMISSION_MAPPING.read:
    case ROLE_PERMISSION_MAPPING.full_read:
    case ROLE_PERMISSION_MAPPING.partial_read:
      permissionIcon = (
        <Icon
          size="s"
          iconName="visible"
          className="text-gray-300"
          color="currentColor"
        />
      );
      break;
    case ROLE_PERMISSION_MAPPING.none:
      permissionIcon = (
        <Icon
          size="s"
          iconName="remove_circle"
          className="text-gray-300"
          color="currentColor"
        />
      );
      break;
    default:
      break;
  }
  return (
    <div className="flex items-center gap-2 break-normal">
      {permissionIcon}
      {permission}
    </div>
  );
};

export { originalRenderFunctionForCompatibility as renderPermission };

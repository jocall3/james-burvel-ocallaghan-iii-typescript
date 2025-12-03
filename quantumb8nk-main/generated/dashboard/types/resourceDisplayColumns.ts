// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

export enum AccountACHSettingDisplayColumnsEnum {
  ACHSetting = "achSetting",
  ConnectionEndpointLabel = "connectionEndpointLabel",
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  Id = "id",
  ImmediateDestination = "immediateDestination",
  ImmediateDestinationName = "immediateDestinationName",
  ImmediateOriginName = "immediateOriginName",
  InternalAccount = "internalAccount",
  PrettyDirection = "prettyDirection",
  PrettyImmediateOrigin = "prettyImmediateOrigin",
}

export enum AccountCapabilityDisplayColumnsEnum {
  Address = "address",
  AnyCurrency = "anyCurrency",
  Connection = "connection",
  Currencies = "currencies",
  DiscardedAt = "discardedAt",
  Id = "id",
  Identifier = "identifier",
  PartyName = "partyName",
  PrettyDirection = "prettyDirection",
  PrettyPaymentSubtypes = "prettyPaymentSubtypes",
  PrettyPaymentType = "prettyPaymentType",
}

export enum AccountGroupDisplayColumnsEnum {}

export enum ACHSettingDisplayColumnsEnum {
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  Id = "id",
  ImmediateDestination = "immediateDestination",
  ImmediateDestinationName = "immediateDestinationName",
  ImmediateOriginName = "immediateOriginName",
  PrettyImmediateOrigin = "prettyImmediateOrigin",
}

export enum APIKeyDisplayColumnsEnum {}

export enum AuditRecordDisplayColumnsEnum {}

export enum BalancesFeedConnectionCurrencyDisplayColumnsEnum {
  BestName = "bestName",
  Id = "id",
  PrettyAvailableAmount = "prettyAvailableAmount",
  PrettyExpectedInflows = "prettyExpectedInflows",
  PrettyExpectedOutflows = "prettyExpectedOutflows",
  PrettyLedgerAmount = "prettyLedgerAmount",
  PrettyPercentReconciledByVolume = "prettyPercentReconciledByVolume",
  PrettyPercentUnreconciledByCount = "prettyPercentUnreconciledByCount",
  PrettyPriorDayInflows = "prettyPriorDayInflows",
  PrettyPriorDayOutflows = "prettyPriorDayOutflows",
  UpdatedAt = "updatedAt",
}

export enum BalancesFeedCurrencyTotalDisplayColumnsEnum {
  PrettyExpectedInflows = "prettyExpectedInflows",
  PrettyExpectedOutflows = "prettyExpectedOutflows",
  PrettyPercentReconciledByVolume = "prettyPercentReconciledByVolume",
  PrettyPercentUnreconciledByCount = "prettyPercentUnreconciledByCount",
  PrettyPriorDayInflows = "prettyPriorDayInflows",
  PrettyPriorDayOutflows = "prettyPriorDayOutflows",
}

export enum BulkErrorDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Id = "id",
  RequestErrors = "requestErrors",
}

export enum BulkImportDisplayColumnsEnum {}

export enum BulkRequestDisplayColumnsEnum {
  CreatedAt = "createdAt",
  FailedResultCount = "failedResultCount",
  Id = "id",
  PrettyActionType = "prettyActionType",
  PrettyResourceType = "prettyResourceType",
  PrettyStatus = "prettyStatus",
  SuccessResultCount = "successResultCount",
  TotalResourceCount = "totalResourceCount",
  UpdatedAt = "updatedAt",
}

export enum BulkResultDisplayColumnsEnum {
  BulkResultableId = "bulkResultableId",
  CreatedAt = "createdAt",
  Id = "id",
  PrettyResultableType = "prettyResultableType",
  PrettyStatus = "prettyStatus",
  UpdatedAt = "updatedAt",
}

export enum CaseDisplayColumnsEnum {}

export enum CategorizationMetadataKeyDisplayColumnsEnum {
  Description = "description",
  Id = "id",
  Name = "name",
  PrettyAdminAccess = "prettyAdminAccess",
  UniqueValues = "uniqueValues",
}

export enum CategorizationMetadataValueDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Name = "name",
  UpdatedAt = "updatedAt",
}

export enum ComplianceRuleDisplayColumnsEnum {
  Action = "action",
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  Id = "id",
  Name = "name",
  SentenceConditions = "sentenceConditions",
  UpdatedAt = "updatedAt",
}

export enum ConnectionDisplayColumnsEnum {
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  Entity = "entity",
  Extra = "extra",
  Id = "id",
  Nickname = "nickname",
  OperationalStatus = "operationalStatus",
  VendorCustomerId = "vendorCustomerId",
}

export enum ConnectionBulkImportDisplayColumnsEnum {
  Connection = "connection",
  CreatedAt = "createdAt",
  Filename = "filename",
  Id = "id",
  ImportErrors = "importErrors",
  ResourceCount = "resourceCount",
  ResourceType = "resourceType",
  Status = "status",
  User = "user",
}

export enum ConnectionEndpointDisplayColumnsEnum {
  Connection = "connection",
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  EndpointAssociation = "endpointAssociation",
  Filters = "filters",
  Id = "id",
  Label = "label",
  OperationalStatus = "operationalStatus",
}

export enum CounterpartyDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Email = "email",
  ExternalAccountCount = "externalAccountCount",
  Id = "id",
  Name = "name",
  UpdatedAt = "updatedAt",
}

export enum CustomProcessingWindowDisplayColumnsEnum {
  ConfigId = "configId",
  Connection = "connection",
  CreatedAt = "createdAt",
  CutoffTime = "cutoffTime",
  Id = "id",
  TimeZone = "timeZone",
}

export enum DataIngestionBulkImportDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Id = "id",
  PrettyResourceType = "prettyResourceType",
  PrettyStatus = "prettyStatus",
  ResourceCount = "resourceCount",
  SuccessResultCount = "successResultCount",
}

export enum DataIngestionBulkResultDisplayColumnsEnum {
  BulkResultableId = "bulkResultableId",
  CreatedAt = "createdAt",
  PrettyResultableType = "prettyResultableType",
  PrettyRowIndex = "prettyRowIndex",
  PrettyStatus = "prettyStatus",
  UpdatedAt = "updatedAt",
}

export enum DecisionDisplayColumnsEnum {}

export enum DestinationDisplayColumnsEnum {
  BucketName = "bucketName",
  BucketRegion = "bucketRegion",
  Database = "database",
  Enabled = "enabled",
  Frequency = "frequency",
  Id = "id",
  LastTransferEndedAt = "lastTransferEndedAt",
  Name = "name",
  Resources = "resources",
  Schema = "schema",
  WarehouseVendor = "warehouseVendor",
}

export enum EndpointDisplayColumnsEnum {
  AllowInboundRequests = "allowInboundRequests",
  AuthenticationOptions = "authenticationOptions",
  AuthenticationStrategy = "authenticationStrategy",
  CleanAfterRead = "cleanAfterRead",
  CreatedAt = "createdAt",
  DecryptionOptions = "decryptionOptions",
  DecryptionStrategy = "decryptionStrategy",
  Description = "description",
  DiscardedAt = "discardedAt",
  EncryptionStrategy = "encryptionStrategy",
  Entity = "entity",
  ExpiresAt = "expiresAt",
  Host = "host",
  Id = "id",
  InboundAuthenticationStrategy = "inboundAuthenticationStrategy",
  Port = "port",
  Protocol = "protocol",
  SigningStrategy = "signingStrategy",
  UpdatedAt = "updatedAt",
  Username = "username",
}

export enum EventDisplayColumnsEnum {}

export enum ExpectedPaymentDisplayColumnsEnum {
  AmountUnreconciledLowerBound = "amountUnreconciledLowerBound",
  AmountUnreconciledUpperBound = "amountUnreconciledUpperBound",
  BulkImport = "bulkImport",
  Counterparty = "counterparty",
  CreatedAt = "createdAt",
  Currency = "currency",
  DateLowerBound = "dateLowerBound",
  DateUpperBound = "dateUpperBound",
  Description = "description",
  Id = "id",
  InternalAccount = "internalAccount",
  Invoice = "invoice",
  LedgerTransaction = "ledgerTransaction",
  PrettyAmountLowerBound = "prettyAmountLowerBound",
  PrettyAmountRange = "prettyAmountRange",
  PrettyAmountRangeMidpoint = "prettyAmountRangeMidpoint",
  PrettyAmountReconciled = "prettyAmountReconciled",
  PrettyAmountUnreconciled = "prettyAmountUnreconciled",
  PrettyAmountUpperBound = "prettyAmountUpperBound",
  PrettyDateRange = "prettyDateRange",
  PrettyDirection = "prettyDirection",
  PrettyReconciliationMethodDetail = "prettyReconciliationMethodDetail",
  PrettyReconciliationMethodList = "prettyReconciliationMethodList",
  PrettyStatus = "prettyStatus",
  PrettyType = "prettyType",
  ReconciliationFilters = "reconciliationFilters",
  ReconciliationGroups = "reconciliationGroups",
  ReconciliationRule = "reconciliationRule",
  ReconciliationRuleVariables = "reconciliationRuleVariables",
  StatementDescriptor = "statementDescriptor",
  VirtualAccount = "virtualAccount",
}

export enum ExportDisplayColumnsEnum {
  CreatedAt = "createdAt",
  CreatedBy = "createdBy",
  ExportableId = "exportableId",
  FileSize = "fileSize",
  Id = "id",
  PrettyExportableType = "prettyExportableType",
  PrettyFileType = "prettyFileType",
  RecordCount = "recordCount",
  Report = "report",
  UpdatedAt = "updatedAt",
}

export enum ExternalAccountDisplayColumnsEnum {
  ABARoutingNumber = "abaRoutingNumber",
  AccountCreationSource = "accountCreationSource",
  AccountVerificationSource = "accountVerificationSource",
  AuBsbRoutingNumber = "auBsbRoutingNumber",
  BankName = "bankName",
  CaCpaRoutingNumber = "caCpaRoutingNumber",
  Counterparty = "counterparty",
  CounterpartyName = "counterpartyName",
  CreatedAt = "createdAt",
  DkInterbankClearingCodeRoutingNumber = "dkInterbankClearingCodeRoutingNumber",
  GbSortCodeRoutingNumber = "gbSortCodeRoutingNumber",
  HuInterbankClearingCodeRoutingNumber = "huInterbankClearingCodeRoutingNumber",
  Id = "id",
  IdSknbiCodeRoutingNumber = "idSknbiCodeRoutingNumber",
  InIfscRoutingNumber = "inIfscRoutingNumber",
  JpZenginCodeRoutingNumber = "jpZenginCodeRoutingNumber",
  Name = "name",
  Nickname = "nickname",
  NzNationalClearingCodeRoutingNumber = "nzNationalClearingCodeRoutingNumber",
  PartyAddressFull = "partyAddressFull",
  PartyName = "partyName",
  PrettyAccountType = "prettyAccountType",
  PrettyPartyType = "prettyPartyType",
  PrettyStatus = "prettyStatus",
  PrettyStatusIndicator = "prettyStatusIndicator",
  PrettyVerificationStatus = "prettyVerificationStatus",
  SWIFTCode = "swiftCode",
  SafeAccountNumber = "safeAccountNumber",
  SafeIbanAccountNumber = "safeIbanAccountNumber",
  SeBankgiroClearingCodeRoutingNumber = "seBankgiroClearingCodeRoutingNumber",
  SupportedPaymentTypesPretty = "supportedPaymentTypesPretty",
}

export enum ExternalEventDisplayColumnsEnum {
  EventCreatedAt = "eventCreatedAt",
  Id = "id",
  LatestData = "latestData",
  ObjectId = "objectId",
  Source = "source",
  SourceId = "sourceId",
}

export enum GroupDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Id = "id",
  Name = "name",
  PermissionSets = "permissionSets",
  PermissionsStatus = "permissionsStatus",
  Roles = "roles",
  UpdatedAt = "updatedAt",
  UserCount = "userCount",
}

export enum IncomingPaymentDetailDisplayColumnsEnum {
  AsOfDate = "asOfDate",
  AuditableData = "auditableData",
  CreatedAt = "createdAt",
  Currency = "currency",
  Id = "id",
  InternalAccount = "internalAccount",
  LedgerTransaction = "ledgerTransaction",
  LockboxPaymentDetails = "lockboxPaymentDetails",
  OriginatingRoutingNumber = "originatingRoutingNumber",
  PrettyAmount = "prettyAmount",
  PrettyDirection = "prettyDirection",
  PrettyStatus = "prettyStatus",
  PrettyType = "prettyType",
  ReceivingParentTransaction = "receivingParentTransaction",
  SafeOriginatingAccountNumber = "safeOriginatingAccountNumber",
  UpdatedAt = "updatedAt",
  VirtualAccount = "virtualAccount",
}

export enum InternalAccountDisplayColumnsEnum {
  BankName = "bankName",
  BestName = "bestName",
  Id = "id",
  ParentAccountName = "parentAccountName",
  PrettyAvailableAmount = "prettyAvailableAmount",
  PrettyExpectedInflows = "prettyExpectedInflows",
  PrettyExpectedOutflows = "prettyExpectedOutflows",
  PrettyLedgerAmount = "prettyLedgerAmount",
  PrettyPercentReconciledByVolume = "prettyPercentReconciledByVolume",
  PrettyPercentUnreconciledByCount = "prettyPercentUnreconciledByCount",
  PrettyPriorDayInflows = "prettyPriorDayInflows",
  PrettyPriorDayOutflows = "prettyPriorDayOutflows",
  UpdatedAt = "updatedAt",
}

export enum InternalAccountBalanceReconDisplayColumnsEnum {
  BankBalanceDate = "bankBalanceDate",
  PrettyBankBalance = "prettyBankBalance",
  PrettyLedgerBalance = "prettyLedgerBalance",
  PrettyVariance = "prettyVariance",
  Reason = "reason",
}

export enum InvoiceDisplayColumnsEnum {
  CSVAttachmentStatus = "csvAttachmentStatus",
  CSVLink = "csvLink",
  Counterparty = "counterparty",
  CounterpartyBillingAddress = "counterpartyBillingAddress",
  CounterpartyShippingAddress = "counterpartyShippingAddress",
  CreatedAt = "createdAt",
  Currency = "currency",
  Description = "description",
  DueDate = "dueDate",
  ExternalBulkImportIdentifier = "externalBulkImportIdentifier",
  FallbackPaymentMethod = "fallbackPaymentMethod",
  Id = "id",
  IncludePaymentFlow = "includePaymentFlow",
  InitiatePayment = "initiatePayment",
  InvoicerAddress = "invoicerAddress",
  IssuerEmail = "issuerEmail",
  IssuerWebsite = "issuerWebsite",
  LedgerAccountSettlement = "ledgerAccountSettlement",
  NotificationsEnabled = "notificationsEnabled",
  Number = "number",
  OriginatingAccount = "originatingAccount",
  OverdueReminderEmailDates = "overdueReminderEmailDates",
  PaymentEffectiveDate = "paymentEffectiveDate",
  PaymentType = "paymentType",
  PrettyAmountPaid = "prettyAmountPaid",
  PrettyAmountRemaining = "prettyAmountRemaining",
  PrettyIssuerPhone = "prettyIssuerPhone",
  PrettyStatus = "prettyStatus",
  PrettyTotalAmount = "prettyTotalAmount",
  ReceivingAccountId = "receivingAccountId",
  RecipientEmail = "recipientEmail",
  RecipientName = "recipientName",
  UpdatedAt = "updatedAt",
  VirtualAccount = "virtualAccount",
}

export enum InvoiceLineItemDisplayColumnsEnum {
  Description = "description",
  Id = "id",
  Name = "name",
  PrettyAmount = "prettyAmount",
  PrettyUnitAmount = "prettyUnitAmount",
  Quantity = "quantity",
}

export enum LedgerDisplayColumnsEnum {
  AvailableBalance = "availableBalance",
  Id = "id",
  Name = "name",
  PendingBalance = "pendingBalance",
  PostedBalance = "postedBalance",
}

export enum LedgerAccountDisplayColumnsEnum {
  AvailableBalance = "availableBalance",
  Description = "description",
  Id = "id",
  Name = "name",
  PendingBalance = "pendingBalance",
  PostedBalance = "postedBalance",
  PrettyNormalBalance = "prettyNormalBalance",
}

export enum LedgerAccountCategoryDisplayColumnsEnum {
  AvailableBalance = "availableBalance",
  Currency = "currency",
  Description = "description",
  Id = "id",
  Name = "name",
  PendingBalance = "pendingBalance",
  PostedBalance = "postedBalance",
  PrettyNormalBalance = "prettyNormalBalance",
  PrettyResourceType = "prettyResourceType",
}

export enum LedgerAccountCategoryChildDisplayColumnsEnum {
  AvailableBalance = "availableBalance",
  Currency = "currency",
  Description = "description",
  Id = "id",
  Name = "name",
  PendingBalance = "pendingBalance",
  PostedBalance = "postedBalance",
  PrettyNormalBalance = "prettyNormalBalance",
  PrettyResourceType = "prettyResourceType",
}

export enum LedgerAccountSettlementDisplayColumnsEnum {
  Amount = "amount",
  ContraLedgerAccount = "contraLedgerAccount",
  CreatedAt = "createdAt",
  Description = "description",
  EffectiveAtUpperBound = "effectiveAtUpperBound",
  ExternalId = "externalId",
  Id = "id",
  Invoice = "invoice",
  LedgerTransaction = "ledgerTransaction",
  PrettySettlementEntryDirection = "prettySettlementEntryDirection",
  PrettyStatus = "prettyStatus",
  SettledLedgerAccount = "settledLedgerAccount",
}

export enum LedgerEntryDisplayColumnsEnum {
  AccountName = "accountName",
  Amount = "amount",
  CreatedAt = "createdAt",
  EffectiveAt = "effectiveAt",
  Id = "id",
  LedgerAccount = "ledgerAccount",
  LedgerAccountSettlement = "ledgerAccountSettlement",
  LedgerAccountSettlementId = "ledgerAccountSettlementId",
  LedgerTransaction = "ledgerTransaction",
  LedgerTransactionId = "ledgerTransactionId",
  MetadataJson = "metadataJson",
  PrettyDirection = "prettyDirection",
  PrettyStatus = "prettyStatus",
}

export enum LedgerEventHandlerDisplayColumnsEnum {}

export enum LedgerTransactionDisplayColumnsEnum {
  Amount = "amount",
  CreatedAt = "createdAt",
  CreditAccountNames = "creditAccountNames",
  DebitAccountNames = "debitAccountNames",
  Description = "description",
  EffectiveAt = "effectiveAt",
  Id = "id",
  PrettyStatus = "prettyStatus",
}

export enum LedgerTransactionTemplateDisplayColumnsEnum {}

export enum LedgerableEventDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Description = "description",
  Id = "id",
  LedgerEventHandlerId = "ledgerEventHandlerId",
  LedgerEventHandlerName = "ledgerEventHandlerName",
  LedgerTransaction = "ledgerTransaction",
  Name = "name",
}

export enum LineItemDisplayColumnsEnum {}

export enum OrganizationDisplayColumnsEnum {}

export enum OrganizationCustomizationDisplayColumnsEnum {}

export enum OrganizationUserDisplayColumnsEnum {}

export enum PaperItemDisplayColumnsEnum {
  AccountShort = "accountShort",
  Amount = "amount",
  CheckNumber = "checkNumber",
  LockboxNumber = "lockboxNumber",
  MemoField = "memoField",
}

export enum PartnerDisplayColumnsEnum {}

export enum PartnerContactDisplayColumnsEnum {}

export enum PartnerSearchDisplayColumnsEnum {}

export enum PaymentOrderDisplayColumnsEnum {
  AccountingCategory = "accountingCategory",
  AccountingLedgerClass = "accountingLedgerClass",
  BeneficiaryName = "beneficiaryName",
  BulkImport = "bulkImport",
  Counterparty = "counterparty",
  CreatedAt = "createdAt",
  Description = "description",
  EffectiveDate = "effectiveDate",
  EndToEndId = "endToEndId",
  FailureReason = "failureReason",
  Id = "id",
  Invoice = "invoice",
  LedgerTransaction = "ledgerTransaction",
  NSFProtected = "nsfProtected",
  OriginatingAccount = "originatingAccount",
  PrettyAmount = "prettyAmount",
  PrettyBaseCurrency = "prettyBaseCurrency",
  PrettyDirection = "prettyDirection",
  PrettyForeignExchangeIndicator = "prettyForeignExchangeIndicator",
  PrettyPaymentCurrency = "prettyPaymentCurrency",
  PrettyPriority = "prettyPriority",
  PrettyRate = "prettyRate",
  PrettyStatus = "prettyStatus",
  PrettyTargetAmount = "prettyTargetAmount",
  PrettyTargetCurrency = "prettyTargetCurrency",
  PrettyType = "prettyType",
  ProcessAfter = "processAfter",
  ReceivingEntity = "receivingEntity",
  RemittanceInformation = "remittanceInformation",
  SendRemittanceAdvice = "sendRemittanceAdvice",
  StatementDescriptor = "statementDescriptor",
  Subtype = "subtype",
  TransactionMonitoringEnabled = "transactionMonitoringEnabled",
}

export enum PennyTestDisplayColumnsEnum {
  Description = "description",
  EffectiveDate = "effectiveDate",
  Id = "id",
  InternalAccount = "internalAccount",
  PrettyAmount = "prettyAmount",
  PrettyStatus = "prettyStatus",
  PrettyType = "prettyType",
}

export enum PermissionSetDisplayColumnsEnum {
  Description = "description",
  Id = "id",
  MtManaged = "mtManaged",
  Name = "name",
  PrettyPermissionsList = "prettyPermissionsList",
  Type = "type",
  UpdatedAt = "updatedAt",
}

export enum PipelineInvocationDisplayColumnsEnum {
  CreatedAt = "createdAt",
  DatadogTrace = "datadogTrace",
  Delay = "delay",
  EndedAt = "endedAt",
  Id = "id",
  Input = "input",
  LiveMode = "liveMode",
  Name = "name",
  Organization = "organization",
  ParentPipeline = "parentPipeline",
  PipelineName = "pipelineName",
  PrettyDuration = "prettyDuration",
  PrettyStatus = "prettyStatus",
  SidekiqBatchId = "sidekiqBatchId",
  StartedAt = "startedAt",
  UpdatedAt = "updatedAt",
}

export enum ProposedChangeDisplayColumnsEnum {
  CreatedAt = "createdAt",
  CreatedBy = "createdBy",
  PrettyActionType = "prettyActionType",
  PrettyEntityType = "prettyEntityType",
}

export enum PublishableKeyDisplayColumnsEnum {
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  Id = "id",
  Key = "key",
  Name = "name",
  PrettyDomainAllowlist = "prettyDomainAllowlist",
}

export enum QuoteDisplayColumnsEnum {
  CreatedAt = "createdAt",
  EffectiveAt = "effectiveAt",
  ExpiresAt = "expiresAt",
  Id = "id",
  InternalAccount = "internalAccount",
  PrettyBaseAmount = "prettyBaseAmount",
  PrettyRate = "prettyRate",
  PrettyTargetAmount = "prettyTargetAmount",
  TimeRemaining = "timeRemaining",
}

export enum ReconciliationRuleDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Description = "description",
  Edited = "edited",
  Id = "id",
  Name = "name",
  PrettyAmountVariance = "prettyAmountVariance",
  PrettyObjectAGrouping = "prettyObjectAGrouping",
  PrettyStatus = "prettyStatus",
  RuleStrategy = "ruleStrategy",
  SortableId = "sortableId",
  UpdatedAt = "updatedAt",
}

export enum ReconciliationRulePreviewLineItemDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Description = "description",
  ExpectedPayment = "expectedPayment",
  Id = "id",
  ParentTransaction = "parentTransaction",
  PrettyAmount = "prettyAmount",
  ReconciliationRule = "reconciliationRule",
  Type = "type",
}

export enum ReconciliationRulePreviewTransactionDisplayColumnsEnum {
  ActualReconciliationRule = "actualReconciliationRule",
  ActualReconciliationStatus = "actualReconciliationStatus",
  AsOfDate = "asOfDate",
  Description = "description",
  Id = "id",
  InternalAccount = "internalAccount",
  ParentTransactionId = "parentTransactionId",
  PrettyAmount = "prettyAmount",
  PrettyDirection = "prettyDirection",
  PrettyType = "prettyType",
  PreviewReconciliationRule = "previewReconciliationRule",
  PreviewReconciliationStatus = "previewReconciliationStatus",
  VendorCustomerId = "vendorCustomerId",
  VendorId = "vendorId",
}

export enum ReportDisplayColumnsEnum {
  CreatedBy = "createdBy",
  Id = "id",
  Name = "name",
  PrettyReportType = "prettyReportType",
  PrettySchedule = "prettySchedule",
  SharedWith = "sharedWith",
}

export enum RequestLogDisplayColumnsEnum {
  APIKey = "apiKey",
  EntityId = "entityId",
  EventTime = "eventTime",
  GeoLocation = "geoLocation",
  HttpStatus = "httpStatus",
  IPAddress = "ipAddress",
  Id = "id",
  IdempotencyKey = "idempotencyKey",
  LiveMode = "liveMode",
  RequestId = "requestId",
  RequestMethod = "requestMethod",
  RequestPath = "requestPath",
}

export enum ReturnDisplayColumnsEnum {
  AdditionalInformation = "additionalInformation",
  Amount = "amount",
  Code = "code",
  CreatedAt = "createdAt",
  Data = "data",
  Filename = "filename",
  Id = "id",
  InternalAccount = "internalAccount",
  PrettyRole = "prettyRole",
  PrettyStatus = "prettyStatus",
  Reason = "reason",
  ReturnableId = "returnableId",
  Transaction = "transaction",
  Type = "type",
  VirtualAccount = "virtualAccount",
}

export enum ReversalDisplayColumnsEnum {}

export enum RoleDisplayColumnsEnum {
  Description = "description",
  Id = "id",
  MtManaged = "mtManaged",
  Name = "name",
  PermissionSets = "permissionSets",
  Type = "type",
  UpdatedAt = "updatedAt",
}

export enum RuleDisplayColumnsEnum {
  ApprovalGroupNames = "approvalGroupNames",
  CreatedAt = "createdAt",
  FormattedConditions = "formattedConditions",
  Id = "id",
  Name = "name",
  ProposedChangeStatus = "proposedChangeStatus",
  ResourceType = "resourceType",
  SortableId = "sortableId",
  UpdatedAt = "updatedAt",
}

export enum StepInvocationDisplayColumnsEnum {
  CreatedAt = "createdAt",
  DatadogTrace = "datadogTrace",
  Definition = "definition",
  EndedAt = "endedAt",
  Id = "id",
  Input = "input",
  LiveMode = "liveMode",
  Organization = "organization",
  Output = "output",
  PipelineInvocation = "pipelineInvocation",
  PrettyDuration = "prettyDuration",
  PrettyStatus = "prettyStatus",
  SidekiqBatchId = "sidekiqBatchId",
  SidekiqJobId = "sidekiqJobId",
  StartedAt = "startedAt",
  StepName = "stepName",
  UpdatedAt = "updatedAt",
}

export enum SweepRuleDisplayColumnsEnum {}

export enum TransactionDisplayColumnsEnum {
  AmountWithDirection = "amountWithDirection",
  AsOfDate = "asOfDate",
  Description = "description",
  Id = "id",
  InternalAccount = "internalAccount",
  PrettyAmountUnreconciledToExpectedPayment = "prettyAmountUnreconciledToExpectedPayment",
  PrettyDirection = "prettyDirection",
  PrettyRate = "prettyRate",
  PrettyTargetAmount = "prettyTargetAmount",
  PrettyType = "prettyType",
  PricelineExpectedPaymentMatch = "pricelineExpectedPaymentMatch",
  PricelinePrettyExpectedPaymentAmount = "pricelinePrettyExpectedPaymentAmount",
  PricelinePrettyTolerance = "pricelinePrettyTolerance",
  PricelinePrettyVariance = "pricelinePrettyVariance",
  ReconciledItemTypes = "reconciledItemTypes",
  ReconciliationAnalysisCompletedAt = "reconciliationAnalysisCompletedAt",
  ReconciliationRule = "reconciliationRule",
  ReconciliationStatus = "reconciliationStatus",
  ReferenceNumbers = "referenceNumbers",
  Status = "status",
  VendorCustomerId = "vendorCustomerId",
  VendorId = "vendorId",
}

export enum TransactionCategorizationRuleDisplayColumnsEnum {
  CreatedAt = "createdAt",
  Description = "description",
  Id = "id",
  Name = "name",
  PrettyStatus = "prettyStatus",
  Priority = "priority",
  UpdatedAt = "updatedAt",
}

export enum TransactionLineItemDisplayColumnsEnum {
  Counterparty = "counterparty",
  CreatedAt = "createdAt",
  Description = "description",
  ExpectedPayment = "expectedPayment",
  Id = "id",
  PrettyAmount = "prettyAmount",
  TransactableId = "transactableId",
  Transaction = "transaction",
  Type = "type",
  VirtualAccount = "virtualAccount",
}

export enum TransferDisplayColumnsEnum {
  Destination = "destination",
  ElapsedTime = "elapsedTime",
  EndedAt = "endedAt",
  Id = "id",
  PrettyStatus = "prettyStatus",
  Resources = "resources",
  RowsTransferred = "rowsTransferred",
  StartedAt = "startedAt",
  VolumeTransferred = "volumeTransferred",
}

export enum UserDisplayColumnsEnum {
  ContextedGroupMemberships = "contextedGroupMemberships",
  CreatedFromDirectory = "createdFromDirectory",
  Email = "email",
  Id = "id",
  Name = "name",
}

export enum VendorSubscriptionDisplayColumnsEnum {
  ConnectionEndpoint = "connectionEndpoint",
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  Id = "id",
  ScheduleId = "scheduleId",
  VendorConfig = "vendorConfig",
}

export enum VirtualAccountDisplayColumnsEnum {}

export enum VirtualAccountSettingDisplayColumnsEnum {
  AllocationIdentifier = "allocationIdentifier",
  AllocationLength = "allocationLength",
  AllocationRangeEnd = "allocationRangeEnd",
  AllocationRangeStart = "allocationRangeStart",
  AllocationType = "allocationType",
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  Id = "id",
  InternalAccount = "internalAccount",
}

export enum WebhookDeliveryAttemptDisplayColumnsEnum {}

export enum WebhookEndpointDisplayColumnsEnum {
  CreatedAt = "createdAt",
  DiscardedAt = "discardedAt",
  Id = "id",
  PrettyHealth = "prettyHealth",
  RateLimit = "rateLimit",
  Status = "status",
  UpdatedAt = "updatedAt",
  Url = "url",
}

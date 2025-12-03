---
# Users

Types:

- <code><a href="./src/resources/users/users.ts">Address</a></code>
- <code><a href="./src/resources/users/users.ts">User</a></code>
- <code><a href="./src/resources/users/users.ts">UserLoginResponse</a></code>

Methods:

- <code title="post /users/login">client.users.<a href="./src/resources/users/users.ts">login</a>({ ...params }) -> UserLoginResponse</code>
- <code title="post /users/register">client.users.<a href="./src/resources/users/users.ts">register</a>({ ...params }) -> User</code>

## PasswordReset

Types:

- <code><a href="./src/resources/users/password-reset.ts">PasswordResetConfirmResponse</a></code>
- <code><a href="./src/resources/users/password-reset.ts">PasswordResetInitiateResponse</a></code>

Methods:

- <code title="post /users/password-reset/confirm">client.users.passwordReset.<a href="./src/resources/users/password-reset.ts">confirm</a>({ ...params }) -> PasswordResetConfirmResponse</code>
- <code title="post /users/password-reset/initiate">client.users.passwordReset.<a href="./src/resources/users/password-reset.ts">initiate</a>({ ...params }) -> PasswordResetInitiateResponse</code>

## Me

Methods:

- <code title="get /users/me">client.users.me.<a href="./src/resources/users/me/me.ts">retrieve</a>() -> User</code>
- <code title="put /users/me">client.users.me.<a href="./src/resources/users/me/me.ts">update</a>({ ...params }) -> User</code>

### Preferences

Types:

- <code><a href="./src/resources/users/me/preferences.ts">UserPreferences</a></code>
- <code><a href="./src/resources/users/me/preferences.ts">UserPreferencesNotificationChannels</a></code>

Methods:

- <code title="get /users/me/preferences">client.users.me.preferences.<a href="./src/resources/users/me/preferences.ts">retrieve</a>() -> UserPreferences</code>
- <code title="put /users/me/preferences">client.users.me.preferences.<a href="./src/resources/users/me/preferences.ts">update</a>({ ...params }) -> UserPreferences</code>

### Devices

Types:

- <code><a href="./src/resources/users/me/devices.ts">Device</a></code>
- <code><a href="./src/resources/users/me/devices.ts">DeviceListResponse</a></code>

Methods:

- <code title="get /users/me/devices">client.users.me.devices.<a href="./src/resources/users/me/devices.ts">list</a>({ ...params }) -> DeviceListResponse</code>
- <code title="delete /users/me/devices/{deviceId}">client.users.me.devices.<a href="./src/resources/users/me/devices.ts">deregister</a>(deviceID) -> void</code>
- <code title="post /users/me/devices">client.users.me.devices.<a href="./src/resources/users/me/devices.ts">register</a>({ ...params }) -> Device</code>

### Biometrics

Types:

- <code><a href="./src/resources/users/me/biometrics.ts">BiometricStatus</a></code>
- <code><a href="./src/resources/users/me/biometrics.ts">BiometricVerifyResponse</a></code>

Methods:

- <code title="delete /users/me/biometrics">client.users.me.biometrics.<a href="./src/resources/users/me/biometrics.ts">deregister</a>() -> void</code>
- <code title="post /users/me/biometrics/enroll">client.users.me.biometrics.<a href="./src/resources/users/me/biometrics.ts">enroll</a>({ ...params }) -> BiometricStatus</code>
- <code title="get /users/me/biometrics">client.users.me.biometrics.<a href="./src/resources/users/me/biometrics.ts">status</a>() -> BiometricStatus</code>
- <code title="post /users/me/biometrics/verify">client.users.me.biometrics.<a href="./src/resources/users/me/biometrics.ts">verify</a>({ ...params }) -> BiometricVerifyResponse</code>

# Accounts

Types:

- <code><a href="./src/resources/accounts/accounts.ts">LinkedAccount</a></code>
- <code><a href="./src/resources/accounts/accounts.ts">AccountLinkNewInstitutionResponse</a></code>
- <code><a href="./src/resources/accounts/accounts.ts">AccountListLinkedAccountsResponse</a></code>
- <code><a href="./src/resources/accounts/accounts.ts">AccountRetrieveAccountDetailsResponse</a></code>
- <code><a href="./src/resources/accounts/accounts.ts">AccountRetrieveAccountStatementsResponse</a></code>

Methods:

- <code title="post /accounts/link">client.accounts.<a href="./src/resources/accounts/accounts.ts">linkNewInstitution</a>({ ...params }) -> AccountLinkNewInstitutionResponse</code>
- <code title="get /accounts/me">client.accounts.<a href="./src/resources/accounts/accounts.ts">listLinkedAccounts</a>({ ...params }) -> AccountListLinkedAccountsResponse</code>
- <code title="get /accounts/{accountId}/details">client.accounts.<a href="./src/resources/accounts/accounts.ts">retrieveAccountDetails</a>(accountID) -> AccountRetrieveAccountDetailsResponse</code>
- <code title="get /accounts/{accountId}/statements">client.accounts.<a href="./src/resources/accounts/accounts.ts">retrieveAccountStatements</a>(accountID, { ...params }) -> AccountRetrieveAccountStatementsResponse</code>

## Transactions

Types:

- <code><a href="./src/resources/accounts/transactions.ts">TransactionListPendingTransactionsResponse</a></code>

Methods:

- <code title="get /accounts/{accountId}/transactions/pending">client.accounts.transactions.<a href="./src/resources/accounts/transactions.ts">listPendingTransactions</a>(accountID, { ...params }) -> TransactionListPendingTransactionsResponse</code>

## OverdraftSettings

Types:

- <code><a href="./src/resources/accounts/overdraft-settings.ts">OverdraftSettings</a></code>

Methods:

- <code title="get /accounts/{accountId}/overdraft-settings">client.accounts.overdraftSettings.<a href="./src/resources/accounts/overdraft-settings.ts">retrieveSettings</a>(accountID) -> OverdraftSettings</code>
- <code title="put /accounts/{accountId}/overdraft-settings">client.accounts.overdraftSettings.<a href="./src/resources/accounts/overdraft-settings.ts">updateSettings</a>(accountID, { ...params }) -> OverdraftSettings</code>

# Transactions

Types:

- <code><a href="./src/resources/transactions/transactions.ts">PaginatedTransactions</a></code>
- <code><a href="./src/resources/transactions/transactions.ts">Transaction</a></code>
- <code><a href="./src/resources/transactions/transactions.ts">TransactionDisputeResponse</a></code>

Methods:

- <code title="get /transactions/{transactionId}">client.transactions.<a href="./src/resources/transactions/transactions.ts">retrieve</a>(transactionID) -> Transaction</code>
- <code title="get /transactions">client.transactions.<a href="./src/resources/transactions/transactions.ts">list</a>({ ...params }) -> PaginatedTransactions</code>
- <code title="put /transactions/{transactionId}/categorize">client.transactions.<a href="./src/resources/transactions/transactions.ts">categorize</a>(transactionID, { ...params }) -> Transaction</code>
- <code title="post /transactions/{transactionId}/dispute">client.transactions.<a href="./src/resources/transactions/transactions.ts">dispute</a>(transactionID, { ...params }) -> TransactionDisputeResponse</code>
- <code title="put /transactions/{transactionId}/notes">client.transactions.<a href="./src/resources/transactions/transactions.ts">updateNotes</a>(transactionID, { ...params }) -> Transaction</code>

## Recurring

Types:

- <code><a href="./src/resources/transactions/recurring.ts">RecurringTransaction</a></code>
- <code><a href="./src/resources/transactions/recurring.ts">RecurringListResponse</a></code>

Methods:

- <code title="post /transactions/recurring">client.transactions.recurring.<a href="./src/resources/transactions/recurring.ts">create</a>({ ...params }) -> RecurringTransaction</code>
- <code title="get /transactions/recurring">client.transactions.recurring.<a href="./src/resources/transactions/recurring.ts">list</a>({ ...params }) -> RecurringListResponse</code>

## Insights

Types:

- <code><a href="./src/resources/transactions/insights.ts">AIInsight</a></code>
- <code><a href="./src/resources/transactions/insights.ts">InsightGetSpendingTrendsResponse</a></code>

Methods:

- <code title="get /transactions/insights/spending-trends">client.transactions.insights.<a href="./src/resources/transactions/insights.ts">getSpendingTrends</a>() -> InsightGetSpendingTrendsResponse</code>

# Notifications

Types:

- <code><a href="./src/resources/notifications/notifications.ts">Notification</a></code>
- <code><a href="./src/resources/notifications/notifications.ts">NotificationListResponse</a></code>

Methods:

- <code title="get /notifications">client.notifications.<a href="./src/resources/notifications/notifications.ts">list</a>({ ...params }) -> NotificationListResponse</code>
- <code title="post /notifications/{notificationId}/read">client.notifications.<a href="./src/resources/notifications/notifications.ts">markRead</a>(notificationID) -> void</code>

## Settings

Types:

- <code><a href="./src/resources/notifications/settings.ts">NotificationSettings</a></code>

Methods:

- <code title="get /notifications/settings">client.notifications.settings.<a href="./src/resources/notifications/settings.ts">retrieve</a>() -> NotificationSettings</code>
- <code title="put /notifications/settings">client.notifications.settings.<a href="./src/resources/notifications/settings.ts">update</a>({ ...params }) -> NotificationSettings</code>

# Budgets

Types:

- <code><a href="./src/resources/budgets.ts">Budget</a></code>
- <code><a href="./src/resources/budgets.ts">BudgetListResponse</a></code>

Methods:

- <code title="post /budgets">client.budgets.<a href="./src/resources/budgets.ts">create</a>({ ...params }) -> Budget</code>
- <code title="get /budgets/{budgetId}">client.budgets.<a href="./src/resources/budgets.ts">retrieve</a>(budgetID) -> Budget</code>
- <code title="put /budgets/{budgetId}">client.budgets.<a href="./src/resources/budgets.ts">update</a>(budgetID, { ...params }) -> Budget</code>
- <code title="get /budgets">client.budgets.<a href="./src/resources/budgets.ts">list</a>({ ...params }) -> BudgetListResponse</code>
- <code title="delete /budgets/{budgetId}">client.budgets.<a href="./src/resources/budgets.ts">delete</a>(budgetID) -> void</code>

# Investments

## Portfolios

Types:

- <code><a href="./src/resources/investments/portfolios.ts">InvestmentPortfolio</a></code>
- <code><a href="./src/resources/investments/portfolios.ts">PortfolioListResponse</a></code>
- <code><a href="./src/resources/investments/portfolios.ts">PortfolioRebalanceResponse</a></code>

Methods:

- <code title="post /investments/portfolios">client.investments.portfolios.<a href="./src/resources/investments/portfolios.ts">create</a>({ ...params }) -> InvestmentPortfolio</code>
- <code title="get /investments/portfolios/{portfolioId}">client.investments.portfolios.<a href="./src/resources/investments/portfolios.ts">retrieve</a>(portfolioID) -> InvestmentPortfolio</code>
- <code title="put /investments/portfolios/{portfolioId}">client.investments.portfolios.<a href="./src/resources/investments/portfolios.ts">update</a>(portfolioID, { ...params }) -> InvestmentPortfolio</code>
- <code title="get /investments/portfolios">client.investments.portfolios.<a href="./src/resources/investments/portfolios.ts">list</a>({ ...params }) -> PortfolioListResponse</code>
- <code title="post /investments/portfolios/{portfolioId}/rebalance">client.investments.portfolios.<a href="./src/resources/investments/portfolios.ts">rebalance</a>(portfolioID, { ...params }) -> PortfolioRebalanceResponse</code>

## Assets

Types:

- <code><a href="./src/resources/investments/assets.ts">AssetSearchResponse</a></code>

Methods:

- <code title="get /investments/assets/search">client.investments.assets.<a href="./src/resources/investments/assets.ts">search</a>({ ...params }) -> AssetSearchResponse</code>

# AI

## Advisor

Types:

- <code><a href="./src/resources/ai/advisor/advisor.ts">AdvisorListToolsResponse</a></code>

Methods:

- <code title="get /ai/advisor/tools">client.ai.advisor.<a href="./src/resources/ai/advisor/advisor.ts">listTools</a>({ ...params }) -> AdvisorListToolsResponse</code>

### Chat

Types:

- <code><a href="./src/resources/ai/advisor/chat.ts">ChatRetrieveHistoryResponse</a></code>
- <code><a href="./src/resources/ai/advisor/chat.ts">ChatSendMessageResponse</a></code>

Methods:

- <code title="get /ai/advisor/chat/history">client.ai.advisor.chat.<a href="./src/resources/ai/advisor/chat.ts">retrieveHistory</a>({ ...params }) -> ChatRetrieveHistoryResponse</code>
- <code title="post /ai/advisor/chat">client.ai.advisor.chat.<a href="./src/resources/ai/advisor/chat.ts">sendMessage</a>({ ...params }) -> ChatSendMessageResponse</code>

## Oracle

### Simulate

Types:

- <code><a href="./src/resources/ai/oracle/simulate.ts">AdvancedSimulationResponse</a></code>
- <code><a href="./src/resources/ai/oracle/simulate.ts">SimulationResponse</a></code>

Methods:

- <code title="post /ai/oracle/simulate/advanced">client.ai.oracle.simulate.<a href="./src/resources/ai/oracle/simulate.ts">runAdvanced</a>({ ...params }) -> AdvancedSimulationResponse</code>
- <code title="post /ai/oracle/simulate">client.ai.oracle.simulate.<a href="./src/resources/ai/oracle/simulate.ts">runStandard</a>({ ...params }) -> SimulationResponse</code>

### Simulations

Types:

- <code><a href="./src/resources/ai/oracle/simulations.ts">SimulationRetrieveResponse</a></code>
- <code><a href="./src/resources/ai/oracle/simulations.ts">SimulationListResponse</a></code>

Methods:

- <code title="get /ai/oracle/simulations/{simulationId}">client.ai.oracle.simulations.<a href="./src/resources/ai/oracle/simulations.ts">retrieve</a>(simulationID) -> SimulationRetrieveResponse</code>
- <code title="get /ai/oracle/simulations">client.ai.oracle.simulations.<a href="./src/resources/ai/oracle/simulations.ts">list</a>({ ...params }) -> SimulationListResponse</code>
- <code title="delete /ai/oracle/simulations/{simulationId}">client.ai.oracle.simulations.<a href="./src/resources/ai/oracle/simulations.ts">delete</a>(simulationID) -> void</code>

## Incubator

Types:

- <code><a href="./src/resources/ai/incubator/incubator.ts">IncubatorListPitchesResponse</a></code>

Methods:

- <code title="get /ai/incubator/pitches">client.ai.incubator.<a href="./src/resources/ai/incubator/incubator.ts">listPitches</a>({ ...params }) -> IncubatorListPitchesResponse</code>

### Pitch

Types:

- <code><a href="./src/resources/ai/incubator/pitch.ts">QuantumWeaverState</a></code>
- <code><a href="./src/resources/ai/incubator/pitch.ts">PitchRetrieveDetailsResponse</a></code>

Methods:

- <code title="get /ai/incubator/pitch/{pitchId}/details">client.ai.incubator.pitch.<a href="./src/resources/ai/incubator/pitch.ts">retrieveDetails</a>(pitchID) -> PitchRetrieveDetailsResponse</code>
- <code title="post /ai/incubator/pitch">client.ai.incubator.pitch.<a href="./src/resources/ai/incubator/pitch.ts">submit</a>({ ...params }) -> QuantumWeaverState</code>
- <code title="put /ai/incubator/pitch/{pitchId}/feedback">client.ai.incubator.pitch.<a href="./src/resources/ai/incubator/pitch.ts">submitFeedback</a>(pitchID, { ...params }) -> QuantumWeaverState</code>

## Ads

Types:

- <code><a href="./src/resources/ai/ads/ads.ts">VideoOperationStatus</a></code>
- <code><a href="./src/resources/ai/ads/ads.ts">AdListGeneratedResponse</a></code>

Methods:

- <code title="get /ai/ads">client.ai.ads.<a href="./src/resources/ai/ads/ads.ts">listGenerated</a>({ ...params }) -> AdListGeneratedResponse</code>
- <code title="get /ai/ads/operations/{operationId}">client.ai.ads.<a href="./src/resources/ai/ads/ads.ts">retrieveStatus</a>(operationID) -> VideoOperationStatus</code>

### Generate

Types:

- <code><a href="./src/resources/ai/ads/generate.ts">GenerateVideoRequest</a></code>
- <code><a href="./src/resources/ai/ads/generate.ts">GenerateAdvancedResponse</a></code>
- <code><a href="./src/resources/ai/ads/generate.ts">GenerateStandardResponse</a></code>

Methods:

- <code title="post /ai/ads/generate/advanced">client.ai.ads.generate.<a href="./src/resources/ai/ads/generate.ts">advanced</a>({ ...params }) -> GenerateAdvancedResponse</code>
- <code title="post /ai/ads/generate">client.ai.ads.generate.<a href="./src/resources/ai/ads/generate.ts">standard</a>({ ...params }) -> GenerateStandardResponse</code>

# Corporate

Types:

- <code><a href="./src/resources/corporate/corporate.ts">CorporatePerformSanctionScreeningResponse</a></code>

Methods:

- <code title="post /corporate/sanction-screening">client.corporate.<a href="./src/resources/corporate/corporate.ts">performSanctionScreening</a>({ ...params }) -> CorporatePerformSanctionScreeningResponse</code>

## Cards

Types:

- <code><a href="./src/resources/corporate/cards.ts">CorporateCard</a></code>
- <code><a href="./src/resources/corporate/cards.ts">CorporateCardControls</a></code>
- <code><a href="./src/resources/corporate/cards.ts">CardListResponse</a></code>

Methods:

- <code title="get /corporate/cards">client.corporate.cards.<a href="./src/resources/corporate/cards.ts">list</a>({ ...params }) -> CardListResponse</code>
- <code title="post /corporate/cards/virtual">client.corporate.cards.<a href="./src/resources/corporate/cards.ts">createVirtual</a>({ ...params }) -> CorporateCard</code>
- <code title="post /corporate/cards/{cardId}/freeze">client.corporate.cards.<a href="./src/resources/corporate/cards.ts">freeze</a>(cardID, { ...params }) -> CorporateCard</code>
- <code title="get /corporate/cards/{cardId}/transactions">client.corporate.cards.<a href="./src/resources/corporate/cards.ts">listTransactions</a>(cardID, { ...params }) -> PaginatedTransactions</code>
- <code title="put /corporate/cards/{cardId}/controls">client.corporate.cards.<a href="./src/resources/corporate/cards.ts">updateControls</a>(cardID, { ...params }) -> CorporateCard</code>

## Anomalies

Types:

- <code><a href="./src/resources/corporate/anomalies.ts">FinancialAnomaly</a></code>
- <code><a href="./src/resources/corporate/anomalies.ts">AnomalyListResponse</a></code>

Methods:

- <code title="get /corporate/anomalies">client.corporate.anomalies.<a href="./src/resources/corporate/anomalies.ts">list</a>({ ...params }) -> AnomalyListResponse</code>
- <code title="put /corporate/anomalies/{anomalyId}/status">client.corporate.anomalies.<a href="./src/resources/corporate/anomalies.ts">updateStatus</a>(anomalyID, { ...params }) -> FinancialAnomaly</code>

## Compliance

### Audits

Types:

- <code><a href="./src/resources/corporate/compliance/audits.ts">AuditRequestResponse</a></code>
- <code><a href="./src/resources/corporate/compliance/audits.ts">AuditRetrieveReportResponse</a></code>

Methods:

- <code title="post /corporate/compliance/audits">client.corporate.compliance.audits.<a href="./src/resources/corporate/compliance/audits.ts">request</a>({ ...params }) -> AuditRequestResponse</code>
- <code title="get /corporate/compliance/audits/{auditId}/report">client.corporate.compliance.audits.<a href="./src/resources/corporate/compliance/audits.ts">retrieveReport</a>(auditID) -> AuditRetrieveReportResponse</code>

## Treasury

Types:

- <code><a href="./src/resources/corporate/treasury/treasury.ts">TreasuryGetLiquidityPositionsResponse</a></code>

Methods:

- <code title="get /corporate/treasury/liquidity-positions">client.corporate.treasury.<a href="./src/resources/corporate/treasury/treasury.ts">getLiquidityPositions</a>() -> TreasuryGetLiquidityPositionsResponse</code>

### CashFlow

Types:

- <code><a href="./src/resources/corporate/treasury/cash-flow.ts">CashFlowForecastResponse</a></code>

Methods:

- <code title="get /corporate/treasury/cash-flow/forecast">client.corporate.treasury.cashFlow.<a href="./src/resources/corporate/treasury/cash-flow.ts">forecast</a>({ ...params }) -> CashFlowForecastResponse</code>

## Risk

### Fraud

#### Rules

Types:

- <code><a href="./src/resources/corporate/risk/fraud/rules.ts">FraudRule</a></code>
- <code><a href="./src/resources/corporate/risk/fraud/rules.ts">FraudRuleAction</a></code>
- <code><a href="./src/resources/corporate/risk/fraud/rules.ts">FraudRuleCriteria</a></code>
- <code><a href="./src/resources/corporate/risk/fraud/rules.ts">RuleListResponse</a></code>

Methods:

- <code title="post /corporate/risk/fraud/rules">client.corporate.risk.fraud.rules.<a href="./src/resources/corporate/risk/fraud/rules.ts">create</a>({ ...params }) -> FraudRule</code>
- <code title="put /corporate/risk/fraud/rules/{ruleId}">client.corporate.risk.fraud.rules.<a href="./src/resources/corporate/risk/fraud/rules.ts">update</a>(ruleID, { ...params }) -> FraudRule</code>
- <code title="get /corporate/risk/fraud/rules">client.corporate.risk.fraud.rules.<a href="./src/resources/corporate/risk/fraud/rules.ts">list</a>({ ...params }) -> RuleListResponse</code>
- <code title="delete /corporate/risk/fraud/rules/{ruleId}">client.corporate.risk.fraud.rules.<a href="./src/resources/corporate/risk/fraud/rules.ts">delete</a>(ruleID) -> void</code>

# Web3

Types:

- <code><a href="./src/resources/web3/web3.ts">Web3RetrieveNFTsResponse</a></code>

Methods:

- <code title="get /web3/nfts">client.web3.<a href="./src/resources/web3/web3.ts">retrieveNFTs</a>({ ...params }) -> Web3RetrieveNFTsResponse</code>

## Wallets

Types:

- <code><a href="./src/resources/web3/wallets.ts">CryptoWalletConnection</a></code>
- <code><a href="./src/resources/web3/wallets.ts">WalletListResponse</a></code>
- <code><a href="./src/resources/web3/wallets.ts">WalletRetrieveBalancesResponse</a></code>

Methods:

- <code title="get /web3/wallets">client.web3.wallets.<a href="./src/resources/web3/wallets.ts">list</a>({ ...params }) -> WalletListResponse</code>
- <code title="post /web3/wallets">client.web3.wallets.<a href="./src/resources/web3/wallets.ts">connect</a>({ ...params }) -> CryptoWalletConnection</code>
- <code title="get /web3/wallets/{walletId}/balances">client.web3.wallets.<a href="./src/resources/web3/wallets.ts">retrieveBalances</a>(walletID, { ...params }) -> WalletRetrieveBalancesResponse</code>

## Transactions

Types:

- <code><a href="./src/resources/web3/transactions.ts">TransactionInitiateTransferResponse</a></code>

Methods:

- <code title="post /web3/transactions/initiate">client.web3.transactions.<a href="./src/resources/web3/transactions.ts">initiateTransfer</a>({ ...params }) -> TransactionInitiateTransferResponse</code>

# Payments

## International

Types:

- <code><a href="./src/resources/payments/international.ts">InternationalPaymentStatus</a></code>

Methods:

- <code title="post /payments/international/initiate">client.payments.international.<a href="./src/resources/payments/international.ts">initiate</a>({ ...params }) -> InternationalPaymentStatus</code>
- <code title="get /payments/international/{paymentId}/status">client.payments.international.<a href="./src/resources/payments/international.ts">retrieveStatus</a>(paymentID) -> InternationalPaymentStatus</code>

## Fx

Types:

- <code><a href="./src/resources/payments/fx.ts">FxConvertResponse</a></code>
- <code><a href="./src/resources/payments/fx.ts">FxRetrieveRatesResponse</a></code>

Methods:

- <code title="post /payments/fx/convert">client.payments.fx.<a href="./src/resources/payments/fx.ts">convert</a>({ ...params }) -> FxConvertResponse</code>
- <code title="get /payments/fx/rates">client.payments.fx.<a href="./src/resources/payments/fx.ts">retrieveRates</a>({ ...params }) -> FxRetrieveRatesResponse</code>

# Sustainability

Types:

- <code><a href="./src/resources/sustainability/sustainability.ts">SustainabilityPurchaseCarbonOffsetsResponse</a></code>
- <code><a href="./src/resources/sustainability/sustainability.ts">SustainabilityRetrieveCarbonFootprintResponse</a></code>

Methods:

- <code title="post /sustainability/carbon-offsets">client.sustainability.<a href="./src/resources/sustainability/sustainability.ts">purchaseCarbonOffsets</a>({ ...params }) -> SustainabilityPurchaseCarbonOffsetsResponse</code>
- <code title="get /sustainability/carbon-footprint">client.sustainability.<a href="./src/resources/sustainability/sustainability.ts">retrieveCarbonFootprint</a>() -> SustainabilityRetrieveCarbonFootprintResponse</code>

## Investments

Types:

- <code><a href="./src/resources/sustainability/investments.ts">InvestmentAnalyzeImpactResponse</a></code>

Methods:

- <code title="get /sustainability/investments/impact">client.sustainability.investments.<a href="./src/resources/sustainability/investments.ts">analyzeImpact</a>() -> InvestmentAnalyzeImpactResponse</code>

# Lending

## Applications

Types:

- <code><a href="./src/resources/lending/applications.ts">LoanApplicationStatus</a></code>

Methods:

- <code title="get /lending/applications/{applicationId}">client.lending.applications.<a href="./src/resources/lending/applications.ts">retrieve</a>(applicationID) -> LoanApplicationStatus</code>
- <code title="post /lending/applications">client.lending.applications.<a href="./src/resources/lending/applications.ts">submit</a>({ ...params }) -> LoanApplicationStatus</code>

## Offers

Types:

- <code><a href="./src/resources/lending/offers.ts">LoanOffer</a></code>
- <code><a href="./src/resources/lending/offers.ts">OfferListPreApprovedResponse</a></code>

Methods:

- <code title="get /lending/offers/pre-approved">client.lending.offers.<a href="./src/resources/lending/offers.ts">listPreApproved</a>({ ...params }) -> OfferListPreApprovedResponse</code>

# Developers

## Webhooks

Types:

- <code><a href="./src/resources/developers/webhooks.ts">WebhookSubscription</a></code>
- <code><a href="./src/resources/developers/webhooks.ts">WebhookListResponse</a></code>

Methods:

- <code title="post /developers/webhooks">client.developers.webhooks.<a href="./src/resources/developers/webhooks.ts">create</a>({ ...params }) -> WebhookSubscription</code>
- <code title="put /developers/webhooks/{subscriptionId}">client.developers.webhooks.<a href="./src/resources/developers/webhooks.ts">update</a>(subscriptionID, { ...params }) -> WebhookSubscription</code>
- <code title="get /developers/webhooks">client.developers.webhooks.<a href="./src/resources/developers/webhooks.ts">list</a>({ ...params }) -> WebhookListResponse</code>
- <code title="delete /developers/webhooks/{subscriptionId}">client.developers.webhooks.<a href="./src/resources/developers/webhooks.ts">delete</a>(subscriptionID) -> void</code>

## APIKeys

Types:

- <code><a href="./src/resources/developers/api-keys.ts">APIKey</a></code>
- <code><a href="./src/resources/developers/api-keys.ts">APIKeyListResponse</a></code>

Methods:

- <code title="post /developers/api-keys">client.developers.apiKeys.<a href="./src/resources/developers/api-keys.ts">create</a>({ ...params }) -> APIKey</code>
- <code title="get /developers/api-keys">client.developers.apiKeys.<a href="./src/resources/developers/api-keys.ts">list</a>({ ...params }) -> APIKeyListResponse</code>
- <code title="delete /developers/api-keys/{keyId}">client.developers.apiKeys.<a href="./src/resources/developers/api-keys.ts">revoke</a>(keyID) -> void</code>

# Identity

## KYC

Types:

- <code><a href="./src/resources/identity/kyc.ts">KYCStatus</a></code>

Methods:

- <code title="get /identity/kyc/status">client.identity.kyc.<a href="./src/resources/identity/kyc.ts">retrieveStatus</a>() -> KYCStatus</code>
- <code title="post /identity/kyc/submit">client.identity.kyc.<a href="./src/resources/identity/kyc.ts">submit</a>({ ...params }) -> KYCStatus</code>

# Goals

Types:

- <code><a href="./src/resources/goals.ts">FinancialGoal</a></code>
- <code><a href="./src/resources/goals.ts">GoalListResponse</a></code>

Methods:

- <code title="post /goals">client.goals.<a href="./src/resources/goals.ts">create</a>({ ...params }) -> FinancialGoal</code>
- <code title="get /goals/{goalId}">client.goals.<a href="./src/resources/goals.ts">retrieve</a>(goalID) -> FinancialGoal</code>
- <code title="put /goals/{goalId}">client.goals.<a href="./src/resources/goals.ts">update</a>(goalID, { ...params }) -> FinancialGoal</code>
- <code title="get /goals">client.goals.<a href="./src/resources/goals.ts">list</a>({ ...params }) -> GoalListResponse</code>
- <code title="delete /goals/{goalId}">client.goals.<a href="./src/resources/goals.ts">delete</a>(goalID) -> void</code>

# Marketplace

## Products

Types:

- <code><a href="./src/resources/marketplace/products.ts">Product</a></code>
- <code><a href="./src/resources/marketplace/products.ts">ProductListResponse</a></code>
- <code><a href="./src/resources/marketplace/products.ts">ProductSimulatePurchaseResponse</a></code>

Methods:

- <code title="get /marketplace/products">client.marketplace.products.<a href="./src/resources/marketplace/products.ts">list</a>({ ...params }) -> ProductListResponse</code>
- <code title="post /marketplace/products/{productId}/impact-simulate">client.marketplace.products.<a href="./src/resources/marketplace/products.ts">simulatePurchase</a>(productID, { ...params }) -> ProductSimulatePurchaseResponse</code>

## Offers

Types:

- <code><a href="./src/resources/marketplace/offers.ts">Offer</a></code>
- <code><a href="./src/resources/marketplace/offers.ts">OfferRedeemResponse</a></code>

Methods:

- <code title="post /marketplace/offers/{offerId}/redeem">client.marketplace.offers.<a href="./src/resources/marketplace/offers.ts">redeem</a>(offerID, { ...params }) -> OfferRedeemResponse</code>

    ---
import { Flatfile } from "@flatfile/api";

export const invoiceBlueprint: Pick<
  Flatfile.CreateWorkbookConfig,
  "name" | "labels" | "sheets" | "actions"
> = {
  name: "Gemini AI Powered Invoice Processing System",
  labels: ["GeminiAutomated", "FinancialAI", "AdvancedWorkflow", "SmartInvoicing"],
  sheets: [
    {
      name: "Gemini Enhanced Invoices and Line Items",
      slug: "gemini-invoices-lineitems",
      readonly: false,
      allowAdditionalFields: true,
      fields: [
        {
          label: "Invoice Identifier",
          key: "invoiceIdentifier",
          type: "string",
          constraints: [
            {
              type: "required",
            },
          ],
          description:
            "A string identifier to indicate which invoice the line items belong to. This identifier is crucial for Gemini to group related transactions and maintain data integrity.",
        },
        {
          label: "Due Date",
          key: "dueDate",
          type: "string",
          constraints: [
            {
              type: "required",
            },
            {
              type: "pattern",
              value: "^\\d{4}-\\d{2}-\\d{2}$",
              message: "Date must be in YYYY-MM-DD format for optimal Gemini AI processing and payment forecasting.",
            }
          ],
          description:
            "A future date when the invoice is due. Gemini AI will analyze this date for payment forecasting and compliance with defined payment terms. Format: YYYY-MM-DD",
        },
        {
          label: "Originating Account ID",
          key: "originatingAccountId",
          type: "string",
          constraints: [
            {
              type: "required",
            },
          ],
          description:
            "The ID of the internal account the invoice amount should be paid to. Gemini AI uses this for internal ledger reconciliation and anomaly detection across financial flows.",
        },
        {
          label: "Counterparty ID",
          key: "counterpartyId",
          type: "string",
          constraints: [
            {
              type: "required",
            },
          ],
          description: "The ID of the counterparty receiving the invoice. Gemini AI identifies behavioral patterns and potential risk factors associated with this entity based on historical data.",
        },
        {
          label: "Currency",
          key: "currency",
          type: "string",
          constraints: [
            {
              type: "required",
            },
            {
              type: "pattern",
              value: "^[A-Z]{3}$",
              message: "Currency must be a 3-letter ISO 4217 code. Gemini AI will validate and standardize this input automatically.",
            }
          ],
          description:
            "The currency that the invoice is denominated in. Must conform to ISO 4217. Gemini AI will automatically validate currency codes and flag non-standard entries for review.",
        },
        {
          label: "Description",
          key: "description",
          type: "string",
          description: "An optional free-form description of the invoice. Gemini AI will extract key entities sentiment and categorize the overall intent from this text for enhanced reporting and intelligent routing.",
        },
        {
          label: "Auto Advance",
          key: "autoAdvance",
          type: "string",
          description:
            "When true, the invoice will progress to unpaid automatically and cannot be edited after entering that state. Gemini AI can be configured to override this based on real-time risk assessment or predictive models.",
        },
        {
          label: "Payment Method",
          key: "paymentMethod",
          type: "string",
          selection: [
            { value: "ui", label: "User Interface" },
            { value: "automatic", label: "Automatic Payment" },
            { value: "manual", label: "Manual Payment" }
          ],
          description:
            "When opening an invoice, whether to show the embedded payment UI, automatically create a payment, or rely on manual payment from the recipient. Gemini AI can analyze historical payment patterns and counterparty profiles to suggest the most efficient and reliable method. Case sensitive one of ui, automatic, or manual. Default: manual",
        },
        {
          label: "Fallback Payment Method",
          key: "fallbackPaymentMethod",
          type: "string",
          selection: [
            { value: "ui", label: "User Interface" },
            { value: "manual", label: "Manual Payment" }
          ],
          description:
            "When payment method is automatic, the fallback payment method to use when an automatic payment fails. Gemini AI's payment optimization model considers this for robust transaction handling and risk mitigation. Case sensitive one of ui or manual.",
        },
        {
          label: "Payment Effective Date",
          key: "paymentEffectiveDate",
          type: "string",
          description:
            "When payment method is automatic, the date transactions are to be posted to the participants' account. Defaults to the current business day. Gemini AI leverages this for liquidity management cash flow forecasting and optimizing settlement times.",
        },
        {
          label: "Payment Type",
          key: "paymentType",
          type: "string",
          description:
            "When payment method is automatic, the payment type on the automatically created payment order. Gemini AI categorizes and optimizes payment routing based on this type to minimize fees and maximize speed. Case sensitive use lowercase.",
        },
        {
          label: "Receiving Account ID",
          key: "receivingAccountId",
          type: "string",
          description:
            "When payment method is automatic, one of the receiving counterparty's bank account IDs. Gemini AI performs real-time account validation and fraud checks using advanced pattern recognition.",
        },
        {
          label: "Invoicer Email",
          key: "invoicerEmail",
          type: "string",
          constraints: [
            {
              type: "pattern",
              value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
              message: "Invalid email format. Gemini AI will automatically flag or correct malformed emails to ensure communication delivery."
            }
          ],
          description:
            "The email in the invoicer's contact details displayed at the top of the invoice. Gemini AI can suggest optimal communication channels and verify email validity.",
        },
        {
          label: "Invoicer Phone Number",
          key: "invoicerPhoneNumber",
          type: "string",
          description:
            "The phone number in the invoicer's contact details displayed at the top of the invoice. Gemini AI uses this for contact enrichment and verification against public records or internal databases.",
        },
        {
          label: "Invoicer Website",
          key: "invoicerWebsite",
          type: "string",
          description:
            "The website in the invoicer's contact details displayed at the top of the invoice. Gemini AI can crawl this for additional business context compliance checks and firmographic data.",
        },
        {
          label: "Notifications Enabled",
          key: "notificationsEnabled",
          type: "string",
          description:
            "If true, the invoice will send email notifications to the invoice recipients about invoice status changes. Gemini AI can personalize notification content and timing for improved engagement.",
        },
        {
          label: "Notification Email Addresses",
          key: "notificationEmailAddresses",
          type: "string",
          description:
            "Emails (comma separated) in addition to the counterparty email to send invoice status notifications to. At least one email is required if notifications are enabled. Gemini AI identifies and removes duplicate or invalid email addresses automatically.",
        },
        {
          label: "Recipient Name",
          key: "recipientName",
          type: "string",
          description:
            "The name of the recipient of the invoice. Leaving this value blank will fallback to using the counterparty's name. Gemini AI ensures consistency with counterparty records and flags discrepancies for attention.",
        },
        {
          label: "Recipient Email",
          key: "recipientEmail",
          type: "string",
          constraints: [
            {
              type: "pattern",
              value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
              message: "Invalid email format. Gemini AI will flag malformed emails and suggest corrections from known contacts."
            }
          ],
          description:
            "The email of the recipient of the invoice. Leaving this value blank will fallback to using the counterparty's email. Gemini AI verifies this against known counterparty contacts and suggests missing entries.",
        },
        {
          label: "Metadata",
          key: "metadata",
          type: "string",
          description:
            "Additional data represented as key-value pairs separated by a pipe character. Gemini AI can parse and enrich this metadata for advanced analytics custom reporting and deeper insights. Do not include special characters outside of : and |.",
        },
        {
          label: "Invoicer Address Line 1",
          key: "invoicerAddressLine1",
          type: "string",
          description: "Invoicer address line 1. Gemini AI performs address standardization geocoding and validation against global postal databases.",
        },
        {
          label: "Invoicer Address Line 2",
          key: "invoicerAddressLine2",
          type: "string",
          description: "Invoicer address line 2. Gemini AI enhances parsing of complex multi-line addresses for accurate record keeping.",
        },
        {
          label: "Invoicer Address Locality",
          key: "invoicerAddressLocality",
          type: "string",
          description: "Invoicer address locality. Gemini AI validates against known geographical data and corrects typographical errors.",
        },
        {
          label: "Invoicer Address Region",
          key: "invoicerAddressRegion",
          type: "string",
          description: "Invoicer address region. Gemini AI suggests correct regional codes and states for tax and regulatory compliance.",
        },
        {
          label: "Invoicer Address Postal Code",
          key: "invoicerAddressPostalCode",
          type: "string",
          description: "Invoicer address postal code. Gemini AI verifies postal code validity and completes partial entries based on locality and region.",
        },
        {
          label: "Invoicer Address Country",
          key: "invoicerAddressCountry",
          type: "string",
          description: "Invoicer address country. Gemini AI standardizes country names to ISO 3166 codes for international consistency.",
        },
        {
          label: "Counterparty Billing Address Line 1",
          key: "counterpartyBillingAddressLine1",
          type: "string",
          description: "Counterparty billing address line 1. Gemini AI cross references billing addresses for compliance and anti-money laundering checks.",
        },
        {
          label: "Counterparty Billing Address Line 2",
          key: "counterpartyBillingAddressLine2",
          type: "string",
          description: "Counterparty billing address line 2. Gemini AI aids in parsing complex billing addresses for financial reporting accuracy.",
        },
        {
          label: "Counterparty Billing Address Locality",
          key: "counterpartyBillingAddressLocality",
          type: "string",
          description: "Counterparty billing address locality. Gemini AI validates and corrects locality information for billing precision.",
        },
        {
          label: "Counterparty Billing Address Region",
          key: "counterpartyBillingAddressRegion",
          type: "string",
          description: "Counterparty billing address region. Gemini AI suggests correct regional codes for accurate sales tax and VAT calculations.",
        },
        {
          label: "Counterparty Billing Address Postal Code",
          key: "counterpartyBillingAddressPostalCode",
          type: "string",
          description: "Counterparty billing address postal code. Gemini AI performs postal code lookup and validation for billing address integrity.",
        },
        {
          label: "Counterparty Billing Address Country",
          key: "counterpartyBillingAddressCountry",
          type: "string",
          description: "Counterparty billing address country. Gemini AI standardizes country names to ensure global consistency in billing records.",
        },
        {
          label: "Counterparty Shipping Address Line 1",
          key: "counterpartyShippingAddressLine1",
          type: "string",
          description: "Counterparty shipping address line 1. Gemini AI optimizes logistics by validating shipping addresses and flagging delivery issues.",
        },
        {
          label: "Counterparty Shipping Address Line 2",
          key: "counterpartyShippingAddressLine2",
          type: "string",
          description: "Counterparty shipping address line 2. Gemini AI assists with complex shipping address resolution for supply chain efficiency.",
        },
        {
          label: "Counterparty Shipping Address Locality",
          key: "counterpartyShippingAddressLocality",
          type: "string",
          description: "Counterparty shipping address locality. Gemini AI ensures accuracy of shipping locations for timely and correct deliveries.",
        },
        {
          label: "Counterparty Shipping Address Region",
          key: "counterpartyShippingAddressRegion",
          type: "string",
          description: "Counterparty shipping address region. Gemini AI suggests optimal shipping regions and routes based on geographical data.",
        },
        {
          label: "Counterparty Shipping Address Postal Code",
          key: "counterpartyShippingAddressPostalCode",
          type: "string",
          description: "Counterparty shipping address postal code. Gemini AI verifies shipping postal code validity for delivery success and cost optimization.",
        },
        {
          label: "Counterparty Shipping Address Country",
          key: "counterpartyShippingAddressCountry",
          type: "string",
          description: "Counterparty shipping address country. Gemini AI standardizes shipping country names to facilitate international shipping.",
        },
        {
          label: "Line Item Name",
          key: "lineItemName",
          type: "string",
          constraints: [
            {
              type: "required",
            },
          ],
          description:
            "Name of the line item, typically a product or SKU name. Gemini AI will categorize products or services and identify potential inconsistencies or misclassifications.",
        },
        {
          label: "Line Item Description",
          key: "lineItemDescription",
          type: "string",
          description: "An optional free-form description of the line item. Gemini AI can expand summarize or rephrase this description for clarity and improved searchability.",
        },
        {
          label: "Line Item Quantity",
          key: "lineItemQuantity",
          type: "number",
          constraints: [
            {
              type: "required",
            },
            {
              type: "range",
              min: 1,
              message: "Quantity must be a positive whole number for Gemini AI's inventory analysis and financial calculations."
            }
          ],
          description:
            "The number of units of a product or service that this line item is for. Must be a positive whole number. Gemini AI performs inventory reconciliation demand forecasting and identifies quantity anomalies. Default: 1",
        },
        {
          label: "Line Item Unit Amount",
          key: "lineItemUnitAmount",
          type: "number",
          description:
            "The cost per unit of the product or service. Only use line item unit amount OR line item decimal unit amount. Gemini AI calculates total amounts identifies pricing anomalies and suggests competitive pricing.",
        },
        {
          label: "Line Item Decimal Unit Amount",
          key: "lineItemUnitAmountDecimal",
          type: "number",
          description:
            "The cost per unit with up to 12 decimal places. Only use line item unit amount OR line item decimal unit amount. Gemini AI handles high precision financial calculations and detects micro-discrepancies.",
        },
        {
          label: "Line Item Direction",
          key: "lineItemDirection",
          type: "string",
          selection: [
            { value: "debit", label: "Debit" },
            { value: "credit", label: "Credit" }
          ],
          description:
            "If debit, indicates that the counterparty owes the business money and increases the Invoice's total amount due. If credit, has the opposite intention and effect. Gemini AI automates complex ledger entries based on this direction. Case sensitive use lowercase.",
        },
        {
          label: "Line Item Metadata",
          key: "lineItemMetadata",
          type: "string",
          description:
            "Additional data represented as key-value pairs separated by a pipe character. Gemini AI parses this for granular analysis custom reporting and to uncover hidden trends. Do not include special characters outside of : and |.",
        },
        {
          label: "Gemini AI Category",
          key: "geminiAICategory",
          type: "string",
          description: "A category for the invoice or line item automatically inferred by Gemini AI for enhanced classification financial segmentation and analytics.",
        },
        {
          label: "Gemini AI Sentiment",
          key: "geminiAISentiment",
          type: "string",
          selection: [
            { value: "Positive", label: "Positive" },
            { value: "Negative", label: "Negative" },
            { value: "Neutral", label: "Neutral" },
            { value: "Mixed", label: "Mixed" }
          ],
          description: "Sentiment analysis result from Gemini AI on the invoice description or overall transaction context. Helps in understanding client relations and potential disputes.",
        },
        {
          label: "Gemini AI Risk Score",
          key: "geminiAIRiskScore",
          type: "number",
          description: "A numerical risk score assigned by Gemini AI ranging from 0 to 100 based on various invoice parameters counterparty history and transaction anomalies. Higher scores indicate higher risk needing immediate attention.",
        },
        {
          label: "Gemini AI Action Suggestion",
          key: "geminiAIActionSuggestion",
          type: "string",
          description: "An explicit action suggested by Gemini AI for this invoice such as Flag for Review Expedite Payment Initiate Fraud Check or Recommend Discount. This automates decision making.",
        },
        {
          label: "Gemini AI Compliance Status",
          key: "geminiAIComplianceStatus",
          type: "string",
          selection: [
            { value: "Compliant", label: "Compliant" },
            { value: "NonCompliant", label: "Non-Compliant" },
            { value: "PendingReview", label: "Pending Review" }
          ],
          description: "Compliance status determined by Gemini AI against regulatory frameworks and internal policies. Automatically flags deviations.",
        },
        {
          label: "Gemini AI Data Confidence",
          key: "geminiAIDataConfidence",
          type: "number",
          description: "A confidence score from 0 to 100 indicating Gemini AI's certainty in the data quality and extracted information. Low scores suggest manual verification.",
        }
      ],
    },
    {
      name: "Gemini Transaction Insights Dashboard",
      slug: "gemini-transaction-insights-dashboard",
      readonly: true,
      allowAdditionalFields: false,
      fields: [
        {
          label: "Insight ID",
          key: "insightId",
          type: "string",
          description: "Unique identifier for the Gemini AI generated insight for tracking and auditing.",
        },
        {
          label: "Related Invoice Identifier",
          key: "relatedInvoiceIdentifier",
          type: "string",
          description: "The primary invoice ID this insight pertains to enabling cross-referencing.",
        },
        {
          label: "Insight Type",
          key: "insightType",
          type: "string",
          selection: [
            { value: "Anomaly Detection", label: "Anomaly Detection" },
            { value: "Fraud Alert", label: "Fraud Alert" },
            { value: "Spending Pattern", label: "Spending Pattern" },
            { value: "Compliance Risk", label: "Compliance Risk" },
            { value: "Payment Optimization", label: "Payment Optimization" },
            { value: "Market Trend", label: "Market Trend" }
          ],
          description: "The type of analytical insight generated by Gemini AI such as Anomaly Detection Fraud Alert or Spending Pattern for categorization.",
        },
        {
          label: "Insight Details",
          key: "insightDetails",
          type: "string",
          description: "A detailed explanation of the insight provided by Gemini AI including context and supporting data points.",
        },
        {
          label: "Recommended Action",
          key: "recommendedAction",
          type: "string",
          description: "An explicit action recommended by Gemini AI based on the insight to guide human intervention or automated responses.",
        },
        {
          label: "Urgency Level",
          key: "urgencyLevel",
          type: "string",
          selection: [
            { value: "High", label: "High" },
            { value: "Medium", label: "Medium" },
            { value: "Low", label: "Low" }
          ],
          description: "The urgency level assigned by Gemini AI to the recommended action to prioritize workflow.",
        },
        {
          label: "Generated Timestamp",
          key: "generatedTimestamp",
          type: "string",
          description: "Timestamp when the Gemini AI insight was generated providing an audit trail.",
        },
        {
          label: "Gemini Model Version",
          key: "geminiModelVersion",
          type: "string",
          description: "The specific version of the Gemini AI model used to generate this insight ensuring reproducibility and traceability.",
        }
      ]
    }
  ],
  actions: [
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Initiate Gemini AI processing workflow",
      type: "string",
      description: "Submits all uploaded invoice data to the Gemini AI backend for initial validation enrichment and intelligent workflow routing. This is the critical first step in the automated financial processing pipeline.",
      primary: true,
      constraints: [{ type: "hasData" }, { type: "hasAllValid" }],
    },
    {
      operation: "runGeminiAIValidationAndCompliance",
      mode: "foreground",
      label: "Execute Gemini AI Validation and Compliance Checks",
      type: "string",
      description: "Initiates a comprehensive data validation and compliance check using Gemini AI. This process identifies logical inconsistencies data anomalies potential compliance issues against regulations and updates Gemini AI Risk Score and Gemini AI Compliance Status fields. This action is critical for regulatory adherence.",
      primary: false,
      constraints: [{ type: "hasData" }],
    },
    {
      operation: "enrichDataWithGeminiAI",
      mode: "foreground",
      label: "Enrich and standardize data with Gemini AI",
      type: "string",
      description: "Leverages Gemini AI to significantly enrich invoice and line item data. This includes inferring missing details standardizing free text fields generating Gemini AI Category Gemini AI Sentiment and populating address components for better analysis and automation.",
      primary: false,
      constraints: [{ type: "hasData" }],
    },
    {
      operation: "generateGeminiAIAnalyticsAndInsights",
      mode: "foreground",
      label: "Generate Gemini AI Advanced Analytics and Insights",
      type: "string",
      description: "Triggers Gemini AI to perform deep dive analytical processing and generate advanced actionable insights based on the fully processed invoice data. These insights are then meticulously populated into the Gemini Transaction Insights Dashboard sheet providing unparalleled business intelligence.",
      primary: false,
      constraints: [{ type: "hasData" }],
    },
    {
      operation: "autoCorrectAndSuggestWithGeminiAI",
      mode: "foreground",
      label: "Auto correct and suggest changes with Gemini AI",
      type: "string",
      description: "Allows Gemini AI to automatically correct minor data discrepancies standardize formats and provide intelligent suggestions for complex fields based on its understanding and predefined rules. Users can review these AI driven changes before final acceptance.",
      primary: false,
      constraints: [{ type: "hasData" }],
    },
    {
      operation: "routeInvoiceWithGeminiAI",
      mode: "foreground",
      label: "Intelligent Invoice Routing with Gemini AI",
      type: "string",
      description: "Utilizes Gemini AI's predictive capabilities to intelligently route invoices to the correct department team or individual for approvals or further processing based on invoice type amount risk score and historical workflow patterns. This streamlines operational efficiency.",
      primary: false,
      constraints: [{ type: "hasData" }],
    },
    {
      operation: "generateGeminiAIRecordSummary",
      mode: "foreground",
      label: "Generate Gemini AI Record Summary",
      type: "string",
      description: "Instructs Gemini AI to create a concise yet comprehensive summary for each processed invoice highlighting key details compliance status risks and recommended next steps. This summary is invaluable for quick reviews and audits.",
      primary: false,
      constraints: [{ type: "hasData" }],
    },
    {
      operation: "finalizeGeminiProcessedInvoices",
      mode: "foreground",
      label: "Finalize and Export Gemini Processed Invoices",
      type: "string",
      description: "Finalizes the invoices after all Gemini AI powered validation enrichment and insight generation steps are completed and approved. This action prepares the high quality data for secure export to Modern Treasury ERP systems or other integrated financial platforms.",
      primary: false,
      constraints: [{ type: "hasData" }, { type: "hasAllValid" }],
    }
  ],
};

export const invoiceBlueprintFields = invoiceBlueprint.sheets?.[0].fields || [];
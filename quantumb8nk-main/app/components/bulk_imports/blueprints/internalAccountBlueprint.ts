import { GoogleGenerativeAI } from "@google/generative-ai"

const NUM_CAPABILITIES = 5
const NUM_ACH_SETTINGS = 2

interface SchemaProperty {
  label: string
  key: string
  type: string
  description?: string
  geminiPromptHint?: string
}

interface AccountNumberDetails {
  accountNumber1: string
  accountNumber1Type: string
  accountNumber2?: string
  accountNumber2Type?: string
}

interface RoutingNumberDetails {
  routingNumber1: string
  routingNumber1Type: string
  routingNumber2?: string
  routingNumber2Type?: string
}

interface PartyAddressDetails {
  partyAddressLine1: string
  partyAddressLine2?: string
  partyAddressLocality: string
  partyAddressRegion?: string
  partyAddressPostalCode: string
  partyAddressCountry: string
}

interface AccountCapability {
  direction: string
  paymentType: string
  identifier?: string
  paymentSubtypes?: string
  anyCurrency?: string
  currencies?: string
  connectionId?: string
  partyName?: string
  addressLine1?: string
  addressLine2?: string
  addressLocality?: string
  addressRegion?: string
  addressPostalCode?: string
  addressCountry?: string
}

interface ACHSetting {
  immediateOrigin: string
  immediateOriginName: string
  immediateDestination: string
  immediateDestinationName: string
  direction?: string
  connectionEndpointLabel?: string
}

interface InternalAccount {
  name: string
  currency: string
  partyName: string
  partyAddress: PartyAddressDetails
  accountNumbers: AccountNumberDetails
  routingNumbers: RoutingNumberDetails
  capabilities: AccountCapability[]
  achSettings: ACHSetting[]
  geminiAnalysisStatus?: string
  geminiValidationIssues?: string[]
  geminiEnrichmentSuggestions?: Record<string, any>
}

const accountNumberFields = (): SchemaProperty[] => [
  {
    label: "Account Number",
    key: "accountNumber1",
    type: "string",
    description: "The primary bank account number",
    geminiPromptHint: "Extract the primary bank account number"
  },
  {
    label: "Account Number Type",
    key: "accountNumber1Type",
    type: "string",
    description: "One of iban, clabe, wallet_address, hk_number, nz_number or other. Use other if the bank account number is in a generic format. For international payments, use iban",
    geminiPromptHint: "Determine the type of the primary account number (e.g. iban, clabe, other)"
  },
  {
    label: "Account Number 2",
    key: "accountNumber2",
    type: "string",
    description: "If necessary, a additional account number",
    geminiPromptHint: "Extract any secondary account number if present"
  },
  {
    label: "Account Number 2 Type",
    key: "accountNumber2Type",
    type: "string",
    description: "The type of the the additional account number",
    geminiPromptHint: "Determine the type of the secondary account number"
  }
]

const routingNumberFields = (): SchemaProperty[] => [
  {
    label: "Routing Number",
    key: "routingNumber1",
    type: "string",
    description: "The primary routing number of the bank",
    geminiPromptHint: "Extract the primary routing number"
  },
  {
    label: "Routing Number Type",
    key: "routingNumber1Type",
    type: "string",
    description: "The type of the routing number. One of aba, swift, ca_cpa, au_bsb, gb_sort_code, in_ifsc",
    geminiPromptHint: "Determine the type of the primary routing number (e.g. aba, swift)"
  },
  {
    label: "Routing Number 2",
    key: "routingNumber2",
    type: "string",
    description: "There are some types of international bank accounts that require two routing numbers: one SWIFT code and one local routing number (e.g. au_bsb, in_ifsc, ca_cpa, etc.)",
    geminiPromptHint: "Extract any secondary routing number if applicable for international accounts"
  },
  {
    label: "Routing Number 2 Type",
    key: "routingNumber2Type",
    type: "string",
    description: "The type of the second routing number",
    geminiPromptHint: "Determine the type of the secondary routing number"
  }
]

const partyAddressFields = (): SchemaProperty[] => [
  {
    label: "Party Address Line1",
    key: "partyAddressLine1",
    type: "string",
    geminiPromptHint: "Extract the first line of the party's address"
  },
  {
    label: "Party Address Line2",
    key: "partyAddressLine2",
    type: "string",
    geminiPromptHint: "Extract the second line of the party's address if present"
  },
  {
    label: "Party Address Locality",
    key: "partyAddressLocality",
    type: "string",
    description: "The party address locality. A locality is typically a city or town",
    geminiPromptHint: "Extract the city or town from the party's address"
  },
  {
    label: "Party Address Region",
    key: "partyAddressRegion",
    type: "string",
    description: "The party address region. For US addresses, this is the state",
    geminiPromptHint: "Extract the state or region from the party's address"
  },
  {
    label: "Party Address Postal Code",
    key: "partyAddressPostalCode",
    type: "string",
    geminiPromptHint: "Extract the postal code or ZIP code from the party's address"
  },
  {
    label: "Party Address Country",
    key: "partyAddressCountry",
    type: "string",
    description: "A two-digit ISO country codes for the party address country",
    geminiPromptHint: "Extract the two-letter ISO country code from the party's address"
  }
]

const capabilityFields = (capabilityNumber: number): SchemaProperty[] => {
  const labelPrefix = `Account Capability ${capabilityNumber}`
  const keyPrefix = `capability${capabilityNumber}`

  return [
    {
      label: `${labelPrefix} Direction`,
      key: `${keyPrefix}Direction`,
      type: "string",
      description: "Must be 'credit' or 'debit'",
      geminiPromptHint: `For capability ${capabilityNumber}, determine if it supports 'credit', 'debit', or both. Default to both if not specified.`
    },
    {
      label: `${labelPrefix} Payment Type`,
      key: `${keyPrefix}PaymentType`,
      type: "string",
      geminiPromptHint: `Identify the payment type for capability ${capabilityNumber}`
    },
    {
      label: `${labelPrefix} Identifier`,
      key: `${keyPrefix}Identifier`,
      type: "string",
      description: "For ACH, this is the ACH Company ID",
      geminiPromptHint: `Extract any specific identifier for capability ${capabilityNumber}, e.g., ACH Company ID`
    },
    {
      label: `${labelPrefix} Payment Subtypes`,
      key: `${keyPrefix}PaymentSubtypes`,
      type: "string",
      description: "A comma-separated list of payment subtypes to allow. Leave blank for all subtypes",
      geminiPromptHint: `List any specific payment subtypes for capability ${capabilityNumber} (comma-separated). Leave empty for all.`
    },
    {
      label: `${labelPrefix} Any Currency`,
      key: `${keyPrefix}AnyCurrency`,
      type: "string",
      description: "When 'true', allows payments of this type for any currency",
      geminiPromptHint: `For capability ${capabilityNumber}, determine if it supports any currency ('true' or 'false').`
    },
    {
      label: `${labelPrefix} Currencies`,
      key: `${keyPrefix}Currencies`,
      type: "string",
      description: "A comma-separated list of currencies for which this type of payment can initiate",
      geminiPromptHint: `List specific currencies supported by capability ${capabilityNumber} (comma-separated ISO codes).`
    },
    {
      label: `${labelPrefix} Connection ID`,
      key: `${keyPrefix}ConnectionId`,
      type: "string",
      geminiPromptHint: `Identify any associated connection ID for capability ${capabilityNumber}`
    },
    {
      label: `${labelPrefix} Party Name`,
      key: `${keyPrefix}PartyName`,
      type: "string",
      description: "Overrides the legal name of the entity which owns the account when initiating payments",
      geminiPromptHint: `Extract any party name override for capability ${capabilityNumber}`
    },
    {
      label: `${labelPrefix} Address Line 1`,
      key: `${keyPrefix}AddressLine1`,
      type: "string",
      geminiPromptHint: `Extract Address Line 1 for capability ${capabilityNumber}`
    },
    {
      label: `${labelPrefix} Address Line 2`,
      key: `${keyPrefix}AddressLine2`,
      type: "string",
      geminiPromptHint: `Extract Address Line 2 for capability ${capabilityNumber}`
    },
    {
      label: `${labelPrefix} Address Locality`,
      key: `${keyPrefix}AddressLocality`,
      type: "string",
      description: "The address locality. A locality is typically a city or town",
      geminiPromptHint: `Extract Address Locality for capability ${capabilityNumber}`
    },
    {
      label: `${labelPrefix} Address Region`,
      key: `${keyPrefix}AddressRegion`,
      type: "string",
      description: "The address region. For US addresses, this is the state",
      geminiPromptHint: `Extract Address Region for capability ${capabilityNumber}`
    },
    {
      label: `${labelPrefix} Address Postal Code`,
      key: `${keyPrefix}AddressPostalCode`,
      type: "string",
      geminiPromptHint: `Extract Address Postal Code for capability ${capabilityNumber}`
    },
    {
      label: `${labelPrefix} Address Country`,
      key: `${keyPrefix}AddressCountry`,
      type: "string",
      description: "A two-digit ISO country code for the address country",
      geminiPromptHint: `Extract Address Country (ISO 2-letter code) for capability ${capabilityNumber}`
    }
  ]
}

const achSettingFields = (achSettingNumber: number): SchemaProperty[] => {
  const labelPrefix = `ACH Setting ${achSettingNumber}`
  const keyPrefix = `achSetting${achSettingNumber}`

  return [
    {
      label: `${labelPrefix} Immediate Origin`,
      key: `${keyPrefix}ImmediateOrigin`,
      type: "string",
      geminiPromptHint: `For ACH setting ${achSettingNumber}, extract the Immediate Origin`
    },
    {
      label: `${labelPrefix} Immediate Origin Name`,
      key: `${keyPrefix}ImmediateOriginName`,
      type: "string",
      geminiPromptHint: `For ACH setting ${achSettingNumber}, extract the Immediate Origin Name`
    },
    {
      label: `${labelPrefix} Immediate Destination`,
      key: `${keyPrefix}ImmediateDestination`,
      type: "string",
      geminiPromptHint: `For ACH setting ${achSettingNumber}, extract the Immediate Destination`
    },
    {
      label: `${labelPrefix} Immediate Destination Name`,
      key: `${keyPrefix}ImmediateDestinationName`,
      type: "string",
      geminiPromptHint: `For ACH setting ${achSettingNumber}, extract the Immediate Destination Name`
    },
    {
      label: `${labelPrefix} Direction`,
      key: `${keyPrefix}Direction`,
      type: "string",
      description: "Leave blank for both 'credit' and 'debit'",
      geminiPromptHint: `For ACH setting ${achSettingNumber}, specify direction (credit, debit, or blank for both)`
    },
    {
      label: `${labelPrefix} Connection Endpoint Label`,
      key: `${keyPrefix}ConnectionEndpointLabel`,
      type: "string",
      geminiPromptHint: `For ACH setting ${achSettingNumber}, extract the Connection Endpoint Label`
    }
  ]
}

export const internalAccountSchemaDefinition: SchemaProperty[] = [
  {
    label: "Name",
    key: "name",
    type: "string",
    description: "A nickname for the account",
    geminiPromptHint: "Provide a concise nickname for this internal account"
  },
  {
    label: "Currency",
    key: "currency",
    type: "string",
    description: "The currency of the account. Must be three-letter ISO currency code",
    geminiPromptHint: "Identify the three-letter ISO currency code for this account"
  },
  {
    label: "Party Name",
    key: "partyName",
    type: "string",
    description: "The legal name of the entity which owns the account",
    geminiPromptHint: "Extract the full legal name of the account owner"
  },
  ...partyAddressFields(),
  ...accountNumberFields(),
  ...routingNumberFields(),
  ...[...Array(NUM_CAPABILITIES).keys()].flatMap((_, i) =>
    capabilityFields(i + 1)
  ),
  ...[...Array(NUM_ACH_SETTINGS).keys()].flatMap((_, i) =>
    achSettingFields(i + 1)
  )
]

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"

class GeminiModelClient {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Gemini API error during content generation:", error)
      return "ERROR: Could not generate content"
    }
  }

  async generateStructuredContent<T>(prompt: string, schema: Record<string, any>): Promise<T | null> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{
          functionDeclarations: [
            {
              name: "parse_account_data",
              description: "Parses account details into a structured JSON object",
              parameters: schema
            }
          ]
        }]
      })
      const response = await result.response
      const functionCall = response.functionCall()
      if (functionCall && functionCall.name === "parse_account_data") {
        return functionCall.args as T
      }
      return null
    } catch (error) {
      console.error("Gemini API error during structured content generation:", error)
      return null
    }
  }

  async validateText(text: string, validationRules: string[]): Promise<string> {
    const prompt = `Review the following text for adherence to these rules:\n${validationRules.join("\n")}\n\nText: "${text}"\n\nProvide a concise summary of any issues found or confirm compliance. Focus on factual errors or missing information.`
    return this.generateContent(prompt)
  }
}

class InternalAccountDataMapper {
  static createPromptFromRawData(rawData: string, schema: SchemaProperty[]): string {
    let prompt = "Extract the following internal account details from the provided text. If a detail is not explicitly mentioned, infer it based on context or mark as 'unknown'. Structure the output as a JSON object matching the requested fields.\n\n"
    prompt += "Account Details:\n"
    schema.forEach(prop => {
      prompt += `- ${prop.label} (${prop.key}, ${prop.type}): ${prop.description || prop.geminiPromptHint || ""}\n`
    })
    prompt += "\nRaw Text:\n"
    prompt += rawData
    prompt += "\n\nProvide the output as a JSON object, strictly following the keys provided. Group capabilities and ACH settings into arrays of objects."

    return prompt
  }

  static createStructuredSchemaForGemini(schema: SchemaProperty[]): Record<string, any> {
    const properties: Record<string, any> = {}
    const required: string[] = []

    const processFields = (fields: SchemaProperty[], prefix = "") => {
      fields.forEach(prop => {
        const key = prefix + prop.key
        properties[key] = {
          type: prop.type === "string" ? "string" : "object",
          description: prop.description || prop.geminiPromptHint || prop.label
        }
        if (prop.type !== "string") {
          // Assuming nested types will be handled by further processing
          // For simplicity in this example, we'll keep top-level flat or specific nested structures
        }
        if (prop.key.includes("number1") || prop.key === "name" || prop.key === "currency" || prop.key === "partyName" || prop.key.includes("AddressLine1") || prop.key.includes("AddressCountry") || prop.key.includes("AddressLocality")) {
            required.push(key)
        }
      })
    }

    // Special handling for nested structures like capabilities and achSettings
    properties.name = { type: "string", description: "A nickname for the account" }
    properties.currency = { type: "string", description: "The three-letter ISO currency code" }
    properties.partyName = { type: "string", description: "The legal name of the entity" }
    required.push("name", "currency", "partyName")

    properties.partyAddress = {
      type: "object",
      description: "Details about the party's address",
      properties: {},
      required: []
    }
    partyAddressFields().forEach(f => {
      properties.partyAddress.properties[f.key] = { type: f.type, description: f.description || f.geminiPromptHint }
      if (f.key.includes("Line1") || f.key.includes("Locality") || f.key.includes("Country")) {
        properties.partyAddress.required.push(f.key)
      }
    })

    properties.accountNumbers = {
      type: "object",
      description: "Details about account numbers",
      properties: {},
      required: []
    }
    accountNumberFields().forEach(f => {
      properties.accountNumbers.properties[f.key] = { type: f.type, description: f.description || f.geminiPromptHint }
      if (f.key.includes("accountNumber1") && !f.key.includes("Type")) {
        properties.accountNumbers.required.push(f.key)
      }
    })

    properties.routingNumbers = {
      type: "object",
      description: "Details about routing numbers",
      properties: {},
      required: []
    }
    routingNumberFields().forEach(f => {
      properties.routingNumbers.properties[f.key] = { type: f.type, description: f.description || f.geminiPromptHint }
      if (f.key.includes("routingNumber1") && !f.key.includes("Type")) {
        properties.routingNumbers.required.push(f.key)
      }
    })

    properties.capabilities = {
      type: "array",
      description: "List of account capabilities",
      items: {
        type: "object",
        properties: {},
        required: []
      }
    }
    const capProps = (properties.capabilities.items as any).properties
    const capReq = (properties.capabilities.items as any).required
    capabilityFields(1).forEach(f => { // Use first capability to define schema for all
      const keyWithoutNumber = f.key.replace("capability1", "")
      capProps[keyWithoutNumber.charAt(0).toLowerCase() + keyWithoutNumber.slice(1)] = { type: f.type, description: f.description || f.geminiPromptHint }
      if (keyWithoutNumber.includes("Direction") || keyWithoutNumber.includes("PaymentType")) {
        capReq.push(keyWithoutNumber.charAt(0).toLowerCase() + keyWithoutNumber.slice(1))
      }
    })

    properties.achSettings = {
      type: "array",
      description: "List of ACH settings",
      items: {
        type: "object",
        properties: {},
        required: []
      }
    }
    const achProps = (properties.achSettings.items as any).properties
    const achReq = (properties.achSettings.items as any).required
    achSettingFields(1).forEach(f => { // Use first ACH setting to define schema for all
      const keyWithoutNumber = f.key.replace("achSetting1", "")
      achProps[keyWithoutNumber.charAt(0).toLowerCase() + keyWithoutNumber.slice(1)] = { type: f.type, description: f.description || f.geminiPromptHint }
      if (keyWithoutNumber.includes("ImmediateOrigin") || keyWithoutNumber.includes("ImmediateDestination")) {
        achReq.push(keyWithoutNumber.charAt(0).toLowerCase() + keyWithoutNumber.slice(1))
      }
    })

    return {
      type: "object",
      properties,
      required
    }
  }

  static transformGeminiOutputToInternalAccount(geminiOutput: any): InternalAccount {
    const account: Partial<InternalAccount> = {
      partyAddress: {} as PartyAddressDetails,
      accountNumbers: {} as AccountNumberDetails,
      routingNumbers: {} as RoutingNumberDetails,
      capabilities: [],
      achSettings: []
    }

    for (const key in geminiOutput) {
      if (key === "partyAddress") {
        account.partyAddress = geminiOutput[key]
      } else if (key === "accountNumbers") {
        account.accountNumbers = geminiOutput[key]
      } else if (key === "routingNumbers") {
        account.routingNumbers = geminiOutput[key]
      } else if (key === "capabilities") {
        account.capabilities = geminiOutput[key].map((cap: any) => {
          const transformedCap: Partial<AccountCapability> = {}
          for (const cKey in cap) {
            const camelKey = cKey.charAt(0).toLowerCase() + cKey.slice(1)
            ;(transformedCap as any)[camelKey] = cap[cKey]
          }
          return transformedCap as AccountCapability
        })
      } else if (key === "achSettings") {
        account.achSettings = geminiOutput[key].map((ach: any) => {
          const transformedAch: Partial<ACHSetting> = {}
          for (const aKey in ach) {
            const camelKey = aKey.charAt(0).toLowerCase() + aKey.slice(1)
            ;(transformedAch as any)[camelKey] = ach[aKey]
          }
          return transformedAch as ACHSetting
        })
      } else {
        ;(account as any)[key] = geminiOutput[key]
      }
    }

    return account as InternalAccount
  }
}

class InternalAccountAutomationService {
  private geminiClient: GeminiModelClient
  private schemaForGemini: Record<string, any>

  constructor(apiKey: string) {
    this.geminiClient = new GeminiModelClient(apiKey)
    this.schemaForGemini = InternalAccountDataMapper.createStructuredSchemaForGemini(internalAccountSchemaDefinition)
  }

  async processRawAccountInput(rawData: string): Promise<InternalAccount> {
    const prompt = InternalAccountDataMapper.createPromptFromRawData(rawData, internalAccountSchemaDefinition)
    const geminiOutput = await this.geminiClient.generateStructuredContent<InternalAccount>(prompt, this.schemaForGemini)

    if (!geminiOutput) {
      throw new Error("Gemini failed to generate structured account data.")
    }

    const internalAccount = InternalAccountDataMapper.transformGeminiOutputToInternalAccount(geminiOutput)
    internalAccount.geminiAnalysisStatus = "Initial parsing complete"
    return internalAccount
  }

  async validateAndEnrichAccount(account: InternalAccount): Promise<InternalAccount> {
    const validationRules = [
      "Currency must be a valid 3-letter ISO code.",
      "Primary Account Number and Type are mandatory.",
      "Primary Routing Number and Type are mandatory.",
      "Party Address Line 1, Locality, and Country are mandatory.",
      "Capability Directions must be 'credit', 'debit', or inferred 'both'.",
      "Capability Payment Types are mandatory.",
      "If 'Any Currency' is 'true', 'Currencies' should be empty.",
      "ACH Immediate Origin and Destination are mandatory for ACH settings."
    ]

    const accountJson = JSON.stringify(account, null, 2)
    const validationResult = await this.geminiClient.validateText(accountJson, validationRules)

    account.geminiValidationIssues = []
    if (validationResult.includes("ERROR") || validationResult.includes("issue")) {
      account.geminiValidationIssues.push(validationResult)
      account.geminiAnalysisStatus = "Validation issues found"
    } else {
      account.geminiAnalysisStatus = "Validation successful"
    }

    const enrichmentPrompt = `Review the following internal account data and suggest any logical enrichments or corrections, especially for missing optional fields based on common banking practices. Provide suggestions in a JSON object format where keys are the field paths (e.g., partyAddress.addressLine2) and values are the suggested new values. If no enrichment is needed, return an empty JSON object.\n\nAccount Data:\n${accountJson}`
    const enrichmentSuggestionsStr = await this.geminiClient.generateContent(enrichmentPrompt)
    try {
      account.geminiEnrichmentSuggestions = JSON.parse(enrichmentSuggestionsStr)
      if (Object.keys(account.geminiEnrichmentSuggestions).length > 0) {
        account.geminiAnalysisStatus += " with enrichment suggestions"
      }
    } catch (e) {
      console.warn("Gemini enrichment suggestions not in valid JSON format.")
      account.geminiEnrichmentSuggestions = { error: "Gemini enrichment output not parsable" }
    }

    return account
  }

  async categorizeCapabilities(account: InternalAccount): Promise<InternalAccount> {
    const capabilityCategorizationPrompt = `Given the following internal account and its defined capabilities, use your knowledge to provide more descriptive 'paymentSubtypes' for each capability if they are currently blank or generic. Also, confirm or adjust 'anyCurrency' and 'currencies' based on common payment types. Respond with an array of updated capability objects.
    Account Currency: ${account.currency}
    Capabilities: ${JSON.stringify(account.capabilities, null, 2)}`

    const updatedCapabilitiesJson = await this.geminiClient.generateContent(capabilityCategorizationPrompt)
    try {
      const updatedCaps: AccountCapability[] = JSON.parse(updatedCapabilitiesJson)
      if (Array.isArray(updatedCaps)) {
        account.capabilities = updatedCaps
        account.geminiAnalysisStatus += ", capabilities categorized"
      }
    } catch (e) {
      console.warn("Gemini capability categorization output not in valid JSON format.")
    }
    return account
  }

  async generateComplianceReport(account: InternalAccount): Promise<string> {
    const compliancePrompt = `Generate a compliance summary report for the following internal account. Highlight any potential compliance risks related to account numbers, routing numbers, party address, or capabilities based on common financial regulations (e.g., AML, KYC). If validation issues exist, incorporate them.
    Account Data: ${JSON.stringify(account, null, 2)}`
    return this.geminiClient.generateContent(compliancePrompt)
  }

  async executeAutomatedActions(account: InternalAccount): Promise<string[]> {
    const actions: string[] = []
    if (account.geminiValidationIssues && account.geminiValidationIssues.length > 0) {
      actions.push(`Action: Flag for manual review due to validation issues: ${account.geminiValidationIssues.join("; ")}`)
    } else {
      actions.push("Action: Account passed automated validation.")
      if (account.geminiEnrichmentSuggestions && Object.keys(account.geminiEnrichmentSuggestions).length > 0) {
        actions.push("Action: Apply automated enrichments.")
        // In a real system, apply these enrichments to the account object
        // For demonstration, we just log the action
      }
      actions.push("Action: Initiate internal account registration workflow.")
      actions.push("Action: Notify relevant departments for new account setup.")
    }
    return actions
  }
}

export async function runGeminiInternalAccountAutomation(rawInputData: string): Promise<any> {
  const automationService = new InternalAccountAutomationService(GEMINI_API_KEY)

  console.log("Starting Gemini-powered internal account processing...")

  try {
    let account = await automationService.processRawAccountInput(rawInputData)
    console.log("Step 1: Raw input parsed by Gemini.")

    account = await automationService.validateAndEnrichAccount(account)
    console.log("Step 2: Account validated and enriched by Gemini.")

    account = await automationService.categorizeCapabilities(account)
    console.log("Step 3: Capabilities categorized by Gemini.")

    const complianceReport = await automationService.generateComplianceReport(account)
    console.log("Step 4: Compliance report generated by Gemini.")

    const automatedActions = await automationService.executeAutomatedActions(account)
    console.log("Step 5: Automated actions determined.")

    return {
      processedAccount: account,
      complianceReport: complianceReport,
      automatedActions: automatedActions,
      finalStatus: account.geminiAnalysisStatus
    }
  } catch (error) {
    console.error("Overall automation failed:", error)
    return { error: (error as Error).message, status: "Failed" }
  }
}

// Example of a raw input that would typically come from an unstructured source
const exampleRawInput = `
Internal Account Details:

Account Name: My Corporate Operating Account
Currency: USD
Owner: Global Payments Solutions Inc.
Address: 123 Main Street, Anytown, CA 90210, USA

Account Number: 9876543210 (Type: ABA)
Routing Number: 123456789 (Type: ABA)

Capabilities:
1. Direction: credit, debit. Payment Type: ACH. Identifier: GBLPYMTSID. Subtypes: PPD, CCD. Currencies: USD.
2. Direction: credit. Payment Type: Wire. Any Currency: true.

ACH Settings:
1. Immediate Origin: 111111111. Immediate Origin Name: GLOBAL CORP. Immediate Destination: 222222222. Immediate Destination Name: BANK OF AMERICA.
`

// To run this, you would typically call:
// runGeminiInternalAccountAutomation(exampleRawInput).then(result => console.log(JSON.stringify(result, null, 2)));
// Remember to replace "YOUR_GEMINI_API_KEY_HERE" with an actual Gemini API key.
// And install the Google Generative AI SDK: npm install @google/generative-ai
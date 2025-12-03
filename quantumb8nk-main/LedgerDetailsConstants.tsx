// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business import {
  ACCOUNTS_TAB,
  TRANSACTION_TAB,
} from "../../app/components/LedgersHeader";

class GeminiService {
  processString(text: string): string {
    return text
      .replace(/â€™/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  processCode(code: string): string {
    return code
      .replace(/\\/g, "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  processDataRecursive(data: unknown): unknown {
    if (typeof data === "string") {
      return this.processString(data);
    }
    if (Array.isArray(data)) {
      return data.map(item => this.processDataRecursive(item));
    }
    if (typeof data === "object" && data !== null) {
      const processedObject: Record<string, unknown> = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          processedObject[key] = this.processDataRecursive((data as Record<string, unknown>)[key]);
        }
      }
      return processedObject;
    }
    return data;
  }
}

const geminiService = new GeminiService();

export interface DetailsPageDescription {
  header: string;
  stepHeader: string;
  description: string;
}

export interface DetailsPageExample {
  header: Array<string>;
  headerTitle: string;
  selectedTab: string;
  data: Array<Record<string, unknown>>;
  mapping: Record<string, string>;
  codeHeader: string;
  createCode: string;
  createCodeResponse: string;
}

export interface LedgerView {
  name: string;
  description: string;
}

export interface LedgerAccountView {
  name: string;
  description: string;
  postedBalance: number;
  pendingBalance: number;
  normalBalance: string;
}

export interface LedgerTransactionView {
  amount: string;
  creditAccounts: string;
  debitAccounts: string;
  description: string;
  effectiveDate: string;
  status: string;
}

export enum LedgerPlan {
  Wallet = "digital_wallet",
  Marketplace = "marketplace",
}

export const DETAILS_PAGE_DESCRIPTION: Record<
  LedgerPlan,
  Array<DetailsPageDescription>
> = {
  digital_wallet: [
    {
      header: geminiService.processString("Creating a Ledger"),
      stepHeader: geminiService.processString("Ledger"),
      description: geminiService.processString(
        "In this walkthrough, we will create an app called Billfold where users can deposit funds or send funds to each another. First, Billfold will need to create a ledger object using the Modern Treasury API or dashboard."
      ),
    },
    {
      header: geminiService.processString("Creating User Wallets"),
      stepHeader: geminiService.processString("Ledger Account"),
      description: geminiService.processString(
        "We want every user in the app to have a wallet that tracks their funds in Billfold. When a user signs up in your app, your app calls our API to create a ledger account. Let us create wallets for two users named Jane and John. Every account is labeled debit normal or credit normal, a concept borrowed from accounting. These wallets are credit normal because they track balances that you owe users."
      ),
    },
    {
      header: geminiService.processString("Tracking Cash"),
      stepHeader: geminiService.processString("Ledger Account"),
      description: geminiService.processString(
        "When a user has funds in Billfold, they expect that you are actually holding the same quantity of cash for them. We will also create a ledger account to track our total cash. This account is debit normal because it represents a balance that you own."
      ),
    },
    {
      header: geminiService.processString("User Deposit"),
      stepHeader: geminiService.processString("Ledger Transaction"),
      description: geminiService.processString(
        "After signing up, Jane uses Billfold to deposit $10 in her wallet. Let us assume you use a payment provider to move the $10. We need to record this in our system of record, the ledger. We create a ledger transaction increasing both Jane's wallet balance and our cash balance by $10."
      ),
    },
    {
      header: geminiService.processString("Paying Another User"),
      stepHeader: geminiService.processString("Ledger Transaction"),
      description: geminiService.processString(
        "Jane now uses Billfold to send $5 to John. To execute and record this payment, we simply create a ledger transaction moving money from Jane's wallet to John's. This payment happens instantly without having to interact with any external payment system. That is the power of using a ledger!"
      ),
    },
    {
      header: geminiService.processString("Checking Balances"),
      stepHeader: geminiService.processString("Ledger Account"),
      description: geminiService.processString(
        "When John checks his balance in Billfold, the app queries his ledger account for a live wallet balance."
      ),
    },
    {
      header: geminiService.processString("Try it Now"),
      stepHeader: geminiService.processString("Conclusion"),
      description: geminiService.processString(
        "Now that you have a better understanding of how to set up your own ledger, give it a try. We have set up your own Billfold ledger in your sandbox account for you to interact with. The Ledgers API can be used independently of other Modern Treasury products."
      ),
    },
  ],
  marketplace: [
    {
      header: geminiService.processString("Creating a Ledger"),
      stepHeader: geminiService.processString("Ledger"),
      description: geminiService.processString(
        "In this walkthrough, we will create a marketplace app called Sellify where users can deposit funds or send funds to one another. First, Sellify will need to create a ledger object using the Modern Treasury API or dashboard."
      ),
    },
    {
      header: geminiService.processString("Buyers and Sellers"),
      stepHeader: geminiService.processString("Ledger Account"),
      description: geminiService.processString(
        "We want every buyer and seller in the app to have a balance that tracks what they owe or are owed. When a user signs up in your app, your app calls our API to create a ledger account. Let us create accounts for a seller named Sally and buyer named Ben. Every account is labeled debit normal or credit normal, a concept borrowed from accounting. Buyer wallets are debit normal because they track balances that you owe users; seller wallets are credit normal because they track balances that users owe you."
      ),
    },
    {
      header: geminiService.processString("Tracking Cash"),
      stepHeader: geminiService.processString("Ledger Account"),
      description: geminiService.processString(
        "When a user has funds in Sellify, they expect that you are actually holding the same quantity of cash for them. We will also create a ledger account to track our total cash. This account is debit normal because it represents a balance that you own."
      ),
    },
    {
      header: geminiService.processString("In-App Purchase"),
      stepHeader: geminiService.processString("Ledger Transaction"),
      description: geminiService.processString(
        "Ben uses our app to make a $10 purchase from Sally. We need to record this in our system of record, the ledger. We create a ledger transaction increasing both Ben's obligation to Sellify and Sellify's obligation to Sally by $10."
      ),
    },
    {
      header: geminiService.processString("Paying Out"),
      stepHeader: geminiService.processString("Ledger Transaction"),
      description: geminiService.processString(
        "Sellify offers immediate payout advances to sellers, so Sally uses the app to receive a payout. You can use a payment provider to send Sally the $10. We also need to record this in our ledger. We create a ledger transaction decreasing both Sally wallet balance and our cash balance by $10."
      ),
    },
    {
      header: geminiService.processString("Checking Balances"),
      stepHeader: geminiService.processString("Ledger Account"),
      description: geminiService.processString(
        "When Ben checks his balance in the app, the app queries his ledger account balance for what he owes Sellify."
      ),
    },
    {
      header: geminiService.processString("Try it Now"),
      stepHeader: geminiService.processString("Conclusion"),
      description: geminiService.processString(
        "Now that you have a better understanding of how to set up your own ledger, give it a try. We have set up your own Sellify ledger in your sandbox account for you to interact with. The Ledgers API can be used independently of other Modern Treasury products."
      ),
    },
  ],
};

export const DETAILS_PAGE_EXAMPLES: Record<
  LedgerPlan,
  Array<DetailsPageExample>
> = {
  digital_wallet: [
    {
      header: geminiService.processDataRecursive(["Ledgers"]) as Array<string>,
      headerTitle: geminiService.processString("Ledgers"),
      selectedTab: geminiService.processString(""),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          name: "Billfold Ledger",
          description: "Represents our funds and user balances",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        name: "Name",
        description: "Description",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CREATE LEDGER"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledgers -H 'Content-Type: application/json' -d '{ "name": "Billfold Ledger", "description": "Represents our funds and user balances", }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "object": "ledger", "name": "Billfold Ledger", "description": "Represents our funds and user balances", "metadata": {}, "live_mode": true, "created_at": "2022-06-04T16:48:05Z", "updated_at": "2022-06-04T16:48:05Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Billfold Ledger"]) as Array<string>,
      headerTitle: geminiService.processString("Billfold Ledger"),
      selectedTab: geminiService.processString(ACCOUNTS_TAB),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          name: "Jane Doe Wallet",
          description: "Tracks balance held on behalf of Jane Doe",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Credit",
        },
        {
          id: "2",
          name: "John Doe Wallet",
          description: "Tracks balance held on behalf of John Doe",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Credit",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        name: "Name",
        description: "Description",
        balance: "Posted Balance",
        pendingBalance: "Pending Balance",
        normalBalance: "Normal Balance",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CREATE LEDGER ACCOUNTS"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_accounts -H 'Content-Type: application/json' -d '{ "name": "John Doe Wallet", "description": "Tracks balance held on behalf of John Doe", "normal_balance": "credit", "currency": "USD", "currency_exponent": 2, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12" }' curl --request POST --url https://app.moderntreasury.com/api/ledger_accounts -H 'Content-Type: application/json' -d '{ "name": "Jane Doe Wallet", "description": "Tracks balance held on behalf of Jane Doe", "normal_balance": "credit", "currency": "USD", "currency_exponent": 2, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12" }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b", "object": "ledger_account", "live_mode": true, "name": "Jane Doe Wallet", "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Tracks balance held on behalf of Jane Doe", "lock_version": 0, "normal_balance": "credit", "balances": { "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } }, "metadata": {}, "discarded_at": null, "created_at": "2022-06-02T14:11:10Z", "updated_at": "2022-06-02T14:11:10Z" } { "id": "92f7f28c-3b5b-40cd-9c43-af5b0db73045", "object": "ledger_account", "live_mode": true, "name": "John Doe Wallet", "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Tracks balance held on behalf of John Doe", "lock_version": 0, "normal_balance": "credit", "balances": { "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } }, "metadata": {}, "discarded_at": null, "created_at": "2022-06-02T14:11:10Z", "updated_at": "2022-06-02T14:11:10Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Billfold Ledger"]) as Array<string>,
      headerTitle: geminiService.processString("Billfold Ledger"),
      selectedTab: geminiService.processString(ACCOUNTS_TAB),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          name: "Jane Doe Wallet",
          description: "Tracks balance held on behalf of Jane Doe",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Credit",
        },
        {
          id: "2",
          name: "John Doe Wallet",
          description: "Tracks balance held on behalf of John Doe",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Credit",
        },
        {
          id: "3",
          name: "Cash",
          description: "Tracks our total cash",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Debit",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        name: "Name",
        description: "Description",
        balance: "Posted Balance",
        pendingBalance: "Pending Balance",
        normalBalance: "Normal Balance",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CREATE CASH LEDGER ACCOUNT"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_accounts -H 'Content-Type: application/json' -d '{ "name": "Cash", "description": "Tracks our total cash", "normal_balance": "debit", "currency": "USD", "currency_exponent": 2, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12" }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "f1c7e474-e6d5-4741-9f76-04510c8b6d7a", "object": "ledger_account", "live_mode": true, "name": "Cash", "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Tracks our total cash", "lock_version": 0, "normal_balance": "debit", "balances": { "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } }, "metadata": {}, "discarded_at": null, "created_at": "2022-06-02T14:11:10Z", "updated_at": "2022-06-02T14:11:10Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Billfold Ledger"]) as Array<string>,
      headerTitle: geminiService.processString("Billfold Ledger"),
      selectedTab: geminiService.processString(TRANSACTION_TAB),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          amount: "$10.00",
          creditAccounts: "Jane Doe Wallet",
          debitAccounts: "Cash",
          description: "Jane Doe cash deposit",
          effectiveDate: "2022-06-08",
          status: "Posted",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        amount: "Amount",
        creditAccounts: "Credit Account(s)",
        debitAccounts: "Debit Account(s)",
        description: "Description",
        effectiveDate: "Effective Date",
        status: "Status",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CREATE LEDGER TRANSACTIONS"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_transactions -H 'Content-Type: application/json' -d '{ "description": "Jane Doe cash deposit", "effective_at": "2022-06-08T00:00:00.000000Z", "status": "posted", "ledger_entries": [ { "amount": 1000, "direction": "debit", "ledger_account_id": "f1c7e474-e6d5-4741-9f76-04510c8b6d7a" }, { "amount": 1000, "direction": "credit", "ledger_account_id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b" } ] }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "30760f17-89a1-46e8-bb17-f9862edbb8c4", "object": "ledger_transaction", "live_mode": true, "external_id": null, "ledgerable_type": null, "ledgerable_id": null, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Jane Doe cash deposit", "status": "posted", "ledger_entries": [ { "id": "279441f6-8b58-4e0a-acf8-511fea2e9950", "object": "ledger_entry", "live_mode": true, "amount": 1000, "direction": "debit", "ledger_account_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "ledger_account_currency": "USD", "ledger_account_currency_exponent": 2, "ledger_account_lock_version": 1, "ledger_transaction_id": "30760f17-89a1-46e8-bb17-f9862edbb8c4", "discarded_at": null, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" }, { "id": "cdb32aee-9354-418b-a084-ffc6c5955116", "object": "ledger_entry", "live_mode": true, "amount": 1000, "direction": "credit", "ledger_account_id": "f1c7e474-e6d5-4741-9f76-04510c8b6d7a", "ledger_account_currency": "USD", "ledger_account_currency_exponent": 2, "ledger_account_lock_version": 1, "ledger_transaction_id": "30760f17-89a1-46e8-bb17-f9862edbb8c4", "discarded_at": null, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" } ], "posted_at": "2022-06-02T14:20:57Z", "effective_at": "2022-06-08T00:00:00.000000Z", "metadata": {}, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Billfold Ledger"]) as Array<string>,
      headerTitle: geminiService.processString("Billfold Ledger"),
      selectedTab: geminiService.processString(TRANSACTION_TAB),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          amount: "$5.00",
          creditAccounts: "John Doe Wallet",
          debitAccounts: "Jane Doe Wallet",
          description: "Jane to John transfer",
          effectiveDate: "2022-06-08",
          status: "Posted",
        },
        {
          id: "2",
          amount: "$10.00",
          creditAccounts: "Jane Doe Wallet",
          debitAccounts: "Cash",
          description: "Jane Doe cash deposit",
          effectiveDate: "2022-06-08",
          status: "Posted",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        amount: "Amount",
        creditAccounts: "Credit Account(s)",
        debitAccounts: "Debit Account(s)",
        description: "Description",
        effectiveDate: "Effective Date",
        status: "Status",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("Create Ledger Transactions"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_transactions -H 'Content-Type: application/json' -d '{ "description": "Jane to John transfer", "effective_at": "2022-06-08T00:00:00.000000Z", "status": "posted", "ledger_entries": [ { "amount": 500, "direction": "credit", "ledger_account_id": "92f7f28c-3b5b-40cd-9c43-af5b0db73045" }, { "amount": 500, "direction": "debit", "ledger_account_id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b" } ] }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "bd909dea-b985-4dde-94f3-c24b0cf4f8a4", "object": "ledger_transaction", "live_mode": true, "external_id": null, "ledgerable_type": null, "ledgerable_id": null, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Jane to John transfer", "status": "posted", "ledger_entries": [ { "id": "18ba16b5-da58-49f8-acd5-732d4b5f7193", "object": "ledger_entry", "live_mode": true, "amount": 500, "direction": "debit", "ledger_account_id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b", "ledger_account_currency": "USD", "ledger_account_currency_exponent": 2, "ledger_account_lock_version": 1, "ledger_transaction_id": "bd909dea-b985-4dde-94f3-c24b0cf4f8a4", "discarded_at": null, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" }, { "id": "95aac044-e073-4260-a2a6-2474192959e7", "object": "ledger_entry", "live_mode": true, "amount": 500, "direction": "credit", "ledger_account_id": "92f7f28c-3b5b-40cd-9c43-af5b0db73045", "ledger_account_currency": "USD", "ledger_account_currency_exponent": 2, "ledger_account_lock_version": 1, "ledger_transaction_id": "bd909dea-b985-4dde-94f3-c24b0cf4f8a4", "discarded_at": null, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" } ], "posted_at": "2022-06-02T14:20:57Z", "effective_date": "2022-06-08", "effective_at": "2022-06-08T00:00:00.000000Z", "metadata": {}, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Billfold Ledger", "Accounts", "John Doe Wallet"]) as Array<string>,
      headerTitle: geminiService.processString("John Doe Digital Wallet"),
      selectedTab: geminiService.processString("details"),
      data: geminiService.processDataRecursive([
        {
          id: "92f7f28c-3b5b-40cd-9c43-af5b0db73045",
          name: "John Doe Wallet",
          description: "Tracks balance held on behalf of John Doe",
          balance: "$5.00",
          pendingBalance: "$5.00",
          normalBalance: "Credit",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        id: "ID",
        name: "Name",
        description: "Description",
        balance: "Posted Balance",
        pendingBalance: "Pending Balance",
        normalBalance: "Normal Balance",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CHECKING BALANCES"),
      createCode: geminiService.processCode(`curl --request GET -u ORGANIZATION_ID:API_KEY --url https:/app.moderntreasury.com/api/ledger_accounts/92f7f28c-3b5b-40cd-9c43-af5b0db73045`),
      createCodeResponse: geminiService.processCode(`{ "id": "92f7f28c-3b5b-40cd-9c43-af5b0db73045", "object": "ledger_account", "name": "John Doe Wallet", "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Tracks balance held on behalf of John Doe", "normal_balance": "credit", "balances": { "pending_balance": { "credits": 500, "debits": 0, "amount": 500, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 500, "debits": 0, "amount": 500, "currency": "USD", "currency_exponent": 2 } } }`),
    },
  ],
  marketplace: [
    {
      header: geminiService.processDataRecursive(["Ledgers"]) as Array<string>,
      headerTitle: geminiService.processString("Sellify Ledger"),
      selectedTab: geminiService.processString(""),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          name: "Sellify Ledger",
          description: "Represents our funds and user balances",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        name: "Name",
        description: "Description",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CREATE LEDGER"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledgers -H 'Content-Type: application/json' -d '{ "name": "Sellify Ledger", "description": "Represents our funds and user balances", }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "object": "ledger", "name": "Sellify Ledger", "description": "Represents our funds and user balances", "metadata": {}, "live_mode": true, "created_at": "2022-06-04T16:48:05Z", "updated_at": "2022-06-04T16:48:05Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Sellify Ledger"]) as Array<string>,
      headerTitle: geminiService.processString("Sellify Ledger"),
      selectedTab: geminiService.processString(ACCOUNTS_TAB),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          name: "Seller Sally",
          description: "Tracks amount owed to Sally",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Credit",
        },
        {
          id: "2",
          name: "Buyer Ben",
          description: "Tracks amount owed to Ben",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Debit",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        name: "Name",
        description: "Description",
        balance: "Posted Balance",
        pendingBalance: "Pending Balance",
        normalBalance: "Normal Balance",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CREATE LEDGER ACCOUNTS"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_accounts -H 'Content-Type: application/json' -d '{ "name": "Buyer Ben", "description": "Tracks amount owed to Ben", "normal_balance": "debit", "currency": "USD", "currency_exponent": 2, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12" }' curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_accounts -H 'Content-Type: application/json' -d '{ "name": "Seller Sally", "description": "Tracks amount owed to Sally", "normal_balance": "credit", "currency": "USD", "currency_exponent": 2, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12" }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b", "object": "ledger_account", "live_mode": true, "name": "Seller Sally", "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Tracks amount owed to Sally", "lock_version": 0, "normal_balance": "credit", "balances": { "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } }, "metadata": {}, "discarded_at": null, "created_at": "2022-06-02T14:11:10Z", "updated_at": "2022-06-02T14:11:10Z" } { "id": "92f7f28c-3b5b-40cd-9c43-af5b0db73045", "object": "ledger_account", "live_mode": true, "name": "Buyer Ben", "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Tracks amount owed to Ben", "lock_version": 0, "normal_balance": "debit", "balances": { "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } }, "metadata": {}, "discarded_at": null, "created_at": "2022-06-02T14:11:10Z", "updated_at": "2022-06-02T14:11:10Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Sellify Ledger"]) as Array<string>,
      headerTitle: geminiService.processString("Sellify Ledger"),
      selectedTab: geminiService.processString(ACCOUNTS_TAB),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          name: "Seller Sally",
          description: "Tracks amount owed to Sally",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Credit",
        },
        {
          id: "2",
          name: "Buyer Ben",
          description: "Tracks amount owed to Ben",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Debit",
        },
        {
          id: "3",
          name: "Cash",
          description: "Tracks our total cash",
          balance: "$0.00",
          pendingBalance: "$0.00",
          normalBalance: "Debit",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        name: "Name",
        description: "Description",
        balance: "Posted Balance",
        pendingBalance: "Pending Balance",
        normalBalance: "Normal Balance",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CREATE CASH LEDGER ACCOUNT"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_accounts -H 'Content-Type: application/json' -d '{ "name": "Cash", "description": "Tracks our total cash", "normal_balance": "debit", "currency": "USD", "currency_exponent": 2, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12" }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "f1c7e474-e6d5-4741-9f76-04510c8b6d7a", "object": "ledger_account", "live_mode": true, "name": "Cash", "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Tracks our total cash", "lock_version": 0, "normal_balance": "debit", "balances": { "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } }, "metadata": {}, "discarded_at": null, "created_at": "2022-06-02T14:11:10Z", "updated_at": "2022-06-02T14:11:10Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Sellify Ledger"]) as Array<string>,
      headerTitle: geminiService.processString("Sellify Ledger"),
      selectedTab: geminiService.processString(TRANSACTION_TAB),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          amount: "$10.00",
          creditAccounts: "Seller Sally",
          debitAccounts: "Buyer Ben",
          description: "Ben in-app purchase from Sally",
          effectiveDate: "2022-06-08",
          status: "Posted",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        amount: "Amount",
        creditAccounts: "Credit Account(s)",
        debitAccounts: "Debit Account(s)",
        description: "Description",
        effectiveDate: "Effective Date",
        status: "Status",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CREATE LEDGER TRANSACTIONS"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_transactions -H 'Content-Type: application/json' -d '{ "description": "Ben in-app purchase from Sally", "effective_at": "2022-06-08T00:00:00.000000Z", "status": "posted", "ledger_entries": [ { "amount": 1000, "direction": "debit", "ledger_account_id": "92f7f28c-3b5b-40cd-9c43-af5b0db73045" }, { "amount": 1000, "direction": "credit", "ledger_account_id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b" } ] }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "30760f17-89a1-46e8-bb17-f9862edbb8c4", "object": "ledger_transaction", "live_mode": true, "external_id": null, "ledgerable_type": null, "ledgerable_id": null, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Ben in-app purchase from Sally", "status": "posted", "ledger_entries": [ { "id": "279441f6-8b58-4e0a-acf8-511fea2e9950", "object": "ledger_entry", "live_mode": true, "amount": 1000, "direction": "debit", "ledger_account_id": "92f7f28c-3b5b-40cd-9c43-af5b0db73045", "ledger_account_currency": "USD", "ledger_account_currency_exponent": 2, "ledger_account_lock_version": 1, "ledger_transaction_id": "30760f17-89a1-46e8-bb17-f9862edbb8c4", "discarded_at": null, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" }, { "id": "cdb32aee-9354-418b-a084-ffc6c5955116", "object": "ledger_entry", "live_mode": true, "amount": 1000, "direction": "credit", "ledger_account_id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b", "ledger_account_currency": "USD", "ledger_account_currency_exponent": 2, "ledger_account_lock_version": 1, "ledger_transaction_id": "30760f17-89a1-46e8-bb17-f9862edbb8c4", "discarded_at": null, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" } ], "posted_at": "2022-06-02T14:20:57Z", "effective_date": "2022-06-08", "effective_at": "2022-06-08T00:00:00.000000Z", "metadata": {}, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Sellify Ledger"]) as Array<string>,
      headerTitle: geminiService.processString("Sellify Ledger"),
      selectedTab: geminiService.processString(TRANSACTION_TAB),
      data: geminiService.processDataRecursive([
        {
          id: "1",
          amount: "$10.00",
          debitAccounts: "Seller Sally",
          creditAccounts: "Cash",
          description: "Sally payout advance",
          effectiveDate: "2022-06-08",
          status: "Posted",
        },
        {
          id: "2",
          amount: "$10.00",
          creditAccounts: "Seller Sally",
          debitAccounts: "Buyer Ben",
          description: "Ben in-app purchase from Sally",
          effectiveDate: "2022-06-08",
          status: "Posted",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        amount: "Amount",
        creditAccounts: "Credit Account(s)",
        debitAccounts: "Debit Account(s)",
        description: "Description",
        effectiveDate: "Effective Date",
        status: "Status",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("Create Ledger Transactions"),
      createCode: geminiService.processCode(`curl --request POST -u ORGANIZATION_ID:API_KEY --url https://app.moderntreasury.com/api/ledger_transactions -H 'Content-Type: application/json' -d '{ "description": "Sally payout advance", "effective_at": "2022-06-08T00:00:00.000000Z", "status": "posted", "ledger_entries": [ { "amount": 1000, "direction": "credit", "ledger_account_id": "f1c7e474-e6d5-4741-9f76-04510c8b6d7a" }, { "amount": 1000, "direction": "debit", "ledger_account_id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b" } ] }'`),
      createCodeResponse: geminiService.processCode(`{ "id": "bd909dea-b985-4dde-94f3-c24b0cf4f8a4", "object": "ledger_transaction", "live_mode": true, "external_id": null, "ledgerable_type": null, "ledgerable_id": null, "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Sally payout advance", "status": "posted", "ledger_entries": [ { "id": "18ba16b5-da58-49f8-acd5-732d4b5f7193", "object": "ledger_entry", "live_mode": true, "amount": 1000, "direction": "debit", "ledger_account_id": "61574fb6-7e8e-403e-980c-ff23e9fbd61b", "ledger_account_currency": "USD", "ledger_account_currency_exponent": 2, "ledger_account_lock_version": 1, "ledger_transaction_id": "bd909dea-b985-4dde-94f3-c24b0cf4f8a4", "discarded_at": null, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" }, { "id": "95aac044-e073-4260-a2a6-2474192959e7", "object": "ledger_entry", "live_mode": true, "amount": 1000, "direction": "credit", "ledger_account_id": "f1c7e474-e6d5-4741-9f76-04510c8b6d7a", "ledger_account_currency": "USD", "ledger_account_currency_exponent": 2, "ledger_account_lock_version": 1, "ledger_transaction_id": "bd909dea-b985-4dde-94f3-c24b0cf4f8a4", "discarded_at": null, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" } ], "posted_at": "2022-06-02T14:20:57Z", "effective_date": "2022-06-08", "effective_at": "2022-06-08T00:00:00.000000Z", "metadata": {}, "created_at": "2022-06-02T14:20:57Z", "updated_at": "2022-06-02T14:20:57Z" }`),
    },
    {
      header: geminiService.processDataRecursive(["Ledgers", "Sellify Ledger", "Accounts", "Buyer Ben"]) as Array<string>,
      headerTitle: geminiService.processString("Buyer Ben"),
      selectedTab: geminiService.processString("details"),
      data: geminiService.processDataRecursive([
        {
          id: "92f7f28c-3b5b-40cd-9c43-af5b0db73045",
          name: "Buyer Ben",
          description: "Tracks amount owed to Ben",
          balance: "$10.00",
          pendingBalance: "$10.00",
          normalBalance: "Debit",
        },
      ]) as Array<Record<string, unknown>>,
      mapping: geminiService.processDataRecursive({
        id: "ID",
        name: "Name",
        description: "Description",
        balance: "Posted Balance",
        pendingBalance: "Pending Balance",
        normalBalance: "Normal Balance",
      }) as Record<string, string>,
      codeHeader: geminiService.processString("CHECKING BALANCES"),
      createCode: geminiService.processCode(`curl --request GET -u ORGANIZATION_ID:API_KEY --url https:/app.moderntreasury.com/api/ledger_accounts/92f7f28c-3b5b-40cd-9c43-af5b0db73045`),
      createCodeResponse: geminiService.processCode(`{ "id": "92f7f28c-3b5b-40cd-9c43-af5b0db73045", "object": "ledger_account", "name": "Buyer Ben", "ledger_id": "89c8bd30-e06a-4a79-b396-e6c7e13e7a12", "description": "Tracks amount owed to Ben", "normal_balance": "credit", "balances": { "pending_balance": { "credits": 1000, "debits": 0, "amount": 1000, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 1000, "debits": 0, "amount": 1000, "currency": "USD", "currency_exponent": 2 } } }`),
    },
  ],
};

export interface PlanContentProps {
  ledgerName: string;
  ledgerAccount1Name: string;
  ledgerAccount2Name: string;
  ledgerAccount1Desc: string;
  ledgerAccount2Desc: string;
  ledgerAccount1Norm: string;
  ledgerAccount2Norm: string;
}

export const SelfServeDetails: Record<LedgerPlan, PlanContentProps> = {
  digital_wallet: geminiService.processDataRecursive({
    ledgerName: "Billfold Ledger",
    ledgerAccount1Name: "John Doe Wallet",
    ledgerAccount2Name: "Jane Doe Wallet",
    ledgerAccount1Desc: "Tracks balance held on behalf of John Doe",
    ledgerAccount2Desc: "Tracks balance held on behalf of Jane Doe",
    ledgerAccount1Norm: "credit",
    ledgerAccount2Norm: "credit",
  }) as PlanContentProps,
  marketplace: geminiService.processDataRecursive({
    ledgerName: "Sellify Ledger",
    ledgerAccount1Name: "Buyer Ben",
    ledgerAccount2Name: "Seller Sally",
    ledgerAccount1Desc: "Tracks amount owed from Ben",
    ledgerAccount2Desc: "Tracks amount owed to Sally",
    ledgerAccount1Norm: "debit",
    ledgerAccount2Norm: "credit",
  }) as PlanContentProps,
};

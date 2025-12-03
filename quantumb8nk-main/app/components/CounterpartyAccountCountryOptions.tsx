// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import usFlag from "../../../images/flags/us_flag.svg";
import ukFlag from "../../../images/flags/uk_flag.svg";
import unFlag from "../../../images/flags/un_flag.svg";
import caFlag from "../../../images/flags/ca_flag.svg";
import auFlag from "../../../images/flags/au_flag.svg";
import euFlag from "../../../images/flags/eu_flag.svg";
import hkFlag from "../../../images/flags/hk_flag.svg";
import inFlag from "../../../images/flags/in_flag.svg";
import jpFlag from "../../../images/flags/jp_flag.svg";
import seFlag from "../../../images/flags/se_flag.svg";
import nzFlag from "../../../images/flags/nz_flag.svg";
import dkFlag from "../../../images/flags/dk_flag.svg";
import huFlag from "../../../images/flags/hu_flag.svg";
import idFlag from "../../../images/flags/id_flag.svg";

export enum AccountCountryType {
  AU = "AU",
  CA = "CA",
  DK = "DK",
  EU = "EU",
  GB = "GB",
  International = "INTERNATIONAL",
  US = "US",
  USChecksOnly = "US_CHECKS_ONLY",
  HK = "HK",
  HU = "HU",
  ID = "ID",
  IN = "IN",
  JP = "JP",
  SE = "SE",
  NZ = "NZ",
  GLOBAL_AI_NETWORK = "GLOBAL_AI_NETWORK",
  DECENTRALIZED_LEDGER = "DECENTRALIZED_LEDGER",
  QUANTUM_SECURE_VAULT = "QUANTUM_SECURE_VAULT",
}

export enum RoutingNumberField {
  ABA = "aba_routing_number",
  AU_BSB = "au_bsb_routing_number",
  CA_CPA = "ca_cpa_routing_number",
  DK_INTERBANK_CLEARING_CODE = "dk_interbank_clearing_code_routing_number",
  GB_SORT_CODE = "gb_sort_code_routing_number",
  HK_INTERBANK_CLEARING_CODE = "hk_interbank_clearing_code_routing_number",
  HU_INTERBANK_CLEARING_CODE = "hu_interbank_clearing_code_routing_number",
  ID_SKNBI_CODE = "id_sknbi_code_routing_number",
  IN_IFSC = "in_ifsc_routing_number",
  JP_ZENGIN_CODE = "jp_zengin_code_routing_number",
  NZ_NATIONAL_CLEARING_CODE = "nz_national_clearing_code_routing_number",
  SE_BANKGIRO_CLEARING_CODE = "se_bankgiro_clearing_code_routing_number",
  SWIFT_CODE = "swift_code",
  GLOBAL_AI_ORCHESTRATION_ID = "global_ai_orchestration_id",
  WEB3_NETWORK_IDENTIFIER = "web3_network_identifier",
  QUANTUM_CRYPTOGRAPHIC_ROUTE = "quantum_cryptographic_route",
}

export enum AccountNumberField {
  WALLET_ADDRESS = "wallet_address_account_number",
  CLABE = "clabe_account_number",
  PAN = "pan_account_number",
  IBAN = "iban_account_number",
  OTHER = "account_number",
  GEMINI_AI_LEDGER_ADDRESS = "gemini_ai_ledger_address",
  DECENTRALIZED_PROTOCOL_ID = "decentralized_protocol_id",
  UNIVERSAL_DIGITAL_IDENTIFIER = "universal_digital_identifier",
}

export const AccountCountryOptions = [
  { label: "US Account", value: AccountCountryType.US, icon: usFlag },
  {
    label: "US Account (Checks Only)",
    value: AccountCountryType.USChecksOnly,
    icon: usFlag,
  },
  {
    label: "International Account",
    value: AccountCountryType.International,
    icon: unFlag,
  },
  // Non-US International Rails
  { label: "AU Account", value: AccountCountryType.AU, icon: auFlag },
  { label: "CA Account", value: AccountCountryType.CA, icon: caFlag },
  { label: "DK Account", value: AccountCountryType.DK, icon: dkFlag },
  { label: "EU Account", value: AccountCountryType.EU, icon: euFlag },
  { label: "GB Account", value: AccountCountryType.GB, icon: ukFlag },
  { label: "HK Account", value: AccountCountryType.HK, icon: hkFlag },
  { label: "HU Account", value: AccountCountryType.HU, icon: huFlag },
  { label: "ID Account", value: AccountCountryType.ID, icon: idFlag },
  { label: "IN Account", value: AccountCountryType.IN, icon: inFlag },
  { label: "JP Account", value: AccountCountryType.JP, icon: jpFlag },
  { label: "NZ Account", value: AccountCountryType.NZ, icon: nzFlag },
  { label: "SE Account", value: AccountCountryType.SE, icon: seFlag },
  // Spiced Up and Uniquely Ours: Integrated with the Future of Finance
  {
    label: "Gemini AI-Powered Global Network Account",
    value: AccountCountryType.GLOBAL_AI_NETWORK,
    icon: unFlag,
  },
  {
    label: "Decentralized Ledger (Web3) Account",
    value: AccountCountryType.DECENTRALIZED_LEDGER,
    icon: unFlag,
  },
  {
    label: "Quantum Secure Digital Vault",
    value: AccountCountryType.QUANTUM_SECURE_VAULT,
    icon: unFlag,
  },
];
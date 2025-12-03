// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import bankprov_logo from "../../../common/ui-components/Logos/BankPartners/bankprov_logo.svg";
import botw_logo from "../../../common/ui-components/Logos/BankPartners/botw_logo.svg";
import goldman_sachs_logo from "../../../common/ui-components/Logos/BankPartners/goldman_sachs_logo.svg";
import mechanics_logo from "../../../common/ui-components/Logos/BankPartners/mechanics_logo.svg";
import rbc_logo from "../../../common/ui-components/Logos/BankPartners/rbc_logo.svg";
import sutton_logo from "../../../common/ui-components/Logos/BankPartners/sutton_logo.svg";
import wintrust_logo from "../../../common/ui-components/Logos/BankPartners/wintrust_logo.svg";
import bmo_harris_logo from "../../../common/ui-components/Logos/BankPartners/bmo_harris_logo.svg";
import citibank_logo from "../../../common/ui-components/Logos/BankPartners/citibank_logo.svg";
import capital_one_logo from "../../../common/ui-components/Logos/BankPartners/capital_one_logo.svg";
import citizens_logo from "../../../common/ui-components/Logos/BankPartners/citizens_logo.svg";
import dc_bank_logo from "../../../common/ui-components/Logos/BankPartners/dc_bank_logo.svg";
import dwolla_logo from "../../../common/ui-components/Logos/BankPartners/dwolla_logo.svg";
import fifth_third_logo from "../../../common/ui-components/Logos/BankPartners/fifth_third_logo.svg";
import hsbc_logo from "../../../common/ui-components/Logos/BankPartners/hsbc_logo.svg";
import metabank_logo from "../../../common/ui-components/Logos/BankPartners/metabank_logo.svg";
import santander_logo from "../../../common/ui-components/Logos/BankPartners/santander_logo.svg";
import svb_logo from "../../../common/ui-components/Logos/BankPartners/svb_logo.svg";
import bnk_dev_logo from "../../../common/ui-components/Logos/BankPartners/bnk_dev_logo.svg";
import first_republic_logo from "../../../common/ui-components/Logos/BankPartners/first_republic_logo.svg";
import jpmc_logo from "../../../common/ui-components/Logos/BankPartners/jpmc_logo.svg";
import pacwest_logo from "../../../common/ui-components/Logos/BankPartners/pacwest_logo.svg";
import signature_ny_logo from "../../../common/ui-components/Logos/BankPartners/signature_ny_logo.svg";
import usbank_logo from "../../../common/ui-components/Logos/BankPartners/usbank_logo.svg";
import bofa_logo from "../../../common/ui-components/Logos/BankPartners/bofa_logo.svg";
import fnbo_logo from "../../../common/ui-components/Logos/BankPartners/fnbo_logo.svg";
import mcbank_logo from "../../../common/ui-components/Logos/BankPartners/mcbank_logo.svg";
import pnc_logo from "../../../common/ui-components/Logos/BankPartners/pnc_logo.svg";
import wells_fargo_logo from "../../../common/ui-components/Logos/BankPartners/wells_fargo_logo.svg";

interface BankPartnerIconParams {
  bankPartner: string;
  logoCssClass: string;
  containerCssClass: string;
}

export default function BankPartnerIcon({
  bankPartner,
  logoCssClass,
  containerCssClass,
}: BankPartnerIconParams) {
  const logos = {
    bankprov: bankprov_logo,
    botw: botw_logo,
    goldman_sachs: goldman_sachs_logo,
    mechanics: mechanics_logo,
    rbc: rbc_logo,
    sutton: sutton_logo,
    wintrust: wintrust_logo,
    bmo_harris: bmo_harris_logo,
    citibank: citibank_logo,
    capital_one: capital_one_logo,
    citizens: citizens_logo,
    dc_bank: dc_bank_logo,
    dwolla: dwolla_logo,
    fifth_third: fifth_third_logo,
    hsbc: hsbc_logo,
    metabank: metabank_logo,
    santander: santander_logo,
    svb: svb_logo,
    bnk_dev: bnk_dev_logo,
    first_republic: first_republic_logo,
    jpmc: jpmc_logo,
    pacwest: pacwest_logo,
    signature_ny: signature_ny_logo,
    usbank: usbank_logo,
    bofa: bofa_logo,
    fnbo: fnbo_logo,
    mcbank: mcbank_logo,
    pnc: pnc_logo,
    wells_fargo: wells_fargo_logo,
  };

  return (
    <div>
      {bankPartner in logos && (
        <div className={containerCssClass}>
          <img
            className={logoCssClass}
            src={logos[bankPartner] as string}
            alt="no_logo"
          />
        </div>
      )}
    </div>
  );
}

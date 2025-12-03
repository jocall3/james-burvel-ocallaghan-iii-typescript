// Copyright J.B. O'Callaghan III
// CEO, Citibank Demo Business Inc.
// Base Operations URL: citibankdemobusiness.dev

import { gql } from "@apollo/client";

export const FIN_ACCT_SCHEMA_COMMON_DEFS = gql`
  scalar Dt
  scalar Jsn

  enum FinAcctTypEnm {
    BNK_REC
    CRD_CARD
    LGR_REC
    PAY_GW
    INV_ACCT
    LOAN_REC
    EXT_ACCT
    MISC
  }

  enum FinAcctStsEnm {
    LIVE
    PAUSED
    REAUTH_REQ
    FAULT
    PEND
    SHUT
    FROZEN
  }

  enum PldLinkStsEnm {
    LINKED
    UNLINKED
    ERR
    RE_AUTH_NEEDED
    LOCKED
    EXPIRED
    OAUTH_IN_PROG
    MFA_PENDING
  }

  enum MtlAcctStsEnm {
    OPENED
    CLOSED
    STORED
    APPROVAL_WAIT
    SUSPENDED
  }

  enum MtlTrxnStsEnm {
    AWAITING_POST
    POSTED
    ARCHIVED
    NULLIFIED
    CANCELED
    REVERSED
    RETURNED
    FAILED
  }

  enum MtlNtryDirEnm {
    CREDIT
    DEBIT
  }

  enum SortDirection {
    ASC
    DESC
  }

  input CcyAmtIn {
    ccy: String!
    amt: Float!
  }

  input MetaIn {
    k: String!
    v: String!
  }

  input AddrIn {
    l1: String
    l2: String
    cty: String
    st: String
    zip: String
    country: String
  }

  input BillInfoIn {
    addr: AddrIn
    eml: String
    n: String
    ph: String
  }

  input PldLinkFltIn {
    sts: PldLinkStsEnm
    inst_i: ID
    usr_i: ID
    min_accts: Int
    has_err: Boolean
    uat_since: Dt
    last_ok_upd_gte: Dt
    last_ok_upd_lte: Dt
    re_auth_req: Boolean
  }

  input StrPaySrcFltIn {
    typ: String
    cust_i: ID
    is_dflt: Boolean
    card_brnd: String
    last4: String
    exp_before: Dt
    country: String
    fund_src: String
  }

  input MtlAcctFltIn {
    ccy: String
    sts: MtlAcctStsEnm
    lgr_i: ID
    n_contains: String
    cat_gte: Dt
    cat_lte: Dt
    acct_typ: String
  }

  input MtlTrxnFltIn {
    sts: MtlTrxnStsEnm
    lgr_acct_i: ID
    ccy: String
    eff_dt_gte: Dt
    eff_dt_lte: Dt
    dsc_contains: String
    ext_pay_i: ID
    min_amt: Float
    max_amt: Float
    recon_sts: String
    originator_i: ID
  }

  input MtlTrxnSortByIn {
    fld: MtlTrxnSortByFld!
    dir: SortDirection!
  }

  enum MtlTrxnSortByFld {
    EFF_DT
    AMT
    CAT
    STS
    UAT
  }

  input FinAcctFltIn {
    typ: FinAcctTypEnm
    sts: FinAcctStsEnm
    ccy: String
    inst_n_contains: String
    owner_i: ID
    min_bal: Float
    max_bal: Float
    is_recon: Boolean
    cat_gte: Dt
    cat_lte: Dt
    last_recon_dt_gte: Dt
    last_recon_dt_lte: Dt
  }

  input FinAcctSortByIn {
    fld: FinAcctSortByFld!
    dir: SortDirection!
  }

  enum FinAcctSortByFld {
    N
    TYP
    BAL
    CAT
    UAT
    INST_N
    LAST_RECON_DT
  }
`;

export const ADDR_PIECE = gql`
  fragment AddrPiece on Addr {
    l1
    l2
    cty
    st
    zip
    country
  }
`;

export const CCY_AMT_PIECE = gql`
  fragment CcyAmtPiece on CcyAmt {
    ccy
    amt
  }
`;

export const TSTMP_PIECE = gql`
  fragment TstmpPiece on Tstmp {
    cat
    uat
  }
`;

export const META_PIECE = gql`
  fragment MetaPiece on Meta {
    k
    v
    src
    last_upd_by
    cat
  }
`;

export const STD_EXEC_RESP_PIECE = gql`
  fragment StdExecRespPiece on StdExecResp {
    ok
    msg
    errs
    cmi
  }
`;

export const PLD_ACCT_BAL_PIECE = gql`
  fragment PldAcctBalPiece on PldAcctBal {
    avail
    curr
    iso_ccy_code
    unoff_ccy_code
    lim
    last_upd_dt
  }
`;

export const PLD_ACCT_NUMS_PIECE = gql`
  fragment PldAcctNumsPiece on PldAcctNums {
    ach {
      acct
      rout
      wire_rout
      bnk_n
    }
    eft {
      acct
      brnch
      inst
    }
    intl {
      iban
      bic
    }
    bacs {
      acct
      sort_code
    }
    sepa {
      iban
      bic
    }
    interac {
      acct
      inst
    }
  }
`;

export const PLD_ACCT_PIECE = gql`
  fragment PldAcctPiece on PldAcct {
    i
    pld_acct_i
    n
    mask
    offcl_n
    sub_typ
    typ
    ccy_code
    avail_bal {
      ...PldAcctBalPiece
    }
    curr_bal {
      ...PldAcctBalPiece
    }
    cat
    uat
    sts
    owner_i
    inst_i
    link_i
    acct_nums {
      ...PldAcctNumsPiece
    }
    linked_at
    last_sync_at
    verif_sts
    trxns_en
    bal_sync_en
    min_pay_amt
    next_pay_due_dt
  }
  ${PLD_ACCT_BAL_PIECE}
  ${PLD_ACCT_NUMS_PIECE}
`;

export const PLD_INST_PIECE = gql`
  fragment PldInstPiece on PldInst {
    i
    pld_inst_i
    n
    prim_color
    url
    logo
    oauth
    rout_nums
    sts
    country_codes
    prods
    cat
    uat
    dsc
    web
    ph
    supports_mfa
    last_refreshed
    supports_auto_refresh
    supports_oauth_link
    hist_err_rate
    curr_err_rate
  }
`;

export const PLD_LINK_PIECE = gql`
  fragment PldLinkPiece on PldLink {
    i
    pld_item_i
    inst_i
    inst {
      ...PldInstPiece
    }
    accts {
      ...PldAcctPiece
    }
    sts
    cat
    uat
    last_ok_upd
    last_fail_upd
    err_typ
    err_code
    err_msg
    wh_sts
    wh_url
    usr_i
    link_health_sts
    re_auth_req_reason
    scopes
    meta {
      ...MetaPiece
    }
    last_sync_try {
      tstmp
      sts
      msg
    }
  }
  ${PLD_INST_PIECE}
  ${PLD_ACCT_PIECE}
  ${META_PIECE}
`;

export const FETCH_PLD_LINK_TKN_OP = gql`
  query FetchPldLinkTkn($itemId: ID, $webhook: String, $userId: ID!) {
    pldLinkTkn(itemId: $itemId, webhook: $webhook, userId: $userId) {
      link_tkn
      exp
      req_i
      link_sess_i
      flow_typ
      meta {
        ...MetaPiece
      }
    }
  }
  ${META_PIECE}
`;

export const FETCH_PLD_LINKS_OP = gql`
  query FetchPldLinks(
    $first: Int = 25,
    $after: String,
    $filter: PldLinkFltIn
  ) {
    pldLinks(first: $first, after: $after, filter: $filter) {
      edges {
        node {
          ...PldLinkPiece
          trxn_summ {
            total_cnt
            last_trxn_dt
            total_amt {
              ...CcyAmtPiece
            }
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        startCursor
        hasPreviousPage
      }
      totalCount
    }
  }
  ${PLD_LINK_PIECE}
  ${CCY_AMT_PIECE}
`;

export const FETCH_PLD_LINK_BY_I_OP = gql`
  query FetchPldLinkByI($i: ID!) {
    pldLink(i: $i) {
      ...PldLinkPiece
      accts {
        i
        n
        pld_acct_i
        curr_bal {
          curr
          iso_ccy_code
        }
        trxn_hist(first: 10, sortBy: { fld: DT, dir: DESC }) {
          i
          dsc
          amt {
            amt
            ccy
          }
          dt
          cat
          typ
          sts
          merch_n
          pay_chan
        }
      }
      evt_log {
        tstmp
        evt_typ
        dsc
        details
        actor_i
      }
    }
  }
  ${PLD_LINK_PIECE}
  ${CCY_AMT_PIECE}
`;

export const FETCH_PLD_BNK_STMT_OP = gql`
  query FetchPldBnkStmt(
    $acct_i: ID!,
    $start_dt: Dt!,
    $end_dt: Dt!
  ) {
    pldBnkStmt(
      acct_i: $acct_i,
      start_dt: $start_dt,
      end_dt: $end_dt
    ) {
      i
      acct_i
      stmt_dt
      dl_url
      summ {
        start_bal {
          ...CcyAmtPiece
        }
        end_bal {
          ...CcyAmtPiece
        }
        total_dep {
          ...CcyAmtPiece
        }
        total_with {
          ...CcyAmtPiece
        }
        trxn_cnt
        acct_n
      }
      trxns {
        i
        dt
        dsc
        amt {
          ...CcyAmtPiece
        }
        typ
      }
      gen_at
    }
  }
  ${CCY_AMT_PIECE}
`;

export const PLD_MAKE_LINK_IN = gql`
  input MakePldLinkIn {
    pub_tkn: String!
    acct_i: [String!]
    meta: [MetaIn!]
    usr_i: ID!
    wh_en: Boolean
    sync_trxns: Boolean
    sync_bals: Boolean
    init_trxn_hist_days: Int
    init_bal_refresh: Boolean
  }
`;

export const MAKE_PLD_LINK_EXEC = gql`
  mutation MakePldLink(
    $in: MakePldLinkIn!
  ) {
    makePldLink(in: $in) {
      pldLink {
        i
        pld_item_i
        sts
        inst {
          n
          pld_inst_i
        }
        accts {
          i
          n
          pld_acct_i
        }
        ...PldLinkPiece
      }
      ...StdExecRespPiece
    }
  }
  ${PLD_LINK_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const PLD_MOD_LINK_IN = gql`
  input ModPldLinkIn {
    i: ID!
    pub_tkn: String
    sts: PldLinkStsEnm
    link_acct_is: [ID!]
    unlink_acct_is: [ID!]
    meta: [MetaIn!]
    wh_url: String
    recon_thresh: Float
    refresh_freq_hrs: Int
    trig_man_refresh: Boolean
  }
`;

export const MOD_PLD_LINK_EXEC = gql`
  mutation ModPldLink(
    $in: ModPldLinkIn!
  ) {
    modPldLink(in: $in) {
      pldLink {
        i
        sts
        last_ok_upd
        err_typ
        ...PldLinkPiece
      }
      ...StdExecRespPiece
    }
  }
  ${PLD_LINK_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const DEL_PLD_LINK_EXEC = gql`
  mutation DelPldLink($i: ID!) {
    delPldLink(i: $i) {
      i
      ...StdExecRespPiece
    }
  }
  ${STD_EXEC_RESP_PIECE}
`;

export const STR_CUST_PIECE = gql`
  fragment StrCustPiece on StrCust {
    i
    str_cust_i
    eml
    n
    ph
    dsc
    ccy
    addr {
      ...AddrPiece
    }
    ship {
      n
      ph
      addr {
        ...AddrPiece
      }
    }
    tax_inf {
      tax_i
      tax_i_typ
    }
    cat
    uat
    pref_locales
    live_mode
    bal {
      ...CcyAmtPiece
    }
    meta {
      ...MetaPiece
    }
  }
  ${ADDR_PIECE}
  ${CCY_AMT_PIECE}
  ${META_PIECE}
`;

export const STR_CARD_CHECKS_PIECE = gql`
  fragment StrCardChecksPiece on StrCardChecks {
    addr_l1_check
    addr_zip_check
    cvc_check
    fprint_check
  }
`;

export const STR_CARD_PIECE = gql`
  fragment StrCardPiece on StrCard {
    i
    str_card_i
    brnd
    last4
    exp_m
    exp_y
    fprint
    country
    fund_src
    cust_i
    cust {
      i
      str_cust_i
      n
      eml
    }
    bill_info {
      addr {
        ...AddrPiece
      }
      eml
      n
      ph
    }
    meta {
      ...MetaPiece
    }
    is_dflt
    is_reusable
    cat
    uat
    checks {
      ...StrCardChecksPiece
    }
    three_d_sec_usage {
      supported
    }
    wallet_typ
    issuer
    dyn_last4
    tkn
  }
  ${ADDR_PIECE}
  ${STR_CARD_CHECKS_PIECE}
  ${META_PIECE}
`;

export const STR_BNK_ACCT_PIECE = gql`
  fragment StrBnkAcctPiece on StrBnkAcct {
    i
    str_bnk_acct_i
    acct_hldr_n
    acct_hldr_typ
    bnk_n
    country
    ccy
    fprint
    last4
    rout_num
    sts
    cust_i
    cust {
      i
      str_cust_i
      n
      eml
    }
    meta {
      ...MetaPiece
    }
    is_dflt
    cat
    uat
    verif_sts
    verif_method
    payout_en
    payout_sched {
      int
      delay_days
      monthly_anchor
      weekly_anchor
    }
  }
  ${META_PIECE}
`;

export const STR_PAY_SRC_NEXT_ACT_PIECE = gql`
  fragment StrPaySrcNextActPiece on StrPaySrcNextAct {
    typ
    redir_url {
      url
      ret_url
    }
    use_str_sdk
    alipay_redir {
      native_url
      qr_code_url
    }
    wechat_redir {
      qr_data
      qr_code_url
      wechat_pay_url
    }
  }
`;

export const STR_PAY_SRC_PIECE = gql`
  fragment StrPaySrcPiece on StrPaySrc {
    i
    str_pay_src_i
    typ
    cust_i
    cust {
      i
      str_cust_i
      n
      eml
    }
    bill_info {
      addr {
        ...AddrPiece
      }
      eml
      n
      ph
    }
    card {
      ...StrCardPiece
    }
    bnk_acct {
      ...StrBnkAcctPiece
    }
    meta {
      ...MetaPiece
    }
    cat
    uat
    live_mode
    usage
    allow_redisplay
    req_action
    next_act {
      ...StrPaySrcNextActPiece
    }
    card_present
    eph
    wallet {
      typ
      apple_pay {
        card {
          brnd
          fund_src
          last4
        }
      }
    }
  }
  ${STR_CUST_PIECE}
  ${STR_CARD_PIECE}
  ${STR_BNK_ACCT_PIECE}
  ${ADDR_PIECE}
  ${META_PIECE}
  ${STR_PAY_SRC_NEXT_ACT_PIECE}
`;

export const FETCH_STR_PAY_SRCS_OP = gql`
  query FetchStrPaySrcs(
    $cust_i: ID!
    $first: Int = 25
    $after: String
    $filter: StrPaySrcFltIn
  ) {
    strPaySrcs(
      cust_i: $cust_i,
      first: $first,
      after: $after,
      filter: $filter
    ) {
      edges {
        node {
          ...StrPaySrcPiece
          typ
          card {
            brnd
            last4
            exp_m
            exp_y
          }
          bnk_acct {
            bnk_n
            last4
            acct_hldr_typ
          }
          is_dflt
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        startCursor
        hasPreviousPage
      }
      totalCount
    }
  }
  ${STR_PAY_SRC_PIECE}
`;

export const FETCH_STR_PAY_SRC_BY_I_OP = gql`
  query FetchStrPaySrcByI($i: ID!) {
    strPaySrc(i: $i) {
      ...StrPaySrcPiece
      recent_usage_evts(first: 5, sortBy: { fld: CAT, dir: DESC }) {
        i
        typ
        amt {
          ...CcyAmtPiece
        }
        sts
        cat
        dsc
        str_evt_i
        str_chg_i
      }
    }
  }
  ${STR_PAY_SRC_PIECE}
  ${CCY_AMT_PIECE}
`;

export const MAKE_STR_PAY_SRC_IN = gql`
  input MakeStrPaySrcIn {
    cust_i: ID!
    str_pay_src_i: String!
    meta: [MetaIn!]
    set_dflt: Boolean
    bill_info: BillInfoIn
    setup_intent_i: ID
  }
`;

export const MAKE_STR_PAY_SRC_EXEC = gql`
  mutation MakeStrPaySrc(
    $in: MakeStrPaySrcIn!
  ) {
    makeStrPaySrc(in: $in) {
      strPaySrc {
        i
        str_pay_src_i
        typ
        ...StrPaySrcPiece
      }
      ...StdExecRespPiece
    }
  }
  ${STR_PAY_SRC_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const MOD_STR_PAY_SRC_IN = gql`
  input ModStrPaySrcIn {
    i: ID!
    bill_info: BillInfoIn
    meta: [MetaIn!]
    set_dflt: Boolean
    exp_m: Int
    exp_y: Int
    str_tkn: String
  }
`;

export const MOD_STR_PAY_SRC_EXEC = gql`
  mutation ModStrPaySrc(
    $in: ModStrPaySrcIn!
  ) {
    modStrPaySrc(in: $in) {
      strPaySrc {
        i
        ...StrPaySrcPiece
      }
      ...StdExecRespPiece
    }
  }
  ${STR_PAY_SRC_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const DEL_STR_PAY_SRC_EXEC = gql`
  mutation DelStrPaySrc($i: ID!) {
    delStrPaySrc(i: $i) {
      i
      ...StdExecRespPiece
    }
  }
  ${STD_EXEC_RESP_PIECE}
`;

export const MTL_LGR_ACCT_BAL_PIECE = gql`
  fragment MtlLgrAcctBalPiece on MtlLgrAcctBal {
    i
    as_of_dt
    avail_bal {
      ccy
      amt
    }
    pend_bal {
      ccy
      amt
    }
    posted_bal {
      ccy
      amt
    }
    proj_bal {
      ccy
      amt
    }
    actual_bal {
      ccy
      amt
    }
    daily_spend_lim {
      ccy
      amt
    }
    last_upd: Dt
  }
`;

export const MTL_LGR_PIECE = gql`
  fragment MtlLgrPiece on MtlLgr {
    i
    mtl_i
    n
    dsc
    ccy
    live_mode
    cat
    uat
    flow
    meta {
      ...MetaPiece
    }
  }
  ${META_PIECE}
`;

export const MTL_LGR_ACCT_PIECE = gql`
  fragment MtlLgrAcctPiece on MtlLgrAcct {
    i
    mtl_i
    n
    dsc
    ccy
    lgr_i
    lgr {
      i
      n
      ccy
    }
    sts
    cat
    uat
    bals {
      ...MtlLgrAcctBalPiece
    }
    int_acct_i
    acct_typ
    parent_acct_i
    child_acct_is
    meta {
      ...MetaPiece
    }
    created_by
    last_mod_by
    freezes_trxns
    trxn_post_en
    recon_strat
  }
  ${MTL_LGR_ACCT_BAL_PIECE}
  ${META_PIECE}
`;

export const MTL_LGR_NTRY_PIECE = gql`
  fragment MtlLgrNtryPiece on MtlLgrNtry {
    i
    mtl_i
    dir
    amt {
      ...CcyAmtPiece
    }
    lgr_acct_i
    lgr_acct {
      i
      n
      ccy
    }
    avail_bal_snap {
      ccy
      amt
    }
    posted_bal_snap {
      ccy
      amt
    }
    trxn_i
    cat
    uat
    posted_at
    pend_at
    discard_at
    meta {
      ...MetaPiece
    }
    sts
    live_mode
  }
  ${CCY_AMT_PIECE}
  ${META_PIECE}
`;

export const MTL_LGR_TRXN_PIECE = gql`
  fragment MtlLgrTrxnPiece on MtlLgrTrxn {
    i
    mtl_i
    dsc
    sts
    amt {
      ...CcyAmtPiece
    }
    eff_dt
    posted_at
    reversed_at
    lgr_ntries {
      ...MtlLgrNtryPiece
    }
    ext_pay_i
    meta {
      ...MetaPiece
    }
    cat
    uat
    originator_i
    recon_sts
    recon_i
    trxn_typ
    vendor_n
    ref_num
    inv_i
    memo
    live_mode
    rel_trxn_is
    audit_trail {
      tstmp
      action
      actor_i
      details
    }
  }
  ${CCY_AMT_PIECE}
  ${META_PIECE}
  ${MTL_LGR_NTRY_PIECE}
`;

export const FETCH_MTL_LGR_ACCTS_OP = gql`
  query FetchMtlLgrAccts(
    $first: Int = 25
    $after: String
    $filter: MtlAcctFltIn
    $sortBy: MtlAcctSortByIn
  ) {
    mtlLgrAccts(
      first: $first,
      after: $after,
      filter: $filter,
      sortBy: $sortBy
    ) {
      edges {
        node {
          ...MtlLgrAcctPiece
          bals {
            posted_bal {
              ccy
              amt
            }
            avail_bal {
              ccy
              amt
            }
            as_of_dt
          }
          latest_trxns(first: 5) {
            i
            dsc
            amt {
              ccy
              amt
            }
            eff_dt
            sts
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        startCursor
        hasPreviousPage
      }
      totalCount
    }
  }
  ${MTL_LGR_ACCT_PIECE}
  ${CCY_AMT_PIECE}
`;

export const FETCH_MTL_LGR_ACCT_BY_I_OP = gql`
  query FetchMtlLgrAcctByI($i: ID!) {
    mtlLgrAcct(i: $i) {
      ...MtlLgrAcctPiece
      trxns(first: 50, sortBy: { fld: EFF_DT, dir: DESC }) {
        edges {
          node {
            ...MtlLgrTrxnPiece
          }
          cursor
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      bal_breakdown {
        typ
        amt {
          ...CcyAmtPiece
        }
        cnt
      }
      sched_trxns(first: 10) {
        i
        dsc
        amt {
          ...CcyAmtPiece
        }
        sched_dt
        sts
      }
    }
  }
  ${MTL_LGR_ACCT_PIECE}
  ${MTL_LGR_TRXN_PIECE}
  ${CCY_AMT_PIECE}
`;

export const FETCH_MTL_LGR_TRXNS_OP = gql`
  query FetchMtlLgrTrxns(
    $first: Int = 25
    $after: String
    $filter: MtlTrxnFltIn
    $sortBy: MtlTrxnSortByIn
  ) {
    mtlLgrTrxns(
      first: $first,
      after: $after,
      filter: $filter,
      sortBy: $sortBy
    ) {
      edges {
        node {
          ...MtlLgrTrxnPiece
          rel_transfers {
            i
            typ
            amt {
              ...CcyAmtPiece
            }
            sts
            eff_dt
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        startCursor
        hasPreviousPage
      }
      totalCount
    }
  }
  ${MTL_LGR_TRXN_PIECE}
  ${CCY_AMT_PIECE}
`;

export const FETCH_MTL_LGR_TRXN_BY_I_OP = gql`
  query FetchMtlLgrTrxnByI($i: ID!) {
    mtlLgrTrxn(i: $i) {
      ...MtlLgrTrxnPiece
      lgr_ntries {
        i
        dir
        amt {
          ...CcyAmtPiece
        }
        lgr_acct {
          i
          n
          ccy
          bals {
            posted_bal {
              amt
              ccy
            }
            as_of_dt
          }
        }
        posted_at
        pend_at
        discard_at
        meta {
          k
          v
        }
      }
      ext_refs {
        typ
        i
        dsc
        url
      }
      audit_trail {
        tstmp
        action
        actor_i
        details
      }
      src
      recon_details {
        i
        sts
        match_dt
        matched_ntries {
          i
          dsc
        }
      }
    }
  }
  ${MTL_LGR_TRXN_PIECE}
  ${CCY_AMT_PIECE}
`;

export const MAKE_MTL_LGR_ACCT_IN = gql`
  input MakeMtlLgrAcctIn {
    n: String!
    dsc: String
    ccy: String!
    lgr_i: ID!
    parent_acct_i: ID
    meta: [MetaIn!]
    init_bal: CcyAmtIn
    acct_typ: String!
    creator_i: ID
    trxn_post_en: Boolean
    freezes_trxns: Boolean
    open_bal_dt: Dt
  }
`;

export const MAKE_MTL_LGR_ACCT_EXEC = gql`
  mutation MakeMtlLgrAcct(
    $in: MakeMtlLgrAcctIn!
  ) {
    makeMtlLgrAcct(in: $in) {
      mtlLgrAcct {
        i
        n
        ccy
        sts
        ...MtlLgrAcctPiece
      }
      ...StdExecRespPiece
    }
  }
  ${MTL_LGR_ACCT_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const MOD_MTL_LGR_ACCT_IN = gql`
  input ModMtlLgrAcctIn {
    i: ID!
    n: String
    dsc: String
    sts: MtlAcctStsEnm
    meta: [MetaIn!]
    parent_acct_i: ID
    trxn_post_en: Boolean
    freezes_trxns: Boolean
  }
`;

export const MOD_MTL_LGR_ACCT_EXEC = gql`
  mutation ModMtlLgrAcct(
    $in: ModMtlLgrAcctIn!
  ) {
    modMtlLgrAcct(in: $in) {
      mtlLgrAcct {
        i
        n
        sts
        ...MtlLgrAcctPiece
      }
      ...StdExecRespPiece
    }
  }
  ${MTL_LGR_ACCT_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const MTL_LGR_NTRY_IN = gql`
  input MtlLgrNtryIn {
    lgr_acct_i: ID!
    dir: MtlNtryDirEnm!
    amt: CcyAmtIn!
    meta: [MetaIn!]
    dsc: String
    lock_lgr_acct_bal: Boolean
  }
`;

export const MAKE_MTL_LGR_TRXN_IN = gql`
  input MakeMtlLgrTrxnIn {
    lgr_i: ID!
    dsc: String!
    eff_dt: Dt!
    lgr_ntries: [MtlLgrNtryIn!]!
    ext_pay_i: ID
    meta: [MetaIn!]
    sts: MtlTrxnStsEnm
    originator_i: ID
    rel_trxn_i: ID
    idemp_k: String
    posted_at: Dt
  }
`;

export const MAKE_MTL_LGR_TRXN_EXEC = gql`
  mutation MakeMtlLgrTrxn(
    $in: MakeMtlLgrTrxnIn!
  ) {
    makeMtlLgrTrxn(in: $in) {
      mtlLgrTrxn {
        i
        dsc
        sts
        eff_dt
        ...MtlLgrTrxnPiece
      }
      ...StdExecRespPiece
    }
  }
  ${MTL_LGR_TRXN_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const MOD_MTL_LGR_TRXN_IN = gql`
  input ModMtlLgrTrxnIn {
    dsc: String
    sts: MtlTrxnStsEnm
    meta: [MetaIn!]
    eff_dt: Dt
    ext_pay_i: ID
    inv_i: ID
    memo: String
  }
`;

export const MOD_MTL_LGR_TRXN_EXEC = gql`
  mutation ModMtlLgrTrxn(
    $i: ID!
    $in: ModMtlLgrTrxnIn!
  ) {
    modMtlLgrTrxn(i: $i, in: $in) {
      mtlLgrTrxn {
        i
        sts
        ...MtlLgrTrxnPiece
      }
      ...StdExecRespPiece
    }
  }
  ${MTL_LGR_TRXN_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const APPROVE_MTL_LGR_TRXN_EXEC = gql`
  mutation ApproveMtlLgrTrxn($i: ID!) {
    approveMtlLgrTrxn(i: $i) {
      mtlLgrTrxn {
        i
        sts
        posted_at
        ...MtlLgrTrxnPiece
      }
      ...StdExecRespPiece
    }
  }
  ${MTL_LGR_TRXN_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const REV_MTL_LGR_TRXN_IN = gql`
  input RevMtlLgrTrxnIn {
    reason: String!
    eff_dt: Dt
    meta: [MetaIn!]
    idemp_k: String
  }
`;

export const REV_MTL_LGR_TRXN_EXEC = gql`
  mutation RevMtlLgrTrxn(
    $i: ID!
    $in: RevMtlLgrTrxnIn!
  ) {
    revMtlLgrTrxn(i: $i, in: $in) {
      rev_trxn {
        ...MtlLgrTrxnPiece
      }
      orig_trxn {
        ...MtlLgrTrxnPiece
      }
      ...StdExecRespPiece
    }
  }
  ${MTL_LGR_TRXN_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const FIN_ACCT_PIECE = gql`
  fragment FinAcctPiece on FinAcct {
    i
    n
    typ
    sts
    ccy
    inst_n
    curr_bal {
      ...CcyAmtPiece
    }
    avail_bal {
      ...CcyAmtPiece
    }
    pld_acct_i
    pld_acct {
      i
      n
      pld_acct_i
      inst {
        n
        logo
      }
      typ
      sub_typ
    }
    str_pay_src_i
    str_pay_src {
      i
      str_pay_src_i
      typ
      card {
        brnd
        last4
      }
      bnk_acct {
        bnk_n
        last4
      }
    }
    mtl_lgr_acct_i
    mtl_lgr_acct {
      i
      n
      mtl_i
      ccy
      lgr {
        n
      }
    }
    owner_i
    perms
    cat
    uat
    is_recon
    last_recon_dt
    avg_daily_bal {
      ...CcyAmtPiece
    }
    monthly_spend_trend {
      month
      amt {
        ...CcyAmtPiece
      }
    }
    meta {
      ...MetaPiece
    }
    open_dt
    close_dt
    tags
    cat
  }
  ${CCY_AMT_PIECE}
  ${META_PIECE}
`;

export const FETCH_FIN_ACCTS_OP = gql`
  query FetchFinAccts(
    $first: Int = 25
    $after: String
    $filter: FinAcctFltIn
    $sortBy: FinAcctSortByIn
  ) {
    finAccts(
      first: $first,
      after: $after,
      filter: $filter,
      sortBy: $sortBy
    ) {
      edges {
        node {
          ...FinAcctPiece
          latest_trxn_dt
          pld_acct {
            mask
            sub_typ
          }
          str_pay_src {
            card {
              brnd
              last4
            }
            bnk_acct {
              bnk_n
              last4
            }
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        startCursor
        hasPreviousPage
      }
      totalCount
    }
  }
  ${FIN_ACCT_PIECE}
`;

export const FETCH_FIN_ACCT_BY_I_OP = gql`
  query FetchFinAcctByI($i: ID!) {
    finAcct(i: $i) {
      ...FinAcctPiece
      recent_trxns(first: 10, sortBy: { fld: DT, dir: DESC }) {
        i
        dsc
        amt {
          ...CcyAmtPiece
        }
        dt
        typ
        src_typ
        sts
        pld_trxn_i
        str_trxn_i
        mtl_trxn_i
        merch_n
        cat
      }
      bnk_stmts(start_dt: "2024-01-01", end_dt: "2024-01-31") {
        i
        stmt_dt
        start_bal {
          ...CcyAmtPiece
        }
        end_bal {
          ...CcyAmtPiece
        }
        trxn_cnt
        dl_url
        dep_summ {
          cnt
          total_amt { ...CcyAmtPiece }
        }
        with_summ {
          cnt
          total_amt { ...CcyAmtPiece }
        }
      }
      rel_fin_insts {
        i
        n
        typ
        bal {
          ...CcyAmtPiece
        }
        sts
        due_dt
        pay_amt { ...CcyAmtPiece }
      }
      trxn_cats {
        n
        total_amt { ...CcyAmtPiece }
        trxn_cnt
      }
    }
  }
  ${FIN_ACCT_PIECE}
  ${CCY_AMT_PIECE}
`;

export const BIND_FIN_ACCT_IN = gql`
  input BindFinAcctIn {
    n: String
    pld_acct_i: ID
    str_pay_src_i: ID
    mtl_lgr_acct_i: ID
    meta: [MetaIn!]
    ccy: String
    usr_i: ID!
    init_sts: FinAcctStsEnm
    tags: [String!]
    cat: String
  }
`;

export const BIND_FIN_ACCT_EXEC = gql`
  mutation BindFinAcct($in: BindFinAcctIn!) {
    bindFinAcct(in: $in) {
      finAcct {
        i
        n
        typ
        ...FinAcctPiece
      }
      ...StdExecRespPiece
    }
  }
  ${FIN_ACCT_PIECE}
  ${STD_EXEC_RESP_PIECE}
`;

export const UNBIND_FIN_ACCT_EXEC = gql`
  mutation UnbindFinAcct($i
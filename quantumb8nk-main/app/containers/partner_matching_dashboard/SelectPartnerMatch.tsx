// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import {
  PartnerMatchFragment,
  useAdminUpsertPartnerSearchMutation,
  OnboardingPartnerMatch__StatusEnum,
  useOnboardingPartnersQuery,
} from "../../../generated/dashboard/graphqlSchema";
import {
  Button,
  IndexTable,
  Radio,
  ConfirmModal,
} from "../../../common/ui-components";
import RadioContainer from "../../../common/ui-components/RadioContainer/RadioContainer";

const MAPPING = {
  label: "Bank Partner",
  actions: "Create Match",
};

interface SelectPartnerMatchProps {
  partnerSearchId: string;
  partnerMatches?: PartnerMatchFragment[] | null;
}

export default function SelectPartnerMatch({
  partnerSearchId,
  partnerMatches,
}: SelectPartnerMatchProps) {
  const [adminUpsertPartnerSearch, { loading: mutationLoading }] =
    useAdminUpsertPartnerSearchMutation();
  const { data } = useOnboardingPartnersQuery();
  const [partnerStatuses, setPartnerStatuses] = useState<
    {
      partnerId: string;
      status: string;
      name: string;
      changed: boolean;
    }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function getPartnerMatchStatus(partnerId: string): string {
      const match = partnerMatches
        ? partnerMatches.find((obj) => obj.partner?.id === partnerId)
        : undefined;
      return match?.status || "initial_status";
    }
    const newPartnerStatuses = data?.onboardingPartners.edges.map((edge) => ({
      partnerId: edge.node.id,
      name: edge.node.name,
      status: getPartnerMatchStatus(edge.node.id),
      changed: false,
    }));
    setPartnerStatuses(
      newPartnerStatuses !== undefined ? newPartnerStatuses : [],
    );
  }, [data, partnerMatches]);

  function handlePartnerStatusChange(
    id: string,
    status: OnboardingPartnerMatch__StatusEnum,
  ) {
    const newPartnerStatuses = partnerStatuses?.map((partnerStatus) => {
      if (id === partnerStatus.partnerId) {
        return {
          ...partnerStatus,
          ...{ status, changed: !partnerStatus.changed },
        };
      }
      return partnerStatus;
    });

    setPartnerStatuses(newPartnerStatuses);
  }

  const options = partnerStatuses?.map((partnerStatus) => ({
    label: partnerStatus.name,
    actions: (
      <div className="flex space-x-4">
        <RadioContainer layout="horizontal" bordered={false}>
          <Radio
            value="No"
            selected={
              partnerStatus.status ===
              OnboardingPartnerMatch__StatusEnum.BankPartnershipsRejected
            }
            onChange={() =>
              handlePartnerStatusChange(
                partnerStatus.partnerId,
                OnboardingPartnerMatch__StatusEnum.BankPartnershipsRejected,
              )
            }
          >
            No
          </Radio>
          <Radio
            value="Yes"
            selected={
              partnerStatus.status ===
              OnboardingPartnerMatch__StatusEnum.AwaitingBankPartnershipsResponse
            }
            onChange={() =>
              handlePartnerStatusChange(
                partnerStatus.partnerId,
                OnboardingPartnerMatch__StatusEnum.AwaitingBankPartnershipsResponse,
              )
            }
          >
            Yes
          </Radio>
        </RadioContainer>
      </div>
    ),
  }));

  const selectPartnerMatchSubmitButtonDisabled =
    mutationLoading ||
    partnerStatuses?.some(
      (partnerStatus) => partnerStatus.status?.includes("initial"),
    ) ||
    !partnerStatuses?.some((partnerStatus) => partnerStatus.changed);

  const submitHandler = () => {
    const partnerMatchData = partnerStatuses?.map((partnerStatus) => ({
      partnerId: partnerStatus.partnerId,
      status: partnerStatus.status as OnboardingPartnerMatch__StatusEnum,
      partnerSearchId,
    }));

    void adminUpsertPartnerSearch({
      variables: {
        input: {
          input: {
            id: partnerSearchId,
            partnerMatches: partnerMatchData,
          },
        },
      },
    });
  };

  return (
    <>
      <div className="mb-8 basis-1/3 rounded border">
        <div className="m-5">
          <p className="text-m mb-6 font-medium">Create a Match</p>
          <p className="mb-4 text-xs font-normal text-gray-500">
            Start by viewing and adding banks that you think would be an ideal
            match for this customer.
          </p>
          <Button
            className="mx-auto mt-4 outline-none"
            buttonType="secondary"
            buttonHeight="medium"
            fullWidth
            onClick={() => setIsOpen(true)}
          >
            View bank partners
          </Button>
        </div>
      </div>
      <Formik initialValues={{}} onSubmit={submitHandler}>
        {(formik) => (
          <ConfirmModal
            title="Bank Partners"
            isOpen={isOpen}
            setIsOpen={() => setIsOpen(false)}
            onConfirm={() => {
              formik.handleSubmit();
              setIsOpen(false);
            }}
            confirmDisabled={selectPartnerMatchSubmitButtonDisabled}
            confirmText="Create Matches"
            bodyClassName="p-0"
            className="absolute h-[590px] overflow-auto"
          >
            <Form>
              <div className="mb-4">
                <p className="text-m mb-4 font-medium">
                  Create a Bank Partner Match
                </p>
                <p className="text-s mb-4 font-normal text-gray-500">
                  Select a bank partner from our growing list of banks below.
                  <br />
                  You’ll need to select &#8220;Yes&#8221; or &#8220;No&#8221;
                  for each bank listed.
                </p>
              </div>
              <IndexTable data={options} dataMapping={MAPPING} />
            </Form>
          </ConfirmModal>
        )}
      </Formik>
    </>
  );
}

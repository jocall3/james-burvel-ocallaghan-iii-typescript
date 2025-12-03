// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { Dispatch, SetStateAction } from "react";
import { ALL_ACCOUNTS_ID } from "../../constants";
import { useDispatchContext } from "../../MessageProvider";
import { useCreatePennyTestsMutation } from "../../../generated/dashboard/graphqlSchema";
import {
  Button,
  Heading,
  Icon,
  Modal,
  ModalActions,
  ModalContainer,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalHeading,
  ModalTitle,
} from "../../../common/ui-components";
import CreatePennyTestsForm from "./CreatePennyTestsForm";

interface CreatePennyTestsModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CreatePennyTestsModal({
  isOpen,
  setIsOpen,
}: CreatePennyTestsModalProps) {
  const { dispatchSuccess, dispatchError } = useDispatchContext();
  const [createPennyTestMutation] = useCreatePennyTestsMutation();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePennyTestsCreate = async ({
    internalAccountId,
    receivingAccount,
    configIds,
  }: {
    receivingAccount: string;
    internalAccountId: string;
    configIds: string[];
  }) => {
    if (internalAccountId === ALL_ACCOUNTS_ID) {
      return;
    }

    const response = await createPennyTestMutation({
      variables: {
        input: {
          internalAccountId,
          configIds,
          receivingAccount,
        },
      },
    });

    const errors = response.data?.createPennyTests?.errors;

    if (errors && errors.length > 0) {
      dispatchError(errors.toString());

      handleClose();
    } else {
      const pennyTestCount =
        response.data?.createPennyTests?.pennyTests?.length;
      if (pennyTestCount) {
        window.location.reload();
        dispatchSuccess(`Successfully created ${pennyTestCount} penny tests.`);
      }

      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Create Penny Tests"
      onRequestClose={handleClose}
    >
      <ModalContainer>
        <ModalHeader className="border-none">
          <ModalHeading>
            <ModalTitle>
              <Heading level="h3" size="l">
                Select an Account
              </Heading>
            </ModalTitle>
            <ModalDescription>
              You can currently only penny test accounts at JP Morgan Chase.
              <br />
              Only penny tests that the account is capable of will be displayed.
            </ModalDescription>
          </ModalHeading>
          <ModalActions>
            <Button onClick={handleClose} buttonType="text">
              <Icon
                iconName="clear"
                color="currentColor"
                className="text-gray-400"
              />
            </Button>
          </ModalActions>
        </ModalHeader>
        <ModalContent>
          <CreatePennyTestsForm onSubmit={handlePennyTestsCreate} />
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
}

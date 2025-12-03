// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AnyAction } from "redux";

import {
  updateBillingContacts,
  UpdateBillingContactDispatchFn,
} from "../../actions/billing";
import BillingContactSelect from "../../components/BillingContactSelect";
import {
  ActionItem,
  Button,
  Icon,
  LoadingLine,
  PopoverPanel,
  PopoverTrigger,
  Popover,
  Heading,
} from "../../../common/ui-components";
import {
  BillingUser,
  Organization__CreationSourceEnum,
  User,
} from "../../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../../MessageProvider";

type BillingContactsProps = {
  loading: boolean;
  billingContacts: BillingUser[];
  organizationCreationSource:
    | Organization__CreationSourceEnum
    | null
    | undefined;
  users: Pick<User, "name" | "email">[];
};

function BillingContactAction({
  onAddBillingContact,
  setShowBillingContactSelect,
  showBillingContactSelect,
  updatingContacts,
  users,
  billingContacts,
}: {
  onAddBillingContact: (email: string) => void;
  setShowBillingContactSelect: (show: boolean) => void;
  showBillingContactSelect: boolean;
  updatingContacts: boolean;
  users: Pick<User, "name" | "email">[];
  billingContacts: BillingUser[];
}) {
  if (showBillingContactSelect) {
    return (
      <BillingContactSelect
        billingContacts={billingContacts}
        onChange={onAddBillingContact}
        users={users}
      />
    );
  }

  return (
    <Button
      disabled={updatingContacts}
      onClick={() => setShowBillingContactSelect(true)}
    >
      <div className="flex items-center gap-1">
        <Icon iconName="add" size="s" color="currentColor" />
        Add Contact
      </div>
    </Button>
  );
}

interface BillingContactListProps {
  billingContacts: Array<BillingUser>;
  handleRemoveBillingContact: (email: string) => void;
}

function BillingContactList({
  billingContacts,
  handleRemoveBillingContact,
}: BillingContactListProps) {
  if (billingContacts.length === 0) {
    return (
      <div className="mt-4 text-gray-600">
        There are no billing contacts, add a user or email using the button
        above.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {billingContacts.map((contact) => (
        <div
          key={contact.email}
          className="group grid h-9 grid-cols-4 items-center py-1 hover:bg-gray-50"
        >
          {contact.name && contact.path ? (
            <a
              className="overflow-hidden overflow-ellipsis"
              href={contact.path}
            >
              {contact.name}
            </a>
          ) : (
            <span>-</span>
          )}
          <span className="col-span-2 overflow-hidden overflow-ellipsis">
            {contact.email}
          </span>
          <div className="flex justify-end pr-2 transition-all duration-75 ease-in-out mint-md:opacity-0 mint-md:group-hover:opacity-100">
            <Popover>
              <PopoverTrigger buttonHeight="small">
                <Icon iconName="more_horizontal" />
              </PopoverTrigger>
              <PopoverPanel
                anchorOrigin={{
                  horizontal: "right",
                }}
              >
                <ActionItem
                  type="danger"
                  onClick={() => handleRemoveBillingContact(contact.email)}
                >
                  Remove Contact...
                </ActionItem>
              </PopoverPanel>
            </Popover>
          </div>
        </div>
      ))}
      {/* "padding" to allow the action dropdown to be shown for the last item in the list */}
      <div className="h-10" />
    </div>
  );
}

/**
 * Self serve organizations must have at least one MT user
 * that is a billing contact
 */
const cannotRemoveBillingContact = (
  billingContacts: Array<BillingUser>,
  billingContactEmail: string,
  organizationCreationSource:
    | Organization__CreationSourceEnum
    | null
    | undefined,
) => {
  // Find the billing users from the contacts, MT users have names associated with them
  const billingUsers = billingContacts.filter(({ name }) => !!name);
  return (
    billingUsers.length === 1 &&
    billingUsers[0].email === billingContactEmail &&
    organizationCreationSource === "self_serve"
  );
};

function BillingContacts({
  loading,
  billingContacts,
  organizationCreationSource,
  users,
}: BillingContactsProps) {
  const dispatch: (
    fn: UpdateBillingContactDispatchFn | AnyAction,
  ) => Promise<void> = useDispatch();
  const [showBillingContactSelect, setShowBillingContactSelect] =
    useState(false);
  const [updatingContacts, setUpdatingContacts] = useState(false);
  const { dispatchError } = useDispatchContext();

  const onAddBillingContact = (newBillingContactEmail: string) => {
    setUpdatingContacts(true);
    setShowBillingContactSelect(false);
    dispatch(
      updateBillingContacts(
        [...billingContacts.map(({ email }) => email), newBillingContactEmail],
        dispatchError,
      ),
    ).finally(() => setUpdatingContacts(false));
  };

  const handleRemoveBillingContact = async (billingContactEmail: string) => {
    if (
      cannotRemoveBillingContact(
        billingContacts,
        billingContactEmail,
        organizationCreationSource,
      )
    ) {
      dispatchError(
        "You must have at least one billing contact that is also a user.",
      );
      return;
    }

    setUpdatingContacts(true);
    await dispatch(
      updateBillingContacts(
        billingContacts
          .map(({ email }) => email)
          .filter((email) => email !== billingContactEmail),
        dispatchError,
      ),
    ).finally(() => setUpdatingContacts(false));
  };

  const loadingLines =
    billingContacts.length !== 0 ? billingContacts.length : 2;

  return (
    <div>
      <div className="mb-4 flex flex-row justify-between gap-6 border-b border-gray-100 pb-2">
        <Heading level="h2" size="l">
          Contacts
        </Heading>
        {!loading && (
          <BillingContactAction
            users={users}
            billingContacts={billingContacts}
            showBillingContactSelect={showBillingContactSelect}
            setShowBillingContactSelect={setShowBillingContactSelect}
            onAddBillingContact={onAddBillingContact}
            updatingContacts={updatingContacts}
          />
        )}
      </div>
      <span className="text-xs text-gray-500">
        Billing-related emails will be sent to the following parties
      </span>
      <div className="mt-6 text-xs">
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-4 pb-2 font-medium text-gray-700">
            <div>User</div>
            <div className="col-span-2">Email</div>
            <div />
          </div>
          <div className="grid-rows grid max-h-60 overflow-y-auto">
            {loading || updatingContacts ? (
              Array.from({ length: loadingLines }).map((_, index) => (
                <div
                  className="grid h-9 grid-cols-4 items-center py-1"
                  key={`loadingLine-${index.toString()}`}
                >
                  <div className="w-20">
                    <LoadingLine />
                  </div>
                  <div className="w-30 col-span-2">
                    <LoadingLine />
                  </div>
                </div>
              ))
            ) : (
              <BillingContactList
                billingContacts={billingContacts}
                handleRemoveBillingContact={(email) => {
                  handleRemoveBillingContact(email).catch(() => {});
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingContacts;

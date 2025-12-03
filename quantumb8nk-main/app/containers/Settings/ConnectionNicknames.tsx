// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
import { Table } from "antd";
import { InlineTextEditor, Heading } from "../../../common/ui-components";
import {
  useConnectionsViewQuery,
  useUpdateSandboxConnectionMutation,
  VendorIdEnum,
} from "../../../generated/dashboard/graphqlSchema";
import SomethingWentWrong from "../../../errors/components/SomethingWentWrong";
import { useDispatchContext } from "../../MessageProvider";

type Props = {
  connections: PartialConnection[];
  loading: boolean;
};

interface PartialConnection {
  id: string;
  nickname?: string | null;
  vendor?: {
    id: VendorIdEnum;
    name: string;
  } | null;
}

function ConnectionNicknames({ connections, loading }: Props) {
  const [editingId, setEditingId] = useState<string>("");
  const { dispatchError } = useDispatchContext();

  const [updateSandboxConnection] = useUpdateSandboxConnectionMutation({
    refetchQueries: ["connectionsView"],
  });

  const updateSandboxConnectionNicknameFunc = (
    id: string,
    nickname: string,
  ) => {
    updateSandboxConnection({
      variables: { input: { id, nickname } },
    })
      .then(({ data: responseData }) => {
        if (responseData?.updateSandboxConnection?.errors.length) {
          dispatchError(
            responseData?.updateSandboxConnection?.errors?.toString() ||
              "Sorry, we could not update the connection nickname.",
          );
        }
      })
      .catch(() => dispatchError("Sorry, but something went wrong."));
  };

  const tableData = connections.map(({ vendor, id, nickname }) => {
    const editing = editingId === id;
    return {
      id,
      vendorId: vendor?.id,
      name: vendor?.name,
      nickname: (
        <InlineTextEditor
          value={nickname || "N/A"}
          editing={editing}
          onEditingChange={(current) => {
            if (current) {
              setEditingId(id ?? "");
            } else {
              setEditingId("");
            }
          }}
          onSave={(newNickname: string) => {
            updateSandboxConnectionNicknameFunc(id, newNickname);
          }}
          loading={editingId === id && loading}
        />
      ),
    };
  });

  return (
    <div className="w-2/3">
      <div className="">
        <Heading level="h2" size="l">
          Bank Connection Nicknames
        </Heading>
        <div className="pb-6 text-sm">
          Add a nickname for your Sandbox connections. Nicknames will not affect
          your live connections.
          <a href="https://docs.moderntreasury.com/reference/connections">
            &nbsp; Learn more.
          </a>
        </div>
      </div>
      <div className="black overflow-hidden rounded-md border border-gray-100">
        <Table
          key="connection-nicknames-table"
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render: (text: string) => (
                <div key={`${text}-name`} className="font-normal">
                  {text}
                </div>
              ),
            },
            {
              title: "Nickname",
              dataIndex: "nickname",
              key: "nickname",
              render: (text: string) => (
                <div key={`${text}-nickname`} className="font-normal">
                  {text}
                </div>
              ),
            },
            {
              title: "Vendor ID",
              dataIndex: "vendorId",
              key: "vendorId",
              render: (text: string) => (
                <div key={`${text}-vendorId`} className="font-normal">
                  {text}
                </div>
              ),
            },
            {
              title: "ID",
              dataIndex: "id",
              key: "id",
              render: (text: string) => (
                <div key={`${text}-id`} className="font-normal">
                  {text}
                </div>
              ),
            },
          ]}
          dataSource={tableData}
          pagination={false}
        />
      </div>
    </div>
  );
}

export default function ConnectionNicknamesHome() {
  const { data, loading, error: connectionsError } = useConnectionsViewQuery();
  if (loading || !data) {
    return <ClipLoader />;
  }

  if (connectionsError) {
    return <SomethingWentWrong />;
  }
  return (
    <ConnectionNicknames
      connections={data.connections.nodes}
      loading={loading || !data}
    />
  );
}

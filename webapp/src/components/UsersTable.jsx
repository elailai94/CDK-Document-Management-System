import React, { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import MUIDataTable from "mui-datatables";
import { deleteUser, getAllUsers } from "../services";

import LoadingView from "./LoadingView";
import UserView from "./UserView";
import { getFormattedDate } from "../util";

const useStyles = makeStyles(() => ({
  root: {
  },
}));

function UserViewCell(tableData) {
  return function UserViewCellInner(dataIndex) {
    const val = tableData[dataIndex];

    return (
      <UserView userId={val.userId} />
    );
  };
}

function GroupCell(tableData) {
  return function GroupCellInner(dataIndex) {
    const val = tableData[dataIndex];

    return (
      <Chip label={val.group} color="primary" />
    );
  };
}

export default function UsersTable() {
  const [tableData, setTableData] = useState(null);

  const fetchData = async () => {
    const data = await getAllUsers();
    setTableData(data);
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const columns = [
    {
      name: "name",
      label: "Name",
      options: {
        filter: true,
        filterType: "textField",
        customFilterListOptions: { render: (v) => `Name: ${v}` },
        sort: true,
        customBodyRenderLite: UserViewCell(tableData),
      },
    },
    {
      name: "dateCreated",
      label: "Created",
      options: {
        filter: false,
        sort: true,
        sortOrder: "asc",
        customBodyRenderLite: (dataIndex) => {
          const val = tableData[dataIndex];
          return getFormattedDate(new Date(val.dateCreated));
        },
      },
    },
    {
      name: "group",
      label: "Group",
      options: {
        filter: true,
        customFilterListOptions: { render: (v) => `Group: ${v}` },
        sort: false,
        customBodyRenderLite: GroupCell(tableData),
      },
    },
  ];

  const classes = useStyles();

  const options = {
    filterType: "dropdown",
    selectableRows: "single",
    fixedSelectColumn: false,
    print: false,
    download: false,
    onRowsDelete: (rowsDeleted) => {
      const itemIdsToDelete = rowsDeleted.data.map((i) => tableData[i.dataIndex].userId);
      return Promise.all(itemIdsToDelete.map((id) => deleteUser(id)));
    },
  };

  return (
    <>
      { tableData
    && (
    <MUIDataTable
      className={classes.root}
      data={tableData}
      columns={columns}
      options={options}
    />
    ) }
      { !tableData
    && <LoadingView />}
    </>
  );
}

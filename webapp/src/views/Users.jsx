import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";

import UsersTable from "../components/UsersTable";
import Page from "../containers/Page";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(5),
  },
  title: {
    marginBottom: theme.spacing(5),
  },
  datagrid: {
    flexGrow: 1,
  },
}));

function Users() {
  const theme = useTheme();
  const navigate = useNavigate();
  const classes = useStyles(theme);

  const onCreateUser = () => {
    navigate("/users/create");
  };

  const getActionButtons = () => (
    <Grid container direction="row" alignItems="center" justify="flex-end" spacing={1}>
      <Grid item>
        <Button variant="outlined" color="primary" onClick={onCreateUser}>
          Create User
        </Button>
      </Grid>
    </Grid>
  );

  const getBreadcrumbs = () => [
    {
      name: "All Documents",
      link: "/",
    },
    {
      name: "Users",
    },
  ];

  return (
    <Page title="Users" breadcrumbs={getBreadcrumbs()} actionItems={getActionButtons()}>
      <UsersTable className={classes.datagrid} />
    </Page>
  );
}

export default Users;

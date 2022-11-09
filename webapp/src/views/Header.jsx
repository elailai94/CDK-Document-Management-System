import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Button, Toolbar } from "@mui/material";
import { Backup as BackupIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

import AuthGroupWrapper from "../components/AuthGroupWrapper";
import UserBadge from "../components/UserBadge";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "none !important",
    borderBottom: "1px solid #EEE",
    backgroundColor: "#FFFFFF !important",
  },
  logoContainer: {
    flexGrow: 1,
  },
  logo: {
    width: 220,
    cursor: "pointer",
  },
  uploadButton: {
    marginRight: theme.spacing(2),
  },
}));

function Header() {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <AppBar className={classes.root} position="relative">
      <Toolbar>
        <div className={classes.logoContainer}>
          <img
            src="/images/globomantics-logo-grey.png"
            alt="Globomantics Logo"
            className={classes.logo}
            onClick={() => navigate("/")}
          />
        </div>
        <AuthGroupWrapper requiredGroups={["admin", "contributor"]}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/upload")}
            className={classes.uploadButton}
            startIcon={<BackupIcon />}
          >
            Upload
          </Button>
        </AuthGroupWrapper>
        <UserBadge />
      </Toolbar>
    </AppBar>
  );
}

export default Header;

import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  ClickAwayListener,
  Grid,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Auth } from "aws-amplify";

import AuthGroupWrapper from "./AuthGroupWrapper";
import { useUser } from "../UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
  },
  small: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    cursor: "pointer",
  },
}));

function UserBadge() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const { user } = useUser();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const onProfileEdit = () => {
    navigate("/profile");
    setOpen(false);
  };

  const onManageUsers = () => {
    navigate("/users");
    setOpen(false);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleListKeyDown = useCallback((event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }, []);

  const signOut = () => {
    Auth.signOut()
      .finally(window.location.href = "/");
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <div>
      <Grid container wrap="nowrap" spacing={2} className={classes.root}>
        <Grid item>
          <Avatar
            className={classes.small}
            ref={anchorRef}
            src={user.pictureURL}
            onClick={handleToggle}
          />
        </Grid>
      </Grid>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal placement="bottom-end">
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === "left-start" }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                  <MenuItem onClick={onProfileEdit}>Edit My Profile</MenuItem>
                  <AuthGroupWrapper requiredGroups={["admin"]}>
                    <MenuItem onClick={onManageUsers}>Manage Users</MenuItem>
                  </AuthGroupWrapper>
                  <MenuItem onClick={signOut}>Logout</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}

export default UserBadge;

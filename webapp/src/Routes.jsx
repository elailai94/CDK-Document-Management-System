import React from "react";
import { Route, BrowserRouter as Router, Routes as Switch } from "react-router-dom";
import { Paper } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

import "./App.css";
import theme from "./theme";
import CreateUser from "./views/CreateUser";
import Detail from "./views/Detail";
import Footer from "./views/Footer";
import Header from "./views/Header";
import List from "./views/List";
import NotFound from "./views/NotFound";
import Profile from "./views/Profile";
import Upload from "./views/Upload";
import { UserProvider } from "./UserContext";
import Users from "./views/Users";

const useStyles = makeStyles(() => ({
  root: {
    boxShadow: "none",
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  content: {
    flexGrow: 1,
    backgroundColor: "rgb(247, 249, 252)",
  },
}));

function Routes() {
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <UserProvider>
          <Paper className={classes.root}>
            <Header />
            <div className={classes.content}>
              <Switch>
                <Route path="/" element={<List />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/create" element={<CreateUser />} />
                <Route path="/document/:documentId" element={<Detail />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="*" element={<NotFound />} />
              </Switch>
            </div>
            <Footer />
          </Paper>
        </UserProvider>
      </Router>
    </ThemeProvider>
  );
}

export default Routes;

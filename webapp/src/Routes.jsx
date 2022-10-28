import "./App.css";

import {
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

import React from "react";
import { Paper } from "@mui/material";
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
import theme from "./theme";

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
        <Route
          render={() => (
            <UserProvider>
              <Paper className={classes.root}>
                <Header />
                <div className={classes.content}>
                  <Switch>
                    <Route exact path="/" component={List} />
                    <Route exact path="/profile" component={Profile} />
                    <Route exact path="/users" component={Users} />
                    <Route exact path="/users/create" component={CreateUser} />
                    <Route path="/document/:documentId" component={Detail} />
                    <Route exact path="/upload" component={Upload} />
                    <Route path="*" component={NotFound} />
                  </Switch>
                </div>
                <Footer />
              </Paper>
            </UserProvider>
          )}
        />
      </Router>
    </ThemeProvider>
  );
}

export default Routes;

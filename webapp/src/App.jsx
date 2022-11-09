import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { onAuthUIStateChange } from "@aws-amplify/ui-components";

// eslint-disable-next-line import/no-unresolved
import "@aws-amplify/ui-react/styles.css";

import "./App.css";
import Routes from "./Routes";

Amplify.configure(window.appConfig);

const helmetContext = {};

function App() {
  const [, setAuthState] = React.useState();
  const [, setUser] = React.useState();

  React.useEffect(
    () => onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    }),
    [],
  );

  return (
    <HelmetProvider context={helmetContext}>
      <Helmet titleTemplate="%s | Globomantics" defaultTitle="Document Management System" />
      <Authenticator hideSignUp loginMechanisms={["email"]}>
        {() => <Routes />}
      </Authenticator>
    </HelmetProvider>
  );
}

export default App;

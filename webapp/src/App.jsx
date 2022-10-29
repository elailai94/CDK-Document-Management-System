import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

import "./App.css";
import Routes from "./Routes";

const helmetContext = {};

function App() {
  return (
    <HelmetProvider context={helmetContext}>
      <Helmet
        titleTemplate="%s | Globomantics"
        defaultTitle="Document Management System"
      />
      <Routes />
    </HelmetProvider>
  );
}

export default App;

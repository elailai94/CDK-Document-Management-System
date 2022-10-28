import "./App.css";

import { Helmet, HelmetProvider } from "react-helmet-async";

import React from "react";
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

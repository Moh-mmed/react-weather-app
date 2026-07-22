import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import "./index.css";

import { UnitProvider } from "./contexts/UnitContext";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <UnitProvider>
        <App />
      </UnitProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

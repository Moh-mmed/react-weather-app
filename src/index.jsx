import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import "./index.css";

import { UnitProvider } from "./contexts/UnitContext";
import { TimeFormatProvider } from "./contexts/TimeFormatContext";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <UnitProvider>
        <TimeFormatProvider>
          <App />
        </TimeFormatProvider>
      </UnitProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

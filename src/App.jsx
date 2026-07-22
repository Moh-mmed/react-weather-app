import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Home from "./Components/Home";
import Error from "./Components/Error";

function AppTest() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.slice(0, 2).toLowerCase() || "en";
    const isRtl = lang === "ar";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [i18n.language]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Error />} />
    </Routes>
  );
}

export default AppTest;

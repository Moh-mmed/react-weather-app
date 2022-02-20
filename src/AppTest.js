import { Route, Routes } from "react-router-dom";
import ErrorPage from "./Components/ErrorPage";
import Home from "./Components/Home";

function AppTest() {
  return (
    <Routes>
    <Route path="/" element={<Home/>} />
    <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default AppTest;

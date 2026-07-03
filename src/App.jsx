import { Route, Routes } from "react-router-dom";
import Home from "./Components/Home";
import Error from "./Components/Error";

function AppTest() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Error />} />
    </Routes>
  );
}

export default AppTest;

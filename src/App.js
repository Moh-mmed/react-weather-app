import { Route, Routes } from "react-router-dom";
import Home from "./Components/Home";
import Error from "./Components/Error";

function AppTest() {
  return (
    <div style={{height: "100vh"}}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default AppTest;

import './App.css';
import { Route,Routes } from "react-router-dom"
import Body from "./Components/Main/Body";
import Nav from "./Components/Main/NavBar";
import SideBar from "./Components/SideBar";
import TodaysTemperatures from "./Components/Main/Body/TodaysTemperatures";
import NextFiveDays from "./Components/Main/Body/NextFiveDays";
import ErrorPage from './Components/ErrorPage'
function App() {
  return (
    // <div className="App">
    //   <div className="Main">
    //     <Nav />
    //     <Body />
    //   </div>
    //   <div className="Side-Bar">
    //     <SideBar />
    //   </div>
    // </div>
    <div className="App">
      <div className="Main">
        <Nav />
        <Routes>
          <Route path="/" element={<Body />}>
            <Route
              index
              element={<TodaysTemperatures />}
            />
            <Route
              path="/todays-temperatures"
              element={<TodaysTemperatures />}
            />
            <Route path="/next-five-days" element={<NextFiveDays />} />
          </Route>
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
      <div className="Side-Bar">
        <SideBar />
      </div>
    </div>
  );
}

export default App;

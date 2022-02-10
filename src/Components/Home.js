import React from 'react';
import Body from './Main/Body';
import Nav from './Main/NavBar';
import SideBar from './SideBar';
import "./Home.css"
const Home = () => {
    return (
      <>
        <div className="Main">
          <Nav />
          <Body />
        </div>
        <div className="Side-Bar">
          <SideBar />
        </div>
      </>
    );
};

export default Home;

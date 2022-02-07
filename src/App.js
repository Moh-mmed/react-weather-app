import './App.css';
import Body from './Components/Main/Body';
import Nav from './Components/Main/NavBar';
import SideBar from './Components/SideBar'
function App() {
  return (
    <div className="App">
      <div className="Main">
        <Nav />
        <Body/>
      </div>
      <div className='Side-Bar'>
        <SideBar/>
      </div>
    </div>
  );
}

export default App;

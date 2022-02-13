import React, {useState} from 'react';
import logo from '../../../imgs/weatherme.png'
import search from '../../../imgs/search.png'
import {
  NavContainer,
  StyledLogo,
  StyledSearchbar,
  StyledImage,
  StyledInput,
  StyledSearchImgContainer,
  StyledImg,
} from "./StyledNavComponents";
import NavBarForm from './NavBarForm';


const Nav = (props) => {
  // const [enteredCity, setEnteredCity] = useState("")
  // const handleFormSubmit = (e) => {
  //   e.preventDefault()
  //   if (enteredCity !== "") {
  //     props.handleSearchCity(enteredCity);
  //  }
  // }
  return (
    <NavContainer>
      <StyledLogo>
        <StyledImage src={logo} alt="Weather logo" />
      </StyledLogo>
      {/* <StyledSearchbar>
        <form onSubmit={handleFormSubmit}>
          <StyledInput
            type="text"
            placeholder="Search anything"
            className="search-bar"
            onChange={(e)=>setEnteredCity(e.target.value)}
          />
        </form>
        <StyledSearchImgContainer>
          <StyledImg src={search} alt="search img" />
        </StyledSearchImgContainer>
      </StyledSearchbar> */}
      <NavBarForm handleSearchCity={props.handleSearchCity}/>
    </NavContainer>
  );
};

export default Nav;

import React from 'react';
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


const Nav = () => {
  return (
    <NavContainer>
      <StyledLogo>
        <StyledImage src={logo} alt="Weather logo" />
      </StyledLogo>
      <StyledSearchbar>
        <StyledInput
          type="text"
          placeholder="Search anything"
          className="search-bar"
        />
        <StyledSearchImgContainer>
          <StyledImg src={search} alt="search img" />
        </StyledSearchImgContainer>
      </StyledSearchbar>
    </NavContainer>
  );
};

export default Nav;

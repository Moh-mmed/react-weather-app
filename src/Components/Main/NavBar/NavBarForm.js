import React, { useState } from 'react';
import search from "../../../imgs/search.png";
import {
  StyledSearchbar,
  StyledInput,
  StyledSearchImgContainer,
  StyledImg,
} from "./StyledNavComponents";
const NavBarForm = (props) => {
    const [enteredCity, setEnteredCity] = useState("");
    const handleFormSubmit = (e) => {
      e.preventDefault();
      if (enteredCity !== "") {
        props.handleSearchCity(enteredCity);
      }
    };
    return (
      <StyledSearchbar>
        <form onSubmit={handleFormSubmit}>
          <StyledInput
            type="text"
            placeholder="Search anything"
            className="search-bar"
            onChange={(e) => setEnteredCity(e.target.value)}
          />
        </form>
        <StyledSearchImgContainer>
          <StyledImg src={search} alt="search img" />
        </StyledSearchImgContainer>
      </StyledSearchbar>
    );
};

export default NavBarForm;

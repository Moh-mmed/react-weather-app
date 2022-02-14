import React, { useState, useRef, useEffect } from "react";
import search from "../../../imgs/search.png";
import {
  StyledSearchbar,
  StyledInput,
  StyledSearchImgContainer,
  StyledImg,
} from "./StyledNavComponents";
const NavBarForm = (props) => {
  const [enteredCity, setEnteredCity] = useState("");
   const inputField = useRef(null);
  const {handleSearchCity} = props
    const handleFormSubmit = (e) => {
      e.preventDefault();
      if (enteredCity !== "") {
        handleSearchCity(enteredCity);
        inputField.current.value = "";
        inputField.current.blur();
      }
  };
  
   useEffect(() => {
     inputField.current.focus();
   }, []);
  
    return (
      <StyledSearchbar>
        <form onSubmit={handleFormSubmit}>
          <StyledInput
            ref={inputField}
            type="text"
            placeholder="Search anything"
            className="search-bar"
            onChange={(e) => setEnteredCity(e.target.value)}
          />
        </form>
        <StyledSearchImgContainer>
          <StyledImg src={search} alt="search img"/>
        </StyledSearchImgContainer>
      </StyledSearchbar>
    );
};

export default NavBarForm;

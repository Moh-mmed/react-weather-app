import styled from "styled-components";
import { breakpoints } from "../../../constants";

export const StyledBodyContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  grid-gap: 20px;
  justify-items: stretch;
  padding: 1rem 1rem 0 2rem;

  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
    padding: 1rem 0 0;
  }
`;

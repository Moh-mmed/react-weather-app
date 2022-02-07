import styled from "styled-components";

export const StyledBodyContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-row-gap: 25px;
  grid-column-gap: 30px;
  justify-items: stretch;
  padding: 1rem 2rem;
  height: calc(100% - 80px);
`;

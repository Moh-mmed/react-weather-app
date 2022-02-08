import styled from "styled-components";

export const StyledBodyContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-gap: 20px;
  justify-items: stretch;
  padding: 1rem 1rem 3rem 2rem;
  height: calc(100% - 80px);
`;

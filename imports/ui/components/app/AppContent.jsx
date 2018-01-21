import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  flex: 1 1 100%;
  ${'' /* background: lightblue; */}
  padding: 4rem;
  overflow: auto;
`;

const Content = styled.div`
  margin: 0 auto;
  max-width: 900px;
`;

export default ({ children }) => (
  <Wrapper>
    <Content>{children}</Content>
  </Wrapper>
);

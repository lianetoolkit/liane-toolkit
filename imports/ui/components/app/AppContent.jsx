import React from "react";
import styled from "styled-components";
import { Divider } from "semantic-ui-react";

const Wrapper = styled.div`
  flex: 1 1 100%;
  overflow: auto;
`;

const Content = styled.div`
  padding: 2rem 4rem;
  ${'' /* margin: 0 auto; */}
  ${'' /* max-width: 900px; */}
`;

const Footer = styled.footer`
  margin: 4rem 0;
  padding: 4rem 0;
  border-top: 1px solid #ccc;
`;

export default ({ children }) => (
  <Wrapper id="app-content">
    <Content>
      {children}
      <Footer>
        <a
          href="//www.iubenda.com/privacy-policy/21067437"
          className="iubenda-white iubenda-embed"
          title="Privacy Policy"
        >
          Privacy Policy
        </a>
      </Footer>
    </Content>
  </Wrapper>
);

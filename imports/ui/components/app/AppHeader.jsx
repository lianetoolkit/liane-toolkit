import React from "react";
import styled from "styled-components";
import AppMenu from "./AppMenu.jsx";

const Wrapper = styled.header`
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  min-width: 300px;
  background: #222;
  color: #fff;
  h1 {
    margin: 2rem;
  }
`;

const Logo = styled.h1`
  flex: 0 0 auto;
  text-transform: uppercase;
  font-size: 1em;
  a {
    color: #fff;
  }
`;

const Menu = styled.div`
  flex: 1 1 100%;
`;

export default ({
  children,
  campaigns,
  currentCampaign,
  currentUser,
  logout
}) => (
  <Wrapper>
    <Logo>
      <a href={FlowRouter.path("App.dashboard")}>
        {Meteor.settings.public.appName}
      </a>
    </Logo>
    <AppMenu
      campaigns={campaigns}
      currentCampaign={currentCampaign}
      currentUser={currentUser}
      logout={logout}
    />
    <div>{children}</div>
  </Wrapper>
);

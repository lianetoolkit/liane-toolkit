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
  position: fixed;
  top: 0;
  bottom: 0;
`;

const Logo = styled.h1`
  flex: 0 0 auto;
  text-transform: uppercase;
  font-size: 1em;
  margin: 2rem !important;
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

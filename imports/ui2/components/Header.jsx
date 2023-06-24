import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ClientStorage } from "meteor/ostrio:cstorage";

import { alertStore } from "../containers/Alerts.jsx";

import AppNav from "../components/AppNav.jsx";

const Container = styled.header`
  background: #330066;
  padding: 0;
  flex: 1 1 auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  height: 62px;
  .header-content {
    max-width: 1000px;
    padding: 0 2rem;
    margin: 0 auto;
    line-height: 1;
    .brand {
      margin: 0.5rem 0.8rem 0.5rem 0;
      float: left;
      position: relative;
      z-index: 15;
    }
    .brand h1 {
      margin: 0;
      padding: 0;
    }
    .brand h1 img {
      display: block;
      width: auto;
      height: 44px;
    }
  }
`;

const TopNav = styled.nav`
  display: flex;
  flex-wrap: nowrap;
  font-weight: 400;
  font-size: 0.7em;
  justify-content: flex-end;
  padding-top: 0.5rem;
  margin-bottom: 0.2rem;
  position: relative;
  z-index: 11;
  a,
  .dropdown-item {
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    display: block;
    white-space: nowrap;
    margin-left: 1rem;
    &:hover,
    &:focus,
    &:active {
      color: #fff;
      ul {
        display: block;
      }
    }
    position: relative;
    ul {
      position: absolute;
      display: none;
      top: 0;
      right: 0;
      list-style: none;
      margin: 0.5rem 0 0;
      padding: 0.7rem 0 0;
      font-size: 0.9em;
      li {
        background: #000;
        margin: 0;
        padding: 0.25rem 0.5rem;
        &:first-child {
          padding-top: 0.5rem;
          border-radius: 7px 7px 0 0;
        }
        &:last-child {
          padding-bottom: 0.5rem;
          border-radius: 0 0 7px 7px;
        }
        a {
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          &:hover,
          &:focus,
          &:active {
            color: #fff;
          }
        }
      }
    }
  }
  ${(props) =>
    props.full &&
    css`
      font-size: 0.8em;
      padding-top: 1.5rem;
      font-weight: 600;
      margin-bottom: 0;
      a {
        color: rgba(255, 255, 255, 0.6);
      }
    `}
`;

export default class Header extends Component {
  _handleLanguageClick = (language) => (ev) => {
    ev.preventDefault();
    const user = Meteor.user();
    ClientStorage.set("language", language);
    if (user) {
      Meteor.call("users.setLanguage", { language }, (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };
  render() {
    const { campaign, campaigns, notifications } = this.props;
    const user = Meteor.user();
    return (
      <Container>
        <div className="header-content">
          <div className="brand">
            <h1>
              <a href={FlowRouter.path("App.dashboard")}>
                <img
                  src={
                    campaign
                      ? "/images/logo_icon_44.png"
                      : "/images/logo_w_44.png"
                  }
                  alt="Liane"
                />
              </a>
            </h1>
          </div>
          <TopNav full={!user}>
            <a
              href="https://institutoupdate.org.br"
              target="_blank"
              rel="external"
            >
              Instituto Update
            </a>
            <a href="https://support.liane.voto" target="_blank" rel="external">
              <FormattedMessage id="app.support" defaultMessage="Support" />
            </a>
            <a
              href="https://support.liane.camp/wp-content/uploads/2022/05/Espanol-25202025_1_Terminos-de-Uso_Instituto-Update_MF_140519.pdf"
              target="_blank"
              rel="external"
            >
              <FormattedMessage
                id="app.terms_of_use"
                defaultMessage="Terms of Use"
              />
            </a>
            <a
              href="https://support.liane.camp/wp-content/uploads/2022/05/Espanol-Politica-de-Privacidade_Instituto-Update_MF_140519-1.pdf"
              target="_blank"
              rel="external"
            >
              <FormattedMessage
                id="app.privacy_policy"
                defaultMessage="Privacy Policy"
              />
            </a>
            <span className="dropdown-item">
              <FontAwesomeIcon icon="globe-americas" />
              <ul>
                <li>
                  <a
                    href="javascript:void(0);"
                    onClick={this._handleLanguageClick("en")}
                  >
                    English
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    onClick={this._handleLanguageClick("es")}
                  >
                    Español
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    onClick={this._handleLanguageClick("pt-BR")}
                  >
                    Português (Brasil)
                  </a>
                </li>
              </ul>
            </span>
          </TopNav>
          {user ? (
            <AppNav
              campaign={campaign}
              campaigns={campaigns}
              notifications={notifications}
            />
          ) : null}
        </div>
      </Container>
    );
  }
}

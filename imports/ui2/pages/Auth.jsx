import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Page from "../components/Page.jsx";

const Container = styled.div`
  flex: 1 1 100%;
`;

const HighlightContainer = styled.div`
  padding: 6rem 0;
  position: relative;
  border-bottom: 1px solid #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  &:after {
    content: "";
    background-image: url("/images/elenao_bg.jpeg");
    background-position: center;
    background-size: cover;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    opacity: 0.15;
    z-index: -1;
  }
  h2 {
    max-width: 960px;
    font-family: "Unica One", monospace;
    margin: 0 auto 4rem;
    padding: 0;
    text-transform: uppercase;
    flex-direction: column;
    line-height: 1.3;
    letter-spacing: 0.15rem;
    color: #333;
    font-size: 2.5em;
  }
`;

const ButtonGroup = styled.nav`
  width: 100%;
  max-width 400px;
  display: flex;
  align-items: center;
  margin: 0 -0.5rem 2rem;
  font-family: "Unica One", monospace;
  a {
    width: 100%;
    text-align: center;
    background: transparent;
    color: #6633cc;
    text-decoration: none;
    padding: 0.5rem 2rem;
    margin: 0 0.5rem;
    border-radius: 3rem;
    border: 1px solid #6633cc;
    background: rgba(255, 255, 255, 0.6);
    &:hover,
    &:active,
    &:focus {
      background: #fff;
      border-color: #000;
      color: #000;
    }
  }
`;

const LoginFormContainer = styled.form`
  max-width: 500px;
  margin: -3rem auto 6rem;
  ${"" /* background: #fff;
  padding: 4rem;
  border-radius: 1rem;
  box-sizing: border-box;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.15);
  border: 1px solid #999; */} position: relative;
  z-index: 2;
  p,
  h3 {
    margin: 0 0 2rem;
  }
  input,
  .button {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 1.25rem;
    line-height: 1;
    margin: 0 0 1rem;
    border: 0;
    border: 1px solid #ccc;
    border-radius: 0;
    background: #f7f7f7;
    font-size: 1em;
    border-radius: 2.5rem;
    font-family: "Open Sans", "Helvetica", "Arial", sans-serif;
    &:focus {
      background: #fff;
    }
  }
  input[type="submit"],
  .facebook-button {
    background: transparent;
    color: #333;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.12rem;
    font-weight: normal;
    line-height: 1.5;
    cursor: pointer;
    padding: 1rem;
    margin: 1.5rem 0 0;
    font-size: 1.2em;
    background: #ffcc00;
    font-family: "Unica One", monospace;
    outline: none;
    border: 0;
    text-align: center;
    .fa-facebook-square {
      margin-right: 1rem;
    }
    &:focus,
    &:hover {
      background: #333;
      color: #fff;
    }
  }
  .facebook-button {
    margin-top: 1rem;
    background: #3b5998;
    color: #fff;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
  }
  nav {
    display: flex;
    width: 100%;
    margin-top: 1.5rem;
    a {
      flex: 1 1 auto;
      text-align: center;
      color: #666;
      text-transform: uppercase;
      font-size: 0.8em;
      &:hover,
      &:active,
      &:focus {
        color: #000;
      }
    }
  }
`;

export default class AuthPage extends Component {
  _facebookAuth = () => ev => {
    ev.preventDefault();
    Meteor.loginWithFacebook(
      {
        requestPermissions: [
          "public_profile",
          "email",
          "manage_pages",
          "publish_pages",
          "pages_show_list",
          "ads_management",
          "ads_read",
          "business_management",
          "read_page_mailboxes",
          "pages_messaging",
          "pages_messaging_phone_number",
          "pages_messaging_subscriptions"
        ]
      },
      err => {
        if (err) {
          console.log(err);
        } else {
          Meteor.call("users.exchangeFBToken", (err, data) => {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    );
  };
  render() {
    return (
      <Page>
        <Container>
          <HighlightContainer>
            <h2>
              Caixa de ferramentas para campanhas eleitorais de baixo custo e
              alta intensidade
            </h2>
            <ButtonGroup>
              <a href="#">Como Funciona</a>
              <a href="#">#NãoValeTudo</a>
            </ButtonGroup>
          </HighlightContainer>
          <LoginFormContainer>
            {/* <h3>Acesse sua conta</h3> */}
            <a
              className="facebook-button button"
              onClick={this._facebookAuth()}
            >
              <FontAwesomeIcon icon={["fab", "facebook-square"]} /> Conecte-se
              com Facebook
            </a>
            {/* <input type="email" placeholder="Email" />
            <input type="password" placeholder="Senha" />
            <input type="submit" value="Acessar painel" />
            <nav>
            &middot; <a href="#">Esqueci meu email</a>
            &middot; <a href="#">Esqueci minha senha</a>
            &middot;
          </nav> */}
          </LoginFormContainer>
        </Container>
      </Page>
    );
  }
}

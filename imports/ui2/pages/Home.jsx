import React, { Component } from "react";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Page from "../components/Page.jsx";
import { alertStore } from "../containers/Alerts.jsx";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import OrLine from "../components/OrLine.jsx";

const Container = styled.div`
  flex: 1 1 100%;
  .support-text {
    color: #999;
    padding: 0 2rem 2rem;
    margin: 0;
    text-align: center;
    font-size: 0.8em;
    border-bottom: 1px solid #eee;
  }
`;

const HighlightContainer = styled.div`
  padding: 6rem 0 4rem;
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

const HeaderButtons = styled.nav`
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
  margin: -3rem 2rem 4rem;
  text-align: center;
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
    margin: 0 auto;
    max-width: 400px;
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
    display: block;
    max-width: 400px;
    background: transparent;
    color: #333;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.12rem;
    font-weight: normal;
    line-height: 1.5;
    cursor: pointer;
    padding: 1rem;
    margin: 1.5rem auto 0;
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
  .terms {
    margin-top: 1rem;
    font-size: 0.8em;
    color: #999;
    text-align: center;
  }
`;

const UserContainer = styled.div`
  max-width: 400px;
  margin: -3rem auto 4rem;
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
  padding: 2rem;
  z-index: 2;
  position: relative;
  h3 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
  }
  .button.primary {
    margin: 0 0 2rem;
    display: block;
  }
  p {
    font-size: 0.9em;
    color: #666;
  }
  .button-group {
    margin-top: 2rem;
  }
`;

const Intro = styled.section`
  max-width: 960px;
  margin: 6rem auto 6rem;
  padding: 0 2rem;
  .first {
    max-width: 750px;
    display: flex;
    align-items: center;
    .intro-text {
      flex: 1 1 100%;
      color: #333;
      line-height: 1.5;
      p:first-child {
        font-size: 1.3em;
        border-bottom: 2px solid #ddd;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
      }
    }
    .features {
      flex: 1 1.5 100%;
    }
  }
`;

const Features = styled.section`
  background: #333;
  color: #fff;
  margin: 0 0 2rem;
  padding: 4rem 0;
  div {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
  }
  h2 {
    flex: 1 1 auto;
    text-align: right;
    border-right: 2px solid #444;
    padding: 1rem 2rem 0 0;
    margin: 0 1rem 0 0;
    line-height: 1.5;
    color: #ffcc00;
  }
  ul {
    flex: 1 1 auto;
    list-style: none;
    margin: 0;
    padding: 0;
    border-radius: 7px;
    display: flex;
    flex-wrap: wrap;
    font-family: "Unica One", monospace;
    font-weight: normal;
    align-items: center;
    font-size: 1.3em;
    letter-spacing: 0.1rem;
    li {
      flex: 1 1 40%;
      margin: 0;
      padding: 1rem;
      position: relative;
      &:last-child {
        border-bottom: 0;
      }
      .with-extra {
        position: relative;
      }
      .extra {
        color: #666;
        display: inline-block;
        position: absolute;
        bottom: -1.25rem;
        left: 0rem;
        font-size: 0.6em;
        font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        letter-spacing: 0;
        background: #393939;
        border-radius: 7px;
        padding: 0.2rem 0.3rem;
        text-align: center;
        line-height: 1.2;
      }
    }
  }
`;

const Organization = styled.section`
  padding: 4rem 0;
  background: #fff;
  .org-content {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 2rem;
    > div {
      margin: 0 -1rem;
      display: flex;
      > div {
        margin: 0 1rem;
      }
    }
  }
`;

const FeatureItemContainer = styled.li`
  display: flex;
  align-items: center;
  .icon {
    margin-right: 2rem;
    font-size: 0.7em;
    color: #ff6600;
  }
`;

function FeatureItem(props) {
  return (
    <FeatureItemContainer>
      <span className="icon">
        <FontAwesomeIcon icon="star" />
      </span>
      {props.children}
    </FeatureItemContainer>
  );
}

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }
  _facebookAuth = () => ev => {
    ev.preventDefault();
    this.setState({ loading: true });
    Meteor.loginWithFacebook(
      {
        requestPermissions: ["public_profile", "email"]
      },
      err => {
        if (err) {
          this.setState({ loading: false });
          alertStore.add(
            "Erro durante autenticação, tente novamente.",
            "error"
          );
        } else {
          Meteor.call("users.exchangeFBToken", (err, data) => {
            this.setState({ loading: false });
            if (err) {
              alertStore.add(err);
            }
          });
        }
      }
    );
  };
  render() {
    const { isLoggedIn } = this.props;
    const { loading } = this.state;
    const user = Meteor.user();
    return (
      <Page>
        {loading ? <Loading full /> : null}
        <Container>
          <HighlightContainer>
            <h2>
              <FormattedMessage
                id="app.slogan"
                defaultMessage="Technology for Political Innovation"
              />
            </h2>
          </HighlightContainer>
          {!isLoggedIn ? (
            <LoginFormContainer>
              <a
                className="facebook-button button"
                onClick={this._facebookAuth()}
              >
                <FontAwesomeIcon icon={["fab", "facebook-square"]} />
                <FormattedMessage
                  id="app.facebook_login"
                  defaultMessage="Connect with Facebook"
                />
              </a>
              <p className="terms">
                <FormattedHTMLMessage
                  id="app.terms_and_policy"
                  defaultMessage="By registering in LIANE you agree with our <a href='https://files.liane.cc/legal/terms_of_use_v1_pt-br.pdf' target='_blank' rel='external'>terms of use</a> and <a href='https://files.liane.cc/legal/privacy_policy_v1_pt-br.pdf' target='_blank' rel='external' >privacy policy</a>."
                />
              </p>
            </LoginFormContainer>
          ) : (
            <UserContainer>
              <h3>
                <FormattedMessage
                  id="app.connected_as"
                  defaultMessage="Connected as"
                />{" "}
                <strong>{user.name}</strong>
              </h3>
              {!user.type ? (
                <p>
                  <FormattedMessage
                    id="app.waiting_user_type"
                    defaultMessage="Waiting selection of user type."
                  />
                </p>
              ) : (
                <div>
                  {user.type == "campaigner" ? (
                    <>
                      <Button
                        primary
                        href={FlowRouter.path("App.campaign.new")}
                      >
                        <FormattedMessage
                          id="app.create_campaign"
                          defaultMessage="Create new campaign"
                        />
                      </Button>
                      <OrLine />
                    </>
                  ) : null}
                  <p>
                    <FormattedMessage
                      id="app.connect_campaign"
                      defaultMessage="Connect with an existing campaign by forwarding your email to the person responsible"
                    />
                    :
                  </p>
                  <input type="text" disabled value={user.emails[0].address} />
                  <Button.Group>
                    <Button href={FlowRouter.path("App.account")}>
                      <FormattedMessage
                        id="app.my_account"
                        defaultMessage="My account"
                      />
                    </Button>
                    <Button
                      onClick={() => {
                        Meteor.logout();
                      }}
                    >
                      <FormattedMessage
                        id="app.logout"
                        defaultMessage="Logout"
                      />
                    </Button>
                  </Button.Group>
                </div>
              )}
            </UserContainer>
          )}
          <Intro>
            <div className="first">
              <div className="intro-text">
                <p>
                  <FormattedMessage
                    id="app.intro_text_1"
                    defaultMessage="Liane is a set of open and free technologies and solutions, developed by Instituto Update to boost innovative and low-cost political campaigns in Latin America."
                  />
                </p>
                <p>
                  <FormattedMessage
                    id="app.intro_text_2"
                    defaultMessage="Offers access to powerful tools empowering campaigns that seeks political innovation, that being the development of practices to bring citizens closer to politics, fight inequalities and strengthen democracy."
                  />
                </p>
              </div>
            </div>
          </Intro>
          <Features>
            <div>
              {/* <h2>Funcionalidades</h2> */}
              <ul>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.canvas"
                    defaultMessage="Electoral canvas for planning"
                  />
                </FeatureItem>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.crm"
                    defaultMessage="Contacts and relationship management"
                  />
                </FeatureItem>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.volunteers_donors"
                    defaultMessage="Donors and volunteers management"
                  />
                </FeatureItem>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.conversations"
                    defaultMessage="Manage Facebook conversations"
                  />
                </FeatureItem>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.map"
                    defaultMessage="Mapping of actions in the territory"
                  />
                </FeatureItem>
                <FeatureItem>
                  <span className="with-extra">
                    <span className="extra">
                      <FormattedMessage id="app.soon" defaultMessage="soon" />
                    </span>
                    <FormattedMessage
                      id="app.features.audience"
                      defaultMessage="Facebook audience analysis"
                    />
                  </span>
                </FeatureItem>
              </ul>
            </div>
          </Features>
          <p className="support-text">
            <FormattedHTMLMessage
              id="app.support_message"
              defaultMessage="Need help or would like to report a problem? Write to <a href='mailto:contato@liane.cc'>contato@liane.cc</a> and talk to our team."
            />
          </p>
          <Organization>
            <div className="org-content">
              <div>
                <div>
                  <h2>Instituto Update</h2>
                  <p>
                    <FormattedMessage
                      id="app.home.instituto_update"
                      defaultMessage="Instituto Update is a not-for-profit civil society organization that fosters political innovation in Latin America. Develops intelligence and civic technology projects to bring citizens closer to politics and strengthen democracy based on the vision of political renovation centered on diversity and combating inequalities."
                    />
                  </p>
                </div>
                <div>
                  <h2>
                    <FormattedMessage
                      id="app.home.liane_header"
                      defaultMessage="Who was Liane?"
                    />
                  </h2>
                  <p>
                    <FormattedMessage
                      id="app.home.liane_text"
                      defaultMessage="The name is a tribute to Liane Lira, friend and activist who passed away in 2015 and dedicated her life to processes of mobilization, strengthening democracy and political transparency."
                    />
                  </p>
                </div>
              </div>
            </div>
          </Organization>
        </Container>
      </Page>
    );
  }
}

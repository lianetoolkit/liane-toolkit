import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set, defaultsDeep } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import Content from "../components/Content.jsx";
import Loading from "../components/Loading.jsx";
import Form from "../components/Form.jsx";

const Container = styled.div`
  /* max-width: 960px; */
  width: 100%;
  display: flex;
  .toggle-chatbot {
    flex: 0 0 auto;
    color: #999;
    text-decoration: none;
    font-size: 0.8em;
    line-height: 1;
    display: flex;
    align-items: center;
    > * {
      display: inline-block;
    }
    .fa-toggle-off,
    .fa-toggle-on {
      font-size: 2em;
      display: inline-block;
      margin-left: 1.5rem;
    }
    .fa-toggle-off {
      color: #ccc;
    }
    .fa-toggle-on {
      color: green;
    }
    &:hover {
      .fa-toggle-off {
        color: green;
      }
      .fa-toggle-on {
        color: #333;
      }
    }
  }
  header {
    display: flex;
    padding: 1rem 1.5rem;
    align-items: center;
    h3 {
      flex: 1 1 100%;
      margin: 0;
      a {
        color: #333;
        text-decoration: none;
        display: block;
        &:hover {
          color: #000;
        }
      }
    }
    .settings-link {
      margin-left: 1.5rem;
      display: inline-block;
      flex: 0 0 auto;
      color: #ddd;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.8em;
      cursor: default;
    }
  }
  section {
    font-size: 0.8em;
    &.disabled > * {
      opacity: 0.5;
    }
  }
`;

class ChatbotPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      chatbot: {},
      formData: { ...ChatbotPage.defaultConfig }
    };
  }
  static defaultConfig = {
    active: false,
    init_text_response: false,
    extra_info: {
      campaign_presentation: "",
      campaign_details: ""
    }
  };
  componentDidMount() {
    this.fetch();
  }
  fetch = () => {
    const { campaignId } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call("campaigns.chatbot.get", { campaignId }, (err, res) => {
      this.setState({
        loading: false
      });
      if (err) {
        alertStore.add(err);
        this.setState({
          chatbot: {}
        });
      } else {
        this.setState({
          chatbot: res,
          formData: defaultsDeep(res, ChatbotPage.defaultConfig)
        });
      }
    });
  };
  _handleActivationClick = ev => {
    ev.preventDefault();
    const { campaignId, campaign } = this.props;
    const active = get(campaign.facebookAccount, "chatbot.active");
    let msg = "Você tem certeza que deseja ativar o chatbot?";
    if (active) {
      msg = "Você tem certeza que deseja remover o chatbot?";
    }
    if (confirm(msg)) {
      Meteor.call(
        "campaigns.chatbot.activation",
        {
          campaignId,
          active: !active
        },
        (err, data) => {
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add("Atualizado", "success");
          }
          this.fetch();
        }
      );
    }
  };
  _isActive = () => {
    return this.state.chatbot && this.state.chatbot.active;
  };
  _handleChange = ({ target }) => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    set(
      newFormData,
      target.name,
      target.type == "checkbox" ? target.checked : target.value
    );
    this.setState({
      formData: {
        ...formData,
        ...newFormData
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaignId } = this.props;
    const { formData } = this.state;
    Meteor.call(
      "campaigns.chatbot.update",
      {
        campaignId,
        config: formData
      },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add("Atualizado", "success");
        }
      }
    );
  };
  render() {
    const { campaign } = this.props;
    const { loading, formData } = this.state;
    const account = campaign.facebookAccount;
    if (loading) {
      return <Loading full />;
    }
    const currentRoute = FlowRouter.current().route.name;
    return (
      <Container>
        <Page.Nav>
          <h3>Configurações do chatbot</h3>
          <a
            href="javascript:void(0);"
            className={currentRoute == "App.chatbot" ? "active" : ""}
          >
            Configurações gerais
          </a>
          <a href="javascript:void(0);">Informações do candidato</a>
          <a
            href="javascript:void(0);"
            className={currentRoute == "App.campaign.accounts" ? "active" : ""}
          >
            Dar e receber propostas
          </a>
          <a href="javascript:void(0);">Respostas automáticas</a>
          <a
            href="javascript:void(0);"
            className={currentRoute == "App.campaign.actions" ? "active" : ""}
          >
            Notificações a pessoas
          </a>
          <a
            href="javascript:void(0);"
            className={currentRoute == "App.campaign.actions" ? "active" : ""}
          >
            Registro de apoio
          </a>
        </Page.Nav>
        <Page.Content>
          <section className={!this._isActive() ? "disabled" : ""}>
            <a
              href="javascript:void(0);"
              className="toggle-chatbot"
              onClick={this._handleActivationClick}
            >
              {!this._isActive(account) ? (
                <>
                  <span>Ativar chatbot </span>
                  <FontAwesomeIcon
                    icon={this._isActive() ? "toggle-on" : "toggle-off"}
                  />
                </>
              ) : null}
            </a>
            <Form onSubmit={this._handleSubmit}>
              {!this._isActive() ? (
                <p>O chatbot está desativado para esta página</p>
              ) : null}
              <label>
                Apresentação da campanha
                <textarea
                  placeholder="Descreva brevemente sobre sua campanha"
                  name="extra_info.campaign_presentation"
                  value={formData.extra_info.campaign_presentation}
                  disabled={!this._isActive()}
                  onChange={this._handleChange}
                />
              </label>
              <label>
                Detalhes da campanha
                <textarea
                  placeholder="Dê mais detalhes sobre sua campanha"
                  name="extra_info.campaign_details"
                  value={formData.extra_info.campaign_details}
                  disabled={!this._isActive()}
                  onChange={this._handleChange}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  name="text_response"
                  checked={formData.text_response}
                  disabled={!this._isActive()}
                  onChange={this._handleChange}
                />{" "}
                Ativar em mensagem inicial
              </label>
              {this._isActive() ? (
                <Form.ButtonGroup>
                  <a
                    className="button"
                    href={`https://m.me/${account.facebookId}/?ref=:1116`}
                    target="_blank"
                  >
                    Testar chatbot
                  </a>
                  <button
                    className="delete"
                    onClick={this._handleActivationClick}
                  >
                    Remover chatbot
                  </button>
                  <input type="submit" value="Atualizar configurações" />
                </Form.ButtonGroup>
              ) : null}
            </Form>
          </section>
        </Page.Content>
      </Container>
    );
  }
}

export default ChatbotPage;

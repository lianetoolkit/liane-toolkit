import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set, defaultsDeep } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";
import Content from "../components/Content.jsx";
import Loading from "../components/Loading.jsx";
import Form from "../components/Form.jsx";

const ModuleLinkContainer = styled.a`
  padding-right: 0 !important;
  .module-link-content {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.2;
    margin-left: -1.5rem;
    span {
      flex: 1 1 100%;
      display: block;
    }
    span.status {
      flex: 0 0 auto;
      width: 10px;
      height: 10px;
      border-radius: 100%;
      background: #bbb;
      margin: 0 1rem 0 0;
    }
    .module-info {
      .label {
        padding-bottom: 0.25rem;
        margin-bottom: 0.25rem;
        border-bottom: 1px solid #eee;
      }
      .status-label {
        font-size: 0.8em;
        color: #999;
        font-style: italic;
        font-weight: normal;
      }
    }
  }
  ${props =>
    props.active &&
    css`
      .module-link-content {
        span.status {
          background: #00cc66;
          border: 1px solid #00ff80;
          box-shadow: 0 0 0.5rem #00ff80;
        }
      }
    `}
  ${props =>
    props.pending &&
    css`
      .module-link-content {
        span.status {
          background: #fc0;
          border: 1px solid #ffdf5d;
          box-shadow: 0 0 0.5rem #ffdf5d;
        }
      }
    `}
`;

class ModuleLink extends Component {
  statusLabel = () => {
    const { active, pending } = this.props;
    if (pending) return "Configuração pendente";
    if (active) return "Ativo";
    return "Inativo";
  };
  render() {
    const { children, ...props } = this.props;
    let statusClass = "status";
    let statusLabelClass = "status-label";
    // if (active) {
    //   statusClass += " active";
    //   statusLabelClass += " active";
    // }
    // if (pending) {
    //   statusClass += " pending";
    //   statusLabelClass += " pending";
    // }
    return (
      <ModuleLinkContainer {...props}>
        <span className="module-link-content">
          <span className="status" />
          <span className="module-info">
            <span className="label">{children}</span>
            <span className="status-label">{this.statusLabel()}</span>
          </span>
        </span>
      </ModuleLinkContainer>
    );
  }
}

const Container = styled.div`
  /* max-width: 960px; */
  width: 100%;
  display: flex;
  header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    .chatbot-status {
      flex: 0 0 auto;
      margin: 0 2rem 0 0;
      font-weight: 600;
      p {
        margin: 0;
      }
    }
    .toggle-chatbot {
      flex: 1 1 100%;
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
        margin-right: 1rem;
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
    .button {
      display: block;
      margin: 0;
      white-space: nowrap;
    }
  }
  section {
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
    this.setState({
      loading: true
    });
    if (confirm(msg)) {
      Meteor.call(
        "campaigns.chatbot.activation",
        {
          campaignId,
          active: !active
        },
        (err, data) => {
          this.setState({
            loading: false
          });
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
          <h3>Módulos</h3>
          <ModuleLink active={true} href="javascript:void(0);">
            Informações do Candidato
          </ModuleLink>
          <ModuleLink active={false} href="javascript:void(0);">
            Dar e receber propostas
          </ModuleLink>
          <ModuleLink active={true} href="javascript:void(0);">
            Respostas automáticas
          </ModuleLink>
          <ModuleLink active={true} pending={true} href="javascript:void(0);">
            Notificações a pessoas
          </ModuleLink>
          <ModuleLink active={false} href="javascript:void(0);">
            Registro de apoio
          </ModuleLink>
        </Page.Nav>
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <header>
              <div className="chatbot-status">
                {this._isActive() ? (
                  <p>O chatbot está ativado</p>
                ) : (
                  <p>O chatbot está desativado</p>
                )}
              </div>
              <a
                href="javascript:void(0);"
                className="toggle-chatbot"
                onClick={this._handleActivationClick}
              >
                <FontAwesomeIcon
                  icon={this._isActive() ? "toggle-on" : "toggle-off"}
                />
                {!this._isActive() ? (
                  <span>Ativar chatbot</span>
                ) : (
                  <span>Desativar chatbot</span>
                )}
              </a>
              {this._isActive() ? <Button>Divulgar chatbot</Button> : null}
            </header>
            <Form.Field label="Apresentação da Campanha">
              <textarea
                placeholder="Descreva brevemente sobre sua campanha"
                name="extra_info.campaign_presentation"
                value={formData.extra_info.campaign_presentation}
                disabled={!this._isActive()}
                onChange={this._handleChange}
              />
            </Form.Field>
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
            {/* {this._isActive() ? (
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
      ) : null} */}
          </Form.Content>
          <Form.Actions>
            <input
              type="submit"
              value="Atualizar configurações"
              onClick={this._handleSubmit}
            />
          </Form.Actions>
        </Form>
      </Container>
    );
  }
}

export default ChatbotPage;

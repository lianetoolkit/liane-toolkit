import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set, defaultsDeep } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import Content from "../components/Content.jsx";
import Loading from "../components/Loading.jsx";
import Form from "../components/Form.jsx";

const AccountList = styled.div`
  /* max-width: 960px; */
  margin: 0 auto;
  padding: 0;
  list-style: none;
  background: #fff;
  border-radius: 7px;
  border: 1px solid #ddd;
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
  &.enabled {
    header {
      .settings-link {
        color: #666;
        cursor: pointer;
        &:hover {
          color: #333;
        }
      }
    }
  }
  section {
    border-top: 1px solid #eee;
    padding: 1rem;
    font-size: 0.8em;
    background: #fbfbfb;
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
      } else {
        this.setState({
          chatbot: res,
          formData: defaultsDeep(res, ChatbotPage.defaultConfig)
        });
      }
    });
  };
  _handleActivationClick = facebookAccountId => ev => {
    ev.preventDefault();
    const { campaignId, campaign } = this.props;
    const account = campaign.accounts.find(
      account => account.facebookId == facebookAccountId
    );
    const active = get(account, "chatbot.active");
    let msg = "Você tem certeza que deseja ativar o chatbot para essa página?";
    if (active) {
      msg = "Você tem certeza que deseja remover o chatbot dessa página?";
    }
    if (confirm(msg)) {
      Meteor.call(
        "campaigns.chatbot.activation",
        {
          campaignId,
          facebookAccountId,
          active: !active
        },
        (err, data) => {
          if (err) {
            alertStore.add(err);
          } else {
            if (active) {
              this._closeSettings(account);
            } else {
              this._openSettings(account);
            }
          }
        }
      );
    }
  };
  _isActive = () => {
    return this.state.chatbot.active;
  };
  _handleChange = account => ({ target }) => {
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
  _handleSubmit = account => ev => {
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
    return (
      <Content>
        <AccountList>
          <header>
            <a
              href="javascript:void(0);"
              className="toggle-chatbot"
              onClick={this._handleActivationClick(account.facebookId)}
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
          </header>
          <section className={!this._isActive() ? "disabled" : ""}>
            <Form onSubmit={this._handleSubmit(account)}>
              {!this._isActive(account) ? (
                <p>O chatbot está desativado para esta página</p>
              ) : null}
              <label>
                Apresentação da campanha
                <textarea
                  placeholder="Descreva brevemente sobre sua campanha"
                  name="extra_info.campaign_presentation"
                  value={formData.extra_info.campaign_presentation}
                  disabled={!this._isActive()}
                  onChange={this._handleChange(account)}
                />
              </label>
              <label>
                Detalhes da campanha
                <textarea
                  placeholder="Dê mais detalhes sobre sua campanha"
                  name="extra_info.campaign_details"
                  value={formData.extra_info.campaign_details}
                  disabled={!this._isActive()}
                  onChange={this._handleChange(account)}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  name="init_text_response"
                  checked={formData.init_text_response}
                  disabled={!this._isActive()}
                  onChange={this._handleChange(account)}
                />{" "}
                Ativar em mensagem inicial
              </label>
              {this._isActive(account) ? (
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
                    onClick={this._handleActivationClick(account.facebookId)}
                  >
                    Remover chatbot
                  </button>
                  <input type="submit" value="Atualizar configurações" />
                </Form.ButtonGroup>
              ) : null}
            </Form>
          </section>
        </AccountList>
      </Content>
    );
  }
}

export default ChatbotPage;

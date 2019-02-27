import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import Content from "../components/Content.jsx";

const AccountList = styled.ul`
  max-width: 960px;
  margin: 0 auto;
  padding: 0;
  list-style: none;
  background: #fff;
  border-radius: 1.65rem;
  border: 1px solid #ddd;
  li {
    margin: 0;
    padding: 0;
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
    }
  }
`;

class ChatbotPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSettings: []
    };
  }
  _handleActivationClick = facebookAccountId => ev => {
    ev.preventDefault();
    const { campaignId, campaign } = this.props;
    const account = campaign.accounts.find(
      account => account.facebookId == facebookAccountId
    );
    const active = !get(account, "chatbot.active");
    let msg =
      "Você tem certeza que deseja desativar o chatbot para essa página?";
    if (active) {
      msg = "Você tem certeza que deseja ativar o chatbot para essa página?";
    }
    if (confirm(msg)) {
      Meteor.call(
        "campaigns.chatbot.activation",
        {
          campaignId,
          facebookAccountId,
          active
        },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            if (!active) {
              this._closeSettings(account);
            } else {
              this._openSettings(account);
            }
          }
        }
      );
    }
  };
  _handleSettingsClick = account => ev => {
    if (ev) {
      ev.preventDefault();
    }
    const { openSettings } = this.state;
    if (
      openSettings.indexOf(account.facebookId) == -1 &&
      this._isActive(account)
    ) {
      this._openSettings(account);
    } else {
      this._closeSettings(account);
    }
  };
  _openSettings = account => {
    const { openSettings } = this.state;
    if (openSettings.indexOf(account.facebookId) == -1) {
      this.setState({
        openSettings: [...openSettings, account.facebookId]
      });
    }
  };
  _closeSettings = account => {
    const { openSettings } = this.state;
    const newOpenSettings = openSettings.filter(
      id => id !== account.facebookId
    );
    this.setState({
      openSettings: newOpenSettings
    });
  };
  _isSettings = account => {
    const { openSettings } = this.state;
    return openSettings.indexOf(account.facebookId) !== -1;
  };
  _isActive = account => {
    return account.chatbot && account.chatbot.active;
  };
  _handleSubmit = account => ev => {
    ev.preventDefault();
  };
  render() {
    const { campaign } = this.props;
    if (campaign && campaign.accounts && campaign.accounts.length) {
      return (
        <Content>
          <AccountList>
            {campaign.accounts.map(account => (
              <li
                key={account._id}
                className={this._isActive(account) ? "enabled" : ""}
              >
                <header>
                  <h3>
                    <a
                      href="javascript:void(0);"
                      onClick={this._handleSettingsClick(account)}
                    >
                      {account.name}
                    </a>
                  </h3>
                  <a
                    href="javascript:void(0);"
                    className="toggle-chatbot"
                    onClick={this._handleActivationClick(account.facebookId)}
                  >
                    {this._isActive(account) ? (
                      <span>Desativar chatbot para esta página </span>
                    ) : (
                      <span>Ativar chatbot para esta página </span>
                    )}
                    <FontAwesomeIcon
                      icon={
                        this._isActive(account) ? "toggle-on" : "toggle-off"
                      }
                    />
                  </a>
                  <a
                    href="javascript:void(0);"
                    className="settings-link"
                    onClick={this._handleSettingsClick(account)}
                  >
                    Configurar
                  </a>
                </header>
                {this._isSettings(account) ? (
                  <section>
                    <form onSubmit={this._handleSubmit(account)}>
                      <textarea placeholder="Mensagem inicial" />
                      <input type="text" placeholder="Alguma coisa" />
                      <input type="submit" value="Atualizar configurações" />
                    </form>
                  </section>
                ) : null}
              </li>
            ))}
          </AccountList>
        </Content>
      );
    } else {
      return null;
    }
  }
}

export default ChatbotPage;

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
    display: flex;
    padding: 1rem 2rem;
    align-items: center;
    justify-content: space-between;
    h3 {
      margin: 0;
    }
    .toggle-chatbot {
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
        margin-left: 2rem;
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
          color: #ccc;
        }
      }
    }
  }
`;

class ChatbotPage extends Component {
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
            console.log(data);
          }
        }
      );
    }
  };
  render() {
    const { campaign } = this.props;
    if (campaign && campaign.accounts && campaign.accounts.length) {
      return (
        <Content>
          <AccountList>
            {campaign.accounts.map(account => (
              <li key={account._id}>
                <h3>{account.name}</h3>
                <a
                  href="javascript:void(0);"
                  className="toggle-chatbot"
                  onClick={this._handleActivationClick(account.facebookId)}
                >
                  {account.chatbot.active ? (
                    <span>Desativar chatbot para esta página </span>
                  ) : (
                    <span>Ativar chatbot para esta página </span>
                  )}
                  <FontAwesomeIcon
                    icon={account.chatbot.active ? "toggle-on" : "toggle-off"}
                  />
                </a>
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

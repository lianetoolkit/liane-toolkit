import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";

const Container = styled.ul`
  margin: 0 0 2rem;
  padding: 0 0 2px;
  list-style: none;
  border-radius: 7px;
  border: 1px solid #ddd;
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  li {
    flex: 1 1 40%;
    margin: 0.5rem;
    padding: 0;
    border: 1px solid #ddd;
    border-radius: 7px;
    display: flex;
    &.clear {
      border: 0;
    }
    a {
      flex: 1 1 100%;
      padding: 0.8rem 1.2rem;
      border-radius: 7px;
      margin: 0;
      color: #666;
      cursor: default;
      display: block;
      text-decoration: none;
      display: flex;
      justify-content: center;
      flex-direction: column;
      span.title {
        display: block;
        font-weight: 600;
        color: #333;
      }
    }
    &.disabled {
      a > span {
        color: #999;
      }
    }
    &:not(.disabled) {
      a {
        cursor: pointer;
      }
      a:focus,
      a:hover {
        background-color: #fff;
        color: #333;
      }
      a:active {
        background-color: #330066;
        span,
        span.title {
          color: #fff;
        }
      }
      &.selected {
        a {
          background-color: #330066;
          span,
          span.title {
            color: #fff;
          }
        }
      }
    }
  }
  .not-found {
    color: #999;
    font-style: italic;
    margin: 0;
    padding: 0.8rem 1.2rem;
  }
`;

function Item({ title, description, selected, onClick }) {
  let className = "";
  if (selected) className += " selected";
  if (!title || !description) {
    return <li className="clear" />;
  }
  return (
    <li className={className}>
      <a href="#" onClick={onClick}>
        <span className="title">{title}</span>
        <span>{description}</span>
      </a>
    </li>
  );
}

class DesireField extends Component {
  _handleClick = (option) => (ev) => {
    ev.preventDefault();
    const { name, value, onChange } = this.props;
    let result;
    if (value && value.length) {
      const index = value.findIndex((item) => item == option.key);
      if (index != -1) {
        result = [...value];
        result.splice(index, 1);
      } else {
        result = [...value, option.key];
      }
    } else {
      result = [option.key];
    }
    onChange && onChange({ target: { name, value: result } });
  };
  render() {
    const { value } = this.props;
    const options = [
      {
        key: "mobilize",
        title: "Mobilização de pessoas",
        description:
          "Atrair novos apoiadores, conhecer meus seguidores e aumentar o nível de engajamento.",
      },
      {
        key: "territory",
        title: "Organização de ações no território",
        description:
          "Planejar e gerenciar ações de rua com o apoio de um mapa.",
      },
      {
        key: "volunteer_donor",
        title: "Voluntários e Doadores",
        description:
          "Identificar potenciais voluntários e doadores em meio aos meus seguidores e entrar em contato com eles.",
      },
      {
        key: "crm",
        title: "CRM da Campanha",
        description:
          "Crescer, centralizar e gerir a base de contatos da campanha.",
      },
      {
        key: "social_media",
        title: "Mídias sociais",
        description:
          "Monitorar e responder comentários nas redes de forma mais ágil.",
      },
    ];
    return (
      <Container>
        {options.map((option) => (
          <Item
            key={option.key}
            title={option.title}
            description={option.description}
            selected={value && value.find((item) => item == option.key)}
            onClick={this._handleClick(option)}
          />
        ))}
        {options.length % 2 != 0 ? <Item /> : null}
      </Container>
    );
  }
}

export default DesireField;

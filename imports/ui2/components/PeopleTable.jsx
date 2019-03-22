import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { get, debounce } from "lodash";

import Table from "../components/Table.jsx";
import Popup from "../components/Popup.jsx";
import PersonMetaButtons from "../components/PersonMetaButtons.jsx";
import PersonSummary from "../components/PersonSummary.jsx";
import PersonReactions from "../components/PersonReactions.jsx";

const Container = styled.div`
  width: 100%;
  .meta-trigger {
    color: rgba(0, 0, 0, 0.25);
    padding: 0 0.5rem;
    &:hover {
      color: #000;
    }
  }
`;

const ContactIcons = styled.div`
  > * {
    margin: 0 0.5rem;
    opacity: 0.25;
    &.active {
      opacity: 1;
    }
  }
`;

const ExtraActions = styled.p`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.7em;
  background: #fff;
  padding: 1.1rem 0.75rem 0.5rem 0.5rem;
  a {
    display: inline-block;
    margin-left: 0.5rem;
    color: #6633cc;
  }
`;

const MetaCircles = styled.div`
  display: flex;
  width: 30px;
  align-items: center;
  justify-content: center;
  > span {
    width: 12px;
    height: 12px;
    position: relative;
    > span {
      position: absolute;
      left: 0;
      top: 0;
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 100%;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
    }
  }
`;
class PersonMetaCircles extends Component {
  render() {
    const { person } = this.props;
    return (
      <MetaCircles>
        {PersonMetaButtons.keys.map(key =>
          get(person, `campaignMeta.${key}`) ? (
            <span key={key}>
              <span
                style={{ backgroundColor: PersonMetaButtons.colors[key] }}
              />
            </span>
          ) : null
        )}
      </MetaCircles>
    );
  }
}

class PersonContactIcons extends Component {
  hasMeta(key) {
    const { person } = this.props;
    return !!(person.campaignMeta && get(person.campaignMeta, key));
  }
  filledForm() {
    const { person } = this.props;
    return person.filledForm;
  }
  render() {
    const { person } = this.props;
    if (person) {
      return (
        <ContactIcons>
          <FontAwesomeIcon
            icon="envelope"
            className={this.hasMeta("contact.email") ? "active" : ""}
          />
          <FontAwesomeIcon
            icon="phone"
            className={this.hasMeta("contact.cellphone") ? "active" : ""}
          />
          <FontAwesomeIcon
            icon="align-left"
            className={this.filledForm() ? "active" : ""}
          />
        </ContactIcons>
      );
    } else {
      return null;
    }
  }
}

export default class PeoplePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }
  componentDidMount() {
    this.container = document.getElementById("main");
    window.addEventListener("keydown", this._keydown);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this._keydown);
  }
  _keydown = ev => {
    const { people } = this.props;
    const { expanded } = this.state;
    let curIndex = -1;
    if (expanded) {
      curIndex = people.findIndex(p => {
        return p._id == expanded._id;
      });
    }
    let target = false;
    switch (ev.keyCode) {
      case 27:
        if (curIndex > -1) {
          this.setState({
            expanded: false
          });
        }
        break;
      case 40:
        ev.preventDefault();
        target = people[Math.min(curIndex + 1, people.length - 1)];
        break;
      case 38:
        ev.preventDefault();
        target = people[Math.max(curIndex - 1, 0)];
      default:
    }
    if (target) {
      this.setState({
        expanded: target
      });
      this.adjustScroll(target._id);
    }
  };
  adjustScroll = debounce(personId => {
    const containerOffset = this.container.getBoundingClientRect();
    const node = document.getElementById(`table-person-${personId}`);
    const nodeOffset = node.getBoundingClientRect();
    const nodeArea = nodeOffset.top + node.offsetHeight + 100;
    if (
      nodeArea < this.container.offsetHeight &&
      nodeOffset.top - containerOffset.top > 0
    ) {
      return;
    } else {
      this.container.scrollTop += nodeArea - this.container.offsetHeight / 2;
    }
  }, 100);
  _sumReactions(person) {
    let reactions = 0;
    if (person.counts) {
      for (let facebookAccountId in person.counts) {
        const count = person.counts[facebookAccountId].likes;
        if (!isNaN(count)) reactions += count;
      }
    }
    return reactions;
  }
  _sumComments(person) {
    let comments = 0;
    if (person.counts) {
      for (let facebookAccountId in person.counts) {
        const count = person.counts[facebookAccountId].comments;
        if (!isNaN(count)) comments += count;
      }
    }
    return comments;
  }
  _handleMetaButtonsChange = data => {
    if (this.props.onChange) {
      const { people } = this.props;
      const newPeople = people.map(p => {
        if (p._id == data.personId) {
          if (!p.campaignMeta) {
            p.campaignMeta = {};
          }
          p.campaignMeta[data.metaKey] = data.metaValue;
        }
        return p;
      });
      this.props.onChange(newPeople);
    }
  };
  expand = person => ev => {
    if (ev.target.nodeName == "A" || ev.target.closest("a")) {
      return false;
    }
    const { expanded } = this.state;
    if (expanded && expanded._id == person._id) {
      this.setState({
        expanded: false
      });
    } else {
      this.setState({
        expanded: person
      });
    }
  };
  isExpanded = person => {
    const { expanded } = this.state;
    return expanded && expanded._id == person._id;
  };
  hasMeta = person => {
    let has = false;
    for (let key of PersonMetaButtons.keys) {
      if (get(person, `campaignMeta.${key}`)) {
        has = true;
      }
    }
    return has;
  };
  render() {
    const { people } = this.props;
    const { expanded } = this.state;
    if (people && people.length) {
      return (
        <Container>
          <Table>
            <thead>
              <tr>
                <th />
                <th className="fill">Nome</th>
                <th>Reações</th>
                <th>Comentários</th>
                <th>Contatos</th>
                <th>Última interação</th>
              </tr>
            </thead>
            {people.map(person => (
              <tbody
                key={person._id}
                className={this.isExpanded(person) ? "active" : ""}
              >
                <tr
                  id={`table-person-${person._id}`}
                  className="interactive"
                  onClick={this.expand(person)}
                >
                  <td style={{ width: "20px", textAlign: "center" }}>
                    <Popup
                      trigger={
                        this.hasMeta(person) ? (
                          <PersonMetaCircles person={person} />
                        ) : (
                          <FontAwesomeIcon
                            icon="grip-horizontal"
                            className="meta-trigger"
                          />
                        )
                      }
                      direction="top left"
                      rounded
                    >
                      <PersonMetaButtons
                        person={person}
                        onChange={this._handleMetaButtonsChange}
                        interactive
                      />
                    </Popup>
                  </td>
                  <td className="fill highlight">
                    {person.name}
                    <ExtraActions className="show-on-hover">
                      <a href="javascript:void(0);">Perfil completo</a>
                      <a href="javascript:void(0);">Editar</a>
                      <a href="javascript:void(0);">Remover</a>
                    </ExtraActions>
                  </td>
                  <td className="small icon-number">
                    <FontAwesomeIcon icon="heart" />
                    <span className="number">{this._sumReactions(person)}</span>
                  </td>
                  <td className="small icon-number">
                    <FontAwesomeIcon icon="comment" />
                    <span className="number">{this._sumComments(person)}</span>
                  </td>
                  <td>
                    <PersonContactIcons person={person} />
                  </td>
                  <td className="small last">
                    {moment(person.lastInteractionDate).fromNow()}
                  </td>
                </tr>
                {this.isExpanded(person) ? (
                  <tr>
                    <td className="extra">
                      <PersonMetaButtons
                        person={person}
                        vertical
                        readOnly
                        simple
                      />
                    </td>
                    <td className="extra fill">
                      <PersonSummary person={person} />
                    </td>
                    <td className="extra" colSpan="4">
                      <PersonReactions person={person} />
                      <p>
                        <FontAwesomeIcon icon="comment" />{" "}
                        {this._sumComments(person)} comentários
                      </p>
                      <p>
                        <button>Enviar mensagem privada</button>
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            ))}
          </Table>
        </Container>
      );
    } else {
      return null;
    }
  }
}

import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { get, debounce } from "lodash";

import { modalStore } from "../containers/Modal.jsx";

import Table from "./Table.jsx";
import Button from "./Button.jsx";
import Popup from "./Popup.jsx";
import PopupLabel from "./PopupLabel.jsx";
import PersonMetaButtons from "./PersonMetaButtons.jsx";
import PersonSummary from "./PersonSummary.jsx";
import PersonReactions from "./PersonReactions.jsx";
import PersonEdit from "./PersonEdit.jsx";

const Container = styled.div`
  width: 100%;
  .extra-actions {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 0.7em;
    background: #fff;
    padding: 1.1rem 0.75rem 0.5rem 0.5rem;
    a {
      display: inline-block;
      margin-left: 0.5rem;
      color: #63c;
      &:hover,
      &:active,
      &:focus {
        color: #000;
      }
    }
  }
  .active .extra-actions {
    background: #fc0;
    a {
      color: #444;
      &:hover,
      &:active,
      &:focus {
        color: #000;
      }
    }
  }
  .meta-trigger {
    color: rgba(0, 0, 0, 0.25);
    padding: 0 0.5rem;
    &:hover {
      color: #000;
    }
  }
  .person-extra {
    .person-comment-count {
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      border-top: 1px solid #666;
      padding-top: 1rem;
      span {
        font-size: 1.2em;
        margin-right: 1rem;
        svg {
          margin-right: 1rem;
        }
      }
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

const MetaCircles = styled.div`
  display: flex;
  width: 30px;
  align-items: center;
  justify-content: center;
  .meta-circle-container {
    width: 12px;
    height: 12px;
    position: relative;
  }
  .meta-circle {
    position: absolute;
    left: 0;
    top: 0;
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 100%;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
  }
  &:hover .meta-circle {
      border-color: rgba(0, 0, 0, 0.5);
      ${"" /* box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5); */}
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
            <span key={key} className="meta-circle-container">
              <span
                className="meta-circle"
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

export default class PeopleTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }
  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    if (this.node.closest(".scrollable")) {
      this.container = this.node.closest(".scrollable");
    } else {
      this.container = document.getElementById("main");
    }
    window.addEventListener("keydown", this._handleKeydown);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this._handleKeydown);
  }
  _handleKeydown = ev => {
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
  _getReactions(person) {
    if (person.counts) {
      return person.counts.likes || 0;
    }
    return 0;
  }
  _getComments(person) {
    if (person.counts) {
      return person.counts.comments || 0;
    }
    return 0;
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
  _handleEditClick = person => ev => {
    ev.preventDefault();
    modalStore.setTitle(`Editando perfil de ${person.name}`);
    modalStore.set(<PersonEdit person={person} />);
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
  personCategoriesText = person => {
    let text = [];
    PersonMetaButtons.keys.map(key => {
      if (get(person, `campaignMeta.${key}`)) {
        text.push(PersonMetaButtons.labels[key]);
      }
    });
    return text.join(", ");
  };
  _handleSortClick = (key, defaultOrder = "desc") => () => {
    const { options, onSort } = this.props;
    const currentOrder = this.getSort(key);
    let order;
    if (!currentOrder) {
      order = defaultOrder;
    } else if (currentOrder != defaultOrder) {
      order = false;
    } else if (currentOrder == "asc") {
      order = "desc";
    } else if (currentOrder == "desc") {
      order = "asc";
    }
    if (onSort) {
      onSort(key, order);
    }
  };
  getSort = key => {
    const { options } = this.props;
    if (options["sort"] == key) {
      return options["order"];
    }
    return false;
  };
  render() {
    const { people, onChange, onSort, ...props } = this.props;
    const { expanded } = this.state;
    return (
      <Container>
        {people && people.length ? (
          <Table {...props}>
            <thead>
              <tr>
                <th />
                <Table.SortableHead
                  className="fill"
                  onClick={this._handleSortClick("name", "asc")}
                  sorted={this.getSort("name")}
                >
                  Nome
                </Table.SortableHead>
                <Table.SortableHead
                  onClick={this._handleSortClick("likes")}
                  sorted={this.getSort("likes")}
                >
                  Reações
                </Table.SortableHead>
                <Table.SortableHead
                  onClick={this._handleSortClick("comments")}
                  sorted={this.getSort("comments")}
                >
                  Comentários
                </Table.SortableHead>
                <th>Contatos</th>
                <Table.SortableHead
                  onClick={this._handleSortClick("lastInteraction")}
                  sorted={this.getSort("lastInteraction")}
                >
                  Última interação
                </Table.SortableHead>
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
                      trigger={open =>
                        this.hasMeta(person) ? (
                          <PopupLabel
                            text={this.personCategoriesText(person)}
                            extra={"Clique para editar"}
                            disabled={open}
                          >
                            <PersonMetaCircles person={person} />
                          </PopupLabel>
                        ) : (
                          <PopupLabel text="Editar categorias" disabled={open}>
                            <FontAwesomeIcon
                              icon="grip-horizontal"
                              className="meta-trigger"
                            />
                          </PopupLabel>
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
                    <p className="extra-actions show-on-hover">
                      <a href="javascript:void(0);">Acessar perfil</a>
                      <a
                        href="javascript:void(0);"
                        onClick={this._handleEditClick(person)}
                      >
                        Editar
                      </a>
                      <a href="javascript:void(0);">Remover</a>
                    </p>
                  </td>
                  <td className="small icon-number">
                    <FontAwesomeIcon icon="hand-pointer" />
                    <span className="number">{this._getReactions(person)}</span>
                  </td>
                  <td className="small icon-number">
                    <FontAwesomeIcon icon="comment" />
                    <span className="number">{this._getComments(person)}</span>
                  </td>
                  <td>
                    <PersonContactIcons person={person} />
                  </td>
                  <td className="small last">
                    {person.lastInteractionDate
                      ? moment(person.lastInteractionDate).fromNow()
                      : "--"}
                  </td>
                </tr>
                {this.isExpanded(person) ? (
                  <tr className="person-extra">
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
                      <div className="person-reactions">
                        <PersonReactions person={person} />
                      </div>
                      <p className="person-comment-count">
                        <span>
                          <FontAwesomeIcon icon="comment" />{" "}
                          {this._getComments(person)} comentários
                        </span>
                        <Button light>Enviar mensagem privada</Button>
                      </p>
                      <p className="person-buttons" />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            ))}
          </Table>
        ) : null}
      </Container>
    );
  }
}

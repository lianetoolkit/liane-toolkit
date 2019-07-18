import React, { Component } from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { get, debounce } from "lodash";

import { modalStore } from "../containers/Modal.jsx";

import Table from "./Table.jsx";
import Button from "./Button.jsx";
import CopyToClipboard from "./CopyToClipboard.jsx";
import Popup from "./Popup.jsx";
import PersonMetaButtons from "./PersonMetaButtons.jsx";
import PersonSummary from "./PersonSummary.jsx";
import PersonReactions from "./PersonReactions.jsx";
import PersonEdit from "./PersonEdit.jsx";
import PersonContactIcons from "./PersonContactIcons.jsx";
import Reply from "./Reply.jsx";

const Container = styled.div`
  width: 100%;
  .extra-actions {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 0.7em;
    background: #fff;
    padding: 1.1rem 0.75rem 0.5rem 0.5rem;
    margin: 0;
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
    background: transparent;
    position: static;
    display: block;
    padding: 0;
    margin-bottom: 0.2rem;
    a {
      margin-left: 0;
      margin-right: 0.5rem;
      color: rgba(0, 0, 0, 0.4);
      &:hover,
      &:active,
      &:focus {
        color: #000;
      }
    }
  }
  .active .person-name {
    font-weight: 600;
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
    }
  }
`;
class PersonMetaCircles extends Component {
  render() {
    const { person, ...props } = this.props;
    return (
      <MetaCircles {...props}>
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

export default class PeopleTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }
  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    if (this.props.scrollable) {
      this.container = this.node;
    } else {
      if (this.node.closest(".scrollable")) {
        this.container = this.node.closest(".scrollable");
      } else {
        this.container = document.getElementById("main");
      }
    }
    window.addEventListener("keydown", this._handleKeydown);
  }
  componentDidUpdate(prevProps) {
    if (
      this.container &&
      JSON.stringify(prevProps.people) != JSON.stringify(this.props.people)
    ) {
      this.container.scrollTop = 0;
    }
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
    if (document.activeElement && document.activeElement.contains(this.node)) {
      console.log(ev.keyCode);
      switch (ev.keyCode) {
        case 27: // esc
          if (curIndex > -1) {
            this.setState({
              expanded: false
            });
          }
          break;
        case 40: // arrow down
          ev.preventDefault();
          target = people[Math.min(curIndex + 1, people.length - 1)];
          break;
        case 38: // arrow up
          ev.preventDefault();
          target = people[Math.max(curIndex - 1, 0)];
          break;
        case 69: // (e)dit
          if (curIndex > -1) {
            modalStore.setTitle(`Editando perfil de ${people[curIndex].name}`);
            modalStore.set(
              <PersonEdit
                person={people[curIndex]}
                onSuccess={this._handleEditSuccess}
              />
            );
          }
          break;
        case 13: // (Enter) access profile
          if (curIndex > -1) {
            FlowRouter.go("App.people.detail", {
              personId: people[curIndex]._id
            });
          }
        default:
      }
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
  _handleEditSuccess = person => {
    if (this.props.onChange) {
      const { people } = this.props;
      const newPeople = people.map(p => {
        if (p._id == person._id) {
          return person;
        }
        return p;
      });
      this.props.onChange(newPeople);
    }
  };
  _handleEditClick = person => ev => {
    ev.preventDefault();
    modalStore.setTitle(`Editando perfil de ${person.name}`);
    modalStore.set(
      <PersonEdit person={person} onSuccess={this._handleEditSuccess} />
    );
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
  _handlePrivateReplyClick = person => ev => {
    ev.preventDefault();
    modalStore.setTitle(`Enviando mensagem privada para ${person.name}`);
    modalStore.set(<Reply personId={person._id} messageOnly={true} />);
  };
  render() {
    const { people, onChange, onSort, ...props } = this.props;
    const { expanded } = this.state;
    return (
      <Container className="people-table">
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
                      trigger={open => (
                        <div data-tip data-for={`person-meta-${person._id}`}>
                          {this.hasMeta(person) ? (
                            <PersonMetaCircles person={person} />
                          ) : (
                            <FontAwesomeIcon
                              icon="grip-horizontal"
                              className="meta-trigger"
                            />
                          )}
                        </div>
                      )}
                      direction="top left"
                      rounded
                    >
                      <PersonMetaButtons
                        person={person}
                        onChange={this._handleMetaButtonsChange}
                        interactive
                      />
                    </Popup>
                    <ReactTooltip
                      id={`person-meta-${person._id}`}
                      aria-haspopup="true"
                      place="left"
                      effect="solid"
                    >
                      {this.hasMeta(person)
                        ? this.personCategoriesText(person)
                        : "Editar categorias"}
                    </ReactTooltip>
                  </td>
                  <td className="fill highlight">
                    <p className="extra-actions show-on-hover">
                      <a
                        href={FlowRouter.path("App.people.detail", {
                          personId: person._id
                        })}
                      >
                        Acessar perfil
                      </a>
                      <a
                        href="javascript:void(0);"
                        onClick={this._handleEditClick(person)}
                      >
                        Editar
                      </a>
                    </p>
                    <span className="person-name">{person.name}</span>
                  </td>
                  <td className="small icon-number">
                    <FontAwesomeIcon icon="dot-circle" />
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
                      <PersonSummary person={person} tags={this.props.tags} />
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
                        {person.canReceivePrivateReply &&
                        person.canReceivePrivateReply.length ? (
                          <Button
                            light
                            onClick={this._handlePrivateReplyClick(person)}
                          >
                            Enviar mensagem privada
                          </Button>
                        ) : null}
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

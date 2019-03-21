import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { get } from "lodash";

import Page from "../components/Page.jsx";
import Content from "../components/Content.jsx";
import Table from "../components/Table.jsx";
import Popup from "../components/Popup.jsx";
import PersonMetaButtons from "../components/PersonMetaButtons.jsx";
import PersonSummary from "../components/PersonSummary.jsx";
import PersonReactions from "../components/PersonReactions.jsx";

const MetaIndicatorContainer = styled.div`
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

class PersonMetaIndicator extends Component {
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
        <MetaIndicatorContainer>
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
        </MetaIndicatorContainer>
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
      firstFetch: false,
      people: []
    };
  }
  componentDidMount() {
    this.fetchPeople();
  }
  componentDidUpdate() {
    // const { campaignId } = this.props;
    // const { firstFetch } = this.state;
    // if (!firstFetch && campaignId) {
    //   this.fetchPeople();
    // }
  }
  fetchPeople(query = {}, options = {}) {
    const { campaignId } = this.props;
    if (campaignId) {
      Meteor.call(
        "people.search",
        {
          campaignId,
          query,
          options
        },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            this.setState({ people: data, firstFetch: true });
          }
        }
      );
    }
  }
  _sumReactions(person) {
    let reactions = 0;
    if (person.counts) {
      for (let facebookAccountId in person.counts)
        reactions += person.counts[facebookAccountId].likes;
    }
    return reactions;
  }
  _sumComments(person) {
    let comments = 0;
    if (person.counts) {
      for (let facebookAccountId in person.counts)
        if (person.counts[facebookAccountId].comments)
          comments += person.counts[facebookAccountId].comments;
    }
    return comments;
  }
  _handleMetaButtonsChange = data => {
    const { people } = this.state;
    const newPeople = people.map(p => {
      if (p._id == data.personId) {
        if (!p.campaignMeta) {
          p.campaignMeta = {};
        }
        p.campaignMeta[data.metaKey] = data.metaValue;
      }
      return p;
    });
    this.setState({
      people: newPeople
    });
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
  render() {
    const { people, expanded } = this.state;
    if (people && people.length) {
      return (
        <Content>
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
                <tr className="interactive" onClick={this.expand(person)}>
                  <td>
                    <Popup
                      trigger={<FontAwesomeIcon icon="grip-horizontal" />}
                      direction="top left"
                    >
                      <PersonMetaButtons
                        person={person}
                        onChange={this._handleMetaButtonsChange}
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
                    <PersonMetaIndicator person={person} />
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
                        vertical={true}
                        readOnly={true}
                        simple={true}
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
        </Content>
      );
    } else {
      return null;
    }
  }
}

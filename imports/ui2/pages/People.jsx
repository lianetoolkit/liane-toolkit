import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Page from "../components/Page.jsx";
import Content from "../components/Content.jsx";
import Table from "../components/Table.jsx";
import PersonSummary from "../components/PersonSummary.jsx";
import moment from "moment";

const MetaIndicatorContainer = styled.div`
  > * {
    margin: 0 0.5rem;
    opacity: 0.25;
    &.active {
      opacity: 1;
    }
  }
`;

class PersonMetaIndicator extends Component {
  hasMeta(key) {
    const { person } = this.props;
    return !!(person.campaignMeta && person.campaignMeta[key]);
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
            className={this.hasMeta("email") ? "active" : ""}
          />
          <FontAwesomeIcon
            icon="phone"
            className={this.hasMeta("phone") ? "active" : ""}
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
  expand = person => () => {
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
              <tbody key={person._id}>
                <tr className="interactive" onClick={this.expand(person)}>
                  <td>
                    <FontAwesomeIcon icon="grip-horizontal" />
                  </td>
                  <td className="fill highlight">{person.name}</td>
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
                {expanded && expanded._id == person._id ? (
                  <tr>
                    <td className="extra" />
                    <td className="extra" colSpan="5">
                      <PersonSummary perosn={person} />
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

import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { get, debounce } from "lodash";

import { userCan } from "/imports/ui2/utils/permissions";

import { modalStore } from "../containers/Modal.jsx";

import Table from "./Table.jsx";
import Button from "./Button.jsx";
import CopyToClipboard from "./CopyToClipboard.jsx";
import Popup from "./Popup.jsx";
import PersonStarredButton from "./PersonStarredButton.jsx";
import PersonMetaButtons, {
  labels as personMetaLabels,
} from "./PersonMetaButtons.jsx";
import PersonSummary from "./PersonSummary.jsx";
import PersonReactions from "./PersonReactions.jsx";
import PersonEdit from "./PersonEdit.jsx";
import PersonSocialNetworkIcons from "./PersonSocialNetworkIcons.jsx";
import PersonContactIcons from "./PersonContactIcons.jsx";
import PersonTags from "./PersonTags.jsx";
import Reply from "./Reply.jsx";
import { getFBCommentUrl } from "./Comment.jsx";

const messages = defineMessages({
  editingPersonTitle: {
    id: "app.people.edit.title",
    defaultMessage: "Editing {name}",
  },
  sendingPrivateReplyTitle: {
    id: "app.people.sending_pr.title",
    defaultMessage: "Sending private reply to {name}",
  },
  editCategories: {
    id: "app.people.table_body.edit_categories",
    defaultMessage: "Edit categories",
  },
});

const Container = styled.div`
  width: 100%;
  .person-tags {
    margin-left: 1rem;
    font-size: 0.7em;
    svg {
      font-size: 0.8em;
      color: #ccc;
      margin-right: 0.5rem;
    }
    .tag-item {
      background: #f0f0f0;
      color: #666;
      border-radius: 7px;
      padding: 0.2rem 0.4rem;
      margin-right: 0.25rem;
    }
  }
  .name-cell {
    display: flex;
    > .person-name {
      flex: 1 1 100%;
    }
    > * {
      flex: 0 0 auto;
    }
  }
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
  .person-reactions {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0 1rem;
    p {
      margin: 0 1.5rem 0 0;
      font-weight: 600;
    }
    ul {
      width: auto;
      margin: 0;
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
      padding: 0;
      margin: 0;
      .count-label {
        font-size: 1.2em;
        margin: 1rem 1rem 1rem 0;
        svg {
          margin-right: 0.5rem;
        }
      }
      .comments-counts {
        .count-item {
          margin: 0 0.5rem;
        }
      }
      .button {
        text-align: center;
        margin: 1rem 0;
        padding: 0.5rem;
      }
      .latest-comment {
        font-size: 0.9em;
        margin: 1rem 0 1rem 1rem;
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
        {PersonMetaButtons.keys.map((key) =>
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

function PersonCommentCount({ person }) {
  const distributed = !!person.counts?.facebook;
  if (distributed) {
    const facebook = person.counts?.facebook?.comments || 0;
    const instagram = person.counts?.instagram?.comments || 0;
    return (
      <span className="comments-counts">
        <a
          href={FlowRouter.path(
            "App.people.detail",
            {
              personId: person._id,
            },
            {
              section: "comments",
            }
          )}
        >
          {facebook ? (
            <span className="count-item">
              <FontAwesomeIcon icon={["fab", "facebook-square"]} />{" "}
              <FormattedMessage
                id="app.people.table_body.comment_count"
                defaultMessage="{amount} comments"
                values={{
                  amount: facebook,
                }}
              />{" "}
            </span>
          ) : null}
          {instagram ? (
            <span className="count-item">
              <FontAwesomeIcon icon={["fab", "instagram"]} />{" "}
              <FormattedMessage
                id="app.people.table_body.comment_count"
                defaultMessage="{amount} comments"
                values={{
                  amount: instagram,
                }}
              />
            </span>
          ) : null}
        </a>
      </span>
    );
  }
  return (
    <>
      <FontAwesomeIcon icon="comment" />{" "}
      <FormattedMessage
        id="app.people.table_body.comment_count"
        defaultMessage="{amount} comments"
        values={{
          amount: person.counts?.comments || 0,
        }}
      />
    </>
  );
}

class PeopleTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
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
  _handleKeydown = (ev) => {
    const { people } = this.props;
    const { expanded } = this.state;
    let curIndex = -1;
    if (expanded) {
      curIndex = people.findIndex((p) => {
        return p._id == expanded._id;
      });
    }
    let target = false;
    if (document.activeElement && document.activeElement.contains(this.node)) {
      switch (ev.keyCode) {
        case 27: // esc
          if (curIndex > -1) {
            this.setState({
              expanded: false,
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
            modalStore.setTitle(`Editing ${people[curIndex].name}`);
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
              personId: people[curIndex]._id,
            });
          }
        default:
      }
    }
    if (target) {
      this.setState({
        expanded: target,
      });
      this.adjustScroll(target._id);
    }
  };
  adjustScroll = debounce((personId) => {
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
    return person.counts?.facebook?.likes || person.counts?.likes || 0;
  }
  _getComments(person) {
    return person.counts?.comments || 0;
  }
  _handleMetaButtonsChange = (data) => {
    if (this.props.onChange) {
      const { people } = this.props;
      const newPeople = people.map((p) => {
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
  _handleEditSuccess = (person) => {
    if (this.props.onChange) {
      const { people } = this.props;
      const newPeople = people.map((p) => {
        if (p._id == person._id) {
          return { ...p, ...person };
        }
        return p;
      });
      this.props.onChange(newPeople);
    }
  };
  _handleEditClick = (person) => (ev) => {
    const { intl, campaign } = this.props;
    ev.preventDefault();
    modalStore.setTitle(
      intl.formatMessage(messages.editingPersonTitle, { name: person.name })
    );
    modalStore.set(
      <PersonEdit
        campaign={campaign}
        person={person}
        onSuccess={this._handleEditSuccess}
      />
    );
  };
  expand = (person) => (ev) => {
    if (ev.target.nodeName == "A" || ev.target.closest("a")) {
      return false;
    }
    ev.preventDefault();
    ev.stopPropagation();
    const { expanded } = this.state;
    if (expanded && expanded._id == person._id) {
      this.setState({
        expanded: false,
      });
    } else {
      this.setState({
        expanded: person,
      });
    }
  };
  isExpanded = (person) => {
    const { expanded } = this.state;
    return expanded && expanded._id == person._id;
  };
  hasMeta = (person) => {
    let has = false;
    for (let key of PersonMetaButtons.keys) {
      if (get(person, `campaignMeta.${key}`)) {
        has = true;
      }
    }
    return has;
  };
  personCategoriesText = (person) => {
    const { intl } = this.props;
    let text = [];
    PersonMetaButtons.keys.map((key) => {
      if (get(person, `campaignMeta.${key}`)) {
        text.push(intl.formatMessage(personMetaLabels[key]));
      }
    });
    return text.join(", ");
  };
  _handleSortClick =
    (key, defaultOrder = "desc") =>
    () => {
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
  getSort = (key) => {
    const { options } = this.props;
    if (options["sort"] == key) {
      return options["order"];
    }
    return false;
  };
  _handlePrivateReplyClick = (person) => (ev) => {
    const { intl } = this.props;
    ev.preventDefault();
    modalStore.setTitle(
      intl.formatMessage(messages.sendingPrivateReplyTitle, {
        name: person.name,
      })
    );
    modalStore.set(<Reply personId={person._id} messageOnly={true} />);
  };
  getTags(person) {
    const { tags } = this.props;
    const personTags = get(person, "campaignMeta.basic_info.tags");
    if (personTags && personTags.length && tags && tags.length) {
      return tags
        .filter((tag) => personTags.indexOf(tag._id) !== -1)
        .map((tag) => tag.name);
    }
    return [];
  }
  hasReactions(person) {
    if (!person.counts?.facebook?.reactions && !person.counts?.reactions)
      return;
    const reactions =
      person.counts?.facebook?.reactions || person.counts?.reactions;
    let total = 0;
    for (const reaction in reactions) {
      total += reactions[reaction];
    }
    return !!total;
  }
  render() {
    const { intl, people, tags, onChange, onSort, ...props } = this.props;
    return (
      <Container className="people-table">
        {people && people.length ? (
          <Table {...props}>
            <thead>
              <tr>
                <th colSpan="2" />
                <Table.SortableHead
                  className="fill"
                  onClick={this._handleSortClick("name", "asc")}
                  sorted={this.getSort("name")}
                  colSpan="2"
                >
                  <FormattedMessage
                    id="app.people.table_header.name"
                    defaultMessage="Name"
                  />
                </Table.SortableHead>
                <Table.SortableHead
                  onClick={this._handleSortClick("likes")}
                  sorted={this.getSort("likes")}
                >
                  <FontAwesomeIcon
                    className="th-icon"
                    icon={["fab", "facebook-square"]}
                  />
                  <FormattedMessage
                    id="app.people.table_header.reactions"
                    defaultMessage="Reactions"
                  />
                </Table.SortableHead>
                <Table.SortableHead
                  onClick={this._handleSortClick("comments")}
                  sorted={this.getSort("comments")}
                >
                  <FormattedMessage
                    id="app.people.table_header.comments"
                    defaultMessage="Comments"
                  />
                </Table.SortableHead>
                <th>
                  <FormattedMessage
                    id="app.people.table_header.contact"
                    defaultMessage="Contact"
                  />
                </th>
                <Table.SortableHead
                  onClick={this._handleSortClick("lastInteraction")}
                  sorted={this.getSort("lastInteraction")}
                >
                  <FormattedMessage
                    id="app.people.table_header.last_interaction"
                    defaultMessage="Last interaction"
                  />
                </Table.SortableHead>
              </tr>
            </thead>
            {people.map((person) => (
              <tbody
                key={person._id}
                className={this.isExpanded(person) ? "active" : ""}
              >
                <tr
                  id={`table-person-${person._id}`}
                  className="interactive"
                  onClick={this.expand(person)}
                >
                  <td style={{ borderRight: 0, paddingRight: 0 }}>
                    <PersonStarredButton
                      readOnly={!userCan("categorize", "people")}
                      person={person}
                      onChange={this._handleMetaButtonsChange}
                    />
                  </td>
                  <td style={{ width: "20px", textAlign: "center" }}>
                    {userCan("categorize", "people") ? (
                      <Popup
                        trigger={(open) => (
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
                    ) : (
                      <div data-tip data-for={`person-meta-${person._id}`}>
                        <PersonMetaCircles person={person} />
                      </div>
                    )}
                    {this.hasMeta(person) || userCan("categorize", "people") ? (
                      <ReactTooltip
                        id={`person-meta-${person._id}`}
                        aria-haspopup="true"
                        place="bottom"
                        effect="solid"
                      >
                        {this.hasMeta(person)
                          ? this.personCategoriesText(person)
                          : intl.formatMessage(messages.editCategories)}
                      </ReactTooltip>
                    ) : null}
                  </td>
                  <td className="fill highlight" style={{ borderRight: 0 }}>
                    <p className="extra-actions show-on-hover">
                      <a
                        href={FlowRouter.path("App.people.detail", {
                          personId: person._id,
                        })}
                      >
                        <FormattedMessage
                          id="app.people.table_body.access_profile"
                          defaultMessage="Access profile"
                        />
                      </a>
                      {userCan("edit", "people") ? (
                        <a
                          href="javascript:void(0);"
                          onClick={this._handleEditClick(person)}
                        >
                          <FormattedMessage
                            id="app.people.table_body.edit"
                            defaultMessage="Edit"
                          />
                        </a>
                      ) : null}
                    </p>
                    <span className="person-name">
                      {person.name}
                      {!this.isExpanded(person) ? (
                        <PersonTags tags={tags} person={person} />
                      ) : null}
                    </span>
                  </td>
                  <td>
                    <PersonSocialNetworkIcons person={person} />
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
                    <td className="extra" colSpan="2">
                      <PersonMetaButtons
                        person={person}
                        vertical
                        readOnly
                        simple
                      />
                    </td>
                    <td className="extra fill" colSpan="1">
                      <PersonSummary
                        person={person}
                        tags={this.props.tags}
                        onUpdate={this._handleEditSuccess}
                      />
                    </td>
                    <td className="extra" colSpan="5">
                      {this.hasReactions(person) ? (
                        <div className="person-reactions">
                          <p>
                            <FormattedMessage
                              id="app.people.table_body.facebook_reactions"
                              defaultMessage="Facebook reactions:"
                            />
                          </p>
                          <PersonReactions person={person} />
                        </div>
                      ) : null}
                      <p className="person-comment-count">
                        <span className="count-label">
                          <PersonCommentCount person={person} />
                        </span>
                        {userCan("edit", "comments") &&
                        person.canReceivePrivateReply &&
                        person.canReceivePrivateReply.length ? (
                          <Button
                            light
                            onClick={this._handlePrivateReplyClick(person)}
                          >
                            <FormattedMessage
                              id="app.people.table_body.private_reply_button"
                              defaultMessage="Send private reply"
                            />
                          </Button>
                        ) : null}
                        {person.latestComment ? (
                          <a
                            href={getFBCommentUrl(person.latestComment)}
                            target="_blank"
                            rel="external"
                            className="latest-comment"
                          >
                            <FontAwesomeIcon
                              icon={["fab", "facebook-square"]}
                            />{" "}
                            <FormattedMessage
                              id="app.people.table_body.latest_comment_label"
                              defaultMessage="Go to latest comment"
                            />
                          </a>
                        ) : null}
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            ))}
          </Table>
        ) : null}
        <ReactTooltip
          id="people-table-header-tip"
          aria-haspopup="true"
          place="top"
          effect="solid"
        />
      </Container>
    );
  }
}

PeopleTable.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PeopleTable);

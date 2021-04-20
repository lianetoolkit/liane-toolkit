import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { userCan } from "/imports/ui2/utils/permissions";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import Page from "../components/Page.jsx";
import Table from "../components/Table.jsx";
import Button from "../components/Button.jsx";

import PersonStarredButton from "../components/PersonStarredButton.jsx";
import PersonMetaButtons from "../components/PersonMetaButtons.jsx";
import PersonFormInfo from "../components/PersonFormInfo.jsx";
import PersonReactions from "../components/PersonReactions.jsx";
import PersonSummary from "../components/PersonSummary.jsx";
import PersonInfoTable from "../components/PersonInfoTable.jsx";

import PersonEdit from "../components/PersonEdit.jsx";
import Reply from "../components/Reply.jsx";

import CommentList from "../components/CommentList.jsx";
import PersonReactionList from "../components/PersonReactionList.jsx";

const messages = defineMessages({
  formSource: {
    id: "app.people.profile.form_source_label",
    defaultMessage: "Form",
  },
  unknownImportSource: {
    id: "app.people.profile.unknown_import_source_label",
    defaultMessage: "Unknown import",
  },
  unknownSource: {
    id: "app.people.profile.unknown_source_label",
    defaultMessage: "Unknown",
  },
  replyTitle: {
    id: "app.people.profile.reply_title",
    defaultMessage: "Sending private reply to {name}",
  },
  removeConfirm: {
    id: "app.people.profile.remove_confirm",
    defaultMessage:
      "Are you sure you'd like to remove {name} profile? This action is irreversible",
  },
});

const Container = styled.div`
  width: 100%;
  display: flex;
  .nav-content {
    a {
      svg {
        margin-right: 1rem;
      }
    }
  }
  .person-container {
    flex: 1 1 100%;
    display: flex;
    flex-direction: column;
    .person-content {
      flex: 1 1 100%;
      background: #fff;
      overflow: auto;
    }
  }
  header.person-header {
    flex: 0 0 auto;
    display: flex;
    justify-content: space-between;
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid #ddd;
    flex-wrap: wrap;
    .main-info {
      flex: 1 1 auto;
      h1 {
        margin: 0;
      }
      ul {
        margin: 0 -0.5rem;
        padding: 0;
        list-style: none;
        font-size: 0.75em;
        color: #666;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        li {
          flex: 0 0 auto;
          margin: 0 0.5rem 1rem;
          &.contained {
            background: #fff;
            border-radius: 7px;
            padding: 0.2rem 0.4rem;
          }
          &.highlight {
            color: #000;
            font-weight: 600;
            display: flex;
          }
          .person-meta-buttons {
            a {
              margin-right: 1rem;
              svg {
                margin-right: 0.5rem;
              }
            }
          }
        }
      }
    }
  }
`;

const InformationContainer = styled.section`
  padding: 2rem;
  .person-summary {
    display: flex;
    width: 100%;
    align-items: center;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #eee;
    color: #333;
    font-size: 0.9em;
    justify-content: space-between;
    li {
      border-width: 0;
      margin: 0 2rem 1rem 0;
      padding: 0;
      svg {
        color: #63c;
      }
      .copy {
        font-size: 0.8em;
        svg {
          color: #ccc;
        }
      }
      &:first-child {
        font-size: 1.1em;
      }
      .select-search__control .select-search__multi-value__label {
        color: #333;
      }
    }
  }
  .interactions {
    display: flex;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    justify-content: space-between;
    .person-reactions-count {
      margin-right: 2rem;
      width: auto;
      flex: 1 1 auto;
      justify-content: flex-start;
      margin-bottom: 1rem;
      li {
        margin-right: 2rem;
      }
    }
    .person-comment-count {
      flex: 1 1 auto;
      margin-bottom: 1rem;
      font-size: 0.9em;
      svg {
        margin-right: 1rem;
        color: #999;
      }
      .button {
        margin-left: 1rem;
      }
    }
  }
`;

class Information extends Component {
  _getComments() {
    const { person } = this.props;
    if (person.counts) {
      return person.counts.comments || 0;
    }
    return 0;
  }
  _handlePrivateReplyClick = (ev) => {
    const { intl, person } = this.props;
    ev.preventDefault();
    modalStore.setTitle(
      intl.formatMessage(messages.replyTitle, { name: person.name })
    );
    modalStore.set(<Reply personId={person._id} messageOnly={true} />);
  };
  render() {
    const { person, tags } = this.props;
    return (
      <InformationContainer>
        <PersonSummary
          person={person}
          tags={tags}
          hideIfEmpty={{
            tags: true,
          }}
        />
        <div className="interactions">
          <PersonReactions person={person} />
          <p className="person-comment-count">
            <span>
              <FontAwesomeIcon icon="comment" />{" "}
              <FormattedMessage
                id="app.people.profile.comment_count_text"
                defaultMessage="{count} comment(s)"
                values={{ count: this._getComments() }}
              />
            </span>
            {person.canReceivePrivateReply &&
            person.canReceivePrivateReply.length ? (
              <Button light onClick={this._handlePrivateReplyClick}>
                <FormattedMessage
                  id="app.people.profile.send_reply_text"
                  defaultMessage="Send private reply"
                />
              </Button>
            ) : null}
          </p>
        </div>
        <PersonFormInfo person={person} />
        <PersonInfoTable person={person} />
      </InformationContainer>
    );
  }
}

Information.propTypes = {
  intl: intlShape.isRequired,
};

const InformationIntl = injectIntl(Information);

const CommentsContainer = styled.section``;

class Comments extends Component {
  render() {
    const { campaignId, comments } = this.props;
    return (
      <CommentsContainer>
        <CommentList campaignId={campaignId} comments={comments} />
      </CommentsContainer>
    );
  }
}

class PeopleSingle extends Component {
  _handleEditClick = (ev) => {
    const { campaign, person } = this.props;
    ev.preventDefault();
    modalStore.setTitle(`Editing ${person.name}`);
    modalStore.set(
      <PersonEdit
        campaign={campaign}
        person={person}
        onSuccess={this._handleEditSuccess}
      />
    );
  };
  _handleRemoveClick = (ev) => {
    ev.preventDefault();
    const { intl, person } = this.props;
    if (
      confirm(intl.formatMessage(messages.removeConfirm, { name: person.name }))
    ) {
      Meteor.call("people.remove", { personId: person._id }, (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          FlowRouter.go("/people");
          alertStore.add(null, "success");
        }
      });
    }
  };
  _getSource = () => {
    const { intl, person, lists } = this.props;
    switch (person.source) {
      case "facebook":
        return "Facebook";
      case "instagram":
        return "Instagram";
      case "form":
        return intl.formatMessage(messages.formSource);
      case "import":
        const list = lists.find((l) => l._id == person.listId);
        if (list) {
          return list.name;
        }
        return intl.formatMessage(messages.unknownImportSource);
      default:
        return intl.formatMessage(messages.unknownSource);
    }
  };
  _handleEditSuccess = () => {};
  render() {
    const { campaignId, person, tags, comments, section } = this.props;
    if (person) {
      return (
        <Container>
          <Page.Nav padded full>
            <a href={FlowRouter.path("App.people")}>
              <FontAwesomeIcon icon="chevron-left" />{" "}
              <FormattedMessage
                id="app.people.profile.nav.back_label"
                defaultMessage="Back to the directory"
              />
            </a>
            <a
              href={FlowRouter.path(
                "App.people.detail",
                { personId: person._id },
                { section: null }
              )}
              className={!section ? "active" : ""}
            >
              <FormattedMessage
                id="app.people.profile.nav.profile_label"
                defaultMessage="Profile"
              />
            </a>
            <a
              href={FlowRouter.path(
                "App.people.detail",
                { personId: person._id },
                { section: "reactions" }
              )}
              className={section == "reactions" ? "active" : ""}
            >
              <FormattedMessage
                id="app.people.profile.nav.reactions_label"
                defaultMessage="Reactions"
              />
            </a>
            {userCan("view", "comments") ? (
              <a
                href={FlowRouter.path(
                  "App.people.detail",
                  { personId: person._id },
                  { section: "comments" }
                )}
                className={section == "comments" ? "active" : ""}
              >
                <FormattedMessage
                  id="app.people.profile.nav.comments_label"
                  defaultMessage="Comments"
                />
              </a>
            ) : null}
            {userCan("edit", "people") ? (
              <a href="javascript:void(0);" onClick={this._handleEditClick}>
                <FormattedMessage
                  id="app.people.profile.nav.edit_label"
                  defaultMessage="Edit profile"
                />
              </a>
            ) : null}
            {userCan("edit", "people") ? (
              <a href="javascript:void(0);" onClick={this._handleRemoveClick}>
                <FormattedMessage
                  id="app.people.profile.nav.remove_label"
                  defaultMessage="Remove profile"
                />
              </a>
            ) : null}
          </Page.Nav>
          <div className="person-container">
            <header className="person-header">
              <div className="main-info">
                <h1>{person.name}</h1>
                <ul>
                  <li className="contained">
                    <FormattedMessage
                      id="app.people.profile.source_text"
                      defaultMessage="Source: {source}"
                      values={{ source: this._getSource() }}
                    />
                  </li>
                  <li className="highlight">
                    <PersonStarredButton
                      readOnly={!userCan("categorize", "people")}
                      person={person}
                      simple
                      text
                    />
                    <PersonMetaButtons person={person} readOnly simple text />
                  </li>
                </ul>
              </div>
              {userCan("categorize", "people") ? (
                <PersonMetaButtons person={person} />
              ) : null}
            </header>
            <div className="person-content">
              {!section ? (
                <InformationIntl person={person} tags={tags} />
              ) : null}
              {section == "reactions" ? (
                <PersonReactionList personId={person._id} />
              ) : null}
              {section == "comments" ? (
                <Comments campaignId={campaignId} comments={comments} />
              ) : null}
            </div>
          </div>
        </Container>
      );
    }
    return null;
  }
}

PeopleSingle.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PeopleSingle);

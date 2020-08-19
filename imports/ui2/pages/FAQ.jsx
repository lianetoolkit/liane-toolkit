import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { userCan } from "/imports/ui2/utils/permissions";

import { modalStore } from "../containers/Modal.jsx";
import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import Loading from "../components/Loading.jsx";
import Form from "../components/Form.jsx";
import Button from "../components/Button.jsx";
import CopyToClipboard from "../components/CopyToClipboard.jsx";

const messages = defineMessages({
  newTitle: {
    id: "app.faq.new_title",
    defaultMessage: "New answer",
  },
  editingTitle: {
    id: "app.faq.editing_title",
    defaultMessage: "Editing answer",
  },
  confirmRemove: {
    id: "app.faq.confirm_remove",
    defaultMessage: "Are you sure you'd like to remove this answer?",
  },
  removed: {
    id: "app.faq.removed_label",
    defaultMessage: "Removed",
  },
  copy: {
    id: "app.faq.copy",
    defaultMessage: "Copy to clipboard",
  },
  edit: {
    id: "app.faq.edit",
    defaultMessage: "Edit",
  },
  view: {
    id: "app.faq.view",
    defaultMessage: "View",
  },
  remove: {
    id: "app.faq.remove",
    defaultMessage: "Remove",
  },
  save: {
    id: "app.faq.save",
    defaultMessage: "Save",
  },
  gridMode: {
    id: "app.faq.view_mode.grid",
    defaultMessage: "View as grid",
  },
  documentMode: {
    id: "app.faq.view_mode.document",
    defaultMessage: "View as document",
  },
});

const formMessages = defineMessages({
  questionLabel: {
    id: "app.faq.form.question_label",
    defaultMessage: "Question",
  },
  questionPlaceholder: {
    id: "app.faq.form.question_placeholder",
    defaultMessage: "Describe the question",
  },
  answerLabel: {
    id: "app.faq.form.answer_label",
    defaultMessage: "Answer",
  },
  answerPlaceholder: {
    id: "app.faq.form.answer_placeholder",
    defaultMessage: "Type the default answer for this question",
  },
});

const ViewContainer = styled.article`
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
  }
  p {
    color: #333;
  }
  aside {
    text-align: right;
    font-size: 0.8em;
    a {
      margin-left: 0.5rem;
      color: #999;
      display: inline-block;
      border: 1px solid #ddd;
      border-radius: 7px;
      padding: 0.25rem 0.7rem;
      text-decoration: none;
      &:hover,
      &:focus,
      &:active {
        background: #63c;
        border-color: #63c;
        color: #fff;
      }
    }
  }
`;

class FAQView extends Component {
  _handleEditClick = (ev) => {
    const { intl, item } = this.props;
    ev.preventDefault();
    modalStore.setTitle(intl.formatMessage(messages.editingTitle));
    modalStore.set(<FAQEditIntl item={item} />);
  };
  _handleRemoveClick = (ev) => {
    const { intl, item } = this.props;
    if (confirm(intl.formatMessage(messages.confirmRemove))) {
      Meteor.call("faq.remove", { _id: item._id }, (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add(intl.formatMessage(messages.removed), "success");
          modalStore.reset();
        }
      });
    }
  };
  render() {
    const { item } = this.props;
    if (!item) return null;
    return (
      <ViewContainer>
        <h2>{item.question}</h2>
        <p>{item.answer}</p>
        <aside>
          <CopyToClipboard text={item.answer}>
            <FontAwesomeIcon icon="copy" />{" "}
            <FormattedMessage
              id="app.faq.copy"
              defaultMessage="Copy to clipboard"
            />
          </CopyToClipboard>
          {userCan("edit", "faq") ? (
            <>
              <a href="javascript:void(0);" onClick={this._handleEditClick}>
                <FontAwesomeIcon icon="edit" />{" "}
                <FormattedMessage id="app.faq.edit" defaultMessage="Edit" />
              </a>
              <a href="javascript:void(0);" onClick={this._handleRemoveClick}>
                <FontAwesomeIcon icon="times" />{" "}
                <FormattedMessage id="app.faq.remove" defaultMessage="Remove" />
              </a>
            </>
          ) : null}
        </aside>
      </ViewContainer>
    );
  }
}

FAQView.propTypes = {
  intl: intlShape.isRequired,
};

const FAQViewIntl = injectIntl(FAQView);

const EditContainer = styled.div``;

class FAQEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {
        question: "",
        answer: "",
      },
    };
  }
  componentDidMount() {
    const { campaignId, item } = this.props;
    if (item && item._id && item.campaignId) {
      this.setState({
        campaignId: item.campaignId,
        formData: item,
      });
    } else if (campaignId) {
      this.setState({ campaignId });
    }
  }
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { campaignId, onSuccess } = this.props;
    const { _id, question, answer } = this.state.formData;
    this.setState({
      loading: true,
    });
    if (!_id) {
      Meteor.call(
        "faq.create",
        { campaignId, question, answer },
        (err, res) => {
          this.setState({
            loading: false,
          });
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add("Created", "success");
            if (typeof onSuccess == "function") {
              onSuccess(res);
            }
          }
        }
      );
    } else {
      Meteor.call("faq.update", { _id, question, answer }, (err, res) => {
        this.setState({
          loading: false,
        });
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add("Updated", "success");
          if (typeof onSuccess == "function") {
            onSuccess(res);
          }
        }
      });
    }
  };
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value,
      },
    });
  };
  render() {
    const { intl } = this.props;
    const { formData, loading } = this.state;
    return (
      <EditContainer>
        <Form onSubmit={this._handleSubmit}>
          <Form.Field label={intl.formatMessage(formMessages.questionLabel)}>
            <input
              type="text"
              placeholder={intl.formatMessage(formMessages.questionPlaceholder)}
              onChange={this._handleChange}
              name="question"
              value={formData.question}
            />
          </Form.Field>
          <Form.Field label={intl.formatMessage(formMessages.answerLabel)}>
            <textarea
              placeholder={intl.formatMessage(formMessages.answerPlaceholder)}
              onChange={this._handleChange}
              name="answer"
              value={formData.answer}
            />
          </Form.Field>
          <input
            disabled={loading}
            type="submit"
            value={intl.formatMessage(messages.save)}
          />
        </Form>
      </EditContainer>
    );
  }
}

FAQEdit.propTypes = {
  intl: intlShape.isRequired,
};

const FAQEditIntl = injectIntl(FAQEdit);

const Container = styled.div`
  .intro {
    display: flex;
    margin: 4rem auto;
    align-items: center;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 7px;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
    padding: 2rem;
    p {
      margin: 0 1rem 0 0;
    }
    .button {
      white-space: nowrap;
    }
  }
  .page-actions {
    text-align: right;
    margin: 0 0 2rem;
    font-size: 0.8em;
    display: flex;
    > * {
      flex: 0 0 auto;
    }
    > .spacer {
      flex: 1 1 100%;
    }
    .new-faq {
      margin: 0;
    }
  }
  .faq-list {
    display: flex;
    flex-wrap: wrap;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    article {
      font-size: 0.8em;
      flex: 1 1 30%;
      margin: 0 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 7px;
      background: #fff;
      height: 230px;
      display: flex;
      flex-direction: column;
      header {
        h2 {
          font-family: "Open sans", "Helvetica Neue", Helvetica, Arial,
            sans-serif;
          font-size: 1em;
          margin: 0;
          a {
            display: block;
            text-decoration: none;
            padding: 0.5rem 0.75rem;
            border-bottom: 1px solid #ddd;
            flex: 0 0 auto;
            background: #f0f0f0;
            color: #666;
            border-radius: 7px 7px 0 0;
            &:hover,
            &:active,
            &:focus {
              color: #000;
            }
          }
        }
      }
      section {
        flex: 1 1 100%;
        padding: 0.5rem 0.75rem;
        overflow: hidden;
        color: #333;
        position: relative;
        &:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 0 0 7px 7px;
          background: rgb(255, 255, 255, 0);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 1) 75%
          );
        }
        p {
          margin: 0;
        }
        .item-actions {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 0 0 7px 7px;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.1s linear;
          a {
            font-size: 1.2em;
            width: 50px;
            height: 50px;
            margin: 0.5rem;
            border-radius: 100%;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #63c;
            background: #fff;
            &:hover {
              color: #fff;
              background: #63c;
            }
          }
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
  .faq-document {
    background: #fff;
    padding: 2rem;
    border-radius: 7px;
    border: 1px solid #ddd;
    article {
      border-bottom: 1px solid #ddd;
      margin: 0 0 1rem;
      h2 {
        margin: 0 0 1rem;
      }
      &:last-child {
        margin: 0;
        border: 0;
      }
    }
  }
`;

class FAQPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: "grid",
    };
  }
  _handleNewClick = (ev) => {
    const { intl, campaignId } = this.props;
    ev.preventDefault();
    modalStore.setTitle(intl.formatMessage(messages.newTitle));
    modalStore.set(
      <FAQEditIntl
        campaignId={campaignId}
        onSuccess={this._handleCreateSuccess}
      />
    );
  };
  _handleCreateSuccess = () => {
    modalStore.reset();
  };
  _handleViewClick = (item) => (ev) => {
    ev.preventDefault();
    modalStore.set(<FAQViewIntl item={item} />);
  };
  _handleEditClick = (item) => (ev) => {
    const { intl } = this.props;
    ev.preventDefault();
    modalStore.setTitle(intl.formatMessage(messages.editingTitle));
    modalStore.set(<FAQEditIntl item={item} />);
  };
  _handleViewModeClick = (viewMode) => (ev) => {
    ev.preventDefault();
    this.setState({ viewMode });
  };
  render() {
    const { intl, loading, faq } = this.props;
    const { viewMode } = this.state;
    if (loading) {
      return <Loading full />;
    }
    return (
      <Page.Content plain>
        <Container>
          <Page.Title>
            <FormattedMessage
              id="app.faq.title"
              defaultMessage="Frequently Asked Questions"
            />
          </Page.Title>
          {!faq.length ? (
            <div className="intro">
              <p>
                <FormattedMessage
                  id="app.faq.description"
                  defaultMessage="Create answers to frequently asked questions to optimize your campaign communication."
                />
              </p>
              {userCan("edit", "faq") ? (
                <Button
                  className="primary button"
                  onClick={this._handleNewClick}
                >
                  <FormattedMessage
                    id="app.faq.create_first"
                    defaultMessage="Create your first answer"
                  />
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              {userCan("edit", "faq") ? (
                <div className="page-actions">
                  <Button.Group>
                    <Button
                      data-tip={intl.formatMessage(messages.gridMode)}
                      className={
                        viewMode == "grid" ? "active button" : "button"
                      }
                      data-for="faq-actions"
                      onClick={this._handleViewModeClick("grid")}
                    >
                      <FontAwesomeIcon icon="th-large" />
                    </Button>
                    <Button
                      className={
                        viewMode == "document" ? "active button" : "button"
                      }
                      data-tip={intl.formatMessage(messages.documentMode)}
                      data-for="faq-actions"
                      onClick={this._handleViewModeClick("document")}
                    >
                      <FontAwesomeIcon icon="align-left" />
                    </Button>
                  </Button.Group>
                  <div className="spacer" />
                  <Button
                    className="button primary new-faq"
                    onClick={this._handleNewClick}
                  >
                    <FormattedMessage
                      id="app.faq.create_new"
                      defaultMessage="+ Create new answer"
                    />
                  </Button>
                  <ReactTooltip id="faq-actions" effect="solid" />
                </div>
              ) : null}
              {viewMode == "grid" ? (
                <section className="faq-list">
                  {faq.map((item) => (
                    <article key={item._id} className="faq-item">
                      <header>
                        <h2>
                          <a
                            href="javascript:void(0);"
                            onClick={this._handleViewClick(item)}
                          >
                            {item.question}
                          </a>
                        </h2>
                      </header>
                      <section>
                        <p>{item.answer}</p>
                        <aside className="item-actions">
                          <CopyToClipboard
                            text={item.answer}
                            data-tip={intl.formatMessage(messages.copy)}
                            data-for={`faq-${item._id}`}
                          >
                            <FontAwesomeIcon icon="copy" />
                          </CopyToClipboard>
                          <a
                            href="javascript:void(0);"
                            onClick={this._handleViewClick(item)}
                            data-tip={intl.formatMessage(messages.view)}
                            data-for={`faq-${item._id}`}
                          >
                            <FontAwesomeIcon icon="eye" />
                          </a>
                          {userCan("edit", "faq") ? (
                            <a
                              href="javascript:void(0);"
                              onClick={this._handleEditClick(item)}
                              data-tip={intl.formatMessage(messages.edit)}
                              data-for={`faq-${item._id}`}
                            >
                              <FontAwesomeIcon icon="edit" />
                            </a>
                          ) : null}
                        </aside>
                        <ReactTooltip id={`faq-${item._id}`} effect="solid" />
                      </section>
                    </article>
                  ))}
                </section>
              ) : null}
              {viewMode == "document" ? (
                <section className="faq-document">
                  {faq.map((item) => (
                    <article key={`document-${item._id}`}>
                      <header>
                        <h2>{item.question}</h2>
                      </header>
                      <section>
                        <p>{item.answer}</p>
                      </section>
                    </article>
                  ))}
                </section>
              ) : null}
            </>
          )}
        </Container>
      </Page.Content>
    );
  }
}

FAQPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(FAQPage);

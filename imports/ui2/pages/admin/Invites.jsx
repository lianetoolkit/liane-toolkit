import React, { Component } from "react";
import { injectIntl, intlShape, FormattedMessage } from "react-intl";
import styled from "styled-components";
import moment from "moment";
import XLSX from "xlsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";
import { modalStore } from "/imports/ui2/containers/Modal.jsx";

import CopyToClipboard from "/imports/ui2/components/CopyToClipboard.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import Table from "/imports/ui2/components/Table.jsx";
import Form from "/imports/ui2/components/Form.jsx";
import LanguageSelect from "/imports/ui2/components/LanguageSelect.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  .new-person {
    position: absolute;
    bottom: 1rem;
    right: 2rem;
    z-index: 9999;
    .button {
      background: #003399;
      border: 0;
      color: #fff;
      margin: 0;
      &:hover,
      &:active,
      &:focus {
        background: #333;
      }
    }
  }
  .invite-id {
    font-family: monospace;
    color: #666;
  }
  tr.used {
    opacity: 0.8;
    td {
      background: #f7f7f7;
    }
    .invite-id {
      text-decoration: line-through;
    }
  }
  .content-action {
    display: flex;
    text-align: left;
    .content {
      flex: 1 1 100%;
      font-size: 0.8em;
      display: flex;
      align-items: center;
    }
    .text {
      color: #999;
    }
    .actions {
      flex: 0 0 auto;
      font-size: 0.9em;
      a {
        color: #63c;
        &.disabled,
        &.disabled:hover,
        &.disabled:active,
        &.disabled:focus {
          color: #ccc;
          background: #fff;
          border-color: #ddd;
        }
        &.remove {
          color: red;
          border-color: red;
        }
        &:hover {
          color: #fff;
        }
      }
      form {
      }
    }
  }
  .fa-check,
  .fa-ban {
    float: left;
    margin-right: 0.5rem;
    font-size: 18px;
  }
  .fa-check {
    color: green;
  }
  .fa-ban {
    color: red;
  }
  a {
    .fa-envelope,
    .fa-copy {
      margin-right: 0.25rem;
    }
  }
  .designate-form {
    margin -0.5rem 0 -0.5rem -0.5rem;
    display: flex;
    align-items: center;
    input {
      font-size: 0.8em;
      padding: 0.5rem;
      margin: 0 0.5rem 0 0;
      &.filled {
        border-color: #f7f7f7;
      }
      &:hover,
      &:active,
      &:focus {
        border-color: #ddd;
      }
      &:last-child {
        margin: 0;
      }
    }
    input[type=text] {
      width: 120px;
    }
    input[type=email] {
      width: 180px;
    }
    input[type=submit] {
      background: transparent;
      color: #63c;
      border: 1px solid rgba(51,0,102,0.25);
      font-weight: normal;
      padding: 0.5rem 0.8rem;
      &:hover,
      &:focus {
        background: #333;
        color: #fff;
        border-color: #333;
      }
    }
  }
`;

const TableContainer = styled.div`
  flex: 1 1 100%;
  overflow-x: hidden;
  overflow-y: auto;
  transition: opacity 0.1s linear;
  table {
    margin-bottom: 4rem;
  }
`;

const ImportContainer = styled.div`
  .button {
    margin: 0;
    display: block;
  }
`;

const EmailInviteContainer = styled.div`
  textarea {
    height: 250px;
    line-height: 1.5;
  }
`;

class EmailInvite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unsentCount: 0,
      title: "You've got an invite!",
      message:
        "We would like to invite you to create a campaign in Liane.\n\nClick on the link below to use your invitation code:\n\n{link}",
      language: "",
    };
  }
  componentDidMount() {
    Meteor.call("invites.unsentCount", {}, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          unsentCount: res,
        });
      }
    });
  }
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { invite } = this.props;
    const { title, message, language } = this.state;
    if (invite) {
      Meteor.call(
        "invites.emailInvite",
        { inviteId: invite._id, title, message, language },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add(null, "success");
            modalStore.reset();
          }
        }
      );
    } else {
      Meteor.call(
        "invites.emailPending",
        { title, message, language },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add(null, "success");
            modalStore.reset();
          }
        }
      );
    }
  };
  render() {
    const { invite } = this.props;
    const { unsentCount, title, message, language } = this.state;
    if (!invite && !unsentCount) return null;
    return (
      <EmailInviteContainer>
        <Form onSubmit={this._handleSubmit}>
          <Form.Field label="Email subject">
            <input
              type="text"
              value={title}
              onChange={({ target }) => {
                this.setState({
                  title: target.value,
                });
              }}
            />
          </Form.Field>
          <Form.Field
            label="Email message"
            description={
              <FormattedMessage
                id="app.admin.invites.email.message_description"
                defaultMessage="Greeting introduction is already handled by our template. You can use {markdown} to format your message"
                values={{
                  markdown: (
                    <a
                      href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet"
                      rel="external"
                      target="_blank"
                    >
                      markdown
                    </a>
                  ),
                }}
              />
            }
          >
            <textarea
              value={message}
              onChange={({ target }) => {
                this.setState({ message: target.value });
              }}
            />
          </Form.Field>
          <Form.Field label="Language">
            <LanguageSelect
              value={language}
              onChange={({ target }) => {
                this.setState({ language: target.value });
              }}
            />
          </Form.Field>
          <input
            type="submit"
            value={
              invite
                ? `Send invite to ${invite.name}`
                : `Email ${unsentCount} pending invite(s)`
            }
          />
        </Form>
      </EmailInviteContainer>
    );
  }
}

class InvitesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      unsentCount: 0,
      count: 0,
      designations: {},
      importing: false,
    };
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      JSON.stringify(prevProps.invites) != JSON.stringify(this.props.invites)
    ) {
      this._fetchQueryCount();
      this._fetchUnsent();
      this._updateDesignated();
    }
  }
  componentDidMount() {
    this.setState({ loadingCount: true });
    this._fetchQueryCount();
    this._fetchUnsent();
    this._updateDesignated();
  }
  createInvite = (name, email, cb) => {
    Meteor.call("invites.new", { name, email }, cb);
  };
  _updateDesignated = () => {
    const { invites } = this.props;
    const designations = {};
    for (const invite of invites) {
      designations[invite._id] = {
        name: invite.name || "",
        email: invite.email || "",
      };
    }
    this.setState({ designations });
  };
  _handleImportClick = (ev) => {
    ev.preventDefault();
    const { importCount } = this.props;
    if (!importCount) {
      this.importInput.click();
    }
  };
  _handleImport = (ev) => {
    let file = ev.currentTarget.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      let bytes = new Uint8Array(reader.result);
      const wb = XLSX.read(bytes, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      this.importInput.value = null;
      this.importInput.dispatchEvent(new Event("input", { bubbles: true }));
      modalStore.setTitle(`Importing invites from ${file.name}`);
      modalStore.set(
        <ImportContainer>
          <p>
            Import <strong>{json.length} entries</strong> as invite links?
          </p>
          <Button primary onClick={this._doImport(json)}>
            Confirm import
          </Button>
        </ImportContainer>,
        this._handleClose
      );
    };
    reader.readAsArrayBuffer(file);
  };
  _doImport = (data) => (ev) => {
    ev.preventDefault();
    modalStore.reset(true);
    this.setState({ importing: true });
    const nameRegex = /name|nome|fullname/;
    const emailRegex = /email|e-mail|mail/;
    let promises = [];
    for (const entry of data) {
      const nameKey = Object.keys(entry).find((k) =>
        k.trim().toLowerCase().match(nameRegex)
      );
      const emailKey = Object.keys(entry).find((k) =>
        k.trim().toLowerCase().match(emailRegex)
      );
      if (nameKey && emailKey && entry[nameKey] && entry[emailKey]) {
        const promise = new Promise((resolve, reject) => {
          this.createInvite(
            entry[nameKey],
            entry[emailKey].trim().toLowerCase(),
            (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            }
          );
        });
        promises.push(promise);
      }
    }
    if (!promises.length) {
      alertStore.add(
        'No imports were made. Make sure you have the right "name" and "email" headers',
        "error"
      );
    }
    Promise.all(promises)
      .then(() => {
        this.setState({ importing: false });
      })
      .catch((err) => {
        this.setState({ importing: false });
        alertStore.add(err);
      });
  };
  _handleClose = () => {
    const { intl } = this.props;
    if (confirm("Are you sure you'd like to cancel this import?")) {
      this.importInput.value = null;
      this.importInput.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    return false;
  };
  _handleEmailClick = (invite = false) => (ev) => {
    ev.preventDefault();
    const { unsentCount } = this.state;
    if (invite === false) {
      modalStore.setTitle(`Email invite to ${unsentCount} pending invite(s)`);
    } else if (invite.name && invite.email) {
      modalStore.setTitle(`Email invite to ${invite.name}`);
    } else {
      return;
    }
    modalStore.set(<EmailInvite invite={invite} />);
  };
  _fetchQueryCount = () => {
    Meteor.call("invites.queryCount", { query: {} }, (err, res) => {
      this.setState({ loadingCount: false, count: res });
    });
  };
  _fetchUnsent = () => {
    Meteor.call("invites.unsentCount", {}, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          unsentCount: res,
        });
      }
    });
  };
  _handleNext = () => {
    const { page, limit } = this.props;
    const { count } = this.state;
    if ((page - 1) * limit + limit < count) {
      FlowRouter.setQueryParams({ page: page + 1 });
    }
  };
  _handlePrev = () => {
    const { page } = this.props;
    if (page > 1) {
      FlowRouter.setQueryParams({ page: page - 1 });
    }
  };
  _getLink = (inviteKey) => {
    return Meteor.absoluteUrl() + "?invite=" + inviteKey;
  };
  _handleDesignateForm = (inviteId) => (ev) => {
    ev.preventDefault();
    const designated = this.state.designations[inviteId];
    Meteor.call(
      "invites.designate",
      { inviteId, ...designated },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add(null, "success");
        }
      }
    );
  };
  _handleDesignateChange = (inviteId) => ({ target }) => {
    this.setState({
      designations: {
        ...this.state.designations,
        [inviteId]: {
          ...(this.state.designations[inviteId] || {}),
          [target.name]: target.value,
        },
      },
    });
  };
  _handleDesignateClick = (inviteId) => (ev) => {
    ev.preventDefault();
    Meteor.call("invites.designate", { inviteId });
  };
  _handleRemoveClick = (inviteId) => (ev) => {
    ev.preventDefault();
    Meteor.call("invites.remove", { inviteId }, (err, res) => {
      if (err) {
        alertStore.add(err);
      }
    });
  };
  _handleNewClick = (ev) => {
    ev.preventDefault();
    this.createInvite();
  };
  render() {
    const { intl, invites, page, limit } = this.props;
    const {
      designations,
      loadingCount,
      count,
      unsentCount,
      importing,
    } = this.state;
    if (importing) return <Loading full />;
    return (
      <Container>
        <input
          type="file"
          onChange={this._handleImport}
          style={{ display: "none" }}
          ref={(input) => (this.importInput = input)}
        />
        <PagePaging
          skip={page - 1}
          limit={limit}
          count={count}
          loading={loadingCount}
          onNext={this._handleNext}
          onPrev={this._handlePrev}
        >
          {unsentCount ? (
            <Button onClick={this._handleEmailClick()}>
              Email {unsentCount} pending invite(s)
            </Button>
          ) : null}
          <Button onClick={this._handleImportClick}>Import spreadsheet</Button>
          <Button primary onClick={this._handleNewClick}>
            +{" "}
            <FormattedMessage
              id="app.admin.invites.new"
              defaultMessage="New invite"
            />
          </Button>
        </PagePaging>
        <TableContainer>
          <Table compact>
            <thead>
              <tr>
                <th>
                  <FormattedMessage
                    id="app.admin.invites.designated"
                    defaultMessage="Designated"
                  />
                </th>
                <th className="fill">
                  <FormattedMessage
                    id="app.admin.invites.status"
                    defaultMessage="Status"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.invites.created"
                    defaultMessage="Created"
                  />
                </th>
              </tr>
            </thead>
            {invites.map((invite) => (
              <tbody key={invite._id}>
                <tr className={invite.used ? "used" : ""}>
                  <td>
                    <span className="content-action">
                      <span className="actions">
                        <form
                          className="designate-form"
                          onSubmit={this._handleDesignateForm(invite._id)}
                        >
                          <input
                            disabled={invite.sent}
                            className={invite.name ? "filled" : ""}
                            type="text"
                            name="name"
                            onChange={this._handleDesignateChange(invite._id)}
                            placeholder="Name"
                            value={
                              designations[invite._id]
                                ? designations[invite._id].name
                                : ""
                            }
                          />
                          <input
                            disabled={invite.sent}
                            className={invite.email ? "filled" : ""}
                            type="email"
                            name="email"
                            onChange={this._handleDesignateChange(invite._id)}
                            placeholder="Email"
                            value={
                              designations[invite._id]
                                ? designations[invite._id].email
                                : ""
                            }
                          />
                          <input
                            className="button small"
                            value="Update"
                            type="submit"
                          />
                        </form>
                      </span>
                    </span>
                  </td>
                  <td className="fill">
                    <span className="content-action">
                      <span className="content">
                        <span className="icon">
                          {invite.used ? (
                            <FontAwesomeIcon icon="ban" />
                          ) : (
                            <FontAwesomeIcon icon="check" />
                          )}
                        </span>
                        {invite.user ? (
                          <span className="text">
                            <FormattedMessage
                              id="app.admin.invites.used_by"
                              defaultMessage="Used by {name}"
                              values={{ name: invite.user.name }}
                            />
                          </span>
                        ) : (
                          `Invite not used. ${invite.sent ? "Email sent." : ""}`
                        )}
                      </span>
                      <span className="actions">
                        {!invite.sent ? (
                          <Button
                            className={`small ${
                              !invite.email || !invite.name ? "disabled" : ""
                            }`}
                            onClick={this._handleEmailClick(invite)}
                          >
                            <FontAwesomeIcon icon="envelope" />
                            <FormattedMessage
                              id="app.admin.invites.send_email"
                              defaultMessage="Email invite"
                            />
                          </Button>
                        ) : null}
                        {!invite.used ? (
                          <CopyToClipboard text={this._getLink(invite.key)}>
                            <Button className="small">
                              <FontAwesomeIcon icon="copy" />
                              <FormattedMessage
                                id="app.admin.invites.copy"
                                defaultMessage="Copy link"
                              />
                            </Button>
                          </CopyToClipboard>
                        ) : null}
                        <Button
                          className="small remove"
                          onClick={this._handleRemoveClick(invite._id)}
                        >
                          <FormattedMessage
                            id="app.admin.invites.remove"
                            defaultMessage="Remove"
                          />
                        </Button>
                      </span>
                    </span>
                  </td>
                  <td className="small">
                    {moment(invite.createdAt).format("L")}
                  </td>
                </tr>
              </tbody>
            ))}
          </Table>
        </TableContainer>
      </Container>
    );
  }
}

InvitesPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(InvitesPage);

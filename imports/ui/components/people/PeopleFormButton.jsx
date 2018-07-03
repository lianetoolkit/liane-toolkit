import React from "react";
import styled from "styled-components";
import { Form, Input, Button, Popup, Icon } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

const Wrapper = styled.div`
  input[type="text"] {
    font-size: 0.8em;
    background: #fff;
    padding: 0.5rem;
    width: 175px;
    border: 1px solid #ddd;
    display: block;
    margin: 0 0 1rem;
  }
  p.status {
    font-size: 0.8em;
    margin: 0;
    padding: .25rem 0 0;
    color: #999;
    font-weight: bold;
    &.filled {
      color: green;
    }
  }
`;

export default class PeopleFormButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  _handlePopupOpen = () => {
    const { person } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call("people.formId", { personId: person._id }, (err, res) => {
      if (err) {
        Alerts.error(err);
      }
      this.setState({
        loading: false,
        formId: res.formId,
        filledForm: res.filledForm
      });
    });
  };
  _handleRegenClick = ev => {
    ev.preventDefault();
    const { person } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call(
      "people.formId",
      { personId: person._id, regenerate: true },
      (err, res) => {
        if (err) {
          Alerts.error(err);
        }
        this.setState({
          loading: false,
          formId: res.formId,
          filledForm: res.filledForm
        });
      }
    );
  };
  _handleCopyClick = ev => {
    this.textInput.focus();
    this.textInput.select();
    document.execCommand("copy");
  };
  render() {
    const { formId, filledForm, loading } = this.state;
    const { size, person, iconOnly, ...props } = this.props;
    const url = `${location.protocol}//${
      Meteor.settings.public.domain
    }/f/${formId}`;
    let filled = person.filledForm || filledForm;
    return (
      <Popup
        on="click"
        onOpen={this._handlePopupOpen}
        trigger={
          <Button
            // basic
            size={size || "mini"}
            {...props}
            icon={iconOnly}
            color={filled ? "green" : null}
          >
            <Icon name="align left" />
            {!iconOnly ? <span> Form</span> : null}
          </Button>
        }
      >
        {formId || loading ? (
          <Wrapper>
            <input
              ref={el => (this.textInput = el)}
              type="text"
              onClick={this._handleCopyClick}
              value={url}
            />
            <Button.Group basic size="mini" floated="right">
              <Button
                onClick={this._handleCopyClick}
                icon="copy"
                title="Copy link"
              />
              <Button
                href={url}
                target="_blank"
                icon="linkify"
                title="View form"
              />
              <Button
                onClick={this._handleRegenClick}
                icon="sync"
                title="Regenerate link"
              />
            </Button.Group>
            <p className={`status ${filled ? "filled" : ""}`}>
              {filled ? "Filled form" : "Not filled"}
            </p>
          </Wrapper>
        ) : (
          <p>Erro</p>
        )}
      </Popup>
    );
  }
}

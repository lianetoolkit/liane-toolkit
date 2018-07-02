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
`;

export default class PeopleFormButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  _handlePopupOpen = () => {
    const { personId } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call("people.formId", { personId }, (err, res) => {
      if (err) {
        Alerts.error(err);
      }
      this.setState({
        loading: false,
        formId: res
      });
    });
  };
  _handleRegenClick = ev => {
    ev.preventDefault();
    const { personId } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call("people.formId", { personId, regenerate: true }, (err, res) => {
      if (err) {
        Alerts.error(err);
      }
      this.setState({
        loading: false,
        formId: res
      });
    });
  };
  _handleCopyClick = ev => {
    this.textInput.focus();
    this.textInput.select();
    document.execCommand("copy");
  };
  render() {
    const { formId, loading } = this.state;
    const { size, personId, iconOnly, ...props } = this.props;
    const url = `${location.protocol}//${
      Meteor.settings.public.domain
    }/f/${formId}`;
    return (
      <Popup
        on="click"
        onOpen={this._handlePopupOpen}
        trigger={
          <Button basic size={size || "mini"} {...props} icon={iconOnly}>
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
          </Wrapper>
        ) : (
          <p>Erro</p>
        )}
      </Popup>
    );
  }
}

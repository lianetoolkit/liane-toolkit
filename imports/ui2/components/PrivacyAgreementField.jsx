import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";

const Container = styled.div`
  border: 1px solid #ddd;
  border-radius: 7px;
  display: flex;
  margin: 0 0 1rem;
  label {
    padding: 1rem 1.5rem;
    margin: 0;
    input[type="checkbox"] {
      margin: 0;
    }
  }
  > span {
    display: block;
    padding: 1rem 0;
  }
`;

import Form from "./Form.jsx";

class PrivacyAgreementField extends Component {
  static defaultProps = {
    privacy: true,
    terms: true,
  };
  _handleChange = ({ target }) => {
    const { onChange } = this.props;
    onChange && onChange(target.checked);
  };
  render() {
    const { privacy, terms } = this.props;
    if (!privacy && !terms) {
      return null;
    }
    return (
      <Container className="privacy-consent">
        <label>
          <input type="checkbox" onChange={this._handleChange} />
        </label>
        <span>
          <FormattedHTMLMessage
            id="app.privacy_field.label"
            defaultMessage="I have read and agree with the <a href='{privacyUrl}' rel='external' target='_blank'>privacy policy</a> and the <a href='{termsUrl}' target='_blank' rel='external'>terms of use</a>."
            values={{
              privacyUrl: Meteor.settings.public.privacyUrl,
              termsUrl: Meteor.settings.public.termsUrl,
            }}
          />
        </span>
      </Container>
    );
  }
}

export default PrivacyAgreementField;

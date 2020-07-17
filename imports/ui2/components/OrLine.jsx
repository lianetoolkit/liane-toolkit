import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage
} from "react-intl";
import styled from "styled-components";

const messages = defineMessages({
  orLabel: {
    id: "app.or_label",
    defaultMessage: "or"
  }
});

const Container = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1px;
  border-bottom: 1px solid #eee;
  margin: 1rem 0;
  .or-text {
    font-size: 0.8em;
    color: #999;
    flex: 0 0 auto;
    background: #fff;
    padding: 0 1rem;
  }
`;

class OrLine extends Component {
  render() {
    const { intl, bgColor } = this.props;
    const text = this.props.children || intl.formatMessage(messages.orLabel);
    let spanStyles = {};
    if (bgColor) {
      spanStyles.backgroundColor = bgColor;
    }
    return (
      <Container className="or-line">
        <span className="or-text" style={spanStyles}>
          {text}
        </span>
      </Container>
    );
  }
}

OrLine.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(OrLine);

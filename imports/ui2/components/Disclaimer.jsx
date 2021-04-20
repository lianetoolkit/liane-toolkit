import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.div`
  padding: 1rem;
  margin: 0 0 1rem;
  border: 1px solid #ddd;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  .disclaimer-icon {
    font-size: 2em;
    margin: 0.5rem 1.5rem 0.5rem 0.5rem;
    color: #999;
  }
  .disclaimer-content {
    flex: 1 1 100%;
    font-size: 0.8em;
    p {
      margin: 0 0 0.35rem;
    }
    p:last-child {
      margin: 0;
    }
    .disclaimer-consent {
      label {
        margin: 0;
        display: flex;
        align-items: center;
        font-size: 1.1em;
        input {
          flex: 0 0 auto;
          margin: 0 0.5rem 0 0;
        }
      }
    }
  }
  ${(props) =>
    props.type == "security" &&
    css`
      .disclaimer-icon {
        color: #063;
      }
    `}
`;

export default class Disclaimer extends Component {
  static defaultProps = {
    type: "info",
  };
  render() {
    const { type, consent, checked } = this.props;
    let icon = "info-circle";
    if (type == "security") {
      icon = "shield-alt";
    }
    return (
      <Container className="disclaimer" type={type}>
        <div className="disclaimer-icon">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="disclaimer-content">
          {this.props.children}
          {consent ? (
            <div className="disclaimer-consent">
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={({ target }) => {
                    this.props.onChange && this.props.onChange(target.checked);
                  }}
                />
                {consent}
              </label>
            </div>
          ) : null}
        </div>
      </Container>
    );
  }
}

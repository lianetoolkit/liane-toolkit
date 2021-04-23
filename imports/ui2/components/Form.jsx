import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";

const Container = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  .button.primary {
    margin: 0;
  }
`;

const ContentContainer = styled.div`
  flex: 1 1 100%;
  overflow: auto;
  box-sizing: border-box;
  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
      overflow: hidden;
    `}
`;

const FormContent = styled.div`
  max-width: 700px;
  margin: 3rem auto;
  padding: 0 3rem;
  h3 {
    margin-top: 3rem;
    padding-bottom: 1rem;
    color: #666;
    border-bottom: 1px solid #ddd;
  }
`;

const FieldContainer = styled.label`
  display: block;
  font-weight: normal;
  margin: 0 0 1.5rem;
  .field-label {
    color: #333;
    display: block;
    font-size: 0.8em;
    margin-bottom: 0.5rem;
  }
  .optional-label {
    color: #999;
  }
  .required-label {
    color: red;
  }
  .field-description {
    color: #888;
    display: block;
    font-size: 0.8em;
    margin-top: -0.5rem;
    margin-bottom: 0.5rem;
    font-style: italic;
  }
  .input-container {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 7px;
    > * {
      flex: 1 1 100%;
      margin: 0;
      border: 0;
    }
    input,
    textarea,
    .select-search__control,
    .select__control {
      border: 0;
      margin: 0;
    }
    textarea {
      line-height: 1.4;
    }
    .prefix {
      flex: 0 0 auto;
      font-size: 0.9em;
      color: #999;
      padding: 0 0.5rem 0 1rem;
    }
  }
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  .select__control {
    margin: 0;
  }
  .select__value-container {
    padding: 0.5rem 1rem;
  }
  &:last-child {
    margin-bottom: 0;
  }
  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    display: block;
  }
  ${(props) =>
    props.secondary &&
    css`
      font-size: 0.9em;
    `}
  ${(props) =>
    props.big &&
    css`
      font-size: 1.2em;
    `}
  ${(props) =>
    props.simple &&
    css`
      .input-container {
        border: 0;
      }
    `}
  &.radio-list {
    .input-container {
      padding: 1rem;
      label {
        display: flex;
        align-items: center;
        font-weight: normal;
        input {
          margin-right: 0.5rem;
        }
      }
    }
  }
`;

const CheckboxGroup = styled.div`
  padding: 0;
  font-size: 0.9em;
  label {
    font-weight: normal;
    padding: 0.5rem 1rem;
    margin: 0;
    &:last-child {
      margin: 0;
    }
  }
  input[type="checkbox"],
  input[type="radio"] {
    margin-right: 1rem;
  }
`;

class Content extends Component {
  render() {
    const { children, contentRef, ...props } = this.props;
    return (
      <ContentContainer ref={contentRef} {...props}>
        <FormContent>{children}</FormContent>
      </ContentContainer>
    );
  }
}

const ActionsContainer = styled.div`
  border-top: 1px solid #ddd;
  position: relative;
  z-index: 2;
  background: #f7f7f7;
`;

const ActionsContent = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem 4rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .info,
  .loading {
    flex: 1 1 100%;
  }
  .loading {
    margin: 0;
    padding: 0;
    justify-content: flex-start;
  }
  .button {
    margin: 0;
    padding: 0.5rem 1rem;
  }
  button,
  input[type="submit"] {
    display: block;
    background: #f5911e;
    color: #fff;
    cursor: pointer;
    border: 1px solid #f5911e;
    margin: 0;
    &:hover,
    &:active,
    &:focus {
      border: 1px solid #333;
      background: #333;
    }
    &:disabled {
      border: 1px solid #bbb;
      background: #bbb;
      color: #fff;
      cursor: default;
    }
  }
`;

class Actions extends Component {
  render() {
    const { children } = this.props;
    return (
      <ActionsContainer>
        <ActionsContent>{children}</ActionsContent>
      </ActionsContainer>
    );
  }
}

const StepsContainer = styled.header`
  border-bottom: 1px solid #ddd;
  position: relative;
  z-index: 2;
  background: #f7f7f7;
`;

const StepsContent = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 0 4rem;
  h1 {
    margin: 3rem 0 0;
  }
  ol {
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
  }
`;

const StepItem = styled.li`
  flex: 1 1 auto;
  padding: 1rem 0;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  font-size: 0.8em;
  a {
    text-decoration: none;
    color: #666;
    font-weight: 600;
    flex: 1 1 100%;
    &:hover {
      color: #333;
    }
  }
  ${(props) =>
    props.active &&
    css`
      border-bottom: 2px solid #000;
      a {
        color: #333;
      }
    `}
  ${(props) =>
    props.disabled &&
    css`
      a {
        cursor: default;
        color: #999;
        &:hover {
          color: #999;
        }
      }
    `}
`;

class Steps extends Component {
  constructor(props) {
    super(props);
    this.state = { visitedSteps: {} };
  }
  _handleClick = (key) => (ev) => {
    ev.preventDefault();
    const { steps } = this.props;
    const step = steps.find((step) => step.key == key);
    const { enableNextStep, currentStep } = this.props;
    if (!this._isDisabled(step.key)) {
      this.setState({
        visitedSteps: {
          ...this.state.visitedSteps,
          [step.key]: true,
        },
      });
      this.props.onChange && this.props.onChange(key);
    }
  };
  _isDisabled = (key) => {
    const { visitedSteps } = this.state;
    const { enableNextStep, currentStep, steps } = this.props;
    const curStepIndex = steps.findIndex((step) => step.key == currentStep);
    const stepIndex = steps.findIndex((step) => step.key == key);
    return !(
      stepIndex <= curStepIndex ||
      visitedSteps[key] ||
      (stepIndex == curStepIndex + 1 && enableNextStep)
    );
  };
  render() {
    const { title, currentStep, steps, children, enableNextStep } = this.props;
    return (
      <StepsContainer>
        <StepsContent>
          <h1>{title}</h1>
          <nav>
            <ol>
              {steps.map((step, i) => (
                <StepItem
                  key={step.key}
                  active={currentStep == step.key}
                  disabled={this._isDisabled(step.key)}
                >
                  <a href="#" onClick={this._handleClick(step.key)}>
                    {step.label}
                  </a>
                </StepItem>
              ))}
            </ol>
          </nav>
          {children}
        </StepsContent>
      </StepsContainer>
    );
  }
}

const FiltersContainer = styled.div`
  border-top: 1px solid #ddd;
  flex: 0 0 auto;
  overflow: auto;
  ${(props) =>
    props.open &&
    css`
      flex: 1 1 100%;
      box-shadow: 0 0 5rem rgba(0, 0, 0, 0.1);
    `}
`;

const FiltersContent = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem 4rem;
  display: flex;
  align-items: center;
  font-size: 0.8em;
  flex-wrap: wrap;
  .filters {
    width: 100%;
    flex: 1 1 100%;
    margin-top: 1rem;
  }
`;

const FiltersHeader = styled.div`
  cursor: pointer;
  flex: 1 1 100%;
  display: flex;
  align-items: center;
  width: 100%;
  .content {
    flex: 1 1 100%;
    h3,
    p {
      margin: 0;
    }
  }
`;

class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  _handleHeaderClick = (ev) => {
    ev.preventDefault();
    const open = !this.state.open;
    this.setState({ open });
    this.props.onToggle && this.props.onToggle(open);
  };
  render() {
    const { header, children } = this.props;
    const { open } = this.state;
    return (
      <FiltersContainer open={open}>
        <FiltersContent>
          <FiltersHeader onClick={this._handleHeaderClick}>
            <div className="content">{header}</div>
            <FontAwesomeIcon icon={open ? "chevron-up" : "chevron-down"} />
          </FiltersHeader>
          {open ? <div className="filters">{children}</div> : null}
        </FiltersContent>
      </FiltersContainer>
    );
  }
}

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  button,
  input[type="submit"],
  .button {
    width: auto;
    display: inline-block;
    margin-left: 1rem;
    text-decoration: none;
  }
`;

class Field extends Component {
  render() {
    const {
      label,
      description,
      optional,
      required,
      children,
      prefix,
      ...props
    } = this.props;
    return (
      <FieldContainer {...props}>
        {label ? (
          <span className="field-label">
            {label}{" "}
            {optional ? (
              <span className="optional-label">
                <FormattedMessage
                  id="app.form.optional_label"
                  defaultMessage="(optional)"
                />
              </span>
            ) : null}
            {required ? <span className="required-label">*</span> : null}
          </span>
        ) : null}
        {description ? (
          <span className="field-description">{description}</span>
        ) : null}
        <div className="input-container">
          {prefix ? <span className="prefix">{prefix}</span> : null}
          {children}
        </div>
      </FieldContainer>
    );
  }
}

export default class Form extends Component {
  static Content = Content;
  static Steps = Steps;
  static Actions = Actions;
  static Filters = Filters;
  static ButtonGroup = ButtonGroup;
  static CheckboxGroup = CheckboxGroup;
  static Field = Field;
  render() {
    const { children, ...props } = this.props;
    return <Container {...props}>{children}</Container>;
  }
}

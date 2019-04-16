import React, { Component } from "react";
import ReactDOM from "react-dom";

export default class CopyToClipboard extends Component {
  componentDidMount() {
    this.textarea = document.createElement("textarea");
    this.textarea.style.position = "fixed";
    this.textarea.style.top = 0;
    this.textarea.style.left = 0;
    this.textarea.style.width = "2em";
    this.textarea.style.height = "2em";
    this.textarea.style.padding = 0;
    this.textarea.style.border = "none";
    this.textarea.style.outline = "none";
    this.textarea.style.boxShadow = "none";
    this.textarea.style.background = "transparent";
  }
  _handleClick = ev => {
    ev.preventDefault();
    const { text, disabled } = this.props;
    if (disabled) return false;
    const node = ReactDOM.findDOMNode(this);
    node.appendChild(this.textarea);
    this.textarea.value = text;
    this.textarea.focus();
    this.textarea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      alert("Oops, unable to copy");
    }
    node.removeChild(this.textarea);
  };
  render() {
    const { children, disabled, text, ...props } = this.props;
    return (
      <a href="javascript:void(0);" onClick={this._handleClick} {...props}>
        {children}
      </a>
    );
  }
}

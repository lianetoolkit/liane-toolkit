import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.section`
  border: 1px solid #ddd;
  border-radius: 7px;
  margin: 0 0 2rem;
  background: #fff;
  font-size: 0.9em;
  nav {
    width: 100%;
    display: flex;
    text-align: center;
    border-bottom: 1px solid #ddd;
    a {
      flex: 1 1 100%;
      padding: 1rem;
      border-right: 1px solid #ddd;
      background: #f0f0f0;
      text-decoration: none;
      font-weight: 600;
      color: #000;
      &:not(.active):hover {
        background: #f7f7f7;
      }
      &.active {
        background: #fff;
        border-bottom: 1px solid #fff;
        margin-bottom: -1px;
      }
      &:first-child {
        border-radius: 7px 0 0 0;
      }
      &:last-child {
        border-right: 0;
        border-radius: 0 7px 0 0;
      }
      svg {
        margin-right: 0.5rem;
      }
    }
  }
  article {
    line-height: 1.7;
    padding: 1rem;
    ol {
      margin: 0;
      padding: 0 0 0 1.5rem;
      > li {
        margin: 0 0 0.5rem;
      }
      ul {
        margin: 0.5rem 0.5rem 1rem;
        padding: 0 0 0 1rem;
      }
    }
  }
  code {
    border: 1px solid #ddd;
    background: #f0f0f0;
    border-radius: 7px;
    padding: 0.1rem 0.25rem;
    font-size: 0.8em;
  }
  pre {
    display: block;
    code {
      padding: 0.5rem 1rem;
      display: block;
    }
  }
`;

class FormEmbed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      section: "wordpress",
    };
  }
  _handleNavClick = (section) => (ev) => {
    ev.preventDefault();
    this.setState({ section });
  };
  render() {
    const { campaign } = this.props;
    const { section } = this.state;
    return (
      <Container>
        <nav>
          <a
            href="#"
            className={section == "wordpress" ? "active" : ""}
            onClick={this._handleNavClick("wordpress")}
          >
            <FontAwesomeIcon icon={["fab", "wordpress"]} />
            <FormattedMessage
              id="app.form_embed.wp_plugin_label"
              defaultMessage="WordPress Plugin"
            />
          </a>
          <a
            href="#"
            className={section == "html" ? "active" : ""}
            onClick={this._handleNavClick("html")}
          >
            <FontAwesomeIcon icon="code" />
            <FormattedMessage
              id="app.form_embed.html_label"
              defaultMessage="HTML code"
            />
          </a>
        </nav>
        {section == "wordpress" ? (
          <article>
            <ol>
              <li>
                <FormattedMessage
                  id="app.form_embed.wp.step_01"
                  defaultMessage="Install {plugin_name} plugin;"
                  values={{
                    plugin_name: (
                      <a href="https://wordpress.org/plugins/liane-form">
                        Liane Form
                      </a>
                    ),
                  }}
                />
              </li>
              <li>
                <FormattedMessage
                  id="app.form_embed.wp.step_02"
                  defaultMessage="On your WordPress dashboard, access Settings > Liane Form;"
                />
              </li>
              <li>
                <FormattedMessage
                  id="app.form_embed.wp.step_03"
                  defaultMessage="Fill the form with the following:"
                />
                <ul>
                  <li>
                    Server: <code>{Meteor.absoluteUrl()}</code>
                  </li>
                  <li>
                    Campaign ID: <code>{campaign._id}</code>
                  </li>
                </ul>
              </li>
              <li>
                <FormattedMessage
                  id="app.form_embed.wp.step_03"
                  defaultMessage="Use {code} shortcode in any page or post inside your WordPress site!"
                  values={{ code: <code>[liane_form]</code> }}
                />
              </li>
            </ol>
          </article>
        ) : null}
        {section == "html" ? (
          <article>
            <p>
              <FormattedMessage
                id="app.form_embed.html.step_01"
                defaultMessage="Place the script once inside {tag_01} or right before the {tag_02} closing tag:"
                values={{
                  tag_01: <code>{"<head>"}</code>,
                  tag_02: <code>{"</body>"}</code>,
                }}
              />
            </p>
            <pre>
              <code>{`<script type="text/javascript" src="${Meteor.absoluteUrl()}assets/liane-form.js"></script>`}</code>
            </pre>
            <hr />
            <p>
              <FormattedMessage
                id="app.form_embed.html.step_01"
                defaultMessage="Insert the following {tag} where you'd like the form to be displayed:"
                values={{
                  tag: <code>{"<div />"}</code>,
                }}
              />
            </p>
            <pre>
              <code>{`<div
  class="liane-form"
  data-url="${Meteor.absoluteUrl()}"
  data-campaignId="${campaign._id}"
></div>`}</code>
            </pre>
          </article>
        ) : null}
      </Container>
    );
  }
}

export default FormEmbed;

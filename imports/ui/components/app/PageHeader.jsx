import React, { Component } from "react";
import PropTypes from "prop-types";
import { Breadcrumb, Header, Divider } from "semantic-ui-react";
import styled from "styled-components";

const Wrapper = styled.section`
  margin: -4rem -4rem 2rem;
  padding: 4rem 4rem 1.7rem;
  background: #fff;
  border-bottom: 1px solid rgba(34, 36, 38, 0.11);
  .ui.header {
    margin: 3.75rem 0 0;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
  }
`;

export default class PageHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { title, titleTo, subTitle } = this.props;
    return (
      <Wrapper className="content-header">
        <Breadcrumb>
          <Breadcrumb.Section href="/">Dashboard</Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section>
            {subTitle ? (
              <a href={titleTo ? titleTo : `/${title.toLowerCase()}`}>
                {title}
              </a>
            ) : (
              <span>{title}</span>
            )}
          </Breadcrumb.Section>
          {subTitle ? (
            <span>
              <Breadcrumb.Divider icon="right angle" />
              <Breadcrumb.Section active>{subTitle}</Breadcrumb.Section>
            </span>
          ) : (
            ""
          )}
        </Breadcrumb>
        <Header as="h1" size="small">
          {subTitle ? subTitle : title}
        </Header>
      </Wrapper>
    );
  }
}

PageHeader.propTypes = {
  // current meteor user
  title: PropTypes.string,
  subTitle: PropTypes.string,
  titleTo: PropTypes.string
};

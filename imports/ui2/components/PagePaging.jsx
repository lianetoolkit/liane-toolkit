import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.nav`
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  p {
    flex: 0 0 auto;
    padding: 0.75rem 1rem;
    margin: 0;
    font-size: 0.7em;
    color: #666;
  }
  .spacer {
    flex: 1 1 100%;
  }
  a {
    flex: 0 0 auto;
    padding: 0.75rem 1rem;
    color: #333;
    &:hover,
    &:focus {
      color: #000;
    }
    &.disabled {
      cursor: default;
      color: #bbb;
    }
  }
`;

export default class PagePaging extends Component {
  handlePrev = () => {
    const { onPrev } = this.props;
    if (onPrev) {
      onPrev();
    }
  };
  handleNext = () => {
    const { onNext } = this.props;
    if (onNext) {
      onNext();
    }
  };
  hasPrev = () => {
    const { skip, count } = this.props;
    return count && skip;
  };
  hasNext = () => {
    const { skip, limit, count } = this.props;
    return count && skip * limit + limit < count;
  };
  render() {
    const { skip, limit, count, loading, children } = this.props;
    return (
      <Container className="page-paging">
        {isNaN(count) ? (
          <p>Calculating...</p>
        ) : (
          <p>
            {!count
              ? "No results"
              : `Showing ${skip * limit + 1}-${Math.min(
                  count,
                  skip * limit + limit
                )} out of ${count}`}
          </p>
        )}
        {children}
        <div className="spacer" />
        <a
          href="javascript:void(0);"
          onClick={this.handlePrev}
          className={this.hasPrev() ? "" : "disabled"}
        >
          <FontAwesomeIcon icon="chevron-left" />
        </a>
        <a
          href="javascript:void(0);"
          onClick={this.handleNext}
          className={this.hasNext() ? "" : "disabled"}
        >
          <FontAwesomeIcon icon="chevron-right" />
        </a>
      </Container>
    );
  }
}

import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const messages = defineMessages({
  noResults: {
    id: "app.paging.no_results",
    defaultMessage: "No results",
  },
  results: {
    id: "app.paging.results",
    defaultMessage: "Showing {page_start}-{page_end} out of {total}",
  },
});

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
  .navigator {
    display: flex;
    flex: 0 0 auto;
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
  }
  .children {
    font-size: 0.8em;
    display: flex;
    flex: 0 0 auto;
    .button {
      flex: 0 0 auto;
      padding: 0.25rem 0.7rem;
    }
  }
`;

class PagePaging extends Component {
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
    const { intl, skip, limit, count, loading, children } = this.props;
    return (
      <Container className="page-paging">
        {isNaN(count) ? (
          <p>
            <FormattedMessage
              id="app.paging.loading"
              defaultMessage="Calculating..."
            />
          </p>
        ) : (
          <p>
            {!count
              ? intl.formatMessage(messages.noResults)
              : intl.formatMessage(messages.results, {
                  page_start: skip * limit + 1,
                  page_end: Math.min(count, skip * limit + limit),
                  total: count,
                })}
          </p>
        )}
        <div className="spacer" />
        <div className="children">{children}</div>
        <div className="navigator">
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
        </div>
      </Container>
    );
  }
}

PagePaging.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PagePaging);

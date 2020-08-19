import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";

const messages = defineMessages({
  searchPlaceholder: {
    id: "app.faq.search.placeholder",
    defaultMessage: "Search for answers...",
  },
});

const Container = styled.div`
  input {
    font-size: 0.8em;
    padding: 0.5rem;
    margin: 0;
    border-color: #eee;
  }
  .disclaimer {
    margin: 0.5rem 0;
    font-size: 0.9em;
    color: #666;
  }
  .faq-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -0.25rem;
    article {
      margin: 0.5rem 0.25rem 0;
      font-size: 0.8em;
      flex: 1 1 20%;
      border-radius: 7px;
      border: 1px solid #ddd;
      padding: 0.5rem;
      outline: none;
      height: 145px;
      color: #444;
      cursor: pointer;
      position: relative;
      background: #fff;
      overflow: hidden;
      h3 {
        font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        margin: 0 0 0.25rem;
        font-weight: 600;
      }
      p {
        margin: 0;
      }
      &:hover {
        background: #f7f7f7;
        color: #111;
        &:after {
          background: linear-gradient(
            180deg,
            rgba(247, 247, 247, 0) 0%,
            rgba(247, 247, 247, 1) 75%
          );
        }
      }
      &.selected {
        background: #63c;
        color: #fff;
        border-color: #63c;
        &:after {
          background: linear-gradient(
            180deg,
            rgba(102, 51, 204, 0) 0%,
            rgba(102, 51, 204, 1) 75%
          );
        }
      }
      &:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 0 0 7px 7px;
        background: rgb(255, 255, 255, 0);
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 1) 75%
        );
      }
    }
  }
`;

class FAQSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isSearching: false,
      faq: [],
      searchResults: [],
      selected: false,
    };
  }
  componentDidMount() {
    const { faq } = this.props;
    if (!faq) {
      this.fetch();
    } else {
      this.setState({ faq });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange } = this.props;
    const { selected } = this.state;
    if (selected != prevState.selected && typeof onChange == "function") {
      onChange(selected);
    }
  }
  fetch = () => {
    const { campaignId, onLoad } = this.props;
    this.setState({ loading: true });
    Meteor.call("faq.query", { campaignId }, (err, res) => {
      this.setState({
        loading: false,
      });
      if (!err) {
        this.setState({
          faq: res,
        });
        if (typeof onLoad == "function") {
          onLoad(res);
        }
      }
    });
  };
  search = (str) => {
    const { faq } = this.state;
    let vals = faq.map((item) => item.question + " " + item.answer);
    let result = [];
    vals.forEach((v, i) => {
      if (v.toLowerCase().indexOf(str.toLowerCase()) != -1) {
        result.push(faq[i]);
      }
    });
    return result;
  };
  _handleChange = (ev) => {
    const { value } = ev.target;
    const { faq } = this.state;
    const result = value ? this.search(value) : [];
    this.setState({
      isSearching: !!value,
      searchResults: result,
      selected: result.length == 1 ? result[0]._id : false,
    });
  };
  _handleClick = (id) => (ev) => {
    ev.preventDefault();
    const { selected } = this.state;
    this.setState({
      selected: selected == id ? false : id,
    });
  };
  render() {
    const { intl } = this.props;
    const { loading, selected, isSearching, faq, searchResults } = this.state;
    const data = isSearching ? searchResults : faq;
    if (loading) return null;
    return (
      <Container className="faq-select">
        <input
          type="text"
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          onChange={this._handleChange}
          onKeyPress={(e) => e.key === "Enter" && e.preventDefault()}
        />
        <div className="faq-list">
          {data.map((item) => (
            <article
              key={item._id}
              tabIndex="-1"
              onClick={this._handleClick(item._id)}
              className={selected == item._id ? "selected" : ""}
            >
              <header>
                <h3>{item.question}</h3>
              </header>
              <section>
                <p>{item.answer}</p>
              </section>
            </article>
          ))}
        </div>
        <p className="disclaimer">
          <a href={FlowRouter.path("App.faq")} target="_blank">
            <FormattedMessage
              id="app.faq.search.disclaimer"
              defaultMessage="Access your FAQ page to view all available answers"
            />
          </a>
        </p>
      </Container>
    );
  }
}

FAQSelect.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(FAQSelect);

import React, { Component } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";

const Container = styled.div`
  display: flex;
  > * {
    flex: 1 1 100%;
    border-right: 1px solid #ddd;
    &:last-child {
      border-right: 0;
    }
    .input-label {
      font-size: 0.8em;
      margin: 0 0 0.5rem;
    }
  }
`;

export default class PeriodField extends Component {
  _handleChange = (index) => (date) => {
    const { name, onChange, value } = this.props;
    const newValue = [...(value || [])];
    newValue[index] = date;
    onChange && onChange({ target: { name, value: newValue } });
  };
  _getValue = (index) => {
    const { value } = this.props;
    if (value && value[index]) return value[index];
    return null;
  };
  render() {
    const { value } = this.props;
    return (
      <Container>
        <div>
          <DatePicker
            onChange={this._handleChange(0)}
            selected={this._getValue(0)}
            dateFormat="MM/yyyy"
            placeholderText="Start date"
            showMonthYearPicker
          />
        </div>
        <div>
          <DatePicker
            onChange={this._handleChange(1)}
            selected={this._getValue(1)}
            minDate={this._getValue(0)}
            dateFormat="MM/yyyy"
            placeholderText="End date"
            showMonthYearPicker
          />
        </div>
      </Container>
    );
  }
}

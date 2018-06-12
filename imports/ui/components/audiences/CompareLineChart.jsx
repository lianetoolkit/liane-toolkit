import React from "react";
import styled, { css } from "styled-components";
import AudienceUtils from "./Utils.js";

const Wrapper = styled.div`
  height: 2rem;
  background: #fff;
  padding: 2px;
`;

const Container = styled.div`
  float: left;
  width: 50%;
  box-sizing: border-box;
  text-align: right;
  position: relative;
  border-right: 1px solid #bbb;
  &:last-child {
    border-right: 0;
  }
  height: 100%;
  ${props =>
    props.left &&
    css`
      text-align: left;
    `} ${props =>
    props.right &&
    css`
      text-align: right;
    `};
`;

const Bar = styled.div`
  background: #f9f9f9;
  border: 1px solid #eee;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  bottom: 0;
  transition: all ease-in-out 0.5s;
  ${props =>
    props.left &&
    css`
      background: #82ca9d;
      left: 0;
    `} ${props =>
    props.right &&
    css`
      background: #8884d8;
      right: 0;
    `};
`;

const Label = styled.div`
  position: relative;
  z-index: 1;
  padding: 0 0.8rem;
  line-height: 2rem;
  font-size: 0.6em;
  text-transform: uppercase;
  color: #333;
  span {
    color: #333;
    font-weight: 600;
    display: inline-block;
    font-size: 1.3em;
    line-height: 1.8rem;
    width: 4em;
  }
  ${props =>
    props.left &&
    css`
      span {
        float: left;
      }
    `} ${props =>
    props.right &&
    css`
      span {
        float: right;
      }
    `};
`;

export default class CompareLineChart extends React.Component {
  _getPercentage(type) {
    const audience = AudienceUtils.transformValues(this.props.audience);
    let cent = 0,
      keys;
    switch (type) {
      case "account":
        keys = ["estimate", "total"];
        break;
      case "location":
        keys = ["location_estimate", "location_total"];
        break;
    }
    if (audience[keys[1]] > 1500) {
      cent = audience[keys[0]] / audience[keys[1]];
    }
    return Math.min(cent, 0.99);
  }
  _format(cent) {
    if (cent > 0.0) {
      return (cent * 100).toFixed(2) + "%";
    } else {
      return "--";
    }
  }
  render() {
    const { audience } = this.props;
    const diffs = [
      this._getPercentage("location"),
      this._getPercentage("account")
    ];
    return (
      <Wrapper>
        <Container right>
          <Bar right style={{ width: diffs[0] * 100 + "%" }} />
          <Label right>
            Location
            <span>{this._format(diffs[0])}</span>
          </Label>
        </Container>
        <Container left>
          <Bar left style={{ width: diffs[1] * 100 + "%" }} />
          <Label left>
            Page
            <span>{this._format(diffs[1])}</span>
          </Label>
        </Container>
      </Wrapper>
    );
  }
}

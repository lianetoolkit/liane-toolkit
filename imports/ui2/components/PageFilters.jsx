import React, { Component } from "react";
import styled from "styled-components";

export default styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-size: 0.8em;
  .filters {
    flex: 1 1 100%;
    overflow: auto;
    padding: 3rem 0 2rem 1rem;
  }
  .main-input {
    font-size: 1.2em;
    background: #fff;
  }
  .actions {
    flex: 0 0 auto;
    .button {
      background: #fff;
      margin: 0;
      border-color: #ddd;
      border-right: 0;
      .icon {
        border-color: #ddd;
      }
      .disabled {
        color: #999;
      }
    }
  }
  label {
    display: flex;
    align-items: center;
    border-radius: 7px;
    border: 1px solid #ddd;
    padding: 0.5rem 1rem;
    input[type="checkbox"],
    input[type="radio"] {
      flex: 0 0 auto;
      margin: 0 1rem 0 0;
    }
    .tip {
      display: block;
      font-size: 0.8em;
      color: #999;
    }
  }
  h4 {
    margin: 0 0 0.5rem;
    color: #666;
    font-weight: 600;
  }
  .from-to-input {
    font-size: 0.8em;
    margin: 0 0 1rem;
    .input {
      display: flex;
      align-items: center;
      input {
        margin: 0;
        padding: 0.5rem;
      }
      .between {
        padding: 0 0.5rem;
      }
    }
  }
  .reaction-count-input {
    margin: 0 0 1rem;
    font-size: 0.8em;
    .input {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 0.5rem;
      span {
        white-space: nowrap;
        ${"" /* flex: 0 0 auto; */}
        display: inline-block;
        padding-right: 0.5rem;
        &:last-child {
          flex: 1 1 100%;
          padding-right: 0;
        }
      }
      input {
        padding: 0.5rem;
        margin: 0;
        width: 100%;
      }
    }
  }
`;

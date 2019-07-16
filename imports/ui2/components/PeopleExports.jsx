import React, { Component } from "react";
import styled from "styled-components";
import moment from "moment";

import { alertStore } from "../containers/Alerts.jsx";

import Table from "./Table.jsx";
import Button from "./Button.jsx";

const Container = styled.div`
  margin: -2rem;
  overflow: hidden;
  border-radius: 0 0 7px 7px;
  position: relative;
  .tip {
    font-size: 0.8em;
    color: #666;
    margin: 1rem 2rem;
  }
  .not-found {
    margin: 2rem;
    text-align: center;
    font-size: 1.2em;
    color: #999;
    font-style: italic;
  }
  .button {
    font-size: 0.8em;
    text-align: center;
  }
  .expired {
    font-size: 0.8em;
    color: #999;
    font-style: italic;
  }
  .expiration {
    font-weight: 600;
  }
  .date {
    font-size: 0.9em;
  }
  .button {
    color: #fff;
    &:hover,
    &:active,
    &:focus {
      color: #fff;
      background-color: #333;
    }
  }
`;

export default class PeopleLists extends Component {
  render() {
    const { peopleExports } = this.props;
    return (
      <Container>
        {peopleExports && peopleExports.length ? (
          <>
            <Table compact>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Prazo de expiração</th>
                  <th>Pessoas</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {peopleExports.map(item => (
                  <tr key={item._id} className={item.expired ? "expired" : ""}>
                    <td className="date">
                      {moment(item.createdAt).format("LLL")}
                    </td>
                    <td className="expiration">
                      {moment(item.expiresAt).fromNow()}
                    </td>
                    <td>{item.count} pessoas</td>
                    <td>
                      {item.expired ? (
                        "Exportação expirou"
                      ) : (
                        <a href={item.url} target="_blank" className="button">
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : (
          <p className="not-found">Nenhum arquivo de exportação encontrado</p>
        )}
      </Container>
    );
  }
}

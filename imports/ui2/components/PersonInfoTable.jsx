import React, { Component } from "react";
import styled from "styled-components";

import Table from "../components/Table.jsx";

const Container = styled.div`
  .table {
    > tbody {
      > tr:first-child {
        > * {
          border-top-left-radius: 7px;
        }
      }
      > tr:last-child {
        > * {
          border-bottom-left-radius: 7px;
        }
      }
    }
  }
`;

export default class PersonInfoTable extends Component {
  render() {
    return (
      <Container>
        <Table>
          <tbody>
            <tr>
              <th>Nascimento</th>
              <td className="fill">xx/xx/xxxx</td>
            </tr>
          </tbody>
        </Table>
      </Container>
    );
  }
}

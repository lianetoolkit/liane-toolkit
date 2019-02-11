import React, { Component } from "react";

import Page from "../components/Page.jsx";
import Content from "../components/Content.jsx";
import Table from "../components/Table.jsx";

export default class PeoplePage extends Component {
  render() {
    return (
      <Page>
        <Content full={true}>
          <Table>
            <tbody>
              <tr>
                <td>Fulano</td>
                <td>De tal</td>
              </tr>
              <tr>
                <td>Fulano</td>
                <td>De tal</td>
              </tr>
            </tbody>
          </Table>
        </Content>
      </Page>
    );
  }
}

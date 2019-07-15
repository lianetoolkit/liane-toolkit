import React, { Component } from "react";
import styled from "styled-components";
import { get } from "lodash";

import Table from "../components/Table.jsx";

const dataMap = [
  {
    label: "Nascimento",
    data: "campaignMeta.basic_info.birthday"
  },
  {
    label: "Gênero",
    data: "campaignMeta.basic_info.gender"
  },
  {
    label: "Endereço",
    data: "location.formattedAddress"
  },
  {
    label: "Habilidades",
    data: "campaignMeta.basic_info.skills"
  },
  {
    label: "Ocupação",
    data: "campaignMeta.basic_info.occupation"
  }
];

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
    td {
      color: #111;
    }
  }
  .not-found {
    font-size: 0.8em;
    color: #999;
    font-style: italic;
  }
`;

export default class PersonInfoTable extends Component {
  getValue = key => {
    const { person } = this.props;
    const data = get(person, key);
    if (!data) {
      return <span className="not-found">Informação não cadastrada</span>;
    }
    if (Array.isArray(data)) {
      return data.join(", ");
    }
    return data;
  };
  getExtra = () => {
    const { person } = this.props;
    return get(person, "campaignMeta.extra");
  };
  render() {
    const extra = this.getExtra();
    return (
      <Container>
        <Table>
          <tbody>
            {dataMap.map((d, i) => (
              <tr key={i}>
                <th>{d.label}</th>
                <td className="fill">{this.getValue(d.data)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {extra && extra.length ? (
          <>
            <h3>Informações extras</h3>
            <Table>
              <tbody>
                {extra.map((item, i) => (
                  <tr key={i}>
                    <th>{item.key}</th>
                    <td className="fill">{item.val}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : null}
      </Container>
    );
  }
}

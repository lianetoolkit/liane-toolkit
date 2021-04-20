import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import moment from "moment";
import { get } from "lodash";

import Table from "../components/Table.jsx";

import { defaultSkillsLabels } from "./SkillsConfig.jsx";
import { profileLabels } from "./PersonEdit.jsx";
import { genderLabels } from "./GenderField.jsx";

const dataMap = [
  {
    label: "birthday",
    data: "campaignMeta.basic_info.birthday",
  },
  {
    label: "gender",
    data: "campaignMeta.basic_info.gender",
  },
  {
    label: "address",
    data: "location.formattedAddress",
  },
  {
    label: "skills",
    data: "campaignMeta.basic_info.skills",
  },
  {
    label: "job",
    data: "campaignMeta.basic_info.occupation",
  },
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

class PersonInfoTable extends Component {
  getValue = (key) => {
    const { intl, person } = this.props;
    const data = get(person, key);
    if (!data) {
      return (
        <span className="not-found">
          <FormattedMessage
            id="app.people.profile.no_data_label"
            defaultMessage="Information not registered"
          />
        </span>
      );
    }
    if (key == "campaignMeta.basic_info.birthday" && data instanceof Date) {
      return (
        <FormattedMessage
          id="app.people.profile.birthday_data_text"
          defaultMessage="{date} ({age} years old)"
          values={{
            date: moment(data).format("L"),
            age: moment().diff(data, "years"),
          }}
        />
      );
    }
    if (key == "campaignMeta.basic_info.gender") {
      return genderLabels[data] ? intl.formatMessage(genderLabels[data]) : data;
    }
    if (key == "campaignMeta.basic_info.skills") {
      let skills = [];
      for (const skill of data) {
        skills.push(
          defaultSkillsLabels[skill]
            ? intl.formatMessage(defaultSkillsLabels[skill])
            : skill
        );
      }
      return skills.join(", ");
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
    const { intl } = this.props;
    const extra = this.getExtra();
    return (
      <Container>
        <Table>
          <tbody>
            {dataMap.map((d, i) => (
              <tr key={i}>
                <th>
                  {profileLabels[`${d.label}Label`]
                    ? intl.formatMessage(profileLabels[`${d.label}Label`])
                    : d.label}
                </th>
                <td className="fill">{this.getValue(d.data)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {extra && extra.length ? (
          <>
            <h3>
              <FormattedMessage
                id="app.people.profile.extra_info_label"
                defaultMessage="Extra info"
              />
            </h3>
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

PersonInfoTable.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PersonInfoTable);

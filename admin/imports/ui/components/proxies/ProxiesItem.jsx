import React from "react";

import { Popup, Rating } from "semantic-ui-react";
import ProxiesStats from "/imports/ui/components/proxies/ProxiesStats.jsx";
import moment from "moment";

const ProxiesItem = ({ proxyId }) =>
  <div>
    proxyId: <a href="#">{proxyId}</a>
  </div>;

const PopupProxyStats = ({ proxyId }) =>
  <Popup trigger={ProxiesItem({ proxyId })}>
    <Popup.Header>Proxy stats</Popup.Header>
    <Popup.Content>
      <ProxiesStats
        proxyId={proxyId}
        hours={48}
        timeOffset={moment().utcOffset()}
      />
    </Popup.Content>
  </Popup>;

export default PopupProxyStats;

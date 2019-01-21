import React from "react";
// import {
//   Box,
//   Button,
//   Collapsible,
//   Heading,
//   Grommet,
//   Layer,
//   ResponsiveContext
// } from "grommet";

import styled from "styled-components";

import "leaflet/dist/leaflet.css";

const theme = {
  global: {
    colors: {
      brand: "#228BE6"
    },
    font: {
      family: "Roboto",
      size: "14px",
      height: "20px"
    }
  }
};

// export default class AppContainer extends React.Component {
//   render() {
//     return (
//       <Grommet theme={theme} full>
//         <ResponsiveContext.Consumer>
//           {size => <div>{this.props.children}</div>}
//         </ResponsiveContext.Consumer>
//       </Grommet>
//     );
//   }
// }

export default styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  table {
    td {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  }
`;

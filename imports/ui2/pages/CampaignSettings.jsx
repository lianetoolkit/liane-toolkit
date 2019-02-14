import React, { Component } from "react";

import Page from "../components/Page.jsx";
import PageNav from "../components/PageNav.jsx";

export default class CampaignSettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = { active: 0 };
  }
  _go = active => () => {
    this.setState({ active });
  };
  render() {
    const { active } = this.state;
    return (
      <>
        <PageNav>
          <h3>Configurações da campanha</h3>
          <a
            href="javascript:void(0);"
            className={active == 0 ? "active" : ""}
            onClick={this._go(0)}
          >
            Configurações gerais
          </a>
          <a
            href="javascript:void(0);"
            className={active == 1 ? "active" : ""}
            onClick={this._go(1)}
          >
            Formulários
          </a>
          <a
            href="javascript:void(0);"
            className={active == 2 ? "active" : ""}
            onClick={this._go(2)}
          >
            Contas de Facebook
          </a>
          <a
            href="javascript:void(0);"
            className={active == 3 ? "active" : ""}
            onClick={this._go(3)}
          >
            Equipe
          </a>
          <a
            href="javascript:void(0);"
            className={active == 4 ? "active" : ""}
            onClick={this._go(4)}
          >
            Ações
          </a>
        </PageNav>
        <Page.Content>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            ullamcorper sit amet nunc quis varius. Quisque mattis non dui at
            posuere. Morbi pellentesque, purus ut efficitur porttitor, leo nulla
            efficitur dolor, in sollicitudin velit orci vitae ex. Sed accumsan
            vitae ex nec imperdiet. Integer at nulla sed magna lacinia gravida.
            Duis tempor fringilla velit, vel efficitur ligula pretium vel. Morbi
            a sagittis tortor. Sed tincidunt euismod auctor. Morbi hendrerit
            nisl id vulputate imperdiet. Vivamus vitae lacinia lorem, vitae
            pellentesque arcu. Aenean ut ullamcorper leo. Curabitur pretium
            luctus euismod.
          </p>

          <p>
            Pellentesque egestas sapien placerat magna luctus, quis hendrerit
            neque tincidunt. Praesent accumsan condimentum pulvinar. Cras
            volutpat arcu at mi tincidunt bibendum. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Pellentesque vestibulum et turpis sed
            malesuada. Proin id sollicitudin dolor. Suspendisse ac gravida dui.
            Donec rhoncus elementum suscipit. Duis pretium venenatis vestibulum.
            Nulla et iaculis nisi. Suspendisse potenti. Nunc condimentum
            faucibus nibh. Mauris eget elit odio.
          </p>

          <p>
            Etiam vel cursus risus. Aliquam feugiat euismod diam, nec congue
            enim convallis vitae. Ut faucibus vulputate dui, nec pharetra tellus
            efficitur sit amet. Proin viverra non felis vitae ullamcorper. In
            massa nulla, iaculis ac dolor sit amet, maximus vestibulum orci.
            Etiam lacinia vitae augue interdum fringilla. Sed non consectetur
            felis, ut rhoncus sem. Maecenas sed egestas dui, vitae imperdiet
            nulla. Nulla accumsan, libero eu imperdiet elementum, tortor dolor
            hendrerit eros, sit amet auctor tellus dolor sed sem. Aenean
            tincidunt accumsan luctus. In porttitor, erat in placerat feugiat,
            turpis mi vulputate sapien, semper tristique nisi nibh non felis.
            Vestibulum finibus vitae metus vel ullamcorper.
          </p>

          <p>
            Orci varius natoque penatibus et magnis dis parturient montes,
            nascetur ridiculus mus. Vivamus porta dolor quis vulputate ornare.
            Suspendisse tempor urna non sem convallis fermentum in non purus.
            Integer venenatis fermentum quam, at lobortis arcu luctus sed. Donec
            in accumsan mauris. Sed tincidunt, nisl nec sagittis facilisis, sem
            elit iaculis est, rutrum molestie sem velit nec nunc. Sed ut nunc
            ornare, consequat eros ut, ullamcorper arcu. Nullam ullamcorper
            viverra est, in fringilla metus placerat a. Maecenas non egestas
            velit. Nulla convallis a nibh in tempus. Sed euismod, urna quis
            scelerisque commodo, mauris nibh molestie ligula, ut ornare lacus
            velit eu libero.
          </p>

          <p>
            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
            posuere cubilia Curae; Ut dictum, lacus ac fermentum ultricies, odio
            mi interdum sem, sit amet pretium orci diam et tellus. Suspendisse
            mollis nulla felis, vel rhoncus turpis lacinia eu. Fusce mattis urna
            at accumsan lobortis. Praesent eu rutrum turpis. Nam vitae venenatis
            dolor, vel elementum arcu. Ut convallis non lacus sit amet mollis.
            Vivamus gravida, mauris et tempor suscipit, dui massa fringilla
            augue, ut mollis eros metus a magna. Pellentesque ligula risus,
            sagittis eget mi nec, porta auctor purus. Aenean ornare nisl in
            turpis faucibus euismod. Quisque rutrum aliquet erat a porttitor.
            Integer laoreet elementum posuere.
          </p>
        </Page.Content>
      </>
    );
  }
}

import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import AudiencesTargetingSpecForm from "/imports/ui/components/audiences/AudiencesTargetingSpecForm.jsx";
import { Form, Grid, Button, Select, Dropdown } from "semantic-ui-react";

export default class AddAudienceCategoriesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      targetingSpec: {}
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  _handleChange = (e, { name, value }) => this.setState({ [name]: value });
  _handleSubmit() {}
  getCategory(id) {
    // this.service.get(id).then(data => {
    //   this.setState({
    //     category: data
    //   });
    // });
  }
  componentDidUpdate() {
    console.log(this.state);
  }
  componentWillReceivesProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      if (nextProps.id) {
        this.getCategory(nextProps.id);
      } else {
        this.setState(Object.assign({}, initialCategory));
      }
    }
  }
  render() {
    const { loading, currentUser } = this.props;
    const { title, targetingSpec } = this.state;
    return (
      <div>
        <PageHeader title="Add Audience Category" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form onSubmit={this._handleSubmit}>
                    <Form.Input
                      placeholder="Title"
                      name="title"
                      value={title}
                      onChange={this._handleChange}
                    />
                    <AudiencesTargetingSpecForm
                      name="targetingSpec"
                      value={targetingSpec}
                      onChange={this._handleChange}
                    />
                    <Button>Send</Button>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}

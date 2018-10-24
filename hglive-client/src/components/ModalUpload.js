import React, { Component } from 'react';
import Spinner from 'react-svg-spinner';
import axios from 'axios';
import { 
  Button,
  ButtonGroup, 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Form, 
  FormGroup, 
  Label, 
  Input,
  Col, 
  FormText } from 'reactstrap';
import * as appConstants from '../Constants';

class ModalUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submit: "Submit",
      formEnabled: true,
      file: null,
      paddingMidpoint: this.props.params.paddingMidpoint,
      build: this.props.params.build,
      hgViewconfEndpointURL: this.props.params.hgViewconfEndpointURL,
      hgViewconfId: this.props.params.hgViewconfId,
      coordTableIsOpen: this.props.params.coordTableIsOpen
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggle = this.toggle.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  
  onCoordsFnChange = (event) => this.setState({ file: event.target.files[0] });
  
  onChange = (event) => this.setState({ [event.target.name]: event.target.value });
  
  onClick = (event) => {
    event.preventDefault();
    switch (event.target.name) {
      case "coordTableIsOpenOff":
        this.setState({ coordTableIsOpen: false });
        document.activeElement.blur();
        break;
      case "coordTableIsOpenOn":
        this.setState({ coordTableIsOpen: true });
        document.activeElement.blur();
        break;
      default:
        break;
    }
  }
  
  toggle() {
    var newParams = Object.assign({}, this.props.params);
    newParams.paddingMidpoint = this.state.paddingMidpoint;
    newParams.build = this.state.build;
    newParams.hgViewconfEndpointURL = this.state.hgViewconfEndpointURL;
    newParams.hgViewconfId = this.state.hgViewconfId;
    this.props.updateParams(newParams);
    this.props.toggle();
  }
  
  handleSubmit(event) {
    event.preventDefault();
    var formData = new FormData();
    formData.append('file', this.state.file);
    formData.append('paddingMidpoint', this.state.paddingMidpoint);
    formData.append('build', this.state.build);
    formData.append('hgViewconfEndpointURL', this.state.hgViewconfEndpointURL);
    formData.append('hgViewconfId', this.state.hgViewconfId);
    formData.append('coordTableIsOpen', this.state.coordTableIsOpen);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    this.setState({
      submit: <Spinner />,
      formEnabled: false
    }, () => {
      var coords = [];
      const uploadRouteURL = `http://${appConstants.host}:${appConstants.port}/upload`;
      axios.post(uploadRouteURL, formData, config)
        .then((res) => {
          var id = res.data.id;
          coords = res.data.coords;
          var destURL = `http://${appConstants.host}?id=${id}`;
          var stateObj = { id: id };
          window.history.pushState(stateObj, `hgLive - ${id}`, destURL);
        })
        .catch((err) => {
          console.log("error", err);
          var destURL = `http://${appConstants.host}/`;
          window.location.replace(destURL);
        })
        .finally(() => {
          setTimeout(() => {
            this.setState({
              submit: "Submit",
              formEnabled: true
            }, () => {
              this.props.updateCoords(coords);
              this.toggle();
              this.props.refresh();
              this.props.refreshHgView(this.state.hgViewconfEndpointURL, this.state.hgViewconfId);
            });
          }, 2000);
        });
    })
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.props.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>{this.props.title}</ModalHeader>
          <ModalBody>
            <Form innerRef={(form) => (this.uploadForm = form)}>
            
              <FormGroup row>
                <Label for="bedFile" sm={3}>Coordinates</Label>
                <Col sm={9}>
                  <Input type="file" name="coordsFn" id="bedFile" onChange={this.onCoordsFnChange} innerRef={(input) => (this.uploadInput = input)} />
                  <FormText color="muted">
                    {this.props.coordsBody}
                  </FormText>
                </Col>
              </FormGroup>
              
              <FormGroup row>
                <Label for="paddingMidpoint" sm={3}>Padding</Label>
                <Col sm={9}>
                  <Input type="text" name="paddingMidpoint" id="paddingMidpoint" value={this.state.paddingMidpoint} onChange={this.onChange} innerRef={(input) => (this.paddingMidpointInput = input)} />
                  <FormText color="muted">
                    {this.props.paddingBody}
                  </FormText>
                </Col>
              </FormGroup>
              
              <FormGroup row>
                <Label for="build" sm={3}>Genome</Label>
                <Col sm={9}>
                  <Input type="select" name="build" id="build" value={this.state.build} onChange={this.onChange} innerRef={(input) => (this.buildInput = input)}>
                    <option>hg38</option>
                    <option>hg19</option>
                  </Input>
                  <FormText color="muted">
                    {this.props.buildBody}
                  </FormText>
                </Col>
              </FormGroup>
              
              <FormGroup row>
                <Label for="coordTableIsOpen" sm={3}>Element Table</Label>
                <Col sm={9}>
                  <ButtonGroup>
                    <Button name="coordTableIsOpenOn" color={(this.state.coordTableIsOpen) ? "primary" : "secondary"} onClick={this.onClick}>On</Button>
                    <Button name="coordTableIsOpenOff" color={(!this.state.coordTableIsOpen) ? "primary" : "secondary"} onClick={this.onClick}>Off</Button>
                  </ButtonGroup>
                  <FormText color="muted">
                    {this.props.coordTableIsOpenBody}
                  </FormText>
                </Col>
              </FormGroup>
              
              <p className="lead">HiGlass parameters</p>
              
              <FormGroup row>
                <Label for="hgViewconfEndpointURL" sm={3}>Endpoint URL</Label>
                <Col sm={9}>
                  <Input type="text" name="hgViewconfEndpointURL" id="hgViewconfEndpointURL" value={this.state.hgViewconfEndpointURL} onChange={this.onChange} innerRef={(input) => (this.hgViewconfEndpointURLInput = input)} />
                  <FormText color="muted">
                    {this.props.hgViewconfEndpointURLBody}
                  </FormText>
                </Col>
              </FormGroup>
              
              <FormGroup row>
                <Label for="hgViewconfId" sm={3}>Viewconf ID</Label>
                <Col sm={9}>
                  <Input type="text" name="hgViewconfId" id="hgViewconfId" value={this.state.hgViewconfId} onChange={this.onChange} innerRef={(input) => (this.hgViewconfIdInput = input)} />
                  <FormText color="muted">
                    {this.props.hgViewconfIdBody}
                  </FormText>
                </Col>
              </FormGroup>

            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" disabled={!this.state.formEnabled} onClick={this.handleSubmit}>{this.state.submit}</Button>{' '}
            <Button color="secondary" disabled={!this.state.formEnabled} onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ModalUpload;
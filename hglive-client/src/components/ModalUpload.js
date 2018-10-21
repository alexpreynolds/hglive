import React, { Component } from 'react';
import Spinner from 'react-svg-spinner';
import axios from 'axios';
import { 
  Button, 
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
      file: null
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  onChange = (event) => this.setState({ file: event.target.files[0] });
  
  handleSubmit(event) {
    event.preventDefault();
    var self = this;
    var formData = new FormData();
    formData.append('file', this.state.file);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    self.setState({
      submit: <Spinner />,
      formEnabled: false
    }, function() {
      var coords = [];
      const uploadRouteURL = `http://${appConstants.host}:${appConstants.port}/upload`;
      axios.post(uploadRouteURL, formData, config)
        .then(function(res) {
          var id = res.data.id;
          coords = res.data.coords;
          var destURL = `http://${appConstants.host}?id=${id}`;
          var stateObj = { id: id };
          window.history.pushState(stateObj, `hgLive - ${id}`, destURL);
        })
        .catch(function(error) {
          console.log("error", error);
        })
        .finally(function() {
          setTimeout(function() {
            self.setState({
              submit: "Submit",
              formEnabled: true
            }, function() {
              this.props.updateCoords(coords);
              this.props.toggle();
              this.props.refresh();
            });
          }, 2000);
        });
    })
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.props.modal} toggle={this.props.toggle} className={this.props.className}>
          <ModalHeader toggle={this.props.toggle}>{this.props.title}</ModalHeader>
          <ModalBody>
            <Form innerRef={(form) => (this.uploadForm = form)}>
              <FormGroup row>
                <Label for="bedFile" sm={4}>Coordinates</Label>
                <Col sm={8}>
                  <Input type="file" name="coordsFn" id="bedFile" onChange={this.onChange} innerRef={(input) => (this.uploadInput = input)} />
                  <FormText color="muted">
                    {this.props.body}
                  </FormText>
                </Col>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" disabled={!this.state.formEnabled} onClick={this.handleSubmit}>{this.state.submit}</Button>{' '}
            <Button color="secondary" disabled={!this.state.formEnabled} onClick={this.props.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ModalUpload;
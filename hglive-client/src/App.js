import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Spinner from 'react-svg-spinner';
import axios from 'axios';
import ArrowKeysReact from 'arrow-keys-react';
import {
  Collapse,
  Nav,
  NavItem,
  Navbar,
  NavbarBrand,
  Button } from 'reactstrap';
import { 
  MdChevronLeft, 
  MdChevronRight, 
  MdFileUpload,
  MdSettings } from 'react-icons/md';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as appConstants from './Constants';
import ModalUpload from './components/ModalUpload';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      coords: [],
      currentCoordIdx: 0,
      mode: appConstants.modes.upload,
      modalUpload: false
    };
    this.updateCoords = this.updateCoords.bind(this);
    this.toggleUpload = this.toggleUpload.bind(this);
    this.parseQueryParameters = this.parseQueryParameters.bind(this);
    this.focusDiv = this.focusDiv.bind(this);
    this.mod = this.mod.bind(this);
    this.incrementCoordIdx = this.incrementCoordIdx.bind(this);
    this.decrementCoordIdx = this.decrementCoordIdx.bind(this);
    ArrowKeysReact.config({
      left: () =>  { this.decrementCoordIdx() },
      right: () => { this.incrementCoordIdx() },
      up: () =>    { this.decrementCoordIdx() },
      down: () =>  { this.incrementCoordIdx() }
    });
  }
  
  mod(n, p) {
    return n - p * Math.floor(n / p);
  }
  
  incrementCoordIdx() {
    this.setState({ 
      currentCoordIdx: this.mod((this.state.currentCoordIdx + 1), this.state.coords.length) 
    });
  }
  
  decrementCoordIdx() {
    this.setState({ 
      currentCoordIdx: this.mod((this.state.currentCoordIdx - 1), this.state.coords.length) 
    });
  }
  
  updateCoords(coords) {
    this.setState({
      coords: coords,
      currentCoordIdx: 0
    });
  }
  
  toggleUpload() {
    document.activeElement.blur();
    this.setState({
      modalUpload: !this.state.modalUpload
    });
  }
  
  parseQueryParameters() {
    function getJsonFromUrl() {
      var query = window.location.search.substr(1);
      var result = {};
      query.split("&").forEach(function(part) {
          var item = part.split("=");
          result[item[0]] = decodeURIComponent(item[1]);
      });
      return result;
    }
    var obj = getJsonFromUrl();
    if (obj && obj.id && obj.id.length > 0) {
      this.setState({
        id: obj.id,
        mode: appConstants.modes.view
      }, function() {
        var self = this;
        const coordinatesRouteURL = `http://${appConstants.host}:${appConstants.port}/coordinates/${self.state.id}`;
        axios.get(coordinatesRouteURL)
          .then(function(res) {
            self.updateCoords(res.data.coords);
          })
          .catch(function(error) {
            console.log("error", error);
            var destURL = `http://${appConstants.host}/`;
            self.updateCoords(null);
            window.location.replace(destURL);
          });
      });
    }
  }
  
  componentDidMount() {
    this.parseQueryParameters();
    this.focusDiv();
  }
  
  componentDidUpdate() {
    this.focusDiv();
  }
  
  focusDiv() {
    ReactDOM.findDOMNode(this.refs.hglive).focus();
  }
  
  render() {
    var coord = (this.state.coords) ? this.state.coords[this.state.currentCoordIdx] : null;
    return (
      <div ref="hglive" {...ArrowKeysReact.events} tabIndex="1" id="hglive">
        <Navbar color="dark" dark expand="md">
        
          <NavbarBrand>    
            {((this.state.mode === appConstants.modes.view) && (coord) && (coord.id.length > 0)) &&
              (
                <div className='interval-header'>
                  <div className='interval-header-content'>
                    {coord.id.replace(/_/g, ' ')}<br />
                    <div className='interval-header-content-subheader'>
                      {coord.chr + ':' + coord.start + '-' + coord.stop}
                    </div>
                  </div>
                </div>
              )
            }
            {((this.state.mode === appConstants.modes.view) && (coord) && (coord.id.length === 0)) &&
              (
                <div className='interval-header'>
                  <div className='interval-header-content-no-subheader'>
                    {coord.chr + ':' + coord.start + '-' + coord.stop}
                  </div>
                </div>
              )
            }
            {((this.state.mode === appConstants.modes.view) && (!coord)) &&
              (
                <div className='interval-header'>
                  <div className='interval-header-content'>
                    <Spinner color="white" />
                  </div>
                </div>
              )
            }
            {(this.state.mode === appConstants.modes.upload) &&  
              (
                <div>
                  hgLive
                </div>
              )
            }
          </NavbarBrand>
          
          {(this.state.mode === appConstants.modes.view) &&  
            (
              <Collapse isOpen={true} navbar>
                <Button size="sm" color="primary" className="ml-0" disabled={(!coord)} onClick={this.decrementCoordIdx}>
                  <MdChevronLeft 
                    size={16} 
                    color="white" />
                </Button>
                <Button size="sm" color="primary" className="ml-auto mr-0" disabled={(!coord)} onClick={this.incrementCoordIdx}>
                  <MdChevronRight
                    size={16} 
                    color="white" />
                </Button>
              </Collapse>
            )
          }
          
          {(this.state.mode === appConstants.modes.upload) &&  
            (
              <Collapse isOpen={true} navbar>
                <Nav className="ml-auto" navbar>
                  <NavItem>
                    <Button 
                      size="sm"
                      color="primary"
                      style={{marginRight:"8px"}}
                      onClick={this.toggleUpload} >
                      <MdFileUpload size={16} color="white" />Upload BED3+
                    </Button>
                    <Button 
                      size="sm" 
                      color="secondary" 
                      disabled>
                      <MdSettings 
                        size={16} 
                        color="white" />
                    </Button> 
                    <ModalUpload 
                      title="Upload"
                      body="Upload a three- or more column BED file (BED3+). Any data in the fourth column will be used to title the genomic position."
                      modal={this.state.modalUpload} 
                      updateCoords={this.updateCoords}
                      toggle={this.toggleUpload}
                      refresh={this.parseQueryParameters} />
                  </NavItem>
                </Nav>
              </Collapse>
            )
          }
          
        </Navbar>
      </div>
    );
  }
}

export default App;

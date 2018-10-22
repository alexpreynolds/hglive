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
import 'higlass/dist/hglib.css';
import { HiGlassComponent, ChromosomeInfo } from 'higlass';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      coords: [],
      currentCoordIdx: 0,
      mode: appConstants.modes.upload,
      modalUpload: false,
      hgViewParams: appConstants.hgViewDefaultParams,
      hgViewKey: 0
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
    this.hgView = React.createRef();
    this.updateHgViewPosition = this.updateHgViewPosition.bind(this);
    this.chromSizesURLForBuild = this.chromSizesURLForBuild.bind(this);
    this.updateHgViewPositionToCurrentCoord = this.updateHgViewPositionToCurrentCoord.bind(this);
  }
  
  mod(n, p) {
    return n - p * Math.floor(n / p);
  }
  
  incrementCoordIdx() {
    this.setState({ 
      currentCoordIdx: this.mod((this.state.currentCoordIdx + 1), this.state.coords.length) 
    }, function() {
      this.updateHgViewPositionToCurrentCoord();
    });
  }
  
  decrementCoordIdx() {
    this.setState({ 
      currentCoordIdx: this.mod((this.state.currentCoordIdx - 1), this.state.coords.length) 
    }, function() {
      this.updateHgViewPositionToCurrentCoord();
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
    //this.focusDiv();
  }
  
  chromSizesURLForBuild(build) {
    const urls = {
      'hg19' : 'http://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv',
      'hg38' : 'https://raw.githubusercontent.com/igvteam/igv/master/genomes/sizes/hg38.chrom.sizes'
    }
    return urls[build];
  }
  
  updateCoords(coords) {
    this.setState({
      coords: coords,
      currentCoordIdx: 0
    }, function() {
      this.updateHgViewPositionToCurrentCoord();
    });
  }
  
  updateHgViewPositionToCurrentCoord() {
    var coord = (this.state.coords) ? this.state.coords[this.state.currentCoordIdx] : null;
    this.updateHgViewPosition(this.state.hgViewParams.build, coord.chr, coord.start, coord.stop, coord.chr, coord.start, coord.stop);
  }
  
  updateHgViewPosition(build, chrA, startA, stopA, chrB, startB, stopB) {
    var self = this;
    self.setState({
      hgViewKey : self.state.hgViewKey + 1
    }, function() {
      ChromosomeInfo(self.chromSizesURLForBuild(build))
        .then((chromInfo) => {
          setTimeout(function() {
            self.hgView.zoomTo(
              appConstants.testViewConfig.views[0].uid,
              chromInfo.chrToAbs([chrA, parseInt(startA - self.state.hgViewParams.padding)]),
              chromInfo.chrToAbs([chrA, parseInt(stopA  + self.state.hgViewParams.padding)]),
              chromInfo.chrToAbs([chrB, parseInt(startB - self.state.hgViewParams.padding)]),
              chromInfo.chrToAbs([chrB, parseInt(stopB  + self.state.hgViewParams.padding)]),
              appConstants.hgViewAnimationTime
            );
          }, 1000);
        })
        .catch(err => console.error('Oh boy...', err));
    });
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
      <div ref="hglive" {...ArrowKeysReact.events} tabIndex="1" id="hglive-nav">
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
        <div id="hglive-content">
          <HiGlassComponent
            key={this.state.hgViewKey}
            ref={(component) => this.hgView = component}
            options={{ bounded: true }}
            viewConfig={appConstants.testViewConfig}
            />
        </div>
      </div>
    );
  }
}

export default App;

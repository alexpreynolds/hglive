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
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button } from 'reactstrap';
import { 
  MdChevronLeft, 
  MdChevronRight, 
  MdFileUpload } from 'react-icons/md';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import * as appConstants from './Constants';
import ModalUpload from './components/ModalUpload';
import 'higlass/dist/hglib.css';
import { HiGlassComponent, ChromosomeInfo } from 'higlass';
import 'higlass-multivec/dist/higlass-multivec.js';
import saveAs from 'file-saver';

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
      hgViewKey: 0,
      viewconf: {},
      exportDropdownIsOpen: false
    };
    this.updateCoords = this.updateCoords.bind(this);
    this.updateParams = this.updateParams.bind(this);
    this.toggleUpload = this.toggleUpload.bind(this);
    this.parseQueryParameters = this.parseQueryParameters.bind(this);
    this.updateQueryParametersToCurrentCoord = this.updateQueryParametersToCurrentCoord.bind(this);
    this.focusNavbar = this.focusNavbar.bind(this);
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
    this.updateHgViewPositionToCurrentCoord = this.updateHgViewPositionToCurrentCoord.bind(this);
    this.hgViewconfIsNotEmpty = this.hgViewconfIsNotEmpty.bind(this);
    this.hgViewconfDownloadURL = this.hgViewconfDownloadURL.bind(this);
    this.exportDropdownToggle = this.exportDropdownToggle.bind(this);
    this.exportDropdownItemSelect = this.exportDropdownItemSelect.bind(this);
    this.refreshHgView = this.refreshHgView.bind(this);
    
    // update viewconf from server endpoint
    axios.get(this.hgViewconfDownloadURL(this.state.hgViewParams.hgViewconfId))
      .then((res) => {
        this.setState({
          viewconf: res.data
        });
      })
      .catch((err) => {
        console.log("error", err);
      });
  }
  
  hgViewconfDownloadURL(id) {
    return this.state.hgViewParams.hgViewconfEndpointURL + appConstants.hgViewconfEndpointURLSuffix + id;
  }
  
  hgViewconfIsNotEmpty() {
    return Boolean(Object.keys(this.state.viewconf)[0])
  }
  
  mod(n, p) {
    return n - p * Math.floor(n / p);
  }
  
  incrementCoordIdx() {
    this.setState({ 
      currentCoordIdx: this.mod((this.state.currentCoordIdx + 1), this.state.coords.length) 
    }, function() {
      this.updateHgViewPositionToCurrentCoord();
      this.updateQueryParametersToCurrentCoord();
    });
  }
  
  decrementCoordIdx() {
    this.setState({ 
      currentCoordIdx: this.mod((this.state.currentCoordIdx - 1), this.state.coords.length) 
    }, function() {
      this.updateHgViewPositionToCurrentCoord();
      this.updateQueryParametersToCurrentCoord();
    });
  }
  
  toggleUpload() {
    document.activeElement.blur();
    this.setState({
      modalUpload: !this.state.modalUpload
    });
  }
  
  refreshHgView(id) {
    axios.get(this.hgViewconfDownloadURL(id))
      .then((res) => {
        this.setState({
          hgViewKey: this.state.hgViewKey + 1,
          viewconf: res.data
        });
      })
      .catch((err) => {
        console.log("error", err);
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
      var currentCoordIdx = 0;
      if (obj.idx) {
        currentCoordIdx = obj.idx;
      }
      this.setState({
        id: obj.id,
        currentCoordIdx: currentCoordIdx,
        mode: appConstants.modes.view
      }, () => {
        const coordinatesRouteURL = `http://${appConstants.host}:${appConstants.port}/coordinates/${this.state.id}`;
        axios.get(coordinatesRouteURL)
          .then((res) => {
            if (res.data.hgViewconfId !== this.state.hgViewParams.hgViewconfId) {
              this.refreshHgView(res.data.hgViewconfId);
            }
            this.updateParams({
              paddingMidpoint: res.data.paddingMidpoint,
              build: res.data.build,
              hgViewconfEndpointURL: res.data.hgViewconfEndpointURL,
              hgViewconfId: res.data.hgViewconfId
            });
            this.updateCoords(res.data.coords);
            console.log("self.state.hgViewParams.hgViewconfId",this.state.hgViewParams.hgViewconfId);
          })
          .catch((err) => {
            console.log("error", err);
            var destURL = `http://${appConstants.host}/`;
            //this.updateCoords(null);
            window.location.replace(destURL);
          });
      });
    }
  }
  
  updateQueryParametersToCurrentCoord() {
    var destURL = `http://${appConstants.host}?id=${this.state.id}&idx=${this.state.currentCoordIdx}`;
    var stateObj = { id: this.state.id, idx: this.state.currentCoordIdx };
    window.history.pushState(stateObj, `hgLive - ${this.state.id}`, destURL);
  }
  
  updateCoords(coords) {
    this.setState({
      coords: coords
    }, function() {
      this.updateHgViewPositionToCurrentCoord();
    });
  }
  
  updateParams(newParams) {
    this.setState({
      hgViewParams : newParams
    });
  }
  
  updateHgViewPositionToCurrentCoord() {
    var coord = (this.state.coords) ? this.state.coords[this.state.currentCoordIdx] : null;
    this.updateHgViewPosition(this.state.hgViewParams.build, coord.chr, coord.start, coord.stop, coord.chr, coord.start, coord.stop);
  }
  
  updateHgViewPosition(build, chrA, startA, stopA, chrB, startB, stopB) {
    ChromosomeInfo(appConstants.buildURLs[build])
      .then((chromInfo) => {
        setTimeout(() => {
          if (this.state.hgViewParams.paddingMidpoint === 0) {
            this.hgView.zoomTo(
              this.state.viewconf.views[0].uid,
              chromInfo.chrToAbs([chrA, startA]),
              chromInfo.chrToAbs([chrA, stopA]),
              chromInfo.chrToAbs([chrB, startB]),
              chromInfo.chrToAbs([chrB, stopB]),
              appConstants.hgViewAnimationTime
            );
          }
          else {
            var midpointA = startA + parseInt((stopA - startA)/2);
            var midpointB = startB + parseInt((stopB - startB)/2);
            this.hgView.zoomTo(
              this.state.viewconf.views[0].uid,
              chromInfo.chrToAbs([chrA, parseInt(midpointA - this.state.hgViewParams.paddingMidpoint)]),
              chromInfo.chrToAbs([chrA, parseInt(midpointA + this.state.hgViewParams.paddingMidpoint)]),
              chromInfo.chrToAbs([chrB, parseInt(midpointB - this.state.hgViewParams.paddingMidpoint)]),
              chromInfo.chrToAbs([chrB, parseInt(midpointB + this.state.hgViewParams.paddingMidpoint)]),
              appConstants.hgViewAnimationTime
            );
          }          
          this.focusNavbar();
        }, 1000);
      })
      .catch((err) => console.error('Oh boy...', err));
  }
  
  componentDidMount() {
    console.log("componentDidMount()");
    this.parseQueryParameters();
    this.focusNavbar();
  }
  
  componentDidUpdate() {
    console.log("componentDidUpdate()");
    this.focusNavbar();
  }
  
  focusNavbar() {
    ReactDOM.findDOMNode(this.refs.hglive).focus();
  }
  
  exportDropdownToggle() {
    this.setState({
      exportDropdownIsOpen: !this.state.exportDropdownIsOpen
    });
  }
  
  exportDropdownItemSelect(event) {
    function zeroPad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    switch (event.target.name) {
      case "bed":
        var bedStr = "";
        this.state.coords.forEach(function(elem) {
          var elems = [elem.chr, parseInt(elem.start), parseInt(elem.stop)];
          if (elem.id) {
            elems.push(elem.id);
          }
          bedStr += elems.join('\t') + '\n';
        });
        var bedFile = new File([bedStr], "hgLive.bed", {type: "text/plain;charset=utf-8"});
        saveAs(bedFile);
        break;
      case "json":
        var jsonObj = {
          id: this.state.id,
          coords: this.state.coords,
          params: {
            build: this.state.hgViewParams.build,
            paddingMidpoint: parseInt(this.state.hgViewParams.paddingMidpoint),
            hgViewconfEndpointURL: this.state.hgViewParams.hgViewconfEndpointURL,
            hgViewconfId: this.state.hgViewParams.hgViewconfId
          }
        };
        var jsonFile = new File([JSON.stringify(jsonObj)], "hgLive.json", {type: "text/json;charset=utf-8"});
        saveAs(jsonFile);
        break;
      case "svg":
        var svgStr = this.hgView.api.exportAsSvg();
        var coord = (this.state.coords) ? this.state.coords[this.state.currentCoordIdx] : null;
        
        var svgFile = new File([svgStr], ["hgLive", zeroPad(this.state.currentCoordIdx, 6), coord.chr + '_' + coord.start + '_' + coord.stop, coord.id.replace(/[^A-Za-z0-9]/g, "_"), "svg"].join("."), {type: "image/svg+xml;charset=utf-8"});
        saveAs(svgFile);
        break;
      default:
        break;
    }
    this.setState({
      exportDropdownIsOpen: !this.state.exportDropdownIsOpen
    });
  }
  
  render() {
    var coord = (this.state.coords) ? this.state.coords[this.state.currentCoordIdx] : null;
    return (
      <div ref="hglive" {...ArrowKeysReact.events} tabIndex="1" id="hglive-nav">
        <Navbar color="dark" dark expand="md" className="navbar-top">
        
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
                <div className='interval-header'>
                  <div className='interval-header-content'>
                    hgLive
                    <div className='interval-header-content-subheader'>
                      dynamic BED gallery browser | powered by <b>HiGlass</b>
                    </div>
                  </div>
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
                      onClick={this.toggleUpload} >
                      <MdFileUpload size={16} color="white" />Upload BED3+
                    </Button>
                  </NavItem>
                </Nav>
              </Collapse>
            )
          }
          
        </Navbar>
        <div id="hglive-content">
          { (this.hgViewconfIsNotEmpty()) &&
            (
              <HiGlassComponent
                key={this.state.hgViewKey}
                ref={(component) => this.hgView = component}
                options={{ bounded: true }}
                viewConfig={this.state.viewconf}
                />
            )
          }
        </div>
        <Navbar color="dark" dark expand="md" fixed="bottom" className="navbar-bottom" style={{minHeight:"49px",maxHeight:"49px"}}>
          {(this.state.mode === appConstants.modes.view) &&  
            (
              <NavbarBrand>
                <div className='interval-header'>
                  <div className='interval-header-content'>
                    Element {(this.state.currentCoordIdx + 1)} / {this.state.coords.length}
                  </div>
                </div>
              </NavbarBrand>
            )
          }
          {(this.state.mode === appConstants.modes.view) &&  
            (
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav navbar>
                  <Dropdown nav isOpen={this.state.exportDropdownIsOpen} toggle={this.exportDropdownToggle}>
                    <DropdownToggle nav caret className="exportDropdownToggle">
                      Export
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem name="bed" onClick={this.exportDropdownItemSelect}>BED</DropdownItem>
                      <DropdownItem name="json" onClick={this.exportDropdownItemSelect}>JSON</DropdownItem>
                      <DropdownItem name="svg" onClick={this.exportDropdownItemSelect}>SVG</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </Nav>
                <Nav className="ml-auto" navbar>
                  <NavItem>
                    <Button 
                      size="sm"
                      color="primary"
                      onClick={this.toggleUpload} >
                      <MdFileUpload size={16} color="white" />Upload BED3+
                    </Button>
                  </NavItem>
                </Nav>
              </Collapse>
            )
          }
        </Navbar>
        <ModalUpload 
          title="Upload coordinates"
          coordsBody={"Upload a three- or more column BED file (\"BED3+\"). Any data in the fourth column will be used to title the genomic position while browsing."}
          paddingBody={"Padding around midpoint of BED element (nt). Zero padding will leave element coordinates unchanged."}
          buildBody={"Genome assembly should match the coordinate space of the input BED file."}
          hgViewconfEndpointURLBody={"Specify HiGlass endpoint URL for retrieving view configuration."}
          hgViewconfIdBody={"Specify default view configuration ID."}
          modal={this.state.modalUpload} 
          updateCoords={this.updateCoords}
          toggle={this.toggleUpload}
          refresh={this.parseQueryParameters}
          refreshHgView={this.refreshHgView}
          params={this.state.hgViewParams}
          updateParams={this.updateParams}
          />
      </div>
    );
  }
}

export default App;

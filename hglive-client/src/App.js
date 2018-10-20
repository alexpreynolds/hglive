import React, { Component } from 'react';
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
      mode: appConstants.modes.upload,
      modalUpload: false
    };
    this.toggleUpload = this.toggleUpload.bind(this);
    this.parseQueryParameters = this.parseQueryParameters.bind(this);
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
        const completionStateRouteURL = `http://${appConstants.host}:${appConstants.port}/id/${self.state.id}`;
      });
    }
  }
  
  componentDidMount() {
    this.parseQueryParameters();    
  }
  
  render() {
    return (
      <div>
        <Navbar color="dark" dark expand="md">
        
          <NavbarBrand>    
            {(this.state.mode === appConstants.modes.view) &&  
              (
                <div className='interval-header'>
                  <div className='interval-header-content'>
                    interval001<br />
                    <div className='interval-header-content-subheader'>
                      chrZ:1234-4567
                    </div>
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
                <Button color="secondary" className="ml-0" disabled>
                  <MdChevronLeft 
                    size={32} 
                    color="white" />
                </Button>
                <Button color="secondary" className="ml-auto mr-0" disabled>
                  <MdChevronRight
                    size={32} 
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
                      color="primary"
                      style={{marginRight:"8px"}}
                      onClick={this.toggleUpload} >
                      <MdFileUpload size={32} color="white" />Upload BED3+
                    </Button>
                    <Button color="secondary" disabled>
                      <MdSettings 
                        size={32} 
                        color="white" />
                    </Button> 
                    <ModalUpload 
                      title="Upload BED3+"
                      body="Upload a three- or more column BED file. Any data in the fourth column will be used to title the genomic position."
                      modal={this.state.modalUpload} 
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

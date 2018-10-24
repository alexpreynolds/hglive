import React, { Component } from 'react';
import { 
  Button } from 'reactstrap';
import { 
  MdClose } from 'react-icons/md';
  
import * as appConstants from '../Constants';

// cf. https://github.com/react-bootstrap-table/react-bootstrap-table2/tree/master/docs
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';

class ElementTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMouseoverRow: -1
    };
  }
  
  render() {
    
    const columns = [
      {
        dataField: 'idx',
        text: '',
        headerStyle: {
          fontSize: '0.9em',
          borderBottom: '1px solid #b5b5b5'
        },
        style: {
          fontSize: '0.8em',
          outlineWidth: '0px',
          paddingLeft: '4px',
          paddingTop: '2px',
          paddingBottom: '2px',
          paddingRight: '6px',
          textAlign: 'right'
        },
        sort: true
      },
      {
        dataField: 'element',
        text: '',
        formatter: elementFormatter,
        headerStyle: {
          fontSize: '0.9em',
          width: '240px',
          borderBottom: '1px solid #b5b5b5'
        },
        style: {
          fontSize: '0.8em',
          outlineWidth: '0px',
          paddingLeft: '4px',
          paddingTop: '2px',
          paddingBottom: '2px',
          paddingRight: '6px',
        },
        sort: true,
        sortFunc: (a, b, order, dataField) => {
          if (order === 'asc') {
            return b.paddedPosition.localeCompare(a.paddedPosition);
          }
          else {
            return a.paddedPosition.localeCompare(b.paddedPosition); // desc
          }          
        }
      },
    ];
    
    function elementFormatter(cell, row) {
      return (cell.id) ? (
        <div><span style={{fontWeight:"600"}}>{ cell.id }</span><br /><span style={{fontSize:"smaller"}}>{ cell.position }</span></div>
      ) : (
        <div><span style={{fontWeight:"600"}}>{ cell.position }</span></div>
      );  
    }
    
    const customRowStyle = (row, rowIndex) => {
      const style = {};
      if (row.idx === this.props.currentCoordIdx) {
        style.backgroundColor = '#2631ad';
        style.color = '#fff';
      }
      else if (row.idx === this.state.currentMouseoverRow) {
        style.backgroundColor = '#0054ff';
        style.color = '#fff';
      }
      return style;
    };
    
    const customRowEvents = {
      onClick: (e, row, rowIndex) => {
        this.props.updateCurrentCoordIdx(row.idx);
      },
      onMouseEnter: (e, row, rowIndex) => {
        this.setState({
          currentMouseoverRow: row.idx
        });
      },
      onMouseLeave: (e, row, rowIndex) => {
        this.setState({
          currentMouseoverRow: -1
        });
      }
    };
    
    function zeroPad(n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    
    var data = [];
    this.props.coords.forEach((elem, idx) => {
      data.push({
        'idx' : idx + 1,
        'position' : elem.chr + ':' + elem.start + '-' + elem.stop,
        'id' : elem.id,
        'element' : {
          'paddedPosition' : zeroPad(elem.chr.replace(/chr/, ''), 3) + ':' + zeroPad(parseInt(elem.start), 12) + '-' + zeroPad(parseInt(elem.stop), 12),
          'position' : elem.chr + ':' + elem.start + '-' + elem.stop,
          'id' : elem.id.replace(/_/g, ' '),
        }
      })
    });
    
    return (
      <div>
        <div style={{display:"flow-root"}}>
          <h6 style={{float:"left",paddingTop:"4px"}}>Elements</h6>
          <Button name="close" size="sm" color="primary" className="btn-xs" onClick={this.props.toggle} style={{float:"right"}}>
            <MdClose 
              size={12} 
              color="white" 
              />
          </Button>
        </div>
        <div style={{overflowY:"scroll",height:"calc(100vh - 140px)"}}>
          <BootstrapTable 
            keyField='idx' 
            data={data} 
            columns={columns} 
            bootstrap4={true} 
            bordered={false}
            classes="elementTable"
            rowStyle={customRowStyle}
            rowEvents={customRowEvents}
            />
        </div>
      </div>
    );
  }
}

export default ElementTable;
export const host = 'ec2-18-217-14-21.us-east-2.compute.amazonaws.com';

export const port = 3000;

export const modes = {
  "view": 0, 
  "upload": 1
}
Object.freeze(modes);

export const buildURLs = {
  'hg19' : 'http://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv',
  'hg38' : 'https://raw.githubusercontent.com/igvteam/igv/master/genomes/sizes/hg38.chrom.sizes'
}
Object.freeze(buildURLs);

export const hgViewAnimationTime = 1500;

export const hgViewDefaultParams = {
  "build" : "hg38",
  "paddingMidpoint" : 100000,
  "hgViewconfEndpointURL" : "http://explorer.altius.org/",
  "hgViewconfId" : "OGE3pd95StKbn3yOkXUkCw"
}

export const hgViewconfEndpointURLSuffix = "api/v1/viewconfs/?d=";

export const testViewconfEndpointURL = "http://higlass.io/api/v1/viewconfs/?d=UUSPn8uSSEuIpHZFCOBRgA";
export const testViewConfig =
{
  "editable": true,
  "zoomFixed": false,
  "trackSourceServers": [
    "//higlass.io/api/v1"
  ],
  "exportViewUrl": "/api/v1/viewconfs",
  "views": [
    {
      "uid": "aa",
      "initialXDomain": [
        0,
        3100000000
      ],
      "autocompleteSource": "/api/v1/suggest/?d=OHJakQICQD6gTD7skx4EWA&",
      "genomePositionSearchBox": {
        "autocompleteServer": "//higlass.io/api/v1",
        "autocompleteId": "OHJakQICQD6gTD7skx4EWA",
        "chromInfoServer": "//higlass.io/api/v1",
        "chromInfoId": "hg19",
        "visible": true
      },
      "chromInfoPath": "//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
      "tracks": {
        "top": [
          {
            "type": "horizontal-gene-annotations",
            "height": 60,
            "tilesetUid": "OHJakQICQD6gTD7skx4EWA",
            "server": "//higlass.io/api/v1",
            "position": "top",
            "uid": "OHJakQICQD6gTD7skx4EWA",
            "name": "Gene Annotations (hg19)",
            "options": {
              "name": "Gene Annotations (hg19)",
              "labelColor": "black",
              "labelPosition": "hidden",
              "plusStrandColor": "blue",
              "minusStrandColor": "red",
              "trackBorderWidth": 0,
              "trackBorderColor": "black",
              "showMousePosition": false,
              "mousePositionColor": "#999999"
            },
            "header": ""
          },
          {
            "chromInfoPath": "//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
            "type": "horizontal-chromosome-labels",
            "position": "top",
            "name": "Chromosome Labels (hg19)",
            "height": 30,
            "uid": "X4e_1DKiQHmyghDa6lLMVA",
            "options": {
              "showMousePosition": false,
              "mousePositionColor": "#999999"
            }
          }
        ],
        "left": [
          {
            "type": "vertical-gene-annotations",
            "width": 60,
            "tilesetUid": "OHJakQICQD6gTD7skx4EWA",
            "server": "//higlass.io/api/v1",
            "position": "left",
            "name": "Gene Annotations (hg19)",
            "options": {
              "labelPosition": "bottomRight",
              "name": "Gene Annotations (hg19)",
              "labelColor": "black",
              "plusStrandColor": "blue",
              "minusStrandColor": "red",
              "trackBorderWidth": 0,
              "trackBorderColor": "black",
              "showMousePosition": false,
              "mousePositionColor": "#999999"
            },
            "uid": "dqBTMH78Rn6DeSyDBoAEXw",
            "header": ""
          },
          {
            "chromInfoPath": "//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
            "type": "vertical-chromosome-labels",
            "position": "left",
            "name": "Chromosome Labels (hg19)",
            "width": 30,
            "uid": "RHdQK4IRQ7yJeDmKWb7Pcg",
            "options": {
              "showMousePosition": false,
              "mousePositionColor": "#999999"
            }
          }
        ],
        "center": [
          {
            "uid": "c1",
            "type": "combined",
            "height": 200,
            "contents": [
              {
                "server": "//higlass.io/api/v1",
                "tilesetUid": "CQMd6V_cRw6iCI_-Unl3PQ",
                "type": "heatmap",
                "position": "center",
                "options": {
                  "maxZoom": null,
                  "labelPosition": "bottomRight",
                  "name": "Rao et al. (2014) GM12878 MboI (allreps) 1kb",
                  "backgroundColor": "#eeeeee",
                  "colorRange": [
                    "white",
                    "rgba(245,166,35,1.0)",
                    "rgba(208,2,27,1.0)",
                    "black"
                  ],
                  "colorbarPosition": "topRight",
                  "trackBorderWidth": 0,
                  "trackBorderColor": "black",
                  "heatmapValueScaling": "log",
                  "showMousePosition": false,
                  "mousePositionColor": "#999999",
                  "showTooltip": false,
                  "scaleStartPercent": "0.00000",
                  "scaleEndPercent": "1.00000"
                },
                "uid": "GjuZed1ySGW1IzZZqFB9BA",
                "name": "Rao et al. (2014) GM12878 MboI (allreps) 1kb",
                "transforms": [
                  {
                    "name": "ICE",
                    "value": "weight"
                  }
                ]
              }
            ],
            "position": "center",
            "options": {}
          }
        ],
        "right": [],
        "bottom": [],
        "whole": [],
        "gallery": []
      },
      "layout": {
        "w": 12,
        "h": 12,
        "x": 0,
        "y": 0,
        "i": "aa",
        "moved": false,
        "static": false
      },
      "initialYDomain": [
        716418835.1920693,
        2383581164.80793
      ]
    }
  ],
  "zoomLocks": {
    "locksByViewUid": {},
    "locksDict": {}
  },
  "locationLocks": {
    "locksByViewUid": {},
    "locksDict": {}
  },
  "valueScaleLocks": {
    "locksByViewUid": {},
    "locksDict": {}
  }
}
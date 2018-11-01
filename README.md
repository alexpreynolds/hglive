# hglive
HiGlass-backed dynamic BED gallery browser

This tool allows "live" browsing of BED files, rendering a specific HiGlass configuration at each BED element's genomic position.

![ec2-18-217-14-21 us-east-2 compute amazonaws com__id df96d9b7-c6d3-407e-94ce-2039e6a17c87 idx 6](https://user-images.githubusercontent.com/33584/47467340-c25bac00-d7aa-11e8-9e86-07cd2e25da1d.png)

The end user provides a BED file, and (optionally) specifies a custom HiGlass endpoint and view configuration ID.

The `hglive` tool is made up of a React frontend that mediates user interaction ("client"), and an Expressjs backend that handles BED and JSON coordinate and configuration files ("server").

## Requirements

This tool is running on an Ubuntu 16 host. It should work on any Linux or Unix-like host that can run nodejs.

This tool requires a running HiGlass server instance, such as http://explore.altius.org or http://higlass.io, etc. and a unique view configuration ID that is exported from that instance. The view configuration holds collections of tracks in the desired presentation, similar to how a session ID associates to a collection of tracks in a UCSC Genome Browser instance.

The current test server includes defaults for server and view configuration ID settings that are currently valid. The end user may choose to create and export a custom view configuration on a HiGlass server instance, adding those server and view ID settings when importing their BED file.

## Deployment

### Update hostname

Update hostname references:

```
$ grep -rl oldhost . | xargs sed -i 's/oldhost/newhost/g'
```

The `oldhost` and `newhost` variables would be different EC2 hostnames, e.g.:

```
$ grep -rl ec2-1-2-3-4.us-east-2.compute.amazonaws.com | xargs sed -i 's/ec2-1-2-3-4.us-east-2.compute.amazonaws.com/ec2-9-8-7-6.us-east-2.compute.amazonaws.com/g'
```

### Nodejs

#### Installation

```
$ cd ${HOME}
$ wget https://nodejs.org/dist/v10.11.0/node-v10.11.0-linux-x64.tar.xz
$ tar xvf node-v10.11.0-linux-x64.tar.xz
$ sudo ln -sf ${HOME}/node-v10.11.0-linux-x64/bin/node /usr/bin/node
$ sudo ln -sf ${HOME}/node-v10.11.0-linux-x64/bin/npm /usr/bin/npm
$ sudo ln -sf ${HOME}/node-v10.11.0-linux-x64/bin/npx /usr/bin/npx
```

### PM2

PM2 is used to manage the front- and backend services and logging.

#### Installation

```
$ sudo npm install pm2 -g
$ sudo ln -sf ${HOME}/node-v10.11.0-linux-x64/bin/pm2 /usr/bin/pm2
$ sudo ln -sf ${HOME}/node-v10.11.0-linux-x64/bin/pm2-dev /usr/bin/pm2-dev
$ sudo ln -sf ${HOME}/node-v10.11.0-linux-x64/bin/pm2-docker /usr/bin/pm2-docker
$ sudo ln -sf ${HOME}/node-v10.11.0-linux-x64/bin/pm2-runtime /usr/bin/pm2-runtime
$ sudo pm2 startup systemd
$ sudo chown ubuntu:ubuntu /home/ubuntu/.pm2/rpc.sock /home/ubuntu/.pm2/pub.sock
```

### Server

The following commands initialize the Expressjs service.

```
$ cd ${HOME}/git/hglive
$ mkdir assets
$ npm install --save
$ sudo pm2 start hglive-server.json
```

### Client

The following commands generate a build distribution of the React application and initializes a process manager to serve the production application from port 80.

```
$ cd ${HOME}/git/hglive/hglive-client
$ npm install --save
$ npm run build
...
$ sudo npm install -g serve
$ sudo ln -s /home/ubuntu/node-v10.11.0-linux-x64/bin/serve /usr/bin/serve
$ sudo pm2 start hglive-client-production.json
```

The `hglive-client-development.json` object can be loaded instead, to run a development environment that recompiles the application as code is changed.

### Persist PM2 setup

The following saves the PM2 process list, to restart services on reboot:

```
$ sudo pm2 save
```

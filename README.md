# hglive
HiGlass-backed dynamic BED gallery browser

This tool allows "live" browsing of BED files, rendering a specific HiGlass configuration at each BED element's genomic position.

The end user provides a BED file, and (optionally) specifies a custom HiGlass endpoint and view configuration ID.

The `hglive` tool is made up of a React frontend that mediates user interaction ("client"), and an Expressjs backend that handles BED and JSON coordinate and configuration files ("server").

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

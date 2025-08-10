const fs = require('fs');
const path = require('path');

const serviceName = process.argv[2]; 
if (!serviceName) {
  console.error('Please provide a service name');
  process.exit(1);
}

const distPath = path.join(__dirname, `../dist/apps/${serviceName}`);
const pkg = {
  name: serviceName,
  version: '1.0.0',
  scripts: {
    start: 'node main.js'
  },
  dependencies: {
    "@nestjs/bull": "^11.0.3",
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/mapped-types": "*",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/platform-socket.io": "^11.1.5",
    "@nestjs/websockets": "^11.1.5",
    "axios": "^1.11.0",
    "bull": "^4.16.5",
    "chalk": "^5.4.1",
    "ioredis": "^5.6.1",
    "node-fetch": "^2.7.0",
    "p-queue": "^8.1.0",
    "performance-now": "^2.1.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "socket.io": "^4.8.1"
  }
};

fs.writeFileSync(path.join(distPath, 'package.json'), JSON.stringify(pkg, null, 2));
console.log(`Created package.json for ${serviceName}`);
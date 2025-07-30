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
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "rxjs": "^7.8.1"
  }
};

fs.writeFileSync(path.join(distPath, 'package.json'), JSON.stringify(pkg, null, 2));
console.log(`Created package.json for ${serviceName}`);
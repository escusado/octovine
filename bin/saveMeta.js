var argv = require('minimist')(process.argv.slice(2)),
    sh = require('execSync'),
    path = require('path'),
    storage = path.resolve('./storage'),
    removeCommand = 'rm '+storage+'/*',
    touchCommand = 'touch '+storage+'/'+encodeURIComponent(argv.data);

sh.run(removeCommand);
sh.run(touchCommand);
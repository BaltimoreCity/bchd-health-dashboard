module.exports = function (shipit) {
  require('shipit-deploy')(shipit);


  let program = require('commander');

  program
    .option('-r, --revision <rev>', 'Branch, commit or tag')
    .parse(process.argv);

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: '/usr/local/share/bchd/health-dashboard',
      repositoryUrl: 'git@github.com:BaltimoreCity/bchd-health-dashboard.git',
      ignores: ['.git', 'node_modules'],
      keepReleases: 2,
      deleteOnRollback: false,
      shallowClone: true
    },
    staging: {
      branch: (program.revision || 'develop')
    }
  });

  shipit.on('published', function() {
    shipit.remote('cd ' + shipit.releasePath + ' && npm install');
  });

  shipit.task('stop-app', function() {
    return shipit.remote("sudo systemctl stop healthdashboard.service")
  })

  shipit.task('start-app', function() {
    return shipit.remote('sudo systemctl daemon-reload && sudo systemctl restart healthdashboard.service');
  });

  // ingest the db and populate typeahead
  shipit.task('ingest-db', function() {
    var command = ['cd /usr/local/share/bchd/health-dashboard/current'];
    command.push('node ./scripts/ingest/ingest-death-records.js scripts/ingest/ocme-2017-09-11.csv 0');
    command.push('cd ./scripts/mongo-load && sh load-data-into-mongo.sh & cd ../../');
    return shipit.remote(command.join(' && '));
  });

  shipit.task('dropdb', function() {
    return shipit.remote('cd /usr/local/share/bchd/health-dashboard/current && npm run dropdb');
  });
};

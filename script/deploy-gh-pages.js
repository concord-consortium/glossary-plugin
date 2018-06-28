#!/usr/bin/env node

var ghpages = require('gh-pages');

// only publish text-decorator for now
ghpages.publish('packages/text-decorator', {
          src: [
            'README.md',
            'dist/**/*',
            'test/decorate-html.test.html',
            'test/decorate-react.test.html',
            'test/decorate-text.test.css'
          ]
        }, (err) => {
  console.log(!err ? `Success!` : `Error: ${err}`);

  console.log(`Site deployed to: https://concord-consortium.github.io/text-plugins/`);
});

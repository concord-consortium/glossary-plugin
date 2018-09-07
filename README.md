[![Build Status](https://travis-ci.org/concord-consortium/text-plugins.svg?branch=master)](https://travis-ci.org/concord-consortium/text-plugins)
[![Coverage Status](https://coveralls.io/repos/github/concord-consortium/text-plugins/badge.svg?branch=master)](https://coveralls.io/github/concord-consortium/text-plugins?branch=master)

# Text Plugins

Concord Consortium's Text Plugins is a set of interacting libraries which supports highlighting words in a page that 
launch a glossary component when clicked. The project is divided into two packages.

## Packages

### TextDecorator Library

The [TextDecorator](packages/text-decorator/README.md) library provides text decoration capabilities for HTML and React apps. 
Can be used to apply appropriate `<span>` tags and classes to application text to support the glossary or other applications.

### GlossaryClient

The [GlossaryPlugin](packages/glossary-plugin/README.md) package in an implementation of LARA PluginApp.
It consists of React components used to provide necessary UI and `lara-plugin.js` file that uses LARA PluginApp API
to initialize this UI and communicate with LARA.

## Development

The project is configured as a monorepo using [Lerna](https://github.com/lerna/lerna#readme).

To get started:
```
git clone https://github.com/concord-consortium/text-plugins.git
cd text-plugins
npm install
npx lerna bootstrap
```
To run unit tests for all packages, from the top-level text-plugins directory, run:
```
npm test
```

To run unit tests for a single package, e.g. `text-decorator`:
```
cd packages/text-decorator
npm test
```

The individual packages were based on different starter projects from different source:
  - text-decorator: https://github.com/alexjoverm/typescript-library-starter
  - glossary-plugin: https://github.com/wmonk/create-react-app-typescript
 
TypeScript is used for all packages.
All the projects use `jest` for testing.
The `text-decorator` package uses `rollup` while the `glossary-plugin` use `webpack`.

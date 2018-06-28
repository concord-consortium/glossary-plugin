[![Build Status](https://travis-ci.org/concord-consortium/text-plugins.svg?branch=master)](https://travis-ci.org/concord-consortium/text-plugins)
[![Coverage Status](https://coveralls.io/repos/github/concord-consortium/text-plugins/badge.svg?branch=master)](https://coveralls.io/github/concord-consortium/text-plugins?branch=master)

# Text Plugins

Concord Consortium's Text Plugins is a set of interacting libraries which supports highlighting words in a page that launch a popup glossary when clicked. The project is divided into two packages, the [Text Decorator](packages/text-decorator) which decorates application text with appropriate `<span>` tags and classes, and the [Glossary Component](packages/glossary-component) itself, which communicates with the Text Decorator and opens the glossary when appropriate.

## Development

The project is configured as a monorepo using [Lerna](https://github.com/lerna/lerna#readme) and [Yarn](https://yarnpkg.com/) [workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

To get started:
```
git clone https://github.com/concord-consortium/text-plugins.git
cd text-plugins
yarn install
lerna bootstrap
```
To run unit tests:
```
lerna run test
```
## TextDecorator Library

The [TextDecorator](packages/text-decorator/README.md) library provides text decoration capabilities for HTML and React apps. Can be used to apply appropriate `<span>` tags and classes to application text to support the glossary.

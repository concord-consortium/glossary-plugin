[![Build Status](https://travis-ci.org/concord-consortium/text-plugins.svg?branch=master)](https://travis-ci.org/concord-consortium/text-plugins)
[![Coverage Status](https://coveralls.io/repos/github/concord-consortium/text-plugins/badge.svg?branch=master)](https://coveralls.io/github/concord-consortium/text-plugins?branch=master)

# Text Plugins

Concord Consortium's Text Plugins is a set of interacting libraries which supports highlighting words in a page that launch a glossary component when clicked. The project is divided into four packages.

## Packages

### TextDecorator Library

The [TextDecorator](packages/text-decorator/README.md) library provides text decoration capabilities for HTML and React apps. Can be used to apply appropriate `<span>` tags and classes to application text to support the glossary or other applications.

### GlossaryClient

The [GlossaryClient](packages/glossary-client/README.md) package utilizes the TextDecorator library to provide glossary-specific text decoration for clients such as LARA. It relies on the GlossaryZoid package to communicate with the GlossaryComponent.

### GlossaryZoid

The [GlossaryZoid](packages/glossary-zoid/README.md) package utilizes the [zoid](https://github.com/krakenjs/zoid) library to provide the bridge between the GlossaryClient and the GlossaryComponent.

### GlossaryComponent

The [GlossaryComponent](packages/glossary-component/README.me) package provides the front-end user experience for the glossary. It relies on the GlossaryZoid package to communicate with the GlossaryClient. Ultimately, it should be deployed to a static location (e.g. https://glossary.concord.org).

### Dependency Diagram
```
        +----------------+      +-------------------+
        |                |      |                   |
        | GlossaryClient |      | GlossaryComponent |
        |                |      |                   |
        +-------+--------+      +--------+----------+
                |                        |
                |                        |
        +-------+---------------+        |
        |                       |        |
        |                       |        |
+-------+-------+            +--+--------+--+
|               |            |              |
| TextDecorator |            | GlossaryZoid |
|               |            |              |
+---------------+            +--------------+
```
Image created using [AsciiFlow](http://asciiflow.com/).

## Development

The project is configured as a monorepo using [Lerna](https://github.com/lerna/lerna#readme) and [Yarn](https://yarnpkg.com/) [workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

To get started:
```
git clone https://github.com/concord-consortium/text-plugins.git
cd text-plugins
yarn install
lerna bootstrap
```
To run unit tests for all packages, from the top-level text-plugins directory, run :
```
npm test  # or 'yarn test'
```

To run unit tests for a single package, e.g. `text-decorator`:
```
cd packages/text-decorator
npm test  # or 'yarn test'
```

The individual packages were based on different starter projects from different sources, and so they use a mix of technologies. TypeScript is used for all packages except `glossary-zoid`, which uses JavaScript with `Flow`. Most projects use `jest` for testing, but `glossary-zoid` uses `karma`, `mocha`, `chai`, `sinon`, etc. The `text-decorator` package uses `rollup` while the others use `webpack`.

## Managing Dependencies

The great thing about the Lerna monorepo structure using Yarn workspaces is that dependencies between the packages of the monorepo are maintained seamlessly without having to publish individual packages or manually npm link/unlink. By default, Yarn hoists most dependencies up to the top-level node_modules folder where they are de-duped, etc. If any package requires a particular version of a dependency that differs from the one hoisted to the top-level, then it will be installed locally for that package. To add a dependency to an individual package, e.g. `glossary-client` use
```
lerna add new-package [--dev] --scope=@concord-consortium/glossary-component
```

Lerna 2 doesn't have a command for removing dependencies. (Lerna 3 is slated to have one.) To remove a dependency from a single package, you can `cd` to the package directory and run `yarn remove` or use `yarn workspace`. `lerna boostrap` should be called after any dependency changes to keep the interlinking up to date. (`lerna add` calls `lerna bootstrap` automatically. Presumably, `lerna remove` will do the same.)
```
yarn workspace @concord-consortium/glossary-component remove new-package
lerna bootstrap
```

I've added a `lerna:remove` script to simplify the process of removing a dependency globally. It removes the specified dependency from every package and then runs `lerna bootstrap`.

### Troubleshooting Dependencies

By and large, dependency management with Lerna and Yarn workspaces just works as expected. In those situations where it doesn't work, however, it can lead to confusing symptoms. If you encounter seemingly inexplicable failures building or running tests, consider whether dependency management may be a factor. I've detailed two examples below for illustrative purposes and in hopes of preventing others from the spending the time I've spent tracking these down.

#### karma plugins

The `glossary-zoid` package uses Karma for its unit tests. One of Karma's features is that it reduces the need for explicit configuration by automatically loading as plugins all packages named `karma-*` installed at the same level of the `node_modules` folder as `karma` itself. This introduces an implicit dependency on where things are installed. While I was working on the `glossary-zoid` component, everything worked as expected. When I added the `glossary-component` to the monorepo, however, yarn installed the `karma-webpack` plugin in `glossary-zoid`'s node_modules instead of at the top-level. This meant `karma-webpack` was no longer a sibling of `karma` itself, which had been hoisted to the top-level along with all of its plugins. The result was that `karma-webpack` failed to load, meaning that adding the `glossary-component` package (which doesn't use karma) to the monorepo inexplicably broke the unit tests for the `glossary-zoid` component. The fix was to add the `nohoist` option for karma and its plugins to the `package.json`:
```
 "workspaces": {
  "packages": [
   "packages/*"
  ],
  "nohoist": [
   "**/karma",
   "**/karma-*"
  ]
 },
```

#### @types/react

The `text-decorator` library and the `glossary-component` are both TypeScript projects using React, and so they both specify `@types/react` as dependencies. At one point one was using `@types/react@16.4.1` while the other was using `@types/react@16.4.6`. I tried to standardize on `@types/react@16.4.6`, but yarn insisted on installing `@types/react@16.4.1` at the top-level (even though no package specified that version as a dependency) while installing `@types/react@16.4.6` locally with each package -- at which point `npm start` no started failing due to a types issue. Standardizing on `@types/react@16.4.1` everywhere resolved the issues.

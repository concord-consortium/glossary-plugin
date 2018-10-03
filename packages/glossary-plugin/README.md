# Glossary LARA plugin

## Authored state format

Example: 

```json
{
  "askForUserDefinition": true,
  "definitions": [
    {
      "word": "eardrum",
      "definition": "An eardrum is a membrane, or thin piece of skin, stretched tight like a drum.",
      "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Blausen_0328_EarAnatomy.png/500px-Blausen_0328_EarAnatomy.png",
      "video": "https://upload.wikimedia.org/wikipedia/commons/e/e3/View_of_Cape_Town_from_Table_mountain_01.mp4",
      "imageCaption": "Source: Wikipedia. This is a test caption. This is a test caption. This is a test caption.",
      "videoCaption": "Source: Wikimedia. This video is unrelated to an eardrum. This is a test caption."
    },
    {
      "word": "cloud",
      "definition": "A visible mass of condensed watery vapour floating in the atmosphere, typically high above the general level of the ground."
    }
  ]
}
```

Note that you can define glossary inline or specify URL to a JSON that contains it:

```json
{
  "url": "https://example.concord.org/glossary-definiton.json"
}
```

## LARA Plugin URL:

- `http://glossary-plugin.concord.org/version/<version_number>/plugin.js`

E.g.:

- http://glossary-plugin.concord.org/version/1.0.0-pre.1/plugin.js
- http://glossary-plugin.concord.org/version/1.0.0/plugin.js

## Development

### Initial steps

Use readme in the top-level directory. Lerna should pull dependencies for this project.
If you want to work only on this one, you can also do it:

1. Clone this repo and `cd` into packages/glossary-plugin
2. Run `npm install` to pull dependencies
3. Run `npm start` to run `webpack-dev-server` in development mode with hot module replacement

### Building

If you want to build a local version run `npm build`, it will create the files in the `dist` folder.
You *do not* need to build to deploy the code, that is automatic.  See more info in the Deployment section below.

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.

## Deployment

Production releases to S3 are based on the contents of the /dist folder and are built automatically by Travis
for each branch pushed to GitHub and each merge into production.

Merges into production are deployed to http://glossary-plugin.concord.org.

Other branches are deployed to http://glossary-plugin.concord.org/branch/<name>.

You can view the status of all the branch deploys [here](https://travis-ci.org/concord-consortium/text-plugins/branches).

### Testing

Run `npm test` to run all tests.

## License

Teaching Teamwork is Copyright 2018 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.

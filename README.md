# Glossary LARA plugin

## LARA Plugin URL:

`https://glossary-plugin.concord.org/version/<version_number>/plugin.js`

E.g.:

- https://glossary-plugin.concord.org/version/1.0.0-pre.1/plugin.js
- https://glossary-plugin.concord.org/version/1.0.0/plugin.js
- https://glossary-plugin.concord.org/version/1.1.0/plugin.js

## Authoring page

https://glossary-plugin.concord.org/authoring.html

Authoring page supports following URL parameters:
 - glossaryName
 - username
 - s3AccessKey

They can be used to set the initial value of text inputs. E.g.:

https://glossary-plugin.concord.org/authoring.html?glossaryName=test&username=joe&s3AccessKey=ABCXYZ

Authors should use IAM account that belongs this group:

https://console.aws.amazon.com/iam/home#/groups/Glossary-S3-Access

It limits access to their own directory based on the username (IAM username and username on the authoring page have to match).

## Authored state format

Authoring page UI should always generate a correct JSON. Existing format example:

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

## Translations

Translations are stored in JSON files in the `src/lang` folder are managed using poeditor.com.  To add new strings update the `en.json` file and run `npm run strings:push` after running `export POEDITOR_API_TOKEN=<TOKEN>` where `<TOKEN>` can be found under your user settings in poeditor.com.  To pull down translations run  `npm run strings:pull` after exporting the api token.

### Translation Mappings

Due to the need to support translations of languages not available on poeditor.com we have coopted existing languages we don't plan to use and mapped them to the unsupported languages.  Here is the current mapping:

| Existing Language | Mapped Language |
|-------------------|-----------------|
| Manx (gv)         | Yug'tun         |
| Maori (mi)        | Athabaskan      |
| Marathi (mr)      | Inuit           |


### Translations in the Dashboard (reporting)
If you would like to limit the language selection choices in the dashboard to only languages that exist
in the glossary definition then you can append a hash parameter to the dashboard report url in the portal.
To specify the glossary URL in the external-report url, add  `#glossaryUrl=<uri-encoded glossary url>`

This parameter name is defined as a constant in `get-url-param.tsx`

```typescript
  export const GLOSSARY_URL_PARAM = "glossaryUrl";
```

The value for this URL parameter can be viewed at the bottom of the glossary authoring interface.
When this URL parameter exists in the dashboard url, the dashboard fetches the
glossary definition from the glossary, and uses the `translations:` keys to find
supported language codes.

## Dashboard

The dashboard queries events within a class (denoted by a `contextId` equal to the portal class hash) to display the dashboard data.
The query uses the `activity_url` from the json data of the offering endpoint at the portal.  The `activity_url` is normally the
url like  `https://authoring.concord.org/activity/<id>` however for Activity Player activities the actvity is embedded as a parameter
within the activity url.  The code checks for the embedded activity url and extracts it as needed.

**NOTE**: This activity url parsing code expects a defined format.  This code is brittle and will need to change if/when that
format changes.


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

### Debug demo logging

The default logger does nothing when the application is not run in a plugin context (eg demo.html or dashboard.html).
To see log messages in the console in that context add DEBUG_LOG to the url query string:

`http://localhost:8080/demo.html?DEBUG_LOG`

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.

## Deployment

Production releases to S3 are based on the contents of the /dist folder and are built automatically by Travis
for each branch pushed to GitHub and each merge into production.

Merges into production are deployed to https://glossary-plugin.concord.org.

Other branches are deployed to https://glossary-plugin.concord.org/branch/<name>.

You can view the status of all the branch deploys [here](https://travis-ci.org/concord-consortium/glossary-plugin/branches).

### Testing

Run `npm test` to run all tests.

## License

Copyright 2018 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.

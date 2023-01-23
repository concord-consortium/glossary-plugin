\# Glossary LARA plugin

## LARA Plugin URL:

`https://glossary-plugin.concord.org/version/<version_number>/plugin.js`

E.g.:

- https://glossary-plugin.concord.org/version/1.0.0-pre.1/plugin.js
- https://glossary-plugin.concord.org/version/1.0.0/plugin.js
- https://glossary-plugin.concord.org/version/1.1.0/plugin.js


## New Authoring

Originally the glossary plugin supported an authoring class that was instantiated in a popup.  The new authoring renders a full page editing system that supports fully modeled glossaries in LARA.

Authors can create glossaries in the same way they can create activities and sequences.  The edit page of the glossary creates a new window level Javascript variable off the `LARA` window variable containing init information for the new authoring.  It the loads the glossary plugin which has a check for this new variable, and if present, renders the new glossary authoring page.

To support faster development a demo page is also available that acts as a fake LARA host.  When running locally it is available at:

http://localhost:8080/model-authoring-demo.html

There are two query parameters, described in the next section, that can be used to further ease development by allowing saves in the demo and displaying the current raw glossary JSON.

### Query Parameters

There are a few query query parameters that are checked in the glossary model authoring:

1. `dangerouslyEditJson` - when this is `true` a textarea is shown at the top of the page that allows
direct edits of the glossary JSON.  As noted by the parameter name this can be dangerous as no validation
is done other than to validate it parses as JSON.  This will be used to port over existing glossaries.
NOTE: the JSON shown is the initial glossary JSON, any updates done in the UI are not reflected in the
textarea.

2. `debugJson` - when this is `true` a div is shown at the bottom of the page with a static view of the
JSON.  This is useful for debugging.

3. `saveInDemo` - when this is `true` in the `model-authoring-demo.html` url any changes made in the demo
are saved in localstorage and then re-read on page load.  This is useful for development.

### Local setup in combination with LARA and AP runtime

1. In your code editor, open the [activity player repo](https://github.com/concord-consortium/activity-player), cd into it and npm start.
2. In another window of your code editor, open this repo, cd into and npm start.
3. In a third window, open the [LARA repo](https://github.com/concord-consortium/lara) and run docker-compose-up.
4. In your browser, navigate to http://app.lara.docker.
5. Login to LARA at and navigate to "Plugins" > "Create New Approved Script".
6. Paste in "http://localhost:`<PORT>`/manifest.json", with `<PORT>` as wherever you are currently hosting glossary-plugin.
7. Click "Load Manifest JSON" and the remaining fields should auto-populate. Then click "Create Approved Script."
8. You can now preview the glossary popup runtime in Activity Player, and the model authoring runtime in LARA.

### A note on updating glossary popup styling

Certain elements of the Glossary Popup including the header and outer divs are styled in two places for consistency across environments.
The styling for the relevant elements in model authoring can be found [here](https://github.com/concord-consortium/glossary-plugin/blob/new-sections/src/components/model-authoring/term-popup-preview.scss).
In Activity Player, the elements are styled [here](https://github.com/concord-consortium/activity-player/blob/master/src/components/activity-page/plugins/glossary-plugin.scss).
Any styling changes to the Glossary Popup that affect the shared elements should be updated in both places.


## Old Authoring
### Authoring page

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

### Authored state format

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

### Translations

Translations for glossary terms are provided by glossary authors/editors, while translations for runtime text are stored in JSON files in the `src/lang` folder and are managed using poeditor.com.  To add new strings update the `en.json` file and run `npm run strings:push` after running `export POEDITOR_API_TOKEN=<TOKEN>` where `<TOKEN>` can be found under your user settings in poeditor.com.  To pull down translations run  `npm run strings:pull` after exporting the api token.

#### Translation Mappings

Due to the need to support translations of languages not available on poeditor.com we have coopted existing languages we don't plan to use and mapped them to the unsupported languages.  Here is the current mapping:

| Existing Language | Mapped Language |
|-------------------|-----------------|
| Manx (gv)         | Yugtun          |
| Maori (mi)        | Athabaskan      |
| Marathi (mr)      | Inupiaq         |

#### Adding a new translation

1. Determine the language code and check if it is supported in POEditor by checking the `POEDITOR_LANG_CODE` map in the `poeditor-language-list.ts` file.
2. If the language is NOT supported in POEditor choose a obscure language as an alias for the language and add a mapping for it in the `CUSTOM_LANG_NAME_MAPPING` map in the `poeditor-language-list.ts` file.
3. In the poeditor.com web interface add a language using the language code selected.
4. In `strings-pull-project.sh` add the new language code to the `LANGUAGES=(...)` list.
5. Run `npm run strings:pull` after exporting the `POEDITOR_API_TOKEN` to pull down the new language json file.  Without any translations POEditor will use the English terms.  You can then run this again in the future when the translations have been entered in POEditor to update the json.
6. In `add-translation.tsx` add a mapping for the new language in the `allLanguages` map in alphabetical value order (the value is displayed).
7. In `i8n-context.ts` add an import line to import the new language json file and then add a mapping of the new language code to the import in the `UI_TRANSLATIONS` map.

#### Translations in the Dashboard (reporting)
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

The dashboard queries events within a class (denoted by a `contextId` equal to the portal class hash) to display the dashboard data.  The query uses the `activity_url` from the json data of the offering endpoint at the portal to search the `resourceUrl` attribute in the Firestore data.  The `resourceUrl` attribute is given to the plugin as part of the context object.  The `activity_url` is normally the url like  `https://authoring.concord.org/activity/<id>` however for Activity Player activities the activity is embedded as a parameter within the activity url.  The code checks for the embedded activity url and extracts it as needed.

**NOTE**: This activity url parsing code expects a defined format.  This code is brittle and will need to change if/when that
format changes.

## Updating Existing Glossary Words

The authoring UI does not currently provide a way to rename a glossary word so this must be done manually.  Here are the steps to do that:

1. In Lara, edit the glossary and note the glossary id (it is in the small gray text under glossary title).  For this example the id will be "oRKDulC2nuAoBjeIaAIh", which is the Waters glossary.
2. Login to the AWS console, load the S3 GUI and browse to models-resources > glossary-resources/ > oRKDulC2nuAoBjeIaAIh/ (note that last folder is id from previous step)
3. Download the glossary.json file from that folder in S3 and make any changes needed locally.
4. As a safe guard load https://jsonlint.com in your browser and validate the changed json from step 3.
5. When you have validated the changed glossary.json file upload it over the existing one in S3.
6. You may need to wait up to 5 minutes for CloudFront to see the change (and for the change to be visible in the Glossary). In the meantime you can verify the change was saved on S3 by using the S3 url shown in the GUI. If CloudFront seems "stuck" on the old content you can manually invalidate the path at:
   https://console.aws.amazon.com/cloudfront/home?region=us-east-1#distribution-settings:E1QHTGVGYD1DWZ
   The path to invalidate in this example would be:
   `/glossary-resources/oRKDulC2nuAoBjeIaAIh/glossary.json`

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

class ModelAuthoringDemoPage {
  getGlossaryTermsHeader() {
    return cy.get("[class^=model-authoring-app--leftColumn] [class^=panel--panel]:nth-child(1) [class^=panel--header]");
  }
  getSpanishLanguageHeader() {
    return cy.get("[class^=model-authoring-app--leftColumn] [class^=panel--panel]:nth-child(3) [class^=panel--header]");
  }
  getGlossarySettingsHeader() {
    return cy.get("[class^=model-authoring-app--rightColumn] [class^=panel--panel] [class^=panel--header]");
  }
}
export default ModelAuthoringDemoPage;

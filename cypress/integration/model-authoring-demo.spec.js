import ModelAuthoringDemoPage from "../support/elements/model-authoring-demo-page";

const modelAuthoringDemoPage = new ModelAuthoringDemoPage;

context("Test the demo app", () => {
  beforeEach(() => {
    cy.visit("/model-authoring-demo.html");
  });

  describe("Model Authoring Demo page", () => {
    it("renders gloassary terms and definitions", () => {
      modelAuthoringDemoPage.getGlossaryTermsHeader().should("contain", "Glossary Terms & Definitions");
      modelAuthoringDemoPage.getSpanishLanguageHeader().should("contain", "Language: Spanish");
      modelAuthoringDemoPage.getGlossarySettingsHeader().should("contain", "Glossary Settings");
    });
  });
});

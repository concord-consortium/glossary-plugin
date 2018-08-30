(() => {
  if (!(window as any).ExternalScript) {
    // LARA Plugin API not available. Nothing to do.
    return;
  }

  // tslint:disable-next-line:no-console
  console.log("LARA Plugin API available, GlossaryPlugin initialization");
})();

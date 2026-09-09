/**
 * background/index.ts — Pixel Image Extractor
 *
 * Configures side panel behavior to open when the user clicks the action icon.
 */
chrome.runtime.onInstalled.addListener((details) => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[Background] Failed to set side panel behavior on installed (${details.reason}): ${message}`
      );
    });
});

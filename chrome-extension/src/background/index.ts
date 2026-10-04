/**
 * background/index.ts — Pixel Image Extractor
 *
 * Background service worker handling extension lifecycle and routing.
 */

import { setupContextMenus, handleContextMenuClick } from './contextMenus';

// Extension installation lifecycle
chrome.runtime.onInstalled.addListener((details) => {
  // Configure side panel behavior to open on action click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Background] Failed to set side panel behavior (${details.reason}): ${message}`);
  });

  setupContextMenus();
});

// Top-level listener for context menu interactions
chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleContextMenuClick(info, tab);
});

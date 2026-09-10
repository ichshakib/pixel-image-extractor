## Summary
<!-- Provide a concise summary of the purpose and changes introduced in this pull request. -->

## Related Issues
<!-- Link relevant issues using keywords (e.g., "Fixes #12", "Closes #34"). -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change fixing an identified issue)
- [ ] ✨ New feature (non-breaking change adding new capability)
- [ ] 🎨 UI / UX refinement (visual styling, layout, or animations)
- [ ] ⚡ Performance optimization (memory, bundle size, or scanning speed)
- [ ] ♻️ Refactoring (code reorganization without functional alteration)
- [ ] 📝 Documentation update (README, guides, or docstrings)
- [ ] 🔧 Build / CI tooling update

## Component Scope
- [ ] **Side Panel:** React UI, Accordion FilterBar, ImageCards, or floating action bar
- [ ] **Content Script:** DOM & recursive Shadow DOM image extractor
- [ ] **Background Service Worker:** Context menus, `OffscreenCanvas`, or download pipeline
- [ ] **Format Converters:** PDF 1.4 generator, GIF encoder, or image format converters
- [ ] **Landing Web App:** `index.html`, `landing.css`, or `script.js`
- [ ] **Extension Configuration:** `manifest.config.ts`, permissions, or icons

## Compliance & Quality Checklist
- [ ] **Pure Vanilla CSS:** No Tailwind CSS or shadcn/ui introduced.
- [ ] **Theme Adaptation:** Respects system dark/light preferences via `@media (prefers-color-scheme: dark)`.
- [ ] **Strict TypeScript:** No implicit or explicit untyped `any`; proper interfaces maintained.
- [ ] **Privacy Preserving:** Processing remains 100% client-side; no tracking or asset transmission.
- [ ] **Build Verification:** Tested locally using `pnpm build` in `chrome-extension/` with 0 errors.
- [ ] **Extension Testing:** Manually verified in Google Chrome via `chrome://extensions/` (Load unpacked).

## Screenshots / Screen Recordings
<!-- For UI or visual changes, attach screenshots, GIFs, or short video recordings demonstrating the result. -->

## Testing Instructions
<!-- Step-by-step instructions for maintainers to verify and test your changes:
1. Load unpacked extension from `chrome-extension/dist`.
2. Navigate to [URL]
3. Perform [action]
4. Verify [expected result]
-->

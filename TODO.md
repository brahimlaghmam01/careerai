# TODO

## Resume download -> template selection flow
- [ ] Update `src/app/pages/TemplatesPage.tsx` to respect `redirect` query param and pass selected template back when user clicks a template.
- [ ] Update `src/app/pages/DownloadsPage.tsx` to ensure the “Choose Template” button passes the correct `redirect` back to downloads.
- [ ] (Optional/Recommended) Update `src/app/pages/TemplatePreviewPage.tsx` “Use this template” to respect `redirect` query param.
- [ ] Manual test the end-to-end flow:
  - Download without template -> choose template -> template selection returns -> download starts.
  - Direct template usage for CV builder remains unchanged.


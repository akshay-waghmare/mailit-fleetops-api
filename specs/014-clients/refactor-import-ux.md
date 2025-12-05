# Refactor Plan: Client Import UX & API Fixes

## Goal
Refactor the Client Import feature to match the user experience of the existing "Bulk Order Upload" feature. This includes a dedicated upload page, detailed progress/result reporting, and fixing the current API path mismatch.

## Current Issues
1. **API Path Mismatch**: Frontend calls `/api/clients/import`, Backend expects `/api/v1/clients/import`.
2. **Poor UX**: Current implementation is a simple dialog with no detailed feedback.
3. **Missing Error Reporting**: Users need to know which rows failed and why.

## Proposed Architecture

### Backend Changes
- **Endpoint**: Keep `/api/v1/clients/import`.
- **Response Structure**: Update `importClients` to return a detailed summary object instead of just a list of clients.
  ```java
  public class ClientImportResponse {
      private int totalProcessed;
      private int successCount;
      private int failureCount;
      private List<String> errors; // e.g., "Row 5: Missing Name"
      private List<ClientDto> importedClients;
  }
  ```

### Frontend Changes
- **New Component**: `ClientBulkImportComponent` (modeled after `BulkUploadComponent`).
  - Drag & drop zone.
  - Progress spinner/bar.
  - Results summary (Success/Fail counts).
  - Error list display.
- **Service Update**: `ClientService`
  - Fix API URL to use `v1`.
  - Add method `importClientsBulk(file: File): Observable<ClientImportResponse>`.
- **Routing**: Add `/clients/import` route.

## Task List

### Phase 1: Backend Refactoring
- [ ] Define `ClientImportResponse` DTO.
- [ ] Update `ClientService.java` (Backend) to return `ClientImportResponse`.
  - Catch exceptions per row and add to error list instead of failing the whole batch (if possible/desired) or just report the first fatal error. *Decision: Try to process all and report errors.*
- [ ] Update `ClientController.java` to return `ClientImportResponse`.

### Phase 2: Frontend Service & Routing
- [ ] Update `ClientService.ts`:
  - Fix `apiUrl` to include `/v1`.
  - Add `importClients` method returning `Observable<ClientImportResponse>`.
- [ ] Add route `clients/import` in `app.routes.ts` (or `app-routing.module.ts`).

### Phase 3: UI Implementation
- [ ] Create `ClientBulkImportComponent`.
  - Copy layout from `BulkUploadComponent`.
  - Adapt for Client data.
- [ ] Implement File Selection & Upload Logic.
- [ ] Implement Results Display (Success count, Error list).
- [ ] Add "Download Template" button (can generate a simple CSV/Excel on the fly or link to a static file).

### Phase 4: Cleanup
- [ ] Remove the old `ClientImportDialogComponent`.
- [ ] Update `ClientListComponent` "Import" button to navigate to `/clients/import`.

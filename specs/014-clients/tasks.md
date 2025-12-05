# Task Breakdown - Clients CSV Compatibility

## Phase 1: Backend Implementation

- [x] **Task 1.1: Database Migration**
  - Create Flyway migration `V{next}__add_legacy_client_fields.sql`.
  - Add new columns as nullable initially.
  - Update existing records with default values ('LEGACY-MIGRATED').
  - Alter columns to `NOT NULL` where required.
  - Add unique constraint on `contract_no` + `sub_contract_code`.
  - <!-- id: task-db-migration -->

- [x] Task 1.2: Entity & Repository Updates
  - [x] Update `Client.java` with new fields.
  - [x] Update `ClientRepository` with `findByContractNoAndSubContractCode`.
  - <!-- id: task-entity-repo -->

- [x] Task 1.3: Excel Parsing Service
  - [x] Implement ClientExcelParserService using Apache POI.
  - [x] Handle lenient parsing (treat all as strings).
  - <!-- id: task-csv-parser -->

- [x] Task 1.4: Client Service Logic
  - [x] Implement importClients method.
  - [x] Implement Upsert logic (Find -> Update/Create).
  - [x] Implement validation logic.
  - <!-- id: task-client-service -->

- [x] Task 1.5: Controller Implementation
  - [x] Add POST /api/v1/clients/import endpoint.
  - Update POST /api/v1/clients and PUT /api/v1/clients/{id}.
  - <!-- id: task-controller -->

## Phase 2: Frontend Implementation

- [x] Task 2.1: Client Service (Frontend)
  - [x] Create `client.service.ts` with import and CRUD methods.
  - <!-- id: task-fe-service -->

- [x] Task 2.2: Client List Component
  - [x] Create `ClientListComponent` with table view.
  - [x] Display legacy fields (Contract No, Sub Contract Code).
  - <!-- id: task-fe-list -->

- [x] Task 2.3: Import Dialog
  - [x] Create `ClientImportDialogComponent` for file upload.
  - [x] Handle upload progress and errors.
  - <!-- id: task-fe-import -->

- [x] Task 2.4: Navigation & Routing
  - [x] Add `/clients` route.
  - [x] Add "Clients" link to sidebar.
  - <!-- id: task-fe-nav -->

## Phase 3: Testing & Verification

- [ ] Task 3.1: Backend Testing
  - [ ] Run unit tests for ClientService and ExcelParserService.
  - <!-- id: task-test-backend -->

- [ ] Task 3.2: Frontend Testing
  - [ ] Verify file upload with sample Excel file.
  - [ ] Verify client list rendering.
  - <!-- id: task-test-frontend -->

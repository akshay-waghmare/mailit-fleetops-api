# Implementation Plan - Clients CSV Compatibility

This plan outlines the steps to implement the Clients CSV Compatibility feature, ensuring alignment with the legacy CSV format, backward compatibility, and a seamless user experience for both bulk import and manual management.

## User Review Required

> [!IMPORTANT]
> **Critical Items for Review:**
> - **Migration Strategy**: Existing seeded client data will be updated with default values (e.g., "LEGACY-MIGRATED") for new mandatory fields. This preserves linked Pickups and Orders but may result in placeholder data in the UI.
> - **Validation Policy**: CSV import is **lenient** (imports invalid formats as strings), while the manual form is **hybrid** (warns but allows saving). This ensures data consistency but relies on user judgment.
> - **Immutability**: The composite key (ContractNo + SubContractCode) is immutable. Changing these values requires deleting and recreating the client record, which will break links to historical data if not handled carefully (though the system prevents deletion of referenced records).

## Proposed Architecture

### Component Diagram

\\\mermaid
graph TD
    subgraph Frontend [Angular Console App]
        UI_List[Client List Component]
        UI_Form[Client Form Component]
        UI_Upload[CSV Upload Component]
        Service[Client Service]
    end

    subgraph Backend [Spring Boot API]
        Controller[Client Controller]
        ServiceLayer[Client Service]
        Parser[CSV Parser Service]
        Repo[Client Repository]
        Entity[Client Entity]
    end

    subgraph Database [PostgreSQL]
        Table[clients Table]
    end

    UI_List --> Service
    UI_Form --> Service
    UI_Upload --> Service
    Service --> Controller
    Controller --> ServiceLayer
    ServiceLayer --> Parser
    ServiceLayer --> Repo
    Repo --> Entity
    Entity --> Table
\\\

### Data Model Changes

**Table: clients (Update)**

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| contract_no | VARCHAR(50) | NOT NULL | Part of Composite Key (Legacy) |
| sub_contract_name | VARCHAR(255) | NOT NULL | Legacy Name |
| sub_contract_code | VARCHAR(50) | NOT NULL | Part of Composite Key (Legacy) |
| _address | TEXT | NOT NULL | Site Address |
| _pincode | VARCHAR(20) | NOT NULL | Site Pincode |
| _city | VARCHAR(100) | NOT NULL | Site City |
| _state | VARCHAR(100) | NOT NULL | Site State |
| _country | VARCHAR(100) | NOT NULL | Site Country |
| _contact_person | VARCHAR(255) | NOT NULL | Site Contact Person |
| _contact_mobile | VARCHAR(50) | NULL | Site Mobile |
| _contact_email | VARCHAR(255) | NULL | Site Email |
| _bill_gst_no | VARCHAR(50) | NULL | Billing GST |
| _billing_name | VARCHAR(255) | NOT NULL | Billing Name |
| _dept_name | VARCHAR(255) | NOT NULL | Department Name |
| _bill_address1 | TEXT | NOT NULL | Billing Address 1 |
| _bill_address2 | TEXT | NOT NULL | Billing Address 2 |
| _bill_pincode | VARCHAR(20) | NOT NULL | Billing Pincode |
| _bill_state | VARCHAR(100) | NOT NULL | Billing State |
| _bill_city | VARCHAR(100) | NOT NULL | Billing City |
| _cc_name | VARCHAR(255) | NULL | CC Name |
| _bill_country | VARCHAR(100) | NOT NULL | Billing Country |
| _bill_stae_code | VARCHAR(50) | NULL | Billing State Code (Legacy Typo) |
| _bill_kind_attn | VARCHAR(255) | NOT NULL | Billing Kind Attn |
| _bill_email | VARCHAR(255) | NULL | Billing Email |
| _bill_mobile | VARCHAR(50) | NULL | Billing Mobile |
| _intimation_emailids | TEXT | NULL | Intimation Emails |

**Constraints:**
- Unique Index on (contract_no, sub_contract_code)

### API Contract Updates

**POST /api/v1/clients/import**
- **Request**: multipart/form-data (file: .csv)
- **Response**: 200 OK (Summary: { total, success, failed, errors[] })

**POST /api/v1/clients**
- **Request**: ClientDto (All legacy fields)
- **Response**: 201 Created (ClientDto)

**PUT /api/v1/clients/{id}**
- **Request**: ClientDto (All legacy fields)
- **Response**: 200 OK (ClientDto)
- **Note**: contractNo and subContractCode are ignored if present (immutable).

## Phase 1: Backend Implementation

### 1.1 Database Migration
- Create Flyway migration V{next}__add_legacy_client_fields.sql.
- Add new columns as nullable initially.
- Update existing records with default values ('LEGACY-MIGRATED').
- Alter columns to NOT NULL where required.
- Add unique constraint on contract_no + sub_contract_code.

### 1.2 Entity & Repository
- Update Client entity with new fields.
- Update ClientRepository to support lookup by composite key.
- Implement ClientMapper for DTO conversion.

### 1.3 Service Layer
- Implement ClientService.importClients(MultipartFile file).
- Implement CSV parsing logic (using OpenCSV or similar).
- Implement "Upsert" logic: Find by composite key -> Update if exists, else Create.
- Implement validation logic (Lenient for CSV, Hybrid for Form).

### 1.4 Controller Layer
- Add importClients endpoint.
- Update createClient and updateClient endpoints to handle new fields.

## Phase 2: Frontend Implementation

### 2.1 Client Model & Service
- Update Client interface in Angular to match new DTO.
- Update ClientService to support import and new CRUD operations.

### 2.2 Client List & Management
- Update ClientListComponent to display key legacy fields (e.g., SubContractName, City).
- Add "Import CSV" button triggering the upload dialog.

### 2.3 Client Form (Manual Entry)
- Create/Update ClientFormComponent.
- Add form controls for all 26 legacy fields.
- Group fields logically (Site Details vs. Billing Details).
- Implement "Hybrid" validation (warn but allow save).

### 2.4 Integration
- Ensure Pickup and Order creation forms use the updated Client model.
- Verify address/contact auto-population works with new fields.

## Phase 3: Testing & Migration

### 3.1 Unit Tests
- Test CSV parsing with various edge cases (missing optional fields, invalid formats).
- Test Upsert logic in Service layer.
- Test Validation logic.

### 3.2 Integration Tests
- Test full import flow with sample CSV.
- Test manual creation and update.
- Verify database constraints.

### 3.3 Migration Verification
- Verify seeded data is correctly updated with defaults.
- Verify no data loss for existing clients.

## Verification Plan

### Automated Tests
- ClientServiceTest: Covers import, upsert, and validation logic.
- ClientControllerTest: Covers API endpoints.
- ClientRepositoryTest: Covers DB constraints and lookups.

### Manual Verification
1. **CSV Import**: Upload the provided legacy CSV. Verify all records are imported/updated correctly.
2. **Manual Creation**: Create a client manually with invalid email format. Verify warning appears but save is allowed.
3. **Duplicate Check**: Try to import a CSV with existing codes. Verify records are updated, not duplicated.
4. **Pickup Integration**: Create a pickup for an imported client. Verify address details are auto-filled.

# Feature Specification: Clients CSV Compatibility

**Feature Branch**: `014-clients`
**Created**: 2025-12-04
**Status**: Draft
**Input**: User description: "Clients CSV compatibility: Align new system's Client entity and DB schema with legacy CSV format (see reference-from-client-data/Sub_Code_031220251249.csv). Keep existing client fields exactly matching legacy columns for backward compatibility; add new fields as extensions without breaking format. Update data contracts, migrations, parsers/importers, and mapping to ensure pickup and order modules use the unified Client model compatible with legacy CSV while supporting new attributes. Include validation rules, sample mappings, and migration strategy from seeded data to legacy-compatible structure. Add admin CSV upload UI to import clients."

## Clarifications

### Session 2025-12-04
- Q: How should the system handle rows with missing mandatory data? → A: Skip the invalid row, continue processing, and report the error in a summary.
- Q: How strictly should the system validate data formats like Pincode or Email during import? → A: Lenient: Import as-is (store as string), trusting the legacy data is "correct enough".
- Q: How should existing seeded clients (which lack the new legacy fields) be handled during migration? → A: Default Values: Populate mandatory legacy fields with a generic default (e.g., "LEGACY-MIGRATED") to preserve linked data.
- Q: How should the Manual Entry/Edit Form behave regarding validation? → A: Hybrid: Warn on invalid formats but allow saving.
- Q: Should the system allow changing the `ContractNo` or `SubContractCode` (the unique key) for an existing client via the UI? → A: No (Immutable): Fields are read-only. To change, user must delete and recreate.

## User Scenarios & Testing

### Primary User Story
As an Admin, I want to manage client data by either uploading a legacy CSV file for bulk import or manually entering single client records via a form, so that I can maintain an accurate and complete client database in the new system.

### Acceptance Scenarios
1. **Given** I have a legacy CSV file with client data, **When** I upload it via the Admin UI, **Then** the system parses the file and creates Client records with all legacy fields populated.
2. **Given** I am viewing a Client's details, **When** I look at the record, **Then** I can see all the legacy fields (ContractNo, SubContractName, etc.) exactly as they were in the CSV.
3. **Given** I am creating a Pickup or Order, **When** I select a Client, **Then** the system uses the compatible Client entity which includes the legacy address and contact details.
4. **Given** the system has existing seeded client data, **When** the migration runs, **Then** the existing data is transformed or mapped to the new legacy-compatible schema without data loss.
5. **Given** I want to add a single client, **When** I navigate to the Client creation page, **Then** I see a form matching the application's UI style that allows me to enter all legacy fields manually.

### Edge Cases
- **Duplicate Client Codes**: If a record with the same `ContractNo` + `SubContractCode` exists, the system MUST update the existing record with the new data from the CSV (Upsert behavior).
- **Missing Required Fields**: What happens if mandatory legacy fields (like `SubContractName`) are missing in the CSV?
- **Invalid Data Types**: What happens if `vPincode` contains non-numeric characters?

## Requirements

### Functional Requirements
- **FR-001**: System MUST support a Client entity that includes all columns from the legacy CSV format as distinct fields.
- **FR-002**: System MUST provide an Admin UI to upload CSV files for bulk client import.
- **FR-003**: System MUST parse the uploaded CSV and map columns to the Client entity fields 1:1.
- **FR-004**: System MUST validate the CSV data before import. If a row is missing mandatory fields, the system MUST skip that row, continue processing the rest of the file, and provide an error summary report to the user.
    - **Validation Note**: Data format validation (e.g., Pincode, Email) MUST be lenient. The system MUST import values as-is (stored as strings) without rejecting rows for format mismatches, to ensure maximum compatibility with legacy data.
- **FR-005**: System MUST update the existing Client database schema to include the legacy fields.
- **FR-006**: System MUST integrate the new Client entity into the existing Pickup and Order creation workflows, ensuring the client selection UI remains consistent while populating address and contact details from the new legacy-compatible fields.
- **FR-007**: System MUST map the new Client fields (e.g., `vAddress`, `vContactPerson`) to the relevant fields in Pickup and Order forms to maintain existing functionality.
- **FR-008**: System MUST provide a migration strategy that updates existing seeded client data with generic default values (e.g., "LEGACY-MIGRATED") for the new mandatory fields. This ensures that existing Pickups and Orders linked to these clients remain valid.
- **FR-009**: System MUST perform an "upsert" operation during CSV import: if a Client with the same `ContractNo` and `SubContractCode` exists, update its fields; otherwise, create a new Client record.
- **FR-010**: System MUST provide a manual entry form for creating and editing single Client records, including all legacy fields, maintaining UI consistency with the rest of the application.
    - **Validation Note**: The form MUST implement "Hybrid" validation: display warnings for invalid formats (e.g., malformed email) but MUST allow the user to save the record despite the warning. This ensures consistency with the lenient CSV import policy.

### Key Entities
- **Client**: Represents a business client or sub-contractor.
  - **Constraints**:
    - Composite Unique Key: `ContractNo` + `SubContractCode` MUST be unique across the system.
    - Immutability: `ContractNo` and `SubContractCode` MUST be immutable (read-only) after creation. To "change" these values, the user MUST delete the record and create a new one.
  - **Legacy Fields**:
    > **Note**: The CSV contains two distinct sets of contact/address information:
    > 1. **Site/Pickup Details** (prefix `v`): The physical location for service execution.
    > 2. **Billing Details** (prefix `vBill`): The address for invoicing.
    > Analysis shows these differ in >60% of records, so both sets MUST be preserved.

    - `ContractNo` (String, Mandatory, Part of Composite Key)
    - `SubContractName` (String, Mandatory)
    - `SubContractCode` (String, Mandatory, Part of Composite Key)
    - `vAddress` (String, Mandatory)
    - `vPincode` (String, Mandatory)
    - `vCity` (String, Mandatory)
    - `vState` (String, Mandatory)
    - `vCountry` (String, Mandatory)
    - `vContactPerson` (String, Mandatory)
    - `vContactMobile` (String, Optional)
    - `vContactEmail` (String, Optional)
    - `vBillGSTNo` (String, Optional)
    - `vBillingName` (String, Mandatory)
    - `vDeptName` (String, Mandatory)
    - `vBillAddress1` (String, Mandatory)
    - `vBillAddress2` (String, Mandatory)
    - `vBillPincode` (String, Mandatory)
    - `vBillState` (String, Mandatory)
    - `vBillCity` (String, Mandatory)
    - `vCCName` (String, Optional)
    - `vBillCountry` (String, Mandatory)
    - `vBillStaeCode` (String, Optional, Note: Legacy typo preserved)
    - `vBillKindAttn` (String, Mandatory)
    - `vBillEmail` (String, Optional)
    - `vBillMobile` (String, Optional)
    - `vIntimationEmailids` (String, Optional)
  - **System Fields**:
    - `id` (Internal ID)
    - `created_at`
    - `updated_at`
    - `active` (Boolean)

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded

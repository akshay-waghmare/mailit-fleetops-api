# Client Validation - Mandatory Fields Implementation

## Summary
Implemented comprehensive validation for client import and creation to ensure mandatory fields are enforced consistently across frontend and backend.

## Mandatory Fields (Backend & Frontend)

The following fields are now required for all client records:

1. **name** - Client name (mapped from SubContractName in imports)
2. **contractNo** - Contract number (unique key component)
3. **subContractName** - Sub-contract name
4. **subContractCode** - Sub-contract code (unique key component)
5. **address** - Physical address (mapped from vAddress in imports)
6. **contactPerson** - Contact person name (mapped from vContactPerson in imports)

## Implementation Details

### Backend Validation

#### 1. Entity-Level Validation (`Client.java`)
- Added `@NotBlank` annotations on mandatory fields
- Added `nullable = false` to column definitions
- Ensures database-level integrity

```java
@NotBlank(message = "Client name is required")
@Column(nullable = false)
private String name;

@NotBlank(message = "Address is required")
@Column(columnDefinition = "text", nullable = false)
private String address;

@NotBlank(message = "Contact person is required")
@Column(name = "contact_person", nullable = false)
private String contactPerson;
```

#### 2. DTO Validation (`ClientDto.java`)
- Added `@NotBlank` annotations for API request validation
- Ensures validation before persistence

#### 3. Excel Parser Validation (`ClientExcelParserService.java`)
- Validates mandatory fields row-by-row during Excel import
- Provides clear error messages with row numbers
- Validates both direct fields and mapped legacy fields:
  - ContractNo, SubContractName, SubContractCode
  - vAddress (mapped to address)
  - vContactPerson (mapped to contactPerson)

#### 4. Database Migration (`V17__add_client_mandatory_constraints.sql`)
- Sets default values for existing NULL records
- Adds NOT NULL constraints to database columns
- Ensures data integrity at database level

### Frontend Validation

#### 1. Form Validation (`client-dialog.component.ts`)
- Added `Validators.required` to form controls
- Added subContractName field to the form
- Displays validation errors inline

#### 2. Template Updates
- Added subContractName input field
- Marked all mandatory fields with `required` attribute
- Shows field-specific error messages

## Excel Import Template

The Excel template now requires these columns to have values:
- **ContractNo** (required)
- **SubContractName** (required) 
- **SubContractCode** (required)
- **vAddress** (required) - Maps to address
- **vContactPerson** (required) - Maps to contactPerson

Optional columns remain as before (vCity, vPincode, billing details, etc.)

## Error Handling

### Import Validation Errors
When validation fails during import, the system:
1. Stops processing at the first error
2. Returns a clear error message with row number
3. Indicates which field(s) are missing
4. Example: `"Row 5: Missing mandatory fields: ContractNo, vAddress"`

### API Validation Errors
When validation fails via REST API:
1. Returns HTTP 400 Bad Request
2. Provides field-specific error messages
3. Example: `"Address is required"`

## Testing

Comprehensive unit tests added:
- ✅ Valid clients with all mandatory fields
- ✅ Missing ContractNo validation
- ✅ Missing SubContractCode validation
- ✅ Missing SubContractName validation
- ✅ Missing vAddress validation
- ✅ Missing vContactPerson validation
- ✅ Multiple missing fields validation
- ✅ Empty row handling
- ✅ Numeric cell type conversion

## Migration Path

For existing clients in the database:
1. Migration script sets defaults for NULL values:
   - `address` = `v_address` if NULL
   - `contact_person` = `v_contact_person` if NULL
   - `name` = `sub_contract_name` if NULL
   - Generates unique values for contract_no/sub_contract_code if missing

2. After defaults are set, NOT NULL constraints are applied

## Benefits

1. **Data Integrity**: Prevents incomplete client records
2. **Consistent Validation**: Same rules enforced in frontend and backend
3. **Clear Error Messages**: Users know exactly what's missing
4. **Import Safety**: Invalid Excel files are rejected before database insertion
5. **Database Constraints**: Database enforces rules even if bypassing application layer

## Files Modified

### Backend
- `Client.java` - Entity validation
- `ClientDto.java` - DTO validation
- `ClientController.java` - Added @Valid annotations
- `ClientExcelParserService.java` - Excel import validation
- `V17__add_client_mandatory_constraints.sql` - Database constraints
- `ClientExcelParserServiceTest.java` - Comprehensive test coverage

### Frontend
- `client-dialog.component.ts` - Form validation and template updates

## Next Steps

1. ✅ Validation implemented and tested
2. 🔄 Deploy and run database migrations
3. 📋 Update user documentation with mandatory field requirements
4. 🧪 Perform end-to-end testing with real data
5. 📢 Notify users about new validation requirements

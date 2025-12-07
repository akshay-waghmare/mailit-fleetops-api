# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-07

### Added
- **Client Validation**: Enforced mandatory fields for Client creation in both Backend and Frontend.
- **Import Error Handling**: Improved Bulk Import error reporting to show row-by-row errors instead of failing fast.
- **Database Migrations**: Added `V21__add_client_mandatory_constraints.sql` to enforce non-null constraints on client fields.

### Fixed
- **Pickup List Sorting**: Fixed issue where new pickups were appearing last. Now sorted by `createdAt` descending.
- **Pickup View Dialog**: Fixed display issues for "Item Count" and "Weight" (handling nulls and field mapping).
- **Pickup Persistence**: Fixed backend bug where `itemsCount`, `totalWeight`, `carrierId`, and `estimatedCost` were not being saved to the database.
- **Docker Build**: Resolved duplicate Flyway migration version conflict (renamed V17 to V21).

### Changed
- **Frontend**: Updated `PickupService` to map `estimatedCost` correctly.
- **Backend**: Refactored `ClientExcelParserService` to return aggregated validation errors.

## [1.0.0] - 2025-12-01
- Initial release of FleetOps Management System.
- Pickup Management (Create, List, View).
- Basic Client Management.

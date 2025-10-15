---
applyTo: '**'
---

<memories hint="Manage via memory tool">
<memory path="/memories/merge-conflict-resolution.md">
# Merge Conflict Resolution Summary

## Issue: V4 Migration Conflict
- PR #20 (013-minimal-rbac-user) had merge conflicts with main
- V4__Fix_Place_Type_Constraint.sql existed in both branches
- Main had V15__Fix_Place_Type_Constraint.sql (renamed from V4)
- This caused Flyway validation errors

## Resolution Applied
1. Removed duplicate V4 file (kept V15)
2. Updated test database setup in Gradle
3. Added automatic PostGIS setup for developers

## Potential Issue for Other Developers
Some developers might have V4 in their local dev database (fleetops_dev) which could cause:
- Flyway validation errors when they pull latest changes
- Migration conflicts between V4 and V15

## Solution Implemented
1. **fixMigrationConflict** Gradle task - automatically updates V4 → V15 in flyway_schema_history
2. **checkDevDb** task - detects migration conflicts before they cause issues
3. **Developer workflow** - simple commands to fix conflicts after pulling changes

## Commands Added
- `./gradlew fixMigrationConflict` - fixes V4/V15 conflict
- `./gradlew checkDevDb` - checks for migration conflicts
- `./gradlew resetTestDb` - resets test database (existing)
- All work automatically with `./gradlew build`

## Testing Scenario SUCCESSFUL ✅
- Created V4 conflict + no PostGIS scenario
- Ran `./gradlew build`  
- Build automatically:
  - Fixed V4/V15 conflict (auto-deleted V4)
  - Enabled PostGIS in test database
  - Ran all tests successfully
- Final result: BUILD SUCCESSFUL with zero manual intervention

✅ **COMPLETE AUTOMATION VERIFIED**
</memory>
</memories>

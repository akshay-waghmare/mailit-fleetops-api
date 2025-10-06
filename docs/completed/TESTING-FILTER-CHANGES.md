# Testing Guide: Pickup List Filter Changes

## Changes Made

### 1. Fixed Deprecated `substr()` Method
**File**: `frontend/apps/console-app/src/app/components/pickup-edit-modal/pickup-edit-modal.component.ts`

**Before**:
```typescript
timeValue = timeValue.substr(0, 2) + ':' + timeValue.substr(2, 2);
```

**After**:
```typescript
timeValue = timeValue.slice(0, 2) + ':' + timeValue.slice(2, 4);
```

### 2. Fixed Filter Predicate Hack
**File**: `frontend/apps/console-app/src/app/pages/pickup-list.component.ts`

**Before** (Using `Math.random()` hack):
```typescript
this.dataSource.filterPredicate = (data: PickupRecord) => {
  const statusMatch = !this.selectedStatusFilter || data.status === this.selectedStatusFilter;
  const typeMatch = !this.selectedTypeFilter || data.pickupType === this.selectedTypeFilter;
  return statusMatch && typeMatch;
};
this.dataSource.filter = Math.random().toString(); // Hack!
```

**After** (Proper JSON-based filter):
```typescript
this.dataSource.filterPredicate = (data: PickupRecord, filter: string) => {
  let filterObj: { status: string; type: string };
  try {
    filterObj = JSON.parse(filter);
  } catch {
    filterObj = { status: '', type: '' };
  }
  const statusMatch = !filterObj.status || data.status === filterObj.status;
  const typeMatch = !filterObj.type || data.pickupType === filterObj.type;
  return statusMatch && typeMatch;
};

this.dataSource.filter = JSON.stringify({
  status: this.selectedStatusFilter,
  type: this.selectedTypeFilter
});
```

### 3. Replaced `alert()` with Material Snackbar
**File**: `frontend/apps/console-app/src/app/components/pickup-edit-modal/pickup-edit-modal.component.ts`

**Before** (Using browser `alert()`):
```typescript
alert('Error updating pickup. Please try again.');
```

**After** (Material Design Snackbar):
```typescript
// Success notification
this.snackBar.open(
  'Pickup updated successfully!',
  'Close',
  {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: ['success-snackbar']
  }
);

// Error notification
this.snackBar.open(
  'Error updating pickup. Please try again.',
  'Close',
  {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: ['error-snackbar']
  }
);
```

---

## How to Test These Changes

### Prerequisites
1. Make sure the backend is running:
   ```bash
   cd backend
   docker compose up -d postgres
   ./gradlew bootRun
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   ng serve console-app --port 4200
   ```

3. Navigate to: http://localhost:4200/pickup-list

---

## Test Case 1: Filter by Status

### Steps:
1. **Open the Pickup List page**: http://localhost:4200/pickup-list
2. **Check initial state**: 
   - All pickups should be visible in the table
   - Note the total count at the bottom
3. **Apply Status Filter**:
   - Click on the "Status" dropdown filter (top of the page)
   - Select "Scheduled"
4. **Verify**:
   - ✅ Only pickups with status "Scheduled" are displayed
   - ✅ Table updates immediately without page refresh
   - ✅ Pagination resets to page 1
   - ✅ Count at bottom reflects filtered results

5. **Change Status Filter**:
   - Select "Completed" from the dropdown
6. **Verify**:
   - ✅ Table updates to show only "Completed" pickups
   - ✅ No duplicates or missing entries

7. **Clear Status Filter**:
   - Select "All" or empty option
8. **Verify**:
   - ✅ All pickups are visible again

---

## Test Case 2: Filter by Pickup Type

### Steps:
1. **Open the Pickup List page**: http://localhost:4200/pickup-list
2. **Apply Type Filter**:
   - Click on the "Pickup Type" dropdown filter
   - Select "Vendor"
3. **Verify**:
   - ✅ Only "Vendor" pickup types are displayed
   - ✅ Pagination resets to page 1

4. **Change Type Filter**:
   - Select "Direct"
5. **Verify**:
   - ✅ Only "Direct" pickup types are shown
   - ✅ Filter updates smoothly

---

## Test Case 3: Combined Filters (Status + Type)

### Steps:
1. **Apply Status Filter**:
   - Select "Scheduled" from Status dropdown
2. **Apply Type Filter**:
   - Select "Vendor" from Type dropdown
3. **Verify**:
   - ✅ Only pickups that are BOTH "Scheduled" AND "Vendor" are shown
   - ✅ Both filters work together correctly
   - ✅ Table shows correct filtered count

4. **Change One Filter**:
   - Change Status to "Completed" (keep Type as "Vendor")
5. **Verify**:
   - ✅ Now shows only "Completed" + "Vendor" pickups
   - ✅ Filter state is preserved correctly

6. **Clear All Filters**:
   - Click "Clear Filters" button (if available) OR
   - Manually set both dropdowns to "All"
7. **Verify**:
   - ✅ All pickups are visible again
   - ✅ No stale filter state

---

## Test Case 4: Pagination with Filters

### Steps:
1. **Apply a filter** that returns more than 10 results
2. **Verify pagination**:
   - ✅ Paginator shows correct total (e.g., "1 - 10 of 25")
   - ✅ Can navigate through pages
3. **Change filter while on page 2**:
   - Navigate to page 2
   - Change the status filter
4. **Verify**:
   - ✅ Automatically resets to page 1
   - ✅ Shows filtered results from the beginning

---

## Test Case 5: Search + Filters (Combined)

### Steps:
1. **Apply Status Filter**: "Scheduled"
2. **Apply Type Filter**: "Vendor"
3. **Use Search Box**: Type a customer name or pickup ID
4. **Verify**:
   - ✅ Search works in combination with dropdown filters
   - ✅ Results match all three criteria (status + type + search)
5. **Clear search**:
   - Remove text from search box
6. **Verify**:
   - ✅ Dropdown filters remain active
   - ✅ Results show all matching dropdown filters

---

## Test Case 6: Snackbar Notifications (Edit Modal)

### Success Notification:
1. **Open Pickup List**: http://localhost:4200/pickup-list
2. **Click Edit** on any pickup
3. **Make a change** (e.g., update customer name)
4. **Click "Save Changes"**
5. **Verify**:
   - ✅ Green success snackbar appears at top-right
   - ✅ Message: "Pickup updated successfully!"
   - ✅ Has "Close" button
   - ✅ Auto-dismisses after 3 seconds
   - ✅ Modal closes automatically
   - ✅ Table refreshes with updated data

### Error Notification:
1. **Stop the backend server** (to simulate error)
2. **Open Edit Modal** and make changes
3. **Click "Save Changes"**
4. **Verify**:
   - ✅ Red error snackbar appears at top-right
   - ✅ Message: "Error updating pickup. Please try again."
   - ✅ Has "Close" button
   - ✅ Auto-dismisses after 5 seconds (longer than success)
   - ✅ Modal stays open (doesn't close on error)
   - ✅ No browser alert() popup
5. **Restart backend** and try again
6. **Verify**:
   - ✅ Success notification works properly

---

## Test Case 7: Time Formatting (Edit Modal)

### Steps:
1. **Create or find a pickup** with time in "1400" format (if backend stores it this way)
2. **Click "Edit" button** on that pickup
3. **Verify in Edit Modal**:
   - ✅ Time field shows "14:00" (properly formatted)
   - ✅ No errors in browser console
4. **Edit another field** (e.g., customer name)
5. **Save changes**
6. **Verify**:
   - ✅ Changes saved successfully
   - ✅ Time format remains correct

---

## Test Case 8: Console Errors Check

### Steps:
1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Perform all filter operations** (status, type, combined)
4. **Verify**:
   - ✅ No errors about `substr()` being deprecated
   - ✅ No errors about invalid filter predicates
   - ✅ No errors about `alert()` or Material Design inconsistencies
   - ✅ No unexpected warnings

---

## Test Case 9: Performance Check

### Before vs After:
1. **Load page with many pickups** (50+ records)
2. **Apply filters multiple times rapidly**:
   - Click Status: Scheduled
   - Click Status: Completed
   - Click Type: Vendor
   - Click Type: Direct
3. **Verify**:
   - ✅ No lag or performance issues
   - ✅ Filters respond immediately
   - ✅ No duplicate API calls (check Network tab)

---

## Test Case 10: Edge Cases

### Test with No Results:
1. **Apply filters** that return zero results (e.g., a status that doesn't exist)
2. **Verify**:
   - ✅ Empty state message appears
   - ✅ No errors in console
   - ✅ Paginator shows "0 of 0"

### Test with Special Characters:
1. If search is combined with filters, try:
   - Search: `@#$%^&*()`
2. **Verify**:
   - ✅ No crashes
   - ✅ Graceful handling of special characters

---

## Automated Testing (Optional)

If you want to add unit tests, here's a sample test case:

```typescript
describe('PickupListComponent - Filter Tests', () => {
  it('should filter by status using JSON-based filter', () => {
    component.selectedStatusFilter = 'scheduled';
    component.selectedTypeFilter = '';
    component['applyMultipleFilters']();
    
    expect(component.dataSource.filter).toBe(
      JSON.stringify({ status: 'scheduled', type: '' })
    );
  });

  it('should filter by both status and type', () => {
    component.selectedStatusFilter = 'completed';
    component.selectedTypeFilter = 'vendor';
    component['applyMultipleFilters']();
    
    const filterObj = JSON.parse(component.dataSource.filter);
    expect(filterObj.status).toBe('completed');
    expect(filterObj.type).toBe('vendor');
  });

  it('should reset pagination when filter changes', () => {
    spyOn(component.dataSource.paginator!, 'firstPage');
    component.onStatusFilterChange('scheduled');
    expect(component.dataSource.paginator!.firstPage).toHaveBeenCalled();
  });
});
```

---

## Expected Results Summary

### ✅ All Tests Should Pass:
- Filters work correctly individually
- Combined filters work together
- Pagination resets properly
- No console errors
- Smooth performance
- Proper time formatting in edit modal
- No deprecated method warnings
- Material Design snackbar notifications (no alert())
- Success notifications appear in green
- Error notifications appear in red
- Notifications auto-dismiss after appropriate time

### 🚨 If Tests Fail:
1. Check browser console for errors
2. Verify backend is running and has data
3. Clear browser cache and reload
4. Check Network tab for failed API calls

---

## Quick Smoke Test (30 seconds)

1. Open: http://localhost:4200/pickup-list
2. Click Status dropdown → Select "Scheduled"
3. Click Type dropdown → Select "Vendor"
4. Click "Clear Filters" (or reset both dropdowns)
5. Click "Edit" on any pickup
6. Change customer name
7. Click "Save Changes"
8. **Verify**: ✅ Green success snackbar appears
9. Check browser console for errors

**✅ If all above work without errors, the changes are working correctly!**

---

## Reporting Issues

If you find any issues:
1. Note which test case failed
2. Check browser console for errors
3. Take a screenshot
4. Note the filter combination used
5. Check if issue is reproducible

---

## Additional Notes

- The new filter mechanism is more robust and maintainable
- It properly serializes filter state as JSON
- No more random string hacks
- Better performance and debugging
- TypeScript-friendly with proper typing

# 🧪 Delivery Sheet Enhancements - Testing Guide

**Feature:** Order Autocomplete & Edit Functionality  
**Branch:** `013-minimal-rbac-user`  
**Prerequisites:** Backend running on port 8081, Frontend on port 4200, logged in as admin

## 🚀 Quick Start

```bash
# Terminal 1: Start Backend
cd backend
SERVER_PORT=8081 SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun

# Terminal 2: Start Frontend
cd frontend
ng serve console-app --port 4200

# Browser: Login
http://localhost:4200/login
Username: admin
Password: Admin@123
```

## 📋 Test Scenarios

### Scenario 1: Order Autocomplete - Create with Orders

**Steps:**
1. Navigate to: http://localhost:4200/delivery-sheets
2. Click "Create Delivery Sheet" button
3. Fill in required fields:
   - Title: "Mumbai West Route - Jan 8"
   - Agent: Select any active agent
4. In "Add Orders" section, type in search box: "pending"
5. **Verify:** Loading spinner appears briefly
6. **Verify:** List of pending orders displays with details
7. Click on an order to select it
8. **Verify:** Order appears as a chip with order ID, receiver name, and city
9. Search and add 2-3 more orders
10. **Verify:** All selected orders display as chips
11. Click [X] on one chip to remove it
12. **Verify:** Order is removed from selection
13. Fill optional fields (scheduled date, notes)
14. Click "Create" button
15. **Verify:** Success message displays
16. **Verify:** New delivery sheet appears in table
17. **Verify:** "Total Orders" column shows correct count

**Expected Result:** ✅ Delivery sheet created with selected orders

---

### Scenario 2: Order Autocomplete - Search Variations

**Steps:**
1. Open create delivery sheet dialog
2. Test different search terms:
   - Type "ORD" → **Verify:** Orders matching ID pattern
   - Type "Mumbai" → **Verify:** Orders with Mumbai in city
   - Type "Rajesh" → **Verify:** Orders with Rajesh as receiver
   - Type "xyz" → **Verify:** "No orders found" message
3. Clear search field
4. **Verify:** Autocomplete dropdown clears
5. Type only 1 character (e.g., "R")
6. **Verify:** No search triggered (minimum 2 characters)

**Expected Result:** ✅ Search works for ID, city, and receiver name

---

### Scenario 3: Edit Delivery Sheet - Basic Edit

**Steps:**
1. Navigate to: http://localhost:4200/delivery-sheets
2. Locate an existing delivery sheet in the table
3. Click the Edit icon (pencil) button in Actions column
4. **Verify:** Dialog opens with title "Edit Delivery Sheet"
5. **Verify:** All fields are pre-filled:
   - Title shows existing value
   - Agent dropdown shows assigned agent
   - Scheduled date shows existing date (if set)
6. Modify the title: Add " - UPDATED" to the end
7. Change assigned agent to a different agent
8. Update scheduled date
9. Add a note: "Updated delivery instructions"
10. Click "Update" button
11. **Verify:** Success message: "Delivery sheet updated successfully"
12. **Verify:** Table refreshes
13. **Verify:** Updated values display in table
14. Refresh page (F5)
15. **Verify:** Changes persist after refresh

**Expected Result:** ✅ Delivery sheet successfully updated with new values

---

### Scenario 4: Edit Delivery Sheet - Modify Orders

**Steps:**
1. Click Edit on a delivery sheet that has orders
2. **Verify:** Existing orders NOT shown in form (limitation - no pre-load)
3. Search for new orders using autocomplete
4. Add 2 new orders as chips
5. Click "Update"
6. **Verify:** Success message displays
7. Open backend logs or use API tool
8. **Verify:** PUT request sent to `/api/v1/delivery-sheets/{id}`
9. **Verify:** Request body contains new orderIds array

**Expected Result:** ✅ Orders list updated (replaces old orders)

**Note:** Current implementation replaces all orders on update. To keep existing orders, they would need to be re-selected.

---

### Scenario 5: Validation - Edit with Invalid Data

**Steps:**
1. Click Edit on a delivery sheet
2. Clear the Title field completely
3. **Verify:** "Title is required" error appears
4. **Verify:** Update button is disabled
5. Enter title: "AB" (too short)
6. **Verify:** "Title must be at least 3 characters" error
7. Enter valid title: "Valid Title"
8. Change agent dropdown to blank/unselected
9. **Verify:** "Selecting an agent is required" error
10. **Verify:** Update button remains disabled
11. Select a valid agent
12. **Verify:** Update button becomes enabled
13. Click "Update"
14. **Verify:** Form submits successfully

**Expected Result:** ✅ Validation prevents invalid submissions

---

### Scenario 6: Cancel Operations

**Steps:**
1. Click "Create Delivery Sheet"
2. Fill in some fields
3. Add some orders via autocomplete
4. Click "Cancel" button
5. **Verify:** Dialog closes without saving
6. **Verify:** No new delivery sheet in table
7. Click Edit on existing sheet
8. Modify some fields
9. Click "Cancel"
10. **Verify:** Dialog closes
11. **Verify:** Original values unchanged in table

**Expected Result:** ✅ Cancel operations don't save changes

---

### Scenario 7: Concurrent Operations

**Steps:**
1. Create 2 browser windows/tabs with same user
2. In Tab 1: Click Edit on Sheet DS12345678
3. In Tab 2: Click Edit on same Sheet DS12345678
4. In Tab 1: Change title, click Update
5. **Verify:** Tab 1 shows success
6. In Tab 2: Change agent, click Update
7. **Verify:** Tab 2 shows success
8. Refresh both tabs
9. **Verify:** Latest changes (Tab 2) are reflected
10. **Note:** Last-write-wins behavior (expected)

**Expected Result:** ✅ Last update wins (no conflict detection yet)

---

### Scenario 8: Network/Error Handling

**Steps:**
1. Stop the backend server
2. Click "Create Delivery Sheet"
3. Fill form and click Create
4. **Verify:** Error message displays
5. **Verify:** Form remains open (not closed)
6. Restart backend
7. Click Create again
8. **Verify:** Now succeeds
9. Stop backend again
10. Click Edit on a sheet
11. Modify and click Update
12. **Verify:** Error message displays appropriately

**Expected Result:** ✅ Graceful error handling with user feedback

---

## 🔍 API Verification

### Check Backend Logs

```bash
# Watch backend logs for delivery sheet operations
tail -f backend/logs/fleetops.log | grep "DeliverySheet"
```

**Expected Log Entries:**
```
Delivery sheet DS12AB34CD created for agent testagent
Delivery sheet DS12AB34CD updated by admin
```

### Test with cURL

**Create:**
```bash
curl -X POST http://localhost:8081/api/v1/delivery-sheets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Delivery Sheet",
    "assignedAgentId": 2,
    "scheduledDate": "2025-01-10",
    "orderIds": [1, 2, 3],
    "notes": "Test notes"
  }'
```

**Update:**
```bash
curl -X PUT http://localhost:8081/api/v1/delivery-sheets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Delivery Sheet",
    "assignedAgentId": 2,
    "scheduledDate": "2025-01-11",
    "orderIds": [1, 2, 3, 4],
    "notes": "Updated notes"
  }'
```

---

## 📊 Browser DevTools Checks

### Network Tab

**Create Operation:**
1. Open DevTools → Network tab
2. Create a delivery sheet
3. Find POST request to `/api/v1/delivery-sheets`
4. **Verify Request:**
   ```json
   {
     "title": "...",
     "assignedAgentId": 2,
     "orderIds": [1, 2, 3]
   }
   ```
5. **Verify Response:** 201 Created with delivery sheet data

**Update Operation:**
1. Edit a delivery sheet
2. Find PUT request to `/api/v1/delivery-sheets/{id}`
3. **Verify Request:** Same structure as create
4. **Verify Response:** 200 OK with updated data

**Order Search:**
1. Type in autocomplete
2. Find GET request to `/api/v1/orders?search=...&size=20&status=PENDING`
3. **Verify:** Debounced (multiple keystrokes → single request)
4. **Verify Response:** Paginated order list

### Console Tab

**Check for Errors:**
```
No errors should appear related to:
- Component initialization
- Form validation
- API calls
- Change detection
```

**Expected Logs:**
```
=== OPENING CREATE DELIVERY SHEET DIALOG ===
=== LOADING AGENTS ===
✅ Agents loaded: [...]
=== DELIVERY SHEET FORM SUBMIT ===
✅ Delivery sheet created successfully: {...}
```

---

## ✅ Success Criteria

### Order Autocomplete
- [x] Search triggers after 2+ characters
- [x] Debouncing works (300ms delay)
- [x] Orders display with full details
- [x] Chips show order info correctly
- [x] Remove button works on chips
- [x] Multiple orders can be selected
- [x] Selected orderIds sent to backend

### Edit Functionality
- [x] Edit button visible in table
- [x] Dialog opens in edit mode
- [x] Form pre-fills with existing data
- [x] Title changes to "Edit Delivery Sheet"
- [x] Button changes to "Update"
- [x] PUT request sent to backend
- [x] Success message displays
- [x] Table refreshes with new data

### Validation & UX
- [x] Required field validation works
- [x] Loading states display
- [x] Error messages are clear
- [x] Cancel button works
- [x] No console errors
- [x] Responsive design works

---

## 🐛 Known Limitations

1. **Order Pre-loading:** When editing, existing orders are not pre-loaded as chips. User must re-select orders if they want to keep them.
   - **Reason:** DeliverySheetSummary doesn't include full order details
   - **Fix Required:** Add GET /api/v1/delivery-sheets/{id}/details endpoint

2. **Concurrent Edits:** No optimistic locking. Last write wins.
   - **Mitigation:** Could add version field to detect conflicts

3. **Bulk Operations:** No bulk edit or delete functionality yet.

---

## 📝 Test Report Template

```markdown
## Test Execution Report

**Date:** [DATE]
**Tester:** [NAME]
**Environment:** Local Dev
**Browser:** Chrome/Firefox/Safari [VERSION]

### Results
- [ ] Scenario 1: Order Autocomplete - Create
- [ ] Scenario 2: Order Autocomplete - Search
- [ ] Scenario 3: Edit Delivery Sheet - Basic
- [ ] Scenario 4: Edit Delivery Sheet - Orders
- [ ] Scenario 5: Validation
- [ ] Scenario 6: Cancel Operations
- [ ] Scenario 7: Concurrent Operations
- [ ] Scenario 8: Error Handling

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
- [Recommendation]

**Status:** PASS / FAIL / BLOCKED
```

---

## 🔗 References

- [Feature Documentation](../completed/DELIVERY-SHEET-ENHANCEMENTS.md)
- [API Docs](../../backend/docs/API.md)
- [RBAC Credentials](../../backend/RBAC-CREDENTIALS.md)

**Happy Testing! 🚀**

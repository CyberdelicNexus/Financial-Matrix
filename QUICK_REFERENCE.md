# QUICK REFERENCE - Save/Load & Chart Fixes

## FUNCTIONS ADDED ✅

### `collectAllData()`
**Purpose:** Collects all form data for saving
**Returns:** Data object with all form state
**Location:** Line ~8229

```javascript
const data = collectAllData();
// Returns: { revenueInputs, revenueProjections, editableText, courses, projects, grants, events, fixedCosts, variableCosts, timestamp }
```

### `restoreAllData(data)`
**Purpose:** Restores all form data from saved state
**Parameters:** Data object from `collectAllData()`
**Returns:** Boolean (success/failure)
**Location:** Line ~8342

```javascript
const success = restoreAllData(savedData);
if (success) {
    alert('Data restored!');
}
```

---

## CONSOLE LOG PATTERNS

### Save Operation
```
💾 Saving with name: [name]
📦 Collecting all data...
✅ Data collection complete: { ... }
✅ Saved to localStorage with name: [name]
✅ Save complete! Total saves: N
```

### Load Operation
```
📂 Loading save: [name]
✅ Save data found, restoring...
📂 Restoring all data...
✅ Data restored successfully
✅ Save loaded successfully!
```

### Chart Drawing
```
📊 Drawing One-Pager revenue chart...
✅ Canvas element found
✅ Canvas context acquired
✅ Revenue elements found
📊 Drawing chart with values: { year1, year2, year3 }
✅ Chart drawn successfully!
```

### Common Errors
```
❌ Canvas element "onepager-revenue-chart" not found!
❌ Revenue elements not found!
❌ Save not found: [name]
❌ No data to restore
❌ Error restoring data: [error]
```

---

## TESTING COMMANDS

### Check Function Availability
```javascript
typeof collectAllData === 'function'  // true
typeof restoreAllData === 'function'  // true
typeof drawOnePagerRevenueChart === 'function'  // true
```

### Test Save System
```javascript
// Collect data
const data = collectAllData();
console.log(data);

// Test restoration
restoreAllData(data);
```

### Test Chart
```javascript
// Check canvas exists
document.getElementById('onepager-revenue-chart')

// Draw chart manually
drawOnePagerRevenueChart()

// Check revenue elements
document.getElementById('onepager-year1-revenue')
document.getElementById('onepager-year2-revenue')
document.getElementById('onepager-year3-revenue')
```

### Check localStorage
```javascript
// View all saves
JSON.parse(localStorage.getItem('cfo-saves'))

// View save count
Object.keys(JSON.parse(localStorage.getItem('cfo-saves') || '{}')).length

// Clear all saves
localStorage.clear()
```

---

## BUTTON IDS

- `#header-save-btn` - Save button
- `#header-load-btn` - Load button
- `#load-dropdown` - Load dropdown
- `#saved-states-list` - Saved states list

---

## ELEMENT IDS (Chart)

- `#onepager-revenue-chart` - Canvas element
- `#onepager-year1-revenue` - Year 1 value
- `#onepager-year2-revenue` - Year 2 value
- `#onepager-year3-revenue` - Year 3 value
- `#revenue-cagr` - CAGR percentage

---

## LOCALSTORAGE KEYS

- `cfo-saves` - Named saves (current system)
- `cyberdelicCFOData` - Default save (backward compatibility)
- `cyberdelicCFOSavedStates` - Timestamped saves (old system)

---

## QUICK FIXES

### Problem: Save not working
```javascript
// Check if button exists
document.getElementById('header-save-btn')

// Check if function exists
typeof saveWithName === 'function'

// Manually trigger save
saveWithName('Test Save')
```

### Problem: Load not working
```javascript
// Check if button exists
document.getElementById('header-load-btn')

// Check if function exists
typeof loadSave === 'function'

// View available saves
console.log(getAllSaves())

// Manually trigger load
loadSave('Test Save')
```

### Problem: Chart not visible
```javascript
// Check canvas exists
console.log(document.getElementById('onepager-revenue-chart'))

// Manually draw
drawOnePagerRevenueChart()

// Check for errors in console
// Look for ❌ messages
```

### Problem: Data not persisting
```javascript
// Check localStorage available
console.log(localStorage)

// Check if data is being saved
console.log(localStorage.getItem('cfo-saves'))

// Verify not in incognito mode
// Check browser settings
```

---

## FILE LOCATIONS

**Main File:**
`C:\Users\JEMA\Pictures\Image Vault\Cyberdelic Nexus\Cyberdelic CFO\Financial-Matrix\index.html`

**Documentation:**
- `TESTING_GUIDE.md` - Full testing instructions
- `FIX_SUMMARY.md` - Detailed fix documentation
- `QUICK_REFERENCE.md` - This file

---

## EMOJI LEGEND

- 📊 Chart operations
- 💾 Save operations
- 📂 Load operations
- 📦 Data collection
- ✅ Success checkpoint
- ❌ Error/failure
- 🚀 Initialization
- 🔄 Update/refresh
- 🔍 Observer/watcher
- ⏰ Timeout/delay

---

**Last Updated:** 2026-01-21
**Status:** Production Ready

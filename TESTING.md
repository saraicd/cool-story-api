# Testing Guide for Cool Story API

## Quick Start

### 1. Start the Server
```bash
cd cool-story-api
node index.js
```

You should see:
```
Connected to MongoDB
🚀 Server running on port 3000
```

---

## Testing Methods

### Method 1: Automated Test Script (Easiest!)

Run the automated test script:
```bash
node test-api.js
```

This will automatically test all endpoints and show you the results.

---

### Method 2: Using Postman or Thunder Client

1. **Import the collection:**
   - Open Postman or Thunder Client (VS Code extension)
   - Import `cool-story-api.postman_collection.json`
   - The base URL is already set to `http://localhost:3000`

2. **Run requests in order:**
   1. Health Check
   2. Create New Story
   3. Submit Story Entry
   4. Get All Entries for Story
   5. Get Latest Entry

---

### Method 3: Manual cURL Commands

#### Step 1: Health Check
```bash
curl http://localhost:3000/story/test
```

**Expected:** `Test successful.`

---

#### Step 2: Create a Story
```bash
curl -X POST http://localhost:3000/story/create \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Family Summer Adventure 2025\",
    \"description\": \"Our collaborative family vacation story\",
    \"accessCode\": \"SUMMER-2025\",
    \"maxEntries\": 100
  }"
```

**Expected Response:**
```json
{
  "message": "Story created successfully!",
  "story": {
    "id": "...",
    "title": "Family Summer Adventure 2025",
    "accessCode": "SUMMER-2025",
    "status": "active"
  }
}
```

---

#### Step 3: Get All Stories
```bash
curl http://localhost:3000/stories
```

**Expected:** Array of all stories

---

#### Step 4: Submit First Entry
```bash
curl -X POST http://localhost:3000/story/entry \
  -H "Content-Type: application/json" \
  -d "{
    \"accessCode\": \"SUMMER-2025\",
    \"username\": \"Sarah\",
    \"contactEmail\": \"sarah@example.com\",
    \"text\": \"Once upon a time, there was an amazing family adventure that started on a sunny summer morning...\",
    \"previousEntryId\": null
  }"
```

**Expected Response:**
```json
{
  "message": "Your contribution has been added!",
  "entry": {
    "id": "...",
    "text": "Once upon a time...",
    "username": "Sarah",
    "createdAt": "..."
  }
}
```

**Copy the `entry.id`** for the next request!

---

#### Step 5: Submit Second Entry
```bash
curl -X POST http://localhost:3000/story/entry \
  -H "Content-Type: application/json" \
  -d "{
    \"accessCode\": \"SUMMER-2025\",
    \"username\": \"Dad\",
    \"contactEmail\": \"dad@example.com\",
    \"text\": \"The family packed their bags and set off towards the mountains, excited for what lay ahead...\",
    \"previousEntryId\": \"PASTE_ENTRY_ID_HERE\"
  }"
```

Replace `PASTE_ENTRY_ID_HERE` with the ID from Step 4.

---

#### Step 6: Get All Entries
```bash
curl http://localhost:3000/story/SUMMER-2025/all
```

**Expected Response:**
```json
{
  "story": {
    "title": "Family Summer Adventure 2025",
    "description": "Our collaborative family vacation story",
    "status": "active"
  },
  "entries": [
    {
      "_id": "...",
      "text": "Once upon a time...",
      "username": "Sarah",
      "createdAt": "..."
    },
    {
      "_id": "...",
      "text": "The family packed their bags...",
      "username": "Dad",
      "createdAt": "..."
    }
  ]
}
```

---

#### Step 7: Get Latest Entry
```bash
curl http://localhost:3000/story/SUMMER-2025/latest
```

**Expected:** Returns the most recent entry (Dad's entry in this case)

---

## Testing Error Cases

### Test Invalid Access Code
```bash
curl -X POST http://localhost:3000/story/entry \
  -H "Content-Type: application/json" \
  -d "{
    \"accessCode\": \"WRONG-CODE\",
    \"username\": \"Hacker\",
    \"contactEmail\": \"hacker@example.com\",
    \"text\": \"This should fail...\",
    \"previousEntryId\": null
  }"
```

**Expected:** `401 Unauthorized` with message: `"Invalid access code"`

---

### Test Missing Email
```bash
curl -X POST http://localhost:3000/story/entry \
  -H "Content-Type: application/json" \
  -d "{
    \"accessCode\": \"SUMMER-2025\",
    \"username\": \"Bob\",
    \"text\": \"This should fail because no email...\",
    \"previousEntryId\": null
  }"
```

**Expected:** `400 Bad Request` with message: `"Username and email are required"`

---

### Test Short Text
```bash
curl -X POST http://localhost:3000/story/entry \
  -H "Content-Type: application/json" \
  -d "{
    \"accessCode\": \"SUMMER-2025\",
    \"username\": \"Bob\",
    \"contactEmail\": \"bob@example.com\",
    \"text\": \"Too short\",
    \"previousEntryId\": null
  }"
```

**Expected:** `400 Bad Request` with message: `"Text must be at least 10 characters long"`

---

## Windows PowerShell Commands

If you're using PowerShell instead of bash, use these:

### Create Story (PowerShell)
```powershell
$body = @{
    title = "Family Summer Adventure 2025"
    description = "Our collaborative family vacation story"
    accessCode = "SUMMER-2025"
    maxEntries = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/story/create" -Method POST -Body $body -ContentType "application/json"
```

### Submit Entry (PowerShell)
```powershell
$body = @{
    accessCode = "SUMMER-2025"
    username = "Sarah"
    contactEmail = "sarah@example.com"
    text = "Once upon a time, there was an amazing family adventure..."
    previousEntryId = $null
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/story/entry" -Method POST -Body $body -ContentType "application/json"
```

---

## Quick Testing Checklist

- [ ] Server starts without errors
- [ ] Health check returns "Test successful"
- [ ] Can create a new story
- [ ] Can get all stories
- [ ] Can submit first entry (with valid access code, email, username)
- [ ] Can submit second entry (with correct previousEntryId)
- [ ] Can get all entries for a story
- [ ] Can get latest entry
- [ ] Invalid access code is rejected
- [ ] Missing email is rejected
- [ ] Short text (< 10 chars) is rejected

---

## Need Help?

If something isn't working:
1. Check that MongoDB is connected (should see "Connected to MongoDB" on startup)
2. Check that the server is running on port 3000
3. Check the server console for error messages
4. Verify your request body format matches the examples above

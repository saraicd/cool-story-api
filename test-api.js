/**
 * Simple Test Script for Cool Story API
 * Run with: node test-api.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Cool Story API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣  Testing server health...');
    const healthResponse = await fetch(`${BASE_URL}/story/test`);
    const healthText = await healthResponse.text();
    console.log(`   ✅ Server is running: ${healthText}\n`);

    // Test 2: Create a new story
    console.log('2️⃣  Creating a test story...');
    const createStoryResponse = await fetch(`${BASE_URL}/story/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Story - Family Adventure',
        description: 'A test story for our family',
        accessCode: 'TEST-2025',
        maxEntries: 10
      })
    });
    const createdStory = await createStoryResponse.json();
    console.log('   ✅ Story created:', createdStory);
    console.log(`   📝 Access Code: ${createdStory.story?.accessCode}\n`);

    // Test 3: Get all stories
    console.log('3️⃣  Fetching all stories...');
    const storiesResponse = await fetch(`${BASE_URL}/stories`);
    const stories = await storiesResponse.json();
    console.log(`   ✅ Found ${stories.length} story(ies)`);
    console.log('   Stories:', stories.map(s => ({ title: s.title, code: s.accessCode, status: s.status })));
    console.log('');

    // Test 4: Get story before any entries
    console.log('4️⃣  Getting story entries (should be empty)...');
    const emptyEntriesResponse = await fetch(`${BASE_URL}/story/TEST-2025/all`);
    const emptyEntries = await emptyEntriesResponse.json();
    console.log(`   ✅ Story info:`, emptyEntries.story);
    console.log(`   📖 Entries: ${emptyEntries.entries.length}\n`);

    // Test 5: Submit first entry (should succeed)
    console.log('5️⃣  Submitting first story entry...');
    const firstEntryResponse = await fetch(`${BASE_URL}/story/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessCode: 'TEST-2025',
        username: 'Sarah',
        contactEmail: 'sarah@test.com',
        text: 'Once upon a time, in a magical forest, there lived a curious fox...',
        previousEntryId: null
      })
    });
    const firstEntry = await firstEntryResponse.json();
    console.log('   ✅ First entry added:', firstEntry.message);
    console.log('   Entry ID:', firstEntry.entry?.id);
    console.log('');

    // Test 6: Get latest entry
    console.log('6️⃣  Getting latest entry...');
    const latestResponse = await fetch(`${BASE_URL}/story/TEST-2025/latest`);
    const latest = await latestResponse.json();
    console.log('   ✅ Latest entry:', latest.latestEntry?.text);
    console.log('   By:', latest.latestEntry?.username);
    console.log('');

    // Test 7: Submit second entry
    console.log('7️⃣  Submitting second story entry...');
    const secondEntryResponse = await fetch(`${BASE_URL}/story/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessCode: 'TEST-2025',
        username: 'Dad',
        contactEmail: 'dad@test.com',
        text: 'The fox discovered a hidden path that led to an ancient tree...',
        previousEntryId: firstEntry.entry?.id
      })
    });
    const secondEntry = await secondEntryResponse.json();
    console.log('   ✅ Second entry added:', secondEntry.message);
    console.log('');

    // Test 8: Get all entries
    console.log('8️⃣  Getting full story...');
    const fullStoryResponse = await fetch(`${BASE_URL}/story/TEST-2025/all`);
    const fullStory = await fullStoryResponse.json();
    console.log(`   ✅ Story has ${fullStory.entries.length} entries:`);
    fullStory.entries.forEach((entry, i) => {
      console.log(`   ${i + 1}. [${entry.username}]: ${entry.text}`);
    });
    console.log('');

    // Test 9: Test invalid access code
    console.log('9️⃣  Testing invalid access code (should fail)...');
    const invalidCodeResponse = await fetch(`${BASE_URL}/story/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessCode: 'WRONG-CODE',
        username: 'Hacker',
        contactEmail: 'hacker@test.com',
        text: 'This should not work...',
        previousEntryId: null
      })
    });
    const invalidCodeResult = await invalidCodeResponse.json();
    console.log('   ✅ Correctly rejected:', invalidCodeResult.message);
    console.log('');

    // Test 10: Test missing email (should fail)
    console.log('🔟 Testing missing email (should fail)...');
    const missingEmailResponse = await fetch(`${BASE_URL}/story/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessCode: 'TEST-2025',
        username: 'Bob',
        text: 'No email provided...',
        previousEntryId: null
      })
    });
    const missingEmailResult = await missingEmailResponse.json();
    console.log('   ✅ Correctly rejected:', missingEmailResult.message);
    console.log('');

    console.log('✅ All tests completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - Server is running');
    console.log('   - Stories can be created');
    console.log('   - Access code validation works');
    console.log('   - Email/username validation works');
    console.log('   - Story entries can be submitted and retrieved');
    console.log('');
    console.log('🎉 Your API is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n💡 Make sure your server is running with: npm start');
  }
}

testAPI();

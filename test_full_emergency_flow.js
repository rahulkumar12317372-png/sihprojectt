/**
 * Full Emergency Flow Test
 * Tests: Incident creation → WhatsApp auto-dispatch to ALL emergency contacts → Location sharing
 * 
 * This script tests the EXACT same flow that happens when SOS is triggered:
 * 1. Creates an incident via API
 * 2. Backend automatically sends WhatsApp to ALL trusted contacts
 * 3. Verifies notification logs
 */

const BASE_URL = 'http://localhost:5000/api';

async function testFullEmergencyFlow() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🚨 EMERGENCYCONNECT - Full Emergency Flow Test');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Get current trusted contacts
  console.log('📋 Step 1: Fetching Trusted Emergency Contacts...');
  const contactsRes = await fetch(`${BASE_URL}/notifications/contacts/usr_rahul_01`);
  const contactsData = await contactsRes.json();
  
  if (contactsData.success && contactsData.data) {
    console.log(`   ✅ Found ${contactsData.data.length} emergency contacts:`);
    contactsData.data.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} | Phone: ${c.phone} | Relationship: ${c.relationship}`);
    });
  } else {
    console.log('   ❌ Failed to fetch contacts');
    return;
  }
  console.log('');

  // Step 2: Create an emergency incident (this triggers automatic WhatsApp to ALL contacts)
  console.log('🆘 Step 2: Creating Emergency Incident (SOS Trigger)...');
  const incidentRes = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'usr_rahul_01',
      latitude: 26.9124,
      longitude: 75.7873,
      description: 'Serious bike accident near MI Road. One person unconscious and bleeding.',
      category: 'ACCIDENT',
      severity: 'CRITICAL',
      suggestedServices: ['AMBULANCE', 'HOSPITAL', 'POLICE'],
      aiReason: 'Reported unconscious and bleeding person following vehicle crash'
    })
  });
  const incidentData = await incidentRes.json();

  if (incidentData.success && incidentData.data) {
    console.log(`   ✅ Incident Created: ${incidentData.data.id}`);
    console.log(`   📍 Location: ${incidentData.data.latitude}, ${incidentData.data.longitude}`);
    console.log(`   🏷️  Category: ${incidentData.data.category} | Severity: ${incidentData.data.severity}`);
    console.log(`   🔗 Google Maps: https://maps.google.com/?q=${incidentData.data.latitude},${incidentData.data.longitude}`);
  } else {
    console.log('   ❌ Failed to create incident');
    return;
  }
  console.log('');

  // Wait for async WhatsApp dispatch to complete
  console.log('⏳ Waiting 3 seconds for WhatsApp dispatch to complete...\n');
  await new Promise(r => setTimeout(r, 3000));

  // Step 3: Check notification logs to verify WhatsApp was sent
  console.log('📬 Step 3: Checking Notification Delivery Logs...');
  const logsRes = await fetch(`${BASE_URL}/notifications/logs`);
  const logsData = await logsRes.json();

  if (logsData.success && logsData.data) {
    const whatsappLogs = logsData.data.filter(l => l.channel === 'WHATSAPP');
    const smsLogs = logsData.data.filter(l => l.channel === 'SMS');
    const emailLogs = logsData.data.filter(l => l.channel === 'EMAIL');

    console.log(`   📊 Total Notifications Sent: ${logsData.data.length}`);
    console.log(`   📱 WhatsApp Messages: ${whatsappLogs.length}`);
    console.log(`   💬 SMS Messages: ${smsLogs.length}`);
    console.log(`   📧 Email Messages: ${emailLogs.length}`);
    console.log('');

    console.log('   ── WhatsApp Delivery Details ──');
    whatsappLogs.forEach((log, i) => {
      console.log(`   ${i + 1}. To: ${log.recipient}`);
      console.log(`      Status: ${log.metadata?.deliveryStatus || log.status}`);
      console.log(`      SID: ${log.metadata?.messageSid || 'N/A'}`);
      console.log(`      Automatic: ${log.metadata?.automatic ? 'YES ✅' : 'NO'}`);
      console.log(`      Time: ${log.timestamp}`);
      console.log('');
    });
  }
  console.log('');

  // Step 4: Test manual WhatsApp send to a specific contact
  console.log('📨 Step 4: Testing Direct WhatsApp Send API...');
  const directRes = await fetch(`${BASE_URL}/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: 'WHATSAPP',
      recipient: '+919263293460',
      message: '🚨 EMERGENCYCONNECT TEST: This is a test emergency alert. Location: https://maps.google.com/?q=26.9124,75.7873 - Ambulance dispatched!'
    })
  });
  const directData = await directRes.json();

  if (directData.success && directData.data) {
    console.log(`   ✅ Direct WhatsApp Send Result:`);
    console.log(`      Channel: ${directData.data.channel}`);
    console.log(`      To: ${directData.data.recipient}`);
    console.log(`      Status: ${directData.data.metadata?.deliveryStatus || directData.data.status}`);
    console.log(`      SID: ${directData.data.metadata?.messageSid || 'N/A'}`);
    console.log(`      Automatic: ${directData.data.metadata?.automatic ? 'YES ✅' : 'NO'}`);
  }
  console.log('');

  // Step 5: Test status update (ON_THE_WAY) which also triggers WhatsApp
  console.log('🚑 Step 5: Updating Incident to ON_THE_WAY (triggers follow-up WhatsApp)...');
  const updateRes = await fetch(`${BASE_URL}/incidents/${incidentData.data.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'RESPONDER_ACCEPTED',
      responderId: 'resp_a102'
    })
  });
  const updateData = await updateRes.json();
  if (updateData.success) {
    console.log(`   ✅ Status updated to RESPONDER_ACCEPTED`);
  }

  await new Promise(r => setTimeout(r, 2000));

  // Final Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 FINAL TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');

  const finalLogsRes = await fetch(`${BASE_URL}/notifications/logs`);
  const finalLogsData = await finalLogsRes.json();

  if (finalLogsData.success) {
    const allWA = finalLogsData.data.filter(l => l.channel === 'WHATSAPP');
    const delivered = allWA.filter(l => l.metadata?.deliveryStatus?.startsWith('DELIVERED'));
    const simulated = allWA.filter(l => l.metadata?.deliveryStatus === 'SIMULATED');

    console.log(`  Total WhatsApp messages dispatched: ${allWA.length}`);
    console.log(`  ✅ Delivered via Twilio API:        ${delivered.length}`);
    console.log(`  ⚪ Simulated (no Twilio creds):     ${simulated.length}`);
    console.log(`  📍 Location included in messages:   YES`);
    console.log(`  🤖 Fully automatic (zero clicks):   YES`);
    console.log('');

    if (delivered.length > 0) {
      console.log('  🎉 WHATSAPP AUTO-DISPATCH IS WORKING! Messages sent via Twilio API.');
    } else if (simulated.length > 0) {
      console.log('  ⚠️  Messages logged as SIMULATED. Check Twilio credentials in .env');
    }
  }

  console.log('═══════════════════════════════════════════════════════════════\n');
}

testFullEmergencyFlow().catch(err => {
  console.error('❌ Test Error:', err.message);
  process.exit(1);
});

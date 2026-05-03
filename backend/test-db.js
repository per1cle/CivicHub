import pkg from 'pg';
const { Client } = pkg;

async function testConnection(password, label) {
  const dbName = 'template1'; // template1 always exists
  const url = `postgresql://postgres:${password}@localhost:5432/${dbName}?sslmode=disable`;
  console.log(`\n--- Testing Password: "${password}" (${label}) ---`);
  
  const client = new Client({ connectionString: url });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ Failed: ${err.message}`);
    return false;
  }
}

const passwords = ['', 'postgres', 'admin', 'password', '1234'];
for (const pw of passwords) {
  if (await testConnection(pw, pw === '' ? 'Empty' : 'Common')) {
    console.log(`\n🎉 FOUND IT! The password is: "${pw}"`);
    process.exit(0);
  }
}

console.log('\n❌ None of the common passwords worked.');



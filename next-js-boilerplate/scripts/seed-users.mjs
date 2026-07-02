// Registers 5 mock users via the Next.js BFF auth endpoints
const USERS = [
  { name: "Alice Wonderland", email: "alice@test.com", password: "Test1234!" },
  { name: "Bob Builder", email: "bob@test.com", password: "Test1234!" },
  { name: "Charlie Brown", email: "charlie@test.com", password: "Test1234!" },
  { name: "Diana Prince", email: "diana@test.com", password: "Test1234!" },
  { name: "Eve Adams", email: "eve@test.com", password: "Test1234!" },
];

async function main() {
  for (const u of USERS) {
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: u.email,
          password: u.password,
          name: u.name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✓ Created ${u.name} (${u.email})`);
      } else {
        console.log(
          `  ${u.email}: ${data.error || data.message || JSON.stringify(data)}`,
        );
      }
    } catch (err) {
      console.error(`✗ ${u.email}: ${err.message}`);
    }
  }
}

main();

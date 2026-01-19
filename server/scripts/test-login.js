async function testLogin() {
  try {
    const response = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "superadmin",
        password: "superadmin123"
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Login successful!");
      console.log("Token:", data.token ? "Received" : "Missing");
      console.log("User:", data.user);
    } else {
      console.error("❌ Login failed");
      console.error("Status:", response.status);
      const text = await response.text();
      console.error("Response:", text);
    }
  } catch (error) {
    console.error("❌ Network/Server error:", error.message);
  }
}

testLogin();

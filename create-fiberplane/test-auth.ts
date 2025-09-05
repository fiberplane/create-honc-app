import { getFpAuthToken } from "./src/integrations/fiberplane.ts";

const FP_API_HOST = "http://localhost:7676";
const FP_AUTH_HOST = "http://localhost:7777";

async function testAuth() {
  console.log("🔐 Starting Fiberplane authentication test...\n");

  try {
    console.log("📝 This will open your browser for authentication");
    console.log("🔄 Initiating OAuth flow...\n");

    const token = await getFpAuthToken();

    console.log("\n✅ Authentication successful!");
    console.log(`📋 Token received: ${token.substring(0, 20)}...`);
    console.log(`📏 Token length: ${token.length} characters`);
    console.log(`🏷️  Token prefix: ${token.substring(0, 3)}`);

    // Optional: Test a simple API call with the token
    console.log("\n🧪 Testing token with a simple API call...");

    const testResp = await fetch(`${FP_API_HOST}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (testResp.ok) {
      const user = await testResp.json();
      console.log("✅ Token is valid! User info:", user);
    } else {
      console.log(
        `⚠️  Token test failed: ${testResp.status} ${testResp.statusText}`,
      );
      const errorBody = await testResp.text();
      console.log("Error response:", errorBody);
    }
  } catch (error) {
    console.error("\n❌ Authentication failed:");
    console.error(error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

// Run the test
testAuth().catch(console.error);

// Test script to POST a sample signup to the Netlify function or any URL.
// Usage:
//   node tools/test-signup.js             # posts to http://localhost:8888/.netlify/functions/subscribe
//   TARGET=https://yoursite.netlify.app/.netlify/functions/subscribe node tools/test-signup.js

(async () => {
   const target = process.env.TARGET || "http://localhost:8888/.netlify/functions/subscribe";
   const payload = {
      email: `test+${Date.now()}@example.com`,
      utm_source: "test",
      utm_medium: "cli",
      utm_campaign: "diag",
      referrer: "test-script",
      client_info: "node-test-script",
      timestamp: new Date().toISOString(),
   };

   try {
      const fetchFn = typeof fetch !== "undefined" ? fetch : (await import("node-fetch")).default;
      const res = await fetchFn(target, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
      });
      const text = await res.text();
      let json;
      try {
         json = JSON.parse(text);
      } catch (e) {
         json = null;
      }
      console.log("HTTP", res.status, res.statusText);
      console.log("Response body:", json || text);
   } catch (err) {
      console.error("Error calling target:", err.message || err);
      process.exitCode = 2;
   }
})();

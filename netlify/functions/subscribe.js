const fetch = require("node-fetch");

// Netlify Function: subscribe -> insert into Supabase waitlist table
// Environment variables expected in Netlify:
//   SUPABASE_URL - your Supabase project URL (https://xyz.supabase.co)
//   SUPABASE_KEY - a Supabase key with insert rights (service_role or a dedicated insert key)

exports.handler = async function (event, context) {
   if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
   }

   let body;
   try {
      body = JSON.parse(event.body);
   } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
   }

   const email = (body.email || "").toLowerCase().trim();
   if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid email" }) };
   }

   const supabaseUrl = process.env.SUPABASE_URL;
   const supabaseKey = process.env.SUPABASE_KEY;
   if (!supabaseUrl || !supabaseKey) {
      return {
         statusCode: 500,
         body: JSON.stringify({
            error: "Server not configured (SUPABASE_URL or SUPABASE_KEY missing)",
         }),
      };
   }

   const payload = {
      email,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      referrer: body.referrer || null,
      client_info: body.client_info || null,
      created_at: body.timestamp || new Date().toISOString(),
   };

   try {
      const url = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/waitlist`;
      const res = await fetch(url, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=representation",
         },
         body: JSON.stringify([payload]),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
         // If duplicate or constraint error, surface the message
         return {
            statusCode: 500,
            body: JSON.stringify({
               error: data && data.message ? data.message : "Upstream error",
               detail: data,
            }),
         };
      }

      return {
         statusCode: 200,
         body: JSON.stringify({ ok: true, row: Array.isArray(data) ? data[0] : data }),
      };
   } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message || "Unknown error" }) };
   }
};

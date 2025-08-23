(function () {
   // capture utm params and referrer
   function getParam(name) {
      const url = new URL(window.location.href);
      return url.searchParams.get(name) || "";
   }

   document.getElementById("utm_source").value = getParam("utm_source");
   document.getElementById("utm_medium").value = getParam("utm_medium");
   document.getElementById("utm_campaign").value = getParam("utm_campaign");
   document.getElementById("referrer").value = document.referrer || "";
   function startAnimations() {
      const animatedElements = document.querySelectorAll(
         'body, input[type="email"], form#waitlist-form button, .signup, .title, .subtext, .screenshot, .foot.small'
      );
      animatedElements.forEach(element => {
         element.style.animationPlayState = 'running';
      });
   }

   document.addEventListener('DOMContentLoaded', startAnimations);

   const form = document.getElementById("waitlist-form");
   const emailInput = document.getElementById("email");
   const submitBtn = document.getElementById("submit");
   const messageEl = document.getElementById("message");

   form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;
      submitBtn.disabled = true;
      messageEl.textContent = "Sending...";

      const payload = {
         email,
         utm_source: document.getElementById("utm_source").value,
         utm_medium: document.getElementById("utm_medium").value,
         utm_campaign: document.getElementById("utm_campaign").value,
         referrer: document.getElementById("referrer").value,
         timestamp: new Date().toISOString(),
      };

      try {
         const res = await fetch("/.netlify/functions/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         });
         const data = await res.json();
         if (res.ok) {
            messageEl.textContent = "Thanks — you are on the list!";
            // fire GA event if available
            if (window.gtag) {
               try {
                  gtag("event", "signup", { method: "waitlist" });
               } catch (e) {}
            }
            emailInput.value = "";
         } else {
            messageEl.textContent = data && data.error ? data.error : "Failed to save your email.";
         }
      } catch (err) {
         messageEl.textContent = "Network error. Try again later.";
      }
      submitBtn.disabled = false;
   });
})();

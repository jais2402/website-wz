# Turning on the enquiry email

The forms on the site (the /contact-us page and the short form in the contact block on every page) send to
`/api/enquiry`, a small Vercel function that emails each enquiry to Wezigns through Resend. Until the three steps
below are done, the forms still work: they open the visitor's email app with the message filled in, as before.

1. **Create a Resend account and verify wezigns.com.** Sign up at resend.com, open _Domains_, add `wezigns.com` and
   add the DNS records it shows (SPF, DKIM, and optionally DMARC) at your DNS provider. Wait until the domain shows
   _Verified_. Then open _API Keys_ and create a key with _Sending access_ for that domain.

2. **Add the settings in Vercel.** In the Vercel project, open _Settings → Environment Variables_ and add, for
   Production (and Preview if you want previews to send too):
   - `RESEND_API_KEY`: the key from step 1 (required).
   - `ENQUIRY_TO` (optional): where enquiries go. Default `contact@wezigns.com`. Several addresses can be
     separated by commas.
   - `ENQUIRY_FROM` (optional): the sender. Default `Wezigns website <website@wezigns.com>`. It must be an address
     on the domain verified in step 1.

3. **Redeploy and send a test.** Environment variables only apply to new deployments, so redeploy the latest
   production deployment (_Deployments → … → Redeploy_). Then fill in the form on the live site with your own
   email. You should see "Your message is with us" and receive the enquiry at `ENQUIRY_TO`; pressing _Reply_
   answers the visitor directly. If the email app opens instead, the key is missing; if you see an error,
   check _Vercel → Logs_ for lines starting with `enquiry:` (they show Resend's reason, for example an unverified
   domain).

4. **Add a rate limit (recommended).** The function only accepts posts from the site itself (it checks the
   `Origin` header) and slows down bursts from one IP, but that limit lives in each function instance. For a firm
   limit, open _Vercel → Firewall → Configure → New rule_: if _Request Path_ equals `/api/enquiry`, then
   _Rate Limit_ with a fixed window of 10 minutes and 5 requests, keyed by IP, action _Deny_ (429).

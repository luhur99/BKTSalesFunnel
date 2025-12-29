# 🐛 STEP-BY-STEP DEBUG GUIDE

## For User on "Other Computer" (Yang Bermasalah)

### 📋 **FOLLOW THESE STEPS EXACTLY:**

---

### **STEP 1: Open Browser Console** (3 minutes)

1. Buka aplikasi BKT-Leads di browser
2. **Press F12** (atau klik kanan → "Inspect")
3. Klik tab **"Console"** (biasanya di samping "Elements")
4. **LEAVE IT OPEN** - jangan ditutup!

---

### **STEP 2: Try to Add Lead** (2 minutes)

1. Klik tombol **"Tambah Lead"** (top right)
2. Isi form:
   - **Nama:** Test User
   - **Phone:** 08123456789
   - **Source:** Pilih salah satu
   - **Stage:** Pilih salah satu
3. Klik **"Tambah Lead"**
4. Wait for response...

---

### **STEP 3: Check Console Output** (5 minutes)

**Look for these messages in console:**

#### **✅ SUCCESS CASE (Working):**
```
📊 Loading sources and stages...
✅ Sources loaded: 4
✅ Stages loaded: 20
📤 Attempting to save lead: {...}
🔵 Supabase connected - attempting INSERT
📊 Lead data to insert: {...}
✅ Validation passed, attempting Supabase INSERT...
🔑 Using Supabase URL: https://dqlzthetcaktudilsyxu.supabase.co
🔑 Anon key present: true
✅ Lead inserted successfully: {...}
```

#### **❌ ERROR CASE (Not Working):**

**Error Type A: CORS**
```
❌ Access to fetch at 'https://dqlzthetcaktudilsyxu.supabase.co/rest/v1/leads' 
   from origin 'https://your-domain.vercel.app' has been blocked by CORS policy
```
**→ Diagnosis:** Domain not whitelisted in Supabase  
**→ Fix:** See "Fix CORS" section below

**Error Type B: Network**
```
❌ Failed to fetch
❌ NetworkError when attempting to fetch resource
❌ TypeError: Network request failed
```
**→ Diagnosis:** Firewall/proxy blocking Supabase  
**→ Fix:** See "Fix Network" section below

**Error Type C: Authentication**
```
❌ Supabase INSERT error: { code: "PGRST301", message: "JWT expired" }
❌ Error code: PGRST301
```
**→ Diagnosis:** API key invalid/expired  
**→ Fix:** See "Fix API Key" section below

**Error Type D: Validation**
```
❌ VALIDATION ERROR: Phone number is required
❌ VALIDATION ERROR: Lead source is required
```
**→ Diagnosis:** Form data incomplete  
**→ Fix:** Ensure all required fields filled

---

### **STEP 4: Screenshot Everything** (2 minutes)

**Take 3 screenshots:**
1. **Full console output** (with errors visible)
2. **Error alert popup** (if any)
3. **Network tab** (F12 → Network → refresh → try add lead → screenshot failed requests)

---

### **STEP 5: Send to Admin** (1 minute)

**WhatsApp/Email admin with:**
```
Subject: BKT-Leads Error Report

1. Production URL: [paste URL]
2. Browser: Chrome/Firefox/Edge/Safari [version]
3. Computer: Windows/Mac/Linux
4. Network: Office WiFi / Home / Mobile Hotspot
5. Error Type: CORS / Network / Auth / Validation (from Step 3)
6. Screenshots: [attach 3 screenshots]
```

---

## 🔧 **QUICK FIXES (If You Have Access):**

### **FIX CORS** (Admin Only)

**Supabase Dashboard:**
```
1. Login: https://supabase.com/dashboard
2. Select project: dqlzthetcaktudilsyxu
3. Settings → API
4. Under "URL Configuration":
   - Site URL: https://YOUR-PRODUCTION-DOMAIN.vercel.app
   - Redirect URLs: Add pattern: https://YOUR-PRODUCTION-DOMAIN.vercel.app/**
5. Click "Save"
6. Wait 2 minutes
7. Test again
```

---

### **FIX NETWORK** (User Can Try)

**Option 1: Try Different Network**
```
1. Disconnect from office WiFi
2. Connect to mobile hotspot
3. Try add lead again
4. If works → Office firewall blocking Supabase
```

**Option 2: Disable VPN**
```
1. Turn off VPN
2. Try add lead again
3. If works → VPN blocking Supabase
```

**Option 3: Check Browser Extensions**
```
1. Disable ad blockers
2. Disable privacy extensions
3. Try add lead again
4. If works → Extension blocking requests
```

---

### **FIX API KEY** (Admin Only)

**Vercel Dashboard:**
```
1. Login: https://vercel.com/dashboard
2. Select project: BKT-Leads
3. Settings → Environment Variables
4. Check these exist:
   - NEXT_PUBLIC_SUPABASE_URL = https://dqlzthetcaktudilsyxu.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc... (long key)
5. If missing → Add them
6. Redeploy (Deployments → ... → Redeploy)
7. Wait 3 minutes
8. Test again
```

---

## 🧪 **QUICK NETWORK TEST:**

**Paste in browser console (F12 → Console):**

```javascript
// Test 1: Can reach Supabase?
fetch('https://dqlzthetcaktudilsyxu.supabase.co/rest/v1/')
  .then(() => console.log('✅ Supabase reachable'))
  .catch(() => console.error('❌ Cannot reach Supabase'));

// Test 2: Can authenticate?
fetch('https://dqlzthetcaktudilsyxu.supabase.co/rest/v1/', {
  headers: { 
    'apikey': 'YOUR_ANON_KEY_HERE',
    'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
  }
})
  .then(r => r.status === 200 ? console.log('✅ Auth works') : console.error('❌ Auth failed'))
  .catch(err => console.error('❌ Network error:', err));
```

**Expected Results:**
- ✅ Both tests pass → Connection OK
- ❌ Test 1 fails → Network/firewall issue
- ❌ Test 2 fails → API key issue

---

## 📊 **COMMON SCENARIOS:**

### **Scenario A: Works on localhost, fails on production**
**Cause:** CORS not configured  
**Fix:** Add production domain to Supabase CORS settings

### **Scenario B: Works on your computer, fails on others**
**Cause:** Environment variables not in Vercel  
**Fix:** Add env vars to Vercel, redeploy

### **Scenario C: Works on home WiFi, fails on office WiFi**
**Cause:** Corporate firewall blocking *.supabase.co  
**Fix:** Ask IT to whitelist Supabase domains

### **Scenario D: Intermittent failures**
**Cause:** Network instability or rate limiting  
**Fix:** Check Supabase dashboard for usage limits

---

## ✅ **VERIFICATION:**

**After applying fix, test on "other computer":**

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Open console (F12)
4. Try add lead
5. Check console for success messages
6. Verify lead appears in dashboard

**If successful:**
- ✅ No red errors in console
- ✅ Green success checkmarks
- ✅ Lead saves and appears
- ✅ No alert popups

---

## 🆘 **STILL NOT WORKING?**

**Do this:**
1. Record screen while trying to add lead
2. Show console with errors
3. Send video + screenshots to admin
4. Include all info from Step 5 above

**Admin will:**
- Analyze console errors
- Check Supabase logs
- Check Vercel deployment logs
- Provide specific fix

---

**Last Updated:** 2025-12-29  
**Support:** screenshot@bkt-leads.com
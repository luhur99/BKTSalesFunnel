# 🔍 BKT-Leads CRM - Troubleshooting Guide

## ❌ Error: "Gagal Menyimpan Lead" di Komputer Lain

### 🎯 **QUICK FIX CHECKLIST:**

#### **1️⃣ Check Browser Console (MOST IMPORTANT!)**
```
Cara:
1. Buka aplikasi di komputer yang bermasalah
2. Tekan F12 (Chrome/Edge) atau Ctrl+Shift+I (Firefox)
3. Klik tab "Console"
4. Coba tambah lead → Lihat error messages
5. Screenshot semua error merah
```

**What to look for:**
- ❌ `CORS error` → Domain issue
- ❌ `401 Unauthorized` → API key issue
- ❌ `Network error` → Connection issue
- ❌ `403 Forbidden` → RLS policy issue

---

#### **2️⃣ Verify Supabase CORS Settings**

**Problem:** Domain production tidak di-whitelist

**Solution:**
```
1. Login ke Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project: dqlzthetcaktudilsyxu
3. Klik "Settings" → "API"
4. Scroll ke "URL Configuration"
5. Tambahkan domain production Anda ke "Site URL"
6. Tambahkan domain ke "Redirect URLs"
```

**Example:**
```
Site URL: https://bkt-leads.vercel.app
Redirect URLs: 
- https://bkt-leads.vercel.app/**
- https://*.vercel.app/**
```

---

#### **3️⃣ Verify Environment Variables di Vercel**

**Problem:** API keys tidak tersync di production

**Solution:**
```
1. Login ke Vercel Dashboard
2. Pilih project BKT-Leads
3. Klik "Settings" → "Environment Variables"
4. Verify ada 3 variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_SITE_URL
5. Jika tidak ada → Copy dari .env.local
6. Redeploy setelah menambahkan
```

---

#### **4️⃣ Test Network Connectivity**

**Problem:** Firewall/proxy blocking Supabase

**Solution di komputer yang bermasalah:**
```
1. Buka browser
2. Paste URL ini: https://dqlzthetcaktudilsyxu.supabase.co/rest/v1/
3. Jika muncul error/timeout → Network blocked
4. Coba:
   - Disable antivirus temporarily
   - Disable VPN
   - Try different network (mobile hotspot)
   - Check corporate firewall settings
```

---

#### **5️⃣ Browser Compatibility Check**

**Supported Browsers:**
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

**Clear Browser Cache:**
```
Chrome/Edge:
1. Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Select "All time"
4. Click "Clear data"

Firefox:
1. Ctrl + Shift + Delete
2. Select "Cache"
3. Select "Everything"
4. Click "Clear Now"
```

---

### 🔧 **ADVANCED DEBUGGING:**

#### **Console Logs to Check:**

**When adding lead, you should see:**
```javascript
✅ Validation passed, attempting Supabase INSERT...
🔑 Using Supabase URL: https://dqlzthetcaktudilsyxu.supabase.co
🔑 Anon key present: true
✅ Lead inserted successfully: { id: "...", name: "..." }
```

**If you see errors:**

**Error 1: CORS**
```javascript
❌ Access to fetch at 'https://...supabase.co' has been blocked by CORS policy
```
**Fix:** Add domain to Supabase CORS settings (see step 2)

**Error 2: Network**
```javascript
❌ Failed to fetch
❌ NetworkError when attempting to fetch resource
```
**Fix:** Check firewall/proxy/VPN (see step 4)

**Error 3: Validation**
```javascript
❌ VALIDATION ERROR: Phone number is required
❌ VALIDATION ERROR: Lead source is required
```
**Fix:** Ensure all required fields are filled

**Error 4: Database**
```javascript
❌ Supabase INSERT error: { code: "PGRST...", message: "..." }
```
**Fix:** Check RLS policies or contact admin

---

### 📊 **SPECIFIC ERROR CODES:**

| Code | Meaning | Solution |
|------|---------|----------|
| `PGRST301` | Authentication required | Check API keys |
| `PGRST116` | Row not found | Check data exists |
| `23505` | Duplicate key | Record already exists |
| `42501` | Insufficient privilege | Check RLS policies |
| `CORS` | Domain not whitelisted | Add to Supabase CORS |

---

### 🧪 **QUICK TEST:**

**Test 1: API Connection**
```javascript
// Paste in browser console on production site:
fetch('https://dqlzthetcaktudilsyxu.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Expected: No errors
// If error: Connection/CORS issue
```

**Test 2: Insert Test**
```javascript
// Paste in browser console on production site:
fetch('https://dqlzthetcaktudilsyxu.supabase.co/rest/v1/leads', {
  method: 'POST',
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test Lead',
    phone: '08123456789',
    source_id: 'VALID_SOURCE_ID',
    current_stage_id: 'VALID_STAGE_ID',
    status: 'active'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Expected: New lead object returned
// If error: See error code above
```

---

### 🎯 **MOST COMMON ISSUES:**

**Issue 1: Domain Not Whitelisted** (70% of cases)
```
Symptoms:
- Works on localhost
- Fails on production domain
- CORS error in console

Fix:
Add production domain to Supabase "Site URL" and "Redirect URLs"
```

**Issue 2: Missing Environment Variables** (20% of cases)
```
Symptoms:
- "Invalid API key" error
- "undefined" in error messages
- Works on your computer, fails on others

Fix:
Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel
```

**Issue 3: Network Blocking** (10% of cases)
```
Symptoms:
- "Failed to fetch" error
- Timeout errors
- Works on mobile network, fails on office WiFi

Fix:
Disable firewall/VPN, or ask IT to whitelist *.supabase.co
```

---

### 📞 **NEED HELP?**

**Send to Admin:**
1. ✅ Screenshot of browser console errors (F12)
2. ✅ Screenshot of "Gagal menyimpan lead" alert
3. ✅ URL production site
4. ✅ Browser name & version
5. ✅ Network type (office/home/mobile)

**Quick Info to Gather:**
```
- Production URL: _______________________________
- Browser: _______________________________________
- Error message: _________________________________
- Works on your computer? Yes / No
- Console error screenshot: Attached / Not attached
```

---

### ✅ **VERIFICATION CHECKLIST:**

After fixes, verify these work on OTHER computer:

- [ ] Open production URL
- [ ] See dashboard
- [ ] Click "Tambah Lead"
- [ ] Fill form (name, phone, source, stage)
- [ ] Click "Simpan"
- [ ] See success message
- [ ] Lead appears in list
- [ ] Can edit lead
- [ ] Can move lead to another stage

**If ALL checked → WORKING! ✅**

---

### 🔧 **EMERGENCY FIX:**

**If nothing works, try this nuclear option:**

**1. Redeploy from Vercel:**
```
1. Go to Vercel Dashboard
2. Click project
3. Click "Deployments"
4. Click "..." on latest deployment
5. Click "Redeploy"
6. Wait for completion
7. Test again
```

**2. Clear Supabase Cache:**
```
1. Go to Supabase Dashboard
2. Click "Settings" → "API"
3. Click "Reset Database Password" (optional)
4. Re-save all settings
5. Test again
```

---

## 🎊 **SUCCESS INDICATORS:**

**You'll know it's fixed when:**
- ✅ No console errors
- ✅ Lead saves successfully
- ✅ Success message appears
- ✅ Lead appears in kanban board
- ✅ Works on ANY computer/network
- ✅ Works on mobile devices

---

**Last Updated:** 2025-12-29  
**Version:** 1.0  
**Support:** Check console logs + send screenshot to admin
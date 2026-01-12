# User Manual - Lead Management System Budi Karya

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Login & Autentikasi](#login--autentikasi)
3. [Dashboard Utama](#dashboard-utama)
4. [Manajemen Lead](#manajemen-lead)
5. [Analitik & Laporan](#analitik--laporan)
6. [Pengaturan Sistem](#pengaturan-sistem)
7. [Tips & Best Practices](#tips--best-practices)

---

## Pendahuluan

### Tentang Aplikasi
Lead Management System Budi Karya adalah sistem manajemen prospek pelanggan yang dirancang khusus untuk mengelola pipeline penjualan dengan efisien. Aplikasi ini membantu tim sales untuk:
- Melacak perjalanan lead dari tahap awal hingga closing
- Menganalisis bottleneck dalam sales funnel
- Meningkatkan conversion rate melalui data-driven insights
- Mengelola follow-up secara sistematis

### Persyaratan Sistem
- Browser modern (Chrome, Firefox, Safari, Edge) versi terbaru
- Koneksi internet stabil
- Resolusi minimal 1280x720 untuk pengalaman optimal

---

## Login & Autentikasi

### Langkah Login

#### 1. Akses Halaman Login
- Buka browser dan kunjungi URL aplikasi
- Anda akan diarahkan ke halaman login secara otomatis jika belum login

#### 2. Masukkan Kredensial
**Input yang diperlukan:**
- **Email**: Alamat email terdaftar
- **Password**: Password akun Anda

**Langkah-langkah:**
1. Ketik email di field "Email"
2. Ketik password di field "Password"
3. Klik tombol **"Sign In"**

#### 3. Login dengan Google (Opsional)
Jika Anda lebih suka login menggunakan akun Google:
1. Klik tombol **"Continue with Google"**
2. Pilih akun Google yang ingin digunakan
3. Berikan izin akses yang diminta
4. Anda akan otomatis diarahkan ke dashboard

#### 4. Lupa Password
Jika lupa password:
1. Klik link **"Forgot password?"** di halaman login
2. Masukkan email terdaftar
3. Cek inbox email untuk link reset password
4. Klik link di email dan buat password baru
5. Login dengan password baru

### Keamanan Akun
- Password minimal 8 karakter
- Gunakan kombinasi huruf besar, kecil, angka, dan simbol
- Jangan bagikan kredensial login ke siapapun
- Logout setelah selesai menggunakan aplikasi di komputer publik

---

## Dashboard Utama

### Tampilan Awal Dashboard

Setelah login berhasil, Anda akan melihat halaman dashboard yang menampilkan:

#### 1. Header Navigation
**Lokasi:** Bagian atas halaman

**Komponen:**
- **Logo Budi Karya**: Klik untuk kembali ke dashboard
- **Menu Navigasi**:
  - Dashboard (rumah)
  - Analytics Report (laporan)
  - Guide (panduan)
  - Settings (pengaturan)
- **Profile Menu**: Foto profil + dropdown untuk logout

#### 2. View Controls
**Lokasi:** Di bawah header, sebelah kiri

**Opsi Tampilan:**
- **Kanban View** 🎯: Tampilan papan visual dengan kolom per stage
- **List View** 📋: Tampilan tabel dengan semua detail lead

**Cara Menggunakan:**
1. Klik icon Kanban atau List untuk switch view
2. Pilihan tersimpan otomatis untuk kunjungan berikutnya

#### 3. Action Buttons
**Lokasi:** Di bawah header, sebelah kanan

**Tombol Tersedia:**
- **+ Add Lead**: Tambah lead baru
- **Analytics**: Lihat bottleneck analysis
- **Filter**: Filter lead berdasarkan kriteria

---

## Manajemen Lead

### A. Menambah Lead Baru

#### Langkah-Langkah:
1. **Klik tombol "+ Add Lead"** di bagian kanan atas dashboard
2. Modal form akan muncul

#### Form Input Lead:

**1. Informasi Dasar (Wajib Diisi)**
- **Nama Lead**: Nama lengkap prospek
  - Contoh: "Budi Santoso"
- **Email**: Alamat email yang valid
  - Contoh: "budi.santoso@email.com"
- **Nomor Telepon**: Nomor kontak
  - Format: 08xxxxxxxxxx atau +62xxxxxxxxxx
  - Contoh: "08123456789"

**2. Informasi Properti**
- **Tipe Properti**: Pilih dari dropdown
  - Opsi: Rumah, Apartemen, Ruko, Tanah, Villa
  - Contoh: Pilih "Rumah"
  
- **Lokasi Properti**: Lokasi yang diminati
  - Contoh: "Jakarta Selatan, Kebayoran Baru"
  
- **Budget Range**: Rentang budget prospek
  - Format: Rp xxx - Rp xxx
  - Contoh: "Rp 500jt - Rp 1M"

**3. Status & Stage**
- **Stage**: Tahap dalam funnel
  - Default: "New Lead"
  - Bisa diubah setelah lead dibuat
  
- **Priority**: Tingkat prioritas
  - Opsi: Low 🟢, Medium 🟡, High 🔴
  - Pilih berdasarkan urgency dan potensi
  
- **Source**: Sumber lead
  - Opsi: Website, Referral, Social Media, Event, Cold Call, Walk-in
  - Contoh: "Website"

**4. Label Custom (Opsional)**
- Tambahkan label untuk kategorisasi
- Contoh: "HOT", "Cash Buyer", "First Time Buyer"
- Klik dropdown dan pilih atau ketik label baru

**5. Catatan Awal (Opsional)**
- Tulis catatan atau konteks penting
- Contoh: "Ingin beli dalam 3 bulan, prefer lokasi dekat sekolah"

#### Finalisasi:
1. Pastikan semua field wajib terisi (ditandai *)
2. Review data yang diinput
3. Klik tombol **"Add Lead"**
4. Lead baru akan muncul di Kanban/List view

### B. Melihat Detail Lead

#### Dari Kanban View:
1. Cari kartu lead yang ingin dilihat
2. **Klik pada kartu lead**
3. Modal detail akan terbuka

#### Dari List View:
1. Temukan row lead yang diinginkan
2. **Klik tombol "Details"** di kolom Actions
3. Modal detail akan terbuka

#### Informasi di Modal Detail:

**Tab 1: Overview**
- Nama, Email, Telepon
- Tipe & Lokasi Properti
- Budget Range
- Priority Badge
- Source Badge
- Custom Labels
- Stage saat ini
- Created & Updated timestamps

**Tab 2: Notes & Activity**
- Semua catatan yang pernah ditambahkan
- Riwayat perubahan stage
- Timeline aktivitas chronological

**Tab 3: Follow-ups**
- Daftar jadwal follow-up
- Status: Pending, Completed, Overdue
- Filter berdasarkan status
- Form tambah follow-up baru

### C. Mengedit Lead

#### Cara Edit Lead:
1. Buka detail lead (klik kartu atau tombol Details)
2. Klik tombol **"Edit"** di modal (pojok kanan atas)
3. Form edit akan muncul (sama seperti form Add Lead)
4. Ubah field yang diperlukan
5. Klik **"Save Changes"**

#### Field yang Bisa Diedit:
- ✅ Semua informasi kontak
- ✅ Informasi properti
- ✅ Priority level
- ✅ Custom labels (tambah/hapus)
- ✅ Stage (pindah ke tahap lain)
- ⚠️ Source tidak bisa diubah (untuk integritas data)

### D. Memindahkan Lead Antar Stage

#### Metode 1: Drag & Drop (Kanban View)
1. Pastikan di Kanban View
2. **Klik dan tahan** pada kartu lead
3. **Drag** ke kolom stage tujuan
4. **Lepas** di area kolom
5. Sistem akan update otomatis

**Tips:**
- Hover di atas kolom akan highlight area drop
- Lead yang di-drag akan sedikit transparan
- Animasi smooth untuk feedback visual

#### Metode 2: Modal Detail
1. Buka detail lead
2. Klik tombol **"Move Stage"**
3. Modal konfirmasi muncul
4. Pilih stage tujuan dari dropdown
5. Tambahkan catatan (opsional) untuk alasan perpindahan
6. Klik **"Confirm Move"**

#### Metode 3: Edit Form
1. Buka detail lead → Edit
2. Ubah dropdown "Stage"
3. Save changes

### E. Menambah Notes

#### Langkah-Langkah:
1. Buka detail lead
2. Klik tab **"Notes & Activity"**
3. Scroll ke bagian **"Add New Note"**
4. Ketik catatan di text area
   - Contoh: "Follow-up call: Prospek tertarik dengan unit tipe 45"
5. Klik tombol **"Add Note"**

#### Best Practices untuk Notes:
- 📅 Selalu sertakan tanggal/waktu konteks
- 📞 Catat hasil setiap komunikasi
- 💡 Tulis insight penting dari percakapan
- ⚠️ Tandai objection atau concern
- ✅ Update progress setelah setiap follow-up

### F. Mengelola Follow-ups

#### Menambah Follow-up:
1. Buka detail lead
2. Klik tab **"Follow-ups"**
3. Klik tombol **"+ Add Follow-up"**
4. Isi form:
   - **Tanggal**: Pilih dari date picker
   - **Waktu**: Pilih jam (format 24 jam)
   - **Tipe**: Call, Email, Meeting, WhatsApp, Site Visit
   - **Catatan**: Tujuan/agenda follow-up
5. Klik **"Schedule Follow-up"**

#### Menandai Follow-up Selesai:
1. Buka tab Follow-ups
2. Cari follow-up yang sudah dilakukan
3. Klik tombol **"Mark Complete"**
4. Follow-up akan pindah ke section Completed

#### Filter Follow-ups:
**Filter Status:**
- All: Semua follow-up
- Pending: Yang belum dilakukan
- Completed: Yang sudah selesai
- Overdue: Yang sudah lewat deadline

**Cara Filter:**
1. Klik dropdown filter status
2. Pilih status yang diinginkan
3. List akan update otomatis

### G. Menghapus Lead

#### ⚠️ PERHATIAN:
Penghapusan lead bersifat **PERMANEN** dan **TIDAK BISA DIBATALKAN**. Semua data terkait (notes, follow-ups, activity logs) akan ikut terhapus.

#### Langkah-Langkah:
1. Buka detail lead
2. Klik tombol **"Delete Lead"** (biasanya di pojok kanan bawah)
3. Dialog konfirmasi akan muncul
4. Baca peringatan dengan seksama
5. Ketik **"DELETE"** di confirmation field (case-sensitive)
6. Klik tombol **"Confirm Delete"** yang berwarna merah

#### Kapan Sebaiknya Menghapus Lead:
- ❌ Lead palsu/spam
- ❌ Duplikat entry
- ❌ Data test yang tidak diperlukan
- ⚠️ **TIDAK** disarankan menghapus lead yang sudah lost/rejected (gunakan stage "Lost" saja untuk tracking)

---

## Analitik & Laporan

### A. Bottleneck Analytics (Dashboard)

#### Cara Mengakses:
1. Dari dashboard, klik tombol **"Analytics"** di kanan atas
2. Modal Bottleneck Analytics akan muncul

#### Informasi yang Ditampilkan:

**1. Funnel Health Cards**
- **Total Leads**: Jumlah semua lead aktif
- **Conversion Rate**: Persentase lead yang berhasil closing
- **Average Days in Funnel**: Rata-rata waktu lead di pipeline
- **Active Stages**: Jumlah stage yang memiliki lead

**2. Stage Velocity Chart**
- Grafik bar menampilkan rata-rata hari di setiap stage
- **Cara Membaca:**
  - Bar lebih panjang = lead stuck lebih lama
  - Warna gradient menunjukkan intensitas
  - Hover untuk detail angka eksak

**3. Stage Heatmap**
- Grid 7x24 menampilkan distribusi lead per hari dan jam
- **Warna:**
  - 🟦 Biru muda: Sedikit lead
  - 🟦 Biru tua: Banyak lead
- **Insight:**
  - Identifikasi waktu peak activity
  - Optimalkan jadwal follow-up

**4. Bottleneck Warnings**
- Alert untuk stage dengan masalah
- **Indikator:**
  - 🔴 High bottleneck: >30 hari average
  - 🟡 Medium bottleneck: 15-30 hari
  - 🟢 Healthy: <15 hari
- **Action Items:**
  - Review lead yang stuck
  - Tingkatkan follow-up frequency

**5. Conversion Funnel**
- Visual funnel dengan persentase drop-off
- Menunjukkan dimana lead paling banyak hilang
- Klik stage untuk detail breakdown

### B. Analytics Report Page

#### Cara Mengakses:
1. Klik menu **"Analytics Report"** di navigation bar
2. Halaman full report akan terbuka

#### Komponen Report:

**1. Overview Metrics (Top Cards)**
- Total Leads
- Win Rate (%)
- Avg. Time to Close
- Active Pipeline Value

**2. Detailed Velocity Analysis**
- Chart lebih lengkap dengan time series
- Breakdown per stage dengan historical data
- Export ke CSV/PDF untuk presentasi

**3. Heat Map dengan Time Filter**
- Filter berdasarkan range tanggal
- Pilih stage spesifik untuk analisis
- Zoom in/out untuk detail

**4. Stage Performance Table**
- Tabel sortable dengan metrics:
  - Lead count per stage
  - Average time in stage
  - Conversion rate to next stage
  - Bottleneck score
- Klik header untuk sort

**5. Follow-up Funnel Flow**
- Visualisasi alur follow-up
- Track completion rate
- Identifikasi follow-up yang sering missed

#### Tips Menggunakan Analytics:
- 📊 Review mingguan untuk trend analysis
- 🎯 Focus on stages dengan lowest conversion
- ⏱️ Set target untuk average days per stage
- 📈 Monitor improvement setelah strategy changes

### C. Menggunakan Filter

#### Cara Menggunakan Filter:
1. Klik tombol **"Filter"** di dashboard
2. Panel filter akan expand

#### Opsi Filter:

**1. Filter by Stage**
- Checkbox untuk setiap stage
- Select multiple untuk kombinasi
- Contoh: Tampilkan hanya "Qualified" dan "Proposal"

**2. Filter by Priority**
- Low, Medium, High
- Kombinasikan dengan filter lain

**3. Filter by Source**
- Website, Referral, Social Media, dll
- Berguna untuk analisis channel effectiveness

**4. Filter by Date Range**
- Created Date: Kapan lead masuk
- Updated Date: Last activity
- Custom range dengan date picker

**5. Filter by Label**
- Select custom labels
- OR logic (tampilkan yang punya salah satu label)

**6. Search**
- Quick search by nama, email, atau telepon
- Real-time filtering

#### Menyimpan Filter Preset:
1. Atur filter sesuai kebutuhan
2. Klik **"Save Preset"**
3. Beri nama preset (contoh: "Hot Leads This Month")
4. Preset tersimpan untuk quick access

#### Clear All Filters:
- Klik tombol **"Clear Filters"** untuk reset ke view default

---

## Pengaturan Sistem

### A. Akses Settings

#### Cara Mengakses:
1. Klik menu **"Settings"** di navigation bar
2. Atau klik foto profil → Settings
3. Halaman settings akan terbuka dengan tab menu

### B. Manage Funnel Stages

#### Tujuan:
Customize sales funnel sesuai proses bisnis Anda

#### Langkah-Langkah:

**1. Lihat Existing Stages**
- List semua stage ditampilkan dengan order
- Default stages: New Lead → Qualified → Proposal → Negotiation → Closing → Won/Lost

**2. Tambah Stage Baru**
1. Klik tombol **"+ Add Stage"**
2. Form input muncul:
   - **Stage Name**: Nama stage baru
   - **Description**: Deskripsi purpose stage
   - **Order**: Posisi dalam funnel (auto-increment)
3. Klik **"Save Stage"**

**3. Edit Stage**
1. Klik icon ✏️ Edit pada stage
2. Ubah nama atau deskripsi
3. Save changes

**4. Reorder Stages**
1. Klik icon ⬍ Drag handle
2. Drag stage ke posisi baru
3. Drop untuk save urutan baru
4. Lead existing akan tetap di stage lama (tidak auto-move)

**5. Delete Stage**
1. Klik icon 🗑️ Delete
2. Konfirmasi penghapusan
3. **⚠️ WARNING**: Lead di stage tersebut akan pindah ke stage default

**6. Set as Won/Lost Stage**
- Toggle untuk mark stage sebagai terminal (akhir funnel)
- Won: Success/Closing berhasil
- Lost: Rejected/Batal

### C. Script Templates Manager

#### Tujuan:
Buat dan kelola template script untuk komunikasi dengan lead

#### Fitur:

**1. Template Categories**
- Cold Call Scripts
- Follow-up Emails
- WhatsApp Messages
- Objection Handling
- Closing Scripts

**2. Create Template**
1. Klik **"+ New Template"**
2. Pilih kategori
3. Tulis nama template
4. Tulis content dengan placeholder:
   - `{nama}`: Nama lead
   - `{properti}`: Tipe properti
   - `{lokasi}`: Lokasi properti
   - `{budget}`: Budget range
5. Save template

**3. Use Template**
1. Saat add notes atau follow-up
2. Klik icon 📋 Template
3. Pilih template
4. Placeholder auto-replace dengan data lead
5. Edit jika perlu sebelum save

**4. Edit/Delete Template**
- Edit: Update content template
- Delete: Hapus template (tidak affect notes yang sudah dibuat)

### D. Custom Labels Manager

#### Tujuan:
Buat label custom untuk kategorisasi lead

#### Fitur:

**1. View Existing Labels**
- List semua label dengan usage count
- Contoh: "HOT" (dipakai 15 leads), "Cash Buyer" (5 leads)

**2. Create Label**
1. Klik **"+ Add Label"**
2. Input:
   - Label Name
   - Color (pilih dari palette atau hex code)
   - Description (opsional)
3. Save

**3. Edit Label**
- Update nama atau warna
- Perubahan apply ke semua lead yang punya label ini

**4. Delete Label**
- Hapus label
- Lead yang punya label ini akan kehilangan label tersebut

**5. Bulk Apply Labels**
1. Select multiple leads di list view
2. Klik **"Add Label"**
3. Pilih label untuk apply ke semua selected leads

### E. Profile & Security

#### Profile Information:

**1. Edit Profile**
1. Tab "Profile & Security"
2. Section "Profile Information"
3. Edit:
   - Full Name
   - Email (perlu verifikasi)
   - Phone Number
   - Job Title
   - Avatar (upload gambar)
4. Save Changes

**2. Change Password**
1. Section "Security"
2. Input:
   - Current Password
   - New Password (min. 8 karakter)
   - Confirm New Password
3. Klik **"Change Password"**
4. Logout otomatis → Login dengan password baru

**3. Two-Factor Authentication (2FA)**
1. Enable toggle 2FA
2. Scan QR code dengan app authenticator (Google Authenticator, Authy)
3. Enter verification code
4. Save backup codes untuk recovery
5. 2FA aktif untuk login berikutnya

**4. Login History**
- View recent login activities
- IP Address, Device, Location
- Klik **"This wasn't me"** jika suspicious activity

**5. Connected Accounts**
- Lihat OAuth connections (Google, etc)
- Disconnect akun jika tidak digunakan

---

## Tips & Best Practices

### A. Optimasi Workflow

#### 1. Daily Routine Checklist
**Pagi (9:00 - 10:00)**
- ✅ Login dan cek dashboard overview
- ✅ Review follow-up untuk hari ini (tab Follow-ups)
- ✅ Prioritas lead dengan overdue follow-ups (filter Overdue)
- ✅ Quick scan bottleneck warnings

**Siang (12:00 - 13:00)**
- ✅ Update notes untuk call/meeting yang sudah dilakukan
- ✅ Move leads ke stage berikutnya jika applicable
- ✅ Schedule follow-up untuk lead baru

**Sore (16:00 - 17:00)**
- ✅ Review analytics untuk performance hari ini
- ✅ Prepare follow-ups untuk besok
- ✅ Update priority levels based on new info

#### 2. Weekly Review (Setiap Jumat Sore)
- 📊 Buka Analytics Report
- 📈 Review weekly conversion metrics
- 🎯 Identify bottleneck stages
- 💡 Brainstorm improvement strategies
- 📝 Set goals untuk minggu depan

### B. Lead Qualification Best Practices

#### BANT Framework
Gunakan framework ini saat qualify lead:

**Budget**: Apakah budget jelas dan realistis?
- Tanya: "What's your budget range?"
- Note di custom field budget_range

**Authority**: Apakah orang ini decision maker?
- Tanya: "Are you the decision maker?"
- Add label "Decision Maker" atau "Influencer"

**Need**: Apakah ada kebutuhan nyata?
- Tanya: "What's driving your property search?"
- Catat di notes dengan detail

**Timeline**: Kapan rencana pembelian?
- Tanya: "When are you planning to make a decision?"
- Set follow-up schedule accordingly

#### Priority Matrix
**High Priority (🔴)**:
- Budget confirmed dan realistis
- Decision maker langsung
- Timeline <3 bulan
- Hot source (referral dari client existing)

**Medium Priority (🟡)**:
- Budget perlu confirmation
- Influencer (bukan decision maker)
- Timeline 3-6 bulan

**Low Priority (🟢)**:
- Budget unclear
- Just browsing / early research
- Timeline >6 bulan atau unclear

### C. Follow-up Strategy

#### The 4-1-1 Rule
Untuk lead baru, gunakan:
- **4 jam**: First follow-up (respond fast!)
- **1 hari**: Second follow-up jika no response
- **1 minggu**: Third follow-up kemudian spasi lebih lama

#### Follow-up Cadence by Stage

**New Lead**:
- Day 0: Immediate response
- Day 1: Follow-up call
- Day 3: Email with relevant info
- Day 7: Check-in call

**Qualified**:
- Weekly check-ins
- Share relevant properties/offers
- Build relationship

**Proposal/Negotiation**:
- Frequent updates (every 2-3 days)
- Quick response to questions
- Push gently toward decision

**Stuck Leads** (>30 days di satu stage):
- Re-qualify: Masih relevant?
- Find blockers: Apa yang menghambat?
- Create urgency: Limited offers, price changes
- If unresponsive >3 attempts: Move to Lost

### D. Using Analytics for Improvement

#### Key Metrics to Monitor

**Conversion Rate**:
- Target: >20% overall funnel
- Per stage: >50% to next stage
- If low: Review qualification criteria

**Average Days in Funnel**:
- Target: <30 days total
- If high: Identify longest stages → streamline process

**Bottleneck Stages**:
- Any stage >15 days average is concern
- Action: More frequent follow-ups, better scripts

**Win Rate**:
- Target: >30% of qualified leads
- If low: Improve proposal quality, negotiation skills

#### Monthly Review Process
1. **Export Data**: Download CSV dari analytics
2. **Trend Analysis**: Compare dengan bulan lalu
3. **Identify Patterns**: 
   - Hari/jam best response rates
   - Sources dengan highest conversion
   - Common objections di lost leads
4. **Action Plan**: Set specific improvements untuk bulan depan
5. **Track Progress**: Monitor weekly apakah improvement tercapai

### E. Team Collaboration (Jika Multi-User)

#### Best Practices untuk Tim

**1. Ownership**:
- Assign lead ke specific person
- Use labels: "Handled by [Name]"
- Clear hand-off process

**2. Communication**:
- Always add notes setelah setiap interaction
- Use @mention dalam notes (jika fitur tersedia)
- Daily stand-up untuk sync status

**3. Avoid Duplicate Work**:
- Cek notes sebelum contact lead
- Don't override colleague's follow-ups
- Coordinate melalui internal chat

**4. Shared Templates**:
- Create team script templates
- Standardize communication quality
- Share best performers' scripts

### F. Data Hygiene

#### Keep Data Clean
**Weekly Cleanup**:
- ✅ Merge duplicate leads
- ✅ Update outdated info (phone changes, etc)
- ✅ Archive truly lost leads (moved out of area, bought elsewhere)
- ✅ Remove test/fake entries

**Quality Control**:
- Validate email addresses
- Check phone number formats
- Consistent naming conventions
- Standardize location entries

### G. Mobile Access Tips

Jika mengakses dari mobile:

**Portrait Mode Optimized**:
- List View lebih mobile-friendly
- Swipe untuk quick actions
- Tap-hold untuk more options

**Quick Actions**:
- Star important leads untuk quick access
- Use mobile notifications untuk follow-up reminders
- Voice notes untuk quick updates (jika available)

### H. Keyboard Shortcuts (Power User Tips)

#### Global Shortcuts
- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + N`: Add new lead
- `Ctrl/Cmd + /`: Show shortcuts help
- `Esc`: Close modal/cancel

#### Navigation
- `1-9`: Quick switch stages (Kanban)
- `↑↓`: Navigate lead list
- `Enter`: Open selected lead
- `Tab`: Next field di form

#### Actions
- `Ctrl/Cmd + E`: Edit lead
- `Ctrl/Cmd + S`: Save changes
- `Ctrl/Cmd + D`: Delete lead (dengan confirmation)

### I. Troubleshooting Common Issues

#### "Lead Not Moving"
**Kemungkinan Causes**:
- Browser cache issue → Hard refresh (Ctrl+F5)
- Permission error → Check user role
- Validation gagal → Cek required fields lengkap

**Solution**:
1. Refresh halaman
2. Try edit dan save manual
3. Contact admin jika persist

#### "Follow-up Not Showing"
**Kemungkinan Causes**:
- Wrong date/time format
- Timezone mismatch

**Solution**:
1. Check timezone di profile settings
2. Re-create follow-up dengan date picker (jangan manual type)

#### "Analytics Not Loading"
**Kemungkinan Causes**:
- Too much data
- Slow connection

**Solution**:
1. Apply date filter untuk smaller dataset
2. Clear browser cache
3. Try different browser

#### "Can't Login"
**Kemungkinan Causes**:
- Wrong credentials
- Account locked (too many failed attempts)
- Browser cookies disabled

**Solution**:
1. Use "Forgot Password" untuk reset
2. Wait 30 minutes jika account locked
3. Enable cookies di browser settings
4. Try incognito/private mode

---

## Dukungan & Bantuan

### Kontak Support
Jika mengalami masalah yang tidak tercakup dalam manual ini:

**Email Support**: support@budikaryalead.com
**Response Time**: 1-2 hari kerja

**Urgent Issues**:
- Login tidak bisa: Prioritas tinggi
- Data loss: Kritical, hubungi segera
- Bug yang block workflow: High priority

### Resources Tambahan
- **Video Tutorial**: [Link jika tersedia]
- **FAQ**: [Link ke FAQ page]
- **System Status**: [Link untuk cek service status]

---

## Changelog & Updates

### Version History
- **v1.0.0** (Dec 2025): Initial release
- [Tambahkan versi update selanjutnya]

---

**© 2026 Budi Karya Lead Management System**

**Disclaimer**: Manual ini berdasarkan versi aplikasi per 12 Januari 2026. Fitur dapat berubah dengan update sistem.
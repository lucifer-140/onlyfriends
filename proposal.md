# I. Introduction & Problem Statement

- **Project Title:** OnlyFriends — Enterprise AI Digital Friends Platform  
- **Product Category:** SaaS / LLMOps Platform  
- **Team Members:** mls ketik lor

## Real-World Problem 

Organisasi modern menghasilkan volume dokumen internal yang sangat besar — seperti policy perusahaan, laporan keuangan, handbook HR, kontrak legal, dan SOP. Namun, karyawan sering tidak memiliki cara yang efisien untuk mencari dan mengakses pengetahuan tersebut secara cepat. Beberapa masalah utama yang sering terjadi adalah:

1. **Knowledge Silos & Retrieval Inefficiency:** Karyawan sering menghabiskan waktu berjam-jam setiap hari untuk mencari informasi yang tersebar di berbagai tempat seperti shared drive, email, dan intranet. Banyak dokumen penting tersimpan dalam file PDF yang jarang dicari kembali.

2. **High Cost of Repetitive Expert Queries:** Tim HR, Legal, IT, dan Finance sering menerima pertanyaan yang sama secara berulang dari karyawan (misalnya: kebijakan cuti, aturan password, atau prosedur internal).

3. **Vendor Lock-in & Data Privacy Risk:** Banyak AI assistant modern mengirimkan data ke server cloud eksternal sehingga berisiko bagi perusahaan yang menangani data sensitif.

4. **No Contextual AI Tailored to Company Data:** AI umum tidak memiliki akses ke dokumen internal perusahaan sehingga jawabannya sering generik atau tidak sesuai dengan kebijakan internal organisasi.

---

# II. Market Research & User Demographics

## Target Market

OnlyFriends menargetkan perusahaan menengah hingga besar di Indonesia dengan kebutuhan pengelolaan knowledge internal yang kompleks.

- **Rentang Usia:** Pengambil keputusan 28–55 tahun; pengguna akhir 22–50 tahun  
- **Lokasi Geografis:** Indonesia (fokus utama Jakarta, Surabaya, Bandung)  
- **Pekerjaan:** Manajer HR, analis legal, petugas keuangan, administrator IT, perwakilan sales, agen support, dan manajer produk  
- **Ukuran Perusahaan:** 50–10.000 karyawan  
- **Vertikal Industri:** Teknologi, layanan keuangan, kesehatan, legal, pemerintahan, ritel  
- **Adopsi Teknologi:** Perusahaan aktif berinvestasi pada AI dan transformasi digital  
- **Sensitivitas Data:** Organisasi mematuhi regulasi seperti PDPA dan ISO 27001  
- **Motivasi Utama:** Efisiensi operasional, otomatisasi pencarian knowledge, dan keamanan data internal  

---

## Karakteristik Responden

Survei adopsi AI pada perusahaan menengah di Indonesia menunjukkan:

- **Kelompok usia dominan pembeli AI enterprise:** 35–50 tahun  
- **Pekerjaan pengguna akhir:** generalis HR, analis keuangan, helpdesk IT, dan paralegal  
- **Pendapatan perusahaan tipikal:** Rp160 miliar hingga Rp8 triliun per tahun  

### Tools AI Saat Ini Digunakan

- Google Cloud Vertex AI (platform machine learning enterprise berbasis cloud)  
- Microsoft SharePoint dengan fitur AI untuk manajemen dokumen perusahaan  
- Atlassian Confluence untuk manajemen knowledge dan dokumentasi tim  

Sebagian besar tools tersebut berbasis cloud sehingga menimbulkan kekhawatiran terkait keamanan data perusahaan.

---

## Perilaku Pengguna & Pain Points Terverifikasi

- **73%** pekerja knowledge menghabiskan lebih dari 1 jam per hari mencari dokumen internal  
- **54–63%** pemimpin IT dan HR menyebut privasi data sebagai hambatan utama adopsi AI  
- **70%** organisasi mengalami masalah usability dan fragmentasi sistem knowledge  
- **85%** perusahaan lebih memilih solusi AI on-premise untuk kontrol keamanan dan compliance yang lebih baik

---

# III. The Solution & Product Details

## The Product

**OnlyFriends** adalah platform enterprise AI berbasis **local-first dan privacy-first** yang memungkinkan organisasi membuat **Digital Friends**, yaitu AI agents yang dilatih menggunakan dokumen internal perusahaan.

Setiap Digital Friend berjalan menggunakan **Large Language Model lokal** melalui Ollama dan memiliki **vector knowledge base pribadi** menggunakan ChromaDB. Dengan pendekatan ini, **tidak ada data perusahaan yang keluar dari jaringan internal organisasi**.

Pengguna berinteraksi melalui dashboard web untuk bertanya kepada Digital Friends dan menerima jawaban yang berasal langsung dari dokumen internal perusahaan.

---

## Key Features

1. **Digital Friend Builder**  
   Wizard pembuatan AI agent untuk menentukan persona, role, dan sumber data.

2. **Retrieval-Augmented Generation (RAG) Chat**  
   Jawaban AI dihasilkan berdasarkan dokumen internal perusahaan.

3. **URL Web Scraping Ingestion**  
   Sistem dapat mengambil konten dari website publik sebagai knowledge source.

4. **Asynchronous Background Processing**  
   Proses embedding dokumen dijalankan melalui Celery dan Redis.

5. **User-Specific Dashboards (My Friends)**  
   Setiap pengguna memiliki koleksi Digital Friends sendiri.

6. **Persistent Chat History**  
   Riwayat percakapan disimpan sehingga pengguna dapat melanjutkan sesi sebelumnya.

---

## System Architecture

### Frontend Layer
- Framework: Next.js  
- React  
- Tailwind CSS  
- Shadcn UI

### Backend Layer
- Python FastAPI  
- Celery worker queue  
- Redis message broker  
- SQLAlchemy ORM  
- PostgreSQL database

### AI & Database Layer
- Ollama running Llama models locally  
- ChromaDB vector database  
- LangChain for RAG pipeline

---

# IV. Business Model & Strategy

## Market Analysis (Indonesia First Strategy)

Pendekatan market sizing menggunakan model **TAM / SAM / SOM** dengan fokus awal di Indonesia.

| Market Layer | Description | Estimate |
|---|---|---|
| TAM | Semua perusahaan menengah hingga besar di Indonesia | ~65.000 perusahaan |
| SAM | Perusahaan yang aktif menggunakan teknologi digital | ~15.000 perusahaan |
| SOM | Target realistis dalam 3 tahun | 50–100 perusahaan |

Strategi ekspansi:

1. **Phase 1:** Indonesia (Jakarta, Surabaya, Bandung)  
2. **Phase 2:** Asia Tenggara  
3. **Phase 3:** Global enterprise market

---

## Competitor Analysis

| Competitor | Type | Weakness |
|---|---|---|
| Microsoft Copilot | Direct | Cloud-based dan mahal |
| Notion AI | Direct | Tidak fokus pada dokumen internal |
| Atlassian Confluence | Indirect | Tidak memiliki AI query layer |
| Custom Private LLM | Indirect | Membutuhkan engineering ML yang kompleks |

---

## Value Proposition

- **Zero Data Privacy Risk:** Semua komputasi AI berjalan di server internal perusahaan  
- **Faster Knowledge Retrieval:** Dokumen internal dapat dicari dalam hitungan detik  
- **Department-Specific AI:** Setiap departemen dapat memiliki Digital Friend khusus  
- **No ML Expertise Required:** Sistem dapat digunakan tanpa kemampuan machine learning

---

## Revenue Stream

| Stream | Description |
|---|---|
| SaaS Subscription | Langganan bulanan perusahaan |
| Professional Services | Setup sistem dan onboarding |
| Enterprise License | Deployment khusus on-premise |

---

## Pricing Model

Model harga menggunakan **company-based subscription** sehingga tidak bergantung pada jumlah pengguna.

---

## Pricing Tiers

| Package | Price | Features |
|---|---|---|
| Starter | Rp4.800.000 / bulan | 5 Digital Friends, 10 users |
| Professional | Rp14.500.000 / bulan | 20 Digital Friends, 50 users |
| Enterprise | Mulai Rp40.000.000 / bulan | Unlimited usage |

---

## Cost Structure

Karena deployment dilakukan pada server pelanggan, biaya operasional perusahaan relatif kecil.

| Category | Estimasi Biaya Bulanan |
|---|---|
| Domain & Website | Rp500.000 |
| Customer Support | Rp4.000.000 |
| Marketing | Rp6.000.000 |
| Software Tools | Rp1.000.000 |
| Operasional Administratif | Rp2.000.000 |
| Technical Maintenance | Rp5.000.000 |
| **Total** | **Rp18.500.000** |

---

# V. Financial Projections & Feasibility

## Initial Capital (Modal Awal)

| Category | Estimasi |
|---|---|
| Domain & Website | Rp2.500.000 |
| Legal | Rp10.000.000 |
| Branding | Rp5.000.000 |
| Marketing awal | Rp7.500.000 |
| Tools operasional | Rp2.000.000 |
| Cadangan | Rp2.700.000 |
| **Total** | **Rp29.700.000** |

---

## Revenue Projection Calculation (Year 1)

Asumsi jumlah pelanggan pada tahun pertama:

- 20 pelanggan paket Starter  
- 8 pelanggan paket Professional  
- 2 pelanggan paket Enterprise  

Perhitungan:

Starter  
20 × Rp4.800.000 × 12 = Rp1.152.000.000  

Professional  
8 × Rp14.500.000 × 12 = Rp1.392.000.000  

Enterprise  
2 × Rp40.000.000 × 12 = Rp960.000.000  

**Total ARR ≈ Rp3.5 miliar**

---

## 3-Year Projections

| Year | Paying Companies | ARR |
|---|---|---|
| Year 1 | 30 | Rp3,4 miliar |
| Year 2 | 60 | Rp7–9 miliar |
| Year 3 | 100 | Rp15–20 miliar |

---

## Break-Even Point

Dengan biaya operasional sekitar **Rp18,5 juta per bulan**, BEP tercapai pada sekitar **4 pelanggan Starter**.

---

## Cash Flow Projection

| Period | Cash In | Cash Out | Net |
|---|---|---|---|
| Initial | Rp0 | Rp29,7 juta | -Rp29,7 juta |
| Year 1 | Rp3,4 miliar | Rp222 juta | Rp3,18 miliar |
| Year 2 | Rp7,5 miliar | Rp240 juta | Rp7,26 miliar |
| Year 3 | Rp17 miliar | Rp300 juta | Rp16,7 miliar |

---

# VI. Risk Management & Execution

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Model accuracy issues | Mendukung model swap dan fine-tuning |
| Database scaling issues | Migrasi ke vector database enterprise |
| Competition from big tech | Fokus pada privacy-first AI |
| Slow enterprise sales | Free trial dan pilot deployment |

---

## Team Readiness

| Role | Current | Ideal |
|---|---|---|
| Engineering | 1 developer | 3 engineers |
| Product Design | Developer | Dedicated designer |
| Sales | Founder | Sales team |
| Customer Success | Email support | Dedicated CSM |

---

## Execution Roadmap

| Phase | Timeline | Activities |
|---|---|---|
| Foundation | Month 1 | Architecture & RAG pipeline |
| MVP | Month 2 | Digital Friend builder |
| Beta | Month 4 | Test with pilot companies |
| Launch | Month 6 | Public launch |
| Scale | Month 7-12 | Expansion to Southeast Asia |
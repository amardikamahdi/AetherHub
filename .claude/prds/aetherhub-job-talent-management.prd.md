# AetherHub — Job & Talent Management Platform

## Problem

KOL Specialist mengelola ratusan talent dan puluhan job secara manual melalui WhatsApp dan Google Sheets. Dengan ~464 talent dan 10+ job aktif, proses assign, monitoring, dan update progress memakan waktu berjam-jam dan rawan miss. Talent tidak punya cara mandiri untuk melihat atau mengupdate progress job mereka, sehingga semua beban koordinasi jatuh ke KOL Specialist.

## Evidence

- Keluhan langsung dari client (KOL Specialist)
- Saat ini: 10 job aktif, ~464 talent (margin error ±10%)
- Semua proses manual: WhatsApp + Google Sheets
- Client harus buka chat dan sheet satu per satu untuk verifikasi
- Tidak ada sistem terpusat untuk tracking progress

## Users

- **Superadmin**: Pemilik platform, mengelola seluruh sistem termasuk admin
- **Admin (KOL Specialist)**: Mengelola job, assign talent, dan memantau progress
- **Talent**: Melihat job yang di-assign ke akun sosmed mereka dan mengupdate progress

## Hypothesis

Kami percaya **AetherHub** akan **menyelesaikan masalah management job dan talent** untuk **KOL Specialist**. Kami tahu ini berhasil ketika **management job dan talent dapat di-track progress-nya dan talent dapat melakukan update progress secara mandiri**.

## Success Metrics

| Metric | Target | How measured |
|---|---|---|
| Waktu monitoring job | Kurang dari 5 menit per job (dari manual berjam-jam) | User feedback + analytics |
| Talent update mandiri | >80% talent mengupdate progress sendiri dalam 1 minggu | Database log |
| Pengurangan koordinasi WhatsApp | >70% pengurangan chat koordinasi | User feedback |

## Scope

**MVP** — Minimum untuk menguji hipotesis:
- Management Job (CRUD job, assign talent)
- Management Talent (CRUD talent, akun sosmed)
- Dashboard terpisah: Superadmin, Admin, Talent
- Talent register & login
- Talent bisa melihat job yang di-assign ke akun sosmed mereka
- Admin bisa assign akun sosmed talent ke job
- Progress tracking per talent per job

**Out of scope**
- Integrasi langsung ke platform media sosial (Instagram, TikTok, dll) — tidak ada API integration
- Payment atau sistem pembayaran — tidak termasuk di fase ini
- Analytics berat atau reporting dashboard — bisa ditambah nanti

## Delivery Milestones

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Auth & User Management | Superadmin, Admin, Talent bisa register/login dengan role masing-masing | pending | — |
| 2 | Talent Management | Admin bisa CRUD talent dan talent bisa tambah akun sosmed mereka | pending | — |
| 3 | Job Management | Admin bisa CRUD job dan assign akun sosmed talent ke job | pending | — |
| 4 | Dashboard & Progress Tracking | Admin bisa pantau progress, talent bisa update progress job mereka | pending | — |

## Open Questions

- [ ] Berapa banyak admin yang akan menggunakan sistem ini?
- [ ] Apakah ada hierarki antar admin (misal: senior admin vs junior admin)?
- [ ] Bagaimana flow talent menambahkan akun sosial media? Apakah perlu verifikasi?
- [ ] Apakah ada batasan jumlah akun sosmed per talent?
- [ ] Format progress seperti apa yang diharapkan? (percentage, status enum, foto bukti?)
- [ ] Apakah notifikasi diperlukan? (misal: job baru di-assign ke talent)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Talent tidak tech-savvy, kesulitan pakai portal | Medium | High | UI sesederhana mungkin, onboarding flow jelas |
| Akun sosmed tidak terverifikasi, talent bisa klaim akun orang lain | Medium | Medium | Pertimbangkan verifikasi manual oleh admin |
| Scalability jika talent >1000 | Low | Medium | Gunakan pagination, indexing yang tepat dari awal |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*

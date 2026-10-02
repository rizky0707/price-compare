# BandingHarga — Perbandingan Harga Shopee vs TikTok Shop

Web ringan (1 file HTML vanilla JS, tanpa framework) + Vercel Serverless Functions.
**Pengunjung tidak perlu login** — autentikasi terjadi server-to-server via API resmi.

## Struktur
```
├── index.html        # frontend (tanpa build step, < 6 KB)
├── api/
│   ├── search.js     # endpoint gabungan /api/search?keyword=...
│   ├── shopee.js     # Shopee Affiliate Open API (GraphQL)
│   └── tiktok.js     # TikTok Shop Affiliate Open API
└── vercel.json
```

## Deploy ke Vercel (2 menit)
1. Push folder ini ke GitHub/GitLab.
2. Di [vercel.com](https://vercel.com) → **Add New Project** → import repo → **Deploy**.
   Tidak ada build command, tidak ada setting khusus.

## Mendapatkan kredensial (gratis)
- **Shopee**: daftar [affiliate.shopee.co.id](https://affiliate.shopee.co.id) → menu Open API → dapatkan `App ID` + `App Secret`.
- **TikTok Shop**: daftar di [partner.tiktokshop.com](https://partner.tiktokshop.com) sebagai *Affiliate app developer* → buat app → aktifkan API produk → dapatkan `App Key`, `App Secret`, `Access Token`.

## Set environment variables di Vercel
Project → Settings → Environment Variables:
| Key | Keterangan |
|---|---|
| `SHOPEE_AFFILIATE_APP_ID` | App ID Shopee Affiliate |
| `SHOPEE_AFFILIATE_SECRET` | App Secret Shopee |
| `SHOPEE_AFFILIATE_HOST` | Opsional, default `https://open-api.affiliate.shopee.co.id/graphql` |
| `TTSHOP_APP_KEY` | App Key TikTok Shop |
| `TTSHOP_APP_SECRET` | App Secret TikTok Shop |
| `TTSHOP_ACCESS_TOKEN` | Access token (dari OAuth/Partner Center) |

> **Tanpa kredensial pun web tetap jalan** — masuk *demo mode* dengan data contoh
> agar kamu bisa langsung menguji tampilan.

## Catatan penting
- **Mengapa tidak scraping langsung dari browser?** Shopee/TikTok memblokir CORS dan
  memerlukan cookie/token yang cepat kedaluwarsa; scraping juga melanggar ToS dan
  rawan diblokir IP. API resmi affiliate adalah jalur yang stabil & legal.
- Signature Shopee: `SHA256(appId + timestamp + payload + secret)` dengan
  header `Authorization: SHA256 Credential=...,Timestamp=...,Signature=...` <sup>[1]</sup>
- Endpoint TikTok Shop & skema sign: lihat [Sign your API request](https://partner.tiktokshop.com/docv2/page/sign-your-api-request)
  (sesuaikan `path` di `api/tiktok.js` dengan endpoint yang kamu aktifkan).
- Response di-cache 10 menit di edge Vercel (`s-maxage=600`) agar hemat quota API.

[1]: https://open.shopee.com/developer-guide/20

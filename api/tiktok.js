// api/tiktok.js — Vercel Serverless Function
// TikTok Shop Affiliate Open API (daftar: partner.tiktokshop.com → "Affiliate app developer")
// Signature: HMAC-SHA256(app_secret, app_key + timestamp + path + queryParamsSorted)
// Detail: https://partner.tiktokshop.com/docv2/page/sign-your-api-request

const crypto = require('crypto');

const HOST = 'https://open-api.tiktokglobalshop.com';
const APP_KEY = process.env.TTSHOP_APP_KEY;
const APP_SECRET = process.env.TTSHOP_APP_SECRET;
const ACCESS_TOKEN = process.env.TTSHOP_ACCESS_TOKEN;

function sign(secret, params) {
  // base string = app_key + timestamp + path + sorted "key+value" pairs
  const sorted = Object.keys(params).filter(k => k !== 'sign').sort()
    .map(k => `${k}${params[k]}`).join('');
  return crypto.createHmac('sha256', secret).update(sorted).digest('hex');
}

module.exports = async function searchTikTok(keyword, limit = 10) {
  if (!APP_KEY || !APP_SECRET || !ACCESS_TOKEN) return []; // mode tanpa kredensial

  const path = '/api/products/search'; // sesuaikan endpoint di Partner Center docs
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { app_key: APP_KEY, timestamp, access_token: ACCESS_TOKEN, version: '202309' };

  const res = await fetch(HOST + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-tts-access-token': ACCESS_TOKEN },
    body: JSON.stringify({ ...params, sign: sign(APP_SECRET, { ...params }), keyword, limit }),
  });

  if (!res.ok) throw new Error('TikTok Shop API error: ' + res.status);
  const json = await res.json();
  if (json.code !== 0) throw new Error('TikTok Shop: ' + (json.message || json.code));

  const list = json?.data?.products || [];
  return list.map(p => ({
    marketplace: 'tiktok',
    name: p.name || p.title,
    price: Number(p.price?.amount || p.min_price || 0) / (p.price?.currency === 'IDR' ? 1 : 100),
    originalPrice: Number(p.original_price || 0),
    image: (p.images || [])[0] || '',
    rating: p.rating,
    sold: p.sales || p.sold_count,
    shopName: p.seller_name,
    link: p.product_url || p.share_link || '',
  }));
};

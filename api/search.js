// api/search.js — endpoint gabungan yang dipanggil frontend
// Mencegah masalah CORS karena request dilakukan server-side di Vercel

const searchShopee = require('./shopee');
const searchTikTok = require('./tiktok');

module.exports = async (req, res) => {
  const keyword = (req.query.keyword || '').trim();
  if (!keyword) return res.status(400).json({ error: 'Parameter keyword wajib diisi' });

  const missingCredentials = [];
  if (!process.env.SHOPEE_AFFILIATE_APP_ID || !process.env.SHOPEE_AFFILIATE_SECRET) {
    missingCredentials.push('Shopee');
  }
  if (!process.env.TTSHOP_APP_KEY || !process.env.TTSHOP_APP_SECRET || !process.env.TTSHOP_ACCESS_TOKEN) {
    missingCredentials.push('TikTok Shop');
  }

  const [shopee, tiktok] = await Promise.allSettled([
    searchShopee(keyword),
    searchTikTok(keyword),
  ]);

  const pick = r => (r.status === 'fulfilled' ? r.value : []);
  const err = r => (r.status === 'rejected' ? r.reason.message : null);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
  res.json({
    shopee: pick(shopee),
    tiktok: pick(tiktok),
    warnings: [
      ...[err(shopee), err(tiktok)].filter(Boolean),
      ...(missingCredentials.length
        ? [`Kredensial affiliate belum lengkap: ${missingCredentials.join(', ')}`]
        : []),
    ],
  });
};

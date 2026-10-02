// api/search.js — endpoint gabungan yang dipanggil frontend
// Mencegah masalah CORS karena request dilakukan server-side di Vercel

const searchShopee = require('./shopee');
const searchTikTok = require('./tiktok');

// Data contoh (demo mode) — hanya dipakai jika kredensial belum diisi
const demo = kw => ([
  { marketplace:'demo', name:`${kw} - Varian Demo A`, price: 49900, originalPrice: 89900,
    image:'', rating:4.8, sold:'1,2rb', shopName:'TokoContoh', link:'#' },
  { marketplace:'demo', name:`${kw} - Varian Demo B`, price: 64900, originalPrice: 99900,
    image:'', rating:4.6, sold:'850', shopName:'TokoDemo', link:'#' },
]);

module.exports = async (req, res) => {
  const keyword = (req.query.keyword || '').trim();
  if (!keyword) return res.status(400).json({ error: 'Parameter keyword wajib diisi' });

  const useDemo = !process.env.SHOPEE_AFFILIATE_APP_ID && !process.env.TTSHOP_APP_KEY;

  const [shopee, tiktok] = await Promise.allSettled([
    searchShopee(keyword),
    searchTikTok(keyword),
  ]);

  const pick = r => (r.status === 'fulfilled' ? r.value : []);
  const err = r => (r.status === 'rejected' ? r.reason.message : null);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
  res.json({
    demo: useDemo,
    shopee: pick(shopee).length ? pick(shopee) : (useDemo ? demo(keyword) : []),
    tiktok: pick(tiktok).length ? pick(tiktok) : (useDemo ? demo(keyword) : []),
    warnings: [err(shopee), err(tiktok)].filter(Boolean),
  });
};

// api/shopee.js — Vercel Serverless Function
// Shopee Affiliate Open API (GraphQL) — host per negara:
//   Indonesia: https://open-api.affiliate.shopee.co.id/graphql
// Signature: SHA256(appId + timestamp + payload + secret)
// Header:     Authorization: SHA256 Credential={appId}, Timestamp={ts}, Signature={sig}

const crypto = require('crypto');

const HOST = process.env.SHOPEE_AFFILIATE_HOST || 'https://open-api.affiliate.shopee.co.id/graphql';
const APP_ID = process.env.SHOPEE_AFFILIATE_APP_ID;
const SECRET = process.env.SHOPEE_AFFILIATE_SECRET;

module.exports = async function searchShopee(keyword, limit = 10) {
  if (!APP_ID || !SECRET) return []; // mode tanpa kredensial

  const query = `{
    productOfferV2(keyword: "${keyword.replace(/"/g, '')}", sortType: 2, page: 1, limit: ${limit}) {
      nodes { itemName price sales priceDiscount productLink imageUrl shopName ratingStar }
    }
  }`;
  const payload = JSON.stringify({ query });
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = crypto
    .createHash('sha256')
    .update(APP_ID + timestamp + payload + SECRET)
    .digest('hex');

  const res = await fetch(HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`,
    },
    body: payload,
  });

  if (!res.ok) throw new Error('Shopee API error: ' + res.status);
  const json = await res.json();
  if (json.errors) throw new Error('Shopee GraphQL: ' + JSON.stringify(json.errors));

  const nodes = json?.data?.productOfferV2?.nodes || [];
  return nodes.map(n => ({
    marketplace: 'shopee',
    name: n.itemName,
    price: Number(n.priceDiscount || n.price),
    originalPrice: Number(n.price),
    image: n.imageUrl,
    rating: n.ratingStar,
    sold: n.sales,
    shopName: n.shopName,
    link: n.productLink,
  }));
};

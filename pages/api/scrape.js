// pages/api/scrape.js
const puppeteer = require("puppeteer");

module.exports = async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing ?url=" });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const products = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[data-pf-type="ProductBox"]'));
    return items.map(item => {
      const titleEl = item.querySelector('[data-pf-type="ProductTitle"]');
      const buttonEl = item.querySelector('button[name="add"]');
      const title = titleEl?.innerText.trim();
      const price = buttonEl?.innerText.match(/\$\d+(\.\d+)?/)?.[0];
      const link = titleEl?.getAttribute("data-href");
      return { title, price, url: link && `https://drink.haus${link}` };
    }).filter(p => p.title && p.price && p.url);
  });

  await browser.close();
  return res.status(200).json({ products });
};

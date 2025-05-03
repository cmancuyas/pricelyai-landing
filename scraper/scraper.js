// scraper.js with Supabase integration
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TARGET_URL = process.argv[2] || "https://drink.haus/collections/all";

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function scrapeShopifyProducts(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await autoScroll(page);
  await new Promise(res => setTimeout(res, 2000));

  await page.screenshot({ path: "screenshot.png", fullPage: true });
  console.log("📸 Screenshot saved as screenshot.png");

  const content = await page.content();
  fs.writeFileSync("debug.html", content);
  console.log("🔍 Saved HTML to debug.html");

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

  for (const product of products) {
    const { error } = await supabase.from("products").insert({
      title: product.title,
      price: product.price,
      url: product.url,
      scraped_at: new Date().toISOString()
    });
    
    if (error) {
      console.error("❌ Supabase insert error:", error.message);
    }    
  }

  fs.writeFileSync(
    path.join(__dirname, "scraped-products.json"),
    JSON.stringify(products, null, 2)
  );
  console.log("💾 Saved results to scraped-products.json");

  await browser.close();
  console.log("Scraped Products:", products);
  return products;
}

scrapeShopifyProducts(TARGET_URL);

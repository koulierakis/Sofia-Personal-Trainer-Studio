// Optional real-browser acceptance: npm install --no-save playwright, then build and run.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
let release = JSON.parse(await readFile('dist/version.json', 'utf8'));
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webmanifest':'application/manifest+json', '.jpg':'image/jpeg' };
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (path === '/version.json') { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(release)); return; }
    const file = path === '/' ? 'index.html' : path === '/mobile' || path.startsWith('/mobile/') ? 'mobile.html' : path.slice(1);
    const target = resolve('dist', file);
    if (!target.startsWith(resolve('dist') + '/')) { response.writeHead(403).end(); return; }
    response.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(await readFile(target));
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
try {
  const context = await browser.newContext({ viewport: { width:1440, height:1000 } });
  const page = await context.newPage();
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.locator('[data-mode="functional"]').click();
  await page.locator('.athlete-reference').first().waitFor();
  const verifyBounds = async () => {
    const result = await page.locator('.athlete-reference').evaluateAll(elements => elements.map(element => {
      const card = element.closest('.card').getBoundingClientRect();
      const box = element.getBoundingClientRect();
      const text = element.querySelector('.athlete-reference-copy');
      const title = getComputedStyle(element.querySelector('.athlete-reference-title')).color;
      return { inside:box.right <= card.right && box.left >= card.left, fits:text.scrollWidth <= text.clientWidth, title };
    }));
    assert.ok(result.length > 0);
    assert.ok(result.every(item => item.inside && item.fits), JSON.stringify(result));
    assert.ok(result.every(item => item.title === 'rgb(228, 228, 231)'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.locator('#searchPanel').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(31, 31, 31)');
  };
  await verifyBounds();
  await page.screenshot({ path:'/tmp/mpempa-desktop.png', fullPage:false });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height:844 });
    await verifyBounds();
  }
  await page.screenshot({ path:'/tmp/mpempa-mobile.png', fullPage:false });
  await page.evaluate(() => localStorage.setItem('mpempa_acceptance_sentinel', JSON.stringify({ exercise:'preserve', approved:true })));
  await page.getByRole('button', { name:'↻ Ανανέωση εφαρμογής', exact:true }).click();
  await page.locator('[data-mode="functional"]').waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('mpempa_acceptance_sentinel')), '{"exercise":"preserve","approved":true}');
  await page.goto(base + '/mobile/');
  assert.match(await page.title(), /Mpempa mou Mobile/);
  assert.equal(await page.locator('link[rel="manifest"]').getAttribute('href'), '/manifest-mobile.webmanifest');
  await page.getByRole('button', { name:'Εγκατάσταση στο τηλέφωνο', exact:true }).click();
  await page.getByRole('status').filter({ hasText:'iPhone/iPad' }).waitFor();
  release = { id:'next-release' };
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.getByRole('button', { name:'Εφαρμογή ενημέρωσης', exact:true }).waitFor();
  await page.getByRole('button', { name:'Αργότερα', exact:true }).click();
  assert.equal(await page.getByRole('button', { name:'Εφαρμογή ενημέρωσης', exact:true }).count(), 0);
  await page.evaluate(() => Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(Error('Service worker did not activate')), 8000))]));
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.locator('[data-mode="functional"]').waitFor();
  await page.locator('[data-mode="functional"]').click();
  await page.locator('.athlete-reference').first().waitFor();
  await context.setOffline(false);
  assert.deepEqual(errors, []);
  console.log('PASS: desktop/mobile/320px card bounds, neutral colors, no horizontal overflow, refresh preserves storage, mobile manifest/install guidance, release notification/dismissal, offline mobile relaunch, no runtime errors.');
  await context.close();
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }

require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    /* headless: false */
  });
  const page = await browser.newPage();
  try {
    await page.goto('https://adeilson.com.br/wp-admin/');
    // await page.screenshot({ path: 'example.png' });

    await page.type('#user_login', process.env.USER_WP);
    await page.type('#user_pass', process.env.PASS_WP);
    await page.click('[type="submit"]');

    await page.waitForNavigation();

    await page.goto('https://adeilson.com.br/wp-admin/update-core.php');
    await page.click('#plugins-select-all');
    await page.click('#upgrade-plugins-2');
  } catch (error) {
    console.log('error', error);
  } finally {
    await browser.close();
  }
})();

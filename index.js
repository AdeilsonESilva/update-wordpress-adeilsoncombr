require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting update');
  console.log('TEST_NAME: ', process.env.TEST_NAME);
  console.log('FIRST_NAME: ', process.env.FIRST_NAME);

  const browser = await puppeteer.launch({
    // headless: false,
  });
  const page = await browser.newPage();
  try {
    await page.goto('https://www.adeilson.com.br/wp-admin/');
    // await page.screenshot({ path: 'example.png' });
    await page.waitForSelector('[type="submit"]');

    await page.type('#user_login', process.env.USER_WP);
    await page.type('#user_pass', process.env.PASS_WP);
    await page.click('[type="submit"]');

    await page.waitForNavigation();

    await page.goto('https://adeilson.com.br/wp-admin/update-core.php');
    try {
      await page.click('#plugins-select-all');
      await page.click('#upgrade-plugins-2');
      await page.waitForNavigation({ timeout: 0 });
      console.log('Updated plugins');
    } catch (error) {
      console.log('No plugin to update');
    }

    try {
      await page.click('#themes-select-all');
      await page.click('#upgrade-themes-2');
      await page.waitForNavigation({ timeout: 0 });
      console.log('Updated themes');
    } catch (error) {
      console.log('No themes to update');
    }

    try {
      const locale = await page.$(
        '#wpbody-content > div.wrap > ul > li:nth-child(1) > form > p > input[type=hidden]:nth-child(2)'
      );
      const textLocale = await page.evaluate(element => element.value, locale);

      const upgradeButton = await page.$('#upgrade');
      const textUpgradeButton = await page.evaluate(
        element => element.value,
        upgradeButton
      );

      if (textLocale === 'pt_BR' && textUpgradeButton !== 'Reinstalar agora') {
        await page.click('#upgrade');
        await page.waitForNavigation({ timeout: 0 });
        console.log('Updated version');
      } else {
        throw Error('upgrade not found');
      }
    } catch (error) {
      console.log('No version to upgrade');
    }
  } catch (error) {
    console.log('error', error);
  } finally {
    await browser.close();
    console.log('Done');
  }
})();

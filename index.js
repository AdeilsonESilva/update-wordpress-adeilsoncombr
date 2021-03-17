require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const debug = (process.env.DEBUG || 'false') === 'true';
  console.log('Starting update');

  const browser = await puppeteer.launch({
    headless: !debug,
  });
  const page = await browser.newPage();
  try {
    await page.goto('https://www.adeilson.com.br/wp-admin/');
    // await page.screenshot({ path: 'example.png' });
    await page.waitForSelector('[type="submit"]');

    await page.type('#user_login', process.env.USER_WP);
    await page.type('#user_pass', process.env.PASS_WP);
    await page.click('[type="submit"]');

    await page.waitForNavigation({ timeout: 60 * 1000 });

    await page.goto('https://adeilson.com.br/wp-admin/update-core.php');

    try {
      console.log('Remove monterinsights popup');
      const divToRemove = '#monterinsights-admin-menu-tooltip';
      await page.evaluate(sel => {
        const elements = document.querySelectorAll(sel);
        for (let i = 0; i < elements.length; i++) {
          elements[i].parentNode.removeChild(elements[i]);
        }
      }, divToRemove);
      console.log('Removed monterinsights popup');
    } catch (_) {
      console.log('No monterinsights popup to remove');
    }

    try {
      console.log('Start update plugins');
      await page.click('#plugins-select-all');
      await page.click('#upgrade-plugins-2');
      await page.waitForNavigation({ timeout: 0 });
      console.log('Updated plugins');
    } catch (_) {
      console.log('No plugin to update');
    }

    try {
      console.log('Start update themes');
      await page.click('#themes-select-all');
      await page.click('#upgrade-themes-2');
      await page.waitForNavigation({ timeout: 0 });
      console.log('Updated themes');
    } catch (_) {
      console.log('No themes to update');
    }

    try {
      console.log('Start upgrade');
      const locale = await page.$(
        '#wpbody-content > div.wrap > ul > li:nth-child(1) > form > p > input[type=hidden]:nth-child(2)'
      );
      const textLocale = await page.evaluate(element => element.value, locale);

      const upgradeButton = await page.$('#upgrade');
      const textUpgradeButton = await page.evaluate(
        element => element.value,
        upgradeButton
      );

      if (
        textLocale === 'pt_BR' &&
        !String(textUpgradeButton).includes('Reinstalar')
      ) {
        await page.click('#upgrade');
        await page.waitForNavigation({ timeout: 0 });
        console.log('Updated version');
      } else {
        throw Error('upgrade not found');
      }
    } catch (_) {
      console.log('No version to upgrade');
    }
  } catch (error) {
    throw error;
  } finally {
    if (!debug) {
      await browser.close();
    }
    console.log('Done');
  }
})();

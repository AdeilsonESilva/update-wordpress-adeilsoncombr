require('dotenv').config();
const core = require('@actions/core');
const puppeteer = require('puppeteer');

(async () => {
  const debug = (process.env.DEBUG || 'false') === 'true';
  const browser = await puppeteer.launch({
    headless: debug ? false : 'new',
  });
  const page = await browser.newPage();

  async function main() {
    console.log('Starting update');
    try {
      await login();

      await gotoUpdatePage();
      await removeMonterinsightsPopup();
      await updatePlugins();

      await gotoUpdatePage();
      await removeMonterinsightsPopup();
      await updateThemes();

      await gotoUpdatePage();
      await removeMonterinsightsPopup();
      await updateTranslate();

      await gotoUpdatePage();
      await removeMonterinsightsPopup();
      await upgradeWordPress();
    } catch (error) {
      core.setFailed(error);
      throw error;
    } finally {
      if (!debug) {
        await browser.close();
      }
      console.log('Done');
    }
  }

  async function upgradeWordPress() {
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
        throw Error('button upgrade not found');
      }
    } catch {
      console.log('No version to upgrade');
    }
  }

  async function updateTranslate() {
    try {
      console.log('Start update translate');
      await page.click(
        '#wpbody-content > div.wrap > form > p:nth-child(4) > input'
      );
      await page.waitForNavigation({ timeout: 0 });
      console.log('Updated translate');
    } catch {
      console.log('No translate to update');
    }
  }

  async function updateThemes() {
    try {
      console.log('Start update themes');
      await page.click('#themes-select-all');
      await page.click('#upgrade-themes-2');
      await page.waitForNavigation({ timeout: 0 });
      console.log('Updated themes');
    } catch {
      console.log('No themes to update');
    }
  }

  async function updatePlugins() {
    try {
      console.log('Start update plugins');
      await page.click('#plugins-select-all');
      await page.click('#upgrade-plugins-2');
      await page.waitForNavigation({ timeout: 0 });
      console.log('Updated plugins');
    } catch {
      console.log('No plugin to update');
    }
  }

  async function removeMonterinsightsPopup() {
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
    } catch {
      console.log('No monterinsights popup to remove');
    }
  }

  async function gotoUpdatePage() {
    await page.goto('https://adeilson.com.br/wp-admin/update-core.php');
  }

  async function login() {
    await page.goto('https://www.adeilson.com.br/wp-admin/');
    // await page.screenshot({ path: 'example.png' });
    await page.waitForSelector('[type="submit"]');

    await page.type('#user_login', process.env.USER_WP);
    await page.type('#user_pass', process.env.PASS_WP);
    await page.click('[type="submit"]');

    await page.waitForNavigation({ timeout: 5 * 60 * 1000 });
  }

  await main();
})();

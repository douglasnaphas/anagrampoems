#!/usr/bin/env node

const puppeteer = require("puppeteer");
const { program } = require("commander");

program
  .option("-s, --site <URL>", "Site to run against")
  .option("-L, --slow", "Run headfully in slow mode")
  .parse(process.argv);
const slowDown = 90;
const timeout = 10000 + (program.opts().slow ? slowDown + 2000 : 0); // ms
const site = program.opts().site;
const failTest = async (err, msg, browsers) => {
  console.log("test failed: " + msg);
  console.log(err);
  if (browsers && browsers.length) {
    for (let b = 0; b < browsers.length; b++) {
      if (browsers[b].close) {
        await browsers[b].close();
      }
    }
  }
  process.exit(1);
};
const browserOptions = {
  headless: program.opts().slow ? false : true,
  args: ["--no-sandbox"],
};
browserOptions.slowMo = slowDown;
const waitOptions = { timeout /*, visible: true */ };

(async () => {
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  // Actual test

  const browsers = []; // so we can close them all when failing a test
  const browser = await puppeteer.launch(browserOptions);
  browsers.push(browser);
  const page = await browser.newPage();
  await page.goto(site);

  // Enter "kate" and bust grams
  const thingToGramSelector = "#thing-to-gram";
  await page.waitForSelector(thingToGramSelector);
  await page.click(thingToGramSelector);
  const thingToGram = "kate";
  await page.type(thingToGramSelector, thingToGram);
  const bustGramsButtonSelector = "#bust-grams";
  await page.click(bustGramsButtonSelector);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('#bust-grams')
  ]);

  // Get the current URL
  const currentURL = page.url();

  // Assert that the query string for the URL is "key=kate"
  const url = new URL(currentURL);
  const queryString = url.search;
  if (queryString === '?key=kate') {
    console.log('Assertion passed: Query string is "key=kate"');
  } else {
    console.error(`Assertion failed: Query string is "${queryString}"`);
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  // Clean up
  for (let b = 0; b < browsers.length; b++) {
    if (browsers[b].close) {
      await browsers[b].close();
    }
  }
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
})();

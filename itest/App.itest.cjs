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
const browsers = []; // so we can close them all when failing a test
const failTest = async (err, msg) => {
  console.error("test failed: " + msg);
  console.error(err);
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

  const browser = await puppeteer.launch(browserOptions);
  browsers.push(browser);
  const page = await browser.newPage();
  await page.goto(site);

  // Log in
  const loginButtonSelector = "#login";
  await page.waitForSelector(loginButtonSelector);
  // from Cognito hosted UI
  const usernameSelector = `input#signInFormUsername[type='text']`;
  await page.waitForSelector(usernameSelector);

  // Enter "kate" and bust grams
  const thingToGramSelector = "#thing-to-gram";
  await page.waitForSelector(thingToGramSelector);
  await page.click(thingToGramSelector);
  const thingToGram = "kate";
  await page.type(thingToGramSelector, thingToGram);
  const bustGramsButtonSelector = "#bust-grams";
  try {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click(bustGramsButtonSelector),
    ]);
  } catch (err) {
    await failTest(err, "failed to click Bust Grams and navigate");
  }

  // Get the current URL
  const currentURL = page.url();

  // Assert that the query string for the URL is "key=kate"
  const url = new URL(currentURL);
  const queryString = url.search;
  if (queryString === "?key=kate") {
    console.log('Assertion passed: Query string is "key=kate"');
  } else {
    await failTest(
      "failure after clicking Bust Grams",
      `Assertion failed: Query string is "${queryString}"`
    );
  }

  // The page should show kate's grams
  // Assert that there is an element with the exact text "take"
  const elementWithExactTextTake = await page.evaluate(() => {
    const elements = document.querySelectorAll("*");
    for (const element of elements) {
      if (element.textContent.trim() === "take") {
        return true;
      }
    }
    return false;
  });

  if (!elementWithExactTextTake) {
    await failTest(
      "could not find gram text",
      'Assertion failed: No element with the exact text "take" on the page'
    );
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

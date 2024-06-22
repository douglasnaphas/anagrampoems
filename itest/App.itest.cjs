#!/usr/bin/env node

const puppeteer = require("puppeteer");
const commander = require("commander");

commander
  .version("1.0.0")
  .option("-s, --site <URL>", "Site to run against")
  .option("-L, --slow", "Run headfully in slow mode")
  .parse(process.argv);
const slowDown = 90;
const timeout = 10000 + (commander.opts().slow ? slowDown + 2000 : 0); // ms
const site = commander.opts().site;
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

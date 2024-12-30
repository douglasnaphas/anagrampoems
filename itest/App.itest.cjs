#!/usr/bin/env node

const puppeteer = require("puppeteer");
const { program } = require("commander");
const stackname = require("@cdk-turnkey/stackname");
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require("crypto");

program
  .option("-s, --site <URL>", "Site to run against")
  .option("-L, --slow", "Run headfully in slow mode")
  .option("-I, --idp-url <URL>", "The URL expected after clicking 'Log in'")
  .option("--user-pool-id <ID>", "The User Pool Id for the web app")
  .parse(process.argv);
const slowDown = 90;
const timeout = 10000 + (program.opts().slow ? slowDown + 2000 : 0); // ms
const site = program.opts().site;
const idpUrl = program.opts().idpUrl;
const userPoolId = program.opts().userPoolId;
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
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  // Setup

  // Create a user who can log in
  const randString = (options) => {
    const { numLetters } = options;
    const alphabet = (
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "abcdefghijklmnopqrstuvwxyz" +
      "0123456789"
    ).split("");
    let str = "";
    for (let i = 0; i < numLetters; i++) {
      str =
        str +
        alphabet[
          parseInt(crypto.randomBytes(3).toString("hex"), 16) % alphabet.length
        ];
    }
    return str;
  };
  const cognitoIdentityProviderClient = new CognitoIdentityProviderClient();
  const adminCreateUserInput = {
    // AdminCreateUserRequest
    UserPoolId: userPoolId, // required
    Username: randString({ numLetters: 8 }), // required
    MessageAction: "SUPPRESS",
    TemporaryPassword: randString({ numLetters: 8 }),
    UserAttributes: [
      // AttributeListType
      {
        // AttributeType
        Name: "email",
        Value: `${randString({ numLetters: 8 })}@example.com`,
      },
    ],
    ValidationData: [
      {
        Name: "email_verified", // required
        Value: "True",
      },
    ],
  };
  const adminCreateUserResponse = await cognitoIdentityProviderClient.send(
    new AdminCreateUserCommand(adminCreateUserInput)
  );
  if (!adminCreateUserResponse || !adminCreateUserResponse.User) {
    await failTest(
      adminCreateUserResponse,
      "Failed to create a user in AWS SDK v3 setup"
    );
  }
  try {
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    // Actual test

    const browser = await puppeteer.launch(browserOptions);
    browsers.push(browser);
    const page = await browser.newPage();
    await page.goto(site);

    // The Create Poem button should be disabled without login
    const createPoemButtonSelector = "#create-poem-button";
    const isCreatePoemButtonDisabled = await page.evaluate((selector) => {
      const button = document.querySelector(selector);
      return button.disabled;
    }, createPoemButtonSelector);
    if (!isCreatePoemButtonDisabled) {
      await failTest(
        "Home page test error",
        "Expected Create Poem button to be disabled"
      );
    }

    // There should be an explanation that login is required
    const requiresLoginTextSelector = "#requires-login-text"; // Adjust the selector as needed
    await page.waitForSelector(requiresLoginTextSelector);
    const requiresLoginText = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element.textContent;
    }, requiresLoginTextSelector);
    if (requiresLoginText != "Requires login") {
      await failTest(
        "Home page test error",
        "Expected 'Requires login' text not found"
      );
    }

    // Check for Login button
    const buttonsSelector = "button";
    const loginButtonText = await page.evaluate((selector) => {
      const buttons = Array.from(document.querySelectorAll(selector));
      const loginButton = buttons.find(
        (button) => button.textContent.trim() === "Login"
      );
      return loginButton ? loginButton.textContent : null;
    }, buttonsSelector);

    if (loginButtonText !== "Login") {
      await failTest(
        "Home page test error",
        "Expected 'Login' button not found"
      );
    }

    // Click the Login button
    const loginButtonSelector = "#login-button";
    await page.waitForSelector(loginButtonSelector);
    await Promise.all([
      page.click(loginButtonSelector),
      page.waitForNavigation(),
    ]);
    if (page.url() !== idpUrl) {
      failTest(
        new Error("wrong IDP URL"),
        `expected IDP URL ${idpUrl}, got ${page.url()}`,
        browsers
      );
    }
    // Enter username
    const usernameSelector = `input#signInFormUsername[type='text']`;
    await page.waitForSelector(usernameSelector);
    await page.type(usernameSelector, adminCreateUserInput.Username);
    // Enter temp password
    const passwordSelector = `input#signInFormPassword[type='password']`;
    await page.type(passwordSelector, adminCreateUserInput.TemporaryPassword);
    const submitButtonSelector = `input[name='signInSubmitButton'][type='Submit']`;
    await page.click(submitButtonSelector);
    // Change password
    const password = randString({ numLetters: 8 });
    const newPasswordSelector = `input#new_password[type='password']`;
    await page.waitForSelector(newPasswordSelector);
    await page.type(newPasswordSelector, password);
    const confirmPasswordSelector = `input#confirm_password[type='password']`;
    await page.type(confirmPasswordSelector, password);
    const resetPassWordButtonSelector = `button[name="reset_password"][type='submit']`;
    await Promise.all([
      page.click(resetPassWordButtonSelector),
      page.waitForNavigation(),
    ]);

    // The username should be displayed
    const usernameDisplaySelector = "#username-display";
    await page.waitForSelector(usernameDisplaySelector);
    const usernameDisplay = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element.textContent;
    }, usernameDisplaySelector);
    if (usernameDisplay != adminCreateUserInput.Username) {
      await failTest("Home page test error", "Expected username not found");
    }

    // Create a poem
    const inputValue = "Douglas Naphas";
    const thingToGramSelector = "#thing-to-gram";
    await page.type(thingToGramSelector, inputValue);
    await Promise.all([
      page.click(createPoemButtonSelector),
      page.waitForNavigation(),
    ]);
    // Expect the search param poem to be in the URL and have a value of
    // "Douglas Naphas", but URL encoded
    const url = page.url();
    const urlParams = new URLSearchParams(new URL(url).search);
    const poem = urlParams.get("poem");
    if (!poem || poem !== inputValue) {
      await failTest(
        "Home page test error",
        `Expected poem in URL not found or incorrect, expected ${inputValue}, got ${poem}` +
          `, encoded inputValue is ${encodeURIComponent(inputValue)}`
      );
    }
    // Expect the text "Douglas Naphas" to be displayed under Your Poems,
    // in a ul with id "poems-list"
    const poemsListSelector = "#poems-list";
    await page.waitForSelector(poemsListSelector);
    const poemsListText = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element.textContent;
    }, poemsListSelector);
    if (!poemsListText.includes(inputValue)) {
      await failTest("Home page test error", "Expected poem not found in list");
    }

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    // Poem
    
    // Expect the lines heading and dictionary heading
    const linesHeadingSelector = "#lines-heading";
    await page.waitForSelector(linesHeadingSelector);
    const linesHeadingText = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element.textContent;
    }
    , linesHeadingSelector);
    if (linesHeadingText !== "Lines") {
      await failTest("Poem test error", "Expected 'Lines' heading not found");
    }
    const dictionaryHeadingSelector = "#dictionary-heading";
    await page.waitForSelector(dictionaryHeadingSelector);
    const dictionaryHeadingText = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element.textContent;
    }
    , dictionaryHeadingSelector);
    if (dictionaryHeadingText !== "Dictionary") {
      await failTest("Poem test error", "Expected 'Dictionary' heading not found");
    }
    

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    // Log out

    // There should be a log out link
    const logoutLinkSelector = "a#logout-link";
    await page.waitForSelector(logoutLinkSelector);
    const logoutLinkText = await page.evaluate((selector) => {
      const link = document.querySelector(selector);
      return link.textContent;
    }, logoutLinkSelector);
    if (logoutLinkText !== "Log out") {
      await failTest(
        "Home page test error",
        "Expected 'Log out' link not found"
      );
    }

    // Click the log out link
    await Promise.all([
      page.click(logoutLinkSelector),
      page.waitForNavigation(),
    ]);

    // Verify that the username is not displayed on the page
    const isUsernameDisplayVisible = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element ? element.offsetParent !== null : false;
    }, usernameDisplaySelector);
    if (isUsernameDisplayVisible) {
      await failTest(
        "Home page test error",
        "Username should not be displayed after logging out"
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
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    // Clean up test user
    const adminDeleteUserInput = {
      UserPoolId: userPoolId,
      Username: adminCreateUserInput.Username,
    };
    await cognitoIdentityProviderClient.send(
      new AdminDeleteUserCommand(adminDeleteUserInput)
    );
  }
})();

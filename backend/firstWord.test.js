const request = require("supertest");
const app = require("./express-app");

describe("Test the root path", () => {
  test("It should response the GET method", async () => {
    const response = await request(app).get("/backend/");
    expect(response.statusCode).toBe(200);
  });
});
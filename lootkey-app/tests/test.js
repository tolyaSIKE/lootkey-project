import { Builder, By } from "selenium-webdriver";

async function runTests() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("https://tolyasike.github.io/lootkey-app/");

    const title = await driver.findElement(By.xpath("//h1")).getText();

    if (title.includes("Elden Ring")) {
      console.log("✅ Text success test passed!");
    } else {
      console.log("❌ Text success test failed!");
    }

    const cards = await driver.findElements(By.css(".bg-gray-900"));

    if (cards.length === 4) {
    console.log("✅ Game count test passed!");
    } else {
    console.log("❌ Game count test failed!");
    }

    try {
      await driver.findElement(By.id("abakumov-button"));
      console.log("❌ Fail test shouldn't have been passed :(");
    } catch {
      console.log("✅ Fail test passed!");
    }

  } catch (err) {
    console.log("❌ ERROR:", err);
  } finally {
    await driver.quit();
  }
}

runTests();
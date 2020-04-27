var fs = require("fs");
const puppeteer = require("puppeteer");

const urls = [
  "https://indianathletics.in/athlete-details/?id=853",
  "https://indianathletics.in/athlete-details/?id=854",
  "https://indianathletics.in/athlete-details/?id=857",
];

async function fetchAthleteData(browser, url) {
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitFor(2000);
  const details = await page.evaluate(({ url }) => {
    let details = {
      url,
    };

    details["pic"] = document
      .querySelector(".profile-back img")
      .getAttribute("src");
    details["name"] = document.querySelector(".profile-detail h4").textContent;

    const columns = document.querySelectorAll(".user-pad");
    for (const column of columns) {
      if (
        column.classList.contains("col-md-3") ||
        column.classList.contains("col-md-4") ||
        column.classList.contains("col-md-2")
      ) {
        const title = column.querySelector("h6").textContent;
        const data = column.querySelector("p").textContent;
        details[title] = data;
      }
    }
    return details;
  }, url);
  await page.close();

  const file = fs.readFileSync("data.json", "utf8");
  const obj = JSON.parse(file);
  obj.data.push({
    name: details["name"],
    pic: details["pic"],
    gender: details["GENDER"],
    dob: details["DATE OF BIRTH"],
    age: details["AGE"],
    birthplace: details["BIRTHPLACE"],
    teamState: details["TEAM/STATE"],
    url: url,
  });
  const json = JSON.stringify(obj);
  fs.writeFileSync("data.json", json, "utf8");

  return details;
}

async function fetchData() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // headless: false,
  });

  for (let i = 0; i < urls.length; i++) {
    console.log(`Fetching url:${i + 1}/${urls.length}`, urls[i]);
    try {
      await fetchAthleteData(browser, urls[i]);
    } catch (e) {
      console.log(e);
    }
  }

  browser.close();
}

fetchData();

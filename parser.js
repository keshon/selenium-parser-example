const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

linksList = [
    {
        name: "Коллекция картин",
        url: "https://ship2101.wixsite.com/belousow",
    },
    {
        name: "Альбом АБСТРАКЦИЯ",
        url: "https://ship2101.wixsite.com/belousow/untitled-c10nh",
    },
    {
        name: "Альбом НАТЮРМОРТ",
        url: "https://ship2101.wixsite.com/belousow/untitled-ckz4",
    },
    {
        name: "Альбом ПЕЙЗАЖ",
        url: "https://ship2101.wixsite.com/belousow/untitled-ccyg",
    },
    {
        name: "Альбом КРЫМ",
        url: "https://ship2101.wixsite.com/belousow/untitled-c1ibn",
    },
    {
        name: "Альбом ПРИБАЛТИКА",
        url: "https://ship2101.wixsite.com/belousow/untitled-c243y",
    },
    {
        name: "Альбом МОСКВА",
        url: "https://ship2101.wixsite.com/belousow/untitled-ckgu",
    },
    {
        name: "Альбом САМАРА",
        url: "https://ship2101.wixsite.com/belousow/untitled-cc8i",
    },
    {
        name: "Альбом СУЗДАЛЬ",
        url: "https://ship2101.wixsite.com/belousow/untitled-ccbq",
    },
    {
        name: "Альбом ПИТЕР",
        url: "https://ship2101.wixsite.com/belousow/-",
    },
    {
        name: "Альбом ГЛУБИНКА",
        url: "https://ship2101.wixsite.com/belousow/untitled-c14cl",
    },
    {
        name: "Альбом КОСМОС",
        url: "https://ship2101.wixsite.com/belousow/untitled-c72e",
    },
    {
        name: "Альбом СПОРТ",
        url: "https://ship2101.wixsite.com/belousow/untitled-csbe",
    },
    {
        name: "Альбом ЭКОЛОГИЯ",
        url: "https://ship2101.wixsite.com/belousow/untitled-ckht",
    },
    {
        name: "Альбом НАБРОСКИ",
        url: "https://ship2101.wixsite.com/belousow/untitled-c971",
    },
];

async function parseGalleryPage(url) {
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Run Chrome in headless mode

    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    try {
        await driver.get(url);

        // Find the iframe element
        const iframeElement = await driver.findElement(By.tagName("iframe"));

        // Switch the driver's context to the iframe
        await driver.switchTo().frame(iframeElement);

        // Find the elements inside the iframe
        const elements = await driver.findElements(
            By.css("#displayCycle .item")
        );

        const images = [];
        for (const element of elements) {
            const link = await element.getAttribute("data-thumb");
            const nameElement = await element.findElement(
                By.css(".cycle-overlay h3.title")
            );
            const name = await nameElement.getAttribute("textContent");

            images.push({ link, name });
        }

        return images;
    } finally {
        await driver.quit();
    }
}

async function parseAllGalleries() {
    const results = [];

    for (const link of linksList) {
        const images = await parseGalleryPage(link.url);
        results.push({ name: link.name, images });
    }

    return results;
}

function saveResultsToFile(results) {
    for (const result of results) {
        const { name, images } = result;
        const filename = `parsedLinks/${name}.json`;

        if (fs.existsSync(filename) && fs.statSync(filename).size !== 0) {
            console.log(
                `File ${filename} already exists and is not empty. Skipping...`
            );
            continue;
        }

        const content = JSON.stringify(images, null, 2);

        fs.writeFileSync(filename, content);
        console.log(`Results for "${name}" saved to ${filename}`);
    }
}

async function runParsingAndSaveResults() {
    const results = await parseAllGalleries();
    saveResultsToFile(results);
}

runParsingAndSaveResults();

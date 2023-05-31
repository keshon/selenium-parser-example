const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function downloadImage(url, fileName, folderPath) {
    const imagePath = path.join(folderPath, fileName);
    const writer = fs.createWriteStream(imagePath);
    
    url = url.split("/v1/fill/")[0];
    
    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

async function downloadImagesFromJson(jsonFilePath) {
    try {
        const jsonData = fs.readFileSync(jsonFilePath, "utf8");
        const galleryData = JSON.parse(jsonData);

        const folderName = path.basename(jsonFilePath, ".json");
        const folderPath = path.join(__dirname + "/downloads/", folderName);
        fs.mkdirSync(folderPath, { recursive: true });

        for (const item of galleryData) {
            const { link, name } = item;
            const fileName = `${name}.jpg`;

            console.log(`Downloading ${fileName}...`);
            await downloadImage(link, fileName, folderPath);
            console.log(`Downloaded ${fileName}`);
        }

        console.log(`All images downloaded from ${jsonFilePath}`);
    } catch (error) {
        console.error(`Error downloading images from ${jsonFilePath}:`, error);
    }
}

function scanJsonFiles() {
    const folderPath = "parsedLinks";

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(folderPath, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error("Error getting file stats:", err);
                    return;
                }

                if (
                    stats.isFile() &&
                    stats.size > 0 &&
                    path.extname(filePath) === ".json"
                ) {
                    downloadImagesFromJson(filePath);
                }
            });
        });
    });
}

scanJsonFiles();

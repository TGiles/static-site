const path = require('path');
const puppeteer = require('puppeteer');
const express = require('express');
const destPath = path.join(__dirname, '../', 'resume');
const destFilename = 'Tim-Giles-Resume.pdf';
const port = 5001;
const srcResumePath = 'resume/web-resume/index.html';
const fullResumePath = `http://localhost:${port}/${srcResumePath}`;

(async () => {
    const app = express();
    app.use(express.static(path.join('../', '_site')));
    const server = app.listen(port, async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.goto(fullResumePath, { waitUntil: 'networkidle0' });
        await page.pdf({ 
            path: path.join(destPath, destFilename),
            format: 'Letter',
            printBackground: true,
            margin: {
                top: '0.4 in',
                left: '0.4 in',
                right: '0.39 in',
                bottom: '0.39 in'
            }
        });
        await browser.close();
        server.close(() => {
            console.log(`closing server`);
        });
    });
    return;
})();
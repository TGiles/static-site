const sharp = require('sharp');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');


const main = () => {
    glob("../assets/**/*.+(png|jpg|jpeg|gif)", async function (err, files) {
        if (err) {
            throw err;
        }

        const widths = new Array(5).fill(0);
        for (let i = 0; i < widths.length; i++) {
            widths[i] = 320 + 150 * i;
        }
        console.log(widths);
        for (let i = 0; i < files.length; i++) {
            let dir = path.dirname(files[i]);
            dir = dir.replace("/assets/", "/img/");
            const made = mkdirp.sync(dir);

            for (let j = 0; j < widths.length; j++) {
                const extension = path.extname(files[i]);
                if (extension === '.gif') {
                    let tempDir = dir.replace("/img/", "/assets/");
                    const gifSrc = path.join(tempDir, `${path.basename(files[i], extension)}${extension}`);
                    const gifDest = path.join(dir, `${path.basename(files[i], extension)}${extension}`);
                    fs.copyFileSync(gifSrc, gifDest);
                } else {
                    const base = path.basename(files[i], extension);
                    const outputPath = path.join(dir, `${base}-${widths[j]}w${extension}`);
                    await sharp(files[i])
                        .resize(widths[j])
                        .toFile(outputPath);

                }
            }
        }
    });
}


main();
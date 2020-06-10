const sharp = require('sharp');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');
const gifResize = require('@gumlet/gif-resize');


const main = () => {
    glob("../assets/**/*.+(png|jpg|jpeg|gif)", async function (err, files) {
        if (err) {
            throw err;
        }

        const widths = new Array(5).fill(0);
        for (let i = 0; i < widths.length; i++) {
            widths[i] = 320 + 240 * i;
        }
        console.log(`Generating images with the following widths: ${widths}`);
        for (let i = 0; i < files.length; i++) {
            let dir = path.dirname(files[i]);
            dir = dir.replace("/assets/", "/img/");
            const made = mkdirp.sync(dir);

            for (let j = 0; j < widths.length; j++) {
                const extension = path.extname(files[i]);
                const base = path.basename(files[i], extension);
                const outputPath = path.join(dir, `${base}-${widths[j]}${extension}`);
                if (extension === '.gif') {
                    const buffer = fs.readFileSync(files[i]);
                    let transformedGif = await gifResize({
                        width: widths[j]
                    })(buffer);
                    fs.writeFileSync(outputPath, transformedGif);          
                } else {
                    await sharp(files[i])
                        .resize(widths[j])
                        .toFile(outputPath);

                }

            }
        }
    });
}


main();
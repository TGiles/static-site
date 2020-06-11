const sharp = require('sharp');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');
const gifResize = require('@gumlet/gif-resize');

const webp = require('webp-converter');

const main = () => {
    glob("../assets/**/*.+(png|jpg|jpeg|gif)", async function (err, files) {
        if (err) {
            throw err;
        }
        // These widths come from the images responsiver plugin in .eleventy.js
        const widths = [250, 488, 725, 963, 1200];
        console.log(`Generating images with the following widths: ${widths}`);
        for (let i = 0; i < files.length; i++) {
            let dir = path.dirname(files[i]);
            dir = dir.replace("assets", "img");
            const made = mkdirp.sync(dir);

            for (let j = 0; j < widths.length; j++) {
                const extension = path.extname(files[i]);
                const base = path.basename(files[i], extension);
                if (extension === '.gif') {
                    const outputPath = path.join(dir, `${base}-${widths[j]}${extension}`);
                    const buffer = fs.readFileSync(files[i]);
                    let transformedGif = await gifResize({
                        width: widths[j]
                    })(buffer);
                    fs.writeFileSync(outputPath, transformedGif);
                    // TODO: Figure out how to convert gifs to webm
                    // 
                    // const gif = fs.readFileSync(outputPath);
                    // const outputWebm = path.join(dir, `${base}-${widths[j]}.webm`);
                    // webp.gwebp(outputPath, outputWebm, "-q 80", function (status, error) {
                    //     console.log(status, error);
                    //     fs.unlinkSync(outputPath);
                    // });

                } else {
                    const outputPath = path.join(dir, `${base}-${widths[j]}.webp`);
                    if (base.includes('favicon')) {
                        if (widths[j] === 250) {
                            await sharp(files[i])
                                .resize(32)
                                .toFile(path.join(dir, `${base}${extension}`));
                            break;
                        }
                    }
                    else if (base.includes('profile')) {
                        if (widths[j] === 250) {
                            await sharp(files[i])
                                .resize(widths[j])
                                .webp()
                                .toFile(outputPath);
                            break;
                        }
                    } else {
                        await sharp(files[i])
                            .resize(widths[j])
                            .webp()
                            .toFile(outputPath);
                    }

                }

            }
        }
    });
}


main();
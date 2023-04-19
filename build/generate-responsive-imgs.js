const sharp = require('sharp');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');

const createImageDirectory = (directoryName) => {
    let dir = path.dirname(directoryName);
    dir = dir.replace("assets", "img");
    mkdirp.sync(dir);
    return dir;
}

const createAnimatedWebp = async (gifFile, width, outputPath) => {
    await sharp(gifFile, { animated: true }).resize(width).toFile(outputPath);
}

const createStaticWebp = async (stillFile, width, outputPath) => {
    await sharp(stillFile).resize(width).toFile(outputPath);
}

const createFavicon = async (faviconFile, outputPath) => {
    await sharp(faviconFile).resize(32).toFile(outputPath);
}

const createProfilePicture = async (profilePictureFile, width, outputPath) => {
    await sharp(profilePictureFile).resize(width).toFile(outputPath);
}

const main = () => {
    glob("assets/**/*.+(png|jpg|jpeg|gif)", async function (err, files) {
        if (err) {
            throw err;
        }
        // These widths come from the images responsiver plugin in .eleventy.js
        const widths = [250, 488, 725, 963, 1200];
        if (files.length) {
            console.log(`Generating images with the following widths: ${widths}`);
        }
        for (let i = 0; i < files.length; i++) {
            let dir = createImageDirectory(files[i]);

            for (let j = 0; j < widths.length; j++) {
                const extension = path.extname(files[i]);
                const base = path.basename(files[i], extension);
                const outputPath = path.join(dir, `${base}-${widths[j]}.webp`);
                if (extension === '.gif') {
                    await createAnimatedWebp(files[i], widths[j], outputPath);
                } else {
                    if (base.includes('favicon')) {
                        if (widths[j] === 250) {
                            await createFavicon(files[i], path.join(dir, `${base}${extension}`));
                            break;
                        }
                    }
                    else if (base.includes('profile')) {
                        if (widths[j] === 250) {
                            await createProfilePicture(files[i], widths[j], outputPath);
                            break;
                        }
                    } else {
                        await createStaticWebp(files[i], widths[j], outputPath);
                    }

                }

            }
        }
    });
}


main();

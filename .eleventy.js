const cleanCSS = require('clean-css');

const extractExcerpt = (article) => {
    if (!article.hasOwnProperty('templateContent')) {
        console.warn('Failed to extract excerpt: Document has no property "templateContent".');
        return null;
    }

    let excerpt;
    const content = article.templateContent;

    // The start and end separators to try and match to extract the excerpt
    const separatorList = [
        { start: '<!-- Excerpt Start -->', end: '<!-- Excerpt End -->' },
        { start: '<p>', end: '</p>' }
    ];

    separatorList.some(separators => {
        const startPosition = content.indexOf(separators.start);
        const endPosition = content.indexOf(separators.end);

        if (startPosition !== -1 && endPosition !== -1) {
            excerpt = content.substring(startPosition + separators.start.length, endPosition).trim();
            return true; // Exit out of loop on first match
        }
    });

    return excerpt;
}

module.exports = (eleventyConfig) => {
    eleventyConfig.addFilter('dateIso', date => {
        let _date = new Date(date);
        return _date.toISOString();
    });

    eleventyConfig.addFilter('dateReadable', date => {
        let _date = new Date(date);
        return _date.toLocaleDateString();
    });

    eleventyConfig.addShortcode('excerpt', article => extractExcerpt(article));

    eleventyConfig.addFilter('cssmin', code => {
        let options = {
            level: {
                2: {
                    all: true
                }
            }
        };
        return new cleanCSS(options).minify(code).styles;
    });
}
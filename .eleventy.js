const cleanCSS = require('clean-css');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

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
};

const readingTime = article => {
    const htmlContent = typeof article === 'string' ? article : article.templateContent;
    // speed is 275 WPM
    const readingSpeed = 275;

    if (!htmlContent) {
        return `0 minutes`;
    }

    const content = htmlContent.replace(/(<([^>]+)>)/gi, '');
    const matches = content.match(/[\u0400-\u04FF]+|\S+\s*/g);
    const textCount = matches !== null ? matches.length : 0;
    const images = htmlContent.match(/<img>/);
    const imageCount = images !== null ? images.length : 0;

    let estimatedTime;
    // Image time is in seconds
    const minImages = Math.ceil((imageCount * 12) / 60);
    const minText = Math.ceil(textCount / readingSpeed);
    const min = minText + minImages;
    estimatedTime = min;
    if (estimatedTime === 1) {
        return `About ${estimatedTime} minute read`;
    } else {
        return `About ${estimatedTime} minutes read`;
    }
};

module.exports = (eleventyConfig) => {
    const markdownIt = require('markdown-it');
    const markdownItAttrs = require('markdown-it-attrs');
    let options = {
        html: true,
        breaks: false,
        linkify: true
    };
    let markdownLib = markdownIt(options).use(markdownItAttrs);
    eleventyConfig.setLibrary('md', markdownLib);
    eleventyConfig.addFilter('dateIso', date => {
        let _date = new Date(date);
        return _date.toISOString();
    });

    eleventyConfig.addFilter('dateReadable', date => {
        let _date = new Date(date);
        return _date.toLocaleDateString();
    });

    eleventyConfig.addFilter('copyrightYear', date => {
        let _date = new Date(date);
        return _date.getFullYear();
    });

    eleventyConfig.addFilter('readingTime', article => readingTime(article));

    eleventyConfig.addFilter('blogJoinTopics', post => {
        let pipe = '| ';
        if (!post.data.topics || post.data.topics.length === 0) {
            console.warn('No topics associated with this post!', post.data.title);
            return null;
        }
        let joinedTopics = post.data.topics.join(', ');
        return pipe + joinedTopics;
    });

    eleventyConfig.addFilter('joinTopics', topics => {
        let pipe = '| ';
        if (!topics || topics.length === 0) {
            console.warn('No topics associated with this post!');
            return null;
        }
        let joinedTopics = topics.join(', ');
        return pipe + joinedTopics;
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

    eleventyConfig.setBrowserSyncConfig({
        open: 'local'
    });

    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addPassthroughCopy("img/**/*.*");
    eleventyConfig.addPassthroughCopy("resume");

    eleventyConfig.addCollection('post', collection => {
        const posts = collection.getFilteredByTag('post');

        for( let i = 0; i < posts.length; i++) {
            const prevPost = posts[i - 1];
            const nextPost = posts[i + 1];

            posts[i].data["prevPost"] = prevPost;
            posts[i].data["nextPost"] = nextPost;
        }

        return posts.reverse();
    });
}
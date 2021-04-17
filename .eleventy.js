const cleanCSS = require('clean-css');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const imagesResponsiver = require('eleventy-plugin-images-responsiver');
const { unescapeAll } = require('markdown-it/lib/common/utils');
const Prism = require('prismjs');
const PrismLoader = require('prismjs/components/index');
PrismLoader(['bash', 'js']);

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
        return `0 min`;
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
        return `${estimatedTime} min read`;
    } else {
        return `${estimatedTime} min read`;
    }
};

module.exports = (eleventyConfig) => {
    const markdownIt = require('markdown-it');
    const markdownGithubHeadings = require('markdown-it-github-headings');
    const markdownItAttrs = require('markdown-it-attrs');
    let markdownItOptions = {
        html: true,
        breaks: false,
        linkify: true
    };
    let githubHeadingOptions = {
        prefixHeadingIds: false
    }
    let markdownLib = markdownIt(markdownItOptions)
        .use(markdownItAttrs)
        .use(markdownGithubHeadings, githubHeadingOptions);
    markdownLib.renderer.rules.fence = function (tokens, idx, options, env, slf) {
        const token = tokens[idx];
        let info = token.info ? unescapeAll(token.info).trim() : '';
        let langName = '';
        let i;
        let tmpAttrs;
        let highlighted
        if (info) {
            langName = info.split(/\s+/g)[0];
            highlighted = Prism.highlight(token.content, Prism.languages[langName], langName);
        }
        if (info) {
            i = token.attrIndex('class');
            tmpAttrs = token.attrs ? token.attrs.slice() : [];

            if (i < 0) {
                tmpAttrs.push(['class', options.langPrefix + langName]);
            } else {
                tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
            }

            // Fake token just to render attributes
            tmpToken = {
                attrs: tmpAttrs
            };

            return '<pre' + slf.renderAttrs(tmpToken) + 'tabindex="0"><code' + slf.renderAttrs(tmpToken) + '>'
                + highlighted
                + '</code></pre>\n';

        }
    };
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
        let _date = new Date();
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

    // * Plugin section
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    // TODO: Fix sizes from 45em to something more appropriate
    // 
    const presets = {
        default: {
            sizes: `(max-width: 340px) 250px, 50vw`,
            minWidth: 250,
            maxWidth: 1200,
            fallbackWidth: 725,
            attributes: {
                loading: 'lazy'
            }
        },
        "profile-img": {
            fallbackWidth: 250,
            minWidth: 250,
            maxWidth: 250,
            steps: 1,
            sizes: '250px',
            attributes: {
                loading: 'lazy'
            }
        }
    };
    eleventyConfig.addPlugin(imagesResponsiver, presets);

    eleventyConfig.addPassthroughCopy("img/**/*.*");
    eleventyConfig.addPassthroughCopy("resume");

    eleventyConfig.addCollection('post', collection => {
        const posts = collection.getFilteredByTag('post');

        for (let i = 0; i < posts.length; i++) {
            const prevPost = posts[i - 1];
            const nextPost = posts[i + 1];

            posts[i].data["prevPost"] = prevPost;
            posts[i].data["nextPost"] = nextPost;
        }

        return posts.reverse();
    });
}
const querystring = require("querystring");
const puppeteer = require("puppeteer");
const got = require("got");

const languages = require("./languages");

async function translate(text, opts, gotopts) {

    // eslint-disable-next-line no-param-reassign
    opts = opts || {};
    // eslint-disable-next-line no-param-reassign
    gotopts = gotopts || {};
    // eslint-disable-next-line init-declarations
    let e;
    [opts.from, opts.to].forEach(function (lang) {

        if (lang && !languages.isSupported(lang)) {

            e = new Error();
            e.code = 400;
            e.message = `The language '${lang}' is not supported`;

        }

    });
    if (e) {

        return new Promise(function (resolve, reject) {

            reject(e);

        });

    }

    // eslint-disable-next-line no-param-reassign
    opts = opts || {};
    // eslint-disable-next-line no-param-reassign
    gotopts = gotopts || {};
    // eslint-disable-next-line init-declarations

    opts.from = opts.from || "auto";
    opts.to = opts.to || "en";
    opts.tld = opts.tld || "com";

    opts.from = await languages.getCode(opts.from);
    opts.to = await languages.getCode(opts.to);

    var url = 'https://www.deepl.com/en/translator#' + opts.from + "/" + opts.to + "/" + text;
    console.log(url)

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'networkidle0'
    });
    const selector = '#target-dummydiv';
    await page.waitForSelector(selector);
    const data = await page.$eval('#target-dummydiv', el => el.innerHTML)
    const result = {
        "text": "",
        "pronunciation": "",
        "from": {
            "language": {
                "didYouMean": false,
                "iso": ""
            },
            "text": {
                "autoCorrected": false,
                "value": "",
                "didYouMean": false
            }
        },
        "raw": ""
    };
    result.text = data;
    result.from.language.iso = opts.from;
    result.from.text.value = text;
    return result;
}
module.exports = translate;
module.exports.languages = languages;

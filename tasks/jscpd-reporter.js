/**
 * Grunt JSCPD Reporter exporter
 *
 * @name      grunt-jscpd-reporter
 * @package   grunt-jscpd-reporter
 * @author    Nils Gajsek <nils.gajsek@glanzkinder.com>
 * @copyright 2014-2015 Nils Gajsek <nils.gajsek@glanzkinder.com>
 * @version   0.1.5
 * @license   http://opensource.org/licenses/MIT MIT Public
 * @link      http://www.linslin.org
 *
 */

/**
 *
 * extension for prismjs
 * @author Roman Balayan
 *
 */

/**
 * JSCP Reporter
 */
module.exports = function(grunt) {

    function jscpdreporter() {

        // ############################################## Attributes // ################################################

        /**
         * Configuration object
         * @var {object} config
         */
        var config = grunt.config.get('jscpdreporter');

        /**
         * Get path object
         * @var {object} path
         */
        var path = require('path');

        /**
         * Get fs object
         * @var {object} fs
         */
        var fs = require('fs');

        /**
         * Get xml2js object
         * @var {object} fs
         */
        var xml2js = require('xml2js');

        /**
         * Get beautify js
         * @type {object} js-beautify'
         */
        var beautifyJs = require('js-beautify');

        /**
         * syntaxhighlighter
         * @var {object} node-syntaxhighlighter
         */
        var nsh =  require('node-syntaxhighlighter');

        /**
         * mkdirp
         * @var {object} mkdirp
         */
        var mkdirp = require('mkdirp');

        /**
         * Template path
         * @var {string} templatePath
         */
        var templatePath = path.join(__dirname) + '/../templates/';

        /**
         * Copy/Paste detection output holder
         * @var {string} cpdOutput
         */
        var cpdOutput = '';

        /**
         * Rendered HTML output string
         * @var {string} outputHTML
         */
        var outputHTML = '';

        /**
         * Rendered HTML item output string
         * @var {string} outputHTML
         */
        var itemsHTML = '';

        /**
         * Syntax Highlighter Module to use 
         * @var string highlighter
         */
        var highlighter = '';

        /**
         * CSS styles to include in html 
         * @var string styles
         */
        var styles = '';

        /**
         * JS scripts to include in html 
         * @var string scripts
         */
        var scripts = '';

        /**
         * Templates
         * @var {object} templates
         */
        var templates = {
            layout: '',
            _item: '',
            _file: ''
        };

        /**
         * Prism CSS Styles
         * @var {object} prismCSSStyles
         */
        var prismCSSStyles = {
            default: 'prism.css',
            dark: 'prism-dark.css',
            twilight: 'prism-twilight.css',
            funky: 'prism-funky.css',
            tomorrow: 'prism-tomorrow.css',
            okaidia: 'prism-okaidia.css'
        };

        /**
         * Contains functions for preparing assets
         * @var {object} prepareAssetsHandler
         */
        var prepareAssetsHandler = {
            'prism': preparePrismAssets,
            'nsh': prepareNSHAssets,
        };

        /**
         * Contains functions for rendering items
         * @var {object} renderItemsHandler
         */
        var renderItemsHandler = {
            'prism': renderPrismItems,
            'nsh': renderNSHItems
        };


        // ################################################ Methods // #################################################

        /**
         * Init function
         */
        function init() {
            //ensure output dir exists
            if (!grunt.file.exists(process.cwd() + '/' + config.options.outputDir)) {
                grunt.file.mkdir(process.cwd() + '/' + config.options.outputDir);
            }

            //set nsh as default highlighter
            highlighter = (config.options.highlighter === 'nsh' || config.options.highlighter === 'prism')
                ?  config.options.highlighter
                : 'nsh';

            //cleanup report
            fs.unlink(process.cwd() + '/' + config.options.outputDir + '/index.html');

            //cleanup assets
            fs.unlink(process.cwd() + '/' + config.options.outputDir + '/css/default.css');
            fs.unlink(process.cwd() + '/' + config.options.outputDir + '/css/prism.css');
            fs.unlink(process.cwd() + '/' + config.options.outputDir + '/js/prism.js');

            //load templates and output xml
            loadTemplates();
            loadOutputXml();

            //prepare css and js prism files
            prepareAssets();

            //render output
            renderHtmlOutput();

            //create report
            createReport();
        }

        /**
         * Load html template files
         */
        function loadTemplates() {
            for (var template in templates) {
                templates[template] = fs.readFileSync(templatePath + template + '.html').toString();
            }
        }

        /**
         * Load cpd output xml and parse it to an js object
         */
        function loadOutputXml() {
            //read output file
            cpdOutput = fs.readFileSync(process.cwd() + '/' + config.options.sourcefile).toString();

            //parse output xml
            xml2js.parseString(cpdOutput, function(err, result){
                cpdOutput = result;
            });
        }

        /**
         * Wrapper for preparing js and css files
         */
        function prepareAssets() {
            prepareAssetsHandler[highlighter]();
        }

        /**
         * Handler for creating prism css and js files
         */
        function preparePrismAssets() {
            var style = config.options.style;
            var stylePath = 'prism.css';
            if(style && prismCSSStyles[style]) {
                stylePath = prismCSSStyles[style];
            }

            mkdirp.sync(process.cwd() + '/' + config.options.outputDir + 'css/', function(err){
                console.log(err);
            });

            mkdirp.sync(process.cwd() + '/' + config.options.outputDir + 'js/', function(err){
                console.log(err);
            });

            fs.writeFileSync(process.cwd() + '/' + config.options.outputDir + 'css/default.css',
                fs.readFileSync(path.join(__dirname) + '/../templates/css/jscpd-reporter.css').toString());

            fs.writeFileSync(process.cwd() + '/' + config.options.outputDir + 'css/prism.css',
                fs.readFileSync(path.join(__dirname) + '/../node_modules/prismjs/themes/' + stylePath).toString())

            fs.writeFileSync(process.cwd() + '/' + config.options.outputDir + 'js/prism.js',
                fs.readFileSync(path.join(__dirname) + '/../node_modules/prismjs/prism.js').toString());

            styles = '<link rel="stylesheet" type="text/css" href="css/default.css" media="all" />';
            styles += '<link rel="stylesheet" type="text/css" href="css/prism.css"/>';
            scripts = '<script src="js/prism.js"></script>';
        }

        /**
         * Handler for creating nsh css files
         */
        function prepareNSHAssets() {
            fs.writeFileSync(process.cwd() + '/' + config.options.outputDir + 'css/default.css',
                fs.readFileSync(path.join(__dirname) + '/../node_modules/node-syntaxhighlighter/lib/styles/shCoreDefault.css').toString()
                + fs.readFileSync(path.join(__dirname) + '/../node_modules/node-syntaxhighlighter/lib/styles/shCore.css').toString()
                + fs.readFileSync(path.join(__dirname) + '/../templates/css/jscpd-reporter.css').toString());
            styles = '<link rel="stylesheet" type="text/css" href="css/default.css" media="all" />';
        }

        /**
         * Render HTML Output
         */
        function renderHtmlOutput() {
            //Init
            var i = 0;
            if (cpdOutput['pmd-cpd'].duplication !== undefined) {
                for (var key in cpdOutput['pmd-cpd'].duplication) {
                    //make item global for run
                    var item = cpdOutput['pmd-cpd'].duplication[key];
                    for (var prop in item) {
                        if(item.hasOwnProperty(prop)){
                            //init
                            var filesHtml = '';
                            //set lines
                            if (item[prop].lines !== undefined) {
                                itemsHTML += templates._item.replace('{{lines}}', item[prop].lines);
                            }
                            //set tokens
                            if (item[prop].tokens !== undefined) {
                                itemsHTML = itemsHTML.replace('{{tokens}}', item[prop].tokens);
                            }
                            // set items counter
                            //make this line exec only one time
                            itemsHTML = itemsHTML.replace('{{itemCounter}}', (i + 1) + '/' + cpdOutput['pmd-cpd'].duplication.length);
                            //set codefragment
                            if (item.codefragment !== undefined) {
                                itemsHTML = renderItemsHandler[highlighter](itemsHTML, item);
                            }
                            //get files
                            if (item.file !== undefined) {
                                for (var fileId in item.file) {
                                    if(item.hasOwnProperty(prop)){
                                        filesHtml += templates._file.replace('{{line}}', item.file[fileId]['$'].line);
                                        filesHtml = filesHtml.replace('{{filePath}}', item.file[fileId]['$'].path);
                                    }
                                }                                
                                itemsHTML = itemsHTML.replace('{{files}}', filesHtml);
                            }
                        }
                    }
                    i++;
                }
            }
            //render items into layout
            outputHTML += templates.layout.replace('{{content}}', itemsHTML);
            outputHTML = outputHTML.replace('{{styles}}', styles);
            outputHTML = outputHTML.replace('{{scripts}}', scripts);
        }

        /**
         * Render Prism HTML Output
         */
        function renderPrismItems(itemsHTML, item) {
            itemsHTML = itemsHTML.replace(
                '{{codeFragment}}',
                beautifyJs.js_beautify(String(item.codefragment))
            );
            return itemsHTML;
        }

        /**
         * Render NSH HTML Output
         */
        function renderNSHItems(itemsHTML, item) {
            itemsHTML = itemsHTML.replace(
                '{{codeFragment}}',
                nsh.highlight(
                    beautifyJs.js_beautify(String(item.codefragment)),
                    nsh.getLanguage('js'),
                    { 'gutter': true }
                )
            );
            return itemsHTML;
        }


        /**
         * Create report
         */
        function createReport() {
            fs.appendFileSync(process.cwd() + '/' + config.options.outputDir + '/index.html', outputHTML );
        }

        //run
        init();
    }

    // grunt jscpd reporter task
    grunt.registerTask('jscpd-reporter', jscpdreporter);
}

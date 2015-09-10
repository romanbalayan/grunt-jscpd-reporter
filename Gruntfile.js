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

//export module
module.exports = function (grunt) {

    // ########################################## Object attributes // #############################################

    //use strict -> ECMAScript5 error reporting
    'use strict';

    // Project configuration.
    grunt.initConfig({

        jscpdreporter: {
            src : ['Gruntfile.js', 'tasks/*.js'],
            options: {
                sourcefile: 'mocks/output.xml',
                outputDir: 'report/'
            }
        }
    });

    // Load local tasks.
    grunt.loadTasks('tasks');

    // Default task.
    grunt.registerTask('default', ['jscpd-reporter']);
};

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            build: {
                files: [{
                    src: 'scss/main.scss',
                    dest:'public/stylesheets/style.css'
                }]
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-sass');

    // Do the tasks
    grunt.registerTask('default', ['sass']);

};
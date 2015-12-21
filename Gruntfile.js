
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  var path = require('path');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    pkgMeta: grunt.file.readJSON('config/meta.json'),
    dest: grunt.option('target') || 'dist',
    basePath: path.join('<%= dest %>', 'App_Plugins', '<%= pkgMeta.name %>'),

    watch: {
      options: {
        spawn: false,
        atBegin: true
      },
      dll: {
        files: ['BackOfficeVisualiser/Umbraco/BackOfficeVisualiser/**/*.cs'] ,
        tasks: ['msbuild:dist', 'copy:dll']
      },
      js: {
        files: ['BackOfficeVisualiser/**/*.js'],
        tasks: ['concat:dist']
      },
      html: {
        files: ['BackOfficeVisualiser/**/*.html'],
        tasks: ['copy:html']
      },
	  sass: {
		files: ['BackOfficeVisualiser/**/*.scss'],
		tasks: ['sass', 'copy:css']
	  },
	  css: {
		files: ['BackOfficeVisualiser/**/*.css'],
		tasks: ['copy:css']
	  },
	  manifest: {
		files: ['BackOfficeVisualiser/package.manifest'],
		tasks: ['copy:manifest']
	  }
    },

    concat: {
      options: {
        stripBanners: false
      },
      dist: {
        src: [
            'BackOfficeVisualiser/doctype.visualiser.namespaces.js',
            'BackOfficeVisualiser/models/doctype.visualiser.models.js',
			'BackOfficeVisualiser/resources/d3.resource.js',
			'BackOfficeVisualiser/resources/doctype.api.resource.js',
            'BackOfficeVisualiser/controllers/doctype.visualiser.controller.js'
        ],
        dest: '<%= basePath %>/js/backoffice.visualiser.js'
      }
    },

    copy: {
        dll: {
            cwd: 'BackOfficeVisualiser/Umbraco/BackOfficeVisualiser/bin/',
            src: 'BackOfficeVisualiser.dll',
            dest: '<%= dest %>/bin/',
            expand: true
        },
        html: {
            cwd: 'BackOfficeVisualiser/views/',
            src: [
                'DocTypeVisualiser.html'
            ],
            dest: '<%= basePath %>/views/',
            expand: true,
            rename: function(dest, src) {
                return dest + src;
              }
        },
		css: {
			cwd: 'BackOfficeVisualiser/css/',
			src: [
				'visualiser.css'
			],
			dest: '<%= basePath %>/css/',
			expand: true,
			rename: function(dest, src) {
				return dest + src;
			}
		},
        manifest: {
            cwd: 'BackOfficeVisualiser/',
            src: [
                'package.manifest'
            ],
            dest: '<%= basePath %>/',
            expand: true,
            rename: function(dest, src) {
                return dest + src;
            }
        },
       umbraco: {
        cwd: '<%= dest %>',
        src: '**/*',
        dest: 'tmp/umbraco',
        expand: true
      }
    },

    umbracoPackage: {
      options: {
        name: "<%= pkgMeta.name %>",
        version: '<%= pkgMeta.version %>',
        url: '<%= pkgMeta.url %>',
        license: '<%= pkgMeta.license %>',
        licenseUrl: '<%= pkgMeta.licenseUrl %>',
        author: '<%= pkgMeta.author %>',
        authorUrl: '<%= pkgMeta.authorUrl %>',
        manifest: 'config/package.xml',
        readme: 'config/readme.txt',
        sourceDir: 'tmp/umbraco',
        outputDir: 'pkg',
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      src: {
        src: ['app/**/*.js', 'lib/**/*.js']
      }
  },
  
  sass: {
		dist: {
			options: {
				style: 'compressed'
			},
			files: {
				'BackOfficeVisualiser/css/visualiser.css': 'BackOfficeVisualiser/sass/visualiser.scss'
			}
		}
	},

  clean: {
      build: '<%= grunt.config("basePath").substring(0, 4) == "dist" ? "dist/**/*" : "null" %>',
      tmp: ['tmp'],
      html: [
        'BackOfficeVisualiser/views/*.html',
        '!BackOfficeVisualiser/views/DocTypeVisualiser.html'
        ],
      js: [
        'BackOfficeVisualiser/controllers/*.js',
        '!BackOfficeVisualiser/controllers/doctype.visualiser.controller.js'
      ],
      css: [
        'BackOfficeVisualiser/css/*.css',
        '!BackOfficeVisualiser/css/visualiser.css'
      ],
	  sass: [
		'BackOfficeVisualiser/sass/*.scss',
		'!BackOfficeVisualiser/sass/visualiser.scss'
	  ]
    },

  msbuild: {
      options: {
        stdout: true,
        verbosity: 'quiet',
        maxCpuCount: 4,
        version: 4.0,
        buildParameters: {
          WarningLevel: 2,
          NoWarn: 1607
        }
    },
    dist: {
        src: ['BackOfficeVisualiser/Umbraco/BackOfficeVisualiser/BackOfficeVisualiser.csproj'],
        options: {
            projectConfiguration: 'Debug',
            targets: ['Clean', 'Rebuild'],
        }
    }
  }

  });

  grunt.registerTask('default', ['concat', 'sass:dist', 'copy:html', 'copy:manifest', 'copy:css', 'msbuild:dist', 'copy:dll', 'clean:html', 'clean:js', 'clean:css']);
  grunt.registerTask('umbraco', ['clean:tmp', 'default', 'copy:umbraco', 'umbracoPackage', 'clean:tmp']);
};

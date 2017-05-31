module.exports = function(grunt) {

  grunt.initConfig({
    env: {
        dev: {
            env:"dev"
        },
        release: {
            deploy: "C:/nodejs_dev/angular_chat/release/bin",
            env:"release"
        }
    },

    settings:{
        source: "source",
        bin: "bin"
    },

    "typescript-formatter": {
        build:{
            files:{
                src:["<%= settings.source %>/**/*.ts"]
            }
        }
    },

    ts: {
      transpile: {
        src: [
            "<%= settings.source %>/**/*.ts"
        ],
        options: {
          fast: "never",

          compile: true,
          module: "commonjs",
          target: "es6",
          sourceMap: false,
          experimentalDecorators:true,
          emitDecoratorMetadata:true,
          moduleResolution:"node"
        },
        outDir:"<%= settings.bin %>"
      }
    },

    babel: {
      options: {
        presets: ["es2015"],
        plugins: [
            "angular2-annotations",
            "transform-decorators-legacy",
            "transform-class-properties",
            "transform-flow-strip-types",
            ["babel-plugin-transform-builtin-extend",
                {
                    globals: ["Error", "Array"]
                }
            ]
  		],
        sourceMap: false
      },
      transpile: {
        files: [
          {
            expand: true,
            src: [
                "<%= settings.bin %>/**/*.js",
                "!<%= settings.bin %>/client/framework/**/*.js"
            ]
          }
        ]
      }
    },

    copy: {
        source: {
            files:[
              {
                  expand: true,
                    src: [
                        "<%= settings.source %>/**/*.json",
                        "<%= settings.source %>/**/*.ico",
                        "<%= settings.source %>/**/*.jpg",
                        "<%= settings.source %>/**/*.jade",
                        "<%= settings.source %>/**/*.css",
                        "<%= settings.source %>/**/*.js",
                        "<%= settings.source %>/**/*.html",
                        "!<%= settings.source %>/server/common/resources/config/**/*.json"
                    ],
                    dest: "<%= settings.bin %>/",
                    source: "<%= settings.source %>",
                    rename: function (dest, src) {
                      return dest + src.replace(this.source, "");
                    }
            },
            {
                  expand: true,
                  src: [
                      "<%= settings.source %>/server/common/resources/config/**/*.<%= settings.env %>.json"
                  ],
                  dest: "<%= settings.bin %>/",
                  source: "<%= settings.source %>",
                  env:"<%= settings.env %>",
                  rename: function (dest, src) {
                    return dest + src.replace(this.source, "")
                        .replace("." + this.env, "")
                  }
                }
            ]
        },
        deploy: {
            files:[
                {
                    expand: true,
                    src: [
                        "<%= settings.bin %>/**/*"
                    ],
                    dest: "<%= settings.deploy %>/",
                    source: "<%= settings.bin %>",
                    rename: function (dest, src) {
                      return dest + src.replace(this.source, "");
                    }
                }
            ]
        }
    },

    uglify: {
        dist: {
            files: [
                {
                    expand: true,
                    src: [
                        "<%= settings.bin %>/**/*.js",
                        "!<%= settings.bin %>/client/framework/**/*.js"
                    ]
                }
            ]
        }
    },

    clean: {
        options: {
            force:true
        },
        build: {
            src: ["<%= settings.bin %>/**/.*", "<%= settings.source %>/**/.*"]
        },
        bin: {
            src: ["<%= settings.bin %>/**/*"]
        },
        deploy: {
            src: ["<%= settings.deploy %>/**/*"]
        }
    },

    watch: {
        build: {
            files: ["<%= settings.source %>/**/*"],
            tasks: ["env:dev", "load_settings", "typescript-formatter", "ts", "babel", "copy:source"]
        }
    }
  });

  var packages = grunt.file.readJSON('package.json');

  for(var taskName in packages.devDependencies) {
    if(taskName.substring(0, 6) == 'grunt-') {
        grunt.loadNpmTasks(taskName);
    }
  }

  grunt.registerTask('load_settings', "Load Settings", function() {
      grunt.config('settings.deploy', process.env.deploy);
      grunt.config('settings.env', process.env.env);
  });

  grunt.registerTask("rebuild", ["env:dev", "load_settings", "clean:bin", "typescript-formatter", "ts", "babel", "copy:source", "clean:build"]);
  grunt.registerTask("release", ["env:release", "load_settings", "clean:bin", "clean:deploy", "ts", "babel", "copy:source", "clean:build", "copy:deploy"]);
};

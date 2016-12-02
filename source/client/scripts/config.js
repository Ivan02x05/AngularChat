System.config({
    transpiler: false,
    baseURL: "",
    paths: {
        "node:*": "../framework/*"
    },
    map: {
        "autolinker": "node:autolinker/dist/Autolinker.min.js"
    },
    packages: {
        "scripts": {
            main:"boot",
            defaultExtension: "js",
            defaultJSExtensions: true
        },
        "../common":{
            defaultExtension: "js",
            defaultJSExtensions: true
        }
    }
});

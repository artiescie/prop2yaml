// this is "proof of concept" level tool: completes a translation 
//    workflow based on Google Sheet 
//     -- sharable with translators
//     -- use existing tool => gen default strings with Google Translate
//     -- use existing tool => generate Java prop files, and download to you
//  THEN: this prepares the i18n file expected by Vue i18n

//   these are the tools reqd, in the Google Sheets add-ons shop:
//     Add-on Easy Localization by www.modernalchemy.de (execute Google translate, leaving non-empty cells)
//     Add-on Java Translations Tool by simon.niederberger (downloads zip of java properties files, to convert to yaml)
 
// "usage: node prop2yaml.js <path to trans zip file> <output dir>

'use strict'

//   to use in component, a .vue file:
//     in template: {{ $t('length') }}
//     in javascript: label: this.$i18n.t('col_move_name'),
//       (see i18n docs for the rest of setup)

// minimal dependencies package.json:
// {
//   "name": "prop2yaml",
//   "version": "1.0.0",
//   "description": "",
//   "main": "index.js",
//   "author": "artiescie",
//   "license": "MIT",
//   "dependencies": {
//     "concat-stream": "^1.6.0",
//     "unzipper": "^0.8.9"
//   }
// }

// https://stackoverflow.com/questions/10308110/simplest-way-to-download-and-unzip-files-in-node-js-cross-platform

let fs = require('fs')

function main () {
  let unzipper = require('unzipper')
  let concat = require('concat-stream')

  let yaml = ''  // initiale an empty string

  try {
    fs.createReadStream(sInFile)
      .on('error', function (er) {
        console.log('Error in processing file ' + sInFile)
      })
      .pipe(unzipper.Parse())
      .on('finish', function (entry) {
        console.log('finished')
        var path = require('path');
        var filename = path.posix.basename(sInFile).split('.')[0]
        let sOutFile = sOutDir + filename + '.yaml'
        fs.writeFileSync(sOutFile, yaml)
        console.log(yaml)
        console.log("The file was saved: " + sOutFile)
        console.log("Deleting download file: " + sInFile)
        // fs.unlinkSync(sInFile)
      })
      .on('entry', function (entry) {
        let fileName = entry.path
        let type = entry.type // 'Directory' or 'File'
        if (/\/$/.test(fileName)) {
          console.log('[DIR]', fileName, type)
          return
        }

        console.log('[FILE]', fileName, type)

        let concatStream = concat(doLang.bind(null, fileName))
        entry.pipe(concatStream)

        function doLang (fileName, data) {
          // pluck the language code out of the filename
          let lang = fileName.split('.')[0].split('_')[1]
          if (lang) {
            appendToYaml(lang + ':\n')
            console.log(data.toString())
            let defs = data.toString().split('\n').map(line => {
              if ((lang != undefined) && (line.length > 0)) {
                // TODO: strings brought in from Google Sheets may need more "escaping" of special chars
                //  note, google translation translates plane double qoute to unicode double quote (open/close)
                //  and aren't escaped (else it's an error, unrecognized esc seq)
                line = line.replace(/[\\"]/g, "\\$&") // escape backslash, double quote chars
                line = line.replace('\r', '') // snip windows CR inserted by Sheet extractor
                let parts = line.split("=")
                let key = parts[0]
                let val = parts[1]
                return "  " + key + ': "' + val + '"'
              } else {
                return null
              }
            })
            appendToYaml(defs.join('\n'))
          }
        }
        function appendToYaml (addPiece) {
          console.log('in appendToYaml!')
          // we can't access this variable from within the concat-stream callback
          //  but we can call this function in the outer scope, and append
          //  to the variable indirectly
          yaml += addPiece
        }
      })
  } catch (error) {
    console.log('Error in unzipping: ' + error)
  }
}
var validateArgs = function () {
  if (args.length != 2) {
    sErrMsg = "usage: node prop2yaml.js <path to trans zip file> <output dir>\n"
  } else {
    // further tests:
    // append lines to sErrMsg
  }
  // if the error is defined, then there is an  error!
  if (!(typeof sErrMsg === "undefined")) {
    sErrMsg = "ERROR: \n" + sErrMsg;
    throw (sErrMsg);
  }

} // end of validateArgs

let args = process.argv.slice(2);
let sErrMsg; // after arg check, if this is non empty just show the msg and quit

//////////////////////////// validation of input
try {
  validateArgs();
} catch (err) {
  console.log('ARGS ERROR: ' + err);
  return;  // nodejs wraps us in an anonymous function, so it works...
}

//////////////////////////// main
let sInFile = args[0];
let sOutDir = args[1];

main();

import { resolve } from 'path';
import { createReadStream, createWriteStream } from 'node:fs';
import { appendFile, truncate } from 'node:fs/promises';

const lineToTitleCase = (line: string) => {
  try {
    return line.toString().split(/\W+/g).filter(v => v).map((part: string) => {
      return part[0].toUpperCase() + part.substring(1);
    }).join('')
  } catch (e) {
    console.log("Line error: ", line);
    throw e;
  }
}

async function generateList (inputPath: string, outputPath: string) {
  //Touch the output file and make sure it's empty
  try {
    await appendFile(outputPath, '')
    await truncate(outputPath, 0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  const readStream = createReadStream(inputPath);
  const writeStream = createWriteStream(outputPath);
  writeStream.write(`const wordList = [`);

  let previousChunkWord = "";
  readStream.setEncoding('utf8');
  readStream.on('data', (data: string) => {
    const parts = data.split(/[\n\r]+/g).filter(v => v)

    //handle all parts except the last one
    for( let part of parts.slice(0, -1) ) {
      let line = previousChunkWord + part;
      previousChunkWord = "";
      const titleCasedLine = lineToTitleCase(line);
      if( titleCasedLine && titleCasedLine.length <= 15 ) {
        //we only want to make the user type strings that are max 45 characters
        writeStream.write(`\n  "${titleCasedLine}",`)
      }
    }

    //Now handle the remaining part, which may or may not be a complete word
    const lastPart = parts.slice(-1)[0];
    if( lastPart && /[\n\r]$/.test(data)) {
      //we ended with a newline, write the word
      writeStream.write(`\n  "${lineToTitleCase(lastPart)}",`)
    }
    else{
      //we only have part of a word, store it
      previousChunkWord = lastPart
    }
  })

  readStream.on('end', () => {
    //handle any dangling word, because it might actually have ended at EOF
    if( previousChunkWord ) writeStream.write(`\n  "${previousChunkWord}"`)
    writeStream.write(`\n];\nexport default wordList;\n`)
    writeStream.close()
  })
}

(async () => {
  await generateList(
    resolve(__dirname, 'animals.txt'),
    resolve(__dirname, 'animals.js')
  )
  await generateList(
    resolve(__dirname, 'adjectives.txt'),
    resolve(__dirname, 'adjectives.js')
  )
})()
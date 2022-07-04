import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { toCanvas } from 'qrcode';
import { createCanvas } from 'canvas';
import pdfjs from 'pdfjs';

export async function generateQrCodes(project: ProjectDefinition) {
  let imageBuffer: Buffer;
  try {
    const canvas = createCanvas(400, 400)
    const codeCanvas: any = await toCanvas(canvas, project.players[0].uuid)
    imageBuffer = codeCanvas.toBuffer("image/jpeg");
  } catch (e) {
    console.log("Error creating qr code canvas");
    throw e;
  }
  try {
    const doc = new pdfjs.Document()
    doc.pipe(createWriteStream(resolve(__dirname, 'output/qr.pdf')))

    const pdfImg = new pdfjs.Image(imageBuffer);
    doc.image(pdfImg);

    await doc.end()
  } catch (e) {
    console.log("Error creating and writing to pdf");
    throw e;
  }
}
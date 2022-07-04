import { resolve } from 'node:path';
import { toDataURL } from 'qrcode';
import JSPDF from 'jspdf';

const letterSizeRatio = 279/216; //in mm
const ptScale = 1000 / 279
const millisPerPoint = 0.352778 * ptScale;

export async function generateQrCodes(project: ProjectDefinition) {
  try {
    const pageFormat = [1000, letterSizeRatio*1000];
    const doc = new JSPDF({
      format: pageFormat
    })
    doc.setFontSize(40)
    
    const numBlocks = 4;
    const blocksPerPage = numBlocks*numBlocks;
    const blockWidth = 250;
    const blockHeight = 300;
    const qrSize = 200;

    for( let i=0; i<project.players.length; i++ ){
      if( i%(numBlocks*numBlocks) === 0 && i > 0 ) doc.addPage(pageFormat)
      const pageContextIndex = i % blocksPerPage;

      let qrCodeDataUrl;
      try {
        qrCodeDataUrl = await toDataURL(project.players[i].uuid)
      } catch (e) {
        console.log("Error creating qr code data url");
        throw e;
      }

      const blockXPos = Math.floor(pageContextIndex%numBlocks) * blockWidth;
      const blockYPos = Math.floor(pageContextIndex/numBlocks) * blockHeight;

      doc.addImage(
        qrCodeDataUrl,
        'JPEG',
        blockXPos + (blockWidth-qrSize)/2,
        blockYPos,
        qrSize,
        qrSize
      )

      doc.text(project.players[i].wordId, blockXPos + blockWidth/2, blockYPos + qrSize + 10, {
        align: 'center'
      })
    }
    doc.save(resolve(__dirname, 'output/qr.pdf'))
  } catch (e) {
    console.log("Error creating and writing to pdf");
    throw e;
  }
}
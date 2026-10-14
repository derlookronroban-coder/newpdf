import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface PdfEditOperation {
  type: 'image' | 'text' | 'whiteout' | 'addPage' | 'rotatePage' | 'deletePage';
  page: number; // 1-based page index
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  colorHex?: string;
  opacity?: number;
  imageFieldIndex?: number;
  imageBase64?: string;
  imageFormat?: 'png' | 'jpg';
  rotationDegrees?: number;
}

function hexToRgb(hex = '#0f172a') {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r || 0, g || 0, b || 0);
}

export async function processPdfEdits(
  pdfBuffer: Buffer,
  operations: PdfEditOperation[],
  uploadedImages: Express.Multer.File[] = []
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  pdfDoc.registerFontkit(fontkit);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const op of operations) {
    if (op.type === 'addPage') {
      pdfDoc.addPage([595, 842]);
      continue;
    }

    const pages = pdfDoc.getPages();
    const pageIdx = Math.max(0, Math.min(pages.length - 1, (op.page || 1) - 1));
    const page = pages[pageIdx];
    if (!page) continue;

    if (op.type === 'rotatePage') {
      const currentAngle = page.getRotation().angle || 0;
      page.setRotation(degrees((currentAngle + (op.rotationDegrees || 90)) % 360));
      continue;
    }

    if (op.type === 'deletePage' && pdfDoc.getPageCount() > 1) {
      pdfDoc.removePage(pageIdx);
      continue;
    }

    const { height: pageHeight } = page.getSize();
    const w = op.width || 180;
    const h = op.height || 60;
    const pdfX = op.x || 50;
    const pdfY = pageHeight - (op.y || 50) - h;

    if (op.type === 'image') {
      let imgBytes: Buffer | Uint8Array | null = null;
      let isPng = op.imageFormat === 'png';

      if (typeof op.imageFieldIndex === 'number' && uploadedImages[op.imageFieldIndex]) {
        const file = uploadedImages[op.imageFieldIndex];
        imgBytes = file.buffer;
        isPng = file.mimetype.includes('png');
      } else if (op.imageBase64) {
        const base64Data = op.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        imgBytes = Buffer.from(base64Data, 'base64');
        isPng = op.imageBase64.startsWith('data:image/png') || op.imageFormat === 'png';
      }

      if (imgBytes) {
        const embeddedImg = isPng
          ? await pdfDoc.embedPng(imgBytes)
          : await pdfDoc.embedJpg(imgBytes);
        page.drawImage(embeddedImg, {
          x: pdfX,
          y: pdfY,
          width: w,
          height: h,
          opacity: op.opacity ?? 1
        });
      }
    } else if (op.type === 'whiteout' || op.type === 'text') {
      if (op.type === 'whiteout') {
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: w,
          height: h,
          color: rgb(1, 1, 1),
          opacity: op.opacity ?? 1
        });
      }
      if (op.text) {
        page.drawText(op.text, {
          x: pdfX + 6,
          y: pdfY + h - (op.fontSize || 16) - 4,
          size: op.fontSize || 16,
          font: helveticaBold,
          color: hexToRgb(op.colorHex),
          opacity: op.opacity ?? 1
        });
      }
    }
  }

  return await pdfDoc.save();
}
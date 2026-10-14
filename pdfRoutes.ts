import { Router, Request, Response } from 'express';
import multer from 'multer';
import { processPdfEdits, PdfEditOperation } from '../services/pdfService';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

/**
 * POST /api/pdf/edit
 * รับไฟล์ PDF (pdfFile), รูปภาพหลายไฟล์ (images), และคำสั่งแก้ไข (operations JSON)
 */
router.post(
  '/edit',
  upload.fields([
    { name: 'pdfFile', maxCount: 1 },
    { name: 'images', maxCount: 20 }
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const pdfFile = files?.pdfFile?.[0];

      if (!pdfFile) {
        return res.status(400).json({ error: 'กรุณาอัปโหลดไฟล์ PDF (pdfFile)' });
      }

      const imageFiles = files?.images || [];
      const operations: PdfEditOperation[] = req.body.operations
        ? JSON.parse(req.body.operations)
        : [];

      const editedPdfBytes = await processPdfEdits(
        pdfFile.buffer,
        operations,
        imageFiles
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="edited-document.pdf"'
      );
      return res.send(Buffer.from(editedPdfBytes));
    } catch (error: any) {
      console.error('PDF Edit Error:', error);
      return res.status(500).json({
        error: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ PDF',
        details: error?.message
      });
    }
  }
);

export default router;
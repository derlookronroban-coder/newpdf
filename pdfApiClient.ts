/**
 * Frontend API Client สำหรับส่งไฟล์ PDF และรูปภาพไปประมวลผลที่ Node.js Backend
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function editPdfOnBackend(
  pdfBytes: Uint8Array,
  overlays: any[]
): Promise<Blob> {
  const formData = new FormData();
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  formData.append('pdfFile', pdfBlob, 'document.pdf');

  const operations = overlays.map((item) => ({
    type: item.type === 'image' ? 'image' : item.whiteout ? 'whiteout' : 'text',
    page: item.page,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    text: item.text,
    fontSize: item.fontSize,
    colorHex: item.color,
    opacity: item.opacity,
    imageBase64: item.dataUrl,
    imageFormat: item.imageFormat || 'png'
  }));

  formData.append('operations', JSON.stringify(operations));

  const response = await fetch(`${API_BASE_URL}/api/pdf/edit`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Backend PDF processing failed');
  }

  return await response.blob();
}
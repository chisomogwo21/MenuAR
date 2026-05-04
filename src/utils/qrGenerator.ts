import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import QRCode from 'qrcode';

export async function generateTableQRsZip(restaurantSlug: string, tableCount: number) {
  const zip = new JSZip();
  const folder = zip.folder("MenuAR_QR_Codes");

  for (let i = 1; i <= tableCount; i++) {
    const url = `${window.location.origin}/${restaurantSlug}/menu?table=${i}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 1024,
      margin: 2,
      color: {
        dark: '#1A5C3A',
        light: '#FFFFFF'
      }
    });
    
    // Remove prefix to get base64 data
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    folder?.file(`Table_${i}_QR.png`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${restaurantSlug}_QR_Codes.zip`;
  link.click();
}

export async function generateTableQRsPDF(restaurantName: string, restaurantSlug: string, tableCount: number) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const qrSize = 100;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= tableCount; i++) {
    if (i > 1) doc.addPage();

    const url = `${window.location.origin}/${restaurantSlug}/menu?table=${i}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      color: {
        dark: '#1A5C3A',
        light: '#FFFFFF'
      }
    });

    // Add Brand Header
    doc.setFillColor(26, 92, 58); // Primary Color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(restaurantName, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SCAN TO VIEW MENU & ORDER', pageWidth / 2, 30, { align: 'center' });

    // Add QR Code
    const x = (pageWidth - qrSize) / 2;
    const y = (pageHeight - qrSize) / 2;
    doc.addImage(qrDataUrl, 'PNG', x, y, qrSize, qrSize);

    // Add Table Number
    doc.setTextColor(26, 92, 58);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text(`TABLE ${i}`, pageWidth / 2, y + qrSize + 30, { align: 'center' });

    // Add Footer
    doc.setFontSize(8);
    doc.setTextColor(112, 121, 113);
    doc.text('Powered by MenuAR.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save(`${restaurantSlug}_Table_Tents.pdf`);
}

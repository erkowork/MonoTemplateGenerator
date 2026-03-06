import { jsPDF } from "jspdf";
import { TemplateData } from "../types";

/**
 * Generates a 1:1 scale PDF template for a cylinder.
 * Automatically selects A4 or A3 landscape based on the circumference.
 */
export const generatePDF = async (data: TemplateData): Promise<void> => {
  // Simulate a small delay for the "wow" animation in UI
  await new Promise(resolve => setTimeout(resolve, 1500));

  const { circumference, points, unit } = data;
  
  const circumferenceMm: number = unit === 'cm' ? circumference * 10 : circumference;
  const format: 'a4' | 'a3' = circumferenceMm > 267 ? 'a3' : 'a4';
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: format
  });

  const pageWidth: number = doc.internal.pageSize.getWidth();
  const pageHeight: number = doc.internal.pageSize.getHeight();
  
  const startX: number = (pageWidth - circumferenceMm) / 2;
  const startY: number = pageHeight / 2;

  doc.setLineWidth(0.5);
  doc.line(startX, startY, startX + circumferenceMm, startY);

  const stepMm: number = circumferenceMm / points;
  const angleStep: number = 360 / points;

  for (let i = 0; i <= points; i++) {
    const x: number = startX + (i * stepMm);
    const angle: number = i * angleStep;
    
    doc.line(x, startY - 5, x, startY + 5);
    
    doc.setFontSize(8);
    doc.text(`${angle.toFixed(0)}°`, x, startY - 8, { align: 'center' });
    
    if (i < points) {
      const currentPos: number = (i * stepMm) / (unit === 'cm' ? 10 : 1);
      const nextPos: number = ((i + 1) * stepMm) / (unit === 'cm' ? 10 : 1);
      
      doc.setFontSize(6);
      doc.text(`${currentPos.toFixed(2)}${unit}`, x, startY + 8, { align: 'center' });
      
      if (i === points - 1) {
        doc.text(`${nextPos.toFixed(2)}${unit}`, x + stepMm, startY + 8, { align: 'center' });
      }
    }
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Cylinder Marking Template (Scale 1:1)`, 15, 15);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Diameter: ${data.diameter.toFixed(2)}${unit}`, 15, 20);
  doc.text(`Circumference: ${circumference.toFixed(2)}${unit}`, 15, 24);
  doc.text(`Points: ${points} (Step: ${(circumference / points).toFixed(2)}${unit})`, 15, 28);
  
  doc.setTextColor(255, 0, 0);
  doc.text(`IMPORTANT: Print at "Actual Size" (100% Scale). Verify with a ruler.`, 15, 34);

  const fileName = `Cylinder_Template_${data.diameter}${unit}_${points}pts.pdf`;
  doc.save(fileName);
};

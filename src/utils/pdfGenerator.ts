import { jsPDF } from "jspdf";
import { TemplateData, Unit } from "../types";

/**
 * Generates a 1:1 scale PDF template for a cylinder.
 * Automatically selects A4 or A3 landscape based on the circumference.
 */
export const generatePDF = (data: TemplateData): void => {
  const { circumference, points, unit } = data;
  
  // Convert to mm for internal jsPDF calculations (jsPDF default unit)
  const circumferenceMm: number = unit === 'cm' ? circumference * 10 : circumference;
  
  // Determine page size: A4 (297mm) or A3 (420mm)
  // We leave 15mm margin on each side (30mm total)
  const format: 'a4' | 'a3' = circumferenceMm > 267 ? 'a3' : 'a4';
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: format
  });

  const pageWidth: number = doc.internal.pageSize.getWidth();
  const pageHeight: number = doc.internal.pageSize.getHeight();
  
  // Center the line on the page
  const startX: number = (pageWidth - circumferenceMm) / 2;
  const startY: number = pageHeight / 2;

  // Draw the main circumference line
  doc.setLineWidth(0.5);
  doc.line(startX, startY, startX + circumferenceMm, startY);

  // Calculate steps
  const stepMm: number = circumferenceMm / points;
  const angleStep: number = 360 / points;

  // Draw markings and labels
  for (let i = 0; i <= points; i++) {
    const x: number = startX + (i * stepMm);
    const angle: number = i * angleStep;
    
    // Vertical marking line (10mm height)
    doc.line(x, startY - 5, x, startY + 5);
    
    // Angle Label (above the line)
    doc.setFontSize(8);
    doc.text(`${angle.toFixed(0)}°`, x, startY - 8, { align: 'center' });
    
    // Distance Label (below the line, between markings)
    if (i < points) {
      const currentPos: number = (i * stepMm) / (unit === 'cm' ? 10 : 1);
      const nextPos: number = ((i + 1) * stepMm) / (unit === 'cm' ? 10 : 1);
      const midX: number = x + (stepMm / 2);
      
      doc.setFontSize(6);
      doc.text(`${currentPos.toFixed(2)}${unit}`, x, startY + 8, { align: 'center' });
      
      // If it's the last point, also label the end
      if (i === points - 1) {
        doc.text(`${nextPos.toFixed(2)}${unit}`, x + stepMm, startY + 8, { align: 'center' });
      }
    }
  }

  // Header Information
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

  // Save the file
  const fileName = `Cylinder_Template_${data.diameter}${unit}_${points}pts.pdf`;
  doc.save(fileName);
};

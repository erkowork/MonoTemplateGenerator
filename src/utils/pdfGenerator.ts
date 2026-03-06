import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { TemplateData } from "../types";

/**
 * Generates a 1:1 scale PDF template for a cylinder.
 * Stacks multiple segments on a single A3 page if the circumference is long.
 */
export const generatePDF = async (data: TemplateData): Promise<void> => {
  // Simulate a small delay for the "wow" animation in UI
  await new Promise(resolve => setTimeout(resolve, 1500));

  const { circumference, points, unit } = data;
  const circumferenceMm: number = unit === 'cm' ? circumference * 10 : circumference;
  
  // A3 dimensions
  const pageWidth = 420;
  const pageHeight = 297;
  const marginX = 20;
  const marginTop = 40;
  const maxSegmentWidth = pageWidth - (marginX * 2); // 380mm usable width
  
  const numSegments = Math.ceil(circumferenceMm / maxSegmentWidth);
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  });

  const stripHeight = 20; // 2cm thick strip
  const verticalGap = 15; // Gap between stacked strips

  const stepMm: number = circumferenceMm / points;
  const angleStep: number = 360 / points;

  // Header and Info Box (Neutral Style)
  const infoBoxY = 15;
  const infoBoxHeight = 25;
  const infoBoxWidth = 180;
  
  // Draw a light gray box for info
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, infoBoxY, infoBoxWidth, infoBoxHeight, 3, 3, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, infoBoxY, infoBoxWidth, infoBoxHeight, 3, 3, 'D');

  // Title in the box
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Rohr-Markierungsschablone (Maßstab 1:1)`, 22, infoBoxY + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Durchmesser: ${data.diameter.toFixed(2)}${unit} | Umfang: ${circumference.toFixed(2)}${unit} | Punkte: ${points}`, 22, infoBoxY + 15);
  
  doc.setTextColor(180, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`WICHTIG: Drucken Sie A3 bei 100% Skalierung (Tatsächliche Größe). Mit Lineal prüfen!`, 22, infoBoxY + 21);

  // Simple Graphic Representation (Neutral)
  const graphicX = 210;
  const graphicY = 27;
  const graphicSize = 20;
  
  // Draw a circle for cross-section
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.circle(graphicX, graphicY, graphicSize / 2, 'D');
  
  // Draw angle points on the circle
  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const rad = (angle - 90) * (Math.PI / 180);
    const x1 = graphicX + (graphicSize / 2) * Math.cos(rad);
    const y1 = graphicY + (graphicSize / 2) * Math.sin(rad);
    const x2 = graphicX + (graphicSize / 2 + 2) * Math.cos(rad);
    const y2 = graphicY + (graphicSize / 2 + 2) * Math.sin(rad);
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.line(x1, y1, x2, y2);
    
    if (points <= 12) {
      doc.setFontSize(5);
      doc.text(`${angle.toFixed(0)}°`, graphicX + (graphicSize / 2 + 4) * Math.cos(rad), graphicY + (graphicSize / 2 + 4) * Math.sin(rad), { align: 'center' });
    }
  }

  // Draw stacked segments
  for (let s = 0; s < numSegments; s++) {
    const segmentStart = s * maxSegmentWidth;
    const segmentEnd = Math.min((s + 1) * maxSegmentWidth, circumferenceMm);
    const segmentWidth = segmentEnd - segmentStart;
    
    const currentY = marginTop + 15 + (s * (stripHeight + verticalGap));

    // Draw the 2cm strip (rectangle)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(marginX, currentY, segmentWidth, stripHeight);

    // Draw the main center line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(marginX, currentY + (stripHeight / 2), marginX + segmentWidth, currentY + (stripHeight / 2));

    // Draw markers and labels
    for (let i = 0; i <= points; i++) {
      const markerPosMm = i * stepMm;
      
      // Check if marker is in this segment
      if (markerPosMm >= segmentStart && markerPosMm <= segmentEnd) {
        const x = marginX + (markerPosMm - segmentStart);
        const angle = i * angleStep;

        // Draw vertical markers within the 2cm strip
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(x, currentY, x, currentY + stripHeight);
        
        // Angle labels RIGHT of the line
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        // Small offset to the right (2mm)
        doc.text(`${angle.toFixed(0)}°`, x + 1, currentY + 7, { align: 'left' });
        
        // Position labels RIGHT of the line (lower half)
        const currentPos: number = markerPosMm / (unit === 'cm' ? 10 : 1);
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text(`${currentPos.toFixed(2)}${unit}`, x + 1, currentY + 16, { align: 'left' });
      }
    }

    // Cut/Glue indicators
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    if (s < numSegments - 1) {
      // Right side indicator
      doc.setDrawColor(255, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(marginX + segmentWidth, currentY - 2, marginX + segmentWidth, currentY + stripHeight + 2);
      doc.text("SCHNEIDEN & KLEBEN ->", marginX + segmentWidth, currentY - 3, { align: 'right' });
    }
    if (s > 0) {
      // Left side indicator
      doc.setDrawColor(255, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(marginX, currentY - 2, marginX, currentY + stripHeight + 2);
      doc.text("<- HIER KLEBEN", marginX, currentY - 3, { align: 'left' });
    }
  }

  // Add Marking Positions Table
  const tableData = Array.from({ length: points + 1 }).map((_, i) => {
    const angle = (i * 360) / points;
    const pos = (i * stepMm) / (unit === 'cm' ? 10 : 1);
    return [
      `${angle.toFixed(0)}°`,
      `${pos.toFixed(2)} ${unit}`
    ];
  });

  // Position table below segments or at the bottom
  const tableY = marginTop + 15 + (numSegments * (stripHeight + verticalGap)) + 10;
  
  autoTable(doc, {
    startY: tableY,
    head: [['Winkel', 'Position']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1 },
    headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255] }, // Neutral gray for PDF
    margin: { left: marginX },
    tableWidth: 60
  });

  const fileName = `Rohr_Schablone_${data.diameter}${unit}.pdf`;
  doc.save(fileName);
};

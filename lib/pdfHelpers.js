import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateTransactionsPDF(
  transactions,
  accountName,
  selectedMonthLabel
) {
  const doc = new jsPDF();

  // Add Title
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(18);
  doc.text("CashCurve Transaction History", pageWidth / 2, 20, {
    align: "center",
  });

  // Account Name & Selected Month
  doc.setFontSize(12);
  doc.text(`Account: ${accountName}`, pageWidth / 2, 30, { align: "center" });
  doc.text(`Month: ${selectedMonthLabel}`, pageWidth / 2, 38, {
    align: "center",
  });

  // Table headers
  const headers = [["Date", "Description", "Category", "Type", "Amount (INR)"]];

  // Table rows
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString(),
    t.description || "Untitled",
    t.category,
    t.type,
    t.amount.toFixed(2),
  ]);



  // Add total row
  rows.push([
    "", // Empty cell
    "", // Empty cell
    "", // Empty cell
   
  ]);

  // Use autoTable
  autoTable(doc, {
    startY: 50,
    head: headers,
    body: rows,
    styles: {
      fontSize: 10,
      halign: "center",
    },
    headStyles: {
      fillColor: [63, 81, 181], // Indigo
      textColor: [255, 255, 255],
    },
    bodyStyles: {
      textColor: [50, 50, 50],
    },
    didDrawCell: (data) => {
      // Make the Total row bold
      if (data.row.index === rows.length - 1) {
        doc.setFont("helvetica", "bold");
      }
    },
  });

  // Save the PDF
  const fileName = `CashCurve_${accountName}_${selectedMonthLabel}.pdf`.replace(
    /\s+/g,
    "_"
  );
  doc.save(fileName);
}

// src/types/jspdf-extensions.d.ts
import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { // Add this if you use it, like in the example: doc.autoTable.previous.finalY
        finalY?: number;
        // Add other properties you might access from lastAutoTable if needed
    };
    // It seems the property is actually 'previous' based on some versions/docs
    // If you use doc.autoTable.previous.finalY
    autoTablePrevious?: {
        finalY?: number;
    };
    // More commonly used as doc.lastAutoTable.finalY, so the above 'lastAutoTable' is likely more correct
    // For safety, or if versions differ, you might need to check specific jspdf-autotable version docs.
    // The (doc as any).lastAutoTable.finalY approach bypasses this, but typed is better.
    // For recent jspdf-autotable, it might be on the doc object itself: doc.lastAutoTable.finalY
  }
}

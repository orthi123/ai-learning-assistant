import PDFParser from "pdf2json";

/**
 * Extract text from PDF file using pdf2json
 */
export const extractTextFromPDF = async (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1); // 1 means suppress logs

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF Parsing Logic Error:", errData.parserError);
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      // PDF theke text extract kora
      const rawText = pdfParser.getRawTextContent();

      resolve({
        text: rawText || "",
        numPages: pdfData.Pages.length || 0,
        info: pdfData.Meta || {},
      });
    });

    // File load shuru kora
    pdfParser.loadPDF(filePath);
  });
};

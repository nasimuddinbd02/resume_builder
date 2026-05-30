import { saveAs } from 'file-saver';

/**
 * Simple LinkedIn compatible DOCX export.
 * Creates a minimal .docx file containing the resume HTML content.
 * For a production-ready solution you would use a library like `docx` to build proper Word documents.
 */
export async function exportToLinkedInDOCX(
  elementId: string,
  filename: string = 'resume.docx'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  // Grab the innerHTML of the resume preview – LinkedIn can ingest simple formatted text.
  const htmlContent = element.innerHTML;

  // Minimal DOCX structure (WordprocessingML) – this is a very basic template.
  const docxTemplate = `<?xml version="1.0" encoding="UTF-8"?>
  <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
      <w:p>
        <w:r>
          <w:t>${htmlContent.replace(/\n/g, ' ')}</w:t>
        </w:r>
      </w:p>
    </w:body>
  </w:document>`;

  const blob = new Blob([docxTemplate], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  // Use file-saver to trigger download in the browser.
  saveAs(blob, filename);
}

import mammoth from 'mammoth';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractResumeText(
  file: File
): Promise<{ text: string; fileName: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = file.name.toLowerCase();

  let text: string;

  if (fileName.endsWith('.pdf')) {
    text = await extractTextFromPDF(buffer);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    text = await extractTextFromDOCX(buffer);
  } else {
    throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Could not extract any text from the uploaded file.');
  }

  return { text: text.trim(), fileName: file.name };
}

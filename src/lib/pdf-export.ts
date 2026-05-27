'use client';

export async function exportToPDF(
  elementId: string,
  filename: string = 'resume.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  try {
    console.log('PDF-Export: starting import...');
    const html2pdfModule = await import('html2pdf.js');
    console.log('PDF-Export debug: html2pdfModule:', html2pdfModule);
    let html2pdf: any;

    if (typeof html2pdfModule === 'function') {
      html2pdf = html2pdfModule;
    } else if (html2pdfModule && typeof html2pdfModule.default === 'function') {
      html2pdf = html2pdfModule.default;
    } else if (html2pdfModule && html2pdfModule.default && typeof (html2pdfModule.default as any).default === 'function') {
      html2pdf = (html2pdfModule.default as any).default;
    } else if (html2pdfModule && typeof (html2pdfModule as any).html2pdf === 'function') {
      html2pdf = (html2pdfModule as any).html2pdf;
    } else {
      console.error('Failed to resolve html2pdf function. Module structure:', html2pdfModule);
      throw new Error('html2pdf library could not be resolved. Please check the browser console.');
    }


    const options = {
      margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait' as const,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    await html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error('Error during PDF export:', error);
    throw error;
  }
}

export function exportToDOCX(
  elementId: string,
  filename: string = 'resume.doc'
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  // Clone to avoid modifying the live preview DOM
  const cloned = element.cloneNode(true) as HTMLElement;

  // Replace SVGs with text/unicode symbols
  const svgs = cloned.querySelectorAll('svg');
  svgs.forEach((svg) => {
    let symbol = '•';
    const html = svg.innerHTML || '';
    if (svg.classList.contains('lucide-mail') || html.includes('M4 4h16') || (html.includes('rect') && html.includes('path'))) {
      symbol = '✉';
    } else if (svg.classList.contains('lucide-phone') || html.includes('M22 16.92') || (html.includes('path') && (html.includes('1.23') || html.includes('1.85')))) {
      symbol = '📞';
    } else if (svg.classList.contains('lucide-map-pin') || html.includes('M20 10c0 6') || (html.includes('circle') && html.includes('path'))) {
      symbol = '📍';
    } else if (svg.classList.contains('lucide-globe') || html.includes('circle cx="12" cy="12" r="10"')) {
      symbol = '🌐';
    } else if (html.includes('M16 8a6 6 0')) { // Linkedin
      symbol = 'LinkedIn:';
    } else if (html.includes('M15 22v-4a')) { // Github
      symbol = 'GitHub:';
    }
    const textNode = document.createTextNode(symbol + ' ');
    svg.parentNode?.replaceChild(textNode, svg);
  });

  // Detect structure & construct table-based multi-column layout for Word
  const aside = cloned.querySelector('aside');
  const main = cloned.querySelector('main');
  
  let bodyContent = '';
  
  if (aside && main) {
    // Two-column layout with sidebar (ModernTemplate)
    const sidebarBg = '#1e1b4b';
    const sidebarColor = '#e8e4f8';
    
    bodyContent = `
      <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        <tr>
          <!-- Sidebar (30% width) -->
          <td style="width: 30%; background-color: ${sidebarBg}; color: ${sidebarColor}; padding: 18pt 15pt; vertical-align: top; font-family: 'Arial', sans-serif;">
            <div style="color: ${sidebarColor};">
              ${aside.innerHTML}
            </div>
          </td>
          <!-- Main Content (70% width) -->
          <td style="width: 70%; background-color: #ffffff; color: #1a1a1a; padding: 18pt 20pt; vertical-align: top; font-family: 'Arial', sans-serif;">
            <div>
              ${main.innerHTML}
            </div>
          </td>
        </tr>
      </table>
    `;
  } else {
    const header = cloned.querySelector('header');
    const columnsContainer = header ? header.nextElementSibling : null;
    
    if (header && columnsContainer && columnsContainer.children.length >= 2) {
      // Two-column layout (MinimalTemplate)
      const leftCol = columnsContainer.children[0];
      const rightCol = columnsContainer.children[1];
      
      bodyContent = `
        <div style="font-family: 'Arial', sans-serif;">
          ${header.outerHTML}
          <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-top: 10pt; table-layout: fixed;">
            <tr>
              <!-- Left Column (28% width) -->
              <td style="width: 28%; padding-right: 12pt; vertical-align: top; font-family: 'Arial', sans-serif;">
                ${leftCol.innerHTML}
              </td>
              <!-- Right Column (72% width) -->
              <td style="width: 72%; padding-left: 12pt; vertical-align: top; font-family: 'Arial', sans-serif;">
                ${rightCol.innerHTML}
              </td>
            </tr>
          </table>
        </div>
      `;
    } else {
      // Single column layout (ExecutiveTemplate or fallback)
      bodyContent = cloned.innerHTML;
    }
  }

  // Wrap HTML content in standard Office HTML formatting to make it natively readable by MS Word
  const docHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Resume Document</title>
      <style>
        @page {
          size: 8.5in 11.0in;
          margin: 0.75in 0.75in 0.75in 0.75in;
        }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 10.5pt;
          line-height: 1.35;
          color: #111111;
        }
        h1, h2, h3, h4 {
          font-family: 'Arial', sans-serif;
          margin-top: 12pt;
          margin-bottom: 6pt;
          color: #1e1b4b;
        }
        h1 { font-size: 18pt; font-weight: bold; margin-top: 0; }
        h2 { font-size: 13pt; font-weight: bold; border-bottom: 1.5pt solid #7c3aed; padding-bottom: 2pt; text-transform: uppercase; }
        h3 { font-size: 11pt; font-weight: bold; }
        p, ul, li { margin-top: 0; margin-bottom: 6pt; }
        ul { margin-left: 18pt; padding-left: 0; }
        li { list-style-type: disc; }
        table { border-collapse: collapse; width: 100%; }
        td { padding: 4px; vertical-align: top; }
        .text-muted { color: #666666; }
      </style>
    </head>
    <body>
      ${bodyContent}
    </body>
    </html>
  `;


  const blob = new Blob(['\ufeff' + docHtml], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

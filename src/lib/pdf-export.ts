'use client';

export async function exportToPDF(
  elementId: string,
  filename: string = 'resume.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }

  const originalTitle = document.title;
  // Temporarily change title so the default saved PDF filename matches
  document.title = filename.replace('.pdf', '');

  // Deeply clone the target element to avoid parent styles/transforms affecting the print layout
  const printId = 'print-section-root';
  const cloned = element.cloneNode(true) as HTMLElement;
  
  // Calculate the target height to force the background to extend to the bottom of the last page
  const contentHeight = element.offsetHeight;
  const pageHeightPx = 11 * 96; // 11 inches total height for PDF
  const pages = Math.ceil(contentHeight / pageHeightPx);
  const targetHeight = pages * pageHeightPx;
  cloned.style.minHeight = `${targetHeight}px`;

  cloned.id = printId;
  document.body.appendChild(cloned);
  
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body > *:not(#${printId}) {
        display: none !important;
      }
      body > #${printId} {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 8.5in !important;
        min-height: 11in !important;
        margin: 0 !important;
        /* Reset any scaling used for previewing */
        transform: none !important;
        box-shadow: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > #${printId} * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page {
        size: letter portrait;
        margin: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Slight delay to ensure styles are applied
  await new Promise(resolve => setTimeout(resolve, 150));
  
  window.print();
  
  // Cleanup
  document.head.removeChild(style);
  document.body.removeChild(cloned);
  document.title = originalTitle;
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
    if (svg.classList.contains('contact-icon-mail') || svg.classList.contains('lucide-mail') || html.includes('M4 4h16')) {
      symbol = '✉';
    } else if (svg.classList.contains('contact-icon-phone') || svg.classList.contains('lucide-phone') || html.includes('M22 16.92')) {
      symbol = '📞';
    } else if (svg.classList.contains('contact-icon-mappin') || svg.classList.contains('lucide-map-pin') || html.includes('M20 10c0 6')) {
      symbol = '📍';
    } else if (svg.classList.contains('contact-icon-globe') || svg.classList.contains('lucide-globe') || html.includes('circle cx="12" cy="12" r="10"')) {
      symbol = '🌐';
    } else if (svg.classList.contains('contact-icon-linkedin') || html.includes('M16 8a6 6 0')) { // Linkedin
      symbol = 'LinkedIn:';
    } else if (svg.classList.contains('contact-icon-github') || html.includes('M15 22v-4a')) { // Github
      symbol = 'GitHub:';
    }
    const textNode = document.createTextNode(symbol + ' ');
    svg.parentNode?.replaceChild(textNode, svg);
  });

  // Fix concatenated spans (skills & technologies badges)
  const spans = cloned.querySelectorAll('span');
  spans.forEach((span) => {
    const styleAttr = span.getAttribute('style') || '';
    if (styleAttr.includes('background-color') || styleAttr.includes('rgba') || styleAttr.includes('border') || styleAttr.includes('badge')) {
      span.innerHTML = span.innerHTML.trim() + ' &nbsp;&nbsp;';
      span.style.backgroundColor = 'transparent';
      span.style.border = 'none';
      span.style.padding = '0';
    }
  });

  // Detect structure & construct table-based multi-column layout for Word
  const aside = cloned.querySelector('aside');
  const main = cloned.querySelector('main');
  
  let bodyContent = '';
  
  if (aside && main) {
    // Two-column layout with sidebar (ModernTemplate)
    const sidebarBg = '#1e1b4b';
    const sidebarColor = '#e8e4f8';
    
    // Calculate the target height to force the sidebar to extend to the bottom of the last page in MS Word
    const contentHeight = element.offsetHeight;
    const pageHeightPx = 10 * 96; // 10 inches printable height (11in - 1in margins)
    const pages = Math.ceil(contentHeight / pageHeightPx);
    const targetHeight = (pages * pageHeightPx) - 48; // Subtract a small safety margin to prevent a blank extra page

    
    bodyContent = `
      <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; table-layout: auto;">
        <tr>
          <!-- Sidebar (Auto width) -->
          <td style="height: ${targetHeight}px; width: 1%; background-color: ${sidebarBg}; color: ${sidebarColor}; padding: 18pt 15pt; vertical-align: top; font-family: 'Arial', sans-serif;">
            <div style="color: ${sidebarColor};">
              ${aside.innerHTML}
            </div>
          </td>
          <!-- Main Content (Remaining width) -->
          <td style="width: 100%; background-color: #ffffff; color: #1a1a1a; padding: 18pt 20pt; vertical-align: top; font-family: 'Arial', sans-serif;">
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
        @page WordSection1 {
          size: 8.5in 11.0in;
          margin: 0.5in 0.5in 0.5in 0.5in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
          mso-paper-source: 0;
        }
        div.WordSection1 { page: WordSection1; }
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
        ul { margin-left: 10pt; padding-left: 0; }
        li { list-style-type: disc; }
        table { border-collapse: collapse; width: 100%; }
        td { padding: 4px; vertical-align: top; }
        .text-muted { color: #666666; }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        ${bodyContent}
      </div>
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

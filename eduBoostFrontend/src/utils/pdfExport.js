import html2pdf from 'html2pdf.js';

/**
 * Capture an HTML element and generate a paginated PDF
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} filename - The output PDF filename
 */
export const exportHtmlToPdf = async (element, filename) => {
  try {
    // Add a temporary class to format it for printing if needed
    element.classList.add('pdf-exporting');
    
    // Give external fonts and MathJax a brief moment to stabilize if they were re-rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    const opt = {
      margin:       [20, 15, 20, 15], // Top, Right, Bottom, Left margins in mm
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        logging: false,
        windowWidth: 1200, // Forces standard width instead of mobile width
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { 
        mode: ['css', 'legacy'],
        avoid: '.q-item' // Prevents page breaks inside any element with class string 'q-item'
      }
    };

    await html2pdf().set(opt).from(element).save();

    element.classList.remove('pdf-exporting');
    return true;
  } catch (error) {
    element.classList.remove('pdf-exporting');
    console.error("PDF Export failed", error);
    throw error;
  }
};

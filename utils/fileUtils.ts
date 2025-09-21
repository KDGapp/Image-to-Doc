// This makes TypeScript aware of the jsPDF global variable from the CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

const createDownloadLink = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export const downloadTxt = (text: string) => {
  const blob = new Blob([text], { type: 'text/plain' });
  createDownloadLink(blob, 'document.txt');
};

export const downloadDoc = (text: string) => {
  const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
        "xmlns:w='urn:schemas-microsoft-com:office:word' "+
        "xmlns='http://www.w3.org/TR/REC-html40'>"+
        "<head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
  const footer = "</body></html>";
  const sourceHTML = header + text.replace(/\n/g, '<br/>') + footer;
  const blob = new Blob([sourceHTML], { type: 'application/msword' });
  createDownloadLink(blob, 'document.doc');
};

export const downloadPdf = (text: string) => {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, 10, 10);
        doc.save('document.pdf');
    } catch(e) {
        alert('Failed to create PDF. Please ensure the jsPDF library is loaded correctly.');
        console.error(e);
    }
};
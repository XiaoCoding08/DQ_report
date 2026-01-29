import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is loaded - simplified for Vite
// In some setups need to point to public assets or use import
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
// Or easier for local dev if node_modules resolution works, but browser needs the file.
// A safe bet for Vite is using the import for worker.
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;


export async function parseFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();

    try {
        if (['docx', 'doc'].includes(extension)) {
            return await parseDocx(file);
        } else if (extension === 'pdf') {
            return await parsePdf(file);
        } else if (['txt', 'md', 'json'].includes(extension)) {
            return await parseText(file);
        } else {
            return {
                type: 'unknown',
                content: `<p>Unsupported file type: .${extension}</p>`
            };
        }
    } catch (error) {
        console.error('File parsing error:', error);
        return {
            type: 'error',
            content: `<p class="text-red-500">Error parsing file: ${error.message}</p>`
        };
    }
}

// 1. DOCX Parsing
async function parseDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return {
        type: 'html',
        content: result.value // The generated HTML
    };
}

// 2. PDF Parsing (Text Extraction)
async function parsePdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `<h3>Page ${i}</h3><p>${pageText}</p>`;
    }

    // Add some simple formatting
    fullText = `<div class="pdf-content">${fullText}</div>`;

    return {
        type: 'html', // Treated as HTML for consistency
        content: fullText
    };
}

// 3. Text Parsing
function parseText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            // Convert newlines to breaks for HTML display
            const html = text.replace(/\n/g, '<br>');
            resolve({
                type: 'html',
                content: `<div class="text-content font-mono text-sm">${html}</div>`
            });
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

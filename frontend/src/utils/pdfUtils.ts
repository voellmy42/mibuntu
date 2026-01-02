import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to a specific version from CDN to avoid build issues with Vite
// We'll update this to match the installed version if needed, or use a reliable CDN link
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPdf(urlOrData: string | ArrayBuffer): Promise<string> {
    try {
        const loadingTask = pdfjsLib.getDocument(urlOrData);
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((item: any) => item.str)
                .join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        return fullText;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

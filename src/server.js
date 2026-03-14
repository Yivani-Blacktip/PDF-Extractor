/**
 * PDF Text Extractor - Server
 * 
 * A simple Express server for extracting text from PDF files.
 * 
 * Author: Yivani
 * Website: https://yivani.dev
 * Contact: contact@yivani.dev
 * 
 * @version 1.0.0
 */

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (development mode)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Parse JSON request bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Configure file upload storage
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Filter to accept only PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB per file
});

/**
 * Extract text from multiple PDF files
 * POST /api/extract-pdfs
 * Accepts up to 100 PDF files
 */
app.post('/api/extract-pdfs', upload.array('pdfs', 100), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No PDF files uploaded' });
        }
        
        console.log(`[${new Date().toISOString()}] Processing ${req.files.length} files...`);

        const results = [];
        let totalTextLength = 0;

        // Process each uploaded PDF file
        for (const file of req.files) {
            try {
                const dataBuffer = fs.readFileSync(file.path);
                const pdfData = await pdfParse(dataBuffer);
                
                const result = {
                    filename: file.originalname,
                    text: pdfData.text || '',
                    pages: pdfData.numpages || 1,
                    info: {},
                    textLength: (pdfData.text || '').length
                };

                results.push(result);
                totalTextLength += result.textLength;

                // Clean up uploaded file after processing
                fs.unlinkSync(file.path);
                
                console.log(`[SUCCESS] ${file.originalname}: ${result.pages} pages, ${result.textLength} chars`);
                
            } catch (err) {
                console.error(`[ERROR] Failed to process ${file.originalname}:`, err.message);
                results.push({
                    filename: file.originalname,
                    error: 'Failed to parse PDF - file may be corrupted or password protected',
                    text: '',
                    pages: 0,
                    textLength: 0
                });
                // Attempt cleanup even on error
                try { fs.unlinkSync(file.path); } catch (e) {}
            }
        }

        // Combine all extracted text with markdown-style separators
        const combinedText = results
            .filter(r => !r.error)
            .map(r => `## ${r.filename}\n\n${r.text}`)
            .join('\n\n---\n\n');

        // Send success response with extracted data
        res.json({
            success: true,
            totalFiles: req.files.length,
            successfulExtractions: results.filter(r => !r.error).length,
            failedExtractions: results.filter(r => r.error).length,
            totalPages: results.reduce((sum, r) => sum + (r.pages || 0), 0),
            totalCharacters: totalTextLength,
            results: results,
            combinedText: combinedText
        });

    } catch (error) {
        console.error('[SERVER ERROR]', error);
        res.status(500).json({ error: 'Internal server error. Please try again with fewer files.' });
    }
});

// Global error handler for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 50MB)' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files (max 100)' });
        }
    }
    console.error('[ERROR]', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║     PDF Text Extractor Server          ║
    ║                                        ║
    ║     Created by: Yivani                 ║
    ║     Website: https://yivani.dev        ║
    ║     Contact: contact@yivani.dev        ║
    ║                                        ║
    ║     Server running on port: ${PORT}        ║
    ╚════════════════════════════════════════╝
    `);
});

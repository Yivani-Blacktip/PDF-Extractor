/**
 * PDF Text Extractor - Frontend Application
 * 
 * Handles file upload, PDF processing, search/replace functionality,
 * and text transformations.
 * 
 * Author: Yivani
 * Website: https://yivani.dev
 * Contact: contact@yivani.dev
 * 
 * @version 1.0.0
 */

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

// Upload section elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileSection = document.getElementById('fileSection');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');
const fileClear = document.getElementById('fileClear');
const actionBar = document.getElementById('actionBar');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');

// Navigation elements
const topNav = document.getElementById('topNav');
const topNewUploadBtn = document.getElementById('topNewUploadBtn');
const newUploadBtn = document.getElementById('newUploadBtn');

// View containers
const uploadView = document.getElementById('uploadView');
const processingView = document.getElementById('processingView');
const resultsView = document.getElementById('resultsView');
const processingStatus = document.getElementById('processingStatus');
const progressFill = document.getElementById('progressFill');

// Results display elements
const statFiles = document.getElementById('statFiles');
const statPages = document.getElementById('statPages');
const statChars = document.getElementById('statChars');
const successBadge = document.getElementById('successBadge');
const filesList = document.getElementById('filesList');
const resultText = document.getElementById('resultText');
const charCount = document.getElementById('charCount');

// Search toolbar elements
const searchToolbar = document.getElementById('searchToolbar');
const searchBtn = document.getElementById('searchBtn');
const closeSearch = document.getElementById('closeSearch');
const findInput = document.getElementById('findInput');
const replaceInput = document.getElementById('replaceInput');
const replaceRow = document.getElementById('replaceRow');
const toggleReplace = document.getElementById('toggleReplace');
const findPrev = document.getElementById('findPrev');
const findNext = document.getElementById('findNext');
const matchCount = document.getElementById('matchCount');
const replaceOne = document.getElementById('replaceOne');
const replaceAll = document.getElementById('replaceAll');
const deleteCurrentMatch = document.getElementById('deleteCurrentMatch');

// Transform buttons
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const toLower = document.getElementById('toLower');
const toUpper = document.getElementById('toUpper');
const toTitle = document.getElementById('toTitle');
const removeLines = document.getElementById('removeLines');
const removeMatches = document.getElementById('removeMatches');

// Floating scroll buttons
const goTop = document.getElementById('goTop');
const goBottom = document.getElementById('goBottom');

// Action buttons
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// ============================================
// APPLICATION STATE
// ============================================

let selectedFiles = [];
let isProcessing = false;
let matches = [];
let currentMatch = -1;
let originalText = '';
let searchDebounceTimer = null;

// Undo/Redo state
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 50;

// ============================================
// EVENT LISTENERS - UPLOAD SECTION
// ============================================

dropzone.addEventListener('click', () => {
    if (!isProcessing) fileInput.click();
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
    dropzone.addEventListener(event, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(event => {
    dropzone.addEventListener(event, () => {
        if (!isProcessing) dropzone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(event => {
    dropzone.addEventListener(event, () => {
        dropzone.classList.remove('dragover');
    }, false);
});

dropzone.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFiles);
uploadBtn.addEventListener('click', uploadFiles);
clearBtn.addEventListener('click', resetUpload);
fileClear.addEventListener('click', resetUpload);

// ============================================
// EVENT LISTENERS - NAVIGATION
// ============================================

topNewUploadBtn.addEventListener('click', resetApp);
newUploadBtn.addEventListener('click', resetApp);

// ============================================
// EVENT LISTENERS - SEARCH FUNCTIONALITY
// ============================================

searchBtn.addEventListener('click', openSearch);
closeSearch.addEventListener('click', closeSearchBox);
findInput.addEventListener('input', findText);
findInput.addEventListener('keydown', handleFindKeydown);
findPrev.addEventListener('click', () => navigateMatch(-1));
findNext.addEventListener('click', () => navigateMatch(1));
toggleReplace.addEventListener('click', () => {
    replaceRow.style.display = replaceRow.style.display === 'none' ? 'flex' : 'none';
});
replaceOne.addEventListener('click', replaceCurrent);
replaceAll.addEventListener('click', replaceAllMatches);
deleteCurrentMatch.addEventListener('click', deleteCurrentMatchFn);

// ============================================
// EVENT LISTENERS - TEXT TRANSFORMATIONS
// ============================================

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
toLower.addEventListener('click', () => transformText('lower'));
toUpper.addEventListener('click', () => transformText('upper'));
toTitle.addEventListener('click', () => transformText('title'));
removeLines.addEventListener('click', removeEmptyLines);
removeMatches.addEventListener('click', removeAllMatches);

// Track text changes for undo/redo
resultText.addEventListener('input', () => {
    saveState();
    updateUndoRedoButtons();
});

// ============================================
// EVENT LISTENERS - SCROLL BUTTONS
// ============================================

goTop.addEventListener('click', () => {
    resultText.scrollTo({ top: 0, behavior: 'smooth' });
    resultText.focus();
    updateFloatingButtons();
});

goBottom.addEventListener('click', () => {
    resultText.scrollTo({ top: resultText.scrollHeight, behavior: 'smooth' });
    resultText.focus();
    updateFloatingButtons();
});

// Throttled scroll listener for button state updates
let scrollTimeout;
resultText.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
        updateFloatingButtons();
        scrollTimeout = null;
    }, 50);
});

// ============================================
// EVENT LISTENERS - CLIPBOARD ACTIONS
// ============================================

copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadText);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + F to open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        openSearch();
    }
    // Ctrl/Cmd + Z to undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    }
    // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z to redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
    }
    // Escape to close search
    if (e.key === 'Escape' && searchToolbar.style.display !== 'none') {
        closeSearchBox();
    }
});

// ============================================
// FILE HANDLING FUNCTIONS
// ============================================

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    if (isProcessing) return;
    addFiles(Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf'));
}

function handleFiles(e) {
    if (isProcessing) return;
    addFiles(Array.from(e.target.files));
}

function addFiles(files) {
    // Validate files
    const validFiles = files.filter(file => {
        if (file.type !== 'application/pdf') {
            showToast(`${file.name} is not a PDF`, 'error');
            return false;
        }
        if (file.size > 50 * 1024 * 1024) {
            showToast(`${file.name} exceeds 50MB limit`, 'error');
            return false;
        }
        return true;
    });

    // Filter out duplicates
    const newFiles = validFiles.filter(file => 
        !selectedFiles.some(f => f.name === file.name && f.size === file.size)
    );

    if (newFiles.length < validFiles.length) {
        showToast('Some files were already selected', 'info');
    }

    // Enforce 100 file limit
    if (selectedFiles.length + newFiles.length > 100) {
        showToast('Maximum 100 files allowed', 'error');
        selectedFiles = [...selectedFiles, ...newFiles.slice(0, 100 - selectedFiles.length)];
    } else {
        selectedFiles = [...selectedFiles, ...newFiles];
    }

    renderFileList();
    updateUI();
}

function renderFileList() {
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }

    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <svg class="file-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <div class="file-info">
                <div class="file-name">${escapeHtml(file.name)}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" data-index="${index}" title="Remove">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `).join('');

    // Attach remove button handlers
    fileList.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFiles.splice(parseInt(btn.dataset.index), 1);
            renderFileList();
            updateUI();
        });
    });
}

function updateUI() {
    const hasFiles = selectedFiles.length > 0;
    fileSection.style.display = hasFiles ? 'flex' : 'none';
    actionBar.style.display = hasFiles ? 'flex' : 'none';
    if (hasFiles) {
        fileCount.textContent = `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected`;
    }
}

function resetUpload() {
    selectedFiles = [];
    fileInput.value = '';
    renderFileList();
    updateUI();
}

function resetApp() {
    resetUpload();
    resultText.value = '';
    originalText = '';
    undoStack = [];
    redoStack = [];
    updateUndoRedoButtons();
    closeSearchBox();
    topNav.style.display = 'none';
    showView('upload');
}

// ============================================
// UPLOAD & PROCESSING
// ============================================

async function uploadFiles() {
    if (selectedFiles.length === 0 || isProcessing) return;

    isProcessing = true;
    showView('processing');
    
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('pdfs', file));

    // Animate progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 12, 85);
        progressFill.style.width = `${progress}%`;
    }, 300);

    try {
        processingStatus.textContent = 'Uploading files...';
        
        const apiUrl = window.location.port === '3000' 
            ? '/api/extract-pdfs' 
            : 'http://localhost:3000/api/extract-pdfs';

        processingStatus.textContent = 'Extracting text...';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        progressFill.style.width = '100%';

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Processing failed' }));
            throw new Error(error.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        await new Promise(r => setTimeout(r, 200));
        
        originalText = data.combinedText || '';
        displayResults(data);
        
        // Initialize undo stack with original text
        undoStack = [];
        redoStack = [];
        saveState();
        
        topNav.style.display = 'block';
        showView('results');
        showToast(`Extracted text from ${data.successfulExtractions} files`, 'success');
        
    } catch (error) {
        clearInterval(progressInterval);
        let message = 'Failed to process files';
        if (error.name === 'AbortError') message = 'Request timed out. Try with fewer files.';
        else if (error.message) message = error.message;
        showToast(message, 'error');
        showView('upload');
    } finally {
        isProcessing = false;
    }
}

function displayResults(data) {
    // Update statistics
    statFiles.textContent = data.totalFiles;
    statPages.textContent = data.totalPages;
    statChars.textContent = formatNumber(data.totalCharacters);
    successBadge.textContent = `${data.successfulExtractions}/${data.totalFiles}`;
    
    // Update text content
    resultText.value = data.combinedText || '';
    charCount.textContent = `${formatNumber((data.combinedText || '').length)} chars`;

    // Update file list
    filesList.innerHTML = data.results.map(result => `
        <div class="file-result ${result.error ? 'error' : 'success'}">
            <div class="file-result-name" title="${escapeHtml(result.filename)}">${escapeHtml(result.filename)}</div>
            <div class="file-result-meta">
                ${result.error ? 'Processing failed' : `${result.pages} pages • ${formatNumber(result.textLength)} chars`}
            </div>
        </div>
    `).join('');
    
    // Initialize floating buttons state after a short delay
    setTimeout(updateFloatingButtons, 100);
}

function showView(viewName) {
    uploadView.style.display = 'none';
    processingView.style.display = 'none';
    resultsView.style.display = 'none';

    if (viewName === 'upload') uploadView.style.display = 'block';
    else if (viewName === 'processing') processingView.style.display = 'flex';
    else if (viewName === 'results') resultsView.style.display = 'flex';
}

// ============================================
// SEARCH & REPLACE FUNCTIONS
// ============================================

function openSearch() {
    searchToolbar.style.display = 'block';
    findInput.focus();
    findInput.select();
    if (findInput.value) findText();
}

function closeSearchBox() {
    searchToolbar.style.display = 'none';
    replaceRow.style.display = 'none';
    matchCount.textContent = '';
}

function handleFindKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) navigateMatch(-1);
        else navigateMatch(1);
    }
}

function findText() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        performSearch();
    }, 50);
}

function performSearch() {
    const query = findInput.value;
    if (!query) { 
        matchCount.textContent = ''; 
        matches = [];
        currentMatch = -1;
        return; 
    }
    
    const text = resultText.value;
    matches = [];
    
    // First try: exact search with proper escaping
    const escapedQuery = escapeRegex(query);
    const regex = new RegExp(escapedQuery, 'gi');
    
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length });
        if (match.index === regex.lastIndex) regex.lastIndex++;
    }
    
    // Second try: normalize whitespace (treat multiple spaces/tabs/newlines as single space)
    if (matches.length === 0 && /\s/.test(query)) {
        const normalizedQuery = escapeRegex(query).replace(/\s+/g, '\\s+');
        const normalizedRegex = new RegExp(normalizedQuery, 'gi');
        
        while ((match = normalizedRegex.exec(text)) !== null) {
            matches.push({ start: match.index, end: match.index + match[0].length });
            if (match.index === normalizedRegex.lastIndex) normalizedRegex.lastIndex++;
        }
    }
    
    // Third try: flexible whitespace search (for text with line breaks)
    if (matches.length === 0 && /\s/.test(query)) {
        const noSpaceQuery = escapeRegex(query.replace(/\s+/g, ''));
        const flexibleRegex = new RegExp(noSpaceQuery.split('').join('\\s*'), 'gi');
        
        while ((match = flexibleRegex.exec(text)) !== null) {
            // Only add if match is reasonably close in length to avoid false positives
            const matchLength = match[0].length;
            const queryLength = query.length;
            if (matchLength >= queryLength * 0.8 && matchLength <= queryLength * 1.2) {
                matches.push({ start: match.index, end: match.index + match[0].length });
            }
            if (match.index === flexibleRegex.lastIndex) flexibleRegex.lastIndex++;
        }
    }
    
    if (matches.length > 0) {
        matchCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;
        currentMatch = 0;
        highlightCurrentMatch();
    } else {
        matchCount.textContent = 'No matches';
        currentMatch = -1;
    }
}

function highlightCurrentMatch() {
    if (matches.length === 0 || currentMatch < 0) return;
    
    const match = matches[currentMatch];
    resultText.focus();
    resultText.setSelectionRange(match.start, match.end);
    scrollToMatch(currentMatch);
    matchCount.textContent = `${currentMatch + 1} of ${matches.length}`;
}

function navigateMatch(direction) {
    if (matches.length === 0) return;
    currentMatch = (currentMatch + direction + matches.length) % matches.length;
    highlightCurrentMatch();
}

function scrollToMatch(index) {
    if (matches.length === 0) return;
    const match = matches[index];
    const text = resultText.value;
    
    // Calculate line number for scrolling
    const linesBefore = text.substring(0, match.start).split('\n');
    const lineNumber = linesBefore.length;
    const lineHeight = 21;
    const scrollPos = Math.max(0, (lineNumber - 5) * lineHeight);
    
    resultText.scrollTo({ top: scrollPos, behavior: 'smooth' });
}

function replaceCurrent() {
    if (matches.length === 0 || currentMatch < 0) {
        showToast('No match selected', 'error');
        return;
    }
    
    saveState();
    const match = matches[currentMatch];
    const replaceStr = replaceInput.value;
    const text = resultText.value;
    
    resultText.value = text.substring(0, match.start) + replaceStr + text.substring(match.end);
    performSearch();
    showToast('Replaced', 'success');
}

function replaceAllMatches() {
    const findStr = findInput.value;
    if (!findStr) {
        showToast('Enter search term first', 'error');
        return;
    }
    
    // Make sure we have current matches
    if (matches.length === 0) {
        performSearch();
    }
    
    if (matches.length === 0) {
        showToast('No matches found', 'error');
        return;
    }
    
    saveState();
    const replaceStr = replaceInput.value;
    let text = resultText.value;
    const totalMatches = matches.length;
    
    // Replace from end to start so indices don't shift
    for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        text = text.substring(0, match.start) + replaceStr + text.substring(match.end);
    }
    
    resultText.value = text;
    matches = [];
    currentMatch = -1;
    matchCount.textContent = '';
    showToast(`Replaced ${totalMatches} matches`, 'success');
}

function removeAllMatches() {
    const findStr = findInput.value;
    if (!findStr) { 
        showToast('Enter search term first', 'error'); 
        return; 
    }
    
    // Make sure we have current matches
    if (matches.length === 0) {
        performSearch();
    }
    
    if (matches.length === 0) {
        showToast('No matches found', 'error');
        return;
    }
    
    saveState();
    let text = resultText.value;
    const totalMatches = matches.length;
    
    // Remove from end to start so indices don't shift
    for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        text = text.substring(0, match.start) + text.substring(match.end);
    }
    
    resultText.value = text;
    matches = [];
    currentMatch = -1;
    matchCount.textContent = '';
    showToast(`Removed ${totalMatches} matches`, 'success');
}

function deleteCurrentMatchFn() {
    if (matches.length === 0 || currentMatch < 0) {
        // Try to search first
        performSearch();
        if (matches.length === 0) {
            showToast('No match to delete', 'error');
            return;
        }
    }
    
    saveState();
    const match = matches[currentMatch];
    const text = resultText.value;
    const oldTotal = matches.length;
    
    // Remove this match only
    resultText.value = text.substring(0, match.start) + text.substring(match.end);
    
    // Recalculate matches
    performSearch();
    const newTotal = matches.length;
    
    // Show progress like "Deleted 1 of 39, 38 remaining"
    if (newTotal > 0) {
        // Stay at same index
        currentMatch = Math.min(currentMatch, newTotal - 1);
        highlightCurrentMatch();
        showToast(`Deleted 1 of ${oldTotal} (${newTotal} remaining)`, 'success');
    } else {
        currentMatch = -1;
        showToast(`Deleted last match (${oldTotal} total)`, 'success');
    }
}

// ============================================
// TEXT TRANSFORMATION FUNCTIONS
// ============================================

function transformText(type) {
    const text = resultText.value;
    if (!text) return;
    
    saveState();
    let transformed = text;
    switch(type) {
        case 'lower': transformed = text.toLowerCase(); break;
        case 'upper': transformed = text.toUpperCase(); break;
        case 'title': transformed = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()); break;
    }
    
    resultText.value = transformed;
    showToast(`Converted to ${type}case`, 'success');
}

function removeEmptyLines() {
    const text = resultText.value;
    if (!text) return;
    
    const lines = text.split('\n');
    const nonEmpty = lines.filter(line => line.trim() !== '');
    const removed = lines.length - nonEmpty.length;
    
    if (removed === 0) { showToast('No empty lines found', 'info'); return; }
    
    saveState();
    resultText.value = nonEmpty.join('\n');
    showToast(`Removed ${removed} empty lines`, 'success');
}

// ============================================
// UNDO / REDO FUNCTIONS
// ============================================

function saveState() {
    const currentText = resultText.value;
    // Don't save if same as last state
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === currentText) {
        return;
    }
    undoStack.push(currentText);
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }
    redoStack = []; // Clear redo stack on new change
    updateUndoRedoButtons();
}

function undo() {
    if (undoStack.length === 0) return;
    
    // Save current state to redo stack
    redoStack.push(resultText.value);
    if (redoStack.length > MAX_HISTORY) {
        redoStack.shift();
    }
    
    // Restore previous state
    const previousState = undoStack.pop();
    resultText.value = previousState;
    
    updateUndoRedoButtons();
    showToast('Undo', 'success');
}

function redo() {
    if (redoStack.length === 0) return;
    
    // Save current state to undo stack
    undoStack.push(resultText.value);
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }
    
    // Restore next state
    const nextState = redoStack.pop();
    resultText.value = nextState;
    
    updateUndoRedoButtons();
    showToast('Redo', 'success');
}

function updateUndoRedoButtons() {
    undoBtn.disabled = undoStack.length === 0;
    undoBtn.style.opacity = undoStack.length === 0 ? '0.5' : '1';
    redoBtn.disabled = redoStack.length === 0;
    redoBtn.style.opacity = redoStack.length === 0 ? '0.5' : '1';
}

// ============================================
// FLOATING BUTTONS STATE
// ============================================

function updateFloatingButtons() {
    const { scrollTop, scrollHeight, clientHeight } = resultText;
    const canScroll = scrollHeight > clientHeight;
    const atTop = scrollTop < 50;
    const atBottom = scrollTop + clientHeight > scrollHeight - 50;
    
    goTop.style.opacity = canScroll && !atTop ? '1' : '0.3';
    goTop.style.pointerEvents = canScroll && !atTop ? 'auto' : 'none';
    
    goBottom.style.opacity = canScroll && !atBottom ? '1' : '0.3';
    goBottom.style.pointerEvents = canScroll && !atBottom ? 'auto' : 'none';
}

// ============================================
// CLIPBOARD FUNCTIONS
// ============================================

async function copyToClipboard() {
    const text = resultText.value;
    if (!text) { showToast('No text to copy', 'error'); return; }
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    } catch (err) {
        resultText.select();
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        showToast('Copied to clipboard', 'success');
    }
}

function downloadText() {
    const text = resultText.value;
    if (!text) { showToast('No text to download', 'error'); return; }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded successfully', 'success');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? '<polyline points="20 6 9 17 4 12"></polyline>'
        : type === 'error'
        ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
    
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${icon}
        </svg>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 200);
    }, 4000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// ERROR HANDLING
// ============================================

window.onerror = (msg, url, line) => {
    console.error('Global error:', msg, url, line);
    showToast('An unexpected error occurred', 'error');
    return false;
};

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('An unexpected error occurred', 'error');
});

console.log('PDF Extractor by Yivani (https://yivani.dev) - Loaded successfully');

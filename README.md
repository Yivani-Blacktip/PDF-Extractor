<div align="center">

# 📄 PDF Text Extractor

**Extract text from multiple PDF files instantly**

🌐 [**Live Demo**](https://yivani-blacktip.github.io/PDF-Extractor/)

[![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)

</div>

---

## ✨ Features

- 📁 **Batch Processing** - Extract text from up to 100 PDFs simultaneously
- 🔍 **Smart Search** - Find text across line breaks and extra spaces with VS Code-like search
- 🔄 **Undo/Redo** - Full edit history with 50 state buffer
- 📝 **Text Transformations** - lowercase, UPPERCASE, Title Case, remove empty lines
- 🎯 **Match Navigation** - Delete matches one by one with progress indicator
- 💾 **Export** - Copy to clipboard or download as `.txt`
- ⚡ **Fast & Private** - Client-side processing, files deleted after extraction

---

## 📸 Screenshot

<div align="center">

*Clean, minimal interface for PDF text extraction*

</div>

---

## 🛠️ How It Works

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Express   │────▶│  PDF Parse  │
│  (Browser)  │◀────│   Server    │◀────│   Library   │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Frontend**: Vanilla JavaScript with a clean, minimal UI inspired by modern code editors. Features include drag-and-drop file upload, VS Code-style search/replace, and floating navigation buttons.

**Backend**: Node.js + Express handles file uploads via Multer, processes PDFs using pdf-parse library, and returns extracted text from all pages.

**Key Technologies**:
- **Inter** & **JetBrains Mono** fonts for clean typography
- **SVG icons** for crisp rendering at any size
- **CSS Grid/Flexbox** for responsive layout
- **Regex-based search** with whitespace normalization

### Search Implementation

The search functionality uses a three-tier approach to find text across line breaks:

1. **Exact Match** - Direct character-by-character comparison
2. **Normalized Whitespace** - Treats multiple spaces/tabs/newlines as single space
3. **Flexible Search** - Ignores whitespace entirely for matching text split across lines

### Text Processing Pipeline

```
PDF Upload → Server Validation → pdf-parse Extraction → 
Text Concatenation → Client-side Editing → Export
```

---

## 📁 Project Structure

```
pdf-extractor/
├── public/
│   ├── index.html         # Main application UI
│   ├── css/style.css      # Minimalist stylesheet
│   ├── js/app.js          # Frontend logic & search
│   └── assets/
│       └── favicon.svg    # PDF icon
├── src/
│   └── server.js          # Express server with PDF processing
├── uploads/               # Temporary storage (auto-cleaned)
└── package.json
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + F` | Open search |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Enter` | Next match |
| `Shift + Enter` | Previous match |
| `Esc` | Close search |

---

## 🌐 Live Application

**🔗 https://yivani-blacktip.github.io/PDF-Extractor/**

The frontend is deployed via GitHub Pages. The PDF extraction requires the backend server to be running.

---

## 👤 Author

**Domenic Grothe (Yivani Blacktip)**
- Website: [yivani.dev](https://yivani.dev)
- Email: contact@yivani.dev
- GitHub: [@Yivani-Blacktip](https://github.com/Yivani-Blacktip)

---

## 📄 License

Business Source License 1.1 (BSL 1.1)

Copyright (c) 2026 Domenic Grothe (Yivani Blacktip)

This software is available under the Business Source License 1.1. The Licensed Work will become available under the Apache License, Version 2.0 four years from the publication date.

See [LICENSE](LICENSE) for full terms.

---

<div align="center">

Made with ❤️ by [Yivani](https://yivani.dev)

</div>

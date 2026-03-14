<div align="center">

# 📄 PDF Text Extractor

**Extract text from multiple PDF files instantly**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)

[Live Demo](https://yivani.github.io/pdf-text-extractor) · [Report Bug](https://github.com/yivani/pdf-text-extractor/issues) · [Request Feature](https://github.com/yivani/pdf-text-extractor/issues)

</div>

---

## ✨ Features

- 📁 **Batch Processing** - Upload and extract text from up to 100 PDFs at once
- 🔍 **Smart Search** - Find text across line breaks and extra spaces
- 🔄 **Undo/Redo** - Full edit history with keyboard shortcuts
- 📝 **Text Transformations** - lowercase, UPPERCASE, Title Case, remove empty lines
- 💾 **Export** - Copy to clipboard or download as `.txt`
- ⚡ **Fast & Private** - Processing happens locally, files are deleted after extraction

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 14 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yivani/pdf-text-extractor.git

# Navigate to project directory
cd pdf-text-extractor

# Install dependencies
npm install

# Start the server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage

### 1. Upload PDFs
Drag and drop your PDF files or click to browse. Supports up to 100 files (50MB each).

### 2. Extract Text
Click "Extract Text" to process all files. The app extracts text from **all pages** of each PDF.

### 3. Search & Edit
Use the toolbar to:
- **Find** (`Ctrl+F`) - Search with smart whitespace handling
- **Replace** - Replace single or all matches
- **Transform** - Change case, remove empty lines
- **Undo/Redo** (`Ctrl+Z` / `Ctrl+Y`) - Full edit history

### 4. Export
- **Copy** - Copy all text to clipboard
- **Download** - Save as `.txt` file

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Backend** | Node.js, Express |
| **PDF Parsing** | pdf-parse |
| **Frontend** | Vanilla JavaScript, CSS3 |
| **Fonts** | Inter, JetBrains Mono |
| **Icons** | SVG (Heroicons-style) |

---

## 📁 Project Structure

```
pdf-text-extractor/
├── src/
│   └── server.js          # Express server
├── public/
│   ├── index.html         # Main HTML
│   ├── css/
│   │   └── style.css      # Stylesheet
│   ├── js/
│   │   └── app.js         # Frontend logic
│   └── assets/
│       └── favicon.svg    # App icon
├── uploads/               # Temporary storage
├── .gitignore
├── package.json
└── README.md
```

---

## 🌐 GitHub Pages Deployment

This project can be deployed to **GitHub Pages** for the frontend. Note: The PDF extraction requires a backend server.

### Option 1: Full Deployment (Backend + Frontend)

Deploy to services like:
- [Render](https://render.com)
- [Railway](https://railway.app)
- [Heroku](https://heroku.com)
- [Vercel](https://vercel.com)

### Option 2: GitHub Pages (Frontend Only)

For static hosting on GitHub Pages:

```bash
# Create a gh-pages branch
git checkout -b gh-pages

# Remove server-only files
git rm src/server.js package.json .gitignore

# Move public files to root
git mv public/* .

# Commit and push
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

Then enable GitHub Pages in repository settings.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + F` | Open search |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + Shift + Z` | Redo (alternative) |
| `Enter` | Next search match |
| `Shift + Enter` | Previous search match |
| `Esc` | Close search |

---

## 📝 Environment Variables

Create a `.env` file for optional configuration:

```env
PORT=3000                    # Server port (default: 3000)
MAX_FILE_SIZE=52428800       # Max file size in bytes (50MB)
MAX_FILES=100                # Max files per upload
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**Yivani**
- Website: [yivani.dev](https://yivani.dev)
- Email: contact@yivani.dev
- GitHub: [@yivani](https://github.com/yivani)

---

<div align="center">

**[⬆ Back to Top](#-pdf-text-extractor)**

Made with ❤️ by [Yivani](https://yivani.dev)

</div>

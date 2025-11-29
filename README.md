# Rich Text Editor & Base64 Converter

A modern, powerful Rich Text Editor built with React, TypeScript, and Tailwind CSS. This tool allows users to create rich content, manage multi-column layouts, and convert everything into Base64 strings for easy embedding in other applications (like emails or CMS).

**[Live Demo](https://DennisR93.github.io/Rich-Text-Editor/)**

## Features

-   **Rich Text Editing**: Powered by **Tiptap** for a robust, headless editing experience.
-   **2-Column Layout**: Custom extension to insert responsive 2-column layouts that are preserved in the output.
-   **Image Management**:
    -   **Drag & Drop / Paste**: Paste images directly from your clipboard or the web.
    -   **Auto-Upload**: Images are automatically uploaded to **ImgBB** (free hosting) to ensure they work everywhere.
    -   **Fallback**: If upload fails, images fallback to Data URIs so no content is lost.
-   **Base64 Conversion**:
    -   **Generate**: Convert your editor content to a Base64 string.
    -   **Decode**: Paste a Base64 string to edit it.
    -   **Compression**: Optional **LZ-String** compression to significantly reduce string size.
-   **Source Code View**: Toggle between visual editing and raw HTML source.
-   **History**: Local storage support to save and retrieve drafts.
-   **Responsive Design**: Built with Tailwind CSS for a seamless experience on all devices.

## Technologies Used

-   **React 19**: The core UI library.
-   **TypeScript**: For type safety and robust code.
-   **Vite**: Fast build tool and development server.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **Tiptap**: Headless editor framework based on ProseMirror.
-   **ImgBB API**: For reliable, free image hosting.
-   **LZ-String**: For efficient string compression.
-   **Lucide React**: Beautiful, consistent icons.
-   **DOMPurify**: Security library to sanitize HTML content.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/rich-text-editor.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd rich-text-editor
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  **Configure Environment**:
    Create a `.env` file in the root directory and add your ImgBB API key:
    ```env
    VITE_IMGBB_API_KEY=your_api_key_here
    ```
    *Get a free key at [api.imgbb.com](https://api.imgbb.com/)*

### Running the App

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/rich-text-editor/`.

### Building for Production

To build the app for deployment:

```bash
npm run build
```

The output will be in the `dist` folder.

## Layout Styling Guide

The 2-column layout uses Flexbox for modern responsiveness, with specific classes for easy styling in your target application.

-   **Container**: `.two-col-container` (Flex container)
-   **Columns**: `.two-col-column`, `.two-col-column-left`, `.two-col-column-right`

Click the **Info (i)** icon in the editor to see a detailed styling guide and example CSS.

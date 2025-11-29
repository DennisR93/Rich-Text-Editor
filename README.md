# Rich Text Editor & Base64 Converter

A modern, powerful Rich Text Editor built with React, TypeScript, and Tailwind CSS. This tool allows users to create rich content, manage multi-column layouts, and convert everything into Base64 strings for easy embedding in other applications (like emails or CMS).

## Features

-   **Rich Text Editing**: Full formatting capabilities (bold, italic, lists, links, images) using ReactQuill.
-   **2-Column Layout**: Easily insert responsive 2-column tables that work in email clients.
-   **Base64 Conversion**:
    -   **Generate**: Convert your editor content to a Base64 string.
    -   **Decode**: Paste a Base64 string to edit it.
    -   **Auto-Cleanup**: Automatically removes inline borders and adds styling classes for production use.
-   **Source Code View**: Toggle between visual editing and raw HTML source.
-   **History**: Local storage support to save and retrieve drafts.
-   **Responsive Design**: Built with Tailwind CSS for a seamless experience on all devices.

## Technologies Used

-   **React 19**: The core UI library.
-   **TypeScript**: For type safety and robust code.
-   **Vite**: Fast build tool and development server.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **React Quill New**: Modern wrapper for the Quill rich text editor.
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

The 2-column layout uses standard HTML tables with specific classes for easy styling in your target application.

-   **Wrapper**: `.two-col-table`
-   **Row**: `.two-col-row`
-   **Columns**: `.two-col-left-td`, `.two-col-right-td`

Click the **Info (i)** icon in the editor to see a detailed styling guide and example CSS.

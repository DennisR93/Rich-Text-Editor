import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ArrowDown, ArrowUp, Copy, Check, Code, LayoutTemplate, Info } from 'lucide-react';
import DOMPurify from 'dompurify';
import { GuideModal } from './GuideModal';

interface Base64ConverterProps {
    modules: any;
}

export function Base64Converter({ modules }: Base64ConverterProps) {
    const [base64Input, setBase64Input] = useState('');
    const [decodedContent, setDecodedContent] = useState('');
    const [encodedOutput, setEncodedOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [isSourceView, setIsSourceView] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    // Helper to inject layout classes and clean borders
    const injectLayoutClasses = (htmlContent: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const tables = tempDiv.querySelectorAll('table');
        tables.forEach(table => {
            table.classList.add('two-col-table');

            const tbody = table.querySelector('tbody');
            if (tbody) tbody.classList.add('two-col-tbody');

            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                row.classList.add('two-col-row');
                const cells = row.querySelectorAll('td');

                cells.forEach((cell, index) => {
                    cell.style.border = 'none'; // Ensure no inline border
                    if (index === 0) cell.classList.add('two-col-left-td');
                    if (index === 1) cell.classList.add('two-col-right-td');
                });
            });
        });

        return tempDiv.innerHTML;
    };

    const insertTwoColumnLayout = () => {
        const layoutHtml = `
<table style="width: 100%; border-collapse: collapse; border: none;">
    <tbody>
        <tr>
            <td style="width: 50%; vertical-align: top; padding: 1rem;">
                <p>Left content...</p>
            </td>
            <td style="width: 50%; vertical-align: top; padding: 1rem;">
                <p>Right content...</p>
            </td>
        </tr>
    </tbody>
</table>
<p><br></p>
`;
        setDecodedContent(decodedContent + layoutHtml);
    };

    const handleDecode = () => {
        try {
            if (!base64Input.trim()) {
                alert('Please enter a Base64 string');
                return;
            }
            // Decode Unicode strings correctly
            const decoded = decodeURIComponent(escape(atob(base64Input)));
            // Sanitize the decoded HTML
            const sanitized = DOMPurify.sanitize(decoded);

            // Inject classes immediately so they appear in Source View
            const contentWithClasses = injectLayoutClasses(sanitized);

            setDecodedContent(contentWithClasses);
            setEncodedOutput(''); // Clear previous output
        } catch (e) {
            alert('Invalid Base64 string');
        }
    };

    const handleEncode = () => {
        try {
            // Ensure classes are present and borders are removed before encoding
            const cleanedContent = injectLayoutClasses(decodedContent);

            // Encode Unicode strings correctly
            const base64 = btoa(unescape(encodeURIComponent(cleanedContent)));
            setEncodedOutput(base64);
        } catch (e) {
            console.error(e);
            alert('Error encoding content');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(encodedOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Base64 Converter & Editor</h2>

            <div className="flex flex-col gap-6">
                {/* Input Section */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Paste Base64 String:</label>
                    <textarea
                        value={base64Input}
                        onChange={(e) => setBase64Input(e.target.value)}
                        className="w-full h-32 p-4 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Paste your Base64 string here..."
                        dir="ltr" // Base64 is always LTR
                    />
                    <button
                        onClick={handleDecode}
                        className="self-start flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm mt-2"
                    >
                        <ArrowDown size={18} />
                        Decode to Editor
                    </button>
                </div>

                {/* Editor Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="font-medium text-gray-700">Edit Content:</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsSourceView(!isSourceView)}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isSourceView
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <Code size={16} />
                                {isSourceView ? 'Visual Editor' : 'Source Code'}
                            </button>
                            <button
                                onClick={insertTwoColumnLayout}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                title="Insert 2-Column Layout"
                            >
                                <LayoutTemplate size={16} />
                                Insert 2 Columns
                            </button>
                            <button
                                onClick={() => setIsGuideOpen(true)}
                                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Layout Guide"
                            >
                                <Info size={20} />
                            </button>
                        </div>
                    </div>
                    <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {isSourceView ? (
                            <textarea
                                value={decodedContent}
                                onChange={(e) => setDecodedContent(e.target.value)}
                                className="w-full h-[300px] p-4 font-mono text-sm outline-none resize-y"
                                placeholder="HTML Source Code..."
                            />
                        ) : (
                            <ReactQuill
                                theme="snow"
                                value={decodedContent}
                                onChange={setDecodedContent}
                                modules={modules}
                                className="bg-white"
                            />
                        )}
                    </div>
                    <button
                        onClick={handleEncode}
                        className="self-start flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm mt-2"
                    >
                        <ArrowUp size={18} />
                        Encode to Base64
                    </button>
                </div>

                {/* Output Section */}
                {encodedOutput && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        <label className="font-medium text-gray-700">Encoded Base64 Output:</label>
                        <div className="relative">
                            <textarea
                                readOnly
                                value={encodedOutput}
                                className="w-full h-32 p-4 border border-gray-200 rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                dir="ltr"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm text-sm ${copied
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Copy, Check, Code, LayoutTemplate, Loader2, RefreshCw, Info } from 'lucide-react';
import { GuideModal } from './GuideModal';

interface EditorAreaProps {
    title: string;
    setTitle: (title: string) => void;
    content: string;
    setContent: (content: string) => void;
    saveContent: () => void;
    modules: any;
}

export function EditorArea({
    title, setTitle, content, setContent, saveContent, modules
}: EditorAreaProps) {
    const [isSourceView, setIsSourceView] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedBase64, setGeneratedBase64] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

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
        setContent(content + layoutHtml);
    };

    const handleGenerateBase64 = () => {
        setIsGenerating(true);
        setGeneratedBase64(null);

        // Simulate "thinking" delay
        setTimeout(() => {
            try {
                // Create a temporary DOM element to manipulate the HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;

                // Find all tables and add classes
                const tables = tempDiv.querySelectorAll('table');
                tables.forEach(table => {
                    table.classList.add('two-col-table');

                    const tbody = table.querySelector('tbody');
                    if (tbody) tbody.classList.add('two-col-tbody');

                    const rows = table.querySelectorAll('tr');
                    rows.forEach(row => {
                        row.classList.add('two-col-row');
                        const cells = row.querySelectorAll('td');

                        // Add classes to specific cells and remove borders
                        cells.forEach((cell, index) => {
                            cell.style.border = 'none';
                            if (index === 0) cell.classList.add('two-col-left-td');
                            if (index === 1) cell.classList.add('two-col-right-td');
                        });
                    });
                });

                // Get the cleaned HTML
                const cleanedContent = tempDiv.innerHTML;

                // Encode Unicode strings correctly
                const base64 = btoa(unescape(encodeURIComponent(cleanedContent)));
                setGeneratedBase64(base64);
            } catch (e) {
                console.error(e);
                alert('Error converting to Base64');
            } finally {
                setIsGenerating(false);
            }
        }, 1000);
    };

    const handleCopyBase64 = () => {
        if (generatedBase64) {
            navigator.clipboard.writeText(generatedBase64);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const resetGeneration = () => {
        setGeneratedBase64(null);
        setCopied(false);
    };

    return (
        <div className="flex-1 flex flex-col gap-4">
            <input
                type="text"
                placeholder="Document Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />

            <div className="flex gap-2 mb-2">
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

            <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isSourceView ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[500px] p-4 font-mono text-sm outline-none resize-y"
                        placeholder="HTML Source Code..."
                    />
                ) : (
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        className="bg-white"
                    />
                )}
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-3">
                    <button
                        onClick={saveContent}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                        <Save size={18} />
                        Save Draft
                    </button>

                    {!generatedBase64 ? (
                        <button
                            onClick={handleGenerateBase64}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} />
                                    Generate Base64
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyBase64}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-sm ${copied
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied!' : 'Copy Base64'}
                            </button>
                            <button
                                onClick={resetGeneration}
                                className="px-3 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Reset"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {generatedBase64 && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Generated Base64 String:</label>
                        <textarea
                            readOnly
                            value={generatedBase64}
                            className="w-full h-24 p-3 border border-gray-200 rounded-lg font-mono text-xs bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TwoColContainer, TwoColColumn } from '../extensions/TwoColumn';
import { Direction } from '../extensions/Direction';
import { ArrowDown, ArrowUp, Copy, Check, Code, Info, FileArchive, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { compressString, decompressString } from '../utils/compression-helper';
import { GuideModal } from './GuideModal';
import { MenuBar } from './MenuBar';
import { uploadImage } from '../utils/image-upload-service';

interface Base64ConverterProps { }

export function Base64Converter({ }: Base64ConverterProps) {
    const [base64Input, setBase64Input] = useState('');
    const [decodedContent, setDecodedContent] = useState('');
    const [encodedOutput, setEncodedOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [isSourceView, setIsSourceView] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [useCompression, setUseCompression] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            TextAlign.configure({
                types: ['heading', 'paragraph', 'twoColColumn'],
            }),
            Direction,
            TwoColContainer,
            TwoColColumn,
        ],
        content: decodedContent,
        onUpdate: ({ editor }) => {
            setDecodedContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    // Sync editor content when decodedContent changes externally (e.g. after decode)
    useEffect(() => {
        if (editor && decodedContent !== editor.getHTML()) {
            // Only update if content is different to avoid cursor jumps
            // But here we mostly set it after decoding
            if (!editor.isFocused) {
                editor.commands.setContent(decodedContent);
            }
        }
    }, [decodedContent, editor]);

    const insertTwoColumnLayout = useCallback(() => {
        if (editor) {
            editor.chain().focus().insertContent({
                type: 'twoColContainer',
                content: [
                    {
                        type: 'twoColColumn',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Left content...' }] }]
                    },
                    {
                        type: 'twoColColumn',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Right content...' }] }]
                    }
                ]
            }).run();
        }
    }, [editor]);

    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                try {
                    const imageUrl = await uploadImage(file);
                    if (editor) {
                        editor.chain().focus().setImage({ src: imageUrl }).run();
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    // Fallback to Data URI
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (typeof e.target?.result === 'string' && editor) {
                            editor.chain().focus().setImage({ src: e.target.result }).run();
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        };
    }, [editor]);

    // Helper to inject layout classes and clean borders
    const injectLayoutClasses = (htmlContent: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Ensure flex containers have correct styles
        const containers = tempDiv.querySelectorAll('.two-col-container');
        containers.forEach(container => {
            (container as HTMLElement).style.display = 'flex';
            (container as HTMLElement).style.gap = '20px';

            const columns = container.querySelectorAll('.two-col-column');
            columns.forEach((col, index) => {
                const column = col as HTMLElement;
                column.style.flex = '1';
                column.style.border = 'none';

                if (index === 0) column.classList.add('two-col-column-left');
                if (index === 1) column.classList.add('two-col-column-right');
            });
        });

        return tempDiv.innerHTML;
    };

    const handleDecode = async () => {
        try {
            if (!base64Input.trim()) {
                alert('Please enter a Base64 string');
                return;
            }

            setIsProcessing(true);
            let decoded = '';

            // Try to decompress first
            try {
                decoded = await decompressString(base64Input);
            } catch (lzmaError) {
                // If LZMA fails, try standard decode
                try {
                    decoded = decodeURIComponent(escape(atob(base64Input)));
                } catch (base64Error) {
                    throw new Error('Invalid Base64 string (neither LZMA nor Standard)');
                }
            }

            // Sanitize the decoded HTML
            const sanitized = DOMPurify.sanitize(decoded);

            // Inject classes/styles to ensure it looks right
            const contentWithClasses = injectLayoutClasses(sanitized);

            setDecodedContent(contentWithClasses);
            if (editor) {
                editor.commands.setContent(contentWithClasses);
            }
            setEncodedOutput(''); // Clear previous output
        } catch (e) {
            alert('Invalid Base64 string');
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEncode = async () => {
        try {
            setIsProcessing(true);
            // Get content from editor if available, otherwise use state
            const contentToEncode = editor ? editor.getHTML() : decodedContent;

            // Ensure classes are present
            const cleanedContent = injectLayoutClasses(contentToEncode);

            let result = '';
            if (useCompression) {
                result = await compressString(cleanedContent);
            } else {
                // Encode Unicode strings correctly
                result = btoa(unescape(encodeURIComponent(cleanedContent)));
            }
            setEncodedOutput(result);
        } catch (e) {
            console.error(e);
            alert('Error encoding content');
        } finally {
            setIsProcessing(false);
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
                        placeholder="Paste your Base64 string here (Standard or Compressed)..."
                        dir="ltr" // Base64 is always LTR
                    />
                    <button
                        onClick={handleDecode}
                        disabled={isProcessing}
                        className="self-start flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ArrowDown size={18} />}
                        {isProcessing ? 'Decoding...' : 'Decode to Editor'}
                    </button>
                </div>

                {/* Editor Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-gray-700">Edit Content:</label>
                        <div className="flex gap-2 items-center">
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
                                onClick={() => setIsGuideOpen(true)}
                                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Layout Guide"
                            >
                                <Info size={20} />
                            </button>
                        </div>
                    </div>

                    <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        {!isSourceView && (
                            <MenuBar
                                editor={editor}
                                insertTwoColumnLayout={insertTwoColumnLayout}
                                addImage={addImage}
                            />
                        )}

                        {isSourceView ? (
                            <textarea
                                value={decodedContent}
                                onChange={(e) => {
                                    setDecodedContent(e.target.value);
                                    if (editor) editor.commands.setContent(e.target.value);
                                }}
                                className="w-full h-[300px] p-4 font-mono text-sm outline-none resize-y"
                                placeholder="HTML Source Code..."
                            />
                        ) : (
                            <div className="min-h-[300px] bg-white">
                                <EditorContent editor={editor} />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={handleEncode}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
                            {isProcessing ? 'Encoding...' : 'Encode to Base64'}
                        </button>

                        <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 rounded-lg border border-transparent hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={useCompression}
                                onChange={(e) => setUseCompression(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileArchive size={16} className="text-gray-500" />
                                Use Compression (LZ-String)
                            </span>
                        </label>
                    </div>
                </div>

                {/* Output Section */}
                {encodedOutput && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        <label className="font-medium text-gray-700">
                            Encoded Base64 Output {useCompression ? '(Compressed LZ-String)' : '(Standard)'}:
                        </label>
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

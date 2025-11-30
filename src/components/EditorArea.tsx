import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TwoColContainer, TwoColColumnLeft, TwoColColumnRight } from '../extensions/TwoColumn';
import { Direction } from '../extensions/Direction';
import { ImageUploadPaste } from '../extensions/ImageUploadPaste';
import {
    Save, Copy, Check, Code, Loader2, RefreshCw, Info, FileArchive
} from 'lucide-react';
import { compressString } from '../utils/compression-helper';
import { GuideModal } from './GuideModal';
import { uploadImage } from '../utils/image-upload-service';

import { MenuBar } from './MenuBar';

interface EditorAreaProps {
    title: string;
    setTitle: (title: string) => void;
    content: string;
    setContent: (content: string) => void;
    saveContent: () => void;
}

export function EditorArea({
    title, setTitle, content, setContent, saveContent
}: EditorAreaProps) {
    const [isSourceView, setIsSourceView] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedBase64, setGeneratedBase64] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [useCompression, setUseCompression] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            TextAlign.configure({
                types: ['heading', 'paragraph', 'twoColColumnLeft', 'twoColColumnRight'],
            }),
            Direction,
            TwoColContainer,
            TwoColColumnLeft,
            TwoColColumnRight,
            ImageUploadPaste,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    const insertTwoColumnLayout = () => {
        if (editor) {
            editor.chain().focus().insertContent({
                type: 'twoColContainer',
                content: [
                    {
                        type: 'twoColColumnLeft',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Left content...' }] }]
                    },
                    {
                        type: 'twoColColumnRight',
                        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Right content...' }] }]
                    }
                ]
            }).run();
        }
    };

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

    const handleGenerateBase64 = async () => {
        if (!editor) return;

        setIsGenerating(true);
        setGeneratedBase64(null);

        // Simulate "thinking" delay + async compression
        setTimeout(async () => {
            try {
                // Get the cleaned HTML directly from Tiptap
                const cleanedContent = editor.getHTML();



                let base64 = '';
                if (useCompression) {
                    base64 = await compressString(cleanedContent);
                } else {
                    // Encode Unicode strings correctly
                    base64 = btoa(unescape(encodeURIComponent(cleanedContent)));
                }

                setGeneratedBase64(base64);
            } catch (e) {
                console.error(e);
                alert('Error converting to Base64');
            } finally {
                setIsGenerating(false);
            }
        }, 100);
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
                    onClick={() => setIsGuideOpen(true)}
                    className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Layout Guide"
                >
                    <Info size={20} />
                </button>
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
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            editor?.commands.setContent(e.target.value);
                        }}
                        className="w-full h-[500px] p-4 font-mono text-sm outline-none resize-y"
                        placeholder="HTML Source Code..."
                    />
                ) : (
                    <div className="min-h-[500px] bg-white">
                        <EditorContent editor={editor} />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-3 items-center">
                    <button
                        onClick={saveContent}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                        <Save size={18} />
                        Save Draft
                    </button>

                    {!generatedBase64 ? (
                        <>
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

                            <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 rounded-lg border border-transparent hover:bg-gray-100 transition-colors ml-2">
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
                        </>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Generated Base64 String {useCompression ? '(Compressed LZ-String)' : '(Standard)'}:
                        </label>
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

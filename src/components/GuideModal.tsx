import { X, Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
    const [copied, setCopied] = useState(false);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const cssCode = `/* Stack columns on mobile */
@media (max-width: 768px) {
  .two-col-table, 
  .two-col-tbody, 
  .two-col-row, 
  .two-col-left-td, 
  .two-col-right-td {
    display: block !important;
    width: 100% !important;
  }

  .two-col-left-td, 
  .two-col-right-td {
    padding: 10px 0 !important;
  }
}

/* Desktop Styles */
.two-col-table {
  width: 100%;
  border-collapse: collapse;
}

.two-col-left-td, 
.two-col-right-td {
  vertical-align: top;
  padding: 15px;
}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(cssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[91vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Styling the 2-Column Layout</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    <p className="text-gray-600 text-lg">
                        The 2-column layout uses a standard HTML <code>&lt;table&gt;</code> structure.
                        We automatically add specific classes to help you style it in your web application.
                    </p>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 text-lg text-left">Structure & Classes</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm text-gray-700">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-blue-600">.two-col-table</code>
                                        <span>The main table container</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-blue-600">.two-col-tbody</code>
                                        <span>The table body</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-blue-600">.two-col-row</code>
                                        <span>The table row</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-blue-600">.two-col-left-td</code>
                                        <span>The left column cell</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-blue-600">.two-col-right-td</code>
                                        <span>The right column cell</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-lg">Example CSS</h3>
                            </div>

                            <div className="relative group bg-[#1e1e1e] rounded-xl shadow-inner border border-gray-800 overflow-hidden">
                                <div className="absolute top-3 right-3 z-10">
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm ${copied
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/10'
                                            }`}
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-[#d4d4d4] w-full text-left">
                                    {cssCode}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

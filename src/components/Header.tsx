import { FileCode, History } from 'lucide-react';

interface HeaderProps {
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    historyCount: number;
}

export function Header({ showHistory, setShowHistory, historyCount }: HeaderProps) {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileCode className="text-blue-600" size={24} />
                    <h1 className="text-xl font-bold text-gray-900">Rich Text Editor</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <History size={18} />
                        History ({historyCount})
                    </button>
                </div>
            </div>
        </header>
    );
}

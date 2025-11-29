import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface SavedContent {
    id: string;
    title: string;
    content: string;
    date: string;
}

interface HistorySidebarProps {
    history: SavedContent[];
    loadEntry: (entry: SavedContent) => void;
    deleteEntry: (id: string, e: React.MouseEvent) => void;
}

export function HistorySidebar({ history, loadEntry, deleteEntry }: HistorySidebarProps) {
    return (
        <aside className="w-80 bg-white rounded-xl shadow-lg border border-gray-100 h-[calc(100vh-8rem)] overflow-y-auto sticky top-24">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-700">Saved Drafts</h2>
            </div>
            <div className="divide-y divide-gray-50">
                {history.length === 0 ? (
                    <p className="p-8 text-center text-gray-400 text-sm">No saved drafts yet.</p>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => loadEntry(item)}
                            className="p-4 hover:bg-blue-50 cursor-pointer group transition-colors"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                                <button
                                    onClick={(e) => deleteEntry(item.id, e)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                                {format(new Date(item.date), 'MMM d, yyyy • h:mm a')}
                            </p>
                            <div className="text-xs text-gray-400 line-clamp-2 font-mono bg-gray-50 p-1 rounded">
                                {item.content.replace(/<[^>]*>/g, '').slice(0, 60)}...
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

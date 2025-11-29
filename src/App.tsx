import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HistorySidebar } from './components/HistorySidebar';
import { EditorArea } from './components/EditorArea';
import { Base64Converter } from './components/Base64Converter';
import DOMPurify from 'dompurify';
import './App.scss';

interface SavedContent {
  id: string;
  title: string;
  content: string;
  date: string;
}

function App() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [history, setHistory] = useState<SavedContent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rich_text_editor_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save to local storage
  const saveContent = () => {
    if (!content.trim()) return;

    const newEntry: SavedContent = {
      id: Date.now().toString(),
      title: title || 'Untitled Draft',
      content,
      date: new Date().toISOString()
    };

    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem('rich_text_editor_history', JSON.stringify(newHistory));
    setTitle('');
    alert('Saved to history!');
  };

  // Load from history
  const loadEntry = (entry: SavedContent) => {
    // Sanitize content before loading into editor
    const sanitized = DOMPurify.sanitize(entry.content);
    setContent(sanitized);
    setTitle(entry.title);
    setShowHistory(false);
  };

  // Delete from history
  const deleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('rich_text_editor_history', JSON.stringify(newHistory));
  };



  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        historyCount={history.length}
      />

      <main className="max-w-5xl mx-auto px-4 py-8 flex gap-8">
        <div className="flex-1 flex flex-col gap-8">
          <EditorArea
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            saveContent={saveContent}
          />

          <Base64Converter />
        </div>

        {showHistory && (
          <HistorySidebar
            history={history}
            loadEntry={loadEntry}
            deleteEntry={deleteEntry}
          />
        )}
      </main>
    </div>
  );
}

export default App;

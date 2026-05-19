import { useEffect } from 'react';
import { CadCanvas } from './components/CadCanvas';
import { LeftToolbar } from './components/LeftToolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { StatusBar } from './components/StatusBar';
import { TopToolbar } from './components/TopToolbar';
import { useDocumentStore } from './store/useDocumentStore';

export default function App() {
  const loadLocalDocument = useDocumentStore((state) => state.loadLocalDocument);

  useEffect(() => {
    loadLocalDocument();
  }, [loadLocalDocument]);

  return (
    <div className="app-shell">
      <TopToolbar />
      <div className="workspace">
        <LeftToolbar />
        <main className="canvas-region" aria-label="中央画布">
          <CadCanvas />
        </main>
        <PropertiesPanel />
      </div>
      <StatusBar />
    </div>
  );
}

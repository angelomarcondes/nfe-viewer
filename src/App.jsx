import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ThumbnailBar } from './components/ThumbnailBar';
import { DanfeViewer } from './components/DanfeViewer';
import { FileBox, Printer, Trash2 } from 'lucide-react';
import './App.css';

function App() {
  const [xmlFiles, setXmlFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleFilesAdded = (newFiles) => {
    setXmlFiles((prev) => {
      // processa cada arquivo para extrair a chave e checar duplicidade
      const processedFiles = newFiles.map(xmlDoc => {
        let chave = '';
        try {
          chave = xmlDoc.getElementsByTagName('chNFe')[0]?.textContent || '';
          if (!chave) {
            // tenta pegar o Id se chNFe não existir
            const infNFe = xmlDoc.getElementsByTagName('infNFe')[0];
            if (infNFe) chave = infNFe.getAttribute('Id')?.replace('NFe', '') || '';
          }
        } catch(e) {}
        
        return {
          xml: xmlDoc,
          chave,
          isDuplicate: prev.some(item => item.chave === chave) || newFiles.filter(f => {
              let c = f.getElementsByTagName('chNFe')[0]?.textContent;
              if (!c) c = f.getElementsByTagName('infNFe')[0]?.getAttribute('Id')?.replace('NFe', '');
              return c === chave;
          }).length > 1
        };
      });

      // Se houver múltiplas cópias do mesmo arquivo no mesmo lote, 
      // marca as subsequentes como duplicadas
      const seen = new Set(prev.map(p => p.chave));
      processedFiles.forEach(pf => {
        if (seen.has(pf.chave) && pf.chave !== '') {
          pf.isDuplicate = true;
        } else if (pf.chave !== '') {
          seen.add(pf.chave);
        }
      });

      const combined = [...prev, ...processedFiles];
      if (prev.length === 0 && processedFiles.length > 0) {
        setSelectedIndex(0);
      }
      return combined;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearAll = () => {
    if (window.confirm("Tem certeza que deseja remover todos os arquivos?")) {
      setXmlFiles([]);
      setSelectedIndex(0);
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setXmlFiles((prev) => {
      const newFiles = prev.filter((_, idx) => idx !== indexToRemove);
      
      // Se não sobrou nenhum arquivo
      if (newFiles.length === 0) {
        setSelectedIndex(0);
        return newFiles;
      }

      // Ajusta o selectedIndex se necessário
      if (selectedIndex === indexToRemove) {
        // Se apagou o selecionado, seleciona o anterior (ou o primeiro se era o 0)
        setSelectedIndex(Math.max(0, indexToRemove - 1));
      } else if (selectedIndex > indexToRemove) {
        // Se apagou um arquivo antes do selecionado, o indice do selecionado diminui
        setSelectedIndex(selectedIndex - 1);
      }

      return newFiles;
    });
  };

  return (
    <div className="app-container">
      <header className="app-header no-print">
        <div className="header-content container">
          <div className="logo-area">
            <div className="logo">
              <FileBox className="logo-icon" size={28} />
              <h1>NFe Viewer</h1>
            </div>
            
            {xmlFiles.length > 0 && (
              <div className="header-thumbnails">
                <ThumbnailBar 
                  files={xmlFiles} 
                  selectedIndex={selectedIndex} 
                  onSelect={setSelectedIndex}
                  onRemove={handleRemoveFile}
                />
                <div className="header-upload-mini">
                   <FileUploader onFilesAdded={handleFilesAdded} compact />
                </div>
              </div>
            )}
          </div>

          {xmlFiles.length > 0 && (
            <div className="header-actions">
              <button className="btn-clear" onClick={handleClearAll} title="Limpar Tudo">
                <Trash2 size={20} />
                <span>Limpar</span>
              </button>
              <button className="btn-print" onClick={handlePrint} title="Imprimir DANFE">
                <Printer size={20} />
                <span>Imprimir</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main container">
        {xmlFiles.length === 0 ? (
          <div className="upload-section">
            <FileUploader onFilesAdded={handleFilesAdded} />
          </div>
        ) : (
          <div className="viewer-section">
            <div className="viewer-layout">
              {/* Sidebar removida. Agora a DANFE ocupa a largura toda. */}
              <div className="viewer-content">
                <DanfeViewer xmlDoc={xmlFiles[selectedIndex].xml} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

import React, { useCallback, useState } from 'react';
import { UploadCloud, FileWarning, Plus } from 'lucide-react';
import './FileUploader.css';

export function FileUploader({ onFilesAdded, compact = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const validateAndParseFiles = async (files) => {
    setError(null);
    const validFiles = [];
    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
        hasError = true;
        continue;
      }

      try {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        // Verifica se é uma NFe válida procurando pela tag root nfeProc ou NFe
        const isNFe = xmlDoc.getElementsByTagName('nfeProc').length > 0 || 
                      xmlDoc.getElementsByTagName('NFe').length > 0;

        if (isNFe) {
          validFiles.push(xmlDoc);
        } else {
          hasError = true;
        }
      } catch (err) {
        console.error("Erro ao ler arquivo:", err);
        hasError = true;
      }
    }

    if (hasError) {
      setError('Alguns arquivos foram ignorados. Envie apenas arquivos XML de NFe válidos.');
    }

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndParseFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndParseFiles(e.target.files);
    }
    // Reseta o input para permitir enviar o mesmo arquivo novamente se necessário
    e.target.value = null;
  };

  if (compact) {
    return (
      <div className="uploader-compact">
        <label className="btn-upload-compact">
          <Plus size={16} />
          <span>Adicionar XML</span>
          <input 
            type="file" 
            multiple 
            accept=".xml,text/xml" 
            onChange={handleFileInput} 
            className="hidden-input" 
          />
        </label>
        {error && <div className="error-toast">{error}</div>}
      </div>
    );
  }

  return (
    <div className="uploader-container">
      <div 
        className={`dropzone ${isDragging ? 'dragging' : ''} ${error ? 'has-error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="dropzone-content">
          <div className="icon-circle">
            <UploadCloud size={48} className="upload-icon" />
          </div>
          <h3>Arraste e solte seus XMLs de NFe aqui</h3>
          <p>ou clique para selecionar arquivos do seu computador</p>
          
          <label className="btn-upload-primary">
            Selecionar Arquivos
            <input 
              type="file" 
              multiple 
              accept=".xml,text/xml" 
              onChange={handleFileInput} 
              className="hidden-input" 
            />
          </label>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <FileWarning size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

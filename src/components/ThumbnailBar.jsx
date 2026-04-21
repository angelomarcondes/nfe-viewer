import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import './ThumbnailBar.css';

export function ThumbnailBar({ files, selectedIndex, onSelect, onRemove }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="thumbnail-container">
      <button 
        className="scroll-btn left" 
        onClick={() => scroll('left')}
        title="Rolar para esquerda"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="thumbnail-scroll-area" ref={scrollRef}>
        <div className="thumbnail-track">
          {files.map((fileObj, index) => {
            // Tenta pegar o número da nota se existir, senão usa o índice
            let nfNumber = index + 1;
            try {
              const nNFNode = fileObj.xml.getElementsByTagName('nNF')[0];
              if (nNFNode) nfNumber = nNFNode.textContent;
            } catch(e) {}

            return (
              <div 
                key={index} 
                className={`thumbnail-item ${selectedIndex === index ? 'active' : ''} ${fileObj.isDuplicate ? 'is-duplicate' : ''}`}
                onClick={() => onSelect(index)}
                title={`Nota Fiscal ${nfNumber}${fileObj.isDuplicate ? ' (Duplicada)' : ''}`}
              >
                <div className="thumbnail-preview">
                  {fileObj.isDuplicate && <div className="duplicate-badge" title="Arquivo Duplicado">D</div>}
                  <FileText size={24} className="preview-icon" />
                  <span className="preview-number">{index + 1}</span>
                  
                  <button 
                    className="remove-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(index);
                    }}
                    title="Remover visualização"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="thumbnail-label">
                  NF {nfNumber}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button 
        className="scroll-btn right" 
        onClick={() => scroll('right')}
        title="Rolar para direita"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

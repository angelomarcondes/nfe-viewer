import React, { useMemo } from 'react';
import Barcode from 'react-barcode';
import './DanfeViewer.css';

const getNodeText = (xmlDoc, tagName, defaultValue = '', contextNode = null) => {
  const node = (contextNode || xmlDoc).getElementsByTagName(tagName)[0];
  return node ? node.textContent : defaultValue;
};

const formatCurrency = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value));
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR'); // DANFE oficial geralmente exibe só data em campos específicos, mas vamos manter simples
  } catch(e) {
    return dateStr;
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  } catch(e) {
    return dateStr;
  }
}

export function DanfeViewer({ xmlDoc }) {
  const nfeData = useMemo(() => {
    if (!xmlDoc) return null;

    const nfe = {
      chave: getNodeText(xmlDoc, 'chNFe'),
      numero: getNodeText(xmlDoc, 'nNF'),
      serie: getNodeText(xmlDoc, 'serie'),
      naturezaOp: getNodeText(xmlDoc, 'natOp'),
      dataEmissao: formatDate(getNodeText(xmlDoc, 'dhEmi')),
      dataSaida: formatDate(getNodeText(xmlDoc, 'dhSaiEnt')),
      horaSaida: '', // Precisaria extrair do dhSaiEnt
      tpNF: getNodeText(xmlDoc, 'tpNF') === '1' ? '1-Saída' : '0-Entrada',
      tpNFCode: getNodeText(xmlDoc, 'tpNF'),
      protAutorizacao: getNodeText(xmlDoc, 'nProt') + ' ' + formatDateTime(getNodeText(xmlDoc, 'dhRecbto')),
      inscricaoEstadualST: getNodeText(xmlDoc, 'IEST', '', xmlDoc.getElementsByTagName('emit')[0]),
      
      emitente: {
        nome: '',
        cnpj: '',
        ie: '',
        logradouro: '',
        nro: '',
        cpl: '',
        bairro: '',
        municipio: '',
        uf: '',
        cep: '',
        fone: '',
      },
      
      destinatario: {
        nome: '',
        cpfCnpj: '',
        ie: '',
        logradouro: '',
        nro: '',
        bairro: '',
        municipio: '',
        uf: '',
        cep: '',
        fone: ''
      },

      faturas: [],

      totais: {
        vBC: getNodeText(xmlDoc, 'vBC', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vICMS: getNodeText(xmlDoc, 'vICMS', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vBCST: getNodeText(xmlDoc, 'vBCST', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vST: getNodeText(xmlDoc, 'vST', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vProd: getNodeText(xmlDoc, 'vProd', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vFrete: getNodeText(xmlDoc, 'vFrete', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vSeg: getNodeText(xmlDoc, 'vSeg', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vDesc: getNodeText(xmlDoc, 'vDesc', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vII: getNodeText(xmlDoc, 'vII', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vIPI: getNodeText(xmlDoc, 'vIPI', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vPIS: getNodeText(xmlDoc, 'vPIS', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vCOFINS: getNodeText(xmlDoc, 'vCOFINS', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vOutro: getNodeText(xmlDoc, 'vOutro', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
        vNF: getNodeText(xmlDoc, 'vNF', '', xmlDoc.getElementsByTagName('ICMSTot')[0]),
      },

      transporta: {
        modFrete: getNodeText(xmlDoc, 'modFrete', '', xmlDoc.getElementsByTagName('transp')[0]),
        nome: getNodeText(xmlDoc, 'xNome', '', xmlDoc.getElementsByTagName('transporta')[0]),
        cnpj: getNodeText(xmlDoc, 'CNPJ', getNodeText(xmlDoc, 'CPF', '', xmlDoc.getElementsByTagName('transporta')[0]), xmlDoc.getElementsByTagName('transporta')[0]),
        ie: getNodeText(xmlDoc, 'IE', '', xmlDoc.getElementsByTagName('transporta')[0]),
        endereco: getNodeText(xmlDoc, 'xEnder', '', xmlDoc.getElementsByTagName('transporta')[0]),
        municipio: getNodeText(xmlDoc, 'xMun', '', xmlDoc.getElementsByTagName('transporta')[0]),
        uf: getNodeText(xmlDoc, 'UF', '', xmlDoc.getElementsByTagName('transporta')[0]),
        placa: getNodeText(xmlDoc, 'placa', '', xmlDoc.getElementsByTagName('veicTransp')[0]),
        placaUF: getNodeText(xmlDoc, 'UF', '', xmlDoc.getElementsByTagName('veicTransp')[0]),
        rntc: getNodeText(xmlDoc, 'RNTC', '', xmlDoc.getElementsByTagName('veicTransp')[0]),
        qVol: getNodeText(xmlDoc, 'qVol', '', xmlDoc.getElementsByTagName('vol')[0]),
        esp: getNodeText(xmlDoc, 'esp', '', xmlDoc.getElementsByTagName('vol')[0]),
        marca: getNodeText(xmlDoc, 'marca', '', xmlDoc.getElementsByTagName('vol')[0]),
        nVol: getNodeText(xmlDoc, 'nVol', '', xmlDoc.getElementsByTagName('vol')[0]),
        pesoL: getNodeText(xmlDoc, 'pesoL', '', xmlDoc.getElementsByTagName('vol')[0]),
        pesoB: getNodeText(xmlDoc, 'pesoB', '', xmlDoc.getElementsByTagName('vol')[0]),
      },

      infoComplementar: getNodeText(xmlDoc, 'infCpl', '', xmlDoc.getElementsByTagName('infAdic')[0])
    };

    // Emitente
    const emitNode = xmlDoc.getElementsByTagName('emit')[0];
    if(emitNode) {
        nfe.emitente.nome = getNodeText(emitNode, 'xNome');
        nfe.emitente.cnpj = getNodeText(emitNode, 'CNPJ');
        nfe.emitente.ie = getNodeText(emitNode, 'IE');
        
        const enderEmit = emitNode.getElementsByTagName('enderEmit')[0];
        if(enderEmit) {
          nfe.emitente.logradouro = getNodeText(enderEmit, 'xLgr');
          nfe.emitente.nro = getNodeText(enderEmit, 'nro');
          nfe.emitente.cpl = getNodeText(enderEmit, 'xCpl');
          nfe.emitente.bairro = getNodeText(enderEmit, 'xBairro');
          nfe.emitente.municipio = getNodeText(enderEmit, 'xMun');
          nfe.emitente.uf = getNodeText(enderEmit, 'UF');
          nfe.emitente.cep = getNodeText(enderEmit, 'CEP');
          nfe.emitente.fone = getNodeText(enderEmit, 'fone');
        }
    }

    // Destinatário
    const destNode = xmlDoc.getElementsByTagName('dest')[0];
    if(destNode) {
        nfe.destinatario.nome = getNodeText(destNode, 'xNome');
        nfe.destinatario.cpfCnpj = getNodeText(destNode, 'CNPJ') || getNodeText(destNode, 'CPF');
        nfe.destinatario.ie = getNodeText(destNode, 'IE');
        
        const enderDest = destNode.getElementsByTagName('enderDest')[0];
        if(enderDest) {
          nfe.destinatario.logradouro = getNodeText(enderDest, 'xLgr');
          nfe.destinatario.nro = getNodeText(enderDest, 'nro');
          nfe.destinatario.bairro = getNodeText(enderDest, 'xBairro');
          nfe.destinatario.municipio = getNodeText(enderDest, 'xMun');
          nfe.destinatario.uf = getNodeText(enderDest, 'UF');
          nfe.destinatario.cep = getNodeText(enderDest, 'CEP');
          nfe.destinatario.fone = getNodeText(enderDest, 'fone');
        }
    }

    // Faturas/Duplicatas
    const dupNodes = xmlDoc.getElementsByTagName('dup');
    if (dupNodes && dupNodes.length > 0) {
      nfe.faturas = Array.from(dupNodes).map(dup => ({
        nDup: getNodeText(dup, 'nDup'),
        dVenc: formatDate(getNodeText(dup, 'dVenc')),
        vDup: formatCurrency(getNodeText(dup, 'vDup'))
      }));
    }

    // Produtos
    const detNodes = xmlDoc.getElementsByTagName('det');
    nfe.produtos = Array.from(detNodes).map(det => {
      const prod = det.getElementsByTagName('prod')[0];
      const imposto = det.getElementsByTagName('imposto')[0];
      
      let vIcms = '', vIpi = '', pIcms = '', pIpi = '';
      if(imposto) {
          vIcms = getNodeText(imposto, 'vICMS');
          pIcms = getNodeText(imposto, 'pICMS');
          vIpi = getNodeText(imposto, 'vIPI');
          pIpi = getNodeText(imposto, 'pIPI');
      }

      return {
        cProd: getNodeText(prod, 'cProd'),
        xProd: getNodeText(prod, 'xProd'),
        ncm: getNodeText(prod, 'NCM'),
        cst: getNodeText(imposto, 'CST', getNodeText(imposto, 'CSOSN')),
        cfop: getNodeText(prod, 'CFOP'),
        uCom: getNodeText(prod, 'uCom'),
        qCom: getNodeText(prod, 'qCom'),
        vUnCom: getNodeText(prod, 'vUnCom'),
        vProd: getNodeText(prod, 'vProd'),
        vBC: getNodeText(imposto, 'vBC'),
        vICMS: vIcms,
        vIPI: vIpi,
        pICMS: pIcms,
        pIPI: pIpi
      };
    });

    return nfe;
  }, [xmlDoc]);

  if (!nfeData) return null;

  return (
    <div className="danfe-wrapper">
      <div className="danfe-page print-area">
        
        {/* RECIBO (Canhoto) */}
        <div className="d-row d-canhoto">
          <div className="d-cell flex-7 d-canhoto-text">
            <span className="label">RECEBEMOS DE {nfeData.emitente.nome} OS PRODUTOS/SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO</span>
            <div className="d-row d-border-none mt-2">
              <div className="d-cell flex-1">
                <span className="label">DATA DE RECEBIMENTO</span>
                <span className="value"></span>
              </div>
              <div className="d-cell flex-3">
                <span className="label">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
                <span className="value"></span>
              </div>
            </div>
          </div>
          <div className="d-cell flex-2 d-canhoto-nf text-center">
            <span className="nf-num-canhoto">NF-e</span>
            <span className="nf-n-canhoto">Nº {nfeData.numero}</span>
            <span className="nf-s-canhoto">SÉRIE: {nfeData.serie}</span>
          </div>
        </div>

        <div className="d-cut-line"></div>

        {/* HEADER */}
        <div className="d-row d-header-box">
          <div className="d-cell flex-4 d-emitente">
            <h3>{nfeData.emitente.nome}</h3>
            <p>{nfeData.emitente.logradouro}, {nfeData.emitente.nro} {nfeData.emitente.cpl ? `- ${nfeData.emitente.cpl}` : ''}</p>
            <p>{nfeData.emitente.bairro} - {nfeData.emitente.municipio} - {nfeData.emitente.uf}</p>
            <p>CEP: {nfeData.emitente.cep} - Fone: {nfeData.emitente.fone}</p>
          </div>
          <div className="d-cell flex-3 d-title-box">
            <h2>DANFE</h2>
            <p>Documento Auxiliar da Nota Fiscal Eletrônica</p>
            <div className="d-tipo-nf">
              <span>0 - Entrada</span>
              <span>1 - Saída</span>
              <div className="tipo-box">{nfeData.tpNFCode}</div>
            </div>
            <div className="d-nf-info text-center mt-1">
              <span className="font-bold">Nº {nfeData.numero}</span>
              <span className="font-bold">SÉRIE: {nfeData.serie}</span>
              <span>Página 1 de 1</span>
            </div>
          </div>
          <div className="d-cell flex-5 d-chave-box">
            <div className="barcode-area">
              {nfeData.chave ? (
                <Barcode 
                  value={nfeData.chave} 
                  format="CODE128C" 
                  height={40} 
                  displayValue={false} 
                  margin={0} 
                  background="transparent" 
                  lineColor="#000"
                  width={1}
                />
              ) : null}
            </div>
            <span className="label">CHAVE DE ACESSO</span>
            <span className="value chave-text">{nfeData.chave}</span>
            <div className="consulta-auth text-center mt-1">
              <span className="label">Consulta de autenticidade no portal nacional da NF-e</span>
              <span className="label">www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora</span>
            </div>
          </div>
        </div>

        <div className="d-row">
          <div className="d-cell flex-7">
            <span className="label">NATUREZA DA OPERAÇÃO</span>
            <span className="value">{nfeData.naturezaOp}</span>
          </div>
          <div className="d-cell flex-5">
            <span className="label">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
            <span className="value">{nfeData.protAutorizacao}</span>
          </div>
        </div>

        <div className="d-row">
          <div className="d-cell flex-3">
            <span className="label">INSCRIÇÃO ESTADUAL</span>
            <span className="value">{nfeData.emitente.ie}</span>
          </div>
          <div className="d-cell flex-3">
            <span className="label">INSC. ESTADUAL DO SUBST. TRIB.</span>
            <span className="value">{nfeData.inscricaoEstadualST}</span>
          </div>
          <div className="d-cell flex-4">
            <span className="label">CNPJ</span>
            <span className="value">{nfeData.emitente.cnpj}</span>
          </div>
        </div>

        {/* DESTINATARIO */}
        <div className="d-section-title">DESTINATÁRIO/REMETENTE</div>
        <div className="d-row">
          <div className="d-cell flex-7">
            <span className="label">NOME/RAZÃO SOCIAL</span>
            <span className="value">{nfeData.destinatario.nome}</span>
          </div>
          <div className="d-cell flex-3">
            <span className="label">CNPJ/CPF</span>
            <span className="value">{nfeData.destinatario.cpfCnpj}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">DATA DA EMISSÃO</span>
            <span className="value text-right">{nfeData.dataEmissao}</span>
          </div>
        </div>
        <div className="d-row">
          <div className="d-cell flex-5">
            <span className="label">ENDEREÇO</span>
            <span className="value">{nfeData.destinatario.logradouro}, {nfeData.destinatario.nro}</span>
          </div>
          <div className="d-cell flex-3">
            <span className="label">BAIRRO/DISTRITO</span>
            <span className="value">{nfeData.destinatario.bairro}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">CEP</span>
            <span className="value">{nfeData.destinatario.cep}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">DATA DA SAÍDA/ENTRADA</span>
            <span className="value text-right">{nfeData.dataSaida}</span>
          </div>
        </div>
        <div className="d-row">
          <div className="d-cell flex-5">
            <span className="label">MUNICÍPIO</span>
            <span className="value">{nfeData.destinatario.municipio}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">UF</span>
            <span className="value">{nfeData.destinatario.uf}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">FONE/FAX</span>
            <span className="value">{nfeData.destinatario.fone}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">INSCRIÇÃO ESTADUAL</span>
            <span className="value">{nfeData.destinatario.ie}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">HORA DA SAÍDA</span>
            <span className="value text-right">{nfeData.horaSaida}</span>
          </div>
        </div>

        {/* FATURA */}
        <div className="d-section-title">FATURA</div>
        <div className="d-row d-fatura-box">
          <div className="d-cell flex-1">
            <div className="faturas-container">
              {nfeData.faturas.length > 0 ? (
                nfeData.faturas.map((f, i) => (
                  <div className="fatura-item" key={i}>
                    <span className="f-num">Núm.: {f.nDup}</span>
                    <span className="f-venc">Venc.: {f.dVenc}</span>
                    <span className="f-val">Valor: {f.vDup}</span>
                  </div>
                ))
              ) : (
                <span className="value">Pagamento à vista / Sem fatura</span>
              )}
            </div>
          </div>
        </div>

        {/* TOTAIS */}
        <div className="d-section-title">CÁLCULO DO IMPOSTO</div>
        <div className="d-row">
          <div className="d-cell flex-1">
            <span className="label">BASE DE CÁLCULO DO ICMS</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vBC)}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">VALOR DO ICMS</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vICMS)}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">BASE DE CÁLC. DO ICMS ST</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vBCST)}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">VALOR DO ICMS ST</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vST)}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">VALOR TOTAL DOS PRODUTOS</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vProd)}</span>
          </div>
        </div>
        <div className="d-row">
          <div className="d-cell flex-1">
            <span className="label">VALOR DO FRETE</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vFrete)}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">VALOR DO SEGURO</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vSeg)}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">DESCONTO</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vDesc)}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">OUTRAS DESP. ACESSÓRIAS</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vOutro)}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">VALOR DO IPI</span>
            <span className="value text-right">{formatCurrency(nfeData.totais.vIPI)}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">VALOR TOTAL DA NOTA</span>
            <span className="value text-right font-bold">{formatCurrency(nfeData.totais.vNF)}</span>
          </div>
        </div>

        {/* TRANSPORTADOR */}
        <div className="d-section-title">TRANSPORTADOR/VOLUMES TRANSPORTADOS</div>
        <div className="d-row">
          <div className="d-cell flex-4">
            <span className="label">RAZÃO SOCIAL</span>
            <span className="value">{nfeData.transporta.nome}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">FRETE POR CONTA</span>
            <span className="value">{nfeData.transporta.modFrete === '0' ? '0-Emitente' : nfeData.transporta.modFrete === '1' ? '1-Destinatário' : nfeData.transporta.modFrete}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">CÓDIGO ANTT</span>
            <span className="value">{nfeData.transporta.rntc}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">PLACA DO VEÍCULO</span>
            <span className="value">{nfeData.transporta.placa}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">UF</span>
            <span className="value">{nfeData.transporta.placaUF}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">CNPJ/CPF</span>
            <span className="value">{nfeData.transporta.cnpj}</span>
          </div>
        </div>
        <div className="d-row">
          <div className="d-cell flex-5">
            <span className="label">ENDEREÇO</span>
            <span className="value">{nfeData.transporta.endereco}</span>
          </div>
          <div className="d-cell flex-3">
            <span className="label">MUNICÍPIO</span>
            <span className="value">{nfeData.transporta.municipio}</span>
          </div>
          <div className="d-cell flex-1">
            <span className="label">UF</span>
            <span className="value">{nfeData.transporta.uf}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">INSCRIÇÃO ESTADUAL</span>
            <span className="value">{nfeData.transporta.ie}</span>
          </div>
        </div>
        <div className="d-row">
          <div className="d-cell flex-1">
            <span className="label">QUANTIDADE</span>
            <span className="value">{nfeData.transporta.qVol}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">ESPÉCIE</span>
            <span className="value">{nfeData.transporta.esp}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">MARCA</span>
            <span className="value">{nfeData.transporta.marca}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">NUMERAÇÃO</span>
            <span className="value">{nfeData.transporta.nVol}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">PESO BRUTO</span>
            <span className="value text-right">{nfeData.transporta.pesoB}</span>
          </div>
          <div className="d-cell flex-2">
            <span className="label">PESO LÍQUIDO</span>
            <span className="value text-right">{nfeData.transporta.pesoL}</span>
          </div>
        </div>

        {/* PRODUTOS */}
        <div className="d-section-title">DADOS DO PRODUTO/SERVIÇO</div>
        <div className="d-table-wrapper d-table-produtos">
          <table className="d-table">
            <thead>
              <tr>
                <th width="8%">CÓDIGO</th>
                <th width="32%">DESCRIÇÃO DO PRODUTO/SERVIÇO</th>
                <th width="6%">NCM/SH</th>
                <th width="4%">CST</th>
                <th width="4%">CFOP</th>
                <th width="4%">UNID.</th>
                <th width="6%">QTD.</th>
                <th width="6%">VLR. UNIT.</th>
                <th width="7%">VLR. TOTAL</th>
                <th width="6%">BC ICMS</th>
                <th width="6%">VLR. ICMS</th>
                <th width="5%">VLR. IPI</th>
                <th width="3%">ALÍQ. ICMS</th>
                <th width="3%">ALÍQ. IPI</th>
              </tr>
            </thead>
            <tbody>
              {nfeData.produtos.map((prod, idx) => (
                <tr key={idx}>
                  <td>{prod.cProd}</td>
                  <td className="text-left">{prod.xProd}</td>
                  <td>{prod.ncm}</td>
                  <td>{prod.cst}</td>
                  <td>{prod.cfop}</td>
                  <td>{prod.uCom}</td>
                  <td className="text-right">{parseFloat(prod.qCom).toFixed(4)}</td>
                  <td className="text-right">{parseFloat(prod.vUnCom).toFixed(4)}</td>
                  <td className="text-right">{formatCurrency(prod.vProd)}</td>
                  <td className="text-right">{formatCurrency(prod.vBC)}</td>
                  <td className="text-right">{formatCurrency(prod.vICMS)}</td>
                  <td className="text-right">{formatCurrency(prod.vIPI)}</td>
                  <td className="text-right">{prod.pICMS ? parseFloat(prod.pICMS).toFixed(2) : ''}</td>
                  <td className="text-right">{prod.pIPI ? parseFloat(prod.pIPI).toFixed(2) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DADOS ADICIONAIS */}
        <div className="d-section-title">DADOS ADICIONAIS</div>
        <div className="d-row d-obs">
          <div className="d-cell flex-7">
            <span className="label">INFORMAÇÕES COMPLEMENTARES</span>
            <span className="value">{nfeData.infoComplementar}</span>
          </div>
          <div className="d-cell flex-3">
            <span className="label">RESERVADO AO FISCO</span>
            <span className="value"></span>
          </div>
        </div>

      </div>
    </div>
  );
}

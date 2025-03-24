// ... (JOGAR O ARQUIVO DENTRO!) ...

const dropArea = document.getElementById('drop-area');
const pdfInput = document.getElementById('pdfInput');

// Evita o comportamento padrão do navegador ao arrastar um arquivo
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Adiciona a classe 'highlight' quando o arquivo está sendo arrastado sobre a área
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

// Remove a classe 'highlight' quando o arquivo sai da área ou é solto
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

// Lida com o evento 'drop' (quando o arquivo é solto)
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    if (files.length > 0 && files[0].type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = function (e) {
            const pdfData = new Uint8Array(e.target.result);
            analyzePDF(pdfData); // Passa os dados corretos para a função
        };
        reader.readAsArrayBuffer(files[0]); // Lê o arquivo como ArrayBuffer
    } else {
        alert('Por favor, selecione um arquivo PDF válido.');
    }
}

// Lida com o evento 'change' do input (quando o usuário seleciona um arquivo)
pdfInput.addEventListener('change', function () {
    const file = pdfInput.files[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = function (e) {
            const pdfData = new Uint8Array(e.target.result);
            analyzePDF(pdfData);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Por favor, selecione um arquivo PDF válido.');
    }
});







let fullTextFromPDF = ''; // Variável global para armazenar o texto completo

document.getElementById('pdfInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const pdfData = new Uint8Array(e.target.result);
            analyzePDF(pdfData);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Por favor, selecione um arquivo PDF válido.');
    }
});

async function analyzePDF(pdfData) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

    try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ');
        }
        fullTextFromPDF = fullText; // Salva o texto completo na variável global
        document.getElementById('fullTextOutput').textContent = fullTextFromPDF;

        // Executar o novo código para extrair variáveis
        const newResults = extractVariables(fullText);

        // Exibir os resultados na nova área
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = ''; // Limpa o conteúdo anterior
        
        // Cria um elemento <p> para a mensagem
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong>⮑ Dada a grande quantidade e variedade de exames disponíveis em nosso Hospital, nem todos ainda se encontram catalogados na base de dados deste site. Nesses casos, eles aparecerão relacionados nesta seção.</strong><br><strong>⮑ CONFIRA CUIDADOSAMENTE OS VALORES AQUI APRESENTADOS E, CASO CONSTE APENAS O NOME DO EXAME, PREENCHA COM AS DEVIDAS INFORMAÇÕES NO RESPECTIVO ESPAÇO!</strong><br><strong>⮑ No mais, favor entrar em contato com o <a href="https://w.app/asklepios_solucoes_medicas" target="_blank" class="support-link">suporte</a> para que possamos acrescentá-los! \uD83D\uDE0A</strong>`;

        outputDiv.appendChild(messageElement);
        
        // Adiciona os resultados
        outputDiv.innerHTML += newResults;
                document.getElementById('new-results').classList.remove('hidden');

        // Adicionar botão "Copiar"
    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copiar';
    copyButton.style.backgroundColor = 'green';
    copyButton.style.color = 'white';
    copyButton.style.padding = '10px';
    copyButton.style.border = 'none';
    copyButton.style.cursor = 'pointer';
    copyButton.style.marginTop = '20px';

    // Função para copiar os resultados
    copyButton.onclick = () => {
        try {
            // Coletar todos os itens de resultado (.result-item)
            const resultItems = document.getElementById('output').querySelectorAll('.result-item');
            let textToCopy = Array.from(resultItems).map(item => {
                const label = item.querySelector('label').textContent.trim(); // Texto do rótulo
                const input = item.querySelector('input');
                const value = input.value.trim(); // Valor do campo de entrada
                return value ? `${label}: ${value}` : label; // Incluir o valor se existir, senão apenas o rótulo
            }).join('\n');

            // Copiar o texto para a área de transferência
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert('Resultados copiados com sucesso!');
            }).catch(err => {
                console.error('Falha ao copiar resultados:', err);
                alert('Ocorreu um erro ao copiar os resultados.');
            });
        } catch (error) {
            console.error('Erro ao processar cópia:', error);
            alert('Ocorreu um erro ao copiar os resultados.');
        }
    };

    document.getElementById('output').appendChild(copyButton);

        // Agora, chame a função para extrair os dados antigos
        extractData(fullText);

    } catch (error) {
        console.error('Erro ao carregar o PDF:', error);
        alert('Erro ao processar o PDF. Verifique o console para mais detalhes.');
    }
}


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



function extractData(text) {
    // Expressões regulares ajustadas
    const pctRegex = /Nome\s*:\s*(.*?)\s*Procedência\s*:/;
    const sexoRegex = /([A-Z])\s*Data\s+de\s+Impressão/i;
    const idadeRegex = /Data\s+de\s+Nasc\.\s*:\s*(\d{2}\/\d{2}\/\d{4})/i;

    const dataExameRegex = /Data de Atendimento\s*:\s*(\d{2}\/\d{2}\/\d{4})/;
    const hbRegex = /Hemoglobina[\s\S]*?\.+\s*:\s*([\d.,]+)(?=\s*g\/dL)/;
    const htRegex = /Hematócrito\.+:\s*([\d.,]+)/;
    const vcmRegex = /VCM[\s\S]*?\.+\s*:\s*([\d.,]+)(?=\s*fL)/;
    const hcmRegex = /HCM\.+:\s*([\d.,]+)/;
    const chcmRegex = /CHCM\.+:\s*([\d.,]+)/;
    const rdwRegex = /RDW\.+:\s*([\d.,]+)/;
    const hematoscopiaRegex = /HEMATOSCOPIA\s*:\s*([\s\S]*?)\s*LEUCOGRAMA/;
    const leucocitosTotaisRegex = /Leucócitos Totais\s*\.+:\s*([\d.,]+)/;
    const promielocitosRegex = /Promielócitos\.+:\s*([\d.,]+)\s+([\d.,]+)/;
    const mielocitosRegex = /Mielócitos[\s\S]*?\.+\s*:\s*([\d.,]+)\s+([\d.,]+)(?=\s+\d+|\s+Metamielócitos)/;
    const metamielocitosRegex = /Metamielócitos\.+:\s*([\d.,]+)\s+([\d.,]+)/;
    const bastoesRegex = /Bastões[\s\S]*?\.+\s*:\s*([\d.,]+)\s+([\d.,]+)(?=\s+\d+|\s+Segmentados)/;
    const segmentadosRegex = /Segmentados[\s\S]*?\.+\s*:\s*([\d.,]+)\s+([\d.,]+)(?=\s+\d+|\s+Eosinófilos)/;
    const eosinofilosRegex = /Eosinófilos\.+:\s*([\d.,]+)\s+([\d.,]+)/;
    const basofilosRegex = /Basófilos[\s\S]*?\.+\s*:\s*([\d.,]+)\s+([\d.,]+)(?=\s+\d+|\s+Linfócitos)/;
    const linfocitosRegex = /Linfócitos[\s\S]*?\.+\s*:\s*([\d.,]+)\s+([\d.,]+)(?=\s+\d+|\s+Linfócitos+Atípicos)/;
    const linfocitosAtipicosRegex = /Linfócitos Atipicos\.+:\s*([\d.,]+)\s+([\d.,]+)/;
    const monocitosRegex = /Monócitos\.+:\s*([\d.,]+)\s+([\d.,]+)/;
    const blastosRegex = /Blastos[\s\S]*?\.+\s*:\s*([\d.,]+)\s+([\d.,]+)(?=\s+\d+|\s+Plasmócitos)/;
    const plasmocitosRegex = /Plasmócitos\.+:\s*([\d.,]+)\s+([\d.,]+)/;
    const plaquetasRegex = /PLAQUETAS\s*\.+:\s*([\d.,]+)/;
    const tempoProtrombinaRegex = /Automatizado\s+TEMPO\s+DE\s+PROTROMBINA[\s.:]+([\d.,]+)\s*seg\./;
    const atividadeProtrombinaRegex = /seg\.\s*ATIVIDADE\s+DE\s+PROTROMBINA[\s.:]+([\d.,]+)\s*%/;
    const inrRegex = /INR[\s.:]+([\d.,]+)\s*(?=Valores)/;
    const ureiaRegex = /UREIA\s*\.+\s*:\s*(\d+)/;
    const creatininaRegex = /CREATININA\s*\.+\s*:\s*([\d.,]+)/;
    const sodioRegex = /SODIO\s*\.+\s*:\s*(\d+)/;
    const potassioRegex = /POTASSIO\s*\.+\s*:\s*([\d.,]+)/;
    const magnesioRegex = /MAGNESIO\s*\.+\s*:\s*([\d.,]+)/;
    const calcioTotalRegex = /CALCIO TOTAL\s*\.+\s*:\s*([\d.,]+)/;
    const fosforoRegex = /FOSFORO\s*\.+\s*:\s*([\d.,]+)/;
    const cloroRegex = /CLORO\s*\.+\s*:\s*(\d+)/;
    const glicemiaRegex = /GLICEMIA\s*\.+\s*:\s*([\d.,]+)/;
    const pcrRegex = /PROTEINA C REATIVA QUANTITATIVA\s*\.+\s*:\s*([\d.,]+)/;
    const tgoAstRegex = /AST\/TGO\s*\.+\s*:\s*(\d+)/;
    const tgpAltRegex = /ALT\/TGP\s*\.+\s*:\s*(\d+)/;

    const CPKRegex = /CREATINO FOSFOQUINASE\s*\(CPK\)[\s\S]*?:\s*([\d.,]+)[\s\S]*?Material/i;
    const ddimeroRegex = /D-DIMERO\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Material/i;
    const feritinaRegex = /FERRITINA\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Material/i;

    const troponinaiRegex = /TROPONINA\s+"I"\s*\.+\s*:\s*([\d.,]+)/i;
    const LDHRegex = /LACTATO DESIDROGENASE\s*\(LDH\)\s*\.+\s*:\s*([\d.,]+)/i;
    const IGARegex = /IMUNOGLOBULINA\s*\(IGA\)\s*\.+\s*:\s*([\d.,]+)/i;
    const IGMRegex = /IMUNOGLOBULINA\s*\(IGM\)\s*\.+\s*:\s*([\d.,]+)/i;
    const IGGRegex = /IMUNOGLOBULINA\s*\(IGG\)\s*\.+\s*:\s*([\d.,]+)/i;
    const uphRegex = /UREIA\s+PÓS\s+HEMODIÁLISE\s*\.+\s*:\s*([\d.,]+)/i;
    const ferrosericoRegex = /FERRO\s+SERICO\s*\.+\s*:\s*([\d.,]+)/i;
    const FARegex = /FOSFATASE\s+ALCALINA\s*\.+\s*:\s*([\d.,]+)/i;
    const istRegex = /ÍNDICE\s+SAT\.\s+TRANSFERRINA\s*\.+\s*:\s*([\d.,]+)/i;
    const T4Regex = /T4\s+LIVRE\s+-\s+TIROXINA\s*\.+\s*:\s*([\d.,]+)/i;
    const TSHRegex = /TSH\s+-\s+HORMONIO\s+TIREOESTIMULANTE\s*\.+\s*:\s*([\d.,]+)/i;
    const vitaminaDRegex = /VITAMINA\s+D\s+-\s+25\s+HIDROXI\s*\.+\s*:\s*([\d.,]+)/i;
    const PTHintactoRegex = /PTH\s+INTACTO\s*\.+\s*:\s*([\d.,]+)/i;
    const gamaGGTRegex = /GAMA\s+GGT\s*\.+\s*:\s*([\d.,]+)/i;
    const lipaseRegex = /LIPASE\s*\.+\s*:\s*([\d.,]+)/i;
    const amilaseRegex = /AMILASE\s*\.+\s*:\s*([\d.,]+)/i;
    const vitB12Regex = /VITAMINA\s+B12\s*\.+\s*:\s*([^\n]+?)\s+Material:/i;
    const fibrinogenioRegex = /FIBRINOGENIO\s*\.+\s*:\s*([\d.,]+)/i;
    const CKMBRegex = /CK-MB\s*\.+\s*:\s*([\d.,]+)/i;
    const uroculturaRegex = /UROCULTURA[\s\S]*?Urina\s+Resultado:\s*[\.\s]*([^\n]+?)(?=\s+VALOR\s+DE\s+REFERENCIA:)/i;

    // Regex para PROTEÍNA TOTAL E FRAÇÕES:
    const proteinatotalfracoesExistRegex = /PROTEINA TOTAL E FRAÇÕES/;
    const proteinatotaisPTFRegex = /Colorimétrico\s+PROTEINA\s+TOTAIS\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valores Referenciais/i;
    const albuminaPTFRegex = /g\/dL\s+ALBUMINA\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valores Referenciais/i;
    const globulinasPTFRegex = /g\/dL\s+GLOBULINAS\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valores Referenciais/i;
    const relacaoPTFRegex = /RELAÇÃO\s+ALB\/GLOB\s*\.+\s*:\s*([\d,]+)/i;

    // Regex para LIPIDOGRAMA:
    const perfillipidicoExistRegex = /PERFIL LIPIDICO \(LIPIDOGRAMA\)/i;
    const colesteroltotalPLRegex = /COLESTEROL\s+TOTAL\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valor de Referencia/i;
    const hdlcolesterolPLRegex = /HDL\s+COLESTEROL\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valor de Referencia/i;
    const ldlcolesterolPLRegex = /LDL\s+COLESTEROL\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valor de Referencia/i;
    const vldlcolesterolPLRegex = /VLDL\s+COLESTEROL\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valor de Referencia/i;
    const trigliceridesPLRegex = /TRIGLICERIDES\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valor de Referencia/i;
    const indicecastelliIPLRegex = /INDICE\s+DE\s+CASTELLI\s+I\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valor de Referencia/i;
    const indicecastelliIIPLRegex = /INDICE\s+DE\s+CASTELLI\s+II\s*\.+\s*:\s*([\d.,]+)[\s\S]*?Valor de Referencia/i;

    //Sorológicos
    const antihbcigmRegex = /ANTI\s*-\s*HBc\s+IgM\s*\(HEPATITE\s+B\)\s*\.+\s*:\s*([\d.,]+)/i;
    const antihbctotalRegex = /ANTI\s*-\s*HBc\s+TOTAL\s*\(HEPATITE\s+B\)\s*\.+\s*:\s*([\d.,]+)/i;
    const antihbsRegex = /ANTI\s*-\s*HBS\s*\(HEPATITE\s+B\)\s*\.+\s*:\s*([\d.,]+)/i;
    const dasvhbRegex = /Detecção\s+de\s+Antígeno\s+de\s+Superfície\s+do\s+Vírus\s+da\s+Hepate\s+B\s+\(HBS-Ag\)\s+Resultado[\s\S]*?(NÃO REAGENTE|REAGENTE)[\s\S]*?Metodologia:/i;
    const hbsagRegex = /HbSAg\s*\(HEPATITE\s+B\)\s*\.+\s*:\s*([\d.,]+)/i;
    const dacvhcRegex = /Detecção\s+de\s+Anticorpo\s+contra\s+o\s+vírus\s+da\s+hepatite\s+C\s+\(anti-HCV\)\s+Resultado[\s\S]*?(NÃO REAGENTE|REAGENTE)[\s\S]*?Metodologia/i;    
    const antihcvRegex = /ANTI\s*-\s*HCV\s*\(HEPATITE\s+C\)\s*\.+\s*:\s*([\d.,]+)/i;
    const VDRLRegex = /VDRL\s*\.+\s*:\s*([^\n]+?)\s+Material:/i;
    const daANTIHIV1e2 = /DETECÇÃO\s+DE\s+ANTICORPOS\s+ANTI-HIV\s+1\s+E\s+2\s+Resultado[\s\S]*?(Não Reagente|Reagente|Indeterminada)[\s\S]*?Material/i;
    const hiv1e2Regex = /HIV\s+1\s+e\s+2,\s+ANTÍGENO\/ANTICORPOS\s*\.+\s*:\s*([\d.,]+)/i;
    const aIgGcTPRegex = /ANTICORPO\s+IgG\s+CONTRA\s+TREPONEMA\s+PALLIDUM\s+Resultado[\s\S]*?(Não Reagente|Reagente)[\s\S]*?Material/i;

    //Continuando...
    const ttpExistRegex = /TTP - TEMPO DE TROMBOPLASTINA PARCIAL ATIVADA/;
    const ttpaRegex = /TTPA\s*\.+\s*:\s*([\d.,]+)/;
    const ratioRegex = /RATIO\s*\.+\s*:\s*([\d.,]+)/;
    const bilirrubinaExistRegex = /BILIRRUBINA TOTAL E FRAÇÕES/;
    const btRegex = /BILIRRUBINA TOTAL\s*\.+\s*:\s*([\d.,]+)/;
    const bdRegex = /BILIRRUBINA DIRETA\s*\.+\s*:\s*([\d.,]+)/;
    const biRegex = /BILIRRUBINA INDIRETA\s*\.+\s*:\s*([\d.,]+)/;
    const gasometriaExistRegex = /GASOMETRIA ARTERIAL, ELETROLITOS E METABOLITOS/;
    const fio2Regex = /FIO2\s*:\s*([\d.,]+)%/;
    const phRegex = /pH\s*:\s*([\d.,]+)/;
    const pco2Regex = /pCO2\s*:\s*([\d.,]+)/;
    const po2Regex = /pO2\s*:\s*([\d.,]+)/;
    const hco3Regex = /HCO³\s*:\s*([\d.,]+)/;
    const beRegex = /BE\s*\(B\)\s*:\s*([\d.,-]+)/; // Notice the - to include negative numbers
    const so2Regex = /sO²\s*.*?:.*?\s*([\d.,]+)\s*%/;
    const lacRegex = /Lac\s*:\s*([\d.,]+)/;
    
    const gasometriaVenosaExistRegex = /GASOMETRIA VENOSA, ELETROLITOS E METABOLITOS/;
    const fio2VenosoRegex = /FIO2\s*\.*\s*:\s*(?:[\d.,]+\s+)?([\d.,]+)%/;
    const phVenosoRegex = /pH\s*\.+\s*:\s*([\d.,]+)/;
    const pco2VenosoRegex = /pCO 2\s*\.*:\s*([\d.,]+)(?:\s+mmHg)?/;
    const po2VenosoRegex = /pO 2\s*\.*:\s*([\d.,]+)(?:\s+mmHg)?/;
    const hco3VenosoRegex = /HCO³\s*\.+\s*:\s*([\d.,]+)/;
    const beVenosoRegex = /BE\s*\(B\)\s*\.+\s*:\s*([\d.,-]+)/;
    const sato2VenosoRegex = /sO²\s*\.*:\s*([\d.,]+)\s*%/;
    const lacVenosoRegex = /Lac\s*\.+\s*:\s*([\d.,]+)/;

    // Regex para EAS
    const easExistRegex = /ELEMENTOS ANORMAIS DO SEDIMENTO - EAS/;
    const corRegex = /Cor\s*\.+\s*:\s*([^\s]+(?:\s+[^\s]+)?)(?=\s+(?:[A-Z]|Aspecto))/;
    const aspectoRegex = /Aspecto[\s\S]*?\.+\s*:\s*([\w\s]+?)(?=\s*Límpido\s+ANÁLISE)/i;
    const phEASRegex = /pH\s*:\s*([\d.,]+)/;
    const densidadeRegex = /Densidade[\s\S]*?[:.]+\s*([\d,]+)/;
    const proteinasRegex = /1\.030\s+Proteínas\s*\.+\s*:\s*([\s\S]+?)\s+Ausentes\s+Glicose/i;
    const glicoseRegex = /Glicose\s*\.+\s*:\s*([\s\S]+?)(?=\s+Ausente\s+Cetona)/i;
    const cetonaRegex = /Cetona[\s\S]*?\.+\s*:\s*([\w\s]+?)(?=\s+Ausente\s+Bilirrubina)/i;
    const bilirrubinaEASRegex = /Bilirrubina[\s\S]*?\.+\s*:\s*([\w\s]+?)(?=\s+Ausente\s+Sangue)/i;
    const sangueEASRegex = /Ausente\s+Sangue\s*\.+\s*:\s*([\s\S]+?)\s+Ausente\s+Urobilinogênio/i;
    const urobilinogenioRegex = /Urobilinogênio[\s\S]*?\.+\s*:\s*([\w\s]+?)(?=\s+Normal\s+Nitrito)/i;
    const nitritoRegex = /Nitrito[\s\S]*?\.+\s*:\s*([\w\s]+?)(?=\s+Negativo\s+Ácido)/i;
    const acidoAscorbicoRegex = /Ácido Ascórbico\s*\.+\s*:\s*([\s\S]+?)\s+Ausente\s+Esterase/i;
    const esteraseLeucocitariaRegex = /Esterase Leucocitária[\s\S]*?\.+\s*:\s*([\w\s]+?)(?=\s+Negativo\s+ANÁLISE)/i;
    const celulasEpitRegex = /Células epiteliais\s*\.+\s*:\s*([\s\S]+?)\s+Ausente\s+Leucócitos/i;
    const leucocitosRegex = /Leucócitos \/ Piócitos[\s\S]*?\.+\s*:\s*([\d.,]+)(?=\s*\/mL)/;
    const hemaciasRegex = /Hemácias[\s\S]*?\.+\s*:\s*([\d.,]+)(?=\s*\/mL\s+<\s+ou\s+=\s+a\s+8\.000\/mL)/;
    const cilindrosRegex = /Cilindros[\s\S]*?\.+\s*:\s*([\w\s]+?)(?=\s+Ausente\s+Cristais)/i;
    const cristaisRegex = /Cristais[\s\S]*?\.+\s*:\s*([\w\s]+?)(?=\s+Ausente\s+Filamento)/i;
    const filamentoMucoRegex = /Ausente\s+Filamento de Muco\s*\.+\s*:\s*([\w\s()+-]+?)(?=\s+Ausente)/i;
    const infcomplementaresEASRegex = /Filamento de Muco\s*\.+\s*:\s*(?:Presente\s*\([+]?\)\s*)?(?:Ausente\s*\(s\)\s*|Ausente\s+)?(?<!Ausente\s)\bAusente\b\s*([\s\S]*?)(?=\s*Data e Hora)/i;
    
    // HARDCASES
    //BIOQUIMICA LÍQUIDOS BIOLÓGICOS:
    const BLBExistRegex = /BIOQUIMICA LÍQUIDOS BIOLÓGICOS/;
    const materialBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS\s+Material:\s*([^\n]*?)(?=\s+Metodo:\s+Enzimático\s+Colorimétrico)/i;
    const glicoseBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Glicose\s*\.+\s*:\s*([\d.,]+)/i;
    const colesterolBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Colesterol\s*\.+\s*:\s*([\d.,]+)/i;
    const trigliceridesBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Triglicerides\s*\.+\s*:\s*([\d.,]+)/i;
    const proteinatotaisBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Proteina\s+Totais\s*\.+\s*:\s*([\d.,]+)/i;
    const albuminaBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Albumina\s*\.+\s*:\s*([\d.,]+)/i;
    const amilaseBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Amilase\s*\.+\s*:\s*([\d.,]+)/i;
    const DHLBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?D\.H\.L\s*\.+\s*:\s*([\d.,]+)/i;
    const pHBLBRegex = /BIOQUIMICA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?p\.H\s*\.+\s*:\s*([\d.,]+)/i;

    //CITOMETRIA LÍQUIDOS BIOLÓGICOS:
    const CLBExistRegex = /CITOMETRIA LÍQUIDOS BIOLÓGICOS/;
    const materialCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Material\s*\.*:\s*([^\n]+?)(?=\s+Cor)/i;
    const corCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Cor\s*\.*:\s*([^\n]+?)(?=\s+Valor)/i;
    const aspectoCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Aspecto\s*\.*:\s*([^\n]+?)(?=\s+Valor)/i;
    const leucocitosCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Leucócitos\s*\.*:\s*([\d.,]+)(?=\s+\/mm3\s+Hemácias)/i;
    const linfocitosCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Linfócitos\s*\.*:\s*([\d.,]+)(?=\s*%\s+Neutrófilos)/i;        
    const neutrofilosCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Neutrófilos\s*\.*:\s*([\d.,]+)(?=\s*%\s+Monócitos)/i;
    const monocitosCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Monócitos\s*\.*:\s*([\d.,]+)(?=\s*%\s+Eosinófilos)/i;
    const eosinofilosCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Eosinófilos\s*\.*:\s*([\d.,]+)(?=\s*%\s+data)/i;
    const hemaciasCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Hemácias\s*\.*:\s*([\d.,]+)(?=\s+\/mm3\s+DIFERENCIAL)/i;
    const OBSCLBRegex = /CITOMETRIA\s+LÍQUIDOS\s+BIOLÓGICOS[\s\S]*?Liberado\s+em:\s+\d{2}\/\d{2}\/\d{4}-\d{2}:\d{2}\s*(?:hr|h|hs)\s*([\s\S]*?)(?=\s*\.?\s*Liberado Eletronicamente)/i;

    //BAAR
    const BAARExistRegex = /BACILOSCOPIA \(BAAR\)/;
    const materialBAARRegex = /BACILOSCOPIA\s*\(BAAR\)[\s\S]*?Material:\s*([^\n]+?)(?=\s+Método)/i;
    const resultadoBAARRegex = /BACILOSCOPIA\s*\(BAAR\)[\s\S]*?Resultado\s*\.+\s*:\s*([^\n]+?)(?=\s+Escala\s+semi-quantitativa)/i;

    //GRAM
    const GRAMExistRegex = /BACTERIOSCOPIA \(GRAM\)/;
    const materialGRAMRegex = /BACTERIOSCOPIA\s*\(GRAM\)[\s\S]*?Material:\s*([^\n]+?)(?=\s+Método)/i;
    const resultadoGRAMRegex = /BACTERIOSCOPIA\s*\(GRAM\)[\s\S]*?Resultado\s*\.+\s*:\s*([^\n]+?)(?=\s+Data)/i;
    
    //CULTURA DE BACTERIAS AERÓBIAS
    const CBAExistRegex = /CULTURA DE BACTERIAS AERÓBIAS/;
    const materialCBARegex = /CULTURA\s+DE\s+BACTERIAS\s+AERÓBIAS[\s\S]*?Material:\s*([^\n]+?)(?=\s+Método)/i;
    const resultadoCBARegex = /CULTURA\s+DE\s+BACTERIAS\s+AERÓBIAS[\s\S]*?Resultado\s*\.+\s*:\s*([^\n]+?)(?=\s+(?:Valor\s+de\s+Referência|Observação))/i;
    const OBSCBARegex = /CULTURA\s+DE\s+BACTERIAS\s+AERÓBIAS[\s\S]*?Observação:\s*([\s\S]+?)(?=\s*(?:Valor\s+de\s+Referência|Data\s+e\s+Hora))/i;

    //PESQUISA DE FUNGOS
    const PFExistRegex = /PESQUISA DE FUNGOS/;
    const materialPFRegex = /PESQUISA\s+DE\s+FUNGOS[\s\S]*?Material:\s*([^\n]+?)(?=\s+Método)/i;
    const resultadoPFRegex = /PESQUISA\s+DE\s+FUNGOS[\s\S]*?Resultado\s*\.+\s*:\s*([^\n]+?)(?=\s+Data\s+e\s+Hora)/i;

    //CULTURA DE FUNGOS
    const CFExistRegex = /CULTURA DE FUNGOS/;
    const materialCFRegex = /CULTURA\s+DE\s+FUNGOS[\s\S]*?Material:\s*([^\n]+?)(?=\s+Método)/i;
    const resultadoCFRegex = /CULTURA\s+DE\s+FUNGOS[\s\S]*?Resultado:\s*[\.\s]*([\s\S]*?)(?=\s+Valor\s+de\s+Referência:|Data\s+e\s+Hora)/i;
    
    //CULTURA MICOBACTÉRIAS:
    const CMExistRegex = /CULTURA MICOBACTÉRIAS/;
    const materialCMRegex = /CULTURA\s+MICOBACTÉRIAS[\s\S]*?Material:\s*([^\n]+?)(?=\s+Método)/i;
    const resultadoCMRegex = /CULTURA\s+DE\s+FUNGOS[\s\S]*?Resultado:\s*[\.\s]*([\s\S]*?)(?=\s+Valor\s+de\s+Referência:|Data\s+e\s+Hora)/i;

    //HEMOCULTURA:
    const hemoculturaExistRegex = /HEMOCULTURA \(AERÓBIOS E LEVEDURAS\)/;
    const resultadohemoculturaRegex = /HEMOCULTURA\s*\(AERÓBIOS\s+E\s+LEVEDURAS\)[\s\S]*?Resultado\s*:\s*([\s\S]+?)(?=\s+(?:Observação|Data\s+e\s+Hora))/i;
    const OBShemoculturaRegex = /HEMOCULTURA\s*\(AERÓBIOS\s+E\s+LEVEDURAS\)[\s\S]*?Observação\s*:\s*([\s\S]+?)(?=\s+Valor\s+de\s+Referência)/i;


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



    // Extrai os valores
    const pctMatch = text.match(pctRegex);
    const sexoMatch = text.match(sexoRegex);
    const idadeMatch = text.match(idadeRegex);
    const dataExameMatch = text.match(dataExameRegex);
    const hbMatch = text.match(hbRegex);
    const htMatch = text.match(htRegex);
    const vcmMatch = text.match(vcmRegex);
    const hcmMatch = text.match(hcmRegex);
    const chcmMatch = text.match(chcmRegex);
    const rdwMatch = text.match(rdwRegex);
    const hematoscopiaMatch = text.match(hematoscopiaRegex);
    const leucocitosTotaisMatch = text.match(leucocitosTotaisRegex);
    const promielocitosMatch = text.match(promielocitosRegex);
    const mielocitosMatch = text.match(mielocitosRegex);
    const metamielocitosMatch = text.match(metamielocitosRegex);
    const bastoesMatch = text.match(bastoesRegex);
    const segmentadosMatch = text.match(segmentadosRegex);
    const eosinofilosMatch = text.match(eosinofilosRegex);
    const basofilosMatch = text.match(basofilosRegex);
    const linfocitosMatch = text.match(linfocitosRegex);
    const linfocitosAtipicosMatch = text.match(linfocitosAtipicosRegex);
    const monocitosMatch = text.match(monocitosRegex);
    const blastosMatch = text.match(blastosRegex);
    const plasmocitosMatch = text.match(plasmocitosRegex);
    const plaquetasMatch = text.match(plaquetasRegex);
    const tempoProtrombinaMatch = text.match(tempoProtrombinaRegex);
    const atividadeProtrombinaMatch = text.match(atividadeProtrombinaRegex);
    const inrMatch = text.match(inrRegex);
    const ureiaMatch = text.match(ureiaRegex);
    const creatininaMatch = text.match(creatininaRegex);
    const sodioMatch = text.match(sodioRegex);
    const potassioMatch = text.match(potassioRegex);
    const magnesioMatch = text.match(magnesioRegex);
    const calcioTotalMatch = text.match(calcioTotalRegex);
    const fosforoMatch = text.match(fosforoRegex);
    const cloroMatch = text.match(cloroRegex);
    const glicemiaMatch = text.match(glicemiaRegex);
    const pcrMatch = text.match(pcrRegex);
    const tgoAstMatch = text.match(tgoAstRegex);
    const tgpAltMatch = text.match(tgpAltRegex);

    const CPKMatch = text.match(CPKRegex);
    const ddimeroMatch = text.match(ddimeroRegex);
    const ferritinaMatch = text.match(feritinaRegex);
    const proteinatotalfracoesExistMatch = text.match(proteinatotalfracoesExistRegex);
    const proteinatotaisPTFMatch = text.match(proteinatotaisPTFRegex);
    const albuminaPTFMatch = text.match(albuminaPTFRegex);
    const globulinasPTFMatch = text.match(globulinasPTFRegex);
    const relacaoPTFMatch = text.match(relacaoPTFRegex);
    const troponinaiMatch = text.match(troponinaiRegex);
    const LDHMatch = text.match(LDHRegex);
    const antihbcigmMatch = text.match(antihbcigmRegex);
    const antihbctotalMatch = text.match(antihbctotalRegex);
    const antihbsMatch = text.match(antihbsRegex);
    const dasvhbMatch = text.match(dasvhbRegex);
    const hbsagMatch = text.match(hbsagRegex);
    const dacvhcMatch = text.match(dacvhcRegex);
    const antihcvMatch = text.match(antihcvRegex);
    const VDRLMatch = text.match(VDRLRegex);
    const daANTIHIV1e2Match = text.match(daANTIHIV1e2);
    const hiv1e2Match = text.match(hiv1e2Regex);
    const aIgGcTPMatch = text.match(aIgGcTPRegex);
    
    const IGAMatch = text.match(IGARegex);
    const IGMMatch = text.match(IGMRegex);
    const IGGMatch = text.match(IGGRegex);
    const uphMatch = text.match(uphRegex);
    const ferrosericoMatch = text.match(ferrosericoRegex);
    const FAMatch = text.match(FARegex);
    const istMatch = text.match(istRegex);
    //LIPIDOGRAMA
    const perfillipidicoExistMatch = text.match(perfillipidicoExistRegex);
    const colesteroltotalPLMatch = text.match(colesteroltotalPLRegex);
    const hdlcolesterolPLMatch = text.match(hdlcolesterolPLRegex);
    const ldlcolesterolPLMatch = text.match(ldlcolesterolPLRegex);
    const vldlcolesterolPLMatch = text.match(vldlcolesterolPLRegex);
    const trigliceridesPLMatch = text.match(trigliceridesPLRegex);
    const indicecastelliIPLMatch = text.match(indicecastelliIPLRegex);
    const indicecastelliIIPLMatch = text.match(indicecastelliIIPLRegex);
    //Continuando
    const T4Match = text.match(T4Regex);
    const TSHMatch = text.match(TSHRegex);
    const vitaminaDMatch = text.match(vitaminaDRegex);
    const PTHintactoMatch = text.match(PTHintactoRegex);
    const gamaGGTMatch = text.match(gamaGGTRegex);
    const lipaseMatch = text.match(lipaseRegex);
    const amilaseMatch = text.match(amilaseRegex);
    const vitB12Match = text.match(vitB12Regex);
    const fibrinogenioMatch = text.match(fibrinogenioRegex);  
    const CKMBMatch = text.match(CKMBRegex);
    const uroculturaMatch = text.match(uroculturaRegex)
    


    const ttpExistMatch = text.match(ttpExistRegex);
    const ttpaMatch = text.match(ttpaRegex);
    const ratioMatch = text.match(ratioRegex);
    const bilirrubinaExistMatch = text.match(bilirrubinaExistRegex);
    const btMatch = text.match(btRegex);
    const bdMatch = text.match(bdRegex);
    const biMatch = text.match(biRegex);
    const gasometriaExistMatch = text.match(gasometriaExistRegex);
    const fio2Match = text.match(fio2Regex);
    const phMatch = text.match(phRegex);
    const pco2Match = text.match(pco2Regex);
    const po2Match = text.match(po2Regex);
    const hco3Match = text.match(hco3Regex);
    const beMatch = text.match(beRegex);
    const so2Match = text.match(so2Regex);
    const lacMatch = text.match(lacRegex);
    const gasometriaVenosaExistMatch = text.match(gasometriaVenosaExistRegex);
    const fio2VenosoMatch = text.match(fio2VenosoRegex);
    const phVenosoMatch = text.match(phVenosoRegex);
    const pco2VenosoMatch = text.match(pco2VenosoRegex);
    const po2VenosoMatch = text.match(po2VenosoRegex);
    const hco3VenosoMatch = text.match(hco3VenosoRegex);
    const beVenosoMatch = text.match(beVenosoRegex);
    const sato2VenosoMatch = text.match(sato2VenosoRegex);
    const lacVenosoMatch = text.match(lacVenosoRegex);
    // Extrai os valores do EAS
    const easExistMatch = text.match(easExistRegex);
    const corMatch = text.match(corRegex);
    const aspectoMatch = text.match(aspectoRegex);
    const phEASMatch = text.match(phEASRegex);
    const densidadeMatch = text.match(densidadeRegex);
    const proteinasMatch = text.match(proteinasRegex);
    const glicoseMatch = text.match(glicoseRegex);
    const cetonaMatch = text.match(cetonaRegex);
    const bilirrubinaEASMatch = text.match(bilirrubinaEASRegex);
    const sangueEASMatch = text.match(sangueEASRegex);
    const urobilinogenioMatch = text.match(urobilinogenioRegex);
    const nitritoMatch = text.match(nitritoRegex);
    const acidoAscorbicoMatch = text.match(acidoAscorbicoRegex);
    const esteraseLeucocitariaMatch = text.match(esteraseLeucocitariaRegex);
    const celulasEpitMatch = text.match(celulasEpitRegex);
    const leucocitosMatch = text.match(leucocitosRegex);
    const hemaciasMatch = text.match(hemaciasRegex);
    const cilindrosMatch = text.match(cilindrosRegex);
    const cristaisMatch = text.match(cristaisRegex);
    const filamentoMucoMatch = text.match(filamentoMucoRegex);
    const infcomplementaresEASMatch = text.match(infcomplementaresEASRegex);
    
    // Extrai HARDCASES
    //BIOQUIMICA LÍQUIDOS BIOLÓGICOS
    const BLBExistMatch = text.match(BLBExistRegex);
    const materialBLBMatch = text.match(materialBLBRegex);
    const glicoseBLBMatch = text.match(glicoseBLBRegex);
    const colesterolBLBMatch = text.match(colesterolBLBRegex);
    const trigliceridesBLBMatch = text.match(trigliceridesBLBRegex);
    const proteinatotaisBLBMatch = text.match(proteinatotaisBLBRegex);
    const albuminaBLBMatch = text.match(albuminaBLBRegex);
    const amilaseBLBMatch = text.match(amilaseBLBRegex);
    const DHLBLBMatch = text.match(DHLBLBRegex);
    const pHBLBMatch = text.match(pHBLBRegex);

    //CITOMETRIA LÍQUIDOS BIOLÓGICOS:
    const CLBExistMatch = text.match(CLBExistRegex);
    const materialCLBMatch = text.match(materialCLBRegex);
    const corCLBMatch = text.match(corCLBRegex);
    const aspectoCLBMatch = text.match(aspectoCLBRegex);
    const leucocitosCLBMatch = text.match(leucocitosCLBRegex);
    const linfocitosCLBMatch = text.match(linfocitosCLBRegex);
    const neutrofilosCLBMatch = text.match(neutrofilosCLBRegex);
    const monocitosCLBMatch = text.match(monocitosCLBRegex);
    const eosinofilosCLBMatch = text.match(eosinofilosCLBRegex);
    const hemaciasCLBMatch = text.match(hemaciasCLBRegex);
    const OBSCLBMatch = text.match(OBSCLBRegex);
    
    //BAAR
    const BAARExistMatch = text.match(BAARExistRegex);
    const materialBAARMatch = text.match(materialBAARRegex);
    const resultadoBAARMatch = text.match(resultadoBAARRegex);
    
    //GRAM
    const GRAMExistMatch = text.match(GRAMExistRegex);
    const materialGRAMMatch = text.match(materialGRAMRegex);
    const resultadoGRAMMatch = text.match(resultadoGRAMRegex);

    //CULTURA DE BACTERIAS AERÓBIAS
    const CBAExistMatch = text.match(CBAExistRegex);
    const materialCBAMatch = text.match(materialCBARegex);
    const resultadoCBAMatch = text.match(resultadoCBARegex);
    const OBSCBAMatch = text.match(OBSCBARegex);

    //PESQUISA DE FUNGOS
    const PFExistMatch = text.match(PFExistRegex);
    const materialPFMatch = text.match(materialPFRegex);
    const resultadoPFMatch = text.match(resultadoPFRegex);

    //CULTURA DE FUNGOS
    const CFExistMatch = text.match(CFExistRegex);
    const materialCFMatch = text.match(materialCFRegex);
    const resultadoCFMatch = text.match(resultadoCFRegex);

    //CULTURA MICOBACTÉRIAS:
    const CMExistMatch = text.match(CMExistRegex);
    const materialCMMatch = text.match(materialCMRegex);
    const resultadoCMMatch = text.match(resultadoCMRegex);

    //HEMOCULTURA:
    const hemoculturaExistMatch = text.match(hemoculturaExistRegex);
    const resultadohemoculturaMatch = text.match(resultadohemoculturaRegex);
    const OBShemoculturaMatch = text.match(OBShemoculturaRegex);

    
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


    if (pctMatch) {
        document.getElementById('patient-name').textContent = pctMatch[1].trim();
        document.getElementById('patient-name-header').classList.remove('hidden');
   }
   
    // Exibe os resultados
    document.getElementById('pct').textContent = pctMatch ? pctMatch[1].trim() : 'Não encontrado';
    document.getElementById('sexo').textContent = sexoMatch ? sexoMatch[1].trim() : 'Não encontrado';

    //Idade:
    // Extrai a data de nascimento e calcula a idade:
    if (idadeMatch) {
      const dataNascimentoStr = idadeMatch[1].trim();
      const dataNascimento = new Date(dataNascimentoStr.split('/').reverse().join('-')); // Converte para o formato YYYY-MM-DD
      const hoje = new Date();

      const diffEmMilissegundos = hoje - dataNascimento;
      const diffEmDias = Math.floor(diffEmMilissegundos / (1000 * 60 * 60 * 24));
      const diffEmAnos = Math.floor(diffEmDias / 365.25); // Considera anos bissextos
      const diffEmMeses = Math.floor(diffEmDias / 30.4375); // Média de dias por mês
      const mesesRestantes = diffEmMeses % 12;
      const diasRestantes = diffEmDias % 30;

      document.getElementById('idade').textContent = `${diffEmAnos} ano(s), ${mesesRestantes} mês(es) e ${diasRestantes} dia(s)`;
    } else {
        document.getElementById('idade').textContent = 'Não encontrado';
    }

    //Sexo:
    document.getElementById('sexo').textContent = sexoMatch ? sexoMatch[1].trim() : 'Não encontrado';

    //Exames:
    document.getElementById('dataExame').textContent = dataExameMatch ? dataExameMatch[1].trim() : 'Não encontrado';
    document.getElementById('hb').textContent = hbMatch ? hbMatch[1].trim() : 'Não encontrado';
    document.getElementById('ht').textContent = htMatch ? htMatch[1].trim() : 'Não encontrado';
    document.getElementById('vcm').textContent = vcmMatch ? vcmMatch[1].trim() : 'Não encontrado';
    document.getElementById('hcm').textContent = hcmMatch ? hcmMatch[1].trim() : 'Não encontrado';
    document.getElementById('chcm').textContent = chcmMatch ? chcmMatch[1].trim() : 'Não encontrado';
    document.getElementById('rdw').textContent = rdwMatch ? rdwMatch[1].trim() : 'Não encontrado';
    document.getElementById('hematoscopia').textContent = hematoscopiaMatch ? (hematoscopiaMatch[1].trim() === "" || hematoscopiaMatch[1].trim() === " ") ? "Nada consta" : hematoscopiaMatch[1].trim() : 'Nada consta';
    document.getElementById('leucocitosTotais').textContent = leucocitosTotaisMatch ? leucocitosTotaisMatch[1].trim() : 'Não encontrado';
    document.getElementById('promielocitos').textContent = promielocitosMatch ? `${promielocitosMatch[1].trim()} / ${promielocitosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('mielocitos').textContent = mielocitosMatch ? `${mielocitosMatch[1].trim()} / ${mielocitosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('metamielocitos').textContent = metamielocitosMatch ? `${metamielocitosMatch[1].trim()} / ${metamielocitosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('bastoes').textContent = bastoesMatch ? `${bastoesMatch[1].trim()} / ${bastoesMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('segmentados').textContent = segmentadosMatch ? `${segmentadosMatch[1].trim()} / ${segmentadosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('eosinofilos').textContent = eosinofilosMatch ? `${eosinofilosMatch[1].trim()} / ${eosinofilosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('basofilos').textContent = basofilosMatch ? `${basofilosMatch[1].trim()} / ${basofilosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('linfocitos').textContent = linfocitosMatch ? `${linfocitosMatch[1].trim()} / ${linfocitosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('linfocitosAtipicos').textContent = linfocitosAtipicosMatch ? `${linfocitosAtipicosMatch[1].trim()} / ${linfocitosAtipicosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('monocitos').textContent = monocitosMatch ? `${monocitosMatch[1].trim()} / ${monocitosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('blastos').textContent = blastosMatch ? `${blastosMatch[1].trim()} / ${blastosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('plasmocitos').textContent = plasmocitosMatch ? `${plasmocitosMatch[1].trim()} / ${plasmocitosMatch[2].trim()}` : 'Não encontrado';
    document.getElementById('plaquetas').textContent = plaquetasMatch ? plaquetasMatch[1].trim() : 'Não encontrado';
    document.getElementById('tempoProtrombina').textContent = tempoProtrombinaMatch ? tempoProtrombinaMatch[1].trim() : 'Não encontrado';
    document.getElementById('atividadeProtrombina').textContent = atividadeProtrombinaMatch ? atividadeProtrombinaMatch[1].trim() : 'Não encontrado';
    document.getElementById('inr').textContent = inrMatch ? inrMatch[1].trim() : 'Não encontrado';
    document.getElementById('ureia').textContent = ureiaMatch ? ureiaMatch[1].trim() : 'Não encontrado';
    document.getElementById('creatinina').textContent = creatininaMatch ? creatininaMatch[1].trim() : 'Não encontrado';
    document.getElementById('sodio').textContent = sodioMatch ? sodioMatch[1].trim() : 'Não encontrado';
    document.getElementById('potassio').textContent = potassioMatch ? potassioMatch[1].trim() : 'Não encontrado';
    document.getElementById('magnesio').textContent = magnesioMatch ? magnesioMatch[1].trim() : 'Não encontrado';
    document.getElementById('calcioTotal').textContent = calcioTotalMatch ? calcioTotalMatch[1].trim() : 'Não encontrado';
    document.getElementById('fosforo').textContent = fosforoMatch ? fosforoMatch[1].trim() : 'Não encontrado';
    document.getElementById('cloro').textContent = cloroMatch ? cloroMatch[1].trim() : 'Não encontrado';
    document.getElementById('glicemia').textContent = glicemiaMatch ? glicemiaMatch[1].trim() : 'Não encontrado';
    document.getElementById('pcr').textContent = pcrMatch ? pcrMatch[1].trim() : 'Não encontrado';
    document.getElementById('tgoAst').textContent = tgoAstMatch ? tgoAstMatch[1].trim() : 'Não encontrado';
    document.getElementById('tgp').textContent = tgpAltMatch ? tgpAltMatch[1].trim() : 'Não encontrado';

    document.getElementById('ddimero').textContent = ddimeroMatch ? ddimeroMatch[1].trim() : 'Não encontrado';
    
    // Exibição dos resultados de PROTEÍNAS TOTAL E FRAÇÕES
    if (proteinatotalfracoesExistMatch) {
      const proteinatotaisPTF = proteinatotaisPTFMatch ? proteinatotaisPTFMatch[1].trim() : 'Não encontrado';
      const albuminaPTF = albuminaPTFMatch ? albuminaPTFMatch[1].trim() : 'Não encontrado';
      const globulinasPTF = globulinasPTFMatch ? globulinasPTFMatch[1].trim() : 'Não encontrado';
      const relacaoPTF = relacaoPTFMatch ? relacaoPTFMatch[1].trim() : 'Não encontrado';

      const proteinatotalfracoesText = `Proteína Totais: ${proteinatotaisPTF}<br>Albumina: ${albuminaPTF}<br>Globulinas: ${globulinasPTF}<br>Relação ALB/GLOB: ${relacaoPTF}`;

      document.getElementById('proteinatotalfracoes').innerHTML = proteinatotalfracoesText;
    } else {
        document.getElementById('proteinatotalfracoes').textContent = 'Não encontrado';
    }
    
    // Exibição dos resultados de LIPIDOGRAMA
    if (perfillipidicoExistMatch) {
      const colesteroltotalPL = colesteroltotalPLMatch ? colesteroltotalPLMatch[1].trim() : 'Não encontrado';
      const hdlcolesterolPL = hdlcolesterolPLMatch ? hdlcolesterolPLMatch[1].trim() : 'Não encontrado';
      const ldlcolesterolPL = ldlcolesterolPLMatch ? ldlcolesterolPLMatch[1].trim() : 'Não encontrado';
      const vldlcolesterolPL = vldlcolesterolPLMatch ? vldlcolesterolPLMatch[1].trim() : 'Não encontrado';
      const trigliceridesPL = trigliceridesPLMatch ? trigliceridesPLMatch[1].trim() : 'Não encontrado';
      const indicecastelliIPL = indicecastelliIPLMatch ? indicecastelliIPLMatch[1].trim() : 'Não encontrado';
      const indicecastelliIIPL = indicecastelliIIPLMatch ? indicecastelliIIPLMatch[1].trim() : 'Não encontrado';

      const perfillipidicoText = `Colesterol Total: ${colesteroltotalPL}<br>HDL: ${hdlcolesterolPL}<br>LDL: ${ldlcolesterolPL}<br>VLDL: ${vldlcolesterolPL}<br>Triglicérides: ${trigliceridesPL}<br>Índice de Castelli I: ${indicecastelliIPL}<br>Índice de Castelli II: ${indicecastelliIIPL}`;

      document.getElementById('perfillipidico').innerHTML = perfillipidicoText;
    } else {
        document.getElementById('perfillipidico').textContent = 'Não encontrado';
    }

    //CONTINUAÇÃO
    document.getElementById('FA').textContent = FAMatch ? FAMatch[1].trim() : 'Não encontrado';
    document.getElementById('dacvhc').textContent = dacvhcMatch ? dacvhcMatch[1].trim() : 'Não encontrado';
    document.getElementById('dasvhb').textContent = dasvhbMatch ? dasvhbMatch[1].trim() : 'Não encontrado';
    document.getElementById('VDRL').textContent = VDRLMatch ? VDRLMatch[1].trim() : 'Não encontrado';
    document.getElementById('aIgGcTP').textContent = aIgGcTPMatch ? aIgGcTPMatch[1].trim() : 'Não encontrado';
    document.getElementById('daANTIHIV1e2').textContent = daANTIHIV1e2Match ? daANTIHIV1e2Match[1].trim() : 'Não encontrado';
    document.getElementById('urocultura').textContent = uroculturaMatch ? uroculturaMatch[1].trim() : 'Não encontrado';
    


    
    // <<<<<<<<<<<<<<<<<<<<<NORMAIS, MAS COM VALOR DE REFERÊNCIA:>>>>>>>>>>>>>>>>>>>>>
    //CPK:
    if (CPKMatch && sexoMatch) {
      const valorCPK = CPKMatch[1].trim();
      const sexo = sexoMatch[1].trim();
      const interpretacao = interpretarCPK(valorCPK, sexo);
      document.getElementById('CPK').textContent = `${valorCPK} ${interpretacao}`;
    } else {
        document.getElementById('CPK').textContent = 'Não encontrado';
    }

    //Ferritina:
    if (ferritinaMatch && sexoMatch) {
      const valorFerritina = ferritinaMatch[1].trim();
      const sexo = sexoMatch[1].trim();
      const interpretacao = interpretarFerritina(valorFerritina, sexo);
      document.getElementById('ferritina').textContent = `${valorFerritina} ${interpretacao}`;
    } else {
        document.getElementById('ferritina').textContent = 'Não encontrado';
    }

    //Ferro Sérico:
    if (ferrosericoMatch && sexoMatch) {
      const valorFerroserico = ferrosericoMatch[1].trim();
      const sexo = sexoMatch[1].trim();
      const interpretacao = interpretarFerroserico(valorFerroserico, sexo);
      document.getElementById('ferroserico').textContent = `${valorFerroserico} ${interpretacao}`;
    } else {
        document.getElementById('ferroserico').textContent = 'Não encontrado';
    }

    //FA:
    if (FAMatch && idadeMatch) {
      const valorFA = FAMatch[1].trim();
      const dataNascimentoStr = idadeMatch[1].trim();
      const dataNascimento = new Date(dataNascimentoStr.split('/').reverse().join('-'));
      const hoje = new Date();
      const diffEmMilissegundos = hoje - dataNascimento;
      const diffEmDias = Math.floor(diffEmMilissegundos / (1000 * 60 * 60 * 24));
      const diffEmAnos = Math.floor(diffEmDias / 365.25);

      const interpretacao = interpretarFA(valorFA, diffEmAnos);
      document.getElementById('FA').textContent = `${valorFA} ${interpretacao}`;
    } else {
        document.getElementById('FA').textContent = 'Não encontrado';
    }

    //TSH:
    if (TSHMatch && idadeMatch) {
      const valorTSH = TSHMatch[1].trim();
      const dataNascimentoStr = idadeMatch[1].trim();
      const dataNascimento = new Date(dataNascimentoStr.split('/').reverse().join('-'));
      const hoje = new Date();
      const diffEmMilissegundos = hoje - dataNascimento;
      const diffEmDias = Math.floor(diffEmMilissegundos / (1000 * 60 * 60 * 24));
      const diffEmAnos = Math.floor(diffEmDias / 365.25);

      const interpretacao = interpretarTSH(valorTSH, diffEmDias, diffEmAnos);
      document.getElementById('TSH').textContent = `${valorTSH} ${interpretacao}`;
    } else {
        document.getElementById('TSH').textContent = 'Não encontrado';
    }
    
    //Gama GGT:
    if (gamaGGTMatch && sexoMatch) {
      const valorGamaGGT = gamaGGTMatch[1].trim();
      const sexo = sexoMatch[1].trim();
      const interpretacao = interpretarGamaGGT(valorGamaGGT, sexo);
      document.getElementById('gamaGGT').textContent = `${valorGamaGGT} ${interpretacao}`;
    } else {
        document.getElementById('gamaGGT').textContent = 'Não encontrado';
    }

    //Amilase:
    if (amilaseMatch && idadeMatch) {
      const valorAmilase = amilaseMatch[1].trim();
      const dataNascimentoStr = idadeMatch[1].trim();
      const dataNascimento = new Date(dataNascimentoStr.split('/').reverse().join('-'));
      const hoje = new Date();
      const diffEmMilissegundos = hoje - dataNascimento;
      const diffEmDias = Math.floor(diffEmMilissegundos / (1000 * 60 * 60 * 24));
      const diffEmAnos = Math.floor(diffEmDias / 365.25);

      const interpretacao = interpretarAmilase(valorAmilase, diffEmDias, diffEmAnos);
      document.getElementById('amilase').textContent = `${valorAmilase} ${interpretacao}`;
    } else {
        document.getElementById('amilase').textContent = 'Não encontrado';
    }

    //D-Dímero:
    if (ddimeroMatch) {
      const valorDdimero = ddimeroMatch[1].trim();
      const interpretacao = interpretarDdimero(valorDdimero);
      document.getElementById('ddimero').textContent = `${valorDdimero} ${interpretacao}`;
    } else {
        document.getElementById('ddimero').textContent = 'Não encontrado';
    }
    
    //Troponina I:
    if (troponinaiMatch) {
      const valorTroponinai = troponinaiMatch[1].trim();
      const interpretacao = interpretarTroponinai(valorTroponinai);
      document.getElementById('troponinai').textContent = `${valorTroponinai} ${interpretacao}`;
    } else {
        document.getElementById('troponinai').textContent = 'Não encontrado';
    }

    //LDH:
    if (LDHMatch) {
        const valorLDH = LDHMatch[1].trim();
        const interpretacao = interpretarLDH(valorLDH);
        document.getElementById('LDH').textContent = `${valorLDH} ${interpretacao}`;
    } else {
        document.getElementById('LDH').textContent = 'Não encontrado';
    }

    //CK-MB:
    if (CKMBMatch) {
      const valorCKMB = CKMBMatch[1].trim();
      const interpretacao = interpretarCKMB(valorCKMB);
      document.getElementById('CKMB').textContent = `${valorCKMB} ${interpretacao}`;
    } else {
        document.getElementById('CKMB').textContent = 'Não encontrado';
    }
    
    //IGA
    if (IGAMatch) {
      const valorIGA = IGAMatch[1].trim();
      const interpretacao = interpretarIGA(valorIGA);
        document.getElementById('IGA').textContent = `${valorIGA} ${interpretacao}`;
    } else {
        document.getElementById('IGA').textContent = 'Não encontrado';
    }

    //IGM:
    if (IGMMatch) {
      const valorIGM = IGMMatch[1].trim();
      const interpretacao = interpretarIGM(valorIGM);
      document.getElementById('IGM').textContent = `${valorIGM} ${interpretacao}`;
    } else {
        document.getElementById('IGM').textContent = 'Não encontrado';
    }

    //IGG:
    if (IGGMatch) {
        const valorIGG = IGGMatch[1].trim();
        const interpretacao = interpretarIGG(valorIGG);
        document.getElementById('IGG').textContent = `${valorIGG} ${interpretacao}`;
    } else {
        document.getElementById('IGG').textContent = 'Não encontrado';
    }
    
    //UPH:
    if (uphMatch) {
      const valorUPH = uphMatch[1].trim();
      const interpretacao = interpretarUPH(valorUPH);
      document.getElementById('uph').textContent = `${valorUPH} ${interpretacao}`;
    } else {
        document.getElementById('uph').textContent = 'Não encontrado';
    }

    //IST:
    if (istMatch) {
        const valorIST = istMatch[1].trim();
        const interpretacao = interpretarIST(valorIST);
        document.getElementById('ist').textContent = `${valorIST} ${interpretacao}`;
    } else {
        document.getElementById('ist').textContent = 'Não encontrado';
    }

    //T4:
    if (T4Match) {
      const valorT4 = T4Match[1].trim();
      const interpretacao = interpretarT4(valorT4);
      document.getElementById('T4').textContent = `${valorT4} ${interpretacao}`;
    } else {
        document.getElementById('T4').textContent = 'Não encontrado';
    }

    //Vitamina D:
    if (vitaminaDMatch) {
      const valorVitaminaD = vitaminaDMatch[1].trim();
      const interpretacao = interpretarVitaminaD(valorVitaminaD);
      document.getElementById('vitaminaD').textContent = `${valorVitaminaD} ${interpretacao}`;
    } else {
        document.getElementById('vitaminaD').textContent = 'Não encontrado';
    }

    //PTH Intacto:
    if (PTHintactoMatch) {
        const valorPTHintacto = PTHintactoMatch[1].trim();
        const interpretacao = interpretarPTHintacto(valorPTHintacto);
        document.getElementById('PTHintacto').textContent = `${valorPTHintacto} ${interpretacao}`;
    } else {
          document.getElementById('PTHintacto').textContent = 'Não encontrado';
    }
    
    //Lipase:
    if (lipaseMatch) {
      const valorLipase = lipaseMatch[1].trim();
      const interpretacao = interpretarLipase(valorLipase);
      document.getElementById('lipase').textContent = `${valorLipase} ${interpretacao}`;
    } else {
        document.getElementById('lipase').textContent = 'Não encontrado';
    }

    //Vitamina B12:
    if (vitB12Match) {
        const valorVitB12 = vitB12Match[1].trim();
        const interpretacao = interpretarVitB12(valorVitB12);
        document.getElementById('vitB12').textContent = `${valorVitB12} ${interpretacao}`;
    } else {
        document.getElementById('vitB12').textContent = 'Não encontrado';
    }

    //Fibrinogênio:
    if (fibrinogenioMatch) {
        const valorFibrinogenio = fibrinogenioMatch[1].trim();
        const interpretacao = interpretarFibrinogenio(valorFibrinogenio);
        document.getElementById('fibrinogenio').textContent = `${valorFibrinogenio} ${interpretacao}`;
    } else {
        document.getElementById('fibrinogenio').textContent = 'Não encontrado';
    }
    
    //<<<<<<<<<<<<<<<Sorológicos>>>>>>>>>>>>>>>
    
    //ANTI-HBc IgM (HEPATITE B):
    if (antihbcigmMatch) {
      const valorantihbcigm = antihbcigmMatch[1].trim();
      const interpretacao = interpretarantihbcigm(valorantihbcigm);
        document.getElementById('antihbcigm').textContent = `${valorantihbcigm} (${interpretacao})`;
    } else {
        document.getElementById('antihbcigm').textContent = 'Não encontrado';
    }

    //ANTI-HBc TOTAL (HEPATITE B):
    if (antihbctotalMatch) {
      const valorantihbctotal = antihbctotalMatch[1].trim();
      const interpretacao = interpretarantihbctotal(valorantihbctotal);
      document.getElementById('antihbctotal').textContent = `${valorantihbctotal} (${interpretacao})`;
    } else {
      document.getElementById('antihbctotal').textContent = 'Não encontrado';
    }

    //ANTI-HBS (HEPATITE B):
    if (antihbsMatch) {
      const valorantihbs = antihbsMatch[1].trim();
      const interpretacao = interpretarantihbs(valorantihbs);
      document.getElementById('antihbs').textContent = `${valorantihbs} (${interpretacao})`;
    } else {
        document.getElementById('antihbs').textContent = 'Não encontrado';
    }

    //HBSAG
    if (hbsagMatch) {
      const valorHbsAg = hbsagMatch[1].trim();
      const interpretacao = interpretarHbsAg(valorHbsAg);
        document.getElementById('hbsag').textContent = `${valorHbsAg} (${interpretacao})`;
    } else {
        document.getElementById('hbsag').textContent = 'Não encontrado';
    }

    //ANTI-HCV (HEPATITE C):
    if (antihcvMatch) {
      const valorantihcv = antihcvMatch[1].trim();
      const interpretacao = interpretarantihcv(valorantihcv);
      document.getElementById('antihcv').textContent = `${valorantihcv} (${interpretacao})`;
    } else {
        document.getElementById('antihcv').textContent = 'Não encontrado';
    }

    // HIV 1 e 2, ANTÍGENO/ANTICORPOS
    if (hiv1e2Match) {
      const valorhiv1e2 = hiv1e2Match[1].trim();
      const interpretacao = interpretarhiv1e2(valorhiv1e2);
        document.getElementById('hiv1e2').textContent = `${valorhiv1e2} (${interpretacao})`;
    } else {
        document.getElementById('hiv1e2').textContent = 'Não encontrado';
    }
    

    //CLÁSSICOS
    if (ttpExistMatch){
        document.getElementById('ttpaRatio').textContent = ttpaMatch && ratioMatch ? `${ttpaMatch[1].trim()} / ${ratioMatch[1].trim()}` : 'Não encontrado';
     } else {
        document.getElementById('ttpaRatio').textContent = 'Não encontrado';
     }
    if (bilirrubinaExistMatch){
        document.getElementById('bilirrubina').textContent = btMatch && bdMatch && biMatch ? `${btMatch[1].trim()} / ${bdMatch[1].trim()} / ${biMatch[1].trim()}` : 'Não encontrado';
       } else {
           document.getElementById('bilirrubina').textContent = 'Não encontrado';
       }
    
    if (gasometriaExistMatch) {
        const fio2 = fio2Match ? fio2Match[1].trim() : 'Não encontrado';
        const ph = phMatch ? phMatch[1].trim() : 'Não encontrado';
        const pco2 = pco2Match ? pco2Match[1].trim() : 'Não encontrado';
        const po2 = po2Match ? po2Match[1].trim() : 'Não encontrado';
        const hco3 = hco3Match ? hco3Match[1].trim() : 'Não encontrado';
        const be = beMatch ? beMatch[1].trim() : 'Não encontrado';
        const sato2 = so2Match ? so2Match[1].trim() : 'Não encontrado';
        const lac = lacMatch ? lacMatch[1].trim() : 'Não encontrado';
   
        const gasometriaText = `FIO2: ${fio2}%<br>pH: ${ph}<br>pCO2: ${pco2}<br>pO2: ${po2}<br>HCO3: ${hco3}<br>BE (B): ${be}<br>SatO2: ${sato2}%<br>Lac: ${lac}`;
   
        document.getElementById('gasometria').innerHTML = gasometriaText;
    } else {
       document.getElementById('gasometria').textContent = 'Não encontrado';
    }
   
    if (gasometriaVenosaExistMatch) {
        const fio2Venoso = fio2VenosoMatch ? fio2VenosoMatch[1].trim() : 'Não encontrado';
        const phVenoso = phVenosoMatch ? phVenosoMatch[1].trim() : 'Não encontrado';
        const pco2Venoso = pco2VenosoMatch ? pco2VenosoMatch[1].trim() : 'Não encontrado';
        const po2Venoso = po2VenosoMatch ? po2VenosoMatch[1].trim() : 'Não encontrado';
        const hco3Venoso = hco3VenosoMatch ? hco3VenosoMatch[1].trim() : 'Não encontrado';
        const beVenoso = beVenosoMatch ? beVenosoMatch[1].trim() : 'Não encontrado';
        const sato2Venoso = sato2VenosoMatch ? sato2VenosoMatch[1].trim() : 'Não encontrado';
        const lacVenoso = lacVenosoMatch ? lacVenosoMatch[1].trim() : 'Não encontrado';
    
        const gasometriaVenosaText = `FIO2: ${fio2Venoso}%<br>pH: ${phVenoso}<br>pCO2: ${pco2Venoso}<br>pO2: ${po2Venoso}<br>HCO3: ${hco3Venoso}<br>BE (B): ${beVenoso}<br>SatO2: ${sato2Venoso}%<br>Lac: ${lacVenoso}`;
    
        document.getElementById('gasometriaVenosa').innerHTML = gasometriaVenosaText;
    } else {
        document.getElementById('gasometriaVenosa').textContent = 'Não encontrado';
    }
    
    // Exibição dos resultados do EAS
    if (easExistMatch) {
        const cor = corMatch ? corMatch[1] : 'Não encontrado';
        const aspecto = aspectoMatch ? aspectoMatch[1].trim() : 'Não encontrado';
        const phEAS = phEASMatch ? phEASMatch[1].trim() : 'Não encontrado';
        const densidade = densidadeMatch ? densidadeMatch[1].trim() : 'Não encontrado';
        const proteinas = proteinasMatch ? proteinasMatch[1].trim() : 'Não encontrado';
        const glicose = glicoseMatch ? glicoseMatch[1].trim() : 'Não encontrado';
        const cetona = cetonaMatch ? cetonaMatch[1].trim() : 'Não encontrado';
        const bilirrubinaEAS = bilirrubinaEASMatch ? bilirrubinaEASMatch[1].trim() : 'Não encontrado';
        const sangueEAS = sangueEASMatch ? sangueEASMatch[1].trim() : 'Não encontrado';
        const urobilinogenio = urobilinogenioMatch ? urobilinogenioMatch[1].trim() : 'Não encontrado';
        const nitrito = nitritoMatch ? nitritoMatch[1].trim() : 'Não encontrado';
        const acidoAscorbico = acidoAscorbicoMatch ? acidoAscorbicoMatch[1].trim() : 'Não encontrado';
        const esteraseLeucocitaria = esteraseLeucocitariaMatch ? esteraseLeucocitariaMatch[1].trim() : 'Não encontrado';
        const celulasEpit = celulasEpitMatch ? celulasEpitMatch[1].trim() : 'Não encontrado';
        const leucocitos = leucocitosMatch ? leucocitosMatch[1].trim() : 'Não encontrado';
        const hemacias = hemaciasMatch ? hemaciasMatch[1].trim() : 'Não encontrado';
        const cilindros = cilindrosMatch ? cilindrosMatch[1].trim() : 'Não encontrado';
        const cristais = cristaisMatch ? cristaisMatch[1].trim() : 'Não encontrado';
        const filamentoMuco = filamentoMucoMatch ? filamentoMucoMatch[1].trim() : 'Não encontrado';
        const infcomplementaresEAS = infcomplementaresEASMatch && infcomplementaresEASMatch[1].trim() ? infcomplementaresEASMatch[1].trim() : "Nada consta";

        const easText = `Cor: ${cor}<br>Aspecto: ${aspecto}<br>pH: ${phEAS}<br>Densidade: ${densidade}<br>Proteínas: ${proteinas}<br>Glicose: ${glicose}<br>Cetona: ${cetona}<br>Bilirrubina: ${bilirrubinaEAS}<br>Sangue: ${sangueEAS}<br>Urobilinogênio: ${urobilinogenio}<br>Nitrito: ${nitrito}<br>Ácido Ascórbico: ${acidoAscorbico}<br>Esterase Leucocitária: ${esteraseLeucocitaria}<br>Células epiteliais: ${celulasEpit}<br>Leucócitos / Piócitos: ${leucocitos}<br>Hemácias: ${hemacias}<br>Cilindros: ${cilindros}<br>Cristais: ${cristais}<br>Filamento de Muco: ${filamentoMuco}<br>Informações Complementares: ${infcomplementaresEAS}`;

        document.getElementById('eas').innerHTML = easText;
    } else {
        document.getElementById('eas').textContent = 'Não encontrado';
    }

    // Exibição dos resultados dos HARDCASES
    // BIOQUIMICA LÍQUIDOS BIOLÓGICOS:
    if (BLBExistMatch) {
      const materialBLB = materialBLBMatch ? (materialBLBMatch[1].trim() === "" ? "Nada consta" : materialBLBMatch[1].trim()) : 'Não encontrado';
      const glicoseBLB = glicoseBLBMatch ? glicoseBLBMatch[1].trim() : 'Não encontrado';
      const colesterolBLB = colesterolBLBMatch ? colesterolBLBMatch[1].trim() : 'Não encontrado';
      const trigliceridesBLB = trigliceridesBLBMatch ? trigliceridesBLBMatch[1].trim() : 'Não encontrado';
      const proteinatotaisBLB = proteinatotaisBLBMatch ? proteinatotaisBLBMatch[1].trim() : 'Não encontrado';
      const albuminaBLB = albuminaBLBMatch ? albuminaBLBMatch[1].trim() : 'Não encontrado';
      const amilaseBLB = amilaseBLBMatch ? amilaseBLBMatch[1].trim() : 'Não encontrado';
      const DHLBLB = DHLBLBMatch ? DHLBLBMatch[1].trim() : 'Não encontrado';
      const pHBLB = pHBLBMatch ? pHBLBMatch[1].trim() : 'Não encontrado';
      
      const BLBText = `Material: ${materialBLB}<br>Glicose: ${glicoseBLB}<br>Colesterol: ${colesterolBLB}<br>Triglicérides: ${trigliceridesBLB}<br>Proteína Totais: ${proteinatotaisBLB}<br>Albumina: ${albuminaBLB}<br>Amilase: ${amilaseBLB}<br>DHL: ${DHLBLB}<br>pH: ${pHBLB}`;

        document.getElementById('BLB').innerHTML = BLBText;
    } else {
        document.getElementById('BLB').textContent = 'Não encontrado';
    }
    
    // CITOMETRIA LÍQUIDOS BIOLÓGICOS:
    if (CLBExistMatch) {
      const materialCLB = materialCLBMatch ? (materialCLBMatch[1].trim() === "" ? "Nada consta" : materialCLBMatch[1].trim()) : 'Não encontrado';
      const corCLB = corCLBMatch ? corCLBMatch[1].trim() : 'Não encontrado';
      const aspectoCLB = aspectoCLBMatch ? aspectoCLBMatch[1].trim() : 'Não encontrado';
      const leucocitosCLB = leucocitosCLBMatch ? leucocitosCLBMatch[1].trim() : 'Não encontrado';
      const linfocitosCLB = linfocitosCLBMatch ? linfocitosCLBMatch[1].trim() : 'Não encontrado';
      const neutrofilosCLB = neutrofilosCLBMatch ? neutrofilosCLBMatch[1].trim() : 'Não encontrado';
      const monocitosCLB = monocitosCLBMatch ? monocitosCLBMatch[1].trim() : 'Não encontrado';
      const eosinofilosCLB = eosinofilosCLBMatch ? eosinofilosCLBMatch[1].trim() : 'Não encontrado';
      const hemaciasCLB = hemaciasCLBMatch ? hemaciasCLBMatch[1].trim() : 'Não encontrado';
      let OBSCLB = OBSCLBMatch ? OBSCLBMatch[1].trim() : 'Não encontrado';
        OBSCLB = OBSCLB.replace(/^s\s*/, '');
      const CLBText = `Material: ${materialCLB}<br>Cor: ${corCLB}<br>Aspecto: ${aspectoCLB}<br>Leucócitos: ${leucocitosCLB}/mm³<br>Linfócitos: ${linfocitosCLB}%<br>Neutrófilos: ${neutrofilosCLB}%<br>Monócitos: ${monocitosCLB}%<br>Eosinófilos: ${eosinofilosCLB}%<br>Hemácias: ${hemaciasCLB}/mm³<br>OBS: ${OBSCLB}`;

      document.getElementById('CLB').innerHTML = CLBText;
    } else {
        document.getElementById('CLB').textContent = 'Não encontrado';
    }

    // BAAR
    if (BAARExistMatch) {
      const materialBAAR = materialBAARMatch ? materialBAARMatch[1].trim() : 'Não encontrado';
      const resultadoBAAR = resultadoBAARMatch ? resultadoBAARMatch[1].trim() : 'Não encontrado';

      const BAARText = `Material: ${materialBAAR}<br>Resultado: ${resultadoBAAR}`;

      document.getElementById('BAAR').innerHTML = BAARText;
    } else {
        document.getElementById('BAAR').textContent = 'Não encontrado';
    }

    // GRAM
    if (GRAMExistMatch) {
      const materialGRAM = materialGRAMMatch ? materialGRAMMatch[1].trim() : 'Não encontrado';
      const resultadoGRAM = resultadoGRAMMatch ? resultadoGRAMMatch[1].trim() : 'Não encontrado';

      const GRAMText = `Material: ${materialGRAM}<br>Resultado: ${resultadoGRAM}`;

      document.getElementById('GRAM').innerHTML = GRAMText;
    } else {
        document.getElementById('GRAM').textContent = 'Não encontrado';
    }
  
    //CULTURA DE BACTERIAS AERÓBIAS
    if (CBAExistMatch) {
      const materialCBA = materialCBAMatch ? materialCBAMatch[1].trim() : 'Não encontrado';
      const resultadoCBA = resultadoCBAMatch ? resultadoCBAMatch[1].trim() : 'Não encontrado';
      let OBSCBA = OBSCBAMatch ? OBSCBAMatch[1].trim() : 'Nada consta';
      OBSCBA = OBSCBA.replace(/^s\s*/, '');
      const CBAText = `Material: ${materialCBA}<br>Resultado: ${resultadoCBA}<br> OBS: ${OBSCBA}`;

      document.getElementById('CBA').innerHTML = CBAText;
    } else {
        document.getElementById('CBA').textContent = 'Não encontrado';
    }

    //CULTURA MICOBACTÉRIAS:
    if (CMExistMatch) {
        const materialCM = materialCMMatch ? materialCMMatch[1].trim() : 'Não encontrado';
        const resultadoCM = resultadoCMMatch ? resultadoCMMatch[1].trim() : 'Não encontrado';
  
        const CMText = `Material: ${materialCM}<br>Resultado: ${resultadoCM}`;
  
        document.getElementById('CM').innerHTML = CMText;
      } else {
          document.getElementById('CM').textContent = 'Não encontrado';
      }
  
    
    //PESQUISA DE FUNGOS
    if (PFExistMatch) {
      const materialPF = materialPFMatch ? materialPFMatch[1].trim() : 'Não encontrado';
      const resultadoPF = resultadoPFMatch ? resultadoPFMatch[1].trim() : 'Não encontrado';

      const PFText = `Material: ${materialPF}<br>Resultado: ${resultadoPF}`;

      document.getElementById('PF').innerHTML = PFText;
    } else {
        document.getElementById('PF').textContent = 'Não encontrado';
    }

    //CULTURA DE FUNGOS
    if (CFExistMatch) {
      const materialCF = materialCFMatch ? materialCFMatch[1].trim() : 'Não encontrado';
      const resultadoCF = resultadoCFMatch ? resultadoCFMatch[1].trim() : 'Não encontrado';

      const CFText = `Material: ${materialCF}<br>Resultado: ${resultadoCF}`;

      document.getElementById('CF').innerHTML = CFText;
    } else {
        document.getElementById('CF').textContent = 'Não encontrado';
    }

     //HEMOCULTURA
     if (hemoculturaExistMatch) {
        const resultadohemocultura = resultadohemoculturaMatch ? resultadohemoculturaMatch[1].trim() : 'Não encontrado';
        let OBShemocultura = OBShemoculturaMatch ? OBShemoculturaMatch[1].trim() : 'Nada consta';
        OBShemocultura = OBShemocultura.replace(/^s\s*/, '');
        const hemoculturaText = `Resultado: ${resultadohemocultura}<br> OBS: ${OBShemocultura}`;
  
        document.getElementById('hemocultura').innerHTML = hemoculturaText;
      } else {
          document.getElementById('hemocultura').textContent = 'Não encontrado';
      }
    




//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  
    
        


// Mostra a seção de resultados
document.getElementById('results').classList.remove('hidden');
// Exibe o texto completo do PDF
document.getElementById('fullTextOutput').textContent = fullTextFromPDF;

}

// Adiciona um evento ao botão "Escolher Novo Documento"
document.getElementById('resetButton').addEventListener('click', function () {
  // Limpa o campo de upload
  document.getElementById('pdfInput').value = '';

  // Oculta a seção de resultados
  document.getElementById('results').classList.add('hidden');

  //Oculta o header do nome do paciente
  document.getElementById('patient-name-header').classList.add('hidden');

  //Faz alguma coisa com a SUPRASSUMO
  document.getElementById('new-results').classList.add('hidden');

  // Limpar os campos de resultado
  const resultSpans = document.querySelectorAll('#results span');
  resultSpans.forEach(span => {
      span.textContent = '';
  });

  //Limpar os campos de resultado dos HARDCASES
  const resultDivs = document.querySelectorAll('#results div');
  resultDivs.forEach(div => {
      div.innerHTML = '';
  });

  // Limpar a variável fullTextFromPDF
  fullTextFromPDF = '';
  document.getElementById('fullTextOutput').textContent = '';

  //Limpar a área de exames não catalogados
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = '';

  // Remover o botão "Copiar" da área de exames não catalogados
  const copyButton = outputDiv.querySelector('button');
  if (copyButton) {
      outputDiv.removeChild(copyButton);
  }

  // Remover a mensagem da área de exames não catalogados
  const messageElement = outputDiv.querySelector('p');
  if (messageElement) {
      outputDiv.removeChild(messageElement);
  }
});






document.getElementById('process-pdf').addEventListener('click', async () => {
    const fileInput = document.getElementById('pdf-upload');
    const outputDiv = document.getElementById('output');
  
    if (!fileInput.files.length) {
      outputDiv.innerHTML = '<p style="color: red;">Por favor, selecione um arquivo PDF.</p>';
      return;
    }
  
    const file = fileInput.files[0];
    const pdfData = await parsePDF(file);
  
    // Limpar saída anterior
    outputDiv.innerHTML = '';
  
    // Aplicar lógica para extrair variáveis
    const results = extractVariables(pdfData);
  
    // Exibir resultados
    outputDiv.innerHTML = `<strong>Aqui estão exames localizados pelo Software, mas que não estão salvos na base de dados deste site. CONFIRA CUIDADOSAMENTE OS VALORES AQUI APRESENTADOS E, CASO CONSTE APENAS O NOME DO EXAME, PREENCHA COM AS DEVIDAS INFORMAÇÕES NO RESPECTIVO ESPAÇO! No mais, favor entrar em contato com o <a href="https://w.app/asklepios_solucoes_medicas" target="_blank" class="support-link">suporte</a> para que possamos acrescentá-los! \uD83D\uDE0A </strong><br>${results}`;
  
    // Adicionar botão "Copiar"
    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copiar';
    copyButton.style.backgroundColor = 'green';
    copyButton.style.color = 'white';
    copyButton.style.padding = '10px';
    copyButton.style.border = 'none';
    copyButton.style.cursor = 'pointer';
    copyButton.style.marginTop = '20px';
  
    // Função para copiar os resultados
    copyButton.onclick = () => {
      try {
        // Coletar todos os campos de entrada (<input>) e seus respectivos rótulos
        const inputs = outputDiv.querySelectorAll('input');
        let textToCopy = Array.from(inputs).map(input => {
          const label = input.previousSibling.textContent.trim(); // Rótulo antes do campo
          const value = input.value.trim(); // Valor digitado pelo usuário
          return value ? `${label}: ${value}` : null; // Incluir apenas se houver valor
        }).filter(Boolean).join('\n'); // Filtrar valores nulos
  
        // Copiar o texto para a área de transferência
        navigator.clipboard.writeText(textToCopy).then(() => {
          alert('Resultados copiados com sucesso!');
        }).catch(err => {
          console.error('Falha ao copiar resultados:', err);
          alert('Ocorreu um erro ao copiar os resultados.');
        });
      } catch (error) {
        console.error('Erro ao processar cópia:', error);
        alert('Ocorreu um erro ao copiar os resultados.');
      }
    };
  
    outputDiv.appendChild(copyButton);
  });
  
  async function parsePDF(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        const typedArray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let textContent = '';
  
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          text.items.forEach(item => {
            textContent += item.str + ' ';
          });
        }
  
        resolve(textContent);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  function extractVariables(text) {
    // Usar um Set para armazenar resultados e evitar duplicatas
    const allResults = new Set();
  
    // Regex unificado para capturar blocos iniciados por "SUS" ou "HASH do Exame:"
    const blockRegex = /(\bSUS\b|HASH do Exame:\s*[A-F0-9]+)/gs;
  
    // Lista de palavras-chave que devem ser excluídas dos resultados
    const excludedKeywords = ["HEMOGRAMA", "UREIA", "CREATININA", "SODIO", "POTASSIO", "AST/TGO", "ALT/TGP", "MAGNESIO", "CALCIO TOTAL", "FOSFORO", "CLORO", "GLICEMIA", "BILIRRUBINA TOTAL E FRAÇÕES", "PROTEINA C REATIVA QUANTITATIVA", "GASOMETRIA ARTERIAL, ELETROLITOS E METABOLITOS", "ELEMENTOS ANORMAIS DO SEDIMENTO - EAS", "TAP - TEMPO DE PROTROMBINA", "TTP - TEMPO DE TROMBOPLASTINA PARCIAL ATIVADA", "CREATINO FOSFOQUINASE (CPK)", "D-DIMERO", "FERRITINA","PROTEINA TOTAL E FRAÇÕES", 'TROPONINA "I"', "LACTATO DESIDROGENASE(LDH)", "ANTI -HBc IgM (HEPATITE B)", "ANTI -HBc TOTAL (HEPATITE B)", "ANTI - HBS (HEPATITE B)",
      "HBsAg (HEPATITE B)", "ANTI- HCV (HEPATITE C)", "HIV 1 e 2, ANTÍGENO/ANTICORPOS", "IMUNOGLOBULINA (IGA)", "IMUNOGLOBULINA (IGM)", "IMUNOGLOBULINA (IGG)", "GASOMETRIA VENOSA, ELETROLITOS E METABOLITOS",
      "UREIA PÓS HEMODIÁLISE", "FERRO SERICO", "FOSFATASE ALCALINA", "ÍNDICE SAT. TRANSFERRINA", "PERFIL LIPIDICO (LIPIDOGRAMA)", "T4 LIVRE - TIROXINA",
      "TSH - HORMONIO TIREOESTIMULANTE", "VITAMINA D - 25 HIDROXI", "PTH INTACTO", "GAMA GGT", "LIPASE", "AMILASE", "VITAMINA B12", "FIBRINOGENIO",
      "Detecção de Anticorpo contra o vírus da hepatite C (anti-HCV)", "Detecção de Antígeno de Superfície do Vírus da Hepate B (HBS-Ag)", "VDRL", "ANTICORPO IgG CONTRA TREPONEMA PALLIDUM",
      "DETECÇÃO DE ANTICORPOS ANTI-HIV 1 E 2", "CK-MB", "BIOQUIMICA LÍQUIDOS BIOLÓGICOS", "CITOMETRIA LÍQUIDOS BIOLÓGICOS", "BACILOSCOPIA (BAAR)", "BACTERIOSCOPIA (GRAM)",
      "CULTURA DE BACTERIAS AERÓBIAS", "PESQUISA DE FUNGOS", "UROCULTURA", "CULTURA DE FUNGOS", "CULTURA MICOBACTÉRIAS",

    ];
    
    // Capturar blocos relevantes na ordem do PDF
    let match;
    while ((match = blockRegex.exec(text)) !== null) {
      const identifier = match[1].trim(); // "SUS" ou "HASH do Exame: XXXX"
      let capturedText = "";
  
      if (identifier === "SUS") {
        // Verificar se há uma hora logo após "SUS"
        const timeRegex = /^\d{2}:\d{2}\s*h/; // Regex para detectar uma hora no formato HH:MM h
        const remainingText = text.slice(match.index + match[0].length).trim();
  
        if (timeRegex.test(remainingText)) {
          // Ignorar tudo até encontrar "HASH do Exame:"
          const hashIndex = remainingText.indexOf("HASH do Exame:");
          if (hashIndex !== -1) {
            // Capturar o texto após "HASH do Exame:" até "Material:"
            const materialRegex = /HASH do Exame:\s*[A-F0-9]+\s*(.*?)(?=Material:|Responsável Técnica|$)/s;
            const materialMatch = materialRegex.exec(remainingText);
  
            if (materialMatch) {
              capturedText = materialMatch[1].trim();
            }
          }
        } else {
          // Se não houver hora após "SUS", capturar o texto normalmente
          const materialRegex = /^(.*?)\bMaterial:/s;
          const materialMatch = materialRegex.exec(remainingText);
  
          if (materialMatch) {
            capturedText = materialMatch[1].trim();
          }
        }
      } else if (identifier.startsWith("HASH do Exame:")) {
        // Capturar o texto após "HASH do Exame:" até "Material:"
        const materialRegex = /HASH do Exame:\s*[A-F0-9]+\s*(.*?)(?=Material:|Responsável Técnica|$)/s;
        const materialMatch = materialRegex.exec(text.slice(match.index));
  
        if (materialMatch) {
          capturedText = materialMatch[1].trim();
        }
      }
    
      // Verificar se o bloco capturado contém alguma das palavras-chave excluídas
      const shouldExclude = excludedKeywords.some(keyword => capturedText.includes(keyword));
      if (shouldExclude) {
        continue; // Ignorar este bloco
      }

      // Ignorar blocos vazios ou irrelevantes
      if (!capturedText || capturedText.length < 5) { // Ajuste o limite conforme necessário
        continue;
      }
  
      // Adicionar o bloco ao Set de resultados (evita duplicatas)
      allResults.add(capturedText);
    }

    // Criar HTML com caixas de entrada para valores complementares
    let resultsHTML = '';
    allResults.forEach(result => {
        // Remover sequências de dois ou mais pontos
        const formattedResult = result.replace(/\.{2,}/g, '').replace(/:/g, '-').trim();
        resultsHTML += `
            <div class="result-item">
                <label>${formattedResult}</label>
                <input type="text" placeholder="Inf. comprementares?">
            </div>
        `;
    });

    return resultsHTML;
  }


  function interpretarHbsAg(valor) {
    const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
    if (valorNumerico < 0.90) {
        return "Não Reagente";
    } else if (valorNumerico >= 0.90 && valorNumerico <= 0.99) {
        return "Zona Cinza";
    } else if (valorNumerico >= 1.00) {
        return "Reagente";
    } else {
        return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
    }
}


  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


// <<<<<<<<<<<<<<<<<<CAMPO PARA FUTURA ATUALIZAÇÃO DE VALORES NR/ZC/R DE EXAMES SOROLÓGICOS>>>>>>>>>>>>>>>>>>
//LDH:
function interpretarLDH(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 243) {
      return "\u23EB"; // Seta para cima (maior que 243)
  } else if (valorNumerico >= 125 && valorNumerico <= 243) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 125 e 243)
  } else if (valorNumerico < 125) {
      return "\u23EC"; // Seta para baixo (menor que 125)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

function interpretarCKMB(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 25) {
      return "\u23EB"; // Seta para cima (maior que 25)
  } else if (valorNumerico <= 25) {
      return "\uD83C\uDD97"; // Letra "OK" (menor ou igual a 25)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//ANTI-HBc IgM (HEPATITE B):
function interpretarantihbcigm(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico < 0.90) {
      return "NR";
  } else if (valorNumerico >= 0.90 && valorNumerico <= 0.99) {
      return "Zona Cinza";
  } else if (valorNumerico >= 1.00) {
      return "REAGENTE";
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//ANTI-HBc TOTAL (HEPATITE B):
function interpretarantihbctotal(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico < 0.90) {
    return "NR";
  } else if (valorNumerico >= 0.90 && valorNumerico <= 0.99) {
    return "Zona Cinza";
  } else if (valorNumerico >= 1.00) {
    return "REAGENTE";
  } else {
    return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//ANTI-HBS (HEPATITE B):
function interpretarantihbs(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico < 10) {
      return "NR";
  } else if (valorNumerico >= 10) {
      return "REAGENTE";
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//HBSAG
function interpretarHbsAg(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico < 0.90) {
      return "NR";
  } else if (valorNumerico >= 0.90 && valorNumerico <= 0.99) {
      return "Zona Cinza";
  } else if (valorNumerico >= 1.00) {
      return "REAGENTE";
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//ANTI-HCV (HEPATITE C):
function interpretarantihcv(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico < 0.90) {
      return "NR";
  } else if (valorNumerico >= 0.90 && valorNumerico <= 0.99) {
      return "Zona Cinza";
  } else if (valorNumerico >= 1.00) {
      return "REAGENTE";
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//HIV
function interpretarhiv1e2(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico < 0.90) {
      return "NR";
  } else if (valorNumerico >= 0.90 && valorNumerico <= 0.99) {
      return "Zona Cinza";
  } else if (valorNumerico >= 1.00) {
      return "REAGENTE";
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//NORMAIS, MAS COM VALOR DE REFERÊNCIA:
//IGA
function interpretarIGA(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 484) {
      return "\u23EB"; // Seta para cima (maior que 484)
  } else if (valorNumerico >= 63 && valorNumerico <= 484) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 63 e 484)
  } else if (valorNumerico < 63) {
      return "\u23EC"; // Seta para baixo (menor que 63)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//IGM:
function interpretarIGM(valor) {
    const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
    if (valorNumerico > 293) {
        return "\u23EB"; // Seta para cima (maior que 293)
    } else if (valorNumerico >= 25 && valorNumerico <= 293) {
        return "\uD83C\uDD97"; // Letra "OK" (entre 25 e 293)
    } else if (valorNumerico < 25) {
        return "\u23EC"; // Seta para baixo (menor que 25)
    } else {
        return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
    }
}

//IGG:
function interpretarIGG(valor) {
    const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
    if (valorNumerico > 1822) {
        return "\u23EB"; // Seta para cima (maior que 1822)
    } else if (valorNumerico >= 320 && valorNumerico <= 1822) {
        return "\uD83C\uDD97"; // Letra "OK" (entre 320 e 1822)
    } else if (valorNumerico < 320) {
        return "\u2B07\uFE0F"; // Seta para baixo (menor que 320)
    } else {
        return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
    }
}

//UPH:
function interpretarUPH(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 50) {
      return "\u23EB"; // Seta para cima (maior que 50)
  } else if (valorNumerico >= 10 && valorNumerico <= 50) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 10 e 50)
  } else if (valorNumerico < 10) {
      return "\u23EC"; // Seta para baixo (menor que 10)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//IST:
function interpretarIST(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 50) {
      return "\u23EB"; // Seta para cima (maior que 50)
  } else if (valorNumerico >= 20 && valorNumerico <= 50) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 20 e 50)
  } else if (valorNumerico < 20) {
      return "\u23EC"; // Seta para baixo (menor que 20)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//T4:
function interpretarT4(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 1.48) {
      return "\u23EB"; // Seta para cima (maior que 1.48)
  } else if (valorNumerico >= 0.70 && valorNumerico <= 1.48) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 0.70 e 1.48)
  } else if (valorNumerico < 0.70) {
      return "\u23EC"; // Seta para baixo (menor que 0.70)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//Vitamina D - 25-HIDROXI:
function interpretarVitaminaD(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 20) {      
      return "\uD83C\uDD97"; // Letra "OK" (acima de 20)
  } else if (valorNumerico < 20) {
      return "\u23EC"; // Seta para baixo (abaixo de 20)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//PTH Intacto:
function interpretarPTHintacto(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 68,3) {
      return "\u23EB"; // Seta para cima (maior que 68,3)
  } else if (valorNumerico >= 15,0 && valorNumerico <= 68,3) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 15,0 e 68,3)
  } else if (valorNumerico < 15,0) {
      return "\u23EC"; // Seta para baixo (menor que 15,0)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//Lipase:
function interpretarLipase(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 78) {
      return "\u23EB"; // Seta para cima (maior que 78)
  } else if (valorNumerico >= 8 && valorNumerico <= 78) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 8 e 78)
  } else if (valorNumerico < 8) {
      return "\u23EC"; // Seta para baixo (menor que 8)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//Vitamina B12:
function interpretarVitB12(valor) {
  // Remove os sinais ">" ou "<" e espaços em branco do valor
  const valorLimpo = valor.replace(/[><\s]/g, '');
  const valorNumerico = parseFloat(valorLimpo.replace(',', '.')); // Converte para número, substituindo vírgula por ponto

  if (isNaN(valorNumerico)) {
      return "Valor Inválido"; // Retorna "Valor Inválido" se não for um número
  }

  if (valorNumerico > 883) {
      return "\u23EB"; // Seta para cima (maior que 883)
  } else if (valorNumerico >= 187 && valorNumerico <= 883) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 187 e 883)
  } else if (valorNumerico < 187) {
      return "\u23EC"; // Seta para baixo (menor que 187)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//Fibrinogênio:
function interpretarFibrinogenio(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 350) {
      return "\u23EB"; // Seta para cima (maior que 350)
  } else if (valorNumerico >= 180 && valorNumerico <= 350) {
      return "\uD83C\uDD97"; // Letra "OK" (entre 180 e 350)
  } else if (valorNumerico < 180) {
      return "\u23EC"; // Seta para baixo (menor que 180)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//Troponina I:
function interpretarTroponinai(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico > 0.04) {
      return "\u23EB"; // Seta para cima (maior que 0.04)
  } else if (valorNumerico <= 0.04) {
      return "\uD83C\uDD97"; // Letra "OK" (menor ou igual a 0.04)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//D-Dímero:
function interpretarDdimero(valor) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  if (valorNumerico >= 0.5) {
      return "\u23EB"; // Seta para cima (maior ou igual a 0.5)
  } else if (valorNumerico < 0.5) {
      return "\uD83C\uDD97"; // Letra "OK" (menor que 0.5)
  } else {
      return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
  }
}

//Amilase:
function interpretarAmilase(valor, diffEmDias, diffEmAnos) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto
  
  if (isNaN(valorNumerico)) {
      return "Valor Inválido";
  }

  if (diffEmDias <= 28) { // Até 28 dias
      if (valorNumerico > 65) {
          return "\u23EB"; // Seta para cima (maior que 65)
      } else if (valorNumerico >= 5 && valorNumerico <= 65) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 5 e 65)
      } else if (valorNumerico < 5) {
          return "\u23EC"; // Seta para baixo (menor que 5)
      }
  } else if (diffEmAnos >= 70) { // 70 anos completos para cima
      if (valorNumerico > 160) {
          return "\u23EB"; // Seta para cima (maior que 160)
      } else if (valorNumerico >= 20 && valorNumerico <= 160) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 20 e 160)
      } else if (valorNumerico < 20) {
          return "\u23EC"; // Seta para baixo (menor que 20)
      }
  } else { // De 28 dias até 70 anos incompletos
      if (valorNumerico > 125) {
          return "\u23EB"; // Seta para cima (maior que 125)
      } else if (valorNumerico >= 25 && valorNumerico <= 125) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 25 e 125)
      } else if (valorNumerico < 25) {
          return "\u23EC"; // Seta para baixo (menor que 25)
      }
  }
  return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
}

//Gama GGT:
function interpretarGamaGGT(valor, sexo) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto

  if (isNaN(valorNumerico)) {
      return "Valor Inválido";
  }

  if (sexo === 'F') { // Sexo feminino
      if (valorNumerico > 36) {
          return "\u23EB"; // Seta para cima (maior que 36)
      } else if (valorNumerico >= 9 && valorNumerico <= 36) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 9 e 36)
      } else if (valorNumerico < 9) {
          return "\u23EC"; // Seta para baixo (menor que 9)
      }
  } else if (sexo === 'M') { // Sexo masculino
      if (valorNumerico > 64) {
          return "\u23EB"; // Seta para cima (maior que 64)
      } else if (valorNumerico >= 12 && valorNumerico <= 64) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 12 e 64)
      } else if (valorNumerico < 12) {
          return "\u23EC"; // Seta para baixo (menor que 12)
      }
  } else {
      return "Sexo Inválido"; // Caso o sexo não seja M ou F
  }
  return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
}

//TSH:
function interpretarTSH(valor, diffEmDias, diffEmAnos) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto

  if (isNaN(valorNumerico)) {
      return "Valor Inválido";
  }

  if (diffEmDias < 30) { // Inferior a um mês incompleto
      if (valorNumerico > 11.30) {
          return "\u23EB"; // Seta para cima (maior que 11.30)
      } else if (valorNumerico >= 0.51 && valorNumerico <= 11.30) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 0.51 e 11.30)
      } else if (valorNumerico < 0.51) {
          return "\u23EC"; // Seta para baixo (menor que 0.51)
      }
  } else if (diffEmAnos < 11) { // Entre um mês completo e 11 anos
      if (valorNumerico > 5.85) {
          return "\u23EB"; // Seta para cima (maior que 5.85)
      } else if (valorNumerico >= 0.79 && valorNumerico <= 5.85) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 0.79 e 5.85)
      } else if (valorNumerico < 0.79) {
          return "\u23EC"; // Seta para baixo (menor que 0.79)
      }
  } else { // Acima de 11 anos
      if (valorNumerico > 4.94) {
          return "\u23EB"; // Seta para cima (maior que 4.94)
      } else if (valorNumerico >= 0.35 && valorNumerico <= 4.94) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 0.35 e 4.94)
      } else if (valorNumerico < 0.35) {
          return "\u23EC"; // Seta para baixo (menor que 0.35)
      }
  }
  return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
}

//FA:
function interpretarFA(valor, diffEmAnos) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto

  if (isNaN(valorNumerico)) {
      return "Valor Inválido";
  }

  if (diffEmAnos < 12 && diffEmAnos >= 1) { // Crianças 1 a 12 anos incompletos
      if (valorNumerico >= 500) {
          return "\u23EB"; // Seta para cima (maior ou igual a 500)
      } else if (valorNumerico < 500) {
          return "\uD83C\uDD97"; // Letra "OK" (menor que 500)
      }
  } else if (diffEmAnos >= 12 && diffEmAnos < 15) { // Crianças 12 anos completos a 15 incompletos
      if (valorNumerico >= 750) {
          return "\u23EB"; // Seta para cima (maior ou igual a 750)
      } else if (valorNumerico < 750) {
          return "\uD83C\uDD97"; // Letra "OK" (menor que 750)
      }
  } else { // 15 completos acima
      if (valorNumerico > 150) {
          return "\u23EB"; // Seta para cima (maior que 150)
      } else if (valorNumerico >= 40 && valorNumerico <= 150) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 40 e 150)
      } else if (valorNumerico < 40) {
          return "\u23EC"; // Seta para baixo (menor que 40)
      }
  }
  return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
}

//Ferro Sérico:
function interpretarFerroserico(valor, sexo) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto

  if (isNaN(valorNumerico)) {
      return "Valor Inválido";
  }

  if (sexo === 'M') { // Sexo masculino
      if (valorNumerico > 144) {
          return "\u23EB"; // Seta para cima (maior que 144)
      } else if (valorNumerico >= 31 && valorNumerico <= 144) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 31 e 144)
      } else if (valorNumerico < 31) {
          return "\u23EC"; // Seta para baixo (menor que 31)
      }
  } else if (sexo === 'F') { // Sexo feminino
      if (valorNumerico > 156) {
          return "\u23EB"; // Seta para cima (maior que 156)
      } else if (valorNumerico >= 25 && valorNumerico <= 156) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 25 e 156)
      } else if (valorNumerico < 25) {
          return "\u23EC"; // Seta para baixo (menor que 25)
      }
  } else {
      return "Sexo Inválido"; // Caso o sexo não seja M ou F
  }
  return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
}

//Ferritina:
function interpretarFerritina(valor, sexo) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto

  if (isNaN(valorNumerico)) {
      return "Valor Inválido";
  }

  if (sexo === 'M') { // Sexo masculino
      if (valorNumerico > 274.6) {
          return "\u23EB"; // Seta para cima (maior que 274.6)
      } else if (valorNumerico >= 21.81 && valorNumerico <= 274.6) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 21.81 e 274.6)
      } else if (valorNumerico < 21.81) {
          return "\u23EC"; // Seta para baixo (menor que 21.81)
      }
  } else if (sexo === 'F') { // Sexo feminino
      if (valorNumerico > 204.0) {
          return "\u23EB"; // Seta para cima (maior que 204.0)
      } else if (valorNumerico >= 4.63 && valorNumerico <= 204.0) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 4.63 e 204.0)
      } else if (valorNumerico < 4.63) {
          return "\u23EC"; // Seta para baixo (menor que 4.63)
      }
  } else {
      return "Sexo Inválido"; // Caso o sexo não seja M ou F
  }
  return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
}

//CPK:
function interpretarCPK(valor, sexo) {
  const valorNumerico = parseFloat(valor.replace(',', '.')); // Converte para número, substituindo vírgula por ponto

  if (isNaN(valorNumerico)) {
      return "Valor Inválido";
  }

  if (sexo === 'M') { // Sexo masculino
      if (valorNumerico > 200) {
          return "\u23EB"; // Seta para cima (maior que 200)
      } else if (valorNumerico >= 30 && valorNumerico <= 200) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 30 e 200)
      } else if (valorNumerico < 30) {
          return "\u23EC"; // Seta para baixo (menor que 30)
      }
  } else if (sexo === 'F') { // Sexo feminino
      if (valorNumerico > 168) {
          return "\u23EB"; // Seta para cima (maior que 168)
      } else if (valorNumerico >= 29 && valorNumerico <= 168) {
          return "\uD83C\uDD97"; // Letra "OK" (entre 29 e 168)
      } else if (valorNumerico < 29) {
          return "\u23EC"; // Seta para baixo (menor que 29)
      }
  } else {
      return "Sexo Inválido"; // Caso o sexo não seja M ou F
  }
  return "Valor Inválido"; // Caso o valor não se encaixe em nenhuma categoria
}








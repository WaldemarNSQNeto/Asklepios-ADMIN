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
        messageElement.innerHTML = `<strong>⮑ Aqui estão exames localizados pelo Software, mas que não estão salvos na base de dados deste site.</strong><br><strong>⮑ CONFIRA CUIDADOSAMENTE OS VALORES AQUI APRESENTADOS E, CASO CONSTE APENAS O NOME DO EXAME, PREENCHA COM AS DEVIDAS INFORMAÇÕES NO RESPECTIVO ESPAÇO!</strong><br><strong>⮑ No mais, favor entrar em contato com o <a href="https://w.app/asklepios_solucoes_medicas" target="_blank" class="support-link">suporte</a> para que possamos acrescentá-los! \uD83D\uDE0A</strong>`;

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
    const gamaGGT = /GAMA\s+GGT\s*\.+\s*:\s*([\d.,]+)/i;
    const lipase = /LIPASE\s*\.+\s*:\s*([\d.,]+)/i;
    const amilase = /AMILASE\s*\.+\s*:\s*([\d.,]+)/i;
    const vitB12 = /VITAMINA\s+B12\s*\.+\s*:\s*([^\n]+?)\s+Material:/i;
    const fibrinogenio = /FIBRINOGENIO\s*\.+\s*:\s*([\d.,]+)/i;
    const CKMB = /CK-MB\s*\.+\s*:\s*([\d.,]+)/i;



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
    


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



    // Extrai os valores
    const pctMatch = text.match(pctRegex);
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
    const gamaGGTMatch = text.match(gamaGGT);
    const lipaseMatch = text.match(lipase);
    const amilaseMatch = text.match(amilase);
    const vitB12Match = text.match(vitB12);
    const fibrinogenioMatch = text.match(fibrinogenio);  
    const CKMBMatch = text.match(CKMB);
    


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
    
    
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


    if (pctMatch) {
        document.getElementById('patient-name').textContent = pctMatch[1].trim();
        document.getElementById('patient-name-header').classList.remove('hidden');
   }
   
    // Exibe os resultados
    document.getElementById('pct').textContent = pctMatch ? pctMatch[1].trim() : 'Não encontrado';
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

    document.getElementById('CPK').textContent = CPKMatch ? CPKMatch[1].trim() : 'Não encontrado';
    document.getElementById('ddimero').textContent = ddimeroMatch ? ddimeroMatch[1].trim() : 'Não encontrado';
    document.getElementById('ferritina').textContent = ferritinaMatch ? ferritinaMatch[1].trim() : 'Não encontrado';
    
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
    document.getElementById('ferroserico').textContent = ferrosericoMatch ? ferrosericoMatch[1].trim() : 'Não encontrado';
    document.getElementById('FA').textContent = FAMatch ? FAMatch[1].trim() : 'Não encontrado';
    document.getElementById('TSH').textContent = TSHMatch ? TSHMatch[1].trim() : 'Não encontrado';
    document.getElementById('gamaGGT').textContent = gamaGGTMatch ? gamaGGTMatch[1].trim() : 'Não encontrado';
    document.getElementById('amilase').textContent = amilaseMatch ? amilaseMatch[1].trim() : 'Não encontrado';
    document.getElementById('dacvhc').textContent = dacvhcMatch ? dacvhcMatch[1].trim() : 'Não encontrado';
    document.getElementById('dasvhb').textContent = dasvhbMatch ? dasvhbMatch[1].trim() : 'Não encontrado';
    document.getElementById('VDRL').textContent = VDRLMatch ? VDRLMatch[1].trim() : 'Não encontrado';
    document.getElementById('aIgGcTP').textContent = aIgGcTPMatch ? aIgGcTPMatch[1].trim() : 'Não encontrado';
    document.getElementById('daANTIHIV1e2').textContent = daANTIHIV1e2Match ? daANTIHIV1e2Match[1].trim() : 'Não encontrado';
    


    
    // <<<<<<<<<<<<<<<<<<<<<NORMAIS, MAS COM VALOR DE REFERÊNCIA:>>>>>>>>>>>>>>>>>>>>>
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
      "DETECÇÃO DE ANTICORPOS ANTI-HIV 1 E 2", "CK-MB"

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

//Vitamina D:
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
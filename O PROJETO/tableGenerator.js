// tableGenerator.js

document.addEventListener('DOMContentLoaded', () => {
    const gerarTabelaButton = document.getElementById('gerarTabelaButton');
    const tabelaSection = document.getElementById('tabela-section');
    const tabelaContainer = document.getElementById('tabelaContainer');

    if (gerarTabelaButton && tabelaSection) {
        gerarTabelaButton.addEventListener('click', gerarTabelaExames);

        // Mostra a seção do botão "Gerar Tabela" após o PDF ser processado
        // (Podemos fazer isso observando a visibilidade de outra seção, como 'results')
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === 'class' && !resultsSection.classList.contains('hidden')) {
                        tabelaSection.classList.remove('hidden');
                        // observer.disconnect(); // Desconecta se só precisa rodar uma vez
                    } else if (mutation.attributeName === 'class' && resultsSection.classList.contains('hidden')) {
                         tabelaSection.classList.add('hidden'); // Esconde se os resultados forem escondidos
                         tabelaContainer.classList.add('hidden'); // Esconde a tabela também
                         tabelaContainer.innerHTML = ''; // Limpa a tabela
                    }
                });
            });
            observer.observe(resultsSection, { attributes: true });
        }


    } else {
        console.error("Botão 'gerarTabelaButton' ou seção 'tabela-section' não encontrados.");
    }

    function gerarTabelaExames() {
        console.log("Gerando tabela editável..."); // Mensagem atualizada
        tabelaContainer.innerHTML = ''; // Limpa container anterior
        tabelaContainer.classList.add('hidden'); // Esconde enquanto gera

        //SÉTIMA WN
        // Mapeamento: [Label para Tabela, ID do Elemento HTML, Chave Opcional para Casos Especiais]
        const mapeamentoExames = [
            ['DATA', 'dataExame'],
            ['PCT', 'pct'],
            ['Hb', 'hb'],
            ['Ht', 'ht'],
            ['VCM', 'vcm'],
            ['HCM', 'hcm'],
            ['CHCM', 'chcm'],
            ['RDW', 'rdw'],
            ['Leucócitos Totais', 'leucocitosTotais'],
            ['Promielócitos', 'promielocitos'],
            ['Mielócitos', 'mielocitos'],
            ['Metamielócitos', 'metamielocitos'],
            ['Bastões', 'bastoes'],
            ['Segmentados', 'segmentados'],
            ['Eosinófilos', 'eosinofilos'],
            ['Basófilos', 'basofilos'],
            ['Linfócitos', 'linfocitos'],
            ['Linfócitos Atípicos', 'linfocitosAtipicos'],
            ['Monócitos', 'monocitos'],
            ['Blastos', 'blastos'],
            ['Plasmócitos', 'plasmocitos'],
            ['Plaquetas', 'plaquetas'],
            ['Hematoscopia', 'hematoscopia'],
            ['HEMOCULTURA', 'hemocultura'],

            ['UR', 'ureia'],
            ['CR', 'creatinina'],
            ['Na', 'sodio'],
            ['K', 'potassio'],
            ['Mg', 'magnesio'],
            ['CaT', 'calcioTotal'],
            ['P', 'fosforo'],
            ['Cl', 'cloro'],
            ['BT', 'bilirrubina', 'BT'], // Chave especial para Bilirrubina Total
            ['BD', 'bilirrubina', 'BD'], // Chave especial para Bilirrubina Direta
            ['BI', 'bilirrubina', 'BI'], // Chave especial para Bilirrubina Indireta
            ['TGO', 'tgoAst'],
            ['TGP', 'tgp'],
            ['PCR', 'pcr'],
            ['CPK', 'CPK'],
            ['GAMA GGT', 'gamaGGT'],
            ['FA', 'FA'],
            ['AMILASE', 'amilase'],
            ['LIPASE', 'lipase'],
            ['TAP', 'tempoProtrombina'], // Usando o ID do Tempo de Protrombina para TAP
            ['INR', 'inr'],
            ['TTPA', 'ttpaRatio', 'TTPA'], // Chave especial para TTPA
            ['RATIO', 'ttpaRatio', 'RATIO'], // Chave especial para Ratio
            ['GLICEMIA', 'glicemia'],
            ['HbA1c', 'Hb1Ac'],

            ['GASOMETRIA ARTERIAL', 'gasometria'],     // Label -> ID do div arterial
            ['GASOMETRIA VENOSA', 'gasometriaVenosa'], // Label -> ID do div venoso

            ['EAS', 'eas'], // Tratar como texto complexo
            ['UROCULTURA', 'urocultura'],

            ['D-DÍMERO', 'ddimero'], // <-- ADICIONADO

            ['CK-MB', 'CKMB'],
            ['NT-proBNP', 'NTproBNP'],
            ['LDH', 'LDH'],
            ['FERRO SÉRICO', 'ferroserico'],
            ['FERRITINA', 'ferritina'],
            ['IST', 'ist'],
            ['TRANSFERRINA', 'transferrina'],
            ['ÁCIDO FÓLICO', 'acidofolico'],
            ['TROPONINA I', 'troponinai'],
            ['UPH', 'uph'],
            ['T4', 'T4'],
            ['TSH', 'TSH'],
            ['VITAMINA D', 'vitaminaD'],
            ['VITAMINA B12', 'vitB12'],
            ['PTH Intacto', 'PTHintacto'],
            ['PSA TOTAL', 'psatotal'],
            ['PSA LIVRE', 'psalivre'],
            
            ['Ritmo Cortisol', 'RC'],
            ['ÁCIDO ÚRICO', 'acidourico'],
            ['FIBRINOGÊNIO', 'fibrinogenio'],
            ['Ag SARS-CoV-2', 'RASARSCoV2'], // Nome mais curto
            ['Anti-HAV IgM', 'antiHavIgm'],
            ['Anti-HBc IgM', 'antihbcigm'],
            ['Anti-HBc Total', 'antihbctotal'],
            ['Anti-HBS', 'antihbs'],
            ['HBS-Ag (Detecção)', 'dasvhb'], // Nome mais claro
            ['HBsAg (Valor)', 'hbsag'], // Nome mais claro
            ['Anti-HCV (Detecção)', 'dacvhc'], // Nome mais claro
            ['Anti-HCV (Valor)', 'antihcv'], // Nome mais claro
            ['VDRL', 'VDRL'],
            ['Anti-HIV 1/2 (Detecção)', 'daANTIHIV1e2'], // Nome mais claro
            ['HIV 1/2 Ag/Ab', 'hiv1e2'], // Nome mais claro
            ['Anti-Treponema IgG', 'aIgGcTP'], // Nome mais claro
            ['IGA', 'IGA'],
            ['IGM', 'IGM'],
            ['IGG', 'IGG'],
            ['Fator Reumatoide', 'fatorreumatoide'],
            
            ['SANGUE OCULTO', 'sangueoculto'],
            // Exames complexos que podem precisar de tratamento especial na cópia
            ['PROTEÍNA TOTAL/FRAÇÕES', 'proteinatotalfracoes'],
            ['PERFIL LIPÍDICO', 'perfillipidico'],
            ['BIOQUÍMICA LÍQ. BIOL.', 'BLB'],
            ['CITOMETRIA LÍQ. BIOL.', 'CLB'],
            ['BAAR', 'BAAR'],
            ['GRAM', 'GRAM'],
            ['CULTURA BACT. AERÓBIAS', 'CBA'],
            ['PESQUISA FUNGOS', 'PF'],
            ['CULTURA FUNGOS', 'CF'],
            ['CULTURA MICOBACTÉRIAS', 'CM'],
             
        ];

        let tabelaHTML = `
            <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                    <tr>
                        <th style="padding: 5px; text-align: left;">Exame</th>
                        <th style="padding: 5px; text-align: left;">Valor (Clique para Editar, exceto blocos)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        mapeamentoExames.forEach(([label, id, chaveEspecial]) => {
            const elemento = document.getElementById(id);
            let valorBruto = 'N/A';
            let valorParaTabela = 'N/A';
            let isEditable = true; // Padrão é editável

            if (elemento) {
                // Usar innerHTML para blocos que podem conter <br>, textContent para outros
                if (['gasometria', 'gasometriaVenosa', 'eas', 'proteinatotalfracoes', 'perfillipidico', 'BLB', 'CLB', 'BAAR', 'GRAM', 'CBA', 'PF', 'CF', 'CM', 'hemocultura'].includes(id)) {
                    valorBruto = elemento.innerHTML || 'N/A';
                    isEditable = false; // Blocos não são editáveis diretamente na tabela
                } else {
                    valorBruto = elemento.textContent || 'N/A';
                }
                valorBruto = valorBruto.trim();

                if (valorBruto.toLowerCase() === 'não encontrado' || valorBruto === '') {
                    valorParaTabela = 'N/A';
                } else {
                    // Lógica para Bilirrubina, TTPA (se ainda precisar exibir separado aqui)
                    if (id === 'bilirrubina' && chaveEspecial) {
                        const parts = valorBruto.split(' / ');
                        let index = -1;
                        if (chaveEspecial === 'BT') index = 0;
                        else if (chaveEspecial === 'BD') index = 1;
                        else if (chaveEspecial === 'BI') index = 2;
                        valorParaTabela = (index !== -1 && parts.length > index) ? parts[index].trim() : 'N/A';
                        isEditable = true; // Partes separadas são editáveis
                    } else if (id === 'ttpaRatio' && chaveEspecial) {
                        const parts = valorBruto.split(' / ');
                        let index = -1;
                        if (chaveEspecial === 'TTPA') index = 0;
                        else if (chaveEspecial === 'RATIO') index = 1;
                        valorParaTabela = (index !== -1 && parts.length > index) ? parts[index].trim() : 'N/A';
                        isEditable = true; // Partes separadas são editáveis
                    } else {
                        valorParaTabela = valorBruto; // Caso geral e blocos
                    }
                }
            } else {
                 valorParaTabela = 'N/A';
            }

            // Adiciona linha à tabela HTML - Define contenteditable condicionalmente
            tabelaHTML += `
                <tr>
                    <td style="padding: 5px;">${label}</td>
                    <td style="padding: 5px;" ${isEditable ? 'contenteditable="true"' : ''}>${valorParaTabela}</td>
                </tr>
            `;
        }); // Fim do forEach mapeamentoExames

        tabelaHTML += `
                </tbody>
            </table>
            <button id="copiarTabelaButton" class="action-button" style="background-color: green;">Copiar Tabela Editada</button>
        `;

        tabelaContainer.innerHTML = tabelaHTML;
        tabelaContainer.classList.remove('hidden');

        // Adiciona listener ao botão de cópia
        const copiarTabelaButton = document.getElementById('copiarTabelaButton');
        if (copiarTabelaButton) {
            copiarTabelaButton.addEventListener('click', () => copiarTabelaParaPlanilha(copiarTabelaButton));
        }
    }

    // A função limparValorParaCopia permanece a mesma
    function limparValorParaCopia(valor, limparComplexo = false) {
        // ... (código da função como estava antes) ...
        if (!valor || valor === 'N/A') return '';
        let valorLimpo = valor;
        // 1. Remove símbolos...
        valorLimpo = valorLimpo.replace(/[↓↑*✅❓\uD83C\uDD97]|OK/gi, '');
        // 1.1 Remove %
        valorLimpo = valorLimpo.replace(/%/g, '');
        // 2. Remove HTML tags...
        valorLimpo = valorLimpo.replace(/<[^>]*>/g, '');
        // 3. Tratamento específico para '/'...
        if (!limparComplexo && valorLimpo.includes('/')) {
             const parts = valorLimpo.split(/ \/ |\/ /);
             if (parts.length > 0) {
                 valorLimpo = parts[0].trim();
             }
        } else if (limparComplexo) {
             valorLimpo = valorLimpo.replace(/[/|\s]{2,}/g, ' ; ');
             valorLimpo = valorLimpo.replace(/\s+/g, ' ');
        }
        // 4. REMOVIDO/COMENTADO: Não alterar pontos e vírgulas.
        /* ... */
         // 5. Remove espaços extras...
        valorLimpo = valorLimpo.trim();
        // 6. Ajuste: Remove parênteses...
        if (!/presente|ausente|negativo|positivo|reagente|normal|raras|turvo|límpido|amarelo|nada consta/i.test(valorLimpo)) {
             if (!/\(\+\)|\(-\)/.test(valorLimpo)) {
                 valorLimpo = valorLimpo.replace(/[()]/g, '');
             }
        }
        // 7. Remove espaços extras novamente...
        valorLimpo = valorLimpo.trim();
        return valorLimpo;
    }

        // Dentro de tableGenerator.js

    // *** MODIFICADA A LÓGICA INTERNA PARA TRATAR AMBAS GASOMETRIAS NA CÓPIA ***
    function copiarTabelaParaPlanilha(botao) {
        console.log("Copiando tabela (Gaso Arterial e Venosa separadas na cópia)..."); // Mensagem atualizada
        let tsvString = '';
        const table = tabelaContainer.querySelector('table');

        if (!table) { /* ... erro ... */ return; }

        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            // Dentro de tableGenerator.js -> copiarTabelaParaPlanilha -> rows.forEach

            if (cells.length === 2) {
                const label = cells[0].textContent.trim();
                const cellValueElement = cells[1]; // Pega o elemento da célula de valor

                // --- INÍCIO DA ALTERAÇÃO (Ler dos Spans Ocultos e Garantir 8 Linhas) ---
                if (label === 'GASOMETRIA ARTERIAL') {
                    // Mapeamento dos parâmetros arteriais e seus IDs de span oculto
                    const arterialParams = [
                        ['FIO2 (A)', 'gaso_fio2'],
                        ['pH (A)', 'gaso_ph'],
                        ['PCO2 (A)', 'gaso_pco2'],
                        ['PO2 (A)', 'gaso_po2'],
                        ['HCO3 (A)', 'gaso_hco3'],
                        ['BE (A)', 'gaso_be'],
                        ['SAT O2 (A)', 'gaso_sato2'],
                        ['Lac (A)', 'gaso_lac']
                    ];

                    // SEMPRE adiciona 8 linhas, lendo dos spans (ou vazio se não encontrado)
                    arterialParams.forEach(([paramLabel, spanId]) => {
                        const spanElement = document.getElementById(spanId);
                        // Pega valor do span. Se span não existe ou tem 'Não encontrado', usa string vazia.
                        const paramValue = (spanElement && spanElement.textContent !== 'Não encontrado') ? spanElement.textContent : '';
                        const valorLimpo = limparValorParaCopia(paramValue); // limparValorParaCopia('') retorna ''
                        tsvString += `${paramLabel}\t${valorLimpo}\n`; // Adiciona linha TSV
                        // --- INÍCIO DA ADIÇÃO DA LINHA VAGA APÓS Lac (A) ---
                        if (paramLabel === 'Lac (A)') {
                            tsvString += '\n'; // Adiciona um caractere de nova linha extra
                        }
                    });
                    // Pula o processamento da linha do bloco visível "GASOMETRIA ARTERIAL"

                } else if (label === 'GASOMETRIA VENOSA') {
                    // Mapeamento dos parâmetros venosos e seus IDs de span oculto
                    const venousParams = [
                        ['FIO2 (V)', 'gasoV_fio2'],
                        ['pH (V)', 'gasoV_ph'],
                        ['PCO2 (V)', 'gasoV_pco2'],
                        ['PO2 (V)', 'gasoV_po2'],
                        ['HCO3 (V)', 'gasoV_hco3'],
                        ['BE (V)', 'gasoV_be'],
                        ['SAT O2 (V)', 'gasoV_sato2'],
                        ['Lac (V)', 'gasoV_lac']
                    ];

                    // SEMPRE adiciona 8 linhas, lendo dos spans (ou vazio se não encontrado)
                    venousParams.forEach(([paramLabel, spanId]) => {
                        const spanElement = document.getElementById(spanId);
                        // Pega valor do span. Se span não existe ou tem 'Não encontrado', usa string vazia.
                        const paramValue = (spanElement && spanElement.textContent !== 'Não encontrado') ? spanElement.textContent : '';
                        const valorLimpo = limparValorParaCopia(paramValue); // limparValorParaCopia('') retorna ''
                        tsvString += `${paramLabel}\t${valorLimpo}\n`; // Adiciona linha TSV

                        if (paramLabel === 'Lac (V)') {
                            tsvString += '\n'; // Adiciona linha vaga após Lac (V)
                        }
                    });
                    // Pula o processamento da linha do bloco visível "GASOMETRIA VENOSA"

                // --- NOVA LÓGICA PARA EAS (Ler dos Spans Ocultos) ---
            } else if (label === 'EAS') {
                console.log("Processando EAS para cópia..."); // Log para debug
                const easParams = [
                    ['Cor', 'eas_cor'], ['Aspecto', 'eas_aspecto'], ['pH (EAS)', 'eas_phEAS'],
                    ['Densidade', 'eas_densidade'], ['Proteínas (EAS)', 'eas_proteinas'], ['Glicose (EAS)', 'eas_glicose'],
                    ['Cetona', 'eas_cetona'], ['Bilirrubina (EAS)', 'eas_bilirrubinaEAS'], ['Sangue (EAS)', 'eas_sangueEAS'],
                    ['Urobilinogênio', 'eas_urobilinogenio'], ['Nitrito', 'eas_nitrito'], ['Ácido Ascórbico', 'eas_acidoAscorbico'],
                    ['Esterase Leucocitária', 'eas_esteraseLeucocitaria'], ['Células Epiteliais', 'eas_celulasEpit'],
                    ['Leucócitos / Piócitos', 'eas_leucocitos'], ['Hemácias (EAS)', 'eas_hemacias'], ['Cilindros', 'eas_cilindros'],
                    ['Cristais', 'eas_cristais'], ['Filamento de Muco', 'eas_filamentoMuco'], ['Informações Complementares', 'eas_infcomplementaresEAS']
                ];

                easParams.forEach(([paramLabel, spanId]) => {
                    const spanElement = document.getElementById(spanId);
                    let paramValue = (spanElement && spanElement.textContent !== 'Não encontrado') ? spanElement.textContent : '';

                    // Limpa alertas específicos antes de copiar
                    if (paramValue.includes('VER ARQUIVO FONTE') || paramValue.includes('CHECAR ARQUIVO FONTE')) {
                        paramValue = ''; // Deixa vazio na cópia se for o alerta
                    }

                    // Define se a limpeza complexa deve ser usada (para OBS)
                    const limparComplexo = (paramLabel === 'Informações Complementares');
                    const valorLimpo = limparValorParaCopia(paramValue, limparComplexo);

                    tsvString += `${paramLabel}\t${valorLimpo}\n`; // Adiciona linha TSV
                });
                // Pula o resto do loop para esta linha (não copia o bloco visual)
            // --- FIM DA NOVA LÓGICA PARA EAS --

                } else {
                    // --- LÓGICA NORMAL PARA OUTROS EXAMES (EDITÁVEIS OU NÃO) ---
                    // (Este bloco 'else' permanece como estava antes)
                    const currentValue = cellValueElement.textContent.trim();
                    
                    const isComplex = ['EAS', /* ... outros blocos ... */].includes(label.toUpperCase());
                    const valorLimpoParaCopia = limparValorParaCopia(currentValue, isComplex);

                    // Adiciona a linha normal ao TSV
                    tsvString += `${label}\t${valorLimpoParaCopia}\n`;

                    // Se a linha que acabamos de adicionar foi a da Glicemia, adiciona uma linha extra em branco
                    if (label === 'HbA1c') {
                        tsvString += '\n'; // Adiciona um caractere de nova linha extra
                    }

                    // Se a linha que acabamos de adicionar foi a da Lac (A), adiciona uma linha extra em branco
                    if (label === 'Lac (A)') {
                        tsvString += '\n'; // Adiciona um caractere de nova linha extra
                    }
                }
            }
        }); // Fim do rows.forEach


        navigator.clipboard.writeText(tsvString.trim())
            .then(() => { /* ... feedback sucesso ... */
                console.log('Tabela copiada (Gaso Arterial e Venosa separadas)!');
                botao.textContent = 'Copiado!';
                // ... resto do feedback ...
            })
            .catch(err => { /* ... feedback erro ... */
                 console.error('Erro ao copiar tabela (Gaso separada): ', err);
                 botao.textContent = 'Erro ao Copiar';
                 // ... resto do feedback de erro ...
            });
    }

    // ... (restante do código, incluindo limparValorParaCopia) ...

}); // Fim do DOMContentLoaded

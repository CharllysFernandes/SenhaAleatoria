// Função para gerar senha
function gerarSenha() {
    const usarLetras = document.getElementById("usarLetras").checked;
    const usarNumeros = document.getElementById("usarNumeros").checked;
    const usarCaracteresEspeciais = document.getElementById("usarCaracteresEspeciais").checked;

    const chars = obterCaracteres(usarLetras, usarNumeros, usarCaracteresEspeciais);
    const tamanhoSenha = document.getElementById("tamanhoSenha").value;
    const senha = gerarStringAleatoria(chars, tamanhoSenha);

    const senhaFormatada = formatarSenha(tamanhoSenha, senha);
    document.getElementById("senha").value = senhaFormatada.trim();

    calcularTempoQuebra(chars.length, tamanhoSenha);
    salvarSenhaNoStorage(senhaFormatada.trim());
    carregarSenhasDoStorage();
}

// Função para obter os caracteres com base nas opções selecionadas
function obterCaracteres(usarLetras, usarNumeros, usarCaracteresEspeciais) {
    let chars = "";
    if (usarLetras) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if (usarNumeros) chars += "0123456789";
    if (usarCaracteresEspeciais) chars += "!@#$%^&*()_=+[]{}|;:'\",.<>?/`~";
    return chars;
}

// Função para gerar uma string aleatória
function gerarStringAleatoria(chars, tamanho) {
    let resultado = "";
    for (let i = 0; i < tamanho; i++) {
        resultado += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return resultado;
}

// Função para formatar a senha com base no tamanho
function formatarSenha(tamanhoSenha, senha) {
    let senhaFormatada = "";
    if (tamanhoSenha > 16) {
        senhaFormatada = dividirEmBlocos(senha, 8);
    } else if (tamanhoSenha > 12) {
        senhaFormatada = dividirEmBlocos(senha, 6);
    } else {
        senhaFormatada = dividirAoMeio(senha);
    }
    return senhaFormatada;
}

// Função para dividir a senha em blocos
function dividirEmBlocos(senha, tamanhoBloco) {
    let resultado = "";
    const numBlocos = Math.floor(senha.length / tamanhoBloco);
    const tamanhoFinalBloco = Math.ceil(senha.length / numBlocos);

    if (senha.length > 12) {
        for (let i = 3; i <= tamanhoFinalBloco; i++) {
            if (senha.length % i === 0 && i !== 2) {
                tamanhoBloco = i;
                break;
            }
        }
    }

    for (let i = 0; i < senha.length; i += tamanhoBloco) {
        resultado += senha.slice(i, i + tamanhoBloco) + "-";
    }
    return resultado.slice(0, -1); // Remove o último hífen
}

// Função para dividir a senha ao meio
function dividirAoMeio(senha) {
    const metade = Math.ceil(senha.length / 2);
    return senha.slice(0, metade) + "-" + senha.slice(metade);
}

// Função para copiar a senha
function copiarSenha() {
    const senhaInput = document.getElementById("senha");
    senhaInput.select();
    senhaInput.setSelectionRange(0, 99999); // Para dispositivos móveis
    document.execCommand("copy");
    alert("Senha copiada para a área de transferência!");
}

// Função para atualizar o valor do tamanho da senha
function atualizarValorTamanho() {
    const tamanhoSenha = document.getElementById("tamanhoSenha").value;
    document.getElementById("tamanhoValor").innerText = tamanhoSenha;
}

// Função para calcular o tempo de quebra da senha
function calcularTempoQuebra(numCaracteres, comprimentoSenha) {
    const tentativasPorSegundo = 1000000000; // 1 bilhão de tentativas por segundo
    const totalCombinacoes = Math.pow(numCaracteres, comprimentoSenha);
    const tempoSegundos = totalCombinacoes / tentativasPorSegundo;
    const tempoDias = tempoSegundos / (60 * 60 * 24);
    const tempoQuebra = calcularTempoQuebraTexto(tempoDias);

    const tempoQuebraElement = document.getElementById("tempoQuebra");
    tempoQuebraElement.innerText = tempoQuebra;
    criarTooltip(tempoQuebraElement);
}

// Função para calcular o texto do tempo de quebra
function calcularTempoQuebraTexto(tempoDias) {
    if (tempoDias > 365 * 10000000000) {
        return `Tempo estimado para quebrar a senha: aproximadamente ${(tempoDias / (365 * 1000000000)).toExponential(2)} milhões de anos.`;
    } else if (tempoDias > 365 * 1000000) {
        return `Tempo estimado para quebrar a senha: aproximadamente ${(tempoDias / (365 * 1000)).toFixed(0)} milênios.`;
    } else if (tempoDias > 365 * 100) {
        return `Tempo estimado para quebrar a senha: aproximadamente ${(tempoDias / (365 * 100)).toFixed(0)} séculos.`;
    } else if (tempoDias > 365 * 10) {
        return `Tempo estimado para quebrar a senha: aproximadamente ${(tempoDias / (365 * 10)).toFixed(0)} décadas.`;
    } else if (tempoDias > 365) {
        return `Tempo estimado para quebrar a senha: aproximadamente ${(tempoDias / 365).toFixed(0)} anos.`;
    } else {
        return `Tempo estimado para quebrar a senha: aproximadamente ${tempoDias.toFixed(0)} dias.`;
    }
}

// Função para criar tooltip
function criarTooltip(element) {
    if (!element || !element.parentNode) return;

    const tooltipText = "O cálculo da força bruta envolve tentar todas as combinações possíveis de caracteres até encontrar a senha correta. O tempo estimado depende do número de caracteres possíveis, do comprimento da senha e da taxa de tentativas por segundo.";
    const container = element.parentNode;

    const existingIcon = container.querySelector(".tempo-tooltip-icon");
    if (existingIcon) {
        const instance = bootstrap.Tooltip.getInstance(existingIcon);
        if (instance) {
            instance.dispose();
        }
        existingIcon.remove();
    }

    const infoIcon = document.createElement("i");
    infoIcon.className = "tempo-tooltip-icon bi bi-info-circle ms-2";
    infoIcon.setAttribute("data-bs-toggle", "tooltip");
    infoIcon.setAttribute("data-bs-placement", "right");
    infoIcon.setAttribute("title", tooltipText);

    container.appendChild(infoIcon);
    new bootstrap.Tooltip(infoIcon);
}

// Função para salvar senha no Local Storage
function salvarSenhaNoStorage(senha) {
    const senhasArmazenadas = JSON.parse(localStorage.getItem("senhas")) || [];
    const senhasNormalizadas = senhasArmazenadas.map((item) =>
        typeof item === "string" ? { valor: item } : item
    );

    const registro = {
        valor: senha,
        criadoEm: new Date().toISOString()
    };

    senhasNormalizadas.push(registro);
    localStorage.setItem("senhas", JSON.stringify(senhasNormalizadas));
}

// Função para carregar senhas do Local Storage
function carregarSenhasDoStorage() {
    const historicoSenhas = document.getElementById("historicoSenhas");
    historicoSenhas.innerHTML = ""; // Limpar o conteúdo anterior

    let senhas = JSON.parse(localStorage.getItem("senhas")) || [];
    if (senhas.length === 0) {
        const li = document.createElement("li");
        li.className = "history-empty";
        li.innerHTML = '<i class="bi bi-journal-text me-2"></i> Nenhuma senha gerada ainda. Gere uma nova e ela aparecerá aqui.';
        historicoSenhas.appendChild(li);
        return;
    }

    senhas.forEach((entrada, index) => {
        const registro = typeof entrada === "string" ? { valor: entrada } : entrada;
        const valorSenha = registro?.valor || registro?.senha || "";
        const timestamp = registro?.criadoEm || registro?.createdAt;

        const li = document.createElement("li");
        li.className = "history-item";

        const wrapper = document.createElement("div");
        wrapper.className = "history-text";

        const valor = document.createElement("span");
        valor.className = "history-value";
        valor.innerText = valorSenha;

        const data = document.createElement("small");
        data.className = "history-date";
        data.innerText = formatarDataDoHistorico(timestamp);

        wrapper.appendChild(valor);
        wrapper.appendChild(data);
        li.appendChild(wrapper);

        const btnExcluir = document.createElement("button");
        btnExcluir.type = "button";
        btnExcluir.className = "history-delete bi bi-x-lg";
        btnExcluir.setAttribute("aria-label", "Excluir senha do histórico");
        btnExcluir.onclick = function () {
            excluirSenhaDoStorage(index);
        };

        li.appendChild(btnExcluir);
        historicoSenhas.appendChild(li);
    });
}

function formatarDataDoHistorico(timestamp) {
    if (!timestamp) {
        return "Gerada antes do registro";
    }

    const data = new Date(timestamp);
    if (Number.isNaN(data.getTime())) {
        return "Gerada antes do registro";
    }

    return `Gerada em ${new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(data)}`;
}

// Função para excluir senha do Local Storage
function excluirSenhaDoStorage(index) {
    let senhas = JSON.parse(localStorage.getItem("senhas")) || [];
    senhas.splice(index, 1);
    localStorage.setItem("senhas", JSON.stringify(senhas));
    carregarSenhasDoStorage();
}

// Carrega as senhas salvas ao carregar a página
window.onload = carregarSenhasDoStorage;

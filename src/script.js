const PASS_PHRASE_LIST = typeof PASS_PHRASE_WORDS !== "undefined" ? PASS_PHRASE_WORDS : [];
const DEFAULT_PASSWORD_LENGTH = 10;
const DEFAULT_PASSPHRASE_LENGTH = 4;
const RANGE_CONFIG = {
    senha: { min: 4, max: 64, step: 2, label: "Tamanho da senha" },
    passphrase: { min: 3, max: 12, step: 1, label: "Número de palavras" }
};

let ultimoComprimentoSenha = DEFAULT_PASSWORD_LENGTH;
let ultimoNumeroPalavras = DEFAULT_PASSPHRASE_LENGTH;

function estaEmModoPassphrase() {
    return document.getElementById("usarPassphrases").checked;
}

function clamp(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo);
}

function configurarSliderParaModoAtual() {
    const slider = document.getElementById("tamanhoSenha");
    const label = document.getElementById("tamanhoLabel");
    const modoPassphrase = estaEmModoPassphrase();
    const config = modoPassphrase ? RANGE_CONFIG.passphrase : RANGE_CONFIG.senha;

    slider.min = config.min;
    slider.max = config.max;
    slider.step = config.step;

    const valor = modoPassphrase ? ultimoNumeroPalavras : ultimoComprimentoSenha;
    slider.value = clamp(valor, config.min, config.max);
    label.textContent = config.label;
    atualizarValorTamanho();
}

function handlePassphraseToggle() {
    configurarSliderParaModoAtual();
}

// Função para gerar senha ou passphrase
function gerarSenha() {
    const slider = document.getElementById("tamanhoSenha");
    const usarPassphrases = estaEmModoPassphrase();

    if (usarPassphrases) {
        if (!PASS_PHRASE_LIST.length) {
            alert("A lista de palavras ainda não foi carregada. Tente novamente mais tarde.");
            return;
        }

        const quantidadePalavras = parseInt(slider.value, 10);
        const passphrase = gerarPassphrase(quantidadePalavras);
        document.getElementById("senha").value = passphrase;
        calcularTempoQuebra(PASS_PHRASE_LIST.length, quantidadePalavras);
        salvarSenhaNoStorage(passphrase);
        carregarSenhasDoStorage();
        return;
    }

    const usarLetras = document.getElementById("usarLetras").checked;
    const usarNumeros = document.getElementById("usarNumeros").checked;
    const usarCaracteresEspeciais = document.getElementById("usarCaracteresEspeciais").checked;

    const chars = obterCaracteres(usarLetras, usarNumeros, usarCaracteresEspeciais);
    if (!chars.length) {
        alert("Selecione pelo menos um conjunto de caracteres para gerar a senha.");
        return;
    }

    const tamanhoSenha = parseInt(slider.value, 10);
    const senha = gerarStringAleatoria(chars, tamanhoSenha);

    const senhaFormatada = formatarSenha(tamanhoSenha, senha);
    document.getElementById("senha").value = senhaFormatada.trim();

    calcularTempoQuebra(chars.length, tamanhoSenha);
    salvarSenhaNoStorage(senhaFormatada.trim());
    carregarSenhasDoStorage();
}

function gerarPassphrase(quantidadePalavras) {
    const palavras = [];
    for (let i = 0; i < quantidadePalavras; i++) {
        const indice = Math.floor(Math.random() * PASS_PHRASE_LIST.length);
        palavras.push(PASS_PHRASE_LIST[indice]);
    }
    return palavras.join(" ");
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
    const slider = document.getElementById("tamanhoSenha");
    const tamanhoSenha = Number(slider.value);
    const badge = document.getElementById("tamanhoValor");
    const modoPassphrase = estaEmModoPassphrase();

    if (modoPassphrase) {
        ultimoNumeroPalavras = tamanhoSenha;
        badge.innerText = `${tamanhoSenha} palavras`;
    } else {
        ultimoComprimentoSenha = tamanhoSenha;
        badge.innerText = `${tamanhoSenha}`;
    }
}

// Função para calcular o tempo de quebra da senha
function calcularTempoQuebra(numCaracteres, comprimentoSenha) {
    const tentativasPorSegundo = 1000000000; // 1 bilhão de tentativas por segundo
    if (!numCaracteres || !comprimentoSenha) {
        document.getElementById("tempoQuebra").innerText = "Gere uma combinação para estimar o tempo de quebra.";
        return;
    }
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

function inicializarAplicacao() {
    const passphraseToggle = document.getElementById("usarPassphrases");
    if (passphraseToggle) {
        passphraseToggle.addEventListener("change", handlePassphraseToggle);
    }

    configurarSliderParaModoAtual();
    carregarSenhasDoStorage();
    atualizarValorTamanho();
}

window.addEventListener("DOMContentLoaded", inicializarAplicacao);

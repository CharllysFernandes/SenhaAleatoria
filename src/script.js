// ===== Configuração global =====
const PASS_PHRASE_LIST = typeof PASS_PHRASE_WORDS !== "undefined" ? PASS_PHRASE_WORDS : [];
const DEFAULT_PASSWORD_LENGTH = 10;
const DEFAULT_PASSPHRASE_LENGTH = 4;
const TENTATIVAS_POR_SEGUNDO = 1000000000;
const LOG10_TENTATIVAS_POR_SEGUNDO = Math.log10(TENTATIVAS_POR_SEGUNDO);
const LOG10_SEGUNDOS_POR_DIA = Math.log10(60 * 60 * 24);
const RANGE_CONFIG = {
    senha: { min: 4, max: 64, step: 2, label: "Tamanho da senha" },
    passphrase: { min: 3, max: 12, step: 1, label: "Número de palavras" }
};

const LOG_LIMIARES_TEMPO = {
    decadasBilhoes: Math.log10(365 * 10000000000),
    milhoesAnos: Math.log10(365 * 1000000),
    seculos: Math.log10(365 * 100),
    decadas: Math.log10(365 * 10),
    anos: Math.log10(365),
    dias: 0,
    horas: Math.log10(1 / 24),
    minutos: Math.log10(1 / (24 * 60)),
    segundos: Math.log10(1 / (24 * 60 * 60))
};

const LOG_CONVERSOES = {
    milhoesAnos: Math.log10(365 * 1000000),
    milenios: Math.log10(365 * 1000),
    seculos: Math.log10(365 * 100),
    decadas: Math.log10(365 * 10),
    anos: Math.log10(365),
    dias: 0,
    horas: -Math.log10(24),
    minutos: -Math.log10(24 * 60),
    segundos: -Math.log10(24 * 60 * 60)
};

const FAIXAS_TEMPO = [
    { limite: LOG_LIMIARES_TEMPO.decadasBilhoes, divisor: LOG_CONVERSOES.milhoesAnos, unidade: "milhões de anos", rotulo: "Praticamente impossível" },
    { limite: LOG_LIMIARES_TEMPO.milhoesAnos, divisor: LOG_CONVERSOES.milenios, unidade: "milênios", rotulo: "Extremamente resistente" },
    { limite: LOG_LIMIARES_TEMPO.seculos, divisor: LOG_CONVERSOES.seculos, unidade: "séculos", rotulo: "Muito resistente" },
    { limite: LOG_LIMIARES_TEMPO.decadas, divisor: LOG_CONVERSOES.decadas, unidade: "décadas", rotulo: "Resistente" },
    { limite: LOG_LIMIARES_TEMPO.anos, divisor: LOG_CONVERSOES.anos, unidade: "anos", rotulo: "Boa proteção" },
    { limite: LOG_LIMIARES_TEMPO.dias, divisor: LOG_CONVERSOES.dias, unidade: "dias", rotulo: "Proteção básica" },
    { limite: LOG_LIMIARES_TEMPO.horas, divisor: LOG_CONVERSOES.horas, unidade: "horas", rotulo: "Vulnerável" },
    { limite: LOG_LIMIARES_TEMPO.minutos, divisor: LOG_CONVERSOES.minutos, unidade: "minutos", rotulo: "Muito vulnerável" },
    { limite: LOG_LIMIARES_TEMPO.segundos, divisor: LOG_CONVERSOES.segundos, unidade: "segundos", rotulo: "Quase imediata" },
    { limite: -Infinity, divisor: LOG_CONVERSOES.segundos, unidade: "segundos", rotulo: "Instantânea" }
];

let ultimoComprimentoSenha = DEFAULT_PASSWORD_LENGTH;
let ultimoNumeroPalavras = DEFAULT_PASSPHRASE_LENGTH;

// ===== Utilidades gerais =====
function getElement(id) {
    return document.getElementById(id);
}

function getSlider() {
    return getElement("tamanhoSenha");
}

function getSenhaInput() {
    return getElement("senha");
}

function getTempoQuebraElement() {
    return getElement("tempoQuebra");
}

function estaEmModoPassphrase() {
    const toggle = getElement("usarPassphrases");
    return Boolean(toggle?.checked);
}

function clamp(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo);
}

function configurarSliderParaModoAtual() {
    const slider = getSlider();
    const label = getElement("tamanhoLabel");
    const modoPassphrase = estaEmModoPassphrase();
    const config = modoPassphrase ? RANGE_CONFIG.passphrase : RANGE_CONFIG.senha;
    const valor = modoPassphrase ? ultimoNumeroPalavras : ultimoComprimentoSenha;

    slider.min = config.min;
    slider.max = config.max;
    slider.step = config.step;
    slider.value = clamp(valor, config.min, config.max);
    label.textContent = config.label;
    atualizarValorTamanho();
}

function handlePassphraseToggle() {
    configurarSliderParaModoAtual();
}

function atualizarValorTamanho() {
    const slider = getSlider();
    const badge = getElement("tamanhoValor");
    const valorAtual = Number(slider.value);

    if (estaEmModoPassphrase()) {
        ultimoNumeroPalavras = valorAtual;
        badge.innerText = `${valorAtual} palavras`;
    } else {
        ultimoComprimentoSenha = valorAtual;
        badge.innerText = `${valorAtual}`;
    }
}

// ===== Geração de combinações =====
function gerarSenha() {
    const resultado = estaEmModoPassphrase() ? gerarResultadoPassphrase() : gerarResultadoAlfanumerico();
    if (!resultado) {
        return;
    }

    atualizarCampoSenha(resultado.senha);
    calcularTempoQuebra(resultado.cardinalidade, resultado.comprimento);
    salvarSenhaNoStorage(resultado.senha);
    carregarSenhasDoStorage();
}

function gerarResultadoPassphrase() {
    if (!PASS_PHRASE_LIST.length) {
        alert("A lista de palavras ainda não foi carregada. Tente novamente mais tarde.");
        return null;
    }

    const quantidade = parseInt(getSlider().value, 10);
    const palavras = [];

    for (let i = 0; i < quantidade; i++) {
        const indice = gerarIndiceAleatorio(PASS_PHRASE_LIST.length);
        palavras.push(PASS_PHRASE_LIST[indice]);
    }

    return {
        senha: palavras.join("-"),
        cardinalidade: PASS_PHRASE_LIST.length,
        comprimento: quantidade
    };
}

function gerarResultadoAlfanumerico() {
    const usarLetras = getElement("usarLetras")?.checked;
    const usarNumeros = getElement("usarNumeros")?.checked;
    const usarCaracteresEspeciais = getElement("usarCaracteresEspeciais")?.checked;
    const chars = obterCaracteres(usarLetras, usarNumeros, usarCaracteresEspeciais);

    if (!chars.length) {
        alert("Selecione pelo menos um conjunto de caracteres para gerar a senha.");
        return null;
    }

    const tamanhoSenha = parseInt(getSlider().value, 10);
    const bruta = gerarStringAleatoria(chars, tamanhoSenha);
    const formatada = formatarSenha(tamanhoSenha, bruta).trim();

    return {
        senha: formatada,
        cardinalidade: chars.length,
        comprimento: tamanhoSenha
    };
}

function atualizarCampoSenha(valor) {
    const input = getSenhaInput();
    input.value = valor;
}

function obterCaracteres(usarLetras, usarNumeros, usarCaracteresEspeciais) {
    let chars = "";
    if (usarLetras) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if (usarNumeros) chars += "0123456789";
    if (usarCaracteresEspeciais) chars += "!@#$%^&*()_=+[]{}|;:'\",.<>?/`~";
    return chars;
}

function gerarIndiceAleatorio(limite) {
    if (limite <= 0) {
        return 0;
    }

    const cryptoObj = window.crypto || window.msCrypto;
    if (!cryptoObj || typeof cryptoObj.getRandomValues !== "function") {
        return Math.floor(Math.random() * limite);
    }

    const maximoSeguro = Math.floor(0xffffffff / limite) * limite;
    const buffer = new Uint32Array(1);

    while (true) {
        cryptoObj.getRandomValues(buffer);
        const valor = buffer[0];
        if (valor < maximoSeguro) {
            return valor % limite;
        }
    }
}

function gerarStringAleatoria(chars, tamanho) {
    let resultado = "";
    for (let i = 0; i < tamanho; i++) {
        const indice = gerarIndiceAleatorio(chars.length);
        resultado += chars.charAt(indice);
    }
    return resultado;
}

// ===== Formatação e análise =====
function formatarSenha(tamanhoSenha, senha) {
    if (tamanhoSenha > 16) {
        return dividirEmBlocos(senha, 8);
    }
    if (tamanhoSenha > 12) {
        return dividirEmBlocos(senha, 6);
    }
    return dividirAoMeio(senha);
}

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
    return resultado.slice(0, -1);
}

function dividirAoMeio(senha) {
    const metade = Math.ceil(senha.length / 2);
    return senha.slice(0, metade) + "-" + senha.slice(metade);
}

function calcularTempoQuebra(numCaracteres, comprimentoSenha) {
    if (!numCaracteres || !comprimentoSenha || numCaracteres <= 0 || comprimentoSenha <= 0) {
        renderizarTempoQuebra("Gere uma combinação para estimar o tempo de quebra.");
        return;
    }

    const log10TotalCombinacoes = comprimentoSenha * Math.log10(numCaracteres);
    const log10TempoSegundos = log10TotalCombinacoes - LOG10_TENTATIVAS_POR_SEGUNDO;
    const log10TempoDias = log10TempoSegundos - LOG10_SEGUNDOS_POR_DIA;

    if (!Number.isFinite(log10TempoDias)) {
        renderizarTempoQuebra("Tempo estimado para quebrar a senha: praticamente impossível com força bruta conhecida.");
        return;
    }

    const resumo = obterResumoTempo(log10TempoDias);
    renderizarTempoQuebra(
        `<strong>${resumo.rotulo}:</strong> ${resumo.descricao} <span class="tempo-estimativa-note">(estimativa teórica)</span>`,
        true
    );
}

function obterResumoTempo(log10TempoDias) {
    for (const faixa of FAIXAS_TEMPO) {
        if (log10TempoDias > faixa.limite) {
            return {
                rotulo: faixa.rotulo,
                descricao: formatarEscala(log10TempoDias - faixa.divisor, faixa.unidade)
            };
        }
    }

    return {
        rotulo: "Indeterminado",
        descricao: "Não foi possível calcular a estimativa."
    };
}

function formatarEscala(logValor, unidade) {
    if (!Number.isFinite(logValor)) {
        return `praticamente impossível em termos de ${unidade}`;
    }
    if (logValor > 12) {
        return `aproximadamente 10^${logValor.toFixed(2)} ${unidade}`;
    }

    const valor = Math.pow(10, logValor);
    if (!Number.isFinite(valor)) {
        return `aproximadamente 10^${logValor.toFixed(2)} ${unidade}`;
    }

    let texto;
    if (valor >= 100) {
        texto = valor.toFixed(0);
    } else if (valor >= 10) {
        texto = valor.toFixed(1);
    } else {
        texto = valor.toFixed(2);
    }

    return `aproximadamente ${texto} ${unidade}`;
}

function criarTooltip(element) {
    if (!element || !element.parentNode) return;

    const tooltipText = "Estimativa baseada em 1 bilhão de tentativas por segundo e força bruta pura. Algoritmos de hashing lentos, autenticação em múltiplos fatores e limitações reais podem prolongar ou reduzir esse tempo.";
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

function renderizarTempoQuebra(conteudo, usarHTML = false) {
    const destino = getTempoQuebraElement();
    if (!destino) return;

    const vazio = !conteudo;
    destino.classList.toggle("is-hidden", vazio);

    if (vazio) {
        destino.innerHTML = "";
        return;
    }

    if (usarHTML) {
        destino.innerHTML = conteudo;
    } else {
        destino.innerText = conteudo;
    }

    criarTooltip(destino);
}

// ===== Persistência =====
function salvarSenhaNoStorage(senha) {
    const senhasArmazenadas = JSON.parse(localStorage.getItem("senhas")) || [];
    const senhasNormalizadas = senhasArmazenadas.map((item) =>
        typeof item === "string" ? { valor: item } : item
    );

    senhasNormalizadas.push({
        valor: senha,
        criadoEm: new Date().toISOString()
    });

    localStorage.setItem("senhas", JSON.stringify(senhasNormalizadas));
}

function carregarSenhasDoStorage() {
    const historicoSenhas = getElement("historicoSenhas");
    historicoSenhas.innerHTML = "";

    const senhas = JSON.parse(localStorage.getItem("senhas")) || [];
    if (!senhas.length) {
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

function excluirSenhaDoStorage(index) {
    const senhas = JSON.parse(localStorage.getItem("senhas")) || [];
    senhas.splice(index, 1);
    localStorage.setItem("senhas", JSON.stringify(senhas));
    carregarSenhasDoStorage();
}

// ===== Interação com UI =====
function copiarSenha() {
    const senhaInput = getSenhaInput();
    senhaInput.select();
    senhaInput.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("Senha copiada para a área de transferência!");
}

function inicializarAplicacao() {
    const passphraseToggle = getElement("usarPassphrases");
    passphraseToggle?.addEventListener("change", handlePassphraseToggle);

    configurarSliderParaModoAtual();
    carregarSenhasDoStorage();
    atualizarValorTamanho();
    renderizarTempoQuebra("");
}

window.addEventListener("DOMContentLoaded", inicializarAplicacao);

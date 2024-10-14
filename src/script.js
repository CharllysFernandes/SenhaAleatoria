// Função para gerar senha
function gerarSenha() {
    const usarLetras = document.getElementById("usarLetras").checked;
    const usarNumeros = document.getElementById("usarNumeros").checked;
    const usarCaracteresEspeciais = document.getElementById("usarCaracteresEspeciais").checked;

    let chars = "";

    if (usarLetras) {
        chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    }
    if (usarNumeros) {
        chars += "0123456789";
    }
    if (usarCaracteresEspeciais) {
        chars += "!@#$%^&*()_=+[]{}|;:'\",.<>?/`~";
    }

    const tamanhoSenha = document.getElementById("tamanhoSenha").value;
    let senha = "";
    for (let i = 0; i < tamanhoSenha; i++) {
        senha += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Divisão da senha em blocos conforme o tamanho
    let senhaFormatada = formatarSenha(tamanhoSenha, senha);

    document.getElementById("senha").value = senhaFormatada.trim();

    // Calcular o tempo para quebrar a senha
    calcularTempoQuebra(chars.length, tamanhoSenha);

    // Salvar a senha no Local Storage
    salvarSenhaNoStorage(senhaFormatada.trim());

    // Atualizar o histórico
    carregarSenhasDoStorage();
}

// Função para formatar a senha com base no tamanho
function formatarSenha(tamanhoSenha, senha) {
    let senhaFormatada = "";
    if (tamanhoSenha > 16) {
        for (let i = 0; i < senha.length; i += 8) {
            senhaFormatada += senha.slice(i, i + 8) + "-";
        }
    } else if (tamanhoSenha > 12) {
        for (let i = 0; i < senha.length; i += 6) {
            senhaFormatada += senha.slice(i, i + 6) + "-";
        }
    } else {
        let metade = Math.ceil(senha.length / 2);
        senhaFormatada = senha.slice(0, metade) + "-" + senha.slice(metade);
    }
    return senhaFormatada;
}

// Função para copiar a senha
function copiarSenha() {
    const senhaInput = document.getElementById("senha");
    senhaInput.select();
    senhaInput.setSelectionRange(0, 99999); // Para dispositivos móveis
    document.execCommand("copy");

    // Exibe uma mensagem de confirmação
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
    let tempoQuebra = "";

    if (tempoDias > 365 * 10000000000) {
        const tempoMilhoes = tempoDias / (365 * 1000000000);
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoMilhoes.toExponential(2)} milhões de anos.`;
    } else if (tempoDias > 365 * 1000000) {
        const tempoMilenios = tempoDias / (365 * 1000);
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoMilenios.toFixed(0)} milênios.`;
    } else if (tempoDias > 365 * 100) {
        const tempoSeculos = tempoDias / (365 * 100);
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoSeculos.toFixed(0)} séculos.`;
    } else if (tempoDias > 365 * 10) {
        const tempoDecadas = tempoDias / (365 * 10);
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoDecadas.toFixed(0)} décadas.`;
    } else if (tempoDias > 365) {
        const tempoAnos = tempoDias / 365;
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoAnos.toFixed(0)} anos.`;
    } else {
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoDias.toFixed(0)} dias.`;
    }

    const tempoQuebraElement = document.getElementById("tempoQuebra");
    tempoQuebraElement.innerText = tempoQuebra;

    // Cria o ícone de tooltip
    criarTooltip(tempoQuebraElement);
}

// Função para criar tooltip
function criarTooltip(element) {
    const infoIcon = document.createElement("i");
    infoIcon.className = "bi bi-info-circle ms-2";
    infoIcon.setAttribute("data-bs-toggle", "tooltip");
    infoIcon.setAttribute("data-bs-placement", "right");
    infoIcon.setAttribute("title", "O cálculo da força bruta envolve tentar todas as combinações possíveis de caracteres até encontrar a senha correta. O tempo estimado depende do número de caracteres possíveis, do comprimento da senha e da taxa de tentativas por segundo.");

    const existingIcon = element.nextSibling;
    if (existingIcon && existingIcon.tagName === "I") {
        existingIcon.remove();
    }

    element.parentNode.appendChild(infoIcon);
    new bootstrap.Tooltip(infoIcon);
}

// Função para salvar senha no Local Storage
function salvarSenhaNoStorage(senha) {
    let senhas = JSON.parse(localStorage.getItem("senhas")) || [];
    senhas.push(senha);
    localStorage.setItem("senhas", JSON.stringify(senhas));
}

// Função para carregar senhas do Local Storage
function carregarSenhasDoStorage() {
    const historicoSenhas = document.getElementById("historicoSenhas");
    historicoSenhas.innerHTML = ""; // Limpar o conteúdo anterior

    let senhas = JSON.parse(localStorage.getItem("senhas")) || [];

    senhas.forEach((senha, index) => {
        const li = document.createElement("li");
        li.className = "fw-lighter text-light list-group-item list-group-item-action d-flex justify-content-between align-items-center bg-dark";
        li.innerText = senha;

        // Botão de excluir
        const btnExcluir = document.createElement("span");
        btnExcluir.className = "text-danger bi bi-x-lg text-light";
        btnExcluir.onclick = function () {
            excluirSenhaDoStorage(index);
        };

        li.appendChild(btnExcluir);
        historicoSenhas.appendChild(li);
    });
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

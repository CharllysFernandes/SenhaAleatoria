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

    document.getElementById("senha").value = senhaFormatada.trim();

    
    // Calcular o tempo para quebrar a senha
    calcularTempoQuebra(chars.length, tamanhoSenha);
}

function copiarSenha() {
    const senhaInput = document.getElementById("senha");
    senhaInput.select();
    senhaInput.setSelectionRange(0, 99999); // Para dispositivos móveis
    document.execCommand("copy");

    // Exibe uma mensagem de confirmação
    alert("Senha copiada para a área de transferência!");
}

function atualizarValorTamanho() {
    const tamanhoSenha = document.getElementById("tamanhoSenha").value;
    document.getElementById("tamanhoValor").innerText = tamanhoSenha;
}
function calcularTempoQuebra(numCaracteres, comprimentoSenha) {
    const tentativasPorSegundo = 1000000000; // 1 bilhão de tentativas por segundo
    const totalCombinacoes = Math.pow(numCaracteres, comprimentoSenha);
    const tempoSegundos = totalCombinacoes / tentativasPorSegundo;
    const tempoDias = tempoSegundos / (60 * 60 * 24);
    let tempoQuebra = "";

    if (tempoDias > 365 * 10000000000) { // 10 milênios
        const tempoMilhoes = tempoDias / (365 * 1000000000); // Convertendo para milhões de anos
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoMilhoes.toExponential(2)} milhões de anos.`;
    } else if (tempoDias > 365 * 1000000) { // 1 milênio
        const tempoMilenios = tempoDias / (365 * 1000); // Convertendo para milênios
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoMilenios.toFixed(0)} milênios.`;
    } else if (tempoDias > 365 * 100) { // 100 anos (1 século)
        const tempoSeculos = tempoDias / (365 * 100); // Convertendo para séculos
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoSeculos.toFixed(0)} séculos.`;
    } else if (tempoDias > 365 * 10) { // 10 anos (1 década)
        const tempoDecadas = tempoDias / (365 * 10); // Convertendo para décadas
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoDecadas.toFixed(0)} décadas.`;
    } else if (tempoDias > 365) { // 1 ano
        const tempoAnos = tempoDias / 365; // Convertendo para anos
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoAnos.toFixed(0)} anos.`;
    } else {
        tempoQuebra = `Tempo estimado para quebrar a senha: aproximadamente ${tempoDias.toFixed(0)} dias.`;
    }

    const tempoQuebraElement = document.getElementById("tempoQuebra");

    // Atualiza o texto do tempo de quebra
    tempoQuebraElement.innerText = tempoQuebra;

    // Cria o ícone de tooltip
    const infoIcon = document.createElement("i");
    infoIcon.className = "bi bi-info-circle ms-2";
    infoIcon.setAttribute("data-bs-toggle", "tooltip");
    infoIcon.setAttribute("data-bs-placement", "right");
    infoIcon.setAttribute("title", "O cálculo da força bruta envolve tentar todas as combinações possíveis de caracteres até encontrar a senha correta. O tempo estimado depende do número de caracteres possíveis, do comprimento da senha e da taxa de tentativas por segundo, aqui usamos 1 bilhão de tentativas por segundo.");

    // Remove o ícone de tooltip existente, se houver
    const existingIcon = tempoQuebraElement.nextSibling;
    if (existingIcon && existingIcon.tagName === "I") {
        existingIcon.remove();
    }

    // Adiciona o novo ícone de tooltip
    tempoQuebraElement.parentNode.appendChild(infoIcon);

    // Inicializa o tooltip
    const tooltip = new bootstrap.Tooltip(infoIcon);
}

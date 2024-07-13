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

    if (tempoDias > 365 * 100) {
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

    document.getElementById("tempoQuebra").innerText = tempoQuebra;

    document.getElementById("tempoQuebra").innerText = tempoQuebra;
}
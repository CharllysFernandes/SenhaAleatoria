# Senha Aleatória

> Gerador local de senhas fortes e passphrases em português, com histórico persistido e estimativa de força.

## Recursos principais

- **Geração criptograficamente segura**: usa `window.crypto.getRandomValues` para produzir senhas ou passphrases com entropia consistente.
- **Dois modos**:
  - **Senhas tradicionais** de 4 a 64 caracteres, combinando letras, números e símbolos.
  - **Passphrases em português** de 3 a 12 palavras, baseadas em uma lista Diceware adaptada.
- **Formatação automática**: senhas longas são divididas em blocos ou ao meio, facilitando leitura sem reduzir segurança.
- **Estimativa de quebra por força bruta**: calcula o tempo usando logaritmos para evitar overflow, classifica o resultado (ex.: "Resistente", "Quase imediata") e exibe um tooltip com as premissas.
- **Histórico local**: cada geração é armazenada em `localStorage` com data/hora, permitindo copiar novamente ou excluir com um clique.
- **Interface responsiva**: painel principal para geração e painel lateral com o histórico, tudo em uma única página (`index.html`).

## Como usar

1. Abra o gerador: <http://charllysfernandes.github.io/SenhaAleatoria/>.
2. Ajuste o slider para escolher o comprimento (senhas) ou o número de palavras (passphrases).
3. Ative/desative letras, números, símbolos ou o modo "Usar \"passphrases\"" conforme necessário.
4. Clique em **Gerar**. A combinação aparece no campo verde, pronta para copiar.
5. Utilize **Copiar** para enviar o valor ao clipboard.
6. Consulte o selo "Tempo de quebra" para entender a resistência aproximada e abra o tooltip para ver as premissas do cálculo.
7. No painel de histórico você encontra as últimas combinações salvas localmente (nada é enviado para servidores externos).

## Observações de segurança

- As senhas **não** são sincronizadas: ficam apenas no `localStorage` do navegador atual. Remova entradas manualmente quando terminar.
- A estimativa de força assume 1 bilhão de tentativas por segundo em ataque puramente offline. Bloqueios de login, MFA ou hashing lento podem alterar bastante o cenário.
- O projeto é totalmente estático, podendo ser servido via GitHub Pages ou qualquer servidor HTTP simples.

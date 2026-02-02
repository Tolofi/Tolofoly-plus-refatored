# 1. Tolofoly (Inspirado em jogos de tabuleiro de comércio imobiliário)

> Uma recriação moderna e interativa do clássico jogo de tabuleiro, projetada para ser jogada com uma tela central (TV) e dispositivos móveis como controles.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

## Visão Geral

O **Tolofoly** propõe uma experiência híbrida:
1.  **O Tabuleiro:** Uma aplicação web rodando na TV ou monitor grande, exibindo o estado do jogo, as propriedades e as animações.
2.  **Os Controles:** Os jogadores entram na sala pelo celular via QR Code e realizam ações (rolar dados, comprar, negociar) na palma da mão.

O objetivo é eliminar a complexidade de contar dinheiro e organizar cartas, mantendo a interação social do jogo de tabuleiro.

## Funcionalidades Principais

* **Multijogador em Tempo Real:** Sincronização instantânea via WebSockets (**Socket.io**).
* **Arquitetura Host/Client:** Separação clara entre a visualização do tabuleiro e a interface do jogador.
* **Cartas de sorte e azar pré-geradas por IA:** Eventos dinâmicos que alteram o fluxo da partida (ex: crises econômicas, sorte/revés personalizados), com um toque de personalidade usando nome dos próprios jogadores.
* **Animações Fluidas:** Interface rica utilizando **Framer Motion**.
* **Tema Nacional:** Propriedades baseadas em grandes pontos nacionais.

## Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna de JavaScript/TypeScript:

**Front-end:**
* ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React** (Vite)
* ![JavaScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=javascript&logoColor=white) **JavaScript**
* ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white) **Framer Motion** (Animações)

**Back-end:**
* ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) **Node.js**
* ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **JavaScript**
* ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=flat&logo=socket.io&badgeColor=010101) **Socket.io** (Comunicação em tempo real)

* ## Como Rodar o Tolofoly Localmente

Como o projeto é híbrido, você precisará rodar o "cérebro" (Server) e o "corpo" (Client) em terminais separados.

### Pré-requisitos
* **Node.js** (v18+ recomendado)
* **npm** ou **yarn**
* Um celular conectado na mesma rede Wi-Fi do computador (para testar o controle)

### Passo 1: O Servidor (API + Socket)
O servidor gerencia o estado da partida e a sincronização.

# Clone o repositório
git clone [https://github.com/Tolofi/Tolofoly-plus-refatored.git](https://github.com/Tolofi/Tolofoly-plus-refatored.git)

# Entre na pasta do servidor
cd tolofoly-plus-refatored/server

# Instale as dependências e rode
npm install
npm run dev
# O terminal deve confirmar: "Server running on port 3000"

### Passo 2: O Cliente (TV + Mobile)
A interface visual que renderiza o tabuleiro e o controle.

# Abra um NOVO terminal e entre na pasta do cliente
cd Cliente/my-app

# Instale as dependências e rode
npm install
npm run dev
# Acesse o link local (ex: http://localhost:5173)

### Passo 3: Jogando
Abra o link do front-end no seu PC (ele será a TV/Tabuleiro).

Na tela inicial, clique em "**Colocar IP**". Se você for a primeira pessoa a se conectar, você precisará digitar o ip e a porta manualmente. Depois se mais pessoas forem jogar no seu servidor, basta clicar no botão "**compartilhar IP**" e para os outros jogadores basta clicar em "**Colocar IP**", em seguida "**Escanear QR code**", aceitar as permissões e pronto. Se o ip estiver correto, o servidor rodando e você na mesma rede wifi do servidor você deverá estar conectado.

# Dica: Se o QR Code não conectar, certifique-se de que o firewall do Windows/Linux não está bloqueando a conexão Node.js.

### 2. Seção "Contribuição" e Objetivos Futuros
*Copie e cole isso quase no final do arquivo, antes dos créditos/autor.*

## Contribuição

O Tolofoly é um projeto de aprendizado, mas contribuições são bem-vindas! Se você tem ideias para novos "Eventos de Sorte/Revés" ou melhorias na UI:

1. Faça um **Fork** do projeto.
2. Crie uma Branch para sua feature (`git checkout -b feature/IncendioNoBanco`).
3. Commit suas mudanças (`git commit -m 'Adiciona evento de incêndio'`).
4. Faça o Push para a Branch (`git push origin feature/IncendioNoBanco`).
5. Abra um **Pull Request**.

### Encontrou um bug?
Sinta-se à vontade para abrir uma **Issue** relatando problemas com a conexão WebSocket ou regras do jogo.

### Roadmap / Próximos Passos
[ ] Refatoração do código visando clareza.

[ ] Implementação completa dos eventos de IA via API em tempo real.

[ ] Execução dinamica e pré programadas de cartas de sorte e revés.

[ ] Remoção da "Magic Box (a seta que da acesso a ações gerais)" para todos, mantendo apenas para o ADM.

### Desenvolvido por Tolofi.

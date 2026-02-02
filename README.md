# Monopoly Digital

> Uma recriação moderna e interativa do clássico jogo de tabuleiro, projetada para ser jogada com uma tela central (TV) e dispositivos móveis como controles.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

## Visão Geral

O **Monopoly Digital** propõe uma experiência híbrida:
1.  **O Tabuleiro:** Uma aplicação web rodando na TV ou monitor grande, exibindo o estado do jogo, as propriedades e as animações.
2.  **Os Controles:** Os jogadores entram na sala pelo celular via QR Code e realizam ações (rolar dados, comprar, negociar) na palma da mão.

O objetivo é eliminar a complexidade de contar dinheiro e organizar cartas, mantendo a interação social do jogo de tabuleiro.

## Funcionalidades Principais

* **Multijogador em Tempo Real:** Sincronização instantânea via WebSockets (**Socket.io**).
* **Arquitetura Host/Client:** Separação clara entre a visualização do tabuleiro e a interface do jogador.
* **Cartas de sorte e azar pré-geradas por IA:** Eventos dinâmicos que alteram o fluxo da partida (ex: crises econômicas, sorte/revés personalizados), com um toque de personalidade usando nome dos próprios jogadores.
* **Animações Fluidas:** Interface rica utilizando **Framer Motion**.
* **Tema Nacional:** Propriedades baseadas em grandes pontos nacionais.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna de JavaScript/TypeScript:

**Front-end:**
* ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React** (Vite)
* ![JavaScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=javascript&logoColor=white) **JavaScript**
* ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white) **Framer Motion** (Animações)

**Back-end:**
* ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) **Node.js**
* ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **JavaScript**
* ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=flat&logo=socket.io&badgeColor=010101) **Socket.io** (Comunicação em tempo real)

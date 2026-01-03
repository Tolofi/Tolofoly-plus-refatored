import { Memory } from "./Memory";
type arrayC = [string, boolean][];

export class Carta {
  static cartaSortePublica: arrayC = [
    // --- DINHEIRO / GANHOS FINANCEIROS (CONTINUAÇÃO) ---
    [
      "${jogadorPrincipal}, você achou um ticket de alimentação antigo no bolso da calça que ainda tinha 100 reais de saldo. Você correu para o mercado antes que vencesse. Converta em dinheiro: Receba 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você alugou o sofá da sua sala para ${jogadorCoadjuvante} dormir depois da balada, cobrando pernoite de hotel 5 estrelas mais taxa de turismo. Receba 150 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você descobriu que um tio distante era dono de uma patente de 'descascador de banana automático' e você é o único herdeiro. Os royalties começaram a cair. Receba 200.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu um 'kit de sobrevivência ao apocalipse zumbi' feito com latas de milho e fita crepe para ${jogadorCoadjuvante}, que assistiu The Walking Dead demais. Receba 120 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você participou de uma pesquisa de mercado sobre 'hábitos de consumo de gelo' e mentiu em todas as respostas para parecer interessante. A empresa te pagou pelo insight. Receba 80.",
      false,
    ],
    [
      "${jogadorPrincipal}, você achou uma nota de 50 reais colada com durex no chão da praça de alimentação. Ninguém viu, é sua. Receba 50.",
      false,
    ],
    [
      "${jogadorPrincipal}, você processou o vizinho que fazia aula de bateria às 6 da manhã. O acordo extrajudicial foi satisfatório para seus ouvidos e bolso. Receba 150.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu uma 'consultoria de imagem pessoal' para ${jogadorCoadjuvante}, dizendo que pochete voltou à moda. Ele acreditou e te pagou. Receba 90 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, o banco te cobrou uma taxa de manutenção indevida em 2019. Você reclamou no Procon e eles devolveram em dobro com correção. Receba 140.",
      false,
    ],
    [
      "${jogadorPrincipal}, você ganhou um concurso de karaokê cantando 'Evidências' desafinado, mas com muita paixão. O prêmio da noite é seu. Receba 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convenceu ${jogadorCoadjuvante} a comprar seu TCC da faculdade sobre 'A influência da cor azul na reprodução das formigas'. Ele precisava de um trabalho urgente. Receba 180 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você achou um anel no chão da praia com um detector de metais barato. O ourives confirmou que é ouro de verdade. Receba 200.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu um convite para o beta fechado de um jogo que nem existe para ${jogadorCoadjuvante}. O hype é real, o jogo não. Receba 60 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, sua avó tricotou um suéter para você com notas de dinheiro costuradas no forro 'para o frio'. O inverno chegou e o lucro também. Receba 120.",
      false,
    ],
    [
      "${jogadorPrincipal}, você processou a companhia aérea por perder sua mala que só tinha roupas sujas. A indenização foi maior que o valor das roupas. Receba 160.",
      false,
    ],
    [
      "${jogadorPrincipal}, você cobrou ${jogadorCoadjuvante} por ter sido 'motorista da rodada' na última festa. Taxa Uber dinâmico aplicada. Receba 50 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você achou um cofre antigo enterrado no quintal. Só tinha moedas velhas, mas um colecionador pagou bem por elas. Receba 110.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu seu perfil do Orkut com depoimentos raros para um museu digital. Nostalgia vende. Receba 130.",
      false,
    ],
    [
      "${jogadorPrincipal}, você apostou com ${jogadorCoadjuvante} que ele não sabia a capital do Quirguistão. Ele errou (é Bishkek). Receba 40 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você foi confundido com um artista plástico conceitual ao derrubar tinta na tela. Um crítico elogiou sua 'expressão caótica' e comprou a obra. Receba 170.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu um 'elixir da juventude' (água com limão) para ${jogadorCoadjuvante}. Ele diz que já se sente mais jovem. Receba 70 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você achou um bilhete de loteria não conferido no bolso de uma jaqueta de brechó. Era a quadra! Receba 150.",
      false,
    ],
    [
      "${jogadorPrincipal}, você cobrou direitos autorais de ${jogadorCoadjuvante} por ele ter usado sua piada em uma festa e ganhado risadas. Propriedade intelectual é sério. Receba 30 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você resgatou os pontos do cartão de crédito que iam vencer hoje e trocou por uma batedeira que vendeu na hora. Receba 90.",
      false,
    ],
    [
      "${jogadorPrincipal}, você processou o fabricante de shampoo porque o cabelo não ficou igual ao da propaganda. Acordo fechado. Receba 100.",
      false,
    ],

    // --- MOVIMENTO / AÇÕES ESPECIAIS (CONTINUAÇÃO) ---
    [
      "${jogadorPrincipal}, você descobriu que o ônibus espacial da NASA vai passar pelo seu bairro. Pegue uma carona intergaláctica. Avance para a última casa do tabuleiro.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou um aplicativo de namoro e deu 'match' com alguém que mora perto do banco. Vá para a casa de Sorte mais próxima para o encontro.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convenceu ${jogadorCoadjuvante} a te carregar nas costas porque você está 'muito cansado'. Avance 3 casas montado nele.",
      true,
    ],
    [
      "${jogadorPrincipal}, você ganhou um par de patins rollerblade dos anos 90. É difícil de equilibrar, mas é rápido. Avance 4 casas deslizando.",
      false,
    ],
    [
      "${jogadorPrincipal}, você achou um atalho pelo esgoto, igual as Tartarugas Ninja. É nojento, mas eficiente. Avance 6 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou psicologia reversa no guarda de trânsito. Saia da Prisão imediatamente e peça desculpas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você hackeou o GPS de ${jogadorCoadjuvante} e mandou ele para o lugar errado, enquanto você pega o caminho livre. Avance 5 casas.",
      true,
    ],
    [
      "${jogadorPrincipal}, você ganhou uma bicicleta fixa num sorteio hipster. Avance 3 casas pedalando sem freio.",
      false,
    ],
    [
      "${jogadorPrincipal}, você descobriu que sua casa foi construída em cima de uma mina de diamantes (ou vidro quebrado). Valorizou! Receba 50 por cada casa.",
      false,
    ],
    [
      "${jogadorPrincipal}, você trocou de identidade com ${jogadorCoadjuvante} por um dia para fugir dos credores. Troque de lugar com ele no tabuleiro.",
      true,
    ],
    [
      "${jogadorPrincipal}, você encontrou um portal dimensional no fundo do guarda-roupa que leva para Nárnia (ou para o centro). Vá para o Início.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convenceu o motorista do ônibus a sair da rota e te deixar na porta de casa. Avance para a propriedade vermelha mais próxima.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou o 'jeitinho brasileiro' e furou a fila do pedágio. Avance 4 casas sem pagar nada.",
      false,
    ],
    [
      "${jogadorPrincipal}, você e ${jogadorCoadjuvante} foram perseguidos por um cachorro bravo. O medo dá asas. Avancem ambos 5 casas correndo.",
      true,
    ],
    [
      "${jogadorPrincipal}, você ganhou um test-drive de uma Ferrari e 'esqueceu' de devolver na hora. Avance 8 casas acelerando.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convenceu ${jogadorCoadjuvante} a te dar o lugar dele na fila do banco. Pule para a casa onde ele está e jogue de novo.",
      true,
    ],
    [
      "${jogadorPrincipal}, você descobriu um erro na escritura do terreno vizinho. Roube a propriedade de ${jogadorCoadjuvante} (ou receba o aluguel dela).",
      true,
    ],
    [
      "${jogadorPrincipal}, você ganhou um voo de balão panorâmico, mas o vento te levou para longe. Avance para a Estação de Trem mais distante.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou um drone para espionar o trânsito e achou uma rota livre. Avance 5 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você fingiu ser sonâmbulo e andou pelo tabuleiro sem ser notado. Avance 3 casas silenciosamente.",
      false,
    ],
    [
      "${jogadorPrincipal}, você desafiou ${jogadorCoadjuvante} para uma corrida de carrinho de mão e venceu. Avance 2 casas comemorando.",
      true,
    ],
    [
      "${jogadorPrincipal}, você achou uma mola gigante e prendeu no sapato. Salte 4 casas para frente (cuidado para não cair).",
      false,
    ],
    [
      "${jogadorPrincipal}, você ganhou um ingresso VIP para o show da banda do momento. Vá direto para a casa de Sorte mais próxima.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convenceu o universo de que você é o protagonista do jogo. Jogue os dados novamente.",
      false,
    ],
    [
      "${jogadorPrincipal}, você pegou uma corrente de ar favorável com seu guarda-chuva, estilo Mary Poppins. Avance para qualquer casa amarela.",
      false,
    ],
    [
      // --- 50 CARTAS DE DINHEIRO / GANHOS FINANCEIROS ---
      "${jogadorPrincipal}, você escreveu uma fanfic no LinkedIn sobre como 'observar um cachorro caramelo atravessando a rua te ensinou sobre sinergia B2B e resiliência antifrágil'. O post viralizou, teve 50 mil likes e um CEO emocionado te contratou como 'Head de Vibe' da empresa. Receba 200 de bônus de contratação.",
      false
    ],
    [
      "${jogadorPrincipal}, durante um surto de organização motivado pelo desespero, você vestiu uma jaqueta jeans que não usava desde 2014. No bolso furado, encontrou um maço de notas que sua avó escondeu lá para 'uma emergência'. A inflação corroeu metade do valor, mas a nostalgia vale ouro. Receba 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você encurralou ${jogadorCoadjuvante} no cantinho do churrasco e passou 40 minutos fazendo um pitch agressivo sobre sua nova startup de 'Uber de Capivaras'. Para fazer você calar a boca e parar de usar termos em inglês, ele concordou em ser seu investidor anjo. Receba 150 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, a Receita Federal rodou uma malha fina no sistema e, por um milagre divino ou incompetência do estagiário, decidiram que você pagou imposto demais nos últimos 5 anos. A restituição caiu na sua conta com correção monetária baseada na taxa Selic. Receba 180 e não faça perguntas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você anunciou seu Marea Turbo 2002 na internet descrevendo-o como 'uma máquina de emoções explosivas'. ${jogadorCoadjuvante}, que acha que entende de mecânica porque assiste tutorial no YouTube, comprou à vista. O motor fundiu na esquina, mas o Pix já caiu. Receba 120 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você encontrou um HD externo velho na gaveta de cabos e descobriu que, em um momento de delírio em 2013, tinha comprado 20 reais de uma criptomoeda com nome de cachorro. Hoje isso vale mais que a sua dignidade. Receba 200 e vá jantar fora.",
      false,
    ],
    [
      "${jogadorPrincipal}, sua avó sonhou que você estava 'muito magrinho' e passando fome na cidade grande, então ela quebrou o porquinho de porcelana e te mandou um Pix generoso com a descrição 'para comprar sustância'. Agradeça a véia e receba 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, depois de receber 47 ligações de cobrança procurando um tal de 'Valdir', você surtou, gravou tudo e processou a operadora por danos psicológicos e perturbação do sossego. O juiz se compadeceu da sua dor. Causa ganha! Receba 150 de indenização.",
      false,
    ],
    [
      "${jogadorPrincipal}, você deu uma consultoria de bar sobre 'Mindset de Crescimento Exponencial' para ${jogadorCoadjuvante} depois de três cervejas. Ele estava bêbado demais para perceber que você só estava repetindo frases de parachoque de caminhão e te pagou pela mentoria. Receba 50 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você descobriu um bug no aplicativo do banco que arredonda todos os centavos das transações para cima e deposita na sua conta. O TI chamou de 'falha crítica', você chamou de 'programas de fidelidade agressivo'. Antes que corrijam, receba 130.",
      false,
    ],
    [
      "${jogadorPrincipal}, você apostou com ${jogadorCoadjuvante} que ele não conseguiria comer um ovo cozido inteiro de uma vez só sem beber água. A ganância dele foi maior que a garganta e ele perdeu a aposta (e quase o ar). Receba 80 de ${jogadorCoadjuvante} pela vitória moral.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu tutorial no YouTube ensinando a fazer 'Gato na Net' usando apenas papel alumínio e chiclete mascado bateu 2 milhões de visualizações. A Polícia Federal está de olho, mas o AdSense pagou. Receba 160 dólares convertidos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você finalmente foi contemplado naquele consórcio de uma moto 125cc que você começou a pagar quando ainda tinha esperança no Brasil. Você nem quer a moto, mas vendeu a carta de crédito com ágio. Receba 200.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu um curso de 'Day Trade para Preguiçosos' para ${jogadorCoadjuvante}, prometendo ganhos rápidos sem sair do sofá. Ele perdeu todas as economias na bolsa, mas o dinheiro do curso não tem reembolso. Receba 110 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você encontrou uma carteira de couro italiano na rua, devolveu intacta e descobriu que o dono era um coach quântico famoso. Ele ficou tão grato pelo seu 'alinhamento ético' que te deu uma recompensa para limpar seu karma financeiro. Receba 140.",
      false,
    ],
    [
      "${jogadorPrincipal}, você alugou sua laje (sem reboco) para ${jogadorCoadjuvante} fazer um churrasco de aniversário. Você cobrou taxa de limpeza, aluguel da grelha e 'taxa de vista panorâmica' da comunidade. Receba 90 de ${jogadorCoadjuvante} pela exploração imobiliária.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu vizinho tentou fazer um 'gato' na rede elétrica, mas ligou os fios cruzados e acabou pagando a sua conta de luz dos últimos três meses por engano. A companhia elétrica te reembolsou o valor pago em duplicidade. Receba 120.",
      false,
    ],
    [
      "${jogadorPrincipal}, você participou de um Hackathon varando a noite à base de energético barato e criou um app que apenas diz 'Bom dia'. Um investidor achou 'disruptivo e minimalista' e comprou o código. Receba 180.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu aquela esteira ergométrica que servia apenas de cabide de roupas há 5 anos para ${jogadorCoadjuvante}. Você jurou que era seminova e ele acreditou no seu papo de vendedor. Receba 100 de ${jogadorCoadjuvante} e libere espaço na sala.",
      true,
    ],
    [
      "${jogadorPrincipal}, você teve um sonho premonitório com um macaco comendo banana e jogou a milhar no Bicho. O bicheiro da esquina, conhecido pela honestidade duvidosa, pagou o prêmio certinho. Receba 200 sem declarar imposto.",
      false,
    ],
    [
      "${jogadorPrincipal}, você fingiu ser 'Marido de Aluguel' e foi na casa de ${jogadorCoadjuvante} trocar uma resistência de chuveiro. Você só apertou um parafuso que estava solto, mas cobrou como se tivesse refeito a fiação inteira. Receba 60 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, o algoritmo do banco sofreu um surto psicótico e te enviou um cartão Black sem anuidade e com limite infinito por engano. Você aproveitou para vender as milhas do bônus de boas-vindas. Receba 150 antes que cancelem.",
      false,
    ],
    [
      "${jogadorPrincipal}, com um faro de negócios apurado, você vendeu seus ingressos para o show que seria cancelado para ${jogadorCoadjuvante} dois dias antes do anúncio oficial. Ele ficou com o prejuízo e você com o lucro. Receba 120 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, sua tia rica e um pouco senil te confundiu com seu primo que passou em Medicina na Federal. Ela te deu um envelope gordo de presente de formatura adiantado. Sorria, acene e não corrija ela. Receba 200.",
      false,
    ],
    [
      "${jogadorPrincipal}, você surfou no hype e lançou uma coleção de NFTs de 'Capivaras Cyberpunk Pixeladas'. ${jogadorCoadjuvante}, com medo de ficar de fora da tendência (FOMO), comprou a mais cara. Receba 140 de ${jogadorCoadjuvante} por um jpg.",
      true,
    ],
    [
      "${jogadorPrincipal}, você encontrou um boleto de luz pago caído no chão da lotérica. O caixa, confuso e estressado, achou que era o troco que você tinha esquecido e te entregou o dinheiro. Sorte de principiante ou estelionato leve? Receba 50.",
      false,
    ],
    [
      "${jogadorPrincipal}, você processou a fabricante do seu pacote de bolachas favorito porque vieram 3 bolachas a menos que a imagem ilustrativa. O jurídico da empresa preferiu fazer um acordo a ir para o tribunal. Pequenas causas, grandes vitórias. Receba 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convenceu ${jogadorCoadjuvante} de que seu PlayStation 2 velho e empoeirado é um item 'retrô vintage de colecionador' raríssimo. A nostalgia bateu forte nele e o PIX também. Receba 150 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você ganhou o bolão da firma na Copa do Mundo, mesmo sem saber a diferença entre impedimento e escanteio, apenas escolhendo as seleções baseadas na beleza do uniforme. Os colegas especialistas estão furiosos. Receba 130.",
      false,
    ],
    [
      "${jogadorPrincipal}, você encontrou uma nota promissória de 2018 num guardanapo onde ${jogadorCoadjuvante} prometia pagar a cerveja. Você cobrou a dívida com juros compostos, correção monetária e taxa de inconveniência. Receba 40 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, após um golpe de estado na reunião de condomínio, o síndico foi deposto e descobriram um caixa 2 que foi redistribuído aos moradores. O reembolso chegou em boa hora. Receba 110.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu um 'Plano de Biohacking' para ${jogadorCoadjuvante} que consiste basicamente em acordar às 4h da manhã, tomar banho gelado e gritar no espelho. Ele pagou pela esperança de ser produtivo. Receba 80 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você conferiu o troco da padaria e percebeu que te deram uma moeda comemorativa das Olimpíadas de 2016 que vale uma fortuna para colecionadores nerds no Mercado Livre. Venda concluída! Receba 150.",
      false,
    ],
    [
      "${jogadorPrincipal}, seu chefe te elogiou publicamente por 'vestir a camisa da empresa', embora você estivesse apenas usando um casaco para esconder uma mancha de café na camiseta. O mal-entendido gerou um bônus. Receba 120.",
      false,
    ],
    [
      "${jogadorPrincipal}, você encontrou o fotolog antigo de ${jogadorCoadjuvante} com fotos dele usando franja emo e calça colorida. Ele pagou pelo seu silêncio para que essas imagens nunca cheguem ao grupo da família. Receba 70 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você abriu uma franquia de 'Paletas Mexicanas' em 2014 e faliu, mas achou um freezer velho cheio delas que ainda estavam comestíveis (talvez). Vendeu tudo na praia num dia de 40 graus. Receba 90.",
      false,
    ],
    [
      "${jogadorPrincipal}, você ganhou um sorteio no Instagram que exigia marcar 50 amigos nos comentários. Você perdeu 5 amigos que te bloquearam, mas ganhou o prêmio em dinheiro. Receba 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você agenciou a transferência do seu cachorro, que é um craque de bola, para o time de várzea de ${jogadorCoadjuvante}. A taxa de transferência do atleta canino foi paga à vista. Receba 30 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você descobriu documentos antigos que provam que seu bisavô comeu uma pizza na Itália em 1910. Você vendeu a vaga na fila da cidadania italiana para um parente desesperado. Receba 180.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convenceu ${jogadorCoadjuvante} a entrar na sua rede de marketing multinível de óleos essenciais. Ele agora é sua base e você subiu para o nível 'Diamante Duplo'. Receba 100 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, sua startup de 'Aluguel de Amigos para Festas de Fim de Ano' foi um sucesso absoluto. A solidão e a carência alheia encheram o seu bolso neste Natal. Receba 160.",
      false,
    ],
    [
      "${jogadorPrincipal}, num brechó, você enfiou a mão no bolso de um casaco de 20 reais e achou uma nota de 50. Você devolveu o casaco para a arara e saiu da loja com o lucro líquido. Receba 50.",
      false,
    ],
    [
      "${jogadorPrincipal}, o estagiário do banco errou a vírgula na cobrança de juros do seu cheque especial e o sistema te creditou o valor como 'estorno de relacionamento'. Um glitch do milênio a seu favor! Receba 200.",
      false,
    ],
    [
      "${jogadorPrincipal}, você trocou uma figurinha brilhante 'Legends' do álbum da Copa por um almoço completo pago por ${jogadorCoadjuvante}. A escassez gera valor. Receba o equivalente a 40 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você ganhou o prêmio 'Funcionário do Mês' por eliminação, simplesmente por ser a única pessoa do departamento que não pegou atestado médico na semana do feriado. A presença conta. Receba 80.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu um 'Planner Quântico 2026' para ${jogadorCoadjuvante}, jurando que aquele caderno de papelaria iria organizar o caos da vida dele. A esperança vende bem. Receba 60 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você encontrou um bilhete único de transporte com saldo bugado infinito e vendeu para um turista gringo que achou que era um 'City Pass' oficial. Receba 90 sem peso na consciência.",
      false,
    ],
    [
      "${jogadorPrincipal}, você processou o vizinho que criava um galo cantor em apartamento urbano. O juiz decidiu que o seu sono vale mais que a tradição rural do vizinho. O silêncio vale ouro. Receba 110.",
      false,
    ],
    [
      "${jogadorPrincipal}, na balada, te confundiram com um ex-BBB da edição 4. ${jogadorCoadjuvante}, querendo aparecer, pagou um combo de vodka caríssimo para você. Aceite o prejuízo dele em dinheiro. Receba 150 de ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, ao cavar um buraco para plantar uma samambaia, você perfurou um cano da prefeitura que jorrou água potável. A indenização pelo transtorno da obra foi surpreendentemente generosa. Receba 200.",
      false,
    ],

    // --- 50 CARTAS DE MOVIMENTO / AÇÕES ESPECIAIS ---
    [
      "${jogadorPrincipal}, você chamou um mototáxi clandestino que conhece becos e vielas que não constam no Google Maps. Ele desafiou as leis da física e te levou ao destino em tempo recorde. Avance 5 casas voando baixo.",
      false,
    ],
    [
      "${jogadorPrincipal}, você fez um 'call' de alinhamento de chakras com o universo e, incrivelmente, ele te respondeu positivamente. A sorte está lançada. Jogue os dados novamente para aproveitar a sinergia cósmica.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou seu crachá antigo de uma empresa que faliu há 3 anos para entrar no evento VIP e comer canapés de graça. Ninguém notou. Avance para a casa de Sorte mais próxima de barriga cheia.",
      false,
    ],
    [
      "${jogadorPrincipal}, sua lábia de vendedor de curso funcionou com a polícia! Você convenceu o guarda de que não estava fugindo, mas sim 'empreendendo no trânsito'. Ganhe um Habeas Corpus: Livre-se da Prisão (guarde este cartão).",
      false,
    ],
    [
      "${jogadorPrincipal}, você descobriu que o muro do terreno de ${jogadorCoadjuvante} caiu e virou uma passagem pública. Corte caminho por dentro da propriedade dele sem pedir licença. Avance até a casa onde ele está.",
      true,
    ],
    [
      "${jogadorPrincipal}, o universo conspirou a favor do seu networking agressivo. Você foi promovido a CEO da sua própria vida. Avance triunfante até o Início e pegue seu bônus de proatividade.",
      false,
    ],
    [
      "${jogadorPrincipal}, você e ${jogadorCoadjuvante} dividiram um Uber Black para chegar na festa pagando de ricos, mas comeram macarrão instantâneo em casa antes de sair. A imagem é tudo. Avancem juntos 4 casas.",
      true,
    ],
    [
      "${jogadorPrincipal}, você ganhou um patinete elétrico num sorteio de shopping, mas a bateria viciou nos primeiros 10 minutos. Aproveite enquanto dura. Avance 3 casas antes que tenha que empurrar com o pé.",
      false,
    ],
    [
      "${jogadorPrincipal}, você decidiu dar um 'ghosting' nos seus boletos e problemas e sumiu do mapa sem deixar rastros. Pegue o primeiro trem. Avance para a Estação de Trem mais próxima.",
      false,
    ],
    [
      "${jogadorPrincipal}, você invadiu o sistema de aluguéis usando um script em Python que copiou de um fórum russo. Redirecione o fluxo de caixa: Roube o próximo aluguel que ${jogadorCoadjuvante} receberia.",
      true,
    ],
    [
      "${jogadorPrincipal}, você mentiu para o chefe dizendo que sua internet caiu porque um tubarão mordeu o cabo submarino. Ele acreditou. Dia de folga! Jogue os dados duas vezes seguidas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você mudou seu mindset, reprogramou seu DNA quântico e agora enxerga a realidade de outra dimensão. A confusão é tanta que você troca de lugar com ${jogadorCoadjuvante} no tabuleiro.",
      true,
    ],
    [
      "${jogadorPrincipal}, você descobriu uma passagem secreta atrás da máquina de café da firma que leva direto para a saída de emergência. Fuja do trabalho mais cedo. Avance 6 casas sem bater o ponto.",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} te deve um favor daquela vez que você o ajudou a esconder o carro batido do pai dele. Ele te dá um empurrãozinho camarada. Avance 3 casas nas costas dele.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu coach financeiro disse para você 'visualizar o sucesso' e morar onde os ricos moram. Você visualizou com tanta força que se teletransportou. Avance para a propriedade mais cara do jogo.",
      false,
    ],
    [
      "${jogadorPrincipal}, você colou na traseira de uma ambulância no trânsito e aproveitou o corredor aberto pela sirene. É antiético, mas muito eficiente. Avance 7 casas em velocidade máxima.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou um pêndulo de cristal e técnicas de PNL para hipnotizar ${jogadorCoadjuvante}. Ele está sob seu controle mental. Jogue o turno dele no lugar dele (e faça besteira se quiser).",
      true,
    ],
    [
      "${jogadorPrincipal}, o Waze te mandou por um caminho de terra estranho, cheio de galinhas, mas que cortou todo o engarrafamento da marginal. Avance 4 casas com o carro sujo de lama.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi convidado para uma festa exclusiva em Jurerê Internacional por um 'Sugar Daddy' (ou Mommy). Pegue o jatinho particular e vá direto para a última casa do tabuleiro.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou a técnica de 'rapport' com o cobrador, elogiou o corte de cabelo dele e perguntou da família. Ele ficou sem graça de te cobrar. Ganhe isenção no próximo aluguel que cair.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convenceu ${jogadorCoadjuvante} de que a casa dele foi construída sobre um cemitério indígena amaldiçoado. Ele fugiu gritando. Avance para a casa que ele ocupava (se for dele, não pague nada).",
      true,
    ],
    [
      "${jogadorPrincipal}, você comprou uma rifa beneficente e ganhou um par de tênis de corrida com 'tecnologia da NASA' (made in China). Eles são rápidos! Avance 5 casas correndo.",
      false,
    ],
    [
      "${jogadorPrincipal}, o sistema do banco saiu do ar bem na hora de debitar a taxa da sua conta, gerando um erro fatal a seu favor. Avance até a próxima casa de 'Sorte' para comemorar o bug.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou o ChatGPT para escrever uma notificação extrajudicial cheia de 'juridiquês' que assustou seus credores. Anule sua próxima carta de Azar. (Guarde este cartão).",
      false,
    ],
    [
      "${jogadorPrincipal}, você fez um 'networking agressivo', furou a fila do buffet e passou na frente de todo mundo. Salte por cima de ${jogadorCoadjuvante} e aterrisse 1 casa à frente dele.",
      true,
    ],
    [
      "${jogadorPrincipal}, feriado prolongado emendado com atestado médico de conjuntivite (falso)! Ninguém vai te achar. Vá descansar: Avance para o 'Estacionamento Grátis' (ou casa neutra mais próxima).",
      false,
    ],
    [
      "${jogadorPrincipal}, espalharam o boato de que vai passar uma linha de metrô na porta da sua casa. É mentira, mas o mercado imobiliário enlouqueceu. Receba taxa de valorização de 50 por cada casa que possui.",
      false,
    ],
    [
      "${jogadorPrincipal}, você pediu carona na estrada e um caminhoneiro gente fina te levou ouvindo modão de viola e contando histórias da vida. A viagem rendeu. Avance 8 casas cantando 'Evidências'.",
      false,
    ],
    [
      "${jogadorPrincipal}, você fez um 'benchmarking' (cópia descarada) da estratégia de ${jogadorCoadjuvante}. Se funciona para ele, funciona para você. Avance o mesmo número de casas que ele andou na última vez.",
      true,
    ],
    [
      "${jogadorPrincipal}, Black Friday do mercado imobiliário! O gerente do banco ficou louco e liberou subsídio. O banco paga 50% da sua próxima compra de imóvel. (Guarde este cartão e use com sabedoria).",
      false,
    ],
    [
      "${jogadorPrincipal}, você encontrou uma brecha no contrato de aluguel escrita em letras miúdas no rodapé da página 42. Se cair na casa de ${jogadorCoadjuvante} agora, você tem isenção total.",
      true,
    ],
    [
      "${jogadorPrincipal}, o universo te deu um 'upgrade' de classe social baseado no seu carisma. Avance direto para a propriedade livre mais próxima e compre se tiver saldo (ou chore se não tiver).",
      false,
    ],
    [
      "${jogadorPrincipal}, você desafiou ${jogadorCoadjuvante} para uma corrida de saco na firma e, contra todas as probabilidades, venceu. A humilhação dele é seu troféu. Avance 3 casas rindo.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu horóscopo disse que Júpiter está retrógrado em Capricórnio, o que significa dia de ousadia financeira. Se tirar dados iguais na próxima jogada, ganhe 100 reais bônus do cosmos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você achou um skate quebrado no lixo, consertou com Silver Tape e supercola. Ficou perigoso, mas rápido. Avance 2 casas fazendo manobras radicais (e arriscadas).",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} te convidou para ser sócio numa cervejaria artesanal. Você roubou a ideia, patenteou a marca e saiu correndo. Jogue o dado novamente e fuja antes que ele perceba.",
      true,
    ],
    [
      "${jogadorPrincipal}, você ativou o modo 'Monge Tibetano Minimalista', doou seus bens materiais (mentira) e ignorou as dívidas. Avance até o Início para meditar sobre o capitalismo.",
      false,
    ],
    [
      "${jogadorPrincipal}, você ganhou um vale-transporte da firma, mas vendeu para comprar cerveja e decidiu ir a pé. O exercício te fez bem. Avance 4 casas caminhando com saúde.",
      false,
    ],
    [
      "${jogadorPrincipal}, você explorou um bueiro aberto e descobriu um túnel de metrô abandonado da década de 70 que corta metade da cidade. Vá direto para a Estação mais distante sem pagar passagem.",
      false,
    ],
    [
      "${jogadorPrincipal}, você usou sua melhor roupa e convenceu o guarda de que é filho ilegítimo do prefeito. Ele ficou com medo de ser demitido. Saia da Prisão imediatamente (se estiver lá) ou avance 5 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você ofereceu um energético 'batizado' com sonífero para ${jogadorCoadjuvante} dizendo que era pré-treino. Enquanto ele tira uma soneca, jogue dois turnos seguidos.",
      true,
    ],
    [
      "${jogadorPrincipal}, em ano de eleição, a prefeitura finalmente asfaltou a sua rua cheia de buracos. Seus imóveis valorizaram magicamente. Receba taxa de benfeitoria de 40 por cada casa que possui.",
      false,
    ],
    [
      "${jogadorPrincipal}, um drone de entregas da Amazon caiu no seu quintal com a carga intacta e as hélices funcionando. Você se pendurou nele e voou. Avance 6 casas pelos ares.",
      false,
    ],
    [
      "${jogadorPrincipal}, você fez um curso de oratória e persuasão e convenceu todos os jogadores a te darem 20 reais cada um como 'taxa de admiração e respeito'. Ninguém entendeu porquê, mas pagaram.",
      false,
    ],
    [
      "${jogadorPrincipal}, você desafiou ${jogadorCoadjuvante} para uma batalha de passinho de funk no meio da rua. Sua malemolência humilhou o adversário. Avance 3 casas fazendo o 'quadradinho'.",
      true,
    ],
    [
      "${jogadorPrincipal}, sorte de principiante ou erro do sistema? Avance para qualquer casa vermelha do tabuleiro (ou a cor que você mais gostar, quem manda é você).",
      false,
    ],
    [
      "${jogadorPrincipal}, você encontrou uma falha na textura da realidade, tipo um erro na Matrix. Teleporte-se instantaneamente para a casa exatamente oposta à que você está agora no tabuleiro.",
      false,
    ],
    [
      "${jogadorPrincipal}, você e ${jogadorCoadjuvante} anunciaram uma fusão estratégica das empresas para dominar o mercado (monopólio). Avancem ambos para o Serviço Público mais próximo para assinar a papelada.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu vídeo de 'recebidos' de caixas vazias bombou no TikTok. Um patrocinador mandou um carro de luxo te buscar. Entre no ar condicionado e avance 10 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, hoje você é o 'Rei do Camarote'. Avance para a casa onde está qualquer jogador e obrigue-o a pagar uma bebida (50 reais) para você brindar ao seu próprio sucesso.",
      true,
    ],
  ];

  static cartaAzarPublica: arrayC = [
    // --- 50 CARTAS DE PREJUÍZO FINANCEIRO (PAGAMENTOS) ---
    [
      "${jogadorPrincipal}, você caiu no conto do 'Urubu do Pix' acreditando que se enviasse 50 reais voltariam 500. Obviamente, o único retorno que você teve foi a vergonha e o bloqueio no WhatsApp. Pague 100 pela ingenuidade.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi padrinho de casamento de ${jogadorCoadjuvante} e teve que comprar um presente da lista, alugar terno e ainda pagar a gravata. Sua amizade custou caro. Pague 150 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você esqueceu o microfone aberto na reunião do Zoom enquanto falava mal do projeto do chefe para o seu gato. O RH considerou uma 'falha de conduta corporativa'. Pague 200 de multa ou rescisão.",
      false,
    ],
    [
      "${jogadorPrincipal}, seu Marea Turbo finalmente explodiu na porta da balada. Além do guincho, você teve que pagar a lavagem dos carros vizinhos que ficaram sujos de óleo. Pague 180.",
      false,
    ],
    [
      "${jogadorPrincipal}, você bateu no carro de ${jogadorCoadjuvante} enquanto gravava um Story dirigindo. O seguro se recusou a pagar porque 'influenciador não é profissão de risco, é risco de profissão'. Pague 120 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, o Leão da Receita Federal te pegou! Você declarou seu videogame como 'material de escritório' e a malha fina não perdoou. Devolva 200 aos cofres públicos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você comprou um curso de 'Milionário com Dropshipping' de um guru de 19 anos. O site saiu do ar e o guru fugiu para Dubai. Pague 150 pelo prejuízo educacional.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi fiador de ${jogadorCoadjuvante} no aluguel de uma kitnet. Ele fugiu para a praia devendo três meses e deixou a conta para você. Pague 100 ao banco em nome dele.",
      true,
    ],
    [
      "${jogadorPrincipal}, sua Air Fryer 220v foi ligada na tomada 110v (ou vice-versa) durante a tentativa de fazer um pudim. O estouro foi lindo, o cheiro de queimado nem tanto. Compre uma nova por 130.",
      false,
    ],
    [
      "${jogadorPrincipal}, você perdeu uma aposta idiota com ${jogadorCoadjuvante} sobre quem conseguia segurar um cubo de gelo na mão por mais tempo. Você ganhou uma queimadura de frio e uma dívida. Pague 50 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você esqueceu de cancelar a assinatura do app de meditação que nunca usou. A renovação automática anual caiu hoje no cartão de crédito. Respire fundo e pague 120.",
      false,
    ],
    [
      "${jogadorPrincipal}, seu cachorro comeu o cabo de fibra óptica da internet e o técnico cobrou taxa de visita improdutiva porque riu da sua cara. Pague 80.",
      false,
    ],
    [
      "${jogadorPrincipal}, você derrubou vinho tinto no tapete branco (e caro) de ${jogadorCoadjuvante} durante uma festa chique. O Vanish não resolveu. Pague 140 para ${jogadorCoadjuvante} pela lavagem profissional.",
      true,
    ],
    [
      "${jogadorPrincipal}, você investiu suas economias numa criptomoeda baseada em memes de capivara que prometia 'ir para a Lua'. Ela foi para o buraco. Pague 200 pelo prejuízo do hype.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi multado por 'excesso de lerdeza' na fila do banco. O guarda não gostou da sua cara de sono. Pague 50.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou consertar o vazamento da pia assistindo tutorial no YouTube e acabou inundando o apartamento do vizinho de baixo. Pague 180 pelos danos hidráulicos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você pegou o Uber de ${jogadorCoadjuvante} por engano e a corrida foi para outra cidade. Ele te cobrou o valor no app. Pague 60 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, sua tentativa de fazer harmonização facial caseira deu errado e você ficou parecendo um personagem de desenho animado. Pague 150 para um médico consertar isso.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi processado por um fotógrafo por usar uma foto dele no seu blog de poesias que tem 3 acessos (um deles é sua mãe). Direitos autorais são sérios. Pague 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você prometeu pagar o churrasco se o seu time perdesse. Seu time tomou de 4 a 0. Cumpra a promessa e pague 120 para ${jogadorCoadjuvante} comprar a carne.",
      true,
    ],
    [
      "${jogadorPrincipal}, você comprou ingressos para o Fyre Festival brasileiro que aconteceria num terreno baldio. O evento foi cancelado e o organizador sumiu. Pague 200.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego no flagra roubando Wi-Fi do vizinho. Ele trocou a senha e te mandou a conta da instalação. Pague 40.",
      false,
    ],
    [
      "${jogadorPrincipal}, você quebrou a tela do celular de ${jogadorCoadjuvante} tentando mostrar um meme engraçado e gesticulando demais. A graça acabou. Pague 150 para ${jogadorCoadjuvante} trocar o display.",
      true,
    ],
    [
      "${jogadorPrincipal}, você esqueceu o aniversário de namoro e teve que comprar um presente de última hora superfaturado no shopping para evitar o término. Pague 130.",
      false,
    ],
    [
      "${jogadorPrincipal}, sua dieta low-carb te fez desmaiar na academia e você quebrou a esteira na queda. A indenização custa caro. Pague 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou vender um NFT da sua própria selfie, mas a taxa de transação da rede (gas fee) foi maior que o valor da venda. Prejuízo burro. Pague 80.",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} te convenceu a entrar num esquema de 'Mandala da Prosperidade'. Você deu o dinheiro e a mandala girou... para longe de você. Pague 110 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você foi taxado na alfândega por comprar bugigangas da China que custavam 2 dólares. O imposto é de 300%. Pague 50.",
      false,
    ],
    [
      "${jogadorPrincipal}, você perdeu a comanda da balada e o segurança te cobrou uma multa abusiva como se você tivesse bebido todo o estoque do bar. Pague 200.",
      false,
    ],
    [
      "${jogadorPrincipal}, você pegou emprestada a furadeira de ${jogadorCoadjuvante} e queimou o motor tentando furar uma coluna de concreto. Pague 90 para ${jogadorCoadjuvante} comprar uma nova.",
      true,
    ],
    [
      "${jogadorPrincipal}, você foi pego na blitz da Lei Seca. Você não bebeu, mas o documento do carro estava vencido desde 2018. Pague 180 de multa.",
      false,
    ],
    [
      "${jogadorPrincipal}, você contratou um coach de produtividade que te obrigou a acordar às 3 da manhã. Você dormiu no trabalho e teve o salário descontado. Pague 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você deu 'match' com um perfil fake e foi num encontro. Era um assalto (ou pior, uma palestra de vendas). Levaram sua carteira. Pague 150.",
      false,
    ],
    [
      "${jogadorPrincipal}, você apostou todas as fichas no cavalo azarão porque gostou do nome dele. Ele ainda está correndo. Pague 70 para a banca.",
      false,
    ],
    [
      "${jogadorPrincipal}, você estragou a surpresa da festa de ${jogadorCoadjuvante} e teve que pagar o bolo para compensar o climão. Pague 60 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, sua tentativa de fazer cerveja artesanal em casa resultou em garrafas explodindo e uma cozinha imunda. Pague 120 pela limpeza.",
      false,
    ],
    [
      "${jogadorPrincipal}, você esqueceu de pagar o boleto do condomínio e os juros são mais altos que agiotagem. A multa é pesada. Pague 80.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi processado por ${jogadorCoadjuvante} por causa de um comentário tóxico no Facebook em 2016. A internet não esquece. Pague 140 para ${jogadorCoadjuvante} de indenização.",
      true,
    ],
    [
      "${jogadorPrincipal}, você comprou roupas online que vieram do tamanho de roupas de boneca. O frete de devolução é mais caro que o produto. Pague 50.",
      false,
    ],
    [
      "${jogadorPrincipal}, o síndico te multou porque você desceu o lixo de chinelo e pijama, ferindo o 'decoro do edifício'. Pague 30.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou dar um calote no almoço com ${jogadorCoadjuvante} fingindo que esqueceu a carteira, mas ele tinha maquininha. Pague 100 para ${jogadorCoadjuvante} com taxa.",
      true,
    ],
    [
      "${jogadorPrincipal}, você clicou num link suspeito 'VEJA FOTOS DA FESTA' e pegou um vírus que formatou seu PC. O técnico cobrou caro para recuperar os arquivos. Pague 130.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi ao dentista fazer um clareamento para ficar com o sorriso do Firmino, mas seu plano não cobria estética. A conta chegou. Pague 180.",
      false,
    ],
    [
      "${jogadorPrincipal}, você derramou café no teclado do notebook da empresa. O TI disse que foi 'mau uso' e descontou do seu salário. Pague 150.",
      false,
    ],
    [
      "${jogadorPrincipal}, você perdeu a chave do carro na praia. O chaveiro cobrou taxa de emergência e taxa de 'cara de turista'. Pague 200.",
      false,
    ],
    [
      "${jogadorPrincipal}, você pediu comida por app e dormiu antes do motoboy chegar. Ele foi embora com seu lanche e o dinheiro não foi estornado. Pague 60.",
      false,
    ],
    [
      "${jogadorPrincipal}, você quebrou a porcelana favorita da mãe de ${jogadorCoadjuvante}. Ele está chorando, a mãe dele está gritando. Pague 110 para ${jogadorCoadjuvante} tentar acalmar a fera.",
      true,
    ],
    [
      "${jogadorPrincipal}, você foi multado por jogar lixo na rua. A cidadania custa caro. Pague 40.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou consertar o telhado e caiu. O telhado quebrou mais e você precisou de remédios. Pague 120.",
      false,
    ],
    [
      "${jogadorPrincipal}, você assinou um contrato sem ler e descobriu que comprou um tempo compartilhado num hotel falido em Caldas Novas. A multa de cancelamento é absurda. Pague 200.",
      false,
    ],

    // --- 50 CARTAS VARIADAS DE AZAR (PRISÃO, MOVIMENTO, PERDA DE TURNO) ---
    [
      "${jogadorPrincipal}, você foi cancelado no Twitter por uma piada de 2012. A multidão virtual exige sua cabeça. Vá direto para a Prisão (ou 'Detox Digital') até a poeira baixar.",
      false,
    ],
    [
      "${jogadorPrincipal}, você teve um Burnout corporativo após receber 50 e-mails marcados como 'URGENTE' numa sexta à noite. O médico recomendou repouso absoluto. Perca os próximos 2 turnos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você entrou no ônibus errado e foi parar no final da linha, num bairro que você nem sabia que existia. Recue até o Início (ou ponto de partida mais longe).",
      false,
    ],
    [
      "${jogadorPrincipal}, uma infestação de cupins cometeu suicídio coletivo nas vigas das suas propriedades. A dedetização é obrigatória. Pague 40 por cada casa e 100 por cada hotel.",
      false,
    ],
    [
      "${jogadorPrincipal}, você brigou com ${jogadorCoadjuvante} sobre política na ceia de Natal. O clima ficou insustentável. Recue 3 casas e fique de cara feia.",
      true,
    ],
    [
      "${jogadorPrincipal}, você foi pego tentando usar carteirinha de estudante falsa no cinema, mesmo tendo barba branca e calvície. A vergonha foi tanta que chamaram a polícia. Vá para a Prisão.",
      false,
    ],
    [
      "${jogadorPrincipal}, a internet caiu no meio da partida ranqueada e você foi banido por abandono. Perca a sua próxima jogada enquanto reinicia o modem.",
      false,
    ],
    [
      "${jogadorPrincipal}, você esqueceu o ferro de passar ligado em casa. O pânico tomou conta. Volte imediatamente para a casa onde você estava no início da rodada (ou recue 6 casas).",
      false,
    ],
    [
      "${jogadorPrincipal}, tempestade tropical! Uma goteira destruiu o gesso dos seus imóveis. O seguro alegou 'ato de Deus' e não cobriu. Pague 30 por cada casa que possui.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou stalkear ${jogadorCoadjuvante} no Instagram e curtiu uma foto de 2013 sem querer. A vergonha é imensurável. Recue 4 casas para se esconder.",
      true,
    ],
    [
      "${jogadorPrincipal}, greve de ônibus! Você teve que ir trabalhar a pé e chegou suado e cansado. Perca a próxima jogada recuperando o fôlego.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi confundido com um foragido da polícia porque tem o mesmo nome genérico (tipo José da Silva). Até explicar que focinho de porco não é tomada... Vá para a Prisão.",
      false,
    ],
    [
      "${jogadorPrincipal}, você seguiu o GPS para fugir do trânsito e ele te mandou para uma rua sem saída com um cachorro bravo. Volte 5 casas correndo.",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} te denunciou para a vigilância sanitária por causa do lixo na calçada. Seus inquilinos saíram. Fique 1 rodada sem receber aluguéis.",
      true,
    ],
    [
      "${jogadorPrincipal}, você comeu aquele dogão da esquina com purê, passas e tudo que tinha direito. O resultado gastrointestinal foi desastroso. Corra para o banheiro: Recue 3 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou dar uma de esperto e furar a fila do pedágio, mas tinha câmera. Multa de trânsito e vergonha. Pague 50 e recue 2 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você perdeu o horário de verão (que nem existe mais) e chegou atrasado no compromisso. Perca a vez na próxima rodada por confusão mental.",
      false,
    ],
    [
      "${jogadorPrincipal}, o síndico decretou taxa extra para pintar o prédio de uma cor horrível. Você votou contra, mas perdeu. Pague 25 por cada casa que possui.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego colando na prova (ou no relatório da firma). A punição é severa. Vá direto para a Prisão sem passar pelo Início.",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} jogou uma praga rogada de madrinha em você. O azar grudou. Recue até a casa onde ${jogadorCoadjuvante} está e peça desculpas.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu carro quebrou no meio da avenida na hora do rush. Você virou o inimigo número 1 do trânsito. Perca o turno esperando o guincho.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi fazer trilha sem preparo físico e travou a coluna no meio do mato. O resgate demorou. Perca 2 turnos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você esqueceu a senha do cartão no caixa do mercado com uma fila enorme atrás. A pressão psicológica te fez desistir da compra. Volte 4 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou subornar o guarda com uma nota de 2 reais e uma bala de menta. Ele se sentiu ofendido. Vá para a Prisão por desacato e pão-durice.",
      false,
    ],
    [
      "${jogadorPrincipal}, você e ${jogadorCoadjuvante} foram expulsos do shopping por fazerem guerra de comida na praça de alimentação. Que maturidade, hein? Recuem 3 casas cada um.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu passaporte estava vencido bem na hora do embarque. A viagem dos sonhos virou pesadelo. Volte para o Aeroporto/Estação anterior.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego dirigindo na faixa exclusiva de ônibus para ganhar tempo. O guarda estava lá. Pague 60 e recue 3 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, crise no mercado imobiliário! Uma cracolândia se instalou na frente dos seus imóveis. Desvalorização total. Pague 50 por cada casa.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou dar um 'chapéu' em ${jogadorCoadjuvante} nos negócios, mas ele percebeu e te bloqueou. Recue 5 casas pela falha na negociação.",
      true,
    ],
    [
      "${jogadorPrincipal}, ressaca moral e física após a festa da firma. Você não consegue levantar da cama. Perca a próxima jogada.",
      false,
    ],
    [
      "${jogadorPrincipal}, você entrou na contramão numa rua movimentada e causou o caos. Volte até a propriedade mais próxima e estacione.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego sonegando imposto no jogo. O auditor fiscal confiscou seus dados. Vá para a Prisão.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tropeçou no tapete da sala e derrubou a TV. O prejuízo emocional é maior que o físico. Recue 2 casas chorando.",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} espalhou uma fofoca sobre você no bairro. Sua reputação caiu. Recue 4 casas até que esqueçam o escândalo.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu vizinho começou uma obra infinita com marreta pneumática. O barulho te impede de pensar e negociar. Fique 1 turno sem jogar.",
      false,
    ],
    [
      "${jogadorPrincipal}, enchente relâmpago! Seu carro virou submarino. O seguro não cobre danos por água doce. Pague 100 de conserto e perca a vez na próxima rodada.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego pichando 'Abaixo o Capitalismo' no muro do banco. A ironia é que você foi preso pelo sistema que critica. Vá para a Prisão.",
      false,
    ],
    [
      "${jogadorPrincipal}, você esqueceu de renovar o domínio do seu site e um concorrente comprou. Volte 10 casas para refazer o branding.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou passar a perna em ${jogadorCoadjuvante}, mas ele gravou a conversa. Chantagem emocional! Recue até a casa dele e pague um café (metaforicamente).",
      true,
    ],
    [
      "${jogadorPrincipal}, apagão no bairro! Você ficou preso no elevador com um vizinho que fala demais. Perca o turno ouvindo histórias chatas.",
      false,
    ],
    [
      "${jogadorPrincipal}, a prefeitura resolveu alargar a rua e desapropriou parte do seu jardim. A indenização foi uma piada. Pague 20 por cada casa que possui.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi ao estádio e seu time foi rebaixado. A torcida organizada invadiu o campo e você teve que fugir. Volte 6 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego usando 'gato' de TV a cabo. A operadora cortou o sinal na final do campeonato. A tristeza te consome. Perca a vez na próxima rodada.",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} te convenceu a ir numa balada 'top', mas era um furada com cerveja quente. Você gastou dinheiro e tempo. Pague 50 e recue 2 casas.",
      true,
    ],
    [
      "${jogadorPrincipal}, você foi barrado na porta do clube porque estava de chinelo. Volte para casa para trocar de roupa (Recue ao Início).",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou fazer uma manobra radical de skate para impressionar e quebrou o braço. O gesso atrapalha jogar os dados. Perca 2 turnos.",
      false,
    ],
    [
      "${jogadorPrincipal}, o síndico proibiu Airbnb no prédio. Seus investimentos de aluguel curto prazo faliram. Fique 2 rodadas sem receber renda.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego roubando wi-fi do aeroporto para baixar filmes piratas. A segurança te expulsou. Volte para a propriedade anterior.",
      false,
    ],
    [
      "${jogadorPrincipal}, maré de azar cósmica! Mercúrio retrógrado destruiu sua vida. Recue até a casa de Azar mais próxima (sim, você vai tirar outra carta de azar).",
      false,
    ],
    [
      "${jogadorPrincipal}, o jogo cansou da sua incompetência administrativa. Vá direto para a Prisão e reflita sobre seus erros.",
      false,
    ],
    // --- PREJUÍZOS FINANCEIROS / DÍVIDAS (CONTINUAÇÃO) ---
    [
      "${jogadorPrincipal}, você caiu no golpe do 'Gerente do Banco' te ligando para confirmar uma compra suspeita. Você passou a senha, o token e ainda agradeceu. O golpe tá aí, cai quem quer. Pague 200 pela ingenuidade.",
      false,
    ],
    [
      "${jogadorPrincipal}, você pegou o carro de ${jogadorCoadjuvante} emprestado para impressionar num encontro e rhou a roda de liga leve no meio-fio. O barulho foi feio, o prejuízo também. Pague 120 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você esqueceu de declarar no Imposto de Renda os 20 centavos de rendimento da poupança. A Receita Federal te tratou como um grande sonegador internacional. Pague 150 de multa e juros.",
      false,
    ],
    [
      "${jogadorPrincipal}, você contratou um serviço de 'limpeza espiritual' para sua casa, mas o xamã disse que sua aura é tão carregada que cobrou taxa de insalubridade. Pague 100.",
      false,
    ],
    [
      "${jogadorPrincipal}, você apostou com ${jogadorCoadjuvante} que seu time viraria o jogo nos acréscimos. Tomaram mais um gol. A soberba precede a queda (e a dívida). Pague 80 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você tentou economizar cortando o próprio cabelo com tutorial do TikTok. Ficou parecendo que foi atacado por uma roçadeira. Pague 90 no salão para tentar consertar o estrago.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi taxado na importação daquele eletrônico xing-ling que custou 10 dólares. A taxa saiu mais cara que o produto e o frete juntos. Bem-vindo ao sistema tributário. Pague 60.",
      false,
    ],
    [
      "${jogadorPrincipal}, você derramou molho de tomate na camisa branca de linho de ${jogadorCoadjuvante} durante o almoço da firma. Não sai nem com reza braba. Pague 110 para ${jogadorCoadjuvante} comprar outra.",
      true,
    ],
    [
      "${jogadorPrincipal}, seu cartão de crédito foi clonado e usaram para comprar 500 reais em skin de jogo online. O banco disse que a senha foi usada e não vai estornar. Aceite a derrota. Pague 150 (simbólico).",
      false,
    ],
    [
      "${jogadorPrincipal}, você comprou um 'robô de investimentos' que prometia lucro automático enquanto você dorme. O robô era burro e perdeu tudo enquanto você dormia. Pague 130.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi fiador de um primo que abriu uma paleteria mexicana em 2024 (atrasadíssimo). Ele faliu em uma semana. A dívida sobrou para você. Pague 180.",
      false,
    ],
    [
      "${jogadorPrincipal}, você jogou o controle do videogame na parede num momento de fúria (rage quit) na casa de ${jogadorCoadjuvante}. A parede está bem, o controle não. Pague 140 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você esqueceu a torneira aberta enquanto faltava água. A água voltou quando você não estava. Sua casa virou uma piscina olímpica indoor. Pague 200 pelos danos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou fazer uma dieta de sucos detox caríssimos e durou 6 horas. Jogou tudo fora e pediu pizza. Pague 100 pelo desperdício.",
      false,
    ],
    [
      "${jogadorPrincipal}, você vendeu um celular velho para ${jogadorCoadjuvante} jurando que a bateria durava o dia todo. Durou 15 minutos. Ele exigiu o dinheiro de volta com multa. Devolva 150 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você foi multado pelo condomínio por andar pelado pela casa com a cortina aberta. O vizinho da frente tinha um binóculo. Pague 120 por atentado ao pudor.",
      false,
    ],
    [
      "${jogadorPrincipal}, seu 'Pet Influencer' mordeu uma criança no parque. O engajamento caiu e o processo subiu. Pague 160 de indenização.",
      false,
    ],
    [
      "${jogadorPrincipal}, você convidou ${jogadorCoadjuvante} para jantar e disse 'eu pago'. A conta veio astronômica porque ele pediu o vinho mais caro. Promessa é dívida. Pague 200 (na forma de prejuízo).",
      true,
    ],
    [
      "${jogadorPrincipal}, você tentou consertar o vazamento do vaso sanitário e quebrou a porcelana. Agora você não tem banheiro e tem uma inundação. Chame o encanador urgente e pague 140.",
      false,
    ],
    [
      "${jogadorPrincipal}, você esqueceu de cancelar o período de teste gratuito do LinkedIn Premium, do YouTube Premium e do Tinder Gold. Tudo caiu na fatura hoje. Pague 110.",
      false,
    ],
    [
      "${jogadorPrincipal}, você pegou carona com ${jogadorCoadjuvante} e vomitou no banco de trás dele após uma curva brusca. A higienização interna é por sua conta. Pague 150 para ${jogadorCoadjuvante}.",
      true,
    ],
    [
      "${jogadorPrincipal}, você foi pego usando carteira de estudante falsa no show. O segurança te fez pagar a diferença do ingresso na hora, no preço cheio. Pague 80.",
      false,
    ],
    [
      "${jogadorPrincipal}, seu telhado solar (que você instalou sozinho seguindo tutorial russo) voou na primeira ventania e acertou o carro do vizinho. Pague 180.",
      false,
    ],
    [
      "${jogadorPrincipal}, você indicou um investimento furada para ${jogadorCoadjuvante}. Ele perdeu dinheiro e a amizade ficou abalada. Para selar a paz, pague 100 para ${jogadorCoadjuvante} como compensação.",
      true,
    ],
    [
      "${jogadorPrincipal}, você comprou um pacote de viagens 'surpresa' e a surpresa era que o hotel não tinha teto. O barato sai caro. Pague 150 para mudar de hotel.",
      false,
    ],

    // --- MOVIMENTO / PERDA DE TURNO / SITUAÇÕES VARIADAS (CONTINUAÇÃO) ---
    [
      "${jogadorPrincipal}, você foi cancelado no Twitter por ressuscitar uma piada ruim de 2011. A cultura do cancelamento te pegou. Vá para a Prisão (Detox Digital) e fique lá refletindo.",
      false,
    ],
    [
      "${jogadorPrincipal}, você teve uma crise de ansiedade ao ver o preço da gasolina. O choque foi tanto que você desmaiou. Perca a próxima jogada recuperando os sentidos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou cortar caminho por uma rua que o Waze indicou e caiu numa feira livre em dia de xepa. Ficou preso entre a barraca do peixe e a do pastel. Volte 4 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você brigou com ${jogadorCoadjuvante} por causa de spoiler de série. Ele te expulsou da sala. Recue 3 casas e fique sem falar com ele.",
      true,
    ],
    [
      "${jogadorPrincipal}, sua internet caiu bem na hora de salvar o arquivo final do projeto. Você perdeu tudo e teve um colapso nervoso. Perca 2 turnos refazendo o trabalho.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego tentando entrar no metrô sem pagar pulando a catraca. Caiu de cara no chão e foi detido. Vá direto para a Prisão.",
      false,
    ],
    [
      "${jogadorPrincipal}, você marcou encontro com um 'fake' do Tinder e ficou esperando 3 horas na praça de alimentação. A humilhação consome seu tempo. Perca a vez na próxima rodada.",
      false,
    ],
    [
      "${jogadorPrincipal}, uma infestação de pombos tomou conta da sacada do seu apartamento. O custo de limpeza e telas de proteção é alto. Pague 30 por cada casa que possui.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou dar um susto em ${jogadorCoadjuvante}, mas ele tem reflexo rápido e te deu um soco (sem querer). Você ficou tonto. Recue 2 casas.",
      true,
    ],
    [
      "${jogadorPrincipal}, você esqueceu o dia do rodízio do carro e atravessou a cidade inteira. Multa garantida e pontos na carteira. Pague 130 e recue 2 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, seu vizinho de cima resolveu aprender sapateado e tocar gaita de fole ao mesmo tempo. Você não consegue se concentrar. Fique 1 turno sem jogar.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego na alfândega com muamba demais. O fiscal não gostou da sua atitude. Vá para a Prisão explicar suas compras.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou consertar a fiação do chuveiro e tomou um choque que resetou seu cérebro. Volte para o Início do tabuleiro.",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} descobriu que você usa a conta dele da Netflix sem pagar há 4 anos e mudou a senha. A tristeza te invadiu. Recue 5 casas.",
      true,
    ],
    [
      "${jogadorPrincipal}, você comeu um kibe suspeito na rodoviária. A emergência intestinal é real e imediata. Corra para o banheiro: Perca a vez na próxima rodada.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi parado numa blitz e seu extintor de incêndio estava vencido, o pneu careca e a lanterna queimada. O carro foi apreendido. Volte a pé 6 casas.",
      false,
    ],
    [
      "${jogadorPrincipal}, você apostou corrida com um ônibus para pegar o lugar sentado e perdeu. Ficou sem ar e sem o ônibus. Perca a próxima jogada.",
      false,
    ],
    [
      "${jogadorPrincipal}, tempestade solar afeta os satélites e seu GPS pifa. Você não sabe onde está. Recue para a casa de Azar mais próxima.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi flagrado jogando lixo pela janela do carro. Que feio! A multa moral e financeira é pesada. Pague 50 e vá para a Prisão.",
      false,
    ],
    [
      "${jogadorPrincipal}, ${jogadorCoadjuvante} te convenceu a ir num retiro de silêncio que custava uma fortuna. Você não aguentou 10 minutos e foi expulso. Pague 100 e recue 3 casas.",
      true,
    ],
    [
      "${jogadorPrincipal}, o elevador quebrou e você mora no 20º andar. Você chegou em casa com as pernas tremendo e sem energia para nada. Perca o turno.",
      false,
    ],
    [
      "${jogadorPrincipal}, você foi pego pichando 'Eu amo a morena' no muro da prefeitura. Romântico, mas ilegal. Vá para a Prisão.",
      false,
    ],
    [
      "${jogadorPrincipal}, você tentou fazer uma manobra de drift na rotatória com seu carro 1.0 e subiu no canteiro central. O guincho demorou. Perca 2 turnos.",
      false,
    ],
    [
      "${jogadorPrincipal}, você esqueceu a panela de pressão no fogo. A explosão destruiu o fogão e o teto. A reforma vai custar caro. Pague 40 por cada casa que possui (risco de incêndio).",
      false,
    ],
    [
      "${jogadorPrincipal}, o universo olhou para você e riu. Nada deu certo hoje. Apenas recue 10 casas e aceite seu destino.",
      false,
    ],
  ];

  static getCardRandomly(username: string): {
    mensagemPrivada: string;
    mensagemPublica: string;
  } {
    // 1. Identificar o Jogador Principal
    const nomePrincipal = Memory.getPlayerByUsername(username)?.getUsername();

    // 2. Identificar um Coadjuvante (exclui o próprio jogador da lista)
    const todosJogadores = Memory.getAllPlayerUsernameByArray();
    const possiveisCoadjuvantes = todosJogadores.filter(
      (nome) => nome !== nomePrincipal
    );

    // Se estiver jogando sozinho, o coadjuvante vira "o Banco" para não quebrar o código
    const nomeCoadjuvante =
      possiveisCoadjuvantes.length > 0
        ? possiveisCoadjuvantes[
            Math.floor(Math.random() * possiveisCoadjuvantes.length)
          ]
        : "o Banco";

    // 3. Definir se é Sorte ou Azar (50%)
    const ehSorte = Math.random() < 0.5;

    // 4. Escolher o Deck Único correspondente
    const deck = ehSorte ? Carta.cartaSortePublica : Carta.cartaAzarPublica;

    // 5. Sortear a carta
    const indiceAleatorio = Math.floor(Math.random() * deck.length);
    const dadosCarta = deck[indiceAleatorio];

    // ATENÇÃO: Baseado nos exemplos que criei acima, a estrutura é:
    // [0] = Texto da mensagem
    // [1] = Booleano (se precisa de coadjuvante)
    let mensagemFinal = dadosCarta[0];
    const precisaCoadjuvante = dadosCarta[1];

    // 6. Substituir as variáveis (usando Regex global /g para substituir todas as ocorrências)
    mensagemFinal = mensagemFinal.replace(
      /\$\{jogadorPrincipal\}/g,
      nomePrincipal!
    );

    if (precisaCoadjuvante) {
      mensagemFinal = mensagemFinal.replace(
        /\$\{jogadorCoadjuvante\}/g,
        nomeCoadjuvante
      );
    }

    // 7. Retorno (Como só há uma fonte de texto, a mensagem privada e pública são iguais)
    return {
      mensagemPrivada: mensagemFinal,
      mensagemPublica: mensagemFinal,
    };
  }
}

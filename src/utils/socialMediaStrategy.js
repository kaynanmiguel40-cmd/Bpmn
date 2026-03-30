// ============================================================================
// ESTRATEGIA DE CRESCIMENTO — REDES SOCIAIS FYNESS
// 3 perfis independentes: Robert | Kaynan | Fyness (institucional)
// Publico: Dono de negocio que fatura R$10k+/mes
// Plataformas: Instagram, TikTok, YouTube
// ============================================================================

export const SOCIAL_MEDIA_STRATEGY = {

  // ==========================================================================
  //  PERFIL 1: ROBERT
  //  Papel: Autoridade financeira / Rosto da marca / Closer
  // ==========================================================================
  robert: {
    nome: 'Robert',
    papel: 'Autoridade financeira — e quem o dono de negocio confia pra falar de dinheiro',
    handles: {
      instagram: '@robert_fyness',
      tiktok: '@robert_fyness',
      youtube: 'Robert | Fyness'
    },

    // POR QUE FUNCIONA: Marca pessoal converte mais que marca institucional em B2B
    // pequeno. O Seu Ze nao segue "empresas" — ele segue PESSOAS que ele confia.
    // Estudo da Edelman Trust Barometer: 63% das pessoas confiam mais em
    // "especialistas tecnicos" do que em marcas. No nicho MEI/EPP isso e ainda
    // mais forte porque a decisao de compra e PESSOAL (ele ta gastando o dinheiro
    // DELE, nao de um departamento).
    //
    // Robert funciona como autoridade porque:
    // 1. Fala de dinheiro com propriedade (financeiro da empresa)
    // 2. Usa linguagem do publico (nao e consultor corporativo)
    // 3. Conta historias reais de clientes (storytelling > dados brutos)

    // ---- INSTAGRAM ----
    instagram: {
      objetivo: 'Construir autoridade pessoal + gerar leads quentes via DM',
      // POR QUE: Instagram e onde o dono de negocio PESQUISA antes de comprar.
      // Ele ve o perfil, olha os ultimos 9 posts, le a bio, ve os destaques.
      // Se passar confianca, ele manda DM. Perfil pessoal gera 3-5x mais
      // engajamento que perfil de empresa (dados do Later.com 2024).

      bio: 'Ajudo donos de negocio a pararem de perder dinheiro sem perceber. Co-fundador @fynessbr. Gestao financeira sem enrolacao.',

      conteudo: [
        {
          tipo: 'Reels — Dor do cliente (50% do conteudo)',
          porqueFunciona: 'Reels de "dor" tem o maior alcance organico porque gera identificacao imediata. O dono de negocio ve e pensa "ele ta falando de mim". Isso ativa o gatilho de "eu preciso resolver isso". Dados: conteudo de problema supera conteudo de solucao em alcance 2-3x (fonte: HubSpot State of Marketing 2024).',
          exemplos: [
            'Robert na camera: "Conheco um dono de salao que fatura R$20mil e no fim do mes nao tem R$3mil na conta. Sabe por que? Porque ele nao sabe o custo real de cada servico."',
            'Robert sentado em mesa simples: "Se voce fecha o caixa e o numero nao bate, nao e erro do funcionario. E falta de sistema."',
            'Robert com caderninho na mao: "Isso aqui era o controle financeiro do Seu Carlos. Faturamento de R$30mil. Controle: zero."'
          ],
          frequencia: '3-4 Reels/semana'
        },
        {
          tipo: 'Carrosseis — Educativo pratico (30% do conteudo)',
          porqueFunciona: 'Carrosseis tem a maior taxa de SALVAMENTO no Instagram (dados do Socialinsider 2024). Salvamento e o sinal mais forte pro algoritmo — mais que curtida e comentario. Quando o dono de negocio salva um carrossel "Como calcular seu lucro real", ele volta depois E o Instagram mostra mais conteudo do Robert pra ele.',
          exemplos: [
            '7 slides: "Como saber se seu negocio da lucro ou prejuizo (metodo do guardanapo)"',
            '5 slides: "3 numeros que todo dono de negocio TEM que olhar todo dia"',
            '6 slides: "Seu preco esta errado se voce nao fez essa conta"'
          ],
          frequencia: '2 carrosseis/semana'
        },
        {
          tipo: 'Stories — Bastidor + Prova social (diario)',
          porqueFunciona: 'Stories sao pra QUEM JA SEGUE. Servem pra manter o relacionamento quente. O dono de negocio ve Robert no dia a dia, visitando cliente, mostrando resultado, e pensa "esse cara e real, nao e guru de internet". Stories com enquete tem 2x mais interacao (dados do Instagram).',
          exemplos: [
            'Enquete: "Voce sabe seu lucro REAL do mes passado? SIM / NAO TENHO CERTEZA"',
            'Print de WhatsApp (com permissao): cliente agradecendo',
            'Robert no cliente: "Hoje visitei a padaria do Seu Marcos. Olha o que ele descobriu..."'
          ],
          frequencia: '3-5 stories/dia'
        }
      ],

      crescimento: [
        {
          tatica: 'Comentar em perfis de Sebrae, associacoes comerciais, CDLs locais',
          porqueFunciona: 'Comentario relevante em post grande te expoe pra audiencia QUALIFICADA de graca. Um comentario bom num post do Sebrae com 50k views pode trazer 50-200 visitas pro perfil. E quem segue Sebrae E dono de negocio = lead perfeito.',
          frequencia: '10-15 comentarios/dia (primeiros 3 meses)'
        },
        {
          tatica: 'Collabs com contadores que atendem pequeno negocio',
          porqueFunciona: 'Contador e a pessoa que o Seu Ze MAIS confia depois da esposa. Se o contador do cara indica/aparece com Robert, a confianca transfere automaticamente. Marketing de influencia no micro-nicho e mais eficaz que ads (CAC menor, confianca maior).',
          frequencia: '1-2x/mes'
        },
        {
          tatica: 'DM pra quem comenta ou responde enquete',
          porqueFunciona: 'Quem interage com seu conteudo JA esta interessado. Responder DM em ate 2h converte 3x mais que responder no dia seguinte (dado do Drift/Salesloft). O fluxo e: comentou → DM agradecendo → pergunta sobre o negocio → oferece teste gratis. Sem ser invasivo.',
          fluxo: 'Interacao → DM em ate 2h → Pergunta consultiva → Teste gratis'
        }
      ],

      metas: [
        { periodo: 'Mes 1-3', seguidores: '0 → 1.000', kpi: '5-10 DMs/semana' },
        { periodo: 'Mes 4-6', seguidores: '1.000 → 3.000', kpi: '15-25 DMs/semana' },
        { periodo: 'Mes 7-12', seguidores: '3.000 → 10.000', kpi: '30+ DMs/semana, CAC organico < R$100' }
      ]
    },

    // ---- TIKTOK ----
    tiktok: {
      objetivo: 'Alcance massivo — viralizar pra atingir donos de negocio que NAO estao procurando solucao (topo de funil)',
      // POR QUE TIKTOK PRA ROBERT:
      // TikTok distribui por INTERESSE, nao por seguidores. Um video com 0
      // seguidores pode ter 500k views se o hook for bom. Isso e impossivel
      // no Instagram. Pro Robert, TikTok e o MEGAFONE — alcance bruto.
      //
      // 35% dos usuarios do TikTok no Brasil tem 25-44 anos (DataReportal 2024).
      // Dono de negocio pequeno consome TikTok a noite depois de fechar a loja.
      // Ele nao esta "procurando sistema de gestao" — mas quando ve um video
      // que descreve EXATAMENTE a dor dele, ele para, assiste, e segue.

      conteudo: [
        {
          tipo: 'Hook + Historia (formato principal — 70% do conteudo)',
          porqueFunciona: 'Storytelling e o formato mais poderoso do TikTok. Videos narrativos tem 2x mais watch time que videos educativos puros (dado interno do TikTok Creator Portal). Robert contando a historia real de um cliente prende porque: 1) ativa curiosidade ("o que aconteceu?"), 2) gera identificacao ("isso acontece comigo"), 3) entrega resolucao emocional.',
          estrutura: [
            '0-2s: HOOK (texto grande na tela + Robert falando) — decide se a pessoa fica ou sai',
            '2-15s: O PROBLEMA (a dor do cara, com detalhes reais)',
            '15-40s: O QUE ACONTECEU (a descoberta, a virada)',
            '40-60s: RESULTADO + reflexao'
          ],
          exemplosDeHook: [
            '"Esse cara tem uma padaria que fatura R$30mil por mes. Lucro? R$600."',
            '"Dono de restaurante descobriu que pagava R$4mil/mes de desperdicio. Olha o que fez."',
            '"Se voce fatura R$10, 20, 30mil por mes e nao sabe quanto sobra — presta atencao."'
          ]
        },
        {
          tipo: 'Numero chocante (20% do conteudo)',
          porqueFunciona: 'Numeros especificos interrompem o scroll. O cerebro processa numeros antes de texto (estudo do Nielsen Norman Group). "R$14.000" e mais impactante que "muito dinheiro". Funciona porque o dono de negocio PENSA em numeros o dia todo — faturamento, custo, troco.',
          exemplos: [
            '"R$2.400. Isso e quanto um dono de salao perdeu EM UM MES sem saber."',
            '"67% dos negocios que fecham nao sabiam que tavam no prejuizo."',
            '"R$197 por mes. Isso e menos que 1 dia de faturamento do Seu Carlos. E ele quase faliu."'
          ]
        },
        {
          tipo: 'React/Dueto (10% do conteudo)',
          porqueFunciona: 'Duetos pegam carona no alcance do video original. Se Robert dueta um video viral sobre empreendedorismo e adiciona perspectiva real, ele alcanca a audiencia do video original SEM precisar da propria base. Funciona especialmente bem com videos de "guru" que dao conselhos genericos — Robert desconstroi com realidade.',
          exemplos: [
            'Dueto de video "como ficar rico com MEI": "Na vida real, 80% dos MEIs nem sabem se dao lucro ou prejuizo..."',
            'React a "empreendedor de sucesso": "Bonito no slide. Na pratica, o cara controla vendas no caderninho..."'
          ]
        }
      ],

      hooks: {
        regra: 'Os primeiros 1.5 segundos decidem TUDO. Taxa de retencao do TikTok despenca em 2s se nao houver hook. SEMPRE texto grande na tela (40% assistem sem som — dado do TikTok).',
        tipos: [
          { tipo: 'PERGUNTA', exemplo: '"Voce sabe quanto seu negocio REALMENTE lucra?"', porqueForte: 'Ativa reflexao. O cara pensa "sera que eu sei?" e continua assistindo.' },
          { tipo: 'NUMERO', exemplo: '"R$2.400 perdidos em um mes."', porqueForte: 'Especificidade gera credibilidade. Numeros redondos parecem inventados.' },
          { tipo: 'PROVOCACAO', exemplo: '"Se voce controla no caderninho, voce ta perdendo dinheiro."', porqueForte: 'Ataca um habito que o cara tem. Gera desconforto = atencao.' },
          { tipo: 'HISTORIA', exemplo: '"Conheco um cara que tem barbearia que fatura R$25mil..."', porqueForte: 'Storytelling loop aberto. O cerebro PRECISA saber o final.' },
          { tipo: 'CONTRAINTUITIVO', exemplo: '"Faturar mais NAO resolve seu problema financeiro."', porqueForte: 'Contradiz crenca comum. Gera curiosidade: "como assim?"' }
        ]
      },

      frequencia: {
        fase1: { periodo: 'Mes 1-2', qtd: '1-2 videos/dia', foco: 'Volume > perfeicao. Grava 5 em 1h, posta 1/dia.' },
        fase2: { periodo: 'Mes 3+', qtd: '1 video/dia', foco: 'Dobrar no formato que performou. Criar series.' }
      },
      // POR QUE VOLUME ALTO: O algoritmo do TikTok testa cada video
      // independentemente. Mais videos = mais testes = mais chances de viralizar.
      // Creators que postam diariamente tem 3x mais chances de ter um video
      // com 100k+ views no primeiro trimestre (TikTok Creator Portal).

      metas: [
        { periodo: 'Mes 1-2', seguidores: '0 → 1.000', kpi: '2-3 videos com 10k+ views' },
        { periodo: 'Mes 3-6', seguidores: '1.000 → 10.000', kpi: '1-2 videos/mes com 50k+ views' },
        { periodo: 'Mes 7-12', seguidores: '10.000 → 50.000+', kpi: 'Leads organicos vindo do TikTok toda semana' }
      ]
    },

    // ---- YOUTUBE ----
    youtube: {
      objetivo: 'Autoridade profunda + SEO de longo prazo (videos rankeando por ANOS)',
      // POR QUE YOUTUBE PRA ROBERT:
      // YouTube e o segundo maior buscador do mundo. Quando o dono de negocio
      // pesquisa "como calcular lucro do meu negocio" no Google, videos do
      // YouTube aparecem na primeira pagina. Esse lead e o MAIS qualificado:
      // ele JA tem o problema e esta ATIVAMENTE buscando solucao.
      //
      // Diferente do TikTok (efemero) e Instagram (feed infinito), um video
      // no YouTube continua trazendo views e leads por 2-3 ANOS. E conteudo
      // evergreen. Investimento de hoje paga dividendos no futuro.

      shorts: {
        descricao: 'Reaproveitamento do TikTok — mesmo video, upload separado',
        porqueFunciona: 'YouTube Shorts tem BUSCA (diferente do TikTok). Titulo e descricao importam pra SEO. O mesmo video que viralizou no TikTok pode ranquear no YouTube pra buscas como "controle financeiro pequeno negocio". Custo incremental: ZERO (ja foi gravado e editado).',
        frequencia: '3-5 Shorts/semana (repost do TikTok com titulo SEO)',
        regra: 'Titulo SEO diferente do TikTok. Ex: "Como saber se seu negocio da lucro | Dica rapida #shorts"'
      },

      longform: {
        descricao: 'Videos de 8-15 minutos — conteudo profundo que converte',
        porqueFunciona: 'Longform no YouTube converte melhor que qualquer outro formato porque: 1) Quem assiste 10min de video JA CONFIA em voce, 2) YouTube favorece watch time longo no algoritmo, 3) Aparece no Google (SEO), 4) Permite explicar o produto sem parecer propaganda.',
        frequencia: '1 video/semana (primeiros 6 meses) → 2/semana depois',

        categorias: [
          {
            nome: 'TUTORIAL PRATICO (40%)',
            porqueFunciona: 'Resolve busca ativa. "Como calcular o preco de venda" tem ~8.000 buscas/mes no Brasil (Ubersuggest). Quem pesquisa isso E dono de negocio E precisa de ajuda = lead perfeito.',
            exemplos: [
              '"Como calcular o preco de venda do seu produto (passo a passo real)"',
              '"Fluxo de caixa simplificado pra dono de padaria/salao/restaurante"',
              '"Como separar a conta PJ da pessoal de uma vez por todas"',
              '"DRE simplificado: descubra se seu negocio deu lucro esse mes"'
            ]
          },
          {
            nome: 'CASO REAL (30%)',
            porqueFunciona: 'Prova social em video e a mais poderosa. O Seu Ze ve um cara IGUAL A ELE contando que resolveu o problema e pensa "se funcionou pra ele, funciona pra mim". Caso real > depoimento escrito > dado estatistico (em persuasao).',
            exemplos: [
              '"Como um dono de padaria descobriu que perdia R$3mil/mes (caso real)"',
              '"Restaurante faturando R$40mil sem saber o lucro — o que fizemos"',
              '"Salao de beleza: do caos financeiro ao lucro previsivel em 60 dias"'
            ]
          },
          {
            nome: 'ERRO COMUM / MITO (30%)',
            porqueFunciona: '"5 erros de..." e um dos formatos com maior CTR no YouTube (dados do vidIQ). Funciona porque: 1) implica que o espectador pode estar cometendo o erro (curiosidade), 2) e facil de consumir (lista), 3) rankeia bem no Google pra buscas "erros + nicho".',
            exemplos: [
              '"5 erros financeiros que estao QUEBRANDO seu negocio"',
              '"Por que faturar mais NAO significa lucrar mais"',
              '"Planilha resolve? Quando sim e quando nao (honesto)"'
            ]
          }
        ],

        seo: {
          porqueImporta: 'YouTube SEO e a maior vantagem competitiva de longo prazo. Ads para de funcionar quando para de pagar. Video ranqueado no YouTube traz lead TODO MES por 2-3 anos. E juros compostos de conteudo.',
          titulo: 'Keyword no inicio + curiosidade. Ex: "Fluxo de caixa: como montar o do seu negocio (metodo simples)"',
          descricao: 'Primeiras 2 linhas com keywords (Google indexa). Depois: timestamps + link Fyness com UTM.',
          thumbnail: 'Rosto do Robert com expressao + texto curto (3-4 palavras max) + contraste alto. CTR > 5% = bom. > 8% = otimo.'
        }
      },

      metas: [
        { periodo: 'Mes 1-3', inscritos: '0 → 300', kpi: '12+ videos longform publicados, base SEO criada' },
        { periodo: 'Mes 4-6', inscritos: '300 → 1.000', kpi: 'Videos aparecendo em buscas do Google' },
        { periodo: 'Mes 7-12', inscritos: '1.000 → 5.000+', kpi: 'Canal gera leads toda semana sem ads' }
      ]
    }
  },

  // ==========================================================================
  //  PERFIL 2: KAYNAN
  //  Papel: Tech/Produto / Proximidade / O cara que constroi
  // ==========================================================================
  kaynan: {
    nome: 'Kaynan',
    papel: 'Tech e produto — mostra o sistema, a construcao, a transparencia',
    handles: {
      instagram: '@kaynan_fyness',
      tiktok: '@kaynan_fyness',
      youtube: 'Kaynan | Fyness'
    },

    // POR QUE FUNCIONA: O Kaynan e o OPOSTO do Robert em posicionamento.
    // Robert e autoridade financeira (top-down: "eu sei, deixa eu te ensinar").
    // Kaynan e proximidade tech (lado a lado: "olha o que eu to construindo PRA VOCE").
    //
    // Isso funciona por 3 razoes:
    // 1. TRANSPARENCIA VENDE: Mostrar o produto sendo construido cria confianca.
    //    O cara ve que e real, que tem gente trabalhando, que nao e golpe.
    //    (Buffer publicou todos os salarios online e cresceu 300% em confianca de marca).
    //
    // 2. BUILD IN PUBLIC: Movimento real no tech. Founders que mostram o processo
    //    criam audiencia fiel ANTES do produto estar perfeito. Pieter Levels
    //    (Nomad List) construiu R$100M mostrando cada feature no Twitter.
    //    Adaptado pro Seu Ze: ele nao liga pra codigo, mas liga pra ver
    //    "esse sistema TEM gente real por tras".
    //
    // 3. IDADE: Kaynan tem 19 anos. Isso e um ASSET, nao liability.
    //    "Moleque de 19 anos construindo sistema que dono de negocio usa"
    //    gera curiosidade e admiracao. Narrativa forte.

    // ---- INSTAGRAM ----
    instagram: {
      objetivo: 'Mostrar o produto + humanizar a marca + gerar curiosidade sobre o sistema',
      // POR QUE: O perfil do Kaynan no Instagram nao e pra vender direto.
      // E pra fazer o cara pensar "esse sistema parece bom, quero ver".
      // Quando o dono de negocio ve o Robert falando de gestao financeira
      // e DEPOIS ve o Kaynan mostrando o sistema funcionando, a confianca
      // multiplica. Sao 2 pontos de contato com a marca.

      bio: 'CTO @fynessbr. 19 anos. Construo o sistema que dono de negocio usa pra parar de perder dinheiro. Dev React + Supabase.',

      conteudo: [
        {
          tipo: 'Reels — Demo rapida do sistema (40% do conteudo)',
          porqueFunciona: 'O Seu Ze NAO vai ler uma landing page inteira. Mas ele PARA pra ver um video de 30s mostrando o sistema funcionando no celular. Demo em video tem 3x mais conversao que screenshot (dado do Wyzowl Video Marketing Report 2024). E o Kaynan mostrando = "o cara que fez ta me mostrando pessoalmente".',
          exemplos: [
            'Tela do celular: "Olha como o Seu Carlos registra uma venda em 10 segundos" (screen recording + narração)',
            'Split screen: "Antes: caderninho. Depois: dashboard Fyness. Mesmo negocio."',
            'Feature nova: "Acabei de lançar isso. Agora voce ve o lucro do dia em tempo real."'
          ],
          frequencia: '2-3 Reels/semana'
        },
        {
          tipo: 'Stories — Build in public (30% do conteudo)',
          porqueFunciona: 'Mostrar o processo cria senso de pertencimento. O seguidor sente que faz parte da construcao. Quando Kaynan posta "Funcionalidade nova: o que voces acham? A ou B?" e o cara vota, ele tem OWNERSHIP sobre o produto. Isso reduz churn e aumenta lealdade (conceito de IKEA Effect — voce valoriza mais o que ajudou a construir).',
          exemplos: [
            'Enquete: "Nova feature: notificacao de venda no WhatsApp. Util? SIM / FODA"',
            'Caixinha: "O que falta no Fyness? Me fala que eu construo"',
            'Bastidor: tela de codigo + "3am corrigindo bug pra voces" (autenticidade)',
            'Antes/depois: interface antiga vs interface nova'
          ],
          frequencia: '3-5 stories/dia'
        },
        {
          tipo: 'Carrosseis — Educativo tech simplificado (20% do conteudo)',
          porqueFunciona: 'Kaynan traduz tech pra linguagem simples. Isso posiciona o Fyness como acessivel. O dono de negocio tem MEDO de tecnologia. Quando vê alguem explicando de forma simples, a barreira cai. NAO e tutorial de programacao — e "como o sistema resolve SEU problema".',
          exemplos: [
            '"5 coisas que o Fyness faz por voce automaticamente (sem voce perceber)"',
            '"Por que o Fyness funciona pelo WhatsApp (e nao por app separado)"',
            '"Como seus dados ficam seguros no Fyness (explicado simples)"'
          ],
          frequencia: '1 carrossel/semana'
        },
        {
          tipo: 'Reels — Bastidor pessoal (10% do conteudo)',
          porqueFunciona: 'O fato do Kaynan ter 19 anos e estar construindo isso e uma HISTORIA. Historias de fundador jovem viralizam porque quebram expectativa. "Moleque de 19 anos fazendo sistema que dono de padaria usa" gera mais engajamento que qualquer post corporativo.',
          exemplos: [
            '"19 anos, co-fundador de uma empresa de tech. Minha rotina real."',
            '"Larguei [contexto] pra construir o Fyness. Vale a pena?"',
            'Dia a dia real: coding, reuniao com cliente, visita a estabelecimento'
          ],
          frequencia: '1 Reel/semana'
        }
      ],

      crescimento: [
        {
          tatica: 'Cross-promo com Robert: Robert menciona "@kaynan_fyness construiu isso"',
          porqueFunciona: 'Transfer de audiencia entre perfis do mesmo time e a forma mais rapida de crescer. A audiencia do Robert JA confia na marca. Quando Robert diz "o Kaynan construiu esse sistema", o follow e quase automatico.'
        },
        {
          tatica: 'Responder TODA duvida tecnica nos comentarios do Robert/Fyness',
          porqueFunciona: 'Quando alguem pergunta "mas funciona no celular?" no post do Robert e o KAYNAN responde, mostra que o TIME esta ativo e acessivel. Isso e raro em SaaS e gera confianca desproporcional.'
        },
        {
          tatica: 'Posts de feature request atendida: "Fulano pediu X. Pronto, lancei."',
          porqueFunciona: 'Mostra que a empresa ESCUTA. No SaaS, o medo do cliente e: "vou assinar e ninguem vai me ouvir". Quando ve que o fundador implementa pedido de cliente, esse medo morre.'
        }
      ],

      metas: [
        { periodo: 'Mes 1-3', seguidores: '0 → 500', kpi: 'Audiencia tech-curious seguindo' },
        { periodo: 'Mes 4-6', seguidores: '500 → 2.000', kpi: 'DMs de curiosidade sobre o sistema' },
        { periodo: 'Mes 7-12', seguidores: '2.000 → 5.000', kpi: 'Perfil redireciona pro teste gratis organicamente' }
      ]
    },

    // ---- TIKTOK ----
    tiktok: {
      objetivo: 'Viralizar com narrativa "jovem fundador" + demos virais do produto',
      // POR QUE TIKTOK PRA KAYNAN:
      // TikTok ADORA narrativas de fundador jovem. "19 anos construindo tech"
      // e um formato que viraliza naturalmente porque quebra expectativa.
      // O algoritmo favorece conteudo que gera CURIOSIDADE + WATCH TIME.
      // Demo de produto em formato "satisfying" (antes/depois, transformacao)
      // tambem performa muito bem.

      conteudo: [
        {
          tipo: 'POV / Narrativa fundador (50% do conteudo)',
          porqueFunciona: 'O formato POV e um dos mais populares do TikTok porque coloca o espectador DENTRO da situacao. "POV: voce tem 19 anos e constroi sistema pra dono de padaria" gera identificacao (jovens) e admiracao (mais velhos). Esse formato tem alta taxa de comentario, que e o sinal mais forte pro algoritmo do TikTok.',
          exemplos: [
            '"POV: voce tem 19 anos e o dono de um restaurante te liga pra agradecer"',
            '"Me pediram pra mostrar meu setup. Aqui e onde o Fyness e construido."',
            '"Reacao do cliente quando mostrei a feature que ele pediu funcionando"',
            '"19 anos. Co-fundador. Essa e minha rotina real." (day in the life)'
          ]
        },
        {
          tipo: 'Demo satisfying (30% do conteudo)',
          porqueFunciona: 'Videos de "transformacao" (antes/depois) e "satisfying" (algo funcionando perfeitamente) sao dos mais compartilhados no TikTok. Uma demo de "caderninho bagunçado → dashboard limpo" e visualmente satisfying E mostra o produto. Dois coelhos.',
          exemplos: [
            'Transicao: caderninho → tela do Fyness com tudo organizado',
            'Time-lapse: registrando 10 vendas em 30 segundos pelo celular',
            'Screen recording acelerado: "O Fyness organiza suas vendas automaticamente"'
          ]
        },
        {
          tipo: 'Responder comentarios com video (20% do conteudo)',
          porqueFunciona: 'Cada comentario respondido com video e um video NOVO que o TikTok distribui. E conteudo que ja tem CONTEXTO (a pergunta) e ENGAJAMENTO (quem comentou volta pra ver a resposta). Loop de crescimento gratuito.',
          exemplos: [
            'Comentario: "mas funciona pra barbearia?" → Video mostrando uso em barbearia',
            'Comentario: "voce tem 19 anos mesmo?" → Video mostrando a historia',
            'Comentario: "quanto custa?" → Video explicando o valor (R$197 = menos que 1 dia de faturamento)'
          ]
        }
      ],

      frequencia: {
        fase1: { periodo: 'Mes 1-2', qtd: '1 video/dia', foco: 'Testar o que viraliza — narrativa pessoal vs demo vs POV' },
        fase2: { periodo: 'Mes 3+', qtd: '1 video/dia', foco: 'Dobrar no formato vencedor + series' }
      },

      metas: [
        { periodo: 'Mes 1-3', seguidores: '0 → 2.000', kpi: '1+ video com 50k views (narrativa fundador viraliza)' },
        { periodo: 'Mes 4-6', seguidores: '2.000 → 10.000', kpi: 'Audiencia engajada que conhece o Fyness' },
        { periodo: 'Mes 7-12', seguidores: '10.000 → 30.000+', kpi: 'Link na bio gerando trials toda semana' }
      ]
    },

    // ---- YOUTUBE ----
    youtube: {
      objetivo: 'Demos longas + conteudo "build in public" + tutoriais do sistema',
      // POR QUE YOUTUBE PRA KAYNAN:
      // No YouTube, Kaynan faz o que Robert NAO pode: mostrar o sistema por dentro.
      // Demo de produto no YouTube ranqueia pra buscas como "fyness como funciona",
      // "sistema de gestao financeira", etc. Quem assiste demo de 10min esta
      // PRONTO pra comprar. E o conteudo mais fundo-de-funil que existe.

      shorts: {
        descricao: 'Repost do TikTok com titulo SEO',
        frequencia: '3-5/semana',
        porqueFunciona: 'Custo zero (ja existe). YouTube Shorts tem busca — titulo otimizado rankeia.'
      },

      longform: {
        descricao: 'Tours do sistema, tutoriais de uso, build in public',
        frequencia: '1 video a cada 2 semanas (Kaynan tem que codar tambem)',
        // POR QUE MENOS FREQUENCIA: Kaynan e CTO. O tempo dele e mais valioso
        // codando do que gravando. Longform do Kaynan e COMPLEMENTAR ao do Robert.
        // Robert faz o grosso do conteudo YouTube. Kaynan entra quando o assunto
        // e produto/tech/demo.

        categorias: [
          {
            nome: 'TOUR DO PRODUTO',
            porqueFunciona: 'Quem pesquisa "fyness" ou "sistema de gestao financeira pequeno negocio" quer VER o produto. Video de tour responde todas as duvidas de uma vez. Substitui 10 perguntas no WhatsApp.',
            exemplos: [
              '"Tour completo pelo Fyness — tudo que voce controla pelo celular"',
              '"Como configurar o Fyness pra sua padaria (passo a passo)"',
              '"Update mensal: tudo que lancamos no Fyness esse mes"'
            ]
          },
          {
            nome: 'BUILD IN PUBLIC',
            porqueFunciona: 'Formato que cria audiencia fiel. Quando Kaynan mostra "essa semana construi X porque cliente Y pediu", transmite: 1) o produto evolui rapido, 2) a empresa escuta, 3) tem gente real trabalhando. Isso e o oposto do SaaS anonimo que ninguem sabe quem esta por tras.',
            exemplos: [
              '"O que construi essa semana no Fyness (dev log #1)"',
              '"Um cliente pediu isso. Construi em 3 dias. Olha o resultado."',
              '"Os bastidores de uma startup de 2 pessoas (realidade)"'
            ]
          }
        ]
      },

      metas: [
        { periodo: 'Mes 1-6', inscritos: '0 → 300', kpi: 'Videos de tour rankeando pra "fyness"' },
        { periodo: 'Mes 7-12', inscritos: '300 → 1.500', kpi: 'Canal complementa o do Robert em buscas tech' }
      ]
    }
  },

  // ==========================================================================
  //  PERFIL 3: FYNESS (Institucional)
  //  Papel: Vitrine da marca / Prova social / SEO
  // ==========================================================================
  fyness: {
    nome: 'Fyness',
    papel: 'Perfil institucional — vitrine, prova social, ponto de referencia',
    handles: {
      instagram: '@fynessbr',
      tiktok: '@fynessbr',
      youtube: '@fynessbr'
    },

    // POR QUE PERFIL INSTITUCIONAL SEPARADO:
    //
    // 1. CREDIBILIDADE: Quando o Seu Ze pesquisa "Fyness" depois de ver o Robert
    //    ou Kaynan, ele precisa encontrar um perfil PROFISSIONAL da empresa.
    //    Se so existem perfis pessoais, parece amador. O perfil institucional
    //    e a "sede virtual" da marca.
    //
    // 2. PROVA SOCIAL CONSOLIDADA: Depoimentos, cases, resultados — tudo
    //    concentrado num lugar. O Seu Ze mostra pro socio/esposa: "olha essa empresa".
    //
    // 3. SEO SOCIAL: Quando alguem pesquisa "fyness" no Instagram, o @fynessbr
    //    tem que aparecer primeiro, com bio clara e destaques organizados.
    //    E o ponto de CONVERSAO final antes do cara clicar no link.
    //
    // 4. SEPARACAO DE PAPEIS: Perfil pessoal = personalidade + opiniao.
    //    Perfil institucional = fatos + resultados + produto. Misturar
    //    dilui os dois.

    // ---- INSTAGRAM (principal canal institucional) ----
    instagram: {
      objetivo: 'Vitrine profissional + Prova social + Conversao',
      // POR QUE INSTAGRAM E O PRINCIPAL PRO INSTITUCIONAL:
      // O cara viu o Robert no TikTok → foi pro Instagram pesquisar →
      // achou @fynessbr → viu depoimentos e posts profissionais →
      // clicou no link → trial. O Instagram institucional e o MEIO
      // do funil. Nao precisa viralizar — precisa CONVERTER quem ja chegou.

      bio: 'Gestao financeira pra quem tem negocio de verdade. Vendas, estoque e fluxo de caixa no seu celular. Teste gratis 7 dias ↓',

      destaques: [
        'COMO FUNCIONA — 5 stories: walkthrough rapido do sistema',
        'RESULTADOS — prints e depoimentos de clientes reais',
        'PRECOS — transparente: R$197/mes ou R$137/mes anual',
        'FAQ — "Funciona no celular?", "Precisa de internet?", "E dificil?"',
        'EQUIPE — Robert, Kaynan, Kaua (rostos reais, nao stock)'
      ],

      conteudo: [
        {
          tipo: 'Prova social (40% do conteudo)',
          porqueFunciona: 'Prova social e o fator #1 de decisao de compra pra pequeno negocio (pesquisa do BrightLocal 2024: 87% dos consumidores leem reviews online). No perfil institucional, cada depoimento e um "vendedor 24h". O Seu Ze ve um dono de padaria IGUAL A ELE falando que funciona e pensa "se deu certo pra ele, da pra mim".',
          exemplos: [
            'Carrossel: "O que o Seu Marcos (padaria) descobriu no primeiro mes usando Fyness"',
            'Reel: video curto do cliente falando (celular, informal, real)',
            'Post com print de WhatsApp: "Obrigado, pela primeira vez sei meu lucro real"',
            'Antes/depois: numeros do cliente (anonimizado se preciso)'
          ],
          frequencia: '2-3 posts/semana'
        },
        {
          tipo: 'Produto em acao (30% do conteudo)',
          porqueFunciona: 'O dono de negocio precisa VER o sistema pra acreditar. "Gestao financeira" e abstrato. Um video de 15s mostrando o dashboard com numeros reais e CONCRETO. Conteudo de produto no perfil institucional tem taxa de clique no link 2x maior que conteudo educativo (dado do Sprout Social).',
          exemplos: [
            'Reel: screen recording "Registrando uma venda no Fyness em 10 segundos"',
            'Carrossel: "5 telas do Fyness que todo dono de negocio precisa ver"',
            'Reel: "Essa e a tela que o Seu Carlos olha toda manha (dashboard)"'
          ],
          frequencia: '1-2 posts/semana'
        },
        {
          tipo: 'Institucional / Marca (20% do conteudo)',
          porqueFunciona: 'Posts sobre a missao, a equipe, os valores — isso diferencia de concorrente. O Seu Ze nao compra "software". Ele compra de GENTE que ele confia. Ver a equipe, a historia, o proposito humaniza a marca e reduz a percepcao de risco.',
          exemplos: [
            '"Por que criamos o Fyness" — historia em carrossel',
            'Foto da equipe com roupa Fyness no cliente',
            '"Nossa missao: nenhum dono de negocio deveria fechar sem saber por que"',
            'Marco: "100 clientes usando Fyness. Obrigado."'
          ],
          frequencia: '1 post/semana'
        },
        {
          tipo: 'Educativo leve (10% do conteudo)',
          porqueFunciona: 'Conteudo educativo no perfil institucional funciona como ISCA pra quem ainda nao conhece o produto. Se alguem compartilha um carrossel "3 erros financeiros", quem recebe ve que e do @fynessbr e vai olhar o perfil.',
          exemplos: [
            'Carrossel: "3 sinais de que seu negocio precisa de um sistema de gestao"',
            'Reel: "A diferenca entre faturamento e lucro (em 30 segundos)"'
          ],
          frequencia: '1 post/semana'
        }
      ],

      frequencia: {
        fase1: { periodo: 'Mes 1-2', qtd: '3 posts/semana', foco: 'Montar base de conteudo (destaques, primeiros posts, identidade visual)' },
        fase2: { periodo: 'Mes 3-5', qtd: '4-5 posts/semana', foco: 'Volume de prova social + produto' },
        fase3: { periodo: 'Mes 6+', qtd: '5-7 posts/semana', foco: 'Maquina de conteudo rodando' }
      },
      // POR QUE CRESCIMENTO GRADUAL: Perfil institucional NAO precisa postar
      // diariamente desde o dia 1. O que importa e: quando alguem chegar,
      // o perfil estar COMPLETO e profissional. Nos primeiros 2 meses,
      // priorizar qualidade e completude dos destaques sobre volume.

      crescimento: [
        {
          tatica: 'Robert e Kaynan mencionam @fynessbr em todo conteudo',
          porqueFunciona: 'Todo seguidor dos perfis pessoais e potencial seguidor do institucional. A mencao direciona trafico qualificado. Funciona como funil: conteudo pessoal (topo) → perfil institucional (meio) → link/trial (fundo).'
        },
        {
          tatica: 'Repost de conteudo dos clientes (UGC)',
          porqueFunciona: 'User Generated Content tem 4.5x mais engajamento que conteudo de marca (dados do TINT). Quando o Fyness reposta o story de um cliente, a audiencia do CLIENTE ve. E prova social gratuita.'
        },
        {
          tatica: 'Ads de remarketing nos melhores posts organicos',
          porqueFunciona: 'Impulsionar post que JA performou bem organicamente tem ROI 2-3x maior que criar ad do zero. O algoritmo ja validou que o conteudo e bom. So amplificar.'
        }
      ],

      metas: [
        { periodo: 'Mes 1-3', seguidores: '0 → 500', kpi: 'Perfil completo, destaques prontos, 20+ posts' },
        { periodo: 'Mes 4-6', seguidores: '500 → 2.000', kpi: '10+ cliques/dia no link da bio' },
        { periodo: 'Mes 7-12', seguidores: '2.000 → 8.000', kpi: 'Principal fonte de trials organicos' }
      ]
    },

    // ---- TIKTOK ----
    tiktok: {
      objetivo: 'Repost dos melhores conteudos do Robert e Kaynan + conteudo institucional viral',
      // POR QUE TIKTOK INSTITUCIONAL:
      // No TikTok, o perfil institucional e SECUNDARIO. Os perfis pessoais
      // performam melhor (algoritmo favorece rostos). Mas o @fynessbr serve
      // pra: 1) compilar os melhores videos, 2) postar conteudo que nao
      // encaixa nos pessoais (comparativos, dados, produto puro).

      conteudo: [
        {
          tipo: 'Compilacao de resultados',
          exemplos: [
            '"3 clientes, 3 negocios, 1 problema em comum" (montagem rapida)',
            '"Fyness em 30 segundos — olha o que voce controla pelo celular"'
          ]
        },
        {
          tipo: 'Trends adaptadas pro produto',
          exemplos: [
            'Trend "expectativa vs realidade": faturamento alto vs lucro real',
            'Audio viral + demonstracao do produto'
          ]
        }
      ],

      frequencia: '3-4 videos/semana (repost + originais)',
      prioridade: 'BAIXA comparado com perfis pessoais. Investir energia no Robert e Kaynan primeiro.',

      metas: [
        { periodo: 'Mes 1-6', seguidores: '0 → 2.000', kpi: 'Presenca basica, perfil ativo' },
        { periodo: 'Mes 7-12', seguidores: '2.000 → 10.000', kpi: 'Complementa os perfis pessoais' }
      ]
    },

    // ---- YOUTUBE ----
    youtube: {
      objetivo: 'Hub central de conteudo longform + SEO institucional',
      // POR QUE UM CANAL SO:
      // No YouTube, faz mais sentido ter UM canal da Fyness onde Robert
      // e Kaynan aparecem, do que 3 canais separados. Razao: YouTube
      // recompensa WATCH TIME TOTAL do canal. Dividir em 3 canais
      // fragmenta a audiencia e enfraquece o algoritmo. No Instagram e
      // TikTok, perfis pessoais vencem. No YouTube, marca vence.

      estrategia: 'Canal UNICO da Fyness. Robert e Kaynan aparecem como apresentadores. Playlists separam o conteudo.',
      porqueFunciona: 'YouTube favorece canais com watch time alto. Um canal com 2 videos/semana performa melhor que 3 canais com 1 video a cada 2 semanas. Audiencia se inscreve em UM lugar e consome tudo.',

      playlists: [
        { nome: 'Gestao Financeira pra Iniciante', apresentador: 'Robert', tipo: 'Tutorial educativo' },
        { nome: 'Casos Reais de Clientes', apresentador: 'Robert', tipo: 'Estudo de caso' },
        { nome: 'Tour pelo Fyness', apresentador: 'Kaynan', tipo: 'Demo do produto' },
        { nome: 'Build in Public', apresentador: 'Kaynan', tipo: 'Bastidores tech' },
        { nome: 'Dicas Rapidas', apresentador: 'Ambos', tipo: 'Shorts compilados' }
      ],

      frequencia: {
        shorts: '5-7/semana (repost do TikTok/Reels de ambos)',
        longform: '1-2/semana (Robert 1x + Kaynan 1x a cada 2 semanas)'
      },

      seo: {
        keywordsAlvo: [
          '"gestao financeira pequeno negocio"',
          '"controle financeiro para empreendedor"',
          '"como calcular lucro do meu negocio"',
          '"fluxo de caixa simples"',
          '"como precificar meu produto"',
          '"sistema de gestao financeira"',
          '"controle de estoque restaurante"',
          '"CMV restaurante hamburgueria"'
        ],
        porqueSEO: 'Esses termos tem 5.000-20.000 buscas/mes no Brasil e baixa concorrencia de video. Primeiro canal que dominar essas keywords vira referencia no nicho. Conteudo ranqueia por 2-3 anos.'
      },

      metas: [
        { periodo: 'Mes 1-3', inscritos: '0 → 300', kpi: '15+ videos publicados, base SEO' },
        { periodo: 'Mes 4-6', inscritos: '300 → 1.000', kpi: 'Videos aparecendo no Google' },
        { periodo: 'Mes 7-12', inscritos: '1.000 → 5.000', kpi: 'Canal gera leads organicos semanalmente' }
      ]
    }
  },

  // ==========================================================================
  //  COMO OS 3 PERFIS TRABALHAM JUNTOS
  // ==========================================================================
  integracao: {
    funil: {
      descricao: 'Cada perfil tem um papel no funil. Nao competem — se complementam.',
      fluxo: [
        'TOPO (awareness): TikTok do Robert viraliza → cara descobre que tem problema',
        'MEIO (interesse): Cara segue Robert no IG → ve conteudo educativo → entende a dor',
        'MEIO (consideracao): Cara ve @fynessbr mencionado → vai pro perfil institucional → ve prova social',
        'MEIO (confianca): Cara ve o Kaynan mostrando o sistema → "e real, tem gente por tras"',
        'FUNDO (conversao): Cara clica no link → LP → teste gratis → trial',
        'POS (retencao): Kaynan posta feature nova → cliente ve que o sistema evolui → fica'
      ],
      porqueFunciona: 'Marketing multi-touch: o cliente precisa de 7-13 pontos de contato antes de comprar (dado do Google Zero Moment of Truth). 3 perfis com conteudo diferente = mais pontos de contato sem parecer spam.'
    },

    regras: [
      'Robert NUNCA posta demo do sistema (isso e papel do Kaynan)',
      'Kaynan NUNCA da conselho financeiro (isso e papel do Robert)',
      'Fyness institucional NUNCA tem opiniao pessoal (so fatos, resultados, produto)',
      'Todo conteudo do Robert e Kaynan menciona @fynessbr (direciona pro institucional)',
      'Fyness institucional reposta os MELHORES conteudos dos perfis pessoais',
      'YouTube e canal UNICO (Fyness) — Instagram e TikTok sao perfis SEPARADOS'
    ],

    // DIVISAO DE TEMPO SEMANAL
    tempoSemanal: {
      robert: {
        gravacao: '1-2h/semana (grava 4-5 videos de uma vez)',
        stories: '15min/dia',
        comentarios: '30min/dia (primeiros 3 meses)',
        total: '~6-8h/semana'
      },
      kaynan: {
        gravacao: '30min/semana (demos + 1-2 videos pessoais)',
        stories: '10min/dia',
        total: '~3-4h/semana (prioridade e codar)'
      },
      kaua: {
        edicao: '3-4h/semana (editar tudo, agendar, publicar)',
        thumbnails: '1h/semana',
        total: '~5h/semana'
      },
      totalTime: '~15h/semana pro time todo. Custo: R$0 (organico). ROI cresce com o tempo.'
    },

    // CALENDARIO SEMANAL CONSOLIDADO
    calendario: {
      segunda: {
        robert: 'Grava 3-4 videos curtos (30-60min de gravacao)',
        kaynan: 'Grava 1 demo ou video pessoal se tiver (15-30min)',
        kaua: 'Edita material da semana anterior que restou'
      },
      terca: {
        publicar: 'Robert: TikTok 1 + Reels 1 | Kaynan: TikTok 1 | Fyness: Reels 1 (prova social)',
        kaua: 'Edita e agenda material de segunda'
      },
      quarta: {
        publicar: 'Robert: TikTok 1 + Carrossel IG | Kaynan: Stories build-in-public | Fyness: Post produto',
        extra: 'Robert responde DMs e comentarios (30min)'
      },
      quinta: {
        publicar: 'Robert: TikTok 1 + Reels 1 + YouTube longform | Kaynan: TikTok 1 | Fyness: Reels resultado',
        kaua: 'Edita thumbnail YouTube + Shorts'
      },
      sexta: {
        publicar: 'Robert: TikTok 1 + Stories | Kaynan: Reels demo | Fyness: Post institucional',
        extra: 'Review semanal de metricas (30min — todo o time)'
      },
      sabado: {
        publicar: 'Robert: TikTok trend/react | Kaynan: Stories casual | Fyness: nada ou repost',
        leve: true
      },
      domingo: {
        publicar: 'Opcional: 1 Short cada. Descanso.',
        planejamento: 'Planejar pauta da semana seguinte (30min)'
      }
    }
  },

  // ==========================================================================
  //  POR QUE ESSA ESTRUTURA FUNCIONA (resumo estrategico)
  // ==========================================================================
  porqueFunciona: {
    resumo: [
      {
        principio: 'MARCA PESSOAL > MARCA INSTITUCIONAL (pra vender)',
        explicacao: 'Robert e Kaynan vendem mais que @fynessbr porque pessoas confiam em PESSOAS. O Seu Ze nao compra de "Fyness Ltda" — ele compra do Robert que entende a dor dele. Dados: posts de funcionarios tem 561% mais alcance que posts da empresa (MSLGroup).',
        aplicacao: 'Robert e Kaynan sao os motores de AQUISICAO. Fyness institucional e o motor de CONVERSAO e RETENCAO.'
      },
      {
        principio: 'CADA PLATAFORMA TEM UM PAPEL DIFERENTE',
        explicacao: 'TikTok = viralizar (topo de funil). Instagram = nutrir (meio de funil). YouTube = convencer (fundo de funil + SEO). Postar o mesmo conteudo igual nas 3 plataformas NAO funciona porque o comportamento do usuario e diferente em cada uma.',
        aplicacao: 'Robert no TikTok fala de DOR (viraliza). Robert no IG educa (engaja). Robert no YouTube aprofunda (converte). Mesmo tema, formato diferente.'
      },
      {
        principio: 'ROBERT = AUTORIDADE / KAYNAN = PROXIMIDADE / FYNESS = PROVA',
        explicacao: 'Os 3 perfis cobrem os 3 pilares de decisao de compra: Ethos (credibilidade — Robert), Pathos (conexao emocional — Kaynan mostrando que e real), Logos (evidencia — Fyness com resultados). Aristoteles sabia disso ha 2.400 anos. Ainda funciona.',
        aplicacao: 'Nunca misturar os papeis. Robert nao faz demo. Kaynan nao da conselho financeiro. Fyness nao tem opiniao pessoal.'
      },
      {
        principio: 'VOLUME NO INICIO, OTIMIZACAO DEPOIS',
        explicacao: 'Nos primeiros 3 meses, o objetivo e TESTAR o maximo de formatos possiveis pra descobrir o que ressoa com a audiencia. Nao da pra otimizar o que nao existe. Volume gera dados. Dados geram otimizacao. Otimizacao gera resultado.',
        aplicacao: 'Mes 1-3: postar muito, analisar pouco. Mes 4-6: postar o que funciona, parar o que nao funciona. Mes 7+: maquina otimizada.'
      },
      {
        principio: 'CUSTO QUASE ZERO COM ROI COMPOSTO',
        explicacao: 'Organico nao e gratis (custa tempo), mas o ROI e COMPOSTO. Um video no YouTube de hoje traz leads em 2025. Um Reel que viraliza continua trazendo seguidores por semanas. Ads para de funcionar quando para de pagar. Organico e patrimonio.',
        aplicacao: 'Investir ~15h/semana do time agora. Em 6 meses, o organico deve representar 30-50% dos trials. Em 12 meses, pode ser a principal fonte.'
      }
    ]
  }
};

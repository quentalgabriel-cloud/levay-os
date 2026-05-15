# Briefing: Sistema de Gestão de Compras de Insumos  
  
**Operação: AMP213 (casa de eventos) + Bica (buffet)**  
**Documento de contexto para handoff a agente de IA**  
  
-----  
  
## 1. Sobre este documento  
  
Este é um documento de contexto preparado para ser injetado em um agente de IA dentro de um sistema de gestão em desenvolvimento. O objetivo é dar ao agente o entendimento completo do problema operacional, dos atores envolvidos, do fluxo atual, das dores reais e dos requisitos da solução — para que ele possa propor, executar ou apoiar a construção de um módulo de gestão de compras alinhado ao momento atual do negócio.  
  
A leitura deve ser feita na ordem: contexto do negócio → atores → fluxo atual → diagnóstico → requisitos. Não pule direto para “requisitos”, porque a solução só faz sentido entendendo onde o gargalo realmente está.  
  
-----  
  
## 2. Contexto do negócio  
  
O empreendedor Erick opera duas frentes simultâneas em um mesmo espaço físico — um casarão histórico:  
  
- **AMP213** — casa de eventos. Opera no casarão como um todo, com eventos pontuais (corporativos, sociais, culturais).  
- **Bica** — buffet/operação gastronômica. Ocupa o primeiro andar/segundo piso da casa, com operação contínua.  
  
As duas operações:  
  
- **Rodam simultaneamente** no mesmo endereço físico.  
- **Compartilham colaboradores** em alguns papéis (sobretudo back-office, suprimentos, gestão).  
- **Têm colaboradores específicos** em outros papéis (cozinha do Bica, equipe operacional de eventos do AMP213).  
- **Compartilham, parcialmente, a estrutura de compras de insumos** — que é o objeto deste documento.  
  
Erick está em processo ativo de **descentralizar a operação** e sair do papel de roteador humano de decisões cotidianas. Ele já delegou autonomia formal a colaboradores-chave (com teto de valor e critérios pré-definidos), mas continua sendo puxado para o fluxo operacional porque as ferramentas atuais (basicamente WhatsApp) não suportam delegação efetiva — toda informação passa por ele por construção do canal.  
  
-----  
  
## 3. Atores envolvidos no processo de compras  
  
|Pessoa     |Papel                              |Função no processo                                                                                                                                                        |  
|-----------|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|  
|**Erick**  |Empreendedor / dono                |Hoje é o nó central. Recebe pedidos, aprova, repassa, é acionado para decisões. Quer sair desse papel.                                                                    |  
|**Swedney**|Chefe de cozinha                   |Toda terça monta a lista de insumos da cozinha (frutas, verduras, proteínas, secos, específicos) e envia para Erick.                                                      |  
|**Rafael** |Mixologista                        |Responsável pelos pedidos do bar (bebidas e insumos para drinks), pela produção dos xaropes artesanais da casa, e pelo controle de validade/quantidade dos insumos do bar.|  
|**Lana**   |Gerente operacional da casa        |Recebe a lista da cozinha e executa as compras. Cota fornecedores, busca melhor custo-benefício, fecha pedido.                                                            |  
|**Thaynan**|Assistente / braço-direito do Erick|Apoia Erick na organização, delegação e gestão das tarefas dele. Erick delega bastante para ela. Peça-chave do desafogo.                                                  |  
  
**Observação importante:** Lana e Thaynan já têm autonomia para decidir compras, **dentro de um teto de valor e critérios pré-definidos**. Acima disso, ou em situações fora dos critérios, Erick precisa entrar.  
  
-----  
  
## 4. Fluxo atual (como funciona hoje)  
  
### 4.1. Cozinha (Bica)  
  
1. Toda terça-feira, Swedney monta a lista de insumos da cozinha.  
1. Swedney envia a lista para Erick via WhatsApp (formato livre — texto, áudio, foto manuscrita).  
1. Erick repassa para Lana.  
1. Lana executa: cota fornecedores, decide onde comprar, fecha o pedido.  
1. Decisões fora do escopo dela voltam para Erick.  
  
### 4.2. Bar (cocktails / mixologia)  
  
1. Rafael monta lista de bebidas e insumos para drinks.  
1. Rafael envia para Erick via WhatsApp.  
1. Mesmo fluxo: Erick → Lana (ou direto Rafael, com Erick no meio).  
1. Rafael ainda gerencia em paralelo: produção dos xaropes artesanais, controle de validade dos insumos do bar, quantidades em estoque.  
  
### 4.3. Universo de fornecedores  
  
- **Cozinha:** 6 a 7 fornecedores. Alguns são “fornecedores fixos certeiros” para itens específicos onde não dá pra errar (ex: queijo coalho). Outros entram na lógica de “melhor custo-benefício por compra”.  
- **Bar:** muito mais pulverizado. Distribuidoras grandes (Ambev, Heineken), distribuidoras locais (DLPE), supermercados, marketplaces (Amazon, Mercado Livre) e oportunidades pontuais de bom preço.  
  
### 4.4. Canal único: WhatsApp  
  
Hoje **tudo acontece em WhatsApp**: pedidos, repasses, decisões, cotações, aprovações. Não há ferramenta estruturada de gestão. Não existe histórico consultável de preços, fornecedores, ou compras anteriores. Cada compra é uma decisão tomada “do zero”.  
  
-----  
  
## 5. Diagnóstico — onde realmente está a dor  
  
A dor reportada por Erick é “tudo junto, mas o pior é a sensação de não conseguir sair”. Esse sintoma aponta para uma causa específica:  
  
**O problema não é o processo de compras em si. É que o processo não tem onde viver fora do Erick.**  
  
Mesmo com Lana e Thaynan tendo autonomia formal, o Erick continua sendo o nó central porque:  
  
1. **WhatsApp obriga roteamento humano.** A informação não fica disponível em um lugar — ela vive nas threads do Erick. Para Lana saber o que Swedney pediu, Erick precisa repassar. Para Erick saber o que Lana decidiu, Lana precisa contar. Toda informação passa por ele por construção do canal.  
1. **Sem histórico estruturado, toda compra é uma decisão nova.** Não existe base de “no mês passado compramos esse tomate por X reais com o fornecedor Y”. Então Lana cota do zero toda semana, e quando há dúvida, escala para Erick. Erick decide do zero também.  
1. **Sem visão de estoque, os pedidos são reativos.** Rafael pede “no susto” quando vê acabando. Swedney idem. Não há previsão de consumo nem ponto de reposição definido. Isso aumenta o risco de ruptura (acabar item crítico em meio à operação) e também o de compra emergencial cara.  
1. **A delegação está formalmente feita, mas operacionalmente incompleta.** Critérios e teto existem, mas como não há sistema, a aplicação dos critérios depende de memória/julgamento caso a caso, e na dúvida sempre se escala para Erick — porque é mais seguro perguntar.  
1. **Duas operações (AMP213 e Bica) compartilham insumos e equipe**, mas não há clareza de qual compra serve a qual operação, o que dificulta análise de custo por operação e tomada de decisão sobre fornecedores compartilhados vs. específicos.  
  
**Reformulando:** Erick não precisa de mais controle. Ele precisa de **menos dependência operacional**. A solução tem que tirar o WhatsApp do caminho crítico e dar à Lana, Thaynan, Swedney e Rafael um lugar onde o pedido nasce, anda e morre — com Erick recebendo apenas o que de fato exige a decisão dele.  
  
-----  
  
## 6. Requisitos da solução  
  
A solução deve ser pensada como um **módulo de Gestão de Compras** dentro do sistema de gestão já em desenvolvimento. Os requisitos abaixo estão organizados por camada funcional.  
  
### 6.1. Camada de entrada de pedido (Swedney, Rafael)  
  
- Interface simples e rápida para Swedney e Rafael registrarem o pedido semanal sem precisar de texto livre.  
- Campos estruturados mínimos: **item, quantidade, unidade, urgência, observação, operação atendida (AMP213 / Bica / ambas)**.  
- Capacidade de salvar “listas-modelo” recorrentes (a lista da terça do Swedney é semelhante toda semana — não faz sentido digitar do zero).  
- Integração futura com o controle de estoque (item já cadastrado puxa unidade padrão, fornecedor preferencial, preço médio histórico).  
- Acesso mobile prioritário — Swedney e Rafael estão em operação, não em mesa.  
  
### 6.2. Camada de execução (Lana, Thaynan)  
  
- Vista única dos pedidos abertos da semana, segmentados por operação e por categoria (cozinha / bar / outros).  
- Para cada item: histórico de preço pago, fornecedores anteriores, prazo médio de entrega, última compra. **Isso elimina o “decidir do zero”.**  
- Cadastro de fornecedores com: o que cada um vende, faixa de preço histórica, contato, prazo de entrega, condições de pagamento, observações (ex: “queijo coalho — fornecedor fixo, não substituir”).  
- Capacidade de registrar a compra fechada: fornecedor, valor pago, data, comprovante. Isso alimenta o histórico para a próxima decisão.  
- Capacidade de marcar pedidos como “concluídos” sem precisar avisar ninguém — o status fica visível para quem precisa ver.  
  
### 6.3. Camada de exceção (quando Erick precisa entrar)  
  
- Regras claras e configuráveis para escalonamento automático:  
  - Compra acima do teto de valor.  
  - Fornecedor novo (não cadastrado).  
  - Ruptura iminente de item crítico (queijo coalho, bases de drink, etc).  
  - Item fora dos critérios pré-definidos.  
- Quando uma dessas condições dispara, o sistema notifica Erick **com o contexto já resumido** (o que é, por quê precisa decidir, opções disponíveis, histórico relevante). Sem isso, “notificar Erick” só recria o problema do WhatsApp.  
- Decisão do Erick fica registrada e vira critério/precedente para os próximos casos similares.  
  
### 6.4. Camada de estoque e validade (foco no bar, mas extensível)  
  
- Cadastro dos itens críticos com **mínimo, atual, ponto de reposição**.  
- Para o bar especificamente: controle de **validade** dos insumos (Rafael já faz isso de forma manual hoje).  
- Planejamento da produção dos **xaropes artesanais**: receitas, rendimento, consumo médio, ponto de reposição.  
- Alerta automático quando item crítico atinge o ponto de reposição — vira pedido automaticamente, sem depender de Rafael “ver que está acabando”.  
  
### 6.5. Camada analítica (médio prazo, mas com fundação já no MVP)  
  
- A partir do histórico acumulado, gerar visões de:  
  - Gasto total por período, por operação (AMP213 vs Bica), por categoria, por fornecedor.  
  - Variação de preço por item ao longo do tempo (identificar inflação ou abuso de fornecedor).  
  - Performance de fornecedor (cumpre prazo? preço competitivo? qualidade?).  
  - Itens com maior frequência de ruptura ou compra emergencial (sintoma de planejamento ruim).  
- Essa camada **não precisa estar no MVP**, mas a modelagem de dados desde o dia 1 precisa permitir que ela exista depois sem retrabalho.  
  
-----  
  
## 7. Princípios de design da solução  
  
Ao propor a arquitetura ou as telas, o agente deve respeitar:  
  
1. **Tirar Erick do fluxo, não envolvê-lo melhor.** Toda decisão de design deve perguntar: “isso reduz a dependência operacional do Erick?”. Se não reduz, repensar.  
1. **WhatsApp pode continuar existindo como canal de comunicação humana, mas não pode ser onde o processo vive.** O sistema é a fonte da verdade. WhatsApp é “tô indo comprar”, não “segue lista”.  
1. **Atrito baixo na entrada.** Se Swedney e Rafael acharem o sistema mais chato que mandar áudio, o sistema morre. Velocidade > completude nos pontos de input.  
1. **Histórico é o ativo mais valioso.** O ganho de longo prazo não está em “automatizar pedido” — está em ter base de dados que torne cada decisão de compra 10x melhor que a anterior. Modelagem de dados precisa refletir essa prioridade.  
1. **Diferenciar AMP213 e Bica desde o dia 1.** Mesmo que muita compra seja compartilhada, a possibilidade de segmentar é essencial para análise de custo e para decisões estratégicas futuras sobre cada operação.  
1. **Delegação visível.** O sistema precisa deixar óbvio para todos: o que Lana pode decidir sozinha, o que precisa de Erick, em que estado está cada pedido. Ambiguidade aqui é o que faz a delegação falhar na prática.  
  
-----  
  
## 8. Critérios de sucesso  
  
A solução estará funcionando quando:  
  
- Erick não precisar mais ser acionado para >80% dos pedidos semanais de cozinha e bar.  
- Swedney e Rafael conseguirem registrar a lista da semana em menos de 5 minutos cada.  
- Lana e Thaynan conseguirem fechar uma compra consultando histórico do sistema, sem precisar perguntar nada para Erick.  
- Houver registro estruturado de preço pago para todos os itens recorrentes, permitindo análise de tendência em 60-90 dias.  
- A taxa de ruptura de itens críticos cair (definir baseline atual com Rafael e Lana).  
- Erick conseguir, ao olhar o sistema 1x por semana por 15 minutos, ter visão completa do que aconteceu em compras — sem precisar perguntar.  
  
-----  
  
## 9. O que este documento NÃO define (escopo do agente)  
  
Intencionalmente, este briefing **não prescreve**:  
  
- Stack técnica.  
- Estrutura específica de tabelas/banco.  
- Telas e fluxos de UI.  
- Ordem de implementação ou faseamento detalhado.  
  
Esses pontos devem ser propostos pelo agente, em diálogo com o desenvolvedor, considerando o estado atual do sistema de gestão em construção, as integrações já existentes, e as decisões de arquitetura já tomadas no produto.  
  
-----  
  
## 10. Pontos a validar com Erick antes da implementação  
  
- Definição formal do **teto de valor e critérios** que Lana e Thaynan já operam (hoje existe, mas pode não estar escrito).  
- Lista dos **itens críticos** que nunca podem faltar (Rafael e Swedney precisam contribuir).  
- Lista dos **fornecedores fixos** com motivo (ex: queijo coalho — fornecedor X, não substituir).  
- Taxa atual de ruptura e compras emergenciais — para ter baseline mensurável.  
- Disposição de Swedney e Rafael para sair do WhatsApp como ferramenta primária de pedido (mudança de hábito é o maior risco de implementação).  
  
-----  
  
**Fim do briefing.**  

export default [
  {
    date: '11/05/2022',
    inovations: [
      'Menu flutuante: Inicia o menu flutuante após carregamento completo da página',
    ],
  },
  {
    date: '27/05/2021',
    inovations: [
      'Tickets>Kanban: Otimização tempo de carregamento (cache)',
      'Monitor: Otimização tempo de carregamento (cache)',
      'Atualização de sistema sem precisar CTRL SHIFT R',
    ],
  },
  {
    date: '26/05/2021',
    inovations: [
      'Notificação nativa para alertar eventos da Agenda. Alerta de aviso para 5, 10, 15, 30 minutos antes do evento',
      'Menu flutuante>Status Servidor',
    ],
    bugfix: [
      {
        error: 'Notificações duplicadas',
      },
    ],
  },
  {
    date: '13/05/2021',
    inovations: [
      'Novo menu flutuante',
      'Menu flutuante>Tema: Alterar cor do tema principal',
      'Menu flutuante>Fila de espera: Controle da Fila de Espera, possibilita criar um item para a fila e abrir um ticket',
      'Menu flutuante>Atendimento: Visualização dos eventos',
      'Menu flutuante>Agenda: Visualização dos agendamentos do dia',
      'Novo template de notificação em cascata canto inferior direito',
      'Notificação em tempo real de atendimentos',
      'Notificação em tempo real da fila de espera',
      'Tickets>Lista: Filtrar Tickets em data específica ou em intervalo',
      'Tickets>Kanban: Otimização do componente de renderização do Card',
      'Novo Atendimento: Atendimento aberto pode ser finalizado nos dias posteriores',
      'Fila Espera>Histórico: Botão para abrir ticket vinculado ao item da fila de espera',
      'Popup com informações dos agendamentos abre ao entrar no site ou carregar na primeira vez do dia',
    ],
    bugfix: [
      {
        error: 'Ticket: Anexo era excluido a cada atualização do sistema',
      },
    ],
  },
  {
    date: '27/04/2021',
    inovations: [
      'Fila de Espera',
    ],
    bugfix: [
      {
        error: 'Tickets>Lista: Ao abrir um ticket e voltar pela lista, a aba voltava no Kanban',
      },
    ],
  },
  {
    date: '13/04/2021',
    inovations: [
      'Mensagem de erro ao tentar enviar requisições pesadas demais (8mb +)',
      'Tickets>Lista>Download CSV: Última linha do CSV indica o total',
    ],
  },
  {
    date: '12/04/2021',
    inovations: [
      'Abre menu principal quando todas as telas são fechadas',
      'Tickets>Kanban: Ao voltar para o Kanban, a tela é direcionada ao último "Ticket" analisado',
      'Novo Atendimento> Upload de arquivos grandes habilitado',
    ],
  },
  {
    date: '26/03/2021',
    inovations: [
      'Agenda>Evento: Propriedade de auto-ajuste em "Descrição do evento"',
      'Tickets>Kanban: Botão para sincronizar a visualização "kanban" com a base de dados',
      'Tickets>Ação: Nova disposição para o botão "Cancelar Ação"',
      'Tickets>Kanban: Otimização ao mover tickets',
    ],
    bugfix: [
      {
        error: 'Atendimento>Novo Atendimento: Em momentos de rápida alternância entre "Atendimentos", ocorria da descrição de um sobrescrever em outro',
      },
      {
        error: 'Tickets>Kanban: "Ticket Card" com 1 mês de atraso',
      },
      {
        error: 'Tickets>Kanban: a visualização "Kanban" não recarregava (permanecia em branco)',
      },
      {
        error: 'Agenda: Em algumas situações lista de "Eventos" não expandia na visualização "Mês"',
      },
    ],
  },
  {
    date: '25/03/2021',
    inovations: [
      'SPA Route modo "history" ao invés "hash"',
      'Agenda> "Linear progress bar" no lugar da "Circular"',
      'Agenda> Controle de edição do "Evento"',
    ],
    bugfix: [
      {
        error: 'Atendimento> Informações de atendimento eram perdidas',
        solution: 'Novo controle de cache robusto e novo componente gerenciamento de atendimentos',
      },
    ],
  },
  {
    date: '18/03/2021',
    inovations: [
      'Otimização nas operações de Ticket',
      'Download CSV tabela de Ticket',
    ],
  },
  {
    date: '03/12/2020',
    inovations: [
      'Novo Atendimento: Persistência local dos campos preenchidos',
      'Agenda: Novo layout para seleção de pessoas & persistência local das seleções',
    ],
    bugfix: [
      {
        error: 'Atendimento>Salvar Ticket: Layout quebrado',
      },
    ],
  },
  {
    date: '19/11/2020',
    inovations: [
      'Tickets>Kanban: Visualização de tickets por situação',
      'Tickets>Listagem: Otimização',
    ],
    bugfix: [
      {
        error: 'Monitor>Lista Atendimentos: Botão abrir ticket desabilidato',
        solution: 'Botão habilitado a partir do momento em que atendimento possuir ticket habilitado',
      },
    ],
  },
  {
    date: '18/11/2020',
    inovations: [
      'Novo Ticket: Data de previsão de solução autopreenchida de acordo com a urgência',
      'Agenda: Visão de lista',
      'Página Responsiva em "Atendimentos"',
    ],
  },
  {
    date: '17/11/2020',
    inovations: [
      'Tickets>Kanban: Assunto ticket visivel no "Card"',
      'Ticket Aberto: Identificação "Situacao" e "Responsável" sem precisar iniciar nova ação',
    ],
    bugfix: [
      {
        error: 'Correção layout base',
      },
      {
        error: 'Timeline: Erro ao abrir ticket',
      },
      {
        error: 'Correção autoscroll kanban',
      },
    ],
  },
  {
    date: '16/11/2020',
    inovations: [
      'Agenda: Deletar eventos',
      'Agenda: Duplicar eventos',
      'Agenda: Campo confirmado,  Data fim e participantes preenchidos por padrão',
      'Agenda: Substituições das "Checkboxes" por "Switches"',
      'Agenda: Novo funcionamento layout Evento (tipo de agendamento lembrete e dia todo)',
      'Agenda: Visão diária separada por categorias',
      'Agenda: Restrição de visualização por usuário baseada no "Perfil de Acesso"',
      'Agenda: Fixar Evento Recorrente',
      'Agenda: Ícone infinito para eventos recorrentes',
      'Tickets>Kanban: auto scroll',
      'Tickets: Otimização carregamento',
      'Novo usuário: Seleção da cor',
      'Agenda responsível web/mobile',
    ],
    bugfix: [
      {
        error: 'Cadastro: Novo registro ocupava meio da lista ao ser cadastrado',
        solution: 'Novo registro ocupa último lugar da lista ao ser cadastrado',
      },
      {
        error: 'Agenda: Cor do horário do evento branca no calendário quando não for confirmado',
        solution: 'Cor do horário preta em eventos não confirmados',
      },
      {
        error: 'Agenda: Em alguns casos eventos recorrentes estavam com fundo claro igual a eventos não confirmados',
        solution: 'Eventos recorrentes sempre são confirmados',
      },
    ],
  },
  {
    date: '06/11/2020',
    inovations: [
      'Agenda',
    ],
  },
  {
    date: '26/10/2020',
    inovations: [
    ],
    bugfix: [
      {
        error: '"Gráfico Histórico" recarrega ao alternar entre páginas',
        solution: '"Gráfico Histórico" armazena estado do último load',
      },
      {
        error: '"Kanban" recarrega ao alternar entre páginas',
        solution: '"Kanban" armazena estado do ultimo load',
      },
      {
        error: 'Em "Histórico diário", "Timeline" ausente não estava na última posição',
      },
    ],
  },
  {
    date: '23/10/2020',
    inovations: [
      'Média origem em "Monitor"',
      'Assunto ação em "Listagem" de "Tickets"',
      'Visualização ações em "Listagem" de "Tickets"',
    ],
    bugfix: [
      {
        error: 'Kanban sem formatação',
      },
    ],
  },
  {
    date: '21/10/2020',
    inovations: [
      'Tempo de prevsão em Tickets',
    ],
    bugfix: [
      {
        error: 'Resumo monitor ocultado',
      },
    ],
  },
  {
    date: '20/10/2020',
    inovations: [
      'Contador de Ações em "Monitor"',
      'Novo Layout em "Tickets"',
      'Novo Layout em "Monitor"',
      'Exibição nome do Cliente em "Ticekts&Ações"',
      'Exibição nome do Cliente em "Tickets Listagem"',
      'Filtro pelo nome do Cliente em "Tickets Listagem"',
      'Remoção da coluna "Finalizado" em "Kanban"',
      'Nova regra de acesso "Monitor > Monitorar todos os atendimentos > Monitorar Ações"',
      'Tabela lista Atendimentos em "Monitor" cabeçalho fixo',
      'Ao clicar na Barra do gráfico "Histórico diário" abrirá ticket vinculado em uma nova aba',
    ],
    bugfix: [
      {
        error: 'Erro "Apenas Usuários vinculados podem adicionar ações" mesmo com usuário vinculado ao "Ticket"',
      },
      {
        error: '"Monitor" carregava indefinidamente com usuário sem privilégio ao alternar entre as datas',
        solution: 'Usuário sem privilégio é impossibilitado de alternar entre as datas em "Monitor"',
      },
    ],
  },
  {
    date: '13/10/2020',
    inovations: [
      'Cadastro e alteração de Situação/Urgência',
      'Controle de Pause no Monitor',
      'Visualização data criação do ticket em Kanban',
    ],
  },
  {
    date: '07/10/2020',
    inovations: [
      'Pausar/Continuar Ação em "Ticket&Ações"',
      'Cadastro e alteração de Origem/Motivo/',
    ],
    bugfix: [
      {
        error: 'Ao criar nova ação em "Ticket&Ações" atendimento não era pausado',
        solution: 'Sempre que uma nova ação for criada o atendimento é pausado',
      },
      {
        error: 'Ao criar nova ação em "Ticket&Ações" com alteração do "Responsável", para não ocorrer erros, novo "Responsável" deveria ser vinculado manualmente ao "Ticket"',
        solution: 'Ao criar nova "Ação" alterando o "Responsável", o usuário do novo responsável é auto-vinculado ao "Ticket"',
      },
    ],
  },
  {
    date: '21/09/2020',
    inovations: [
      'Controle de horário trabalhados em Ações',
      'Ultima ação aberta por padrão em "Ticekts&Ações"',
    ],

    bugfix: [
      {
        error: 'Ao salvar "Ticket" em "Ticket&Ações", usuários vinculados voltava ao estado anterior',
      },
      {
        error: 'Usuários, com privilégio, não vinculados ao "Ticket" não conseguiam adicionar "Ações"',
        solution: 'Usuários com privilégio podem adicionar "Ações" a algum "Ticket" mesmo sem estar vinculado',
      },
      {
        error: 'Erro ao adicionar "Responsável" que não estava vinculado ao ticket em "Tickets&Ações"',
        solution: 'Responsável será automaticamente vinculado ao Ticket, caso não esteja',
      },
    ],
  },
  {
    date: '18/09/2020',
    inovations: [
      'Criação CHANGELOG para companhamento do desenvolvimento do sistema',
      'Criação Tela de acompanhamento dos Tickets e Ações "Tickets&Ações", que é aberta pelo Kanban, Listagem ou Lista de Atendimento',
      'Possível alterar o Motivo do Atendimento após a criação. Tanto na tela "Tickets&Ações" quanto na tela de "Atendimento" é possível efetuar a alteração do Motivo',
      'Possível alterar e salvar atributos do Ticket na tela "Tickets&Ações"',
      'Em "Tickets&Ações", ao salvar atributos do Ticket uma nova Ação será criada com informação das modificações"',
    ],

    bugfix: [
      {
        error: 'Ícone incorreto em "Total de Atendimentos" na tela "Atendimento"',
        solution: 'Ícone anterior "mdi-eye", ícone atual "mdi-face-agent"',
      },
      {
        error: 'Em algumas situações, ao abrir um Ticket específico em "Tickets&Ações", resultava em "Requisição Inválida"',
        solution: null,
      },
      {
        error: 'Requisição inválida ao carregar lista de Tickets (Tickets -> Listagem)',
      },
      {
        error: 'Aba do ticket com UNDEFINED no título quando algum ticket incompleto era aberto pelo Monitor (Monitor -> Lista de Atendimento -> Abrir)',
        solution: 'Apenas Tickets completos podem ser abertos pelo Monitor',
      },
      {
        error: 'Ao alterar horário final de atendimento já finalizado, data fim do atendimento não era atualizada (visto em Monitor -> Lista de Atendimento)',
      },
      {
        error: 'Commerce não estava sincronizando "Número de Usuários" e "Número de empresas" ao atualizar chave do cliente',
      },
    ],
  },
]

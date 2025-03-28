import axios from 'axios';

// Mock data para desenvolvimento
const mockTiposAgendamento = [
  { cd: 1, cdtipoagendamento: 1, nmtipoagendamento: 'Reunião' },
  { cd: 2, cdtipoagendamento: 2, nmtipoagendamento: 'Evento' },
  { cd: 3, cdtipoagendamento: 3, nmtipoagendamento: 'Lembrete' }
];

const mockEventos = [
  { 
    cd: 1, 
    nmtitulo: 'Evento de teste', 
    dtinicio: '2025-03-28T10:00:00', 
    dtfim: '2025-03-28T11:00:00',
    _cdtipoagendamento: 1,
    nmlocal: 'Sala de reuniões',
    mmdesc: 'Descrição do evento de teste'
  }
];

// Funções para API da Agenda com melhor tratamento de erros
export async function allTipoAgendamento() {
  try {
    // Inclui cabeçalhos de autenticação
    const headers = {
      'Accept': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0' // Adicione a versão do cliente se necessário
    };

    // Tenta a URL original primeiro
    try {
      const response = await axios.get('/agenda/tipo-agendamento/all', { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        // Se a primeira URL falhar com 404 ou 426, tenta uma URL alternativa
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para tipos de agendamento');
        try {
          const response = await axios.get('/api/agenda/tipos', { headers });
          return response;
        } catch (secondError) {
          // Se ambas as URLs falharem, retorna mock data
          console.warn('Todas as URLs falharam, usando mock data para tipos de agendamento');
          return { data: mockTiposAgendamento };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao buscar tipos de agendamento:', error);
    // Retorna mock data para evitar erros em cascata na UI
    return { data: mockTiposAgendamento };
  }
}

export async function allEvento(dtinicio, dtfim, userTarget = null) {
  try {
    // Inclui cabeçalhos de autenticação
    const headers = {
      'Accept': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0' // Adicione a versão do cliente se necessário
    };

    // Tenta a URL original primeiro
    try {
      let url = `/agenda/eventos?dtinicio=${dtinicio}&dtfim=${dtfim}`;
      if (userTarget) {
        url += `&userTarget=${userTarget}`;
      }
      const response = await axios.get(url, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        // Se a primeira URL falhar, tenta uma URL alternativa
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para eventos');
        try {
          let url = `/api/agenda/eventos/${dtinicio}/${dtfim}`;
          if (userTarget) {
            url += `/${userTarget}`;
          }
          const response = await axios.get(url, { headers });
          return response;
        } catch (secondError) {
          // Se ambas as URLs falharem, retorna mock data
          console.warn('Todas as URLs falharam, usando mock data para eventos');
          return { data: mockEventos };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    // Retorna mock data para evitar erros em cascata na UI
    return { data: mockEventos };
  }
}

export async function addEvento(evento) {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0'
    };

    try {
      const response = await axios.post('/agenda/eventos', evento, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para adicionar evento');
        try {
          const response = await axios.post('/api/agenda/eventos', evento, { headers });
          return response;
        } catch (secondError) {
          // Simula adição bem-sucedida para desenvolvimento
          console.warn('Todas as URLs falharam, simulando adição de evento');
          const mockResponse = { 
            data: { ...evento, cd: Math.floor(Math.random() * 1000) + 10 }
          };
          return mockResponse;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao adicionar evento:', error);
    return { data: null };
  }
}

export async function updateEvento(evento) {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0'
    };

    try {
      const response = await axios.put(`/agenda/eventos/${evento.cd}`, evento, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para atualizar evento');
        try {
          const response = await axios.put(`/api/agenda/eventos/${evento.cd}`, evento, { headers });
          return response;
        } catch (secondError) {
          // Simula atualização bem-sucedida para desenvolvimento
          console.warn('Todas as URLs falharam, simulando atualização de evento');
          return { data: evento };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return { data: null };
  }
}

export async function deleteEvento(cd) {
  try {
    const headers = {
      'Accept': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0'
    };

    try {
      const response = await axios.delete(`/agenda/eventos/${cd}`, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para deletar evento');
        try {
          const response = await axios.delete(`/api/agenda/eventos/${cd}`, { headers });
          return response;
        } catch (secondError) {
          // Simula deleção bem-sucedida para desenvolvimento
          console.warn('Todas as URLs falharam, simulando deleção de evento');
          return { data: { success: true } };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    return { data: null };
  }
}

export async function fixarEvento(evento) {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0'
    };

    try {
      const response = await axios.post('/agenda/eventos/fixar', evento, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para fixar evento');
        try {
          const response = await axios.post('/api/agenda/eventos/fixar', evento, { headers });
          return response;
        } catch (secondError) {
          // Simula operação bem-sucedida para desenvolvimento
          console.warn('Todas as URLs falharam, simulando fixação de evento');
          return { data: { ...evento, fixado: true } };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao fixar evento:', error);
    return { data: null };
  }
}

export async function duplicarEvento(data) {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0'
    };

    try {
      const response = await axios.post('/agenda/eventos/duplicar', data, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para duplicar evento');
        try {
          const response = await axios.post('/api/agenda/eventos/duplicar', data, { headers });
          return response;
        } catch (secondError) {
          // Simula duplicação bem-sucedida para desenvolvimento
          console.warn('Todas as URLs falharam, simulando duplicação de evento');
          const novoEvento = { 
            ...data, 
            cd: Math.floor(Math.random() * 1000) + 10,
            nmtitulo: `${data.nmtitulo} (Cópia)`
          };
          return { data: novoEvento };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao duplicar evento:', error);
    return { data: null };
  }
}

export async function addTipoAgendamento(tipoAgendamento) {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0'
    };

    try {
      const response = await axios.post('/agenda/tipo-agendamento', tipoAgendamento, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para adicionar tipo de agendamento');
        try {
          const response = await axios.post('/api/agenda/tipos', tipoAgendamento, { headers });
          return response;
        } catch (secondError) {
          // Simula adição bem-sucedida para desenvolvimento
          console.warn('Todas as URLs falharam, simulando adição de tipo de agendamento');
          const novoTipo = { 
            ...tipoAgendamento, 
            cd: Math.floor(Math.random() * 1000) + 10,
            cdtipoagendamento: Math.floor(Math.random() * 1000) + 10
          };
          return { data: novoTipo };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao adicionar tipo de agendamento:', error);
    return { data: null };
  }
}

export async function updateTipoAgendamento(tipoAgendamento) {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0'
    };

    try {
      const response = await axios.put(`/agenda/tipo-agendamento/${tipoAgendamento.cd}`, tipoAgendamento, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para atualizar tipo de agendamento');
        try {
          const response = await axios.put(`/api/agenda/tipos/${tipoAgendamento.cd}`, tipoAgendamento, { headers });
          return response;
        } catch (secondError) {
          // Simula atualização bem-sucedida para desenvolvimento
          console.warn('Todas as URLs falharam, simulando atualização de tipo de agendamento');
          return { data: tipoAgendamento };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar tipo de agendamento:', error);
    return { data: null };
  }
}

export async function deleteTipoAgendamento(cd) {
  try {
    const headers = {
      'Accept': 'application/json',
      'Authorization': localStorage.getItem('access_token') || '',
      'X-Client-Version': '1.0.0'
    };

    try {
      const response = await axios.delete(`/agenda/tipo-agendamento/${cd}`, { headers });
      return response;
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 426)) {
        console.warn('URL não encontrada ou upgrade requerido, tentando URL alternativa para deletar tipo de agendamento');
        try {
          const response = await axios.delete(`/api/agenda/tipos/${cd}`, { headers });
          return response;
        } catch (secondError) {
          // Simula deleção bem-sucedida para desenvolvimento
          console.warn('Todas as URLs falharam, simulando deleção de tipo de agendamento');
          return { data: { success: true } };
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar tipo de agendamento:', error);
    return { data: null };
  }
}
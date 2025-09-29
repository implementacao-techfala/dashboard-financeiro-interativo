import { API_URLS } from '../constants';
import { DashboardData } from '../types';
import { logger } from '../utils/logger';

const parseValor = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const cleanData = (item: any): DashboardData => ({
  ...item,
  valor: parseValor(item.valor),
  row_number: parseInt(item.row_number, 10),
  ano: parseInt(item.ano, 10),
});

export const fetchData = async (): Promise<DashboardData[]> => {
  logger.info('Iniciando busca de dados da API...');
  try {
    const response = await fetch(API_URLS.READ);
    logger.info('Resposta da API recebida', { ok: response.ok, status: response.status, statusText: response.statusText });

    const rawText = await response.text();
    logger.info('Corpo da resposta da API como texto.', { length: rawText.length, content: rawText.substring(0, 500) + (rawText.length > 500 ? '...' : '') });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let responseData;
    try {
        responseData = JSON.parse(rawText);
        logger.info('Resposta da API parseada como JSON com sucesso.', { data: responseData });
    } catch (e) {
        logger.error('Falha ao parsear o corpo da resposta como JSON.', { error: e, rawText });
        throw new Error('A resposta da API não é um JSON válido.');
    }

    if (responseData && typeof responseData === 'object' && responseData.body && typeof responseData.body === 'string') {
      logger.warn("Resposta parece estar envelopada. Tentando parsear a propriedade 'body'.");
      try {
        responseData = JSON.parse(responseData.body);
        logger.info("Propriedade 'body' parseada com sucesso.", { data: responseData });
      } catch (e) {
        logger.error("Falha ao parsear a string da propriedade 'body'.", { error: e, body: responseData.body });
      }
    }
    
    let dataArray: any[];
    if (Array.isArray(responseData) && responseData.length > 0 && responseData[0] && Array.isArray(responseData[0].data)) {
        dataArray = responseData[0].data;
        logger.info('Dados extraídos da estrutura aninhada `[{ data: [...] }]`.', { count: dataArray.length });
    } else if (Array.isArray(responseData)) {
        dataArray = responseData;
        logger.info('Os dados da API são um array.', { count: dataArray.length });
    } else if (typeof responseData === 'object' && responseData !== null) {
        const arrayProperty = Object.values(responseData).find(value => Array.isArray(value));
        if (arrayProperty && Array.isArray(arrayProperty)) {
            dataArray = arrayProperty;
            logger.info('Encontrado um array dentro de uma propriedade do objeto da API.', { count: dataArray.length });
        } else if (responseData.row_number !== undefined) {
             logger.warn("A API retornou um único objeto. Envolvendo-o em um array.", { data: responseData });
             dataArray = [responseData];
        } else {
            logger.warn("A resposta da API é um objeto mas não contém uma propriedade que seja um array. Isso pode ocorrer se não houver registros.", { data: responseData });
            return [];
        }
    } else {
        logger.warn("Os dados recebidos não estão em um formato reconhecido (array ou objeto com um array).", { data: responseData });
        return [];
    }
    
    const cleanedData = dataArray
        .map(item => (item ? cleanData(item) : null))
        .filter((item): item is DashboardData => item !== null && item.row_number != null && !isNaN(item.row_number));

    logger.info('Dados limpos e filtrados.', { initialCount: dataArray.length, finalCount: cleanedData.length });
    return cleanedData;

  } catch (error) {
    logger.error("Falha na função fetchData.", { error });
    throw error;
  }
};
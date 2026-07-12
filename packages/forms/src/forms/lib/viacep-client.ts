import axios, { type AxiosError, type AxiosInstance } from "axios";

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  erro?: boolean | string;
}

export class CepNotFoundError extends Error {
  constructor() {
    super("CEP não encontrado");
    this.name = "CepNotFoundError";
  }
}

function addCepInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => {
      if (response.data?.erro === true || response.data?.erro === "true") {
        return Promise.reject(new CepNotFoundError());
      }
      return response;
    },
    (error: AxiosError) => {
      if (error.code === "ECONNABORTED") {
        return Promise.reject(new Error("Tempo de requisição excedido"));
      }
      if (error.code === "ERR_NETWORK") {
        return Promise.reject(new Error("Erro de conexão. Verifique sua internet."));
      }
      return Promise.reject(error);
    },
  );
}

export const openCepClient: AxiosInstance = axios.create({
  baseURL: "https://opencep.com/v1/",
  timeout: 5000,
});
addCepInterceptor(openCepClient);

export const viaCepClient: AxiosInstance = axios.create({
  baseURL: "https://viacep.com.br/ws/",
  timeout: 5000,
});
addCepInterceptor(viaCepClient);

export const brasilApiClient: AxiosInstance = axios.create({
  baseURL: "https://brasilapi.com.br/api/cep/v2/",
  timeout: 5000,
});

interface BrasilApiCepResponse {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
}

function mapBrasilApiResponse(data: BrasilApiCepResponse): ViaCepResponse {
  return {
    ...(data.cep !== undefined ? { cep: data.cep } : {}),
    logradouro: data.street ?? "",
    complemento: "",
    bairro: data.neighborhood ?? "",
    localidade: data.city ?? "",
    uf: data.state ?? "",
  };
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse> {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    throw new Error("CEP deve conter 8 dígitos");
  }

  try {
    const response = await openCepClient.get<ViaCepResponse>(cleanCep);
    return response.data;
  } catch (primaryError) {
    if (primaryError instanceof CepNotFoundError) throw primaryError;

    try {
      const response = await viaCepClient.get<ViaCepResponse>(`${cleanCep}/json/`);
      return response.data;
    } catch (secondaryError) {
      if (secondaryError instanceof CepNotFoundError) throw secondaryError;

      try {
        const response = await brasilApiClient.get<BrasilApiCepResponse>(cleanCep);
        if (response.status === 404) throw new CepNotFoundError();
        return mapBrasilApiResponse(response.data);
      } catch (tertiaryError) {
        if (tertiaryError instanceof CepNotFoundError) throw tertiaryError;
        throw new Error("Erro ao buscar endereço. Preencha manualmente.", { cause: tertiaryError });
      }
    }
  }
}

export interface ViaCepResponse {
  bairro?: string;
  cep?: string;
  complemento?: string;
  erro?: boolean | string;
  ibge?: string;
  localidade?: string;
  logradouro?: string;
  uf?: string;
}

interface BrasilApiCepResponse {
  cep?: string;
  city?: string;
  neighborhood?: string;
  state?: string;
  street?: string;
}

class CepNotFoundError extends Error {
  constructor() {
    super("CEP não encontrado");
    this.name = "CepNotFoundError";
  }
}

function mapBrasilApiResponse(data: BrasilApiCepResponse): ViaCepResponse {
  return {
    bairro: data.neighborhood ?? "",
    ...(data.cep !== undefined ? { cep: data.cep } : {}),
    complemento: "",
    localidade: data.city ?? "",
    logradouro: data.street ?? "",
    uf: data.state ?? "",
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (response.status === 404) throw new CepNotFoundError();
  if (!response.ok) throw new Error("Erro ao buscar endereço");

  const data = (await response.json()) as T;
  if (
    typeof data === "object" &&
    data !== null &&
    "erro" in data &&
    (data.erro === true || data.erro === "true")
  ) {
    throw new CepNotFoundError();
  }

  return data;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse> {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    throw new Error("CEP deve conter 8 dígitos");
  }

  try {
    return await fetchJson<ViaCepResponse>(`https://opencep.com/v1/${cleanCep}`);
  } catch (primaryError) {
    if (primaryError instanceof CepNotFoundError) throw primaryError;
  }

  try {
    return await fetchJson<ViaCepResponse>(`https://viacep.com.br/ws/${cleanCep}/json/`);
  } catch (secondaryError) {
    if (secondaryError instanceof CepNotFoundError) throw secondaryError;
  }

  try {
    const data = await fetchJson<BrasilApiCepResponse>(
      `https://brasilapi.com.br/api/cep/v2/${cleanCep}`,
    );
    return mapBrasilApiResponse(data);
  } catch (tertiaryError) {
    if (tertiaryError instanceof CepNotFoundError) throw tertiaryError;
    throw new Error("Erro ao buscar endereço. Preencha manualmente.");
  }
}

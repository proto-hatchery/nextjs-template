/* oxlint-disable */
import { describe, expect, it, vi } from "vitest";

import {
  brasilApiClient,
  CepNotFoundError,
  fetchAddressByCep,
  openCepClient,
  viaCepClient,
} from "@workspace/forms/lib/viacep-client";

describe("fetchAddressByCep", () => {
  it("throws for invalid CEP length", async () => {
    await expect(fetchAddressByCep("123")).rejects.toThrow(
      "CEP deve conter 8 dígitos"
    );
  });

  it("returns data from primary client (openCep)", async () => {
    vi.spyOn(openCepClient, "get").mockResolvedValueOnce({
      data: {
        cep: "01001000",
        logradouro: "Praça da Sé",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      },
    } as never);

    const result = await fetchAddressByCep("01001-000");
    expect(result.cep).toBe("01001000");
    expect(result.logradouro).toBe("Praça da Sé");
  });

  it("falls back to viaCep when openCep fails", async () => {
    vi.spyOn(openCepClient, "get").mockRejectedValueOnce(new Error("Network error"));
    vi.spyOn(viaCepClient, "get").mockResolvedValueOnce({
      data: {
        cep: "01001000",
        logradouro: "Praça da Sé",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      },
    } as never);

    const result = await fetchAddressByCep("01001-000");
    expect(result.cep).toBe("01001000");
  });

  it("falls back to brasilApi when both primary clients fail", async () => {
    vi.spyOn(openCepClient, "get").mockRejectedValueOnce(new Error("Network error"));
    vi.spyOn(viaCepClient, "get").mockRejectedValueOnce(new Error("Network error"));
    vi.spyOn(brasilApiClient, "get").mockResolvedValueOnce({
      data: {
        cep: "01001000",
        street: "Praça da Sé",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
      },
      status: 200,
    } as never);

    const result = await fetchAddressByCep("01001-000");
    expect(result.logradouro).toBe("Praça da Sé");
    expect(result.localidade).toBe("São Paulo");
  });

  it("throws CepNotFoundError when primary returns erro", async () => {
    vi.spyOn(openCepClient, "get").mockRejectedValueOnce(new CepNotFoundError());

    await expect(fetchAddressByCep("01001000")).rejects.toThrow(
      "CEP não encontrado"
    );
  });

  it("throws generic error when all clients fail", async () => {
    vi.spyOn(openCepClient, "get").mockRejectedValueOnce(new Error("fail"));
    vi.spyOn(viaCepClient, "get").mockRejectedValueOnce(new Error("fail"));
    vi.spyOn(brasilApiClient, "get").mockRejectedValueOnce(new Error("fail"));

    await expect(fetchAddressByCep("01001000")).rejects.toThrow(
      "Erro ao buscar endereço. Preencha manualmente."
    );
  });
});

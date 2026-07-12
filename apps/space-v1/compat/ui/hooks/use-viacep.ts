"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAddressByCep, type ViaCepResponse } from "../lib/viacep-client";

export interface AddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface UseViaCepReturn {
  data: AddressData | null;
  loading: boolean;
  error: string | null;
  fetchAddress: (cep: string) => Promise<void>;
  clearAddress: () => void;
}

const addressCache = new Map<string, AddressData>();

export function clearViaCepCache() {
  addressCache.clear();
}

export function useViaCep(debounceMs: number = 300): UseViaCepReturn {
  const [data, setData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const transformViaCepResponse = useCallback((response: ViaCepResponse): AddressData => {
    return {
      street: response.logradouro || "",
      number: "",
      complement: response.complemento || "",
      neighborhood: response.bairro || "",
      city: response.localidade || "",
      state: response.uf || "",
      postalCode: response.cep?.replace(/\D/g, "") || "",
      country: "Brasil",
    };
  }, []);

  const fetchAddress = useCallback(
    async (cep: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const cleanCep = cep.replace(/\D/g, "");

      if (cleanCep.length !== 8) {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }

      const cached = addressCache.get(cleanCep);
      if (cached) {
        setData(cached);
        setError(null);
        setLoading(false);
        return;
      }

      debounceTimeoutRef.current = setTimeout(async () => {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setLoading(true);
        setError(null);

        try {
          const response = await fetchAddressByCep(cleanCep);

          if (abortController.signal.aborted) {
            return;
          }

          const addressData = transformViaCepResponse(response);

          addressCache.set(cleanCep, addressData);

          setData(addressData);
          setError(null);
        } catch (err) {
          if (abortController.signal.aborted) {
            return;
          }

          const errorMessage = err instanceof Error ? err.message : "Erro ao buscar endereço";
          setError(errorMessage);
          setData(null);
        } finally {
          if (!abortController.signal.aborted) {
            setLoading(false);
          }
        }
      }, debounceMs);
    },
    [debounceMs, transformViaCepResponse],
  );

  /**
   * Limpa os dados do endereço
   */
  const clearAddress = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    fetchAddress,
    clearAddress,
  };
}

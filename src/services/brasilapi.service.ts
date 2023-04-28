interface IBrCompanyData {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: number;
  nome_cidade_exterior: null | string;
  codigo_natureza_juridica: number;
  data_inicio_atividade: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  descricao_tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: null | string;
  bairro: string;
  cep: number;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2: null | string;
  ddd_fax: null | string;
  qualificacao_do_responsavel: number;
  capital_social: number;
  porte: number;
  descricao_porte: string;
  opcao_pelo_simples: boolean;
  data_opcao_pelo_simples: null | string;
  data_exclusao_do_simples: null | string;
  opcao_pelo_mei: boolean;
  situacao_especial: null | string;
  data_situacao_especial: null | string;
  cnaes_secundarios: {
    codigo: number;
    descricao: string;
  }[];
  qsa: {
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    codigo_qualificacao_socio: number;
    percentual_capital_social: number;
    data_entrada_sociedade: string;
    cpf_representante_legal: null | string;
    nome_representante_legal: null | string;
    codigo_qualificacao_representante_legal: null | string;
  }[];
}

export const getEnterpriseByCnpj = async (
  cnpj: string | undefined
): Promise<IBrCompanyData> => {
  if (!cnpj) throw new Error("CNPJ não informado");
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
  const data = (await response.json()) as IBrCompanyData;
  return data;
};

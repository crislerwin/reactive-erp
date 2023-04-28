import { SideBar } from "@/components/SideBar";
import { type NextPage } from "next";
import { useQuery } from "@tanstack/react-query";
import { TextInput, Button, Group, Box, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import { useState } from "react";

type FormValues = {
  cnpj: string;
  socialReason: string;
  fantasyName: string;
  situation: number;
  country: string;
  sponsorName: string | null | undefined;
  email: string;
};

const initialValues = {
  cnpj: "",
  socialReason: "",
  fantasyName: "",
  situation: 0,
  country: "",
  sponsorName: "",
  email: "",
};
const Companies: NextPage = () => {
  const [cnpj, setCnpj] = useState<string | undefined>();
  const { onSubmit, getInputProps, setFieldValue, reset, values } =
    useForm<FormValues>({
      initialValues,
    });

  const { isFetching } = useQuery(
    ["brasil-api-company", cnpj],
    () => getEnterpriseByCnpj(cnpj),
    {
      enabled: !!cnpj,
      retry: false,
      onError: () => {
        reset();
        setCnpj(undefined);
      },
      onSuccess: (data) => {
        const fieldValues: (keyof Omit<FormValues, "cnpj" | "email">)[] = [
          "country",
          "fantasyName",
          "socialReason",
          "situation",
          "sponsorName",
        ];
        const formatedData: Omit<FormValues, "cnpj" | "email"> = {
          country: data.uf,
          fantasyName: data.nome_fantasia,
          situation: data.situacao_cadastral,
          socialReason: data.razao_social,
          sponsorName:
            data.qsa && data.qsa.length > 0 ? data.qsa[0]?.nome_socio : "",
        };
        fieldValues.forEach((field) => {
          setFieldValue(field, formatedData[field]);
        });
      },
    }
  );

  const handleSearch = () => setCnpj(values.cnpj);

  return (
    <SideBar>
      <Box maw={400} mx="auto">
        <form onSubmit={onSubmit((vals) => console.log(vals))}>
          <TextInput
            label="CNPJ"
            rightSection={
              <div onClick={handleSearch} className="cursor-pointer">
                {isFetching ? (
                  <Loader size="xs" />
                ) : (
                  <IconSearch color="currentColor" className="h-4 w-4" />
                )}
              </div>
            }
            placeholder="Digite o CNPJ da empresa"
            {...getInputProps("cnpj")}
          />
          <TextInput
            label="Razão Social"
            placeholder=""
            {...getInputProps("fantasyName")}
          />
          <TextInput
            label="Nome Fantasia"
            placeholder=""
            {...getInputProps("socialReason")}
          />
          <TextInput
            label="Situação Cadastral"
            placeholder=""
            {...getInputProps("situation")}
          />
          <TextInput
            label="País"
            placeholder=""
            {...getInputProps("country")}
          />
          <TextInput
            label="Nome do Responsável"
            placeholder=""
            {...getInputProps("sponsorName")}
          />
          <TextInput
            label="E-mail"
            placeholder=""
            {...getInputProps("email")}
          />

          <Group position="right" mt="md">
            <Button type="submit">Salvar</Button>
          </Group>
        </form>
      </Box>
    </SideBar>
  );
};

export default Companies;

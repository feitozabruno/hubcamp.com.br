"use client";
import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function Status() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando dados...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <p>Última atualização: {updatedAtText}</p>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let databaseInformation = "Carregando dados...";

  if (!isLoading && data) {
    databaseInformation = (
      <>
        <p>Versão: {data.dependencies.database.version}</p>
        <p>Conexões abertas: {data.dependencies.database.max_connections}</p>
        <p>Conexões máximas: {data.dependencies.database.open_connections}</p>
      </>
    );
  }

  return (
    <>
      <h2>Database</h2>
      <div>{databaseInformation}</div>
    </>
  );
}

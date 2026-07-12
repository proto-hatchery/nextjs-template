export default function PatientNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">Paciente não encontrado</h2>
      <p className="text-sm text-muted-foreground">
        O paciente solicitado não existe ou foi removido.
      </p>
    </div>
  );
}

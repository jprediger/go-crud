import DatasetsPage from '@/components/datasets/DatasetsPage';
import Header from '@/components/Header';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/datasets')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Header />
      <DatasetsPage />
    </>
  );
}


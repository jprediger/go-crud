import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/datasets/$datasetId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { datasetId } = useParams({ from: "/_authenticated/datasets/$datasetId" });
  return <div>Hello "/datasets/{datasetId}!</div>
}

import { createFileRoute } from '@tanstack/react-router'
import DatasetDocuments from '@/components/datasets/DatasetDocuments'
export const Route = createFileRoute(
  '/_authenticated/dataset/$datasetId/documents',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <DatasetDocuments />
}

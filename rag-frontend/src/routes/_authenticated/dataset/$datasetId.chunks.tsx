import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/dataset/$datasetId/chunks',
)({
  component: RouteComponent,
})

import DatasetChunks from '@/components/datasets/DatasetChunks'

function RouteComponent() {
  return <DatasetChunks />
}

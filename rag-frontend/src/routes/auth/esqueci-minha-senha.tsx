import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/esqueci-minha-senha')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResetPasswordForm />
}

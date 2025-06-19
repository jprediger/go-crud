import { createFileRoute } from '@tanstack/react-router'
import ConfirmSignInForm from '@/components/confirm-sign-in/ConfirmSignInForm'

export const Route = createFileRoute('/auth/confirmar-login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ConfirmSignInForm/>
}

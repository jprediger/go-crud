// src/pages/NewPasswordPage/NewPasswordPage.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import {
  confirmSignInFormSchema,
  type ConfirmSignInFormValues,
} from "./confirmSignInFormSchema";

import { useAuth } from "../../contexts/AuthContext"; // Ajuste o caminho

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

const ConfirmSignInForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useAuth();

  // Inicializa o React Hook Form
  const form = useForm<ConfirmSignInFormValues>({
    resolver: zodResolver(confirmSignInFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ConfirmSignInFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const nextStep = "CONFIRM_SIGN_IN_WITH_PASSWORD";
      await auth.confirmSignInHandler(nextStep, data.confirmPassword);
      toast.success("Senha atualizada com sucesso!", {
        position: "top-center",
      });
      navigate({
        to: "/",
        replace: true,
      });
    } catch (err: any) {
      toast.error(
        "Erro ao confirmar nova senha. Verifique os dados e tente novamente.",
        {
          position: "top-center",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se estiver carregando o estado inicial do usuário (ex: refresh da página)
  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center">
            <Lock className="h-12 w-12 text-[hsl(var(--chart-1))]" />
          </div>
          <CardTitle className="text-2xl">Criar Nova Senha</CardTitle>
          <CardDescription>
            Para continuar, você deve definir uma nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username field removed */}

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword ? "Esconder senha" : "Mostrar senha"
                          }
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md"
                          onClick={() => setShowConfirm((prev) => !prev)}
                          aria-label={
                            showConfirm ? "Esconder senha" : "Mostrar senha"
                          }
                          disabled={isSubmitting}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Confirmar Nova Senha
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmSignInForm;

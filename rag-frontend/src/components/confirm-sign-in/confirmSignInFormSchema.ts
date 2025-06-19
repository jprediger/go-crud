import { z } from "zod";

export type ConfirmSignInFormValues = {
  newPassword: string;
  confirmPassword: string; 
};

export const confirmSignInFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "A senha deve ter no mínimo 8 caracteres." })
      .max(100, { message: "A senha deve ter no máximo 100 caracteres." })
      .regex(/[A-Z]/, {
        message: "A senha deve conter ao menos uma letra maiúscula",
      })
      .regex(/[a-z]/, {
        message: "A senha deve conter ao menos uma letra minúscula",
      })
      .regex(/[0-9]/, { message: "A senha deve conter ao menos um número" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "A senha deve conter ao menos um caractere especial",
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "A senha deve ter no mínimo 8 caracteres." })
      .max(100, { message: "A senha deve ter no máximo 100 caracteres." })
      .regex(/[A-Z]/, {
        message: "A senha deve conter ao menos uma letra maiúscula",
      })
      .regex(/[a-z]/, {
        message: "A senha deve conter ao menos uma letra minúscula",
      })
      .regex(/[0-9]/, { message: "A senha deve conter ao menos um número" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "A senha deve conter ao menos um caractere especial",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

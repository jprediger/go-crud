package utils

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// Função utilitária para tratar erros de validação
func HandleValidationError(c *gin.Context, err error) bool {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		out := make(map[string]string)
		for _, fe := range ve {
			out[fe.Field()] = msgForTag(fe)
		}
		ValidationErrorResponse(c, out)
		return true
	}
	return false
}

// msgForTag retorna uma mensagem de erro em português para o usuário com base na tag de validação
func msgForTag(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "Este campo é obrigatório"
	case "email":
		return "E-mail inválido"
	case "min":
		return "Valor muito curto"
	case "max":
		return "Valor muito longo"
	case "oneof":
		return "Valor não permitido"
	}
	return "Valor inválido"
}

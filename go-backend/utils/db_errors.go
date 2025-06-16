package utils

import (
	"strings"

	"github.com/gin-gonic/gin"
)

func HandleDBError(c *gin.Context, err error) bool {
	if err == nil {
		return false
	}

	// Verifica se o erro é do tipo gorm.ErrDuplicatedKey
	if strings.Contains(err.Error(), "duplicate key value") {
		ErrorResponse(c, "O registro já existe no banco de dados", 409)
		return true
	}

	// Verifica se o erro é do tipo gorm.ErrRecordNotFound
	if strings.Contains(err.Error(), "record not found") {
		ErrorResponse(c, "Registro não encontrado", 404)
		return true
	}

	// Verifica se o erro é do tipo gorm.ErrInvalidData
	if strings.Contains(err.Error(), "invalid data") {
		ErrorResponse(c, "Dados inválidos fornecidos", 400)
		return false
	}

	// Para outros erros, retorna uma mensagem genérica
	ErrorResponse(c, "Erro ao acessar o banco de dados", 500)
	return true
}

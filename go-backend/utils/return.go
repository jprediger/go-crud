package utils

import "github.com/gin-gonic/gin"

func SuccessResponse(c *gin.Context, message string, data any) {
	c.JSON(200, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

func ErrorResponse(c *gin.Context, message string, statusCode int) {
	c.JSON(statusCode, gin.H{
		"success": false,
		"message": message,
	})
}

func ValidationErrorResponse(c *gin.Context, errors map[string]string) {
	c.JSON(400, gin.H{
		"success": false,
		"message": "Erro ao validar os dados fornecidos",
		"errors":  errors,
	})
}

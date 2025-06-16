package controllers

import (
	initalizers "go-backend/initializers"
	models "go-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateChunk(c *gin.Context) {
	// Extrai dados do body
	var chunk models.Chunk
	if err := c.ShouldBindJSON(&chunk); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}

	// Cria o chunk
	result := initalizers.DB.Create(&chunk)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Erro ao criar o chunk"})
		return
	}

	// Retorna o chunk criado
	c.JSON(201, gin.H{
		"message": "Chunk criado com sucesso",
		"chunk":   chunk,
	})
}

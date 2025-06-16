package controllers

import (
	initalizers "go-backend/initializers"
	models "go-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateDataSource(c *gin.Context) {
	// Extrai dados do body
	var dataSource models.DataSource
	if err := c.ShouldBindJSON(&dataSource); err != nil {
		c.JSON(400, gin.H{"error": "Dados inválidos"})
		return
	}

	// Cria o data source
	result := initalizers.DB.Create(&dataSource)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Erro ao criar o data source"})
		return
	}

	// Retorna o data source criado
	c.JSON(201, gin.H{
		"message":     "Data source criado com sucesso",
		"data_source": dataSource,
	})
}

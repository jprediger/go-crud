package main

import (
	initalizers "go-backend/initializers"
	models "go-backend/models"
	"log"
)

func init() {
	initalizers.LoadEnvVariables()
	initalizers.ConnectToDatabase()
}

func main() {
	// Cria a extensão vector no banco de dados
	initalizers.DB.Exec("CREATE EXTENSION IF NOT EXISTS vector;")
	err := initalizers.DB.AutoMigrate(
		&models.Dataset{},
		&models.DataSource{},
		&models.Chunk{},
		&models.Organization{},
	)

	if err != nil {
		panic("Falha ao migrar banco de dados: " + err.Error())
	}
	log.Println("Migração do banco de dados concluída com sucesso")
}

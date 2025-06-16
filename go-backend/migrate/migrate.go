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
		&models.User{},
	)
	// Cria o índice único para o campo email na tabela users, considerando apenas registros não deletados
	initalizers.DB.Exec("CREATE UNIQUE INDEX IF NOT EXISTS unique_email_not_deleted ON users (email) WHERE deleted_at IS NULL;")

	if err != nil {
		panic("Falha ao migrar banco de dados: " + err.Error())
	}
	log.Println("Migração do banco de dados concluída com sucesso")
}

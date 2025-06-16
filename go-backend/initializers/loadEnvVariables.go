package initalizers

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnvVariables() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Erro ao carregar o arquivo .env: ", err)
	}

	log.Println("Variables de ambiente carregadas com sucesso")
}

package initalizers

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
)

func LoadEnvVariables() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Erro ao carregar o arquivo .env: %v", err)
	}

	// Sucesso no carregamento das variáveis de ambiente
	fmt.Println("\n\n-------------------------------------")
	fmt.Printf("Variáveis de ambiente carregadas com sucesso\n")
	fmt.Println("-------------------------------------")
}

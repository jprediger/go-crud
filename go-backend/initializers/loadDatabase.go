package initalizers

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectToDatabase() {
	// load from dotenv
	dsn := os.Getenv("DATABASE_URL")
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("Falha ao conectar ao banco de dados: %v", err.Error())
	}

	// Log na conexão bem-sucedida
	fmt.Println("\n\n-------------------------------------")
	fmt.Printf("Conexão com o banco de dados estabelecida com sucesso\n")
	fmt.Println("-------------------------------------")
}

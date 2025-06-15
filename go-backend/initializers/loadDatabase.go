package initalizers

import (
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
		panic("Falha ao conectar ao banco de dados: " + err.Error())
	}

	// Log na conexão bem-sucedida
	log.Println("Conexão com o banco de dados estabelecida com sucesso")
}

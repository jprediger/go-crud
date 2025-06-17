package initalizers

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sts"
)

var AwsConfig aws.Config

func LoadAwsProfile() {

	// Nome do perfil AWS
	profileName := "pessoal"
	fmt.Printf("\n\nTentando conectar no perfil: %s\n", profileName)

	// Carrega a configuração da AWS, especificando o perfil desejado
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithSharedConfigProfile(profileName),
	)
	if err != nil {
		log.Fatalf("Não foi possível carregar o SDK AWS, %v", err)
	}

	AwsConfig = cfg // Salva na variável global

	// Cria um cliente de um serviço AWS
	client := sts.NewFromConfig(cfg)

	// Usa o client para verificar identidade do usuário
	input := &sts.GetCallerIdentityInput{}
	result, err := client.GetCallerIdentity(context.TODO(), input)
	if err != nil {
		log.Fatalf("Falha ao carregar identidade do usuário, %v", err)
	}

	fmt.Println("-------------------------------------")
	fmt.Printf("Conexão com AWS estabelecida com sucesso:\n")
	fmt.Printf("Account ID: %s\n", *result.Account)
	fmt.Printf("User/Role ARN: %s\n", *result.Arn)
	fmt.Println("-------------------------------------")
}

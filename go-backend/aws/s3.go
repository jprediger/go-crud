package aws

import (
	"context"
	initalizers "go-backend/initializers" // Certifique-se que o caminho está correto
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// DeleteS3Object encapsula a lógica para deletar um objeto do S3.
// Ela recebe o objectKey e retorna um erro se a operação falhar.
func DeleteS3Object(objectKey string) error {
	// Reutiliza a configuração da AWS já carregada na inicialização
	s3Client := s3.NewFromConfig(initalizers.AwsConfig)

	// Pega o nome do bucket da variável de ambiente
	bucketName := os.Getenv("S3_BUCKET_NAME")

	// Prepara e executa a chamada para deletar o objeto
	_, err := s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})

	// Se houver um erro, loga e o retorna para o chamador (o controller)
	if err != nil {
		log.Printf("Falha ao deletar o objeto '%s' do bucket '%s'. Erro: %v", objectKey, bucketName, err)
		return err
	}

	log.Printf("Objeto '%s' deletado com sucesso do bucket '%s'", objectKey, bucketName)
	return nil
}

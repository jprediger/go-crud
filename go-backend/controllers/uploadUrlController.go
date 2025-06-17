package controllers

import (
	"context"
	initalizers "go-backend/initializers"
	"go-backend/utils"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RequestBody para solicitar a URL de upload
type requestUploadURLBody struct {
	FileName    string `json:"fileName" binding:"required"`
	ContentType string `json:"contentType" binding:"required"`
}

// ResponseBody com a URL gerada
type responseUploadURLBody struct {
	UploadURL string `json:"uploadURL"`
	ObjectKey string `json:"objectKey"` // A chave/caminho final do objeto no S3
}

// GenerateUploadURL é o handler do Gin
func GenerateUploadURL(c *gin.Context) {
	var body requestUploadURLBody
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, "Dados inválidos", 400)
		return
	}

	// Cria os clientes S3
	s3Client := s3.NewFromConfig(initalizers.AwsConfig)
	presignClient := s3.NewPresignClient(s3Client)

	// Gera uma chave de objeto única para evitar sobreposições
	// Ex: "uploads/4e73e6a7-e549-4a34-9e9b-df2c6d4d3859/report.pdf"
	objectKey := "uploads/" + uuid.New().String() + "/" + body.FileName

	// Gera a requisição de PutObject pré-assinada
	presignedURLRequest, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:         aws.String(objectKey),
		ContentType: aws.String(body.ContentType),
	}, s3.WithPresignExpires(15*time.Minute)) // A URL expira em 15 minutos

	if err != nil {
		log.Printf("Couldn't get a presigned request to put %v:%v. Here's why: %v\n", os.Getenv("S3_BUCKET_NAME"), objectKey, err)
		utils.ErrorResponse(c, "Erro ao gerar URL de upload", 500)
		return
	}

	// Retorna a URL e a chave do objeto para o cliente
	response := responseUploadURLBody{
		UploadURL: presignedURLRequest.URL,
		ObjectKey: objectKey,
	}

	utils.SuccessResponse(c, "URL de upload gerada com sucesso", response)
}

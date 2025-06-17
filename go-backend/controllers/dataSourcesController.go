package controllers

import (
	initalizers "go-backend/initializers"
	models "go-backend/models"
	utils "go-backend/utils"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DTO para criar um DataSource
type CreateDataSourceDTO struct {
	Name      string `json:"name" binding:"required"`
	DatasetID uint   `json:"dataset_id" binding:"required"`
	Type      string `json:"type" binding:"required"`
	ObjectKey string `json:"object_key" binding:"required"` // Caminho do arquivo no S3
}

// DTO para atualizar um DataSource
type UpdateDataSourceDTO struct {
	Name string `json:"name" binding:"omitempty"`
}

// DTO para a resposta da API sobre um DataSource
type DataSourceResponse struct {
	ID        uint    `json:"id"`
	Name      string  `json:"name"`
	DatasetID uint    `json:"dataset_id"`
	Type      string  `json:"type"`
	ObjectKey string  `json:"object_key"`        // Caminho do arquivo no S3
	Summary   *string `json:"summary,omitempty"` // Resumo do conteúdo, opcional
}

// --- Funções do Controller ---

// Get_DataSources: Buscar todos os DataSources (opcionalmente por dataset_id)
func GetDataSources(c *gin.Context) {
	var dataSources []models.DataSource

	// Constrói a query base
	query := initalizers.DB

	// Filtra por dataset_id se o parâmetro for fornecido na query string
	datasetID := c.Query("id")
	if datasetID != "" {
		query = query.Where("id = ?", datasetID)
	}

	// Executa a busca
	result := query.Find(&dataSources)
	if result.Error != nil {
		utils.ErrorResponse(c, "Erro ao buscar DataSources", 500)
		return
	}

	if result.RowsAffected == 0 {
		utils.ErrorResponse(c, "Nenhum DataSource encontrado", 404)
		return
	}

	// Mapeia para a resposta
	var resp []DataSourceResponse
	for _, ds := range dataSources {
		resp = append(resp, DataSourceResponse{
			ID:        ds.ID,
			Name:      ds.Name,
			DatasetID: ds.DatasetID,
			Type:      ds.Type,
			ObjectKey: ds.ObjectKey, // Inclui o caminho do arquivo no S3
			Summary:   ds.Summary,
		})
	}
	utils.SuccessResponse(c, "DataSources encontrados", resp)
}

// Create_DataSource: Criar um novo DataSource
func CreateDataSource(c *gin.Context) {
	var dto CreateDataSourceDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		if utils.HandleValidationError(c, err) {
			return
		}
		utils.ErrorResponse(c, "Dados inválidos", 400)
		return
	}

	// Gera um hash único para o DataSource
	hash := uuid.New().String()

	dataSource := models.DataSource{
		Name:             dto.Name,
		Hash:             hash,
		DatasetID:        dto.DatasetID,
		Type:             dto.Type,
		Summary:          nil,           // Inicializa como nil
		SummaryEmbedding: nil,           // Inicializa como nil
		ObjectKey:        dto.ObjectKey, // Caminho do arquivo no S3
	}

	// Salva no banco de dados
	result := initalizers.DB.Create(&dataSource)
	if result.Error != nil {
		if utils.HandleDBError(c, result.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao criar DataSource", 500)
		log.Println("[ATENÇÃO] Erro não tratado:", result.Error)
		return
	}

	// Mapeia para a resposta
	resp := DataSourceResponse{
		ID:        dataSource.ID,
		Name:      dataSource.Name,
		DatasetID: dataSource.DatasetID,
		Type:      dataSource.Type,
		ObjectKey: dataSource.ObjectKey,
		Summary:   dataSource.Summary,
	}

	utils.SuccessResponse(c, "DataSource criado com sucesso", resp)
}

// Get_DataSourceByID: Buscar um DataSource pelo seu ID
func GetDataSourceByID(c *gin.Context) {
	dataSourceID := c.Param("id")
	var dataSource models.DataSource

	result := initalizers.DB.First(&dataSource, dataSourceID)
	if result.Error != nil {
		utils.ErrorResponse(c, "DataSource não encontrado", 404)
		return
	}

	// Mapeia para a resposta
	resp := DataSourceResponse{
		ID:        dataSource.ID,
		Name:      dataSource.Name,
		DatasetID: dataSource.DatasetID,
		Type:      dataSource.Type,
		ObjectKey: dataSource.ObjectKey,
		Summary:   dataSource.Summary,
	}
	utils.SuccessResponse(c, "DataSource encontrado", resp)
}

// Update_DataSource: Atualizar um DataSource existente
func UpdateDataSource(c *gin.Context) {
	dataSourceID := c.Param("id")
	var dto UpdateDataSourceDTO

	if err := c.ShouldBindJSON(&dto); err != nil {
		utils.ErrorResponse(c, "Dados inválidos", 400)
		return
	}

	// Verifica se pelo menos um campo foi enviado
	if dto.Name == "" {
		utils.ErrorResponse(c, "Envie pelo menos um campo para atualizar", 400)
		return
	}

	// Busca o DataSource no banco
	var dataSource models.DataSource
	if err := initalizers.DB.First(&dataSource, dataSourceID).Error; err != nil {
		utils.ErrorResponse(c, "DataSource não encontrado", 404)
		return
	}

	// Atualiza os campos fornecidos
	if dto.Name != "" {
		dataSource.Name = dto.Name
	}

	// Salva as alterações
	if err := initalizers.DB.Save(&dataSource).Error; err != nil {
		utils.ErrorResponse(c, "Erro ao atualizar DataSource", 500)
		log.Println("[ATENÇÃO] Erro não tratado:", err)
		return
	}

	// Mapeia para a resposta
	resp := DataSourceResponse{
		ID:        dataSource.ID,
		Name:      dataSource.Name,
		DatasetID: dataSource.DatasetID,
		Type:      dataSource.Type,
		ObjectKey: dataSource.ObjectKey,
		Summary:   dataSource.Summary,
	}
	utils.SuccessResponse(c, "DataSource atualizado com sucesso", resp)
}

// Delete_DataSource: Deletar um DataSource
func DeleteDataSource(c *gin.Context) {
	dataSourceID := c.Param("id")
	var dataSource models.DataSource

	// Busca o DataSource para garantir que ele existe antes de deletar
	findResult := initalizers.DB.First(&dataSource, dataSourceID)
	if findResult.Error != nil {
		utils.ErrorResponse(c, "DataSource não encontrado", 404)
		return
	}

	// Deleta o DataSource (e o GORM cuidará do soft delete, se habilitado)
	deleteResult := initalizers.DB.Delete(&dataSource)
	if deleteResult.Error != nil {
		utils.ErrorResponse(c, "Erro ao deletar DataSource", 500)
		log.Println("[ATENÇÃO] Erro não tratado:", deleteResult.Error)
		return
	}

	utils.SuccessResponse(c, "DataSource deletado com sucesso", gin.H{"id": dataSourceID})
}

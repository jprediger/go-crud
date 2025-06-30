package controllers

import (
	initalizers "go-backend/initializers"
	models "go-backend/models"
	utils "go-backend/utils"
	"log"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
)

// DTOs para Dataset
type CreateDatasetDTO struct {
	Name           string `json:"name" binding:"required"`
	Description    string `json:"description" binding:"omitempty"`
	OrganizationID uint   `json:"organization_id" binding:"required"`
}

type UpdateDatasetDTO struct {
	Name           string `json:"name" binding:"omitempty"`
	Description    string `json:"description" binding:"omitempty"`
	OrganizationID uint   `json:"organization_id" binding:"omitempty"`
}

type DatasetResponse struct {
	ID           uint                 `json:"id"`
	Name         string               `json:"name"`
	Hash         string               `json:"hash"`
	Description  string               `json:"description"`
	Organization OrganizationResponse `json:"organization"`
}

type CreateDatasetResponse struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	Hash           string `json:"hash"`
	Description    string `json:"description"`
	OrganizationId uint   `json:"organization_id"`
}

// Buscar todos os datasets
func GetDatasets(c *gin.Context) {
	var datasets []models.Dataset
	result := initalizers.DB.Preload("Organization").Find(&datasets)
	if result.Error != nil {
		utils.ErrorResponse(c, "Erro ao buscar datasets", 500)
		return
	}
	var resp []DatasetResponse
	for _, dataset := range datasets {
		resp = append(resp, DatasetResponse{
			ID:          dataset.ID,
			Name:        dataset.Name,
			Hash:        dataset.Hash,
			Description: dataset.Description,
			Organization: OrganizationResponse{
				ID:          dataset.Organization.ID,
				Name:        dataset.Organization.Name,
				CNPJ:        dataset.Organization.CNPJ,
				RazaoSocial: dataset.Organization.RazaoSocial,
			},
		})
	}
	utils.SuccessResponse(c, "Datasets encontrados", resp)
}

// Criar um novo dataset
func CreateDataset(c *gin.Context) {
	var dto CreateDatasetDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		if utils.HandleValidationError(c, err) {
			return
		}
		utils.ErrorResponse(c, "Dados inválidos", 500)
		log.Println("[ATENÇÃO] Erro não tratado", err)
		return
	}

	// Gera um hash único para o dataset
	hash := uuid.New().String()

	dataset := models.Dataset{
		Name:           dto.Name,
		Hash:           hash,
		Description:    dto.Description,
		OrganizationID: dto.OrganizationID,
	}

	result := initalizers.DB.Create(&dataset)
	if result.Error != nil {
		if utils.HandleDBError(c, result.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao criar dataset", 500)
		log.Println("[ATENÇÃO] Erro não tratado", result.Error)
		return
	}

	// Mapeia o dataset criado para a resposta
	datasetResponse := CreateDatasetResponse{
		ID:             dataset.ID,
		Name:           dataset.Name,
		Hash:           dataset.Hash,
		Description:    dataset.Description,
		OrganizationId: dataset.OrganizationID,
	}
	utils.SuccessResponse(c, "Dataset criado com sucesso", datasetResponse)
}

// Buscar dataset por ID
func GetDatasetByID(c *gin.Context) {
	datasetID := c.Param("id")
	var dataset models.Dataset

	// Busca o dataset pelo ID e pré-carrega a organização associada
	result := initalizers.DB.Preload("Organization").First(&dataset, datasetID)
	
	if result.Error != nil {
		if utils.HandleDBError(c, result.Error) {
			return
		}
		utils.ErrorResponse(c, "Dataset não encontrado", 404)
		log.Println("[ATENÇÃO] Erro não tratado", result.Error)
		return
	}

	// Mapeia o dataset encontrado para a resposta
	datasetResponse := DatasetResponse{
		ID:          dataset.ID,
		Name:        dataset.Name,
		Hash:        dataset.Hash,
		Description: dataset.Description,
		Organization: OrganizationResponse{
			ID:          dataset.Organization.ID,
			Name:        dataset.Organization.Name,
			CNPJ:        dataset.Organization.CNPJ,
			RazaoSocial: dataset.Organization.RazaoSocial,
		},
	}
	utils.SuccessResponse(c, "Dataset encontrado", datasetResponse)
}

// Atualizar dataset existente
func UpdateDataset(c *gin.Context) {
	datasetID := c.Param("id")
	var dto UpdateDatasetDTO

	// Extrai dados do body
	if err := c.ShouldBindJSON(&dto); err != nil {
		if utils.HandleValidationError(c, err) {
			return
		}
		utils.ErrorResponse(c, "Dados inválidos", 500)
		return
	}

	// Verifica se pelo menos um campo foi enviado
	if dto.Name == "" && dto.Description == "" && dto.OrganizationID == 0 {
		utils.ErrorResponse(c, "Envie pelo menos um campo para atualizar", 400)
		return
	}

	// Valida se o ID do usuário é válido
	var dataset models.Dataset
	result := initalizers.DB.First(&dataset, datasetID)
	if result.Error != nil {
		if utils.HandleDBError(c, result.Error) {
			return
		}
		utils.ErrorResponse(c, "Dataset não encontrado", 404)
		log.Println("[ATENÇÃO] Erro não tratado", result.Error)
		return
	}

	// Atualiza somente os campos que foram passados no DTO
	if dto.Name != "" {
		dataset.Name = dto.Name
	}
	if dto.Description != "" {
		dataset.Description = dto.Description
	}
	if dto.OrganizationID != 0 {
		dataset.OrganizationID = dto.OrganizationID
	}

	// Realiza a atualização do dataset
	saveResult := initalizers.DB.Save(&dataset)
	if saveResult.Error != nil {
		if utils.HandleDBError(c, saveResult.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao atualizar dataset", 500)
		log.Println("[ATENÇÃO] Erro não tratado", saveResult.Error)
		return
	}

	// Mapeia o dataset atualizado para a resposta
	datasetResponse := CreateDatasetResponse{
		ID:             dataset.ID,
		Name:           dataset.Name,
		Hash:           dataset.Hash,
		Description:    dataset.Description,
		OrganizationId: dataset.OrganizationID,
	}
	utils.SuccessResponse(c, "Dataset atualizado com sucesso", datasetResponse)
}

// Deletar dataset existente
func DeleteDataset(c *gin.Context) {
	datasetID := c.Param("id")
	var dataset models.Dataset
	result := initalizers.DB.First(&dataset, datasetID)

	// Verifica se o dataset existe e valida erros
	if result.Error != nil {
		if utils.HandleDBError(c, result.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao deletar dataset", 500)
		log.Println("[ATENÇÃO] Erro não tratado", result.Error)
		return
	}

	// Deleta o dataset
	deleteResult := initalizers.DB.Delete(&dataset)
	if deleteResult.Error != nil {
		if utils.HandleDBError(c, deleteResult.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao deletar dataset", 500)
		log.Println("[ATENÇÃO] Erro não tratado", deleteResult.Error)
		return
	}

	// Mapeia o dataset deletado para a resposta
	datasetResponse := CreateDatasetResponse{
		ID:             dataset.ID,
		Name:           dataset.Name,
		Hash:           dataset.Hash,
		Description:    dataset.Description,
		OrganizationId: dataset.OrganizationID,
	}

	utils.SuccessResponse(c, "Dataset deletado com sucesso", &datasetResponse)
}

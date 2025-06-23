package controllers

import (
	initalizers "go-backend/initializers"
	models "go-backend/models"
	utils "go-backend/utils"
	"log"

	"github.com/gin-gonic/gin"
)

// DTO para criar uma Organização
type CreateOrganizationDTO struct {
	Name        string `json:"name" binding:"required"`
	CNPJ        string `json:"cnpj" binding:"required"`
	RazaoSocial string `json:"razao_social" binding:"required"`
}

// DTO para atualizar uma Organização
type UpdateOrganizationDTO struct {
	Name        string `json:"name" binding:"omitempty"`
	CNPJ        string `json:"cnpj" binding:"omitempty"`
	RazaoSocial string `json:"razao_social" binding:"omitempty"`
}

// DTO de resposta
type OrganizationResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	CNPJ        string `json:"cnpj"`
	RazaoSocial string `json:"razao_social"`
}

// Criar uma nova Organização
func CreateOrganization(c *gin.Context) {
	var dto CreateOrganizationDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		if utils.HandleValidationError(c, err) {
			return
		}
		utils.ErrorResponse(c, "Dados inválidos", 400)
		log.Println("[ATENÇÃO] Erro não tratado", err)
		return
	}

	org := models.Organization{
		Name:        dto.Name,
		CNPJ:        dto.CNPJ,
		RazaoSocial: dto.RazaoSocial,
	}

	result := initalizers.DB.Create(&org)
	if result.Error != nil {
		if utils.HandleDBError(c, result.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao criar organização", 500)
		log.Println("[ATENÇÃO] Erro não tratado", result.Error)
		return
	}

	resp := OrganizationResponse{
		ID:          org.ID,
		Name:        org.Name,
		CNPJ:        org.CNPJ,
		RazaoSocial: org.RazaoSocial,
	}

	utils.SuccessResponse(c, "Organização criada com sucesso", resp)
}

// Buscar todas as Organizações
func GetOrganizations(c *gin.Context) {
	var orgs []models.Organization
	result := initalizers.DB.Find(&orgs)
	if result.Error != nil {
		utils.ErrorResponse(c, "Erro ao buscar organizações", 500)
		return
	}

	var resp []OrganizationResponse
	for _, org := range orgs {
		resp = append(resp, OrganizationResponse{
			ID:          org.ID,
			Name:        org.Name,
			CNPJ:        org.CNPJ,
			RazaoSocial: org.RazaoSocial,
		})
	}
	utils.SuccessResponse(c, "Organizações encontradas", resp)
}

// Buscar uma Organização por ID
func GetOrganizationByID(c *gin.Context) {
	orgID := c.Param("id")
	var org models.Organization
	result := initalizers.DB.First(&org, orgID)
	if result.Error != nil {
		utils.ErrorResponse(c, "Organização não encontrada", 404)
		return
	}

	resp := OrganizationResponse{
		ID:          org.ID,
		Name:        org.Name,
		CNPJ:        org.CNPJ,
		RazaoSocial: org.RazaoSocial,
	}
	utils.SuccessResponse(c, "Organização encontrada", resp)
}

// Atualizar uma Organização
func UpdateOrganization(c *gin.Context) {
	orgID := c.Param("id")
	var dto UpdateOrganizationDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		if utils.HandleValidationError(c, err) {
			return
		}
		utils.ErrorResponse(c, "Dados inválidos", 400)
		return
	}

	var org models.Organization
	result := initalizers.DB.First(&org, orgID)
	if result.Error != nil {
		utils.ErrorResponse(c, "Organização não encontrada", 404)
		return
	}

	if dto.Name != "" {
		org.Name = dto.Name
	}
	if dto.CNPJ != "" {
		org.CNPJ = dto.CNPJ
	}
	if dto.RazaoSocial != "" {
		org.RazaoSocial = dto.RazaoSocial
	}

	saveResult := initalizers.DB.Save(&org)
	if saveResult.Error != nil {
		if utils.HandleDBError(c, saveResult.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao atualizar organização", 500)
		log.Println("[ATENÇÃO] Erro não tratado", saveResult.Error)
		return
	}

	resp := OrganizationResponse{
		ID:          org.ID,
		Name:        org.Name,
		CNPJ:        org.CNPJ,
		RazaoSocial: org.RazaoSocial,
	}
	utils.SuccessResponse(c, "Organização atualizada com sucesso", resp)
}

// Deletar uma Organização
func DeleteOrganization(c *gin.Context) {
	orgID := c.Param("id")
	var org models.Organization
	result := initalizers.DB.First(&org, orgID)
	if result.Error != nil {
		utils.ErrorResponse(c, "Organização não encontrada", 404)
		return
	}

	deleteResult := initalizers.DB.Delete(&org)
	if deleteResult.Error != nil {
		if utils.HandleDBError(c, deleteResult.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao deletar organização", 500)
		log.Println("[ATENÇÃO] Erro não tratado", deleteResult.Error)
		return
	}

	resp := OrganizationResponse{
		ID:          org.ID,
		Name:        org.Name,
		CNPJ:        org.CNPJ,
		RazaoSocial: org.RazaoSocial,
	}
	utils.SuccessResponse(c, "Organização deletada com sucesso", &resp)
}

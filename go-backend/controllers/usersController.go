package controllers

import (
	initalizers "go-backend/initializers"
	models "go-backend/models"
	utils "go-backend/utils"
	"log"

	"github.com/gin-gonic/gin"
)

// CreateUserDTO é o Data Transfer Object para criar um usuário, utilizado para validar os dados recebidos na requisição
type CreateUserDTO struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=admin user"`
}

type UpdateUserDTO struct {
	Username string `json:"username" binding:"omitempty"`
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"omitempty,min=6"`
	Role     string `json:"role" binding:"omitempty,oneof=admin user"`
}

type UserResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

// Controller para criar um novo usuário no banco de dados
func CreateUser(c *gin.Context) {

	// Extrai dados do body e valida
	var dto CreateUserDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		if utils.HandleValidationError(c, err) {
			return
		}
		utils.ErrorResponse(c, "Dados inválidos", 500)
		log.Println("[ATENÇÃO] Erro não tratado", err)
		return
	}
	// Mapeia os dados do DTO para o modelo User
	user := models.User{
		Username: dto.Username,
		Email:    dto.Email,
		Password: dto.Password,
		Role:     dto.Role,
	}

	// Cria o usuário no banco de dados e verifica se houve erro
	result := initalizers.DB.Create(&user)
	if result.Error != nil {
		if utils.HandleDBError(c, result.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao criar usuário", 500)
		log.Println("[ATENÇÃO] Erro não tratado", result.Error)
		return
	}

	// Mapeia o usuário criado para a resposta
	userResponse := UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	}

	// Retorna o usuário criado
	utils.SuccessResponse(c, "Usuário criado com sucesso", userResponse)
}

// Controller para buscar todos os usuários do banco de dados
func GetUsers(c *gin.Context) {
	// Busca todos os usuários no banco de dados
	var users []models.User
	result := initalizers.DB.Find(&users)
	if result.Error != nil {
		utils.ErrorResponse(c, "Erro ao buscar usuários", 500)
		return
	}
	// Mapeia os usuários encontrados para a resposta
	var resp []UserResponse
	for _, user := range users {
		resp = append(resp, UserResponse{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			Role:     user.Role,
		})
	}
	// Retorna a lista de usuários
	utils.SuccessResponse(c, "Usuários encontrados", resp)
}

// Controller para buscar um usuário específico pelo ID
func GetUserByID(c *gin.Context) {
	// Extrai o ID do usuário da rota
	userID := c.Param("id")

	// Busca o usuário pelo ID no banco de dados
	var user models.User
	result := initalizers.DB.First(&user, userID)
	if result.Error != nil {
		utils.ErrorResponse(c, "Usuário não encontrado", 404)
		return
	}
	// Mapeia o usuário encontrado para a resposta
	userResponse := UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	}

	// Retorna o usuário encontrado
	utils.SuccessResponse(c, "Usuário encontrado", userResponse)
}

// Controller para atualizar um usuário existente
func UpdateUser(c *gin.Context) {
	// Extrai o ID do usuário da rota
	userID := c.Param("id")

	// Extrai dados do body e valida
	var dto UpdateUserDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		if utils.HandleValidationError(c, err) {
			return
		}
		utils.ErrorResponse(c, "Dados inválidos", 500)
		return
	}

	// Busca o usuário pelo ID no banco de dados
	var user models.User
	result := initalizers.DB.First(&user, userID)
	if result.Error != nil {
		utils.ErrorResponse(c, "Usuário não encontrado", 404)
		return
	}

	// Atualiza somente os campos que foram passados no DTO
	if dto.Username != "" {
		user.Username = dto.Username
	}
	if dto.Email != "" {
		user.Email = dto.Email
	}
	if dto.Password != "" {
		user.Password = dto.Password
	}
	if dto.Role != "" {
		user.Role = dto.Role
	}

	// Salva as alterações no banco de dados
	saveResult := initalizers.DB.Save(&user)
	if saveResult.Error != nil {
		if utils.HandleDBError(c, saveResult.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao atualizar usuário", 500)
		log.Println("[ATENÇÃO] Erro não tratado", saveResult.Error)
	}

	// Mapeia o usuário atualizado para a resposta
	userResponse := UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	}

	// Retorna o usuário atualizado
	utils.SuccessResponse(c, "Usuário atualizado com sucesso", userResponse)
}

// Controller para deletar um usuário existente
func DeleteUser(c *gin.Context) {
	// Extrai o ID do usuário da rota
	userID := c.Param("id")

	// Busca o usuário pelo ID no banco de dados
	var user models.User
	result := initalizers.DB.First(&user, userID)
	if result.Error != nil {
		utils.ErrorResponse(c, "Usuário não encontrado", 404)
		return
	}

	// Deleta o usuário do banco de dados
	deleteResponse := initalizers.DB.Delete(&user)
	if deleteResponse.Error != nil {
		if utils.HandleDBError(c, deleteResponse.Error) {
			return
		}
		utils.ErrorResponse(c, "Erro ao deletar usuário", 500)
		log.Println("[ATENÇÃO] Erro não tratado", deleteResponse.Error)
		return
	}

	// Mapeia o usuário deletado para a resposta
	userResponse := UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	}

	// Retorna uma mensagem de sucesso
	utils.SuccessResponse(c, "Usuário deletado com sucesso", &userResponse)
}

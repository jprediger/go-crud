package models

import (
	"gorm.io/gorm"
)

type Dataset struct {
	gorm.Model
	Name           string       `gorm:"not null"`        // Nome do Dataset
	Hash           string       `gorm:"not null;unique"` // Hash único do Dataset
	UserID         string       `gorm:"not null;index"`  // Sub do usuário cognito
	OrganizationID uint         // ID da organização a qual o Dataset pertence
	Organization   Organization // Organização a qual o Dataset pertence
	Description    string       // Descrição do Dataset
}

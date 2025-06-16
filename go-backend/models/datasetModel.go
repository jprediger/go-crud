package models

import (
	"gorm.io/gorm"
)

type Dataset struct {
	gorm.Model
	Name        string `gorm:"not null"`          // Nome do Dataset
	Hash        string `gorm:"not null;unique"`   // Hash único do Dataset
	UserID      uint   `gorm:"not null;index"`    // ID do usuário que criou o Dataset
	User        User   `gorm:"foreignKey:UserID"` // Usuário que criou o Dataset
	Description string // Descrição do Dataset
}

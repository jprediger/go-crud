package models

import (
	"gorm.io/gorm"
)

type Organization struct {
	gorm.Model
	Name        string `gorm:"not null"`        // Nome da organização
	CNPJ        string `gorm:"not null;unique"` // CNPJ da organização (único)
	RazaoSocial string `gorm:"not null"`        // Razão social da organização
}

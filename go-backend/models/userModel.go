package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string    `gorm:"not null"`                // Nome de usuário único
	Email    string    `gorm:"not null;"`               // Email único do usuário
	Password string    `gorm:"not null"`                // Senha do usuário (deve ser armazenada de forma segura, por exemplo, com hash)
	Role     string    `gorm:"not null;default:'user'"` // Papel do usuário (ex: 'user', 'admin')
	Datasets []Dataset `gorm:"foreignKey:UserID"`       // Lista de Datasets que o usuario tem acesso
}

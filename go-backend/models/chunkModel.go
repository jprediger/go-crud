package models

import (
	"github.com/pgvector/pgvector-go"
	"gorm.io/gorm"
)

type Chunk struct {
	gorm.Model
	DataSourceID uint            `gorm:"not null;index"`
	Content      string          `gorm:"type:text;not null"`
	Embedding    pgvector.Vector `gorm:"type:vector(1536)"`
}

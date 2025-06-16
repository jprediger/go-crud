package models

import (
	"github.com/pgvector/pgvector-go"
	"gorm.io/gorm"
)

type DataSource struct {
	gorm.Model
	Name             string          `gorm:"not null"`                // Nome do DataSource
	Hash             string          `gorm:"not null;unique"`         // Hash único do DataSource
	DatasetID        uint            `gorm:"not null;index"`          // ID do Dataset ao qual este DataSource pertence
	Type             string          `gorm:"not null"`                // Tipo do DataSource (ex: "web", "pdf", "docx", etc.)
	Summary          *string         `gorm:"type:text"`               // Campo para guardar um resumo do conteúdo do DataSource
	SummaryEmbedding pgvector.Vector `gorm:"type:vector(1536)"`       // Embedding do resumo para consulta
	Chunks           []Chunk         `gorm:"foreignKey:DataSourceID"` // Chunks associados a este DataSource
}

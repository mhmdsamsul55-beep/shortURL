package model

import "time"

type URL struct {
	ID          string    `json:"id" gorm:"primaryKey;type:varchar(32)"`
	OriginalURL string    `json:"original_url" gorm:"type:text;not null"`
	ShortCode   string    `json:"short_code" gorm:"size:30;uniqueIndex;not null"`
	ClickCount  int       `json:"click_count" gorm:"not null;default:0"`
	CreatedAt   time.Time `json:"created_at"`
}

func (URL) TableName() string {
	return "shortlinks"
}

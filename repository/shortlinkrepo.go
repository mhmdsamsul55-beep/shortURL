package repository

import (
	"errors"

	"ProjectShortLink/model"

	"gorm.io/gorm"
)

var ErrNotFound = errors.New("shortlink tidak ditemukan")

type ShortlinkRepository struct {
	db *gorm.DB
}

func NewShortLinkRepo(db *gorm.DB) *ShortlinkRepository {
	return &ShortlinkRepository{db: db}
}

func (r *ShortlinkRepository) Create(shortlink model.URL) error {
	return r.db.Create(&shortlink).Error
}

func (r *ShortlinkRepository) FindByShortCode(code string) (model.URL, error) {
	var shortlink model.URL
	err := r.db.Where("short_code = ?", code).First(&shortlink).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return model.URL{}, ErrNotFound
	}
	return shortlink, err
}

func (r *ShortlinkRepository) FindAll() ([]model.URL, error) {
	var shortlinks []model.URL
	err := r.db.Order("created_at DESC").Find(&shortlinks).Error
	return shortlinks, err
}

func (r *ShortlinkRepository) DeleteByID(id string) error {
	result := r.db.Delete(&model.URL{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *ShortlinkRepository) IncrementClick(code string) error {
	result := r.db.Model(&model.URL{}).
		Where("short_code = ?", code).
		UpdateColumn("click_count", gorm.Expr("click_count + ?", 1))
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

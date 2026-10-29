package repository

import (
	"ProjectShortLink/model"
	"errors"
)

type ShortlinkRepository struct {
	data []model.URL
}

func NewShortLinkRepo() *ShortlinkRepository {
	return &ShortlinkRepository{
		data: make([]model.URL, 0),
	}
}

// create
func (r *ShortlinkRepository) Create(url model.URL) error {
	for _, item := range r.data {
		if item.ShortCode == url.ShortCode {
			return errors.New("short code sudah digunakan")
		}
	}
	r.data = append(r.data, url)
	return nil
}

// mencari url berdasarkan dengan code
func (r *ShortlinkRepository) FindbyShortCode(code string) (model.URL, bool) {
	for _, item := range r.data {
		if item.ShortCode == code {
			return item, true
		}
	}
	return model.URL{}, false
}

// mencari semua url
func (r *ShortlinkRepository) FindAll() []model.URL {
	result := make([]model.URL, len(r.data))
	copy(result, r.data)
	return result
}

// Menghapus URL berdasarkan id
func (r *ShortlinkRepository) DeleteByID(id string) bool {
	for i, item := range r.data {
		if item.ID == id {
			r.data = append(r.data[:i], r.data[i+1:]...)
			return true
		}
	}
	return false
}

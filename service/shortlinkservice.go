package service

import (
	"ProjectShortLink/model"
	"ProjectShortLink/repository"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"net/url"
	"strings"
)

type ShortlinkService struct {
	repo *repository.ShortlinkRepository
}

func NewShortlinkService(repo *repository.ShortlinkRepository) *ShortlinkService {
	return &ShortlinkService{
		repo: repo,
	}
}

func (s *ShortlinkService) CreateShortlink(originalURL string) (model.URL, error) {
	parsedURL, err := url.ParseRequestURI(strings.TrimSpace(originalURL))
	if err != nil || parsedURL.Hostname() == "" || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		return model.URL{}, errors.New("URL harus menggunakan http atau https yang valid")
	}

	idBytes := make([]byte, 16)
	if _, err := rand.Read(idBytes); err != nil {
		return model.URL{}, err
	}

	codeBytes := make([]byte, 6)
	if _, err := rand.Read(codeBytes); err != nil {
		return model.URL{}, err
	}

	shortlink := model.URL{
		ID:          hex.EncodeToString(idBytes),
		OriginalURL: strings.TrimSpace(originalURL),
		ShortCode:   base64.RawURLEncoding.EncodeToString(codeBytes),
	}
	if err := s.repo.Create(shortlink); err != nil {
		return model.URL{}, err
	}

	return shortlink, nil
}

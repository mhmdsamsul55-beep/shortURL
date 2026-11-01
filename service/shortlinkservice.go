package service

import (
	"ProjectShortLink/model"
	"ProjectShortLink/repository"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"net/url"
	"regexp"
	"strings"
)

type ShortlinkService struct {
	repo *repository.ShortlinkRepository
}

var customCodePattern = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)

func NewShortlinkService(repo *repository.ShortlinkRepository) *ShortlinkService {
	return &ShortlinkService{
		repo: repo,
	}
}

func (s *ShortlinkService) CreateShortlink(originalURL string) (model.URL, error) {
	return s.CreateShortlinkWithCode(originalURL, "")
}

func (s *ShortlinkService) CreateShortlinkWithCode(originalURL, customCode string) (model.URL, error) {
	parsedURL, err := url.ParseRequestURI(strings.TrimSpace(originalURL))
	if err != nil || parsedURL.Hostname() == "" || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		return model.URL{}, errors.New("URL harus menggunakan http atau https yang valid")
	}

	customCode = strings.TrimSpace(customCode)
	if customCode != "" && !customCodePattern.MatchString(customCode) {
		return model.URL{}, errors.New("custom code hanya boleh berisi huruf, angka, - dan _")
	}

	idBytes := make([]byte, 16)
	if _, err := rand.Read(idBytes); err != nil {
		return model.URL{}, err
	}

	shortCode := customCode
	if shortCode == "" {
		codeBytes := make([]byte, 6)
		if _, err := rand.Read(codeBytes); err != nil {
			return model.URL{}, err
		}
		shortCode = base64.RawURLEncoding.EncodeToString(codeBytes)
	}

	shortlink := model.URL{
		ID:          hex.EncodeToString(idBytes),
		OriginalURL: strings.TrimSpace(originalURL),
		ShortCode:   shortCode,
	}
	if err := s.repo.Create(shortlink); err != nil {
		return model.URL{}, err
	}

	return shortlink, nil
}
func (s *ShortlinkService) RedirectURL(code string) (model.URL, error) {
	if err := s.repo.IncrementClick(code); err != nil {
		return model.URL{}, err
	}
	return s.repo.FindByShortCode(code)
}
func (s *ShortlinkService) GetAllShortlinks() ([]model.URL, error) {
	return s.repo.FindAll()
}

func (s *ShortlinkService) DeleteShortlink(id string) error {
	return s.repo.DeleteByID(id)
}

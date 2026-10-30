package handler

import (
	"ProjectShortLink/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ShortlinkHandler struct {
	service *service.ShortlinkService
}

func NewShortlinkHandler(s *service.ShortlinkService) *ShortlinkHandler {
	return &ShortlinkHandler{
		service: s,
	}
}

type CreateShortlinkRequest struct {
	URL        string `json:"url" binding:"required"`
	CustomCode string `json:"custom_code"`
}

func (handle *ShortlinkHandler) Create(c *gin.Context) {
	var req CreateShortlinkRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "request tidak valid",
			"error":   err.Error(),
		})
		return
	}
	result, err := handle.service.CreateShortlink(req.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message":      "Shortlink berhasil dibuat",
		"id":           result.ID,
		"original_url": result.OriginalURL,
		"short_code":   result.ShortCode,
		"short_url":    "http://localhost:8080/" + result.ShortCode,
		"click_count":  result.ClickCount,
	})
}

package controllerhandle

import (
	"ProjectShortLink/handler"

	"github.com/gin-gonic/gin"
)

func CreateShort(shortlinkHandler *handler.ShortlinkHandler) gin.HandlerFunc {
	return shortlinkHandler.Create
}

func GetAllShort(shortlinkHandler *handler.ShortlinkHandler) gin.HandlerFunc {
	return shortlinkHandler.GetAll
}

func RedirectShort(shortlinkHandler *handler.ShortlinkHandler) gin.HandlerFunc {
	return shortlinkHandler.Redirect
}

func DeleteShort(shortlinkHandler *handler.ShortlinkHandler) gin.HandlerFunc {
	return shortlinkHandler.Delete
}

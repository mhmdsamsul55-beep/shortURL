package api

import (
	"ProjectShortLink/controller/controllerhandle"
	"ProjectShortLink/handler"

	"github.com/gin-gonic/gin"
)

func ApiShort(api *gin.Engine, shortlinkHandler *handler.ShortlinkHandler) {
	apipage := api.Group("/api")
	apipage.POST("/urls", controllerhandle.CreateShort(shortlinkHandler))
	apipage.GET("/urls", controllerhandle.GetAllShort(shortlinkHandler))
	apipage.GET("/:code", controllerhandle.RedirectShort(shortlinkHandler))
	apipage.DELETE("/urls/:id", controllerhandle.DeleteShort(shortlinkHandler))
}

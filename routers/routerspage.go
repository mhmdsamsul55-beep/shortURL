package routers

import (
	"ProjectShortLink/controller/controllerpage"

	"github.com/gin-gonic/gin"
)

func RoutersPage(router *gin.Engine) {
	router.GET("/shortlink", controllerpage.ShortLinkPage)
	// Create Shortlink
}

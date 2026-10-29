package api

import "github.com/gin-gonic/gin"

func ApiShort(api *gin.Engine) {

	apipage := api.Group("/api")
	apipage.GET("")
}
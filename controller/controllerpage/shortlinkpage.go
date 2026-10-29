package controllerpage

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ShortLinkPage(c *gin.Context) {
	c.HTML(http.StatusOK, "shortlinkpage.html", gin.H{})
}

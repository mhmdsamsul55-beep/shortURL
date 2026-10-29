package main

import (
	"ProjectShortLink/api"
	"ProjectShortLink/routers"

	"github.com/gin-gonic/gin"
)

func main() {

	router := gin.Default()
	router.LoadHTMLGlob("views/*.html")
	router.Static("static", "./static")

	routers.RoutersPage(router)
	api.ApiShort(router)

	router.Run(":3000")

}

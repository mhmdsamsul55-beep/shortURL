package main

import (
	"ProjectShortLink/api"
	"ProjectShortLink/config"
	"ProjectShortLink/handler"
	"ProjectShortLink/mysql"
	"ProjectShortLink/repository"
	"ProjectShortLink/routers"
	"ProjectShortLink/service"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	_ = godotenv.Load(".env")

	mysql.ConnectDB()
	config.InitSessionStore()

	router := gin.Default()
	repo := repository.NewShortLinkRepo()

	shortlinkService := service.NewShortlinkService(repo)
	shortlinkHandler := handler.NewShortlinkHandler(shortlinkService)
	
	router.POST("/api/urls", shortlinkHandler.Create)
	router.LoadHTMLGlob("views/*.html")
	router.Static("static", "./static")

	routers.RoutersPage(router)
	api.ApiShort(router)

	router.Run(":3000")

}

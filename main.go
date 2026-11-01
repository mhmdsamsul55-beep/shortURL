package main

import (
	"ProjectShortLink/api"
	"ProjectShortLink/config"
	"ProjectShortLink/handler"
	"ProjectShortLink/mysql"
	"ProjectShortLink/repository"
	"ProjectShortLink/routers"
	"ProjectShortLink/service"

	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	_ = godotenv.Load(".env")

	db, err := mysql.ConnectDB()
	if err != nil {
		log.Fatal(err)
	}
	config.InitSessionStore()

	router := gin.Default()

	repo := repository.NewShortLinkRepo(db)

	shortlinkService := service.NewShortlinkService(repo)
	shortlinkHandler := handler.NewShortlinkHandler(shortlinkService)

	router.LoadHTMLGlob("views/*.html")
	router.Static("static", "./static")

	routers.RoutersPage(router)
	api.ApiShort(router, shortlinkHandler)

	if err := router.Run(":3000"); err != nil {
		log.Fatal(err)
	}

}

package main

import (
	"locker-system/database"
	"locker-system/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/lockers", handlers.GetLockers)
		api.POST("/lockers/:code/deposit", handlers.DepositLocker)
		api.POST("/lockers/pickup", handlers.PickupLocker)
	}

	r.Run(":8080")
}

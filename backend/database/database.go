package database

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"locker-system/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("locker.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(&models.Locker{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	seedLockers()
}

func seedLockers() {
	var count int64
	DB.Model(&models.Locker{}).Count(&count)
	if count > 0 {
		return
	}

	now := time.Now().Unix()
	letters := []string{"A", "B"}
	for _, letter := range letters {
		for i := 1; i <= 10; i++ {
			code := fmt.Sprintf("%s%02d", letter, i)
			locker := models.Locker{
				Code:      code,
				Status:    models.StatusAvailable,
				CreatedAt: now,
				UpdatedAt: now,
			}
			DB.Create(&locker)
		}
	}
	log.Println("Initialized 20 lockers (A01-A10, B01-B10)")
}

func GeneratePickupCode() string {
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	return code
}

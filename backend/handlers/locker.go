package handlers

import (
	"net/http"
	"time"

	"locker-system/database"
	"locker-system/models"

	"github.com/gin-gonic/gin"
)

func GetLockers(c *gin.Context) {
	var lockers []models.Locker
	database.DB.Find(&lockers)
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    lockers,
	})
}

type DepositRequest struct {
	TrackingNumber string `json:"tracking_number" binding:"required"`
	Phone          string `json:"phone" binding:"required"`
}

func DepositLocker(c *gin.Context) {
	code := c.Param("code")

	var locker models.Locker
	if err := database.DB.Where("code = ?", code).First(&locker).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "格子不存在",
		})
		return
	}

	if locker.Status == models.StatusOccupied {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "格子已被占用",
		})
		return
	}

	var req DepositRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	pickupCode := database.GeneratePickupCode()
	now := time.Now().Unix()

	updates := map[string]interface{}{
		"status":          models.StatusOccupied,
		"tracking_number": &req.TrackingNumber,
		"phone":           &req.Phone,
		"pickup_code":     &pickupCode,
		"updated_at":      now,
	}

	database.DB.Model(&locker).Updates(updates)

	var updatedLocker models.Locker
	database.DB.Where("code = ?", code).First(&updatedLocker)

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "存件成功",
		"data": gin.H{
			"code":            updatedLocker.Code,
			"pickup_code":     pickupCode,
			"tracking_number": req.TrackingNumber,
			"phone":           req.Phone,
		},
	})
}

type PickupRequest struct {
	PickupCode string `json:"pickup_code" binding:"required"`
}

func PickupLocker(c *gin.Context) {
	var req PickupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	var locker models.Locker
	if err := database.DB.Where("pickup_code = ?", req.PickupCode).First(&locker).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "取件码错误",
		})
		return
	}

	if locker.Status != models.StatusOccupied {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "格子状态异常",
		})
		return
	}

	now := time.Now().Unix()

	updates := map[string]interface{}{
		"status":          models.StatusAvailable,
		"tracking_number": nil,
		"phone":           nil,
		"pickup_code":     nil,
		"updated_at":      now,
	}

	database.DB.Model(&locker).Updates(updates)

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "取件成功",
		"data": gin.H{
			"code": locker.Code,
		},
	})
}

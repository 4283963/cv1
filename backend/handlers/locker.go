package handlers

import (
	"net/http"
	"time"

	"locker-system/database"
	"locker-system/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetLockers(c *gin.Context) {
	var lockers []models.Locker
	if err := database.DB.Order("code ASC").Find(&lockers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "查询失败",
		})
		return
	}
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

	var req DepositRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "参数错误",
		})
		return
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "服务器错误",
		})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var locker models.Locker
	if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("code = ?", code).First(&locker).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "格子不存在",
		})
		return
	}

	if locker.Status == models.StatusOccupied {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "格子已被占用",
		})
		return
	}

	pickupCode := database.GeneratePickupCode()
	now := time.Now().Unix()

	locker.Status = models.StatusOccupied
	locker.TrackingNumber = &req.TrackingNumber
	locker.Phone = &req.Phone
	locker.PickupCode = &pickupCode
	locker.UpdatedAt = now

	if err := tx.Save(&locker).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "存件失败",
		})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "提交失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "存件成功",
		"data": gin.H{
			"code":            locker.Code,
			"pickup_code":     pickupCode,
			"tracking_number": req.TrackingNumber,
			"phone":           req.Phone,
			"status":          locker.Status,
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

	tx := database.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "服务器错误",
		})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var locker models.Locker
	if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("pickup_code = ?", req.PickupCode).First(&locker).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"code":    404,
				"message": "取件码错误或已失效",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code":    500,
				"message": "查询失败",
			})
		}
		return
	}

	if locker.Status != models.StatusOccupied {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "格子状态异常",
		})
		return
	}

	now := time.Now().Unix()

	locker.Status = models.StatusAvailable
	locker.TrackingNumber = nil
	locker.Phone = nil
	locker.PickupCode = nil
	locker.UpdatedAt = now

	if err := tx.Save(&locker).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "取件失败",
		})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "提交失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "取件成功，柜门已打开",
		"data": gin.H{
			"code":   locker.Code,
			"status": locker.Status,
		},
	})
}

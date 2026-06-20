package scheduler

import (
	"log"
	"time"

	"locker-system/database"
	"locker-system/models"
)

const (
	overdueThreshold = 24 * time.Hour
	checkInterval    = 1 * time.Hour
)

func StartOverdueChecker() {
	log.Println("Starting overdue checker scheduler...")

	go func() {
		checkOverdueLockers()

		ticker := time.NewTicker(checkInterval)
		defer ticker.Stop()

		for range ticker.C {
			checkOverdueLockers()
		}
	}()
}

func checkOverdueLockers() {
	now := time.Now().Unix()
	threshold := now - int64(overdueThreshold.Seconds())

	var lockers []models.Locker
	if err := database.DB.Where(
		"status = ? AND deposited_at IS NOT NULL AND deposited_at < ?",
		models.StatusOccupied,
		threshold,
	).Find(&lockers).Error; err != nil {
		log.Printf("Failed to query overdue lockers: %v", err)
		return
	}

	if len(lockers) == 0 {
		log.Println("No overdue lockers found")
		return
	}

	count := 0
	for _, locker := range lockers {
		tx := database.DB.Begin()
		if tx.Error != nil {
			log.Printf("Failed to begin transaction for locker %s: %v", locker.Code, tx.Error)
			continue
		}

		var l models.Locker
		if err := tx.Set("gorm:query_option", "FOR UPDATE").
			Where("id = ?", locker.ID).First(&l).Error; err != nil {
			tx.Rollback()
			log.Printf("Failed to lock locker %s: %v", locker.Code, err)
			continue
		}

		if l.Status != models.StatusOccupied {
			tx.Rollback()
			continue
		}

		l.Status = models.StatusOverdue
		l.UpdatedAt = now

		if err := tx.Save(&l).Error; err != nil {
			tx.Rollback()
			log.Printf("Failed to update locker %s to overdue: %v", locker.Code, err)
			continue
		}

		if err := tx.Commit().Error; err != nil {
			log.Printf("Failed to commit transaction for locker %s: %v", locker.Code, err)
			continue
		}

		count++
		log.Printf("Locker %s marked as overdue (deposited at: %s)",
			locker.Code,
			time.Unix(*locker.DepositedAt, 0).Format("2006-01-02 15:04:05"))
	}

	log.Printf("Overdue check completed: %d lockers marked as overdue", count)
}

func MarkLockerOverdueForTesting(code string) error {
	var locker models.Locker
	if err := database.DB.Where("code = ?", code).First(&locker).Error; err != nil {
		return err
	}

	now := time.Now().Unix()
	pastTime := now - int64(25*time.Hour.Seconds())

	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	var l models.Locker
	if err := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("id = ?", locker.ID).First(&l).Error; err != nil {
		tx.Rollback()
		return err
	}

	if l.Status != models.StatusOccupied {
		tx.Rollback()
		log.Printf("Locker %s is not occupied, cannot mark as overdue", code)
		return nil
	}

	l.Status = models.StatusOverdue
	l.DepositedAt = &pastTime
	l.UpdatedAt = now

	if err := tx.Save(&l).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	log.Printf("Locker %s manually marked as overdue for testing", code)
	return nil
}

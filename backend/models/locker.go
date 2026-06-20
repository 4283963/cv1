package models

import (
	"gorm.io/gorm"
)

type Locker struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Code           string         `gorm:"uniqueIndex;size:10" json:"code"`
	Status         string         `gorm:"size:20;default:available" json:"status"`
	TrackingNumber *string        `gorm:"size:50" json:"tracking_number,omitempty"`
	Phone          *string        `gorm:"size:20" json:"phone,omitempty"`
	PickupCode     *string        `gorm:"size:6" json:"pickup_code,omitempty"`
	DepositedAt    *int64         `json:"deposited_at,omitempty"`
	CreatedAt      int64          `json:"created_at"`
	UpdatedAt      int64          `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

const (
	StatusAvailable = "available"
	StatusOccupied  = "occupied"
	StatusOverdue   = "overdue"
)

package mysql

import (
	"context"
	"errors"
	"fmt"
	"os"

	"ProjectShortLink/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectDB() (*gorm.DB, error) {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	if host == "" || port == "" || user == "" || dbname == "" {
		return nil, errors.New("konfigurasi DB_HOST, DB_PORT, DB_USER, dan DB_NAME wajib diisi")
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port, dbname,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("gagal membuka koneksi MySQL: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil koneksi MySQL: %w", err)
	}
	if err := sqlDB.PingContext(context.Background()); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("gagal terhubung ke MySQL: %w", err)
	}

	if err := db.AutoMigrate(&model.URL{}); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("gagal menyiapkan tabel shortlinks: %w", err)
	}

	return db, nil
}

package config

import (
	"net/http"
	"os"

	"github.com/gorilla/sessions"
)

const SESSION_ID = "main"

var Store *sessions.CookieStore

func InitSessionStore() {
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		secret = "shortlink-dev-secret-2026"
	}

	env := os.Getenv("APP_ENV")
	isSecure := (env == "production")

	Store = sessions.NewCookieStore([]byte(secret))
	Store.Options = &sessions.Options{
		Path:        "/",
		MaxAge:      86400,
		HttpOnly:    true,
		Secure:      isSecure,
		SameSite:    http.SameSiteLaxMode,
		Partitioned: isSecure,
	}
}

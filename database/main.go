package main

import (
	"log"
	"net/http"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	app := pocketbase.New()
	// app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
	// 	e.Router.AddRoute(echo.Route{
	// 		Method: http.MethodPost,
	// 		Path:   "/api/myRoute",
	// 		Handler: func(c echo.Context) error {
	// 			// custom logic here: compute custom_value using parameters
	// 			custom_value := "cool_value"
	// 			return c.String(200, custom_value)
	// 		},
	// 	})
	// 	return nil
	// })
	// Add your custom route here
	// app.OnBeforeServe().Add(func(e *echo.Echo) error {
	// 	e.GET("/api/hello", func(c echo.Context) error {
	// 		return c.JSON(http.StatusOK, map[string]string{
	// 			"message": "Hello from custom API!",
	// 		})
	// 	})
	//
	// 	// Example: secured route
	// 	e.GET("/api/secret", func(c echo.Context) error {
	// 		// Only allow if a query param matches
	// 		if c.QueryParam("key") != "12345" {
	// 			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	// 		}
	// 		return c.JSON(http.StatusOK, map[string]string{"secret": "42"})
	// 	})
	//
	// 	return nil
	// })

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

		se.Router.GET("/api/hello",
			func(c *core.RequestEvent) error {
				err := app.Cron().Add("hello", "*/2 * * * *", func() {
					log.Println("Hello!")
				})

				c.JSON(http.StatusOK, map[string]string{
					"message": "Hello from custom API!",
				})

				return err
				return c.JSON(http.StatusOK, map[string]string{
					"message": "Hello from custom API!",
				})
			})
		// se.Router.GET("/api/addJob",
		//
		// 	func(c echo.Context) error {
		// 	app.Cron().MustAdd("hello", "*/2 * * * *", func() {
		// 		log.Println("Hello!")
		// 	}),
		//
		// 	return c.JSON(http.StatusOK, map[string]string{
		// 		"message": "Hello from custom API!",
		// 	})
		// })
		// return c.JSON(http.StatusOK, map[string]string{
		// 	"message": "Hello from custom API!",
		// })
		//		if c.QueryParam("key") != "12345" {
		// 			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		// 		}
		// 		return c.JSON(http.StatusOK, map[string]string{"secret": "42"})
		// })

		return se.Next()
	})

	// prints "Hello!" every 2 minutes
	app.Cron().MustAdd("hello", "*/2 * * * *", func() {
		log.Println("Hello!")
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

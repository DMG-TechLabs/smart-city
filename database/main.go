package main

import (
	"log"
	"net/http"
	"net/mail"
	"os"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/mailer"
)

func main() {
	alerts := make(map[string]string)
	app := pocketbase.New()
	// app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
	// 	e.Router.AddRoute(echo.Route{
	// 		Method: http.MethodPost,
	// 		Path:   "/api/myRoute",
	// 		Handler: func(c echo.Context) error {
	// 			// custom logic here: compute custom_value using parameters
	// 	custom_value := "cool_value"
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

	app.OnRecordAfterCreateSuccess().BindFunc(func(e *core.RecordEvent) error {
		for id, alertFilter := range alerts {
			log.Println("alertFilter:", alertFilter)
			log.Println("id:", id)
			result, _ := e.App.FindFirstRecordByFilter(e.Record.Collection(), alertFilter, dbx.Params{"id": e.Record.Id})
			// .AndWhere(dbx.HashExp{"id": e.Record.Id})
			log.Println("result:", result)

			if result != nil {
				log.Println("result is not nil")
				dbAlert, _ := e.App.FindRecordById("alerts", id)
				message := &mailer.Message{
					From: mail.Address{
						Address: e.App.Settings().Meta.SenderAddress,
						Name:    e.App.Settings().Meta.SenderName,
					},
					To:      []mail.Address{{Address: dbAlert.GetString("user_email")}},
					Subject: "YOUR_SUBJECT...",
					HTML:    "YOUR_HTML_BODY...",
					// bcc, cc, attachments and custom headers are also supported...
				}

				if e.App.NewMailClient().Send(message) != nil {
					log.Println("Error sending email")
				} else {
					log.Println("Email sent successfully")
				}

			}
		}

		return e.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

		se.Router.GET("/api/hello",
			func(c *core.RequestEvent) error {
				// err := app.Cron().Add("hello", "*/2 * * * *", func() {
				// 	log.Println("Hello!")
				// })
				// log.Println("Request")
				// log.Println(c.Request.URL.Query().Get("query"))
				// c.JSON(http.StatusOK, map[string]string{
				// 	"message": "Hello from custom API!",
				// })

				// alerts = append(alerts, c.Request.URL.Query().Get("query"))

				collection, err := app.FindCollectionByNameOrId("alerts")
				if err != nil {
					log.Println("Error finding collection")
					return err

				}

				log.Println("Collection:", collection)
				log.Println("----------------------------------")
				record := core.NewRecord(collection)
				log.Println("record:", record)
				log.Println(c.Auth.TokenKey())
				// authUser, _ := c.App.FindAuthRecordByToken(c.Auth.TokenKey())
				authUser, _ := c.App.FindRecordById("users", c.Auth.Id)
				log.Println("Auth user:", authUser)
				if authUser != nil {
					log.Println("Authenticated user ID:", authUser.Id)
					log.Println("User email:", authUser.Get("email"))
				}

				// record.Set("title", c.Request.URL.Query().Get("title"))
				// record.Set("active", c.Request.URL.Query().Get("active"))
				record.Set("user_email", authUser.Get("email"))
				// record.Set("frequency", c.Request.URL.Query().Get("query"))
				// record.Set("level", c.Request.URL.Query().Get("query"))
				// record.Set("description", c.Request.URL.Query().Get("query"))
				// record.Set("created_at", c.Request.URL.Query().Get("query"))
				// record.Set("updated_at", c.Request.URL.Query().Get("query"))
				record.Set("query", c.Request.URL.Query().Get("query"))
				err = app.Save(record)
				// record.Id
				if err != nil {
					return err
				}

				alerts[record.Id] = c.Request.URL.Query().Get("query")
				// field type specific modifiers can also be used
				// record.Set("slug:autogenerate", "post-")
				// return err
				return c.JSON(http.StatusOK, map[string]string{
					"message": "Hello from custom API!",
				})
			})

		dbAlerts, _ := se.App.FindAllRecords("alerts")

		for _, dbAlert := range dbAlerts {
			alerts[dbAlert.Id] = dbAlert.Get("query").(string)
		}

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

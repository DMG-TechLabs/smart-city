package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"pocketbase/alerts"
	"pocketbase/metadata"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

func main() {
	alertsList := make(map[string]string)
	app := pocketbase.New()

	app.OnRecordAfterCreateSuccess().BindFunc(func(e *core.RecordEvent) error {
		var err error = nil
		err = alerts.RunAlerts(app, e, alertsList)
		switch name := e.Record.Collection().Name; name {
		case "metadata":
			err = metadata.IfMetadata(app, e)
		}
		if err != nil {
			return err
		}
		return e.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

		se.Router.GET("/api/getalerthistory", func(c *core.RequestEvent) error {
			collection, err := app.FindCollectionByNameOrId("alertsHistory")
			if err != nil {
				log.Println("Error finding collection")
				return err

			}

			records, err := app.FindAllRecords(collection.Id)
			if err != nil {
				log.Println("Error finding records")
				return err
			}

			var recordsJson []alerts.AlertHistory

			for _, record := range records {
				alert, err := app.FindRecordById("alerts", record.Get("alert").(string))
				if err != nil {
					log.Println("Error finding alert record")
					return err
				}

				valueRecord, err := app.FindRecordById(record.Get("collection").(string), record.Get("recordId").(string))
				if err != nil {
					log.Println("Error finding value record")
					return err
				}

				recordsJson = append(recordsJson, alerts.AlertHistory{
					Name:      alert.Get("name").(string),
					RecordId:  record.Id,
					AlertId:   record.Get("alert").(string),
					Created:   record.Get("created").(types.DateTime),
					Value:     valueRecord.Get("value"),
					Condition: alert.Get("condition").(types.JSONRaw),
				})

				fmt.Println(recordsJson)
			}

			// return c.JSON(http.StatusOK, records)
			return c.JSON(http.StatusOK, map[string]interface{}{
				"message": recordsJson,
			})
		})

		se.Router.GET("/api/addalert",
			func(c *core.RequestEvent) error {
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

				record.Set("name", c.Request.URL.Query().Get("title"))
				record.Set("enabled", c.Request.URL.Query().Get("active"))
				record.Set("user_email", authUser.Get("email"))
				record.Set("condition", c.Request.URL.Query().Get("query"))
				err = app.Save(record)
				// record.Id
				if err != nil {
					return err
				}

				alertsList[record.Id] = c.Request.URL.Query().Get("query")
				// field type specific modifiers can also be used
				// record.Set("slug:autogenerate", "post-")
				// return err
				return c.JSON(http.StatusOK, map[string]string{
					"message": "Hello from custom API!",
				})
			})

		// dbAlerts, _ := se.App.FindAllRecords("alerts")

		// for _, dbAlert := range dbAlerts {
		// alerts[dbAlert.Id] = dbAlert.Get("query").
		// }

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

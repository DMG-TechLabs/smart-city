package main

import (
	"encoding/json"
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

		se.Router.GET("/api/createcollection", func(c *core.RequestEvent) error {
			fmt.Println("user:", c.Auth.Id)
			fmt.Println("Body:", c.Request.Body)

			var err error
			reqBody := c.Request.URL.Query().Get("payload")
			var bodyBytes []byte

			if err != nil {
				fmt.Println("Error reading body:", err)
				return err
			}
			var reqJSON map[string]any
			err = json.Unmarshal([]byte(reqBody), &reqJSON)
			if err != nil {
				fmt.Println("ReqBody:", reqBody)
				fmt.Println("reqJson:", reqJSON)
				fmt.Println("ReqBytes:", bodyBytes)
				fmt.Println("len(bodyBytes):", len(bodyBytes))

				fmt.Println("Error unmarshalling body:", err)
				return err
			}

			// fmt.Println("ReqJson:", reqJSON)
			// fmt.Println("-----------------------------")
			// for key, value := range reqJSON {
			// 	fmt.Println("key - value: ", key, " - ", value)
			// 	if key == "collection" {
			// 		for key2, value2 := range value.(map[string]any) {
			// 			fmt.Println("key - value: ", key2, " - ", value2)
			// 		}
			// 	}
			// }
			//
			// fmt.Println("-----------------------------")

			newCollection := core.NewBaseCollection(reqJSON["provider"].(string))

			// newCollection.ViewRule = types.Pointer("@request.auth.id != ''")
			// newCollection.CreateRule = types.Pointer("@request.auth.id != '' && @request.body.user = @request.auth.id")
			// newCollection.UpdateRule = types.Pointer(`
			//  		@request.auth.id != '' &&
			//  		user = @request.auth.id &&
			//  		(@request.body.user:isset = false || @request.body.user = @request.auth.id)
			// `)

			// newCollection.Fields.Add(&core.TextField{
			// 	Id:                  "id",
			// 	Name:                "id",
			// 	PrimaryKey:          true,
			// 	Required:            true,
			// 	AutogeneratePattern: "[a-z0-9]{15}",
			// 	Pattern:             "^[a-z0-9]+$",
			// 	Min:                 15,
			// 	Max:                 15,
			// })

			var name string
			a := reqJSON["collection"].(map[string]any)["schema"].([]any)
			for _, value := range a {
				fmt.Println("------------")
				name = value.(map[string]any)["name"].(string)
				if name == "id" {
					log.Println("id field detected and overrided by the database")
					name = reqJSON["provider"].(string) + "_pb_id"
				}
				switch typeOfField := value.(map[string]any)["type"]; typeOfField {
				case "text":
					newCollection.Fields.Add(&core.TextField{
						Name:     name,
						Required: value.(map[string]any)["required"].(bool),
					})
				case "number":
					newCollection.Fields.Add(&core.NumberField{
						Name:     name,
						Required: value.(map[string]any)["required"].(bool),
					})
				case "bool":
					newCollection.Fields.Add(&core.BoolField{
						Name:     name,
						Required: value.(map[string]any)["required"].(bool),
					})
				case "json":
					newCollection.Fields.Add(&core.JSONField{
						Name:     name,
						Required: value.(map[string]any)["required"].(bool),
					})
				}

				// if value.(map[string]any)["unique"] == true {
				// newCollection.AddIndex(value.(map[string]any)["name"].(string), true, "user", "")
				// }

				// newCollection.a
				// for key, data := range value.(map[string]any) {
				// 	fmt.Println("key - value: ", key, " - ", data)
				// }
			}

			newCollection.Fields.Add(&core.AutodateField{
				Name:     "created",
				OnCreate: true,
			})
			newCollection.Fields.Add(&core.AutodateField{
				Name:     "updated",
				OnCreate: true,
				OnUpdate: true,
			})

			err = app.Save(newCollection)
			if err != nil {
				return err
			}

			// newCollection.AddIndex("id", true, "user", "")

			// core.NewBaseCollection(reqJson[""])
			return c.JSON(http.StatusOK, map[string]any{
				"message": "Hello from custom API!",
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
					return c.JSON(http.StatusOK, map[string]string{
						"message": "Hello from custom API!",
					})

				}

				record.Set("name", c.Request.URL.Query().Get("name"))
				// record.Set("enabled", c.Request.URL.Query().Get("active"))
				record.Set("enabled", true)
				record.Set("user_email", authUser.Get("email"))
				record.Set("condition", c.Request.URL.Query().Get("condition"))
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

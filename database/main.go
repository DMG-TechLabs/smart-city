package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

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

	app.OnRecordAfterDeleteSuccess().BindFunc(func(e *core.RecordEvent) error {
		switch name := e.Record.Collection().Name; name {
		case "alerts":
			delete(alertsList, e.Record.Id)
		case "metadata":
			provider := e.Record.GetString("provider")
			collection, err := app.FindCollectionByNameOrId(provider)
			if err != nil {
				log.Println("Error finding collection")
			}

			err = app.Delete(collection)
			if err != nil {
				log.Println("Error deleting collection")
			}

			app.Cron().Remove(provider)
		}
		return e.Next()
	})

	app.OnRecordAfterUpdateSuccess().BindFunc(func(e *core.RecordEvent) error {
		switch name := e.Record.Collection().Name; name {
		case "alerts":
			if !e.Record.Get("enabled").(bool) {
				delete(alertsList, e.Record.Id)
			} else {
				alertString, err := alerts.AlertConditionToString(e.Record.GetString("condition"))
				if err != nil {
					log.Println("Error parsing condition:", err)
					return err
				}
				alertsList[e.Record.Id] = alertString
			}
		}

		return e.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

		se.Router.GET("/api/getalerthistory", func(c *core.RequestEvent) error {
			// collection, err := app.FindCollectionByNameOrId("alertsHistory")
			// if err != nil {
			// 	log.Println("Error finding collection")
			// 	return err

			// }

			records, err := app.FindAllRecords("alertsHistory")
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

				valueRecord, err := app.FindRecordById(record.GetString("collection"), record.GetString("recordId"))
				if err != nil {
					log.Println("Error finding value record")
					return err
				}

				recordsJson = append(recordsJson, alerts.AlertHistory{
					Name:      alert.GetString("name"),
					RecordId:  record.Id,
					AlertId:   record.GetString("alert"),
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

		se.Router.POST("/api/createcollection", func(c *core.RequestEvent) error {
			// fmt.Println("user:", c.Auth.Id)
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

			fmt.Println("reqJson:", reqJSON["collection"].(map[string]any)["schema"].([]any))

			paths := reqJSON["paths"].([]any)
			// for _, path := range paths {
			// 	fmt.Println("path:", path.(map[string]any)["path"])
			// }
			// fmt.Println("path:", paths[0].(map[string]any)["path"])

			// fmt.Println("paths:", paths[0])
			// fmt.Println("paths type:", )

			newCollection := core.NewBaseCollection(reqJSON["provider"].(string))

			newCollection.ViewRule = types.Pointer("")
			newCollection.CreateRule = types.Pointer("")
			newCollection.UpdateRule = types.Pointer("")
			newCollection.DeleteRule = types.Pointer("")

			var idx strings.Builder

			idx.WriteString("CREATE ")
			// if unique {
			idx.WriteString("UNIQUE ")
			// }
			idx.WriteString("INDEX `")
			idx.WriteString(reqJSON["provider"].(string) + "_unique_index")
			idx.WriteString("` ")
			idx.WriteString("ON `")
			idx.WriteString(newCollection.Name)
			idx.WriteString("` (")
			// idx.WriteString(columnsExpr)
			var name string
			a := reqJSON["collection"].(map[string]any)["schema"].([]any)
			// paths := reqJSON["paths"]
			// fmt.Println("paths:", paths)
			for k, value := range a {
				fmt.Println("------------")
				name = value.(map[string]any)["name"].(string)
				if name == "id" {
					log.Println("id field detected and overrided by the database")
					name = reqJSON["provider"].(string) + "_pb_id"
				}
				// fmt.Println("path:", paths[k].(map[any]any)[value])

				// TODO - Check if it is the correct path
				fmt.Println("path: ", paths[k].(map[string]any)["path"])
				name = strings.Replace(paths[k].(map[string]any)["path"].(string), "/", "_", -1)
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

				idx.WriteString(name)
				if k < len(a)-1 {
					idx.WriteString(",")
				}

				// if value.(map[string]any)["unique"] == true {
				// newCollection.AddIndex(value.(map[string]any)["name"].(string), true, "user", "")
				// }

				// newCollection.a
				// for key, data := range value.(map[string]any) {
				// 	fmt.Println("key - value: ", key, " - ", data)
				// }
			}

			idx.WriteString(")")
			newCollection.Indexes = append(newCollection.Indexes, idx.String())

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
				if authUser == nil {
					log.Println("Authenticated user ID:", authUser.Id)
					log.Println("User email:", authUser.Get("email"))
					return c.JSON(http.StatusUnauthorized, map[string]string{
						"message": "User is not authenticated to perform this action",
					})

				}

				condition := c.Request.URL.Query().Get("condition")

				record.Set("name", c.Request.URL.Query().Get("name"))
				record.Set("severity", c.Request.URL.Query().Get("severity"))
				record.Set("enabled", true)
				record.Set("user_email", authUser.Get("email"))
				record.Set("condition", condition)
				err = app.Save(record)
				if err != nil {
					return err
				}

				alertString, err := alerts.AlertConditionToString(condition)
				if err != nil {
					return c.JSON(http.StatusBadRequest, map[string]string{
						"message": "Error parsing condition",
					})
				}

				alertsList[record.Id] = alertString

				return c.JSON(http.StatusOK, map[string]string{
					"message": "Hello from custom API!",
				})
			})

		alertsList = alerts.GetAlerts(app)
		alerts.PrintAlerts(app)
		metadata.RestorePollingJobs(app)
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

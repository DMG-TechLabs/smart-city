package metadata

import (
	"fmt"
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func IfMetadata(app *pocketbase.PocketBase, e *core.RecordEvent) error {
	app.Cron().MustAdd(e.Record.GetString("provider"), "*/2 * * * *", GeneratePollingFunction(e.Record) })
	return nil
}

func RestorePollingJobs(app *pocketbase.PocketBase) error {
	records, err := app.FindAllRecords("metadata")
	if err != nil {
		return err
	}

	for _, record := range records {
		app.Cron().MustAdd(record.GetString("provider"), "*/2 * * * *", GeneratePollingFunction(record))
	}

	return nil
}

func GeneratePollingFunction(record *core.Record) func() {
	return func() {
		res, err := http.Get(record.GetString("endpoint"))
		if err != nil {
			fmt.Println(err)
		}

		resBody := res.Body
		// var bodyBytes []byte
		// _, err = resBody.Read(bodyBytes)
		// var resJson map[string]interface{}
		// err = json.Unmarshal(bodyBytes, &resJson)
		//
		// paths := record.GetString("paths")
		// var pathsJson map[string]interface{}
		// err = json.Unmarshal([]byte(paths), &pathsJson)
		//
		// provider := record.GetString("provider")
		// collection, err := app.FindCollectionByNameOrId("api_" + provider)
		// record := core.NewRecord(collection)
		//
		// for path, value := range pathsJson {
		// 	record.Set(path, resJson[value.(string)])
		// }
		//
		// err = app.Save(record)
		// if err != nil {
		// 	fmt.Println(err)
		// }
	}
}

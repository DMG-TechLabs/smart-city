package metadata

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func IfMetadata(app *pocketbase.PocketBase, e *core.RecordEvent) error {
	app.Cron().MustAdd(e.Record.GetString("provider"), "*/2 * * * *", func() {
		res, err := http.Get(e.Record.GetString("endpoint"))
		if err != nil {
			fmt.Println(err)
		}

		resBody := res.Body
		var bodyBytes []byte
		_, err = resBody.Read(bodyBytes)
		var resJson map[string]interface{}
		err = json.Unmarshal(bodyBytes, &resJson)

		paths := e.Record.GetString("paths")
		var pathsJson map[string]interface{}
		err = json.Unmarshal([]byte(paths), &pathsJson)

		provider := e.Record.GetString("provider")
		collection, err := app.FindCollectionByNameOrId("api_" + provider)
		record := core.NewRecord(collection)

		for path, value := range pathsJson {
			record.Set(path, resJson[value.(string)])
		}

		err = app.Save(record)
		if err != nil {
			fmt.Println(err)
		}
	})

	return nil
}

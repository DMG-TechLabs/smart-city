package metadata

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func IfMetadata(app *pocketbase.PocketBase, e *core.RecordEvent) error {
	app.Cron().MustAdd(e.Record.GetString("provider"), "*/2 * * * *", GeneratePollingFunction(app, e.Record))
	return nil
}

func RestorePollingJobs(app *pocketbase.PocketBase) error {
	records, err := app.FindAllRecords("metadata")
	if err != nil {
		return err
	}

	for _, record := range records {
		app.Cron().MustAdd(record.GetString("provider"), "*/2 * * * *", GeneratePollingFunction(app, record))
	}

	return nil
}

func GeneratePollingFunction(app *pocketbase.PocketBase, record *core.Record) func() {
	return func() {
		res, err := http.DefaultClient.Get(record.GetString("endpoint"))
		if err != nil {
			fmt.Println(err)
		}
		defer res.Body.Close()

		fmt.Println("url: ", record.GetString("endpoint"))
		fmt.Println("ok: ", res.StatusCode)
		fmt.Println("Status: ", res.Status)
		fmt.Println("Header: ", res.Header)

		var bytesRead int
		// resBody := res.Body
		var bodyBytes []byte
		// bytesRead, err = resBody.Read(bodyBytes)
		bodyBytes, err = ioutil.ReadAll(res.Body)
		if err != nil {
			fmt.Println("http:", err)
			err = nil
		}

		fmt.Println("len Bytes: ", len(bodyBytes))
		fmt.Println("bytesRead: ", bytesRead)

		var resJSON []map[string]any
		err = json.Unmarshal(bodyBytes, &resJSON)
		if err != nil {
			fmt.Println(err)
			err = nil
		}

		paths := record.GetString("paths")
		var pathsJSON []map[string]any
		err = json.Unmarshal([]byte(paths), &pathsJSON)
		if err != nil {
			fmt.Println(err)
		}

		provider := record.GetString("provider")
		collection, err := app.FindCollectionByNameOrId(provider)

		for k, value := range resJSON {
			newRecord := core.NewRecord(collection)

			fmt.Println("key: ", k)
			for _, pathData := range pathsJSON {
				newRecord.Set(pathData["name"].(string), value[pathData["path"].(string)])
			}

			err = app.Save(newRecord)
			if err != nil {
				fmt.Println(err)
			}

		}

		// fmt.Println("resJson: ", resJSON)
		// for _, value := range pathsJSON {
		// 	fmt.Println("path - value:", " - ", value, " - ")
		// 	fmt.Println("----------------------------")
		// 	for _, v := range resJSON {
		// 		newRecord.Set(value["name"].(string), v[value["path"].(string)])
		// 	}
		// }

		fmt.Println("Run DONE")
	}
}

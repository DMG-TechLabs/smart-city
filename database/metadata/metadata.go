package metadata

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

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

type resJSON struct {
	DataType1 []map[string]any
	DataType2 map[string]any
	TypeUsed  int
}

func getValueByPath(data []byte, path string) (interface{}, error) {
	var raw interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}

	current := raw
	parts := strings.Split(strings.Trim(path, "/"), "/")

	for _, part := range parts {
		if m, ok := current.(map[string]interface{}); ok {
			current = m[part]
		} else {
			return nil, fmt.Errorf("invalid path at %s", part)
		}
	}

	return current, nil
}

func setRecordValue(record *core.Record, collection *core.Collection, pathsJSON []map[string]any, data []byte) {
	for _, pathData := range pathsJSON {
		fmt.Println("pathData: ", pathData)
		// fmt.Println("pathData: ", pathData)
		value, err := getValueByPath(data, pathData["path"].(string))
		if err != nil {
			fmt.Println(err)
		}
		fmt.Println("value: ", value)

		if value != nil {
			dataType := collection.Fields.GetByName(strings.Replace(pathData["path"].(string), "/", "_", -1)).Type()
			fmt.Println("dataType: ", dataType)
			fmt.Println("value type: ", fmt.Sprintf("%T", value))
			switch dataType {
			case "text":
				if fmt.Sprintf("%T", value) == "string" {
					value = value.(string)
				} else {
					value = fmt.Sprintf("%#v", value)
				}
				// value = value.(string)
			case "number":
				value = float64(value.(float64))
			case "bool":
				value = value.(bool)
			}
		}
		record.Set(strings.Replace(pathData["path"].(string), "/", "_", -1), value)

	}
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

		var resJSON resJSON

		// var resJSON []map[string]any
		err = json.Unmarshal(bodyBytes, &resJSON.DataType1)
		resJSON.TypeUsed = 1
		if err != nil {
			fmt.Println(err)
			// err = json.Unmarshal(bodyBytes, &resJSON.DataType2)
			resJSON.TypeUsed = 2
			// if err != nil {
			// 	fmt.Println(err)
			// }
		}

		paths := record.GetString("paths")
		var pathsJSON []map[string]any
		err = json.Unmarshal([]byte(paths), &pathsJSON)
		if err != nil {
			fmt.Println(err)
		}

		provider := record.GetString("provider")
		collection, err := app.FindCollectionByNameOrId(provider)

		fmt.Println("typeUsed: ", resJSON.TypeUsed)
		if resJSON.TypeUsed == 2 {
			newRecord := core.NewRecord(collection)
			// fmt.Println("collection: ", collection)
			setRecordValue(newRecord, collection, pathsJSON, bodyBytes)
			err = app.Save(newRecord)
			if err != nil {
				log.Println(err)
			}
		} else if resJSON.TypeUsed == 1 {
			for k, _ := range resJSON.DataType1 {
				newRecord := core.NewRecord(collection)
				for _, pathData := range pathsJSON {
					// fmt.Println("pathData: ", pathData)
					bytes, err := json.Marshal(resJSON.DataType1[k])
					value, err := getValueByPath(bytes, pathData["path"].(string))
					if err != nil {
						fmt.Println(err)
					}
					fmt.Println("value: ", value)

					dataType := collection.Fields.GetByName(strings.Replace(pathData["path"].(string), "/", "_", -1)).Type()
					fmt.Println("dataType: ", dataType)
					switch dataType {
					case "text":
						value = value.(string)
					case "number":
						value = float64(value.(float64))
					case "bool":
						value = value.(bool)
					}
					newRecord.Set(strings.Replace(pathData["path"].(string), "/", "_", -1), value)

				}

				err = app.Save(newRecord)
				if err != nil {
					log.Println(err)
				}
			}
		}

		fmt.Println("Run DONE")
	}

}

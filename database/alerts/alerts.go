package alerts

import (
	"encoding/json"
	"fmt"
	"log"
	"net/mail"
	"strconv"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/mailer"
	"github.com/pocketbase/pocketbase/tools/types"
)

type AlertHistory struct {
	Name      string         `json:"name"`
	RecordId  string         `json:"recordId"`
	AlertId   string         `json:"alertId"`
	Created   types.DateTime `json:"created"`
	Value     any            `json:"value"`
	Condition types.JSONRaw  `json:"condition"`
}

func RunAlerts(app *pocketbase.PocketBase, e *core.RecordEvent, alerts map[string]string) error {
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
				Subject: "Alert Triggered",
				HTML:    dbAlert.GetString("name") + " (" + dbAlert.GetString("severity") + " severity)" + " triggered ",
				// bcc, cc, attachments and custom headers are also supported...
			}

			if e.App.NewMailClient().Send(message) != nil {
				log.Println("Error sending email")
			} else {
				log.Println("Email sent successfully")
			}

			alertsHistorycollection, err := app.FindCollectionByNameOrId("alertsHistory")
			if err != nil {
				log.Println("Error finding collection")
				return err

			}

			alert, err := app.FindRecordById("alerts", id)
			if err != nil {
				log.Println("Error finding alert record")
				log.Println("id:", id)
				return err
			}
			log.Println("alert", alert)

			record := core.NewRecord(alertsHistorycollection)
			record.Set("alert", alert.Id)
			record.Set("recordId", e.Record.Id)
			record.Set("collection", e.Record.Collection().Name)
			err = app.Save(record)
			// record.Id
			if err != nil {
				return err
			}
		}
	}
	return nil
}

type Condition struct {
	Field      string      `json:"field,omitempty"`
	Operator   string      `json:"operator"`
	Value      interface{} `json:"value,omitempty"`
	Conditions []Condition `json:"conditions,omitempty"`
}

func buildConditionString(cond Condition) string {
	// If it's a group condition (AND / OR)
	if len(cond.Conditions) > 0 {
		var parts []string
		for _, c := range cond.Conditions {
			parts = append(parts, buildConditionString(c))
		}
		return "(" + joinWithOperator(parts, cond.Operator) + ")"
	}

	// Leaf condition
	val := formatValue(cond.Value)
	return fmt.Sprintf("%s %s %s", cond.Field, cond.Operator, val)
}

func joinWithOperator(parts []string, op string) string {
	result := ""
	for i, p := range parts {
		if i > 0 {
			result += " " + op + " "
		}
		result += p
	}
	return result
}

func formatValue(v interface{}) string {
	switch val := v.(type) {
	case string:
		return strconv.Quote(val) // adds double quotes
	default:
		return fmt.Sprintf("%v", val)
	}
}

func AlertConditionToString(jsonIn string) (string, error) {
	var err error
	jsonInput := []byte(jsonIn)
	var cond Condition
	err = json.Unmarshal(jsonInput, &cond)
	if err != nil {
		return "", err
	}
	alertString := buildConditionString(cond)
	return alertString[1 : len(alertString)-1], nil
}

func GetAlerts(app *pocketbase.PocketBase) map[string]string {
	alertsList := make(map[string]string)
	records, err := app.FindAllRecords("alerts")
	if err != nil {
		return alertsList
	}

	var alertString string
	// var err error
	for _, record := range records {
		alertString, err = AlertConditionToString(record.GetString("condition"))
		if err != nil {
			log.Println("Error parsing condition:", err)
			continue
		}
		alertsList[record.Id] = alertString
	}

	return alertsList
}

func PrintAlerts(app *pocketbase.PocketBase) error {
	records, err := app.FindAllRecords("alerts")
	if err != nil {
		return err
	}

	var jsonInput []byte
	for _, record := range records {
		jsonInput = []byte(record.GetString("condition"))
		var cond Condition
		if err := json.Unmarshal(jsonInput, &cond); err != nil {
			panic(err)
		}

		result := buildConditionString(cond)
		fmt.Println(result[1 : len(result)-1])
	}

	return nil
}

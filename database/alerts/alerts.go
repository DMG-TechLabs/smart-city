package alerts

import (
	"log"
	"net/mail"

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
				Subject: "YOUR_SUBJECT...",
				HTML:    "YOUR_HTML_BODY...",
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

			alert, _ := app.FindRecordById("alerts", id)

			record := core.NewRecord(alertsHistorycollection)
			record.Set("alert", alert)
			record.Set("record", result)
			err = app.Save(record)
			// record.Id
			if err != nil {
				return err
			}
		}
	}
	return nil
}

// "use client";

// import { usePocketBase } from "@/context/DatabaseContext.tsx";
// import { Alert } from "../Alert";
// import { AlertCondition } from "../AlertCondition";
// import { useEffect, useState } from "react";
//
// export default function AlertsAdd() {
  // const pb = usePocketBase();
  //
  // useEffect(() => {
  //   async function registerAlert() {
  //     const ac = new AlertCondition("AND")
  //       .add({ field: "temperature", operator: ">", value: 25 })
  //       .add(
  //         new AlertCondition("OR")
  //           .add({ field: "humidity", operator: "<", value: 30 })
  //           .add({ field: "status", operator: "==", value: "warning" })
  //       );
  //
  //     const alert = new Alert("New Alert", ac);
  //
  //     try {
  //       await pb.send("/api/addalert", {
  //         query: {
  //           name: alert.name,
  //           condition: JSON.stringify(ac.toJSON()),
  //         },
  //       });
  //
  //       console.log("Alert registered successfully");
  //     } catch (err) {
  //       console.error("Error registering alert:", err);
  //     }
  //   }
  //
  //   registerAlert();
  // }, [pb]);

//     return (
//         <div className="main-content">
//             <h1>Alerts Add</h1>
//         </div>
//     );
// }

"use client"
import { AlertCondition } from "../AlertCondition";
import { useState } from "react"
import { PlusCircle, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert } from "../Alert";
import { usePocketBase } from "../../../context/DatabaseContext.tsx";

interface Condition {
  variableName: string
  condition: ">" | "<" | "==" | ">=" | "<=" | "!=";
  value: string
}

export default function AlertForm() {
  const pb = usePocketBase();
  const [name, setName] = useState("")
  const [collectionName, setCollectionName] = useState("")
  const [conditions, setConditions] = useState<Condition[]>([{ variableName: "", condition: "==", value: "" }])

  const conditionOptions = [
    { value: "==", label: "Equals" },
    { value: "!=", label: "Not Equals" },
    { value: ">", label: "Greater Than" },
    { value: "<", label: "Less Than" },
    { value: ">=", label: "Greater Than or Equal To" },
    { value: "<=", label: "Less Than or Equal To" },
  ]

  const addCondition = () => {
    setConditions([...conditions, { variableName: "", condition: "==", value: "" }])
  }

  const removeCondition = (index: number) => {
    const newConditions = [...conditions]
    newConditions.splice(index, 1)
    setConditions(newConditions)
  }

  const updateCondition = (index: number, field: keyof Condition, value: ">" | "<" | "==" | ">=" | "<=" | "!=") => {
    const newConditions = [...conditions]
    newConditions[index][field] = value
    setConditions(newConditions)
  }

    const handleSubmit = async () => {
        for (const condition of conditions) {
            if (!condition.variableName || !condition.condition || !condition.value) {
            alert("Please fill out all fields in every condition.");
            return;
            }
        }

        console.log("All good:", conditions);
        const rootCondition = new AlertCondition("AND");
        rootCondition.add({
            collection: collectionName,
            field: conditions[0].variableName,
            operator: conditions[0].condition,
            value: conditions[0].value,
        });

        try {

            
            
            conditions.slice(1).forEach((cond) => {
                // const parsedValue = isNaN(cond.value) ? cond.value : parseFloat(cond.value);

                rootCondition.add({
                    collection: collectionName,
                    field: cond.variableName,
                    operator: cond.condition,
                    value: cond.value,
                });
            });

            const alert = new Alert(name, rootCondition);
            try {
                await pb.send("/api/addalert", {
                    query: {
                        name: alert.name,
                        condition: JSON.stringify(rootCondition.toJSON()),
                    },
                });

                console.log("Alert registered successfully");
            } catch (err) {
                console.error("Error registering alert:", err);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };


  return (
    <div className="main-content flex justify-center">
      <Card className="w-1/2 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alert name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection">Collection Name</Label>
            <div className="flex gap-2">
              <Input
                id="collection"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Collection name"
                className="flex-1"
              />
              
            </div>
          </div>

          

          <div className="space-y-4 mt-6">
            <h3 className="font-medium">Conditions</h3>

            {conditions.map((condition, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                <Input
                  placeholder="Variable name"
                  value={condition.variableName}
                  onChange={(e) => updateCondition(index, "variableName", e.target.value)}
                />
                <Select
                  value={condition.condition}
                  onValueChange={(value) => updateCondition(index, "condition", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, "value", e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCondition(index)}
                  disabled={conditions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={addCondition}>
              <PlusCircle className="h-4 w-4" />
              Add Condition
            </Button>
            </div>

          <Button className="w-full bg-green-500 hover:bg-green-600 mt-4" onClick={handleSubmit}>Add</Button>
        </CardContent>
      </Card>

      </div>
  )
}

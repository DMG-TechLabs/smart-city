"use client"

import { AlertCondition } from "../AlertCondition";
import { useState, useEffect } from "react"
import { PlusCircle, Trash2, RefreshCw, Replace } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert } from "../Alert";
import { usePocketBase } from "@/context/DatabaseContext.tsx";
import { RecordModel } from "pocketbase";
import { CollectionSelector } from "@/components/local/collection-selector";
import { FieldsSelector } from "@/components/local/fields-selector";


interface Condition {
  variableName: string
  condition: ">" | "<" | "==" | ">=" | "<=" | "!=";
  value: number | string
  operator: "AND" | "OR"
}



export default function AlertForm() {
  const pb = usePocketBase();
  const [name, setName] = useState("")
  // const [fields, setFields] = useState<string[]>([])
  // const [metadata, setMetadata] = useState<RecordModel[]>([])
  // const [collectionOptions, setCollectionOptions] = useState<string[]>([])
  const [collectionName, setCollectionName] = useState("")
  const [conditions, setConditions] = useState<Condition[]>([{ variableName: "", condition: "==", value: "", operator: "AND" }])


  const rootCondition = new AlertCondition("AND");

  const conditionOptions = [
    { value: "==", label: "Equals" },
    { value: "!=", label: "Not Equals" },
    { value: ">", label: "Greater Than" },
    { value: "<", label: "Less Than" },
    { value: ">=", label: "Greater Than or Equal To" },
    { value: "<=", label: "Less Than or Equal To" },
  ]

  const operatorOptions = [
    { value: "AND", label: "AND" },
    { value: "OR", label: "OR" },
  ]


  const addCondition = () => {
    setConditions([...conditions, { variableName: "", condition: "==", value: "", operator: "AND" }])
  }

  const removeCondition = (index: number) => {
    const newConditions = [...conditions]
    newConditions.splice(index, 1)
    setConditions(newConditions)
  }

  const updateCondition = (index: number, field: keyof Condition, value: ">" | "<" | "==" | ">=" | "<=" | "!=" | string | number) => {
    const newConditions = [...conditions]
    newConditions[index][field] = value
    setConditions(newConditions)
  }

  // useEffect(() => {
  //   async function fetchMetadata() {
  //     try {
  //       collectionOptions.pop()
  //       const metadata = await pb.collection("metadata").getFullList();
  //       console.log("metadata", metadata);
  //       for (const data of metadata) { 
  //         collectionOptions.push(data.provider);
  //         for (const field of data.paths) {
  //           fields.push((field.path).replace("/", "_")) 
  //         }
  //       }
  //       setCollectionOptions(collectionOptions);
  //     } catch (err) {
  //       console.error('Failed to fetch collections:', err);
  //     }
  //   }
  //   fetchMetadata();
  // }, [pb]);

    const handleSubmit = async () => {
      for (const condition of conditions) {
        if (!condition.variableName || !condition.condition || !condition.value) {
          alert("Please fill out all fields in every condition.");
          return;
        }
      }

      console.log("All good:", conditions);
      
      
      if (!isNaN(Number(conditions[0].value))) {
        rootCondition.add({
          collection: collectionName,
          field: conditions[0].variableName,
          operator: conditions[0].condition,
          value: Number(conditions[0].value),
        });
      } else {
        rootCondition.add({
          collection: collectionName,
          field: conditions[0].variableName,
          operator: conditions[0].condition,
          value: conditions[0].value,
        });
      }
      try {
        conditions.slice(1).forEach((cond) => {
          if (!isNaN(Number(cond))) {
              rootCondition.add(new AlertCondition(cond.operator).add({
                collection: collectionName,
                field: cond.variableName,
                operator: cond.condition,
                value: Number(cond.value),
              }));         
          }else {
            rootCondition.add(new AlertCondition(cond.operator).add({
              collection: collectionName,
              field: cond.variableName,
              operator: cond.condition,
              value: cond.value,
            }));
          }
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

          setName("");
          setCollectionName("");
          setConditions([{ variableName: "", condition: "==", value: "", operator: "AND" }]);
        } catch (err) {
          console.error("Error registering alert:", err);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    // console.log("last log", collectionOptions);

  return (
    <div className="main-content flex justify-center">
      <Card className="w-1/2 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alert name" />
          </div>

          <div className="space-y-2">
          
          <CollectionSelector value={collectionName} placeholder="Collection" onValueChange={(value) => setCollectionName(value)} />

          </div>

          

          <div className="space-y-4 mt-6">
            <h3 className="font-medium">Conditions</h3>

            {conditions.map((condition, index) => (
            <div key={index} className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-2 items-center">
                
                <FieldsSelector collectionName={collectionName} value={condition.variableName} placeholder="Field" onValueChange={(value) => updateCondition(index, "variableName", value)} />
                
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
                
                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(index, "operator", value)} 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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

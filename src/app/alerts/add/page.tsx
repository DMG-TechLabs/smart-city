"use client";

import { AlertCondition } from "../AlertCondition";
import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { usePocketBase } from "@/context/DatabaseContext.tsx";
import { CollectionSelector } from "@/components/local/collection-selector";
import { FieldsSelector } from "@/components/local/fields-selector";
import { Alert } from "../Alert";
import { LogicalOperator } from "../Condition";

interface Condition {
  variableName: string;
  condition: ">" | "<" | "==" | ">=" | "<=" | "!=";
  value: number | string;
  operator: LogicalOperator;
}

export default function AlertForm() {
  const pb = usePocketBase();
  const [name, setName] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("low");
  const [conditions, setConditions] = useState<Condition[]>([
    { variableName: "", condition: "==", value: "", operator: "&&" },
  ]);

  // Errors state
  const [errors, setErrors] = useState<{
    name?: string;
    collectionName?: string;
    conditions?: { variableName?: string; condition?: string; value?: string }[];
  }>({ conditions: [] });

  const conditionOptions = [
    { value: "==", label: "Equals" },
    { value: "!=", label: "Not Equals" },
    { value: ">", label: "Greater Than" },
    { value: "<", label: "Less Than" },
    { value: ">=", label: "Greater Than or Equal To" },
    { value: "<=", label: "Less Than or Equal To" },
  ];

  const severityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const operatorOptions = [
    { value: "&&", label: "AND" },
    { value: "||", label: "OR" },
  ];

  const addCondition = () => {
    setConditions([
      ...conditions,
      { variableName: "", condition: "==", value: "", operator: "&&" },
    ]);
    setErrors((prev) => ({
      ...prev,
      conditions: [...(prev.conditions || []), {}],
    }));
  };

  const removeCondition = (index: number) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);

    setErrors((prev) => {
      const newCondsErrors = prev.conditions ? [...prev.conditions] : [];
      newCondsErrors.splice(index, 1);
      return { ...prev, conditions: newCondsErrors };
    });
  };

  const updateCondition = (
    index: number,
    field: keyof Condition,
    value: any
  ) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);

    // Clear error on field change
    setErrors((prev) => {
      const newCondsErrors = prev.conditions ? [...prev.conditions] : [];
      if (!newCondsErrors[index]) newCondsErrors[index] = {};
      newCondsErrors[index][field] = undefined;
      return { ...prev, conditions: newCondsErrors };
    });
  };

  const validate = () => {
    let valid = true;
    const newErrors: typeof errors = { conditions: [] };

    if (!name.trim()) {
      newErrors.name = "Alert name is required";
      valid = false;
    }

    if (!collectionName.trim()) {
      newErrors.collectionName = "Collection is required";
      valid = false;
    }

    conditions.forEach((cond, i) => {
      const condErrors: {
        variableName?: string;
        condition?: string;
        value?: string;
      } = {};
      if (!cond.variableName.trim()) {
        condErrors.variableName = "Field is required";
        valid = false;
      }
      if (!cond.condition) {
        condErrors.condition = "Condition is required";
        valid = false;
      }
      if (
        cond.value === "" ||
        cond.value === null ||
        cond.value === undefined ||
        (typeof cond.value === "string" && !cond.value.trim())
      ) {
        condErrors.value = "Value is required";
        valid = false;
      }
      newErrors.conditions![i] = condErrors;
    });

  setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const rootCondition = new AlertCondition(conditions[0].operator);

    const val = !isNaN(Number(conditions[0].value))
          ? Number(conditions[0].value)
          : conditions[0].value;
          rootCondition.add({
      collection: collectionName,
      field: conditions[0].variableName,
      operator: conditions[0].condition,
      value: val,
    });


    try {

      for (let i = 1; i < conditions.length; i += 2) {
        const first = conditions[i];
        const second = conditions[i + 1];

        console.log("first", first);
        console.log("second", second);
        console.log("rootCondition", rootCondition);

        if (second) {
          const val1 = !isNaN(Number(first.value)) ? Number(first.value) : first.value;
          const val2 = !isNaN(Number(second.value)) ? Number(second.value) : second.value;

          rootCondition.add(new AlertCondition(first.operator).add({
            collection: collectionName,
            field: first.variableName,
            operator: first.condition,
            value: val1,
          }).add({
            collection: collectionName,
            field: second.variableName,
            operator: second.condition,
            value: val2,
          }));
          
        }else {
          const val1 = !isNaN(Number(first.value)) ? Number(first.value) : first.value;

          rootCondition.add({
            collection: collectionName,
            field: first.variableName,
            operator: first.condition,
            value: val1,
          });

        }
      }


      const alert = new Alert(name, rootCondition, severity);
      await pb.send("/api/addalert", {
        query: {
          severity: severity,
          collection: collectionName,
          name: alert.name,
          condition: JSON.stringify(rootCondition.toJSON()),
        },
      });

      console.log("Alert registered successfully");
      setName("");
      setCollectionName("");
      setConditions([{ variableName: "", condition: "==", value: "", operator: "&&" }]);
      setErrors({ conditions: [] });
    } catch (err) {
      console.error("Error registering alert:", err);
    }
  };

  return (
    <div className="main-content flex justify-center">
      <Card className="w-1/2 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Alert name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <CollectionSelector
              value={collectionName}
              placeholder="Provider"
              onValueChange={(value) => {
                setCollectionName(value);
                setErrors((prev) => ({ ...prev, collectionName: undefined }));
              }}
            />
            {errors.collectionName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.collectionName}
              </p>
            )}
          </div>

          <div className="space-y-2">
          <Select
              value={severity}
              onValueChange={(value: "low" | "medium" | "high") => setSeverity(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          

          <div className="space-y-4 mt-6">
            <h3 className="font-medium">Conditions</h3>

            {conditions.map((condition, index) => (
              <div
                key={index}
                className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-2 items-center"
              >
                <div className="flex flex-col">
                  <FieldsSelector
                    collectionName={collectionName}
                    value={condition.variableName}
                    placeholder="Field"
                    onValueChange={(value) =>
                      updateCondition(index, "variableName", value)
                    }
                  />
                  {errors.conditions?.[index]?.variableName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.conditions[index].variableName}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <Select
                    value={condition.condition}
                    onValueChange={(value) =>
                      updateCondition(index, "condition", value)
                    }
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
                  {errors.conditions?.[index]?.condition && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.conditions[index].condition}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) =>
                      updateCondition(index, "value", e.target.value)
                    }
                  />
                  {errors.conditions?.[index]?.value && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.conditions[index].value}
                    </p>
                  )}
                </div>

                <Select
                  value={condition.operator}
                  onValueChange={(value) =>
                    updateCondition(index, "operator", value)
                  }
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

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={addCondition}
            >
              <PlusCircle className="h-4 w-4" />
              Add Condition
            </Button>
          </div>

          <Button
            className="w-full bg-green-500 hover:bg-green-600 mt-4"
            onClick={handleSubmit}
          >
            Add
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

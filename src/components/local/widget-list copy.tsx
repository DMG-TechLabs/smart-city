import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CardComponent } from "../ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import "@/styles/dashboard.css"
import { JSX, useEffect, useState } from "react"
import { CollectionSelector } from "./collection-selector"
import { FieldsSelector } from "./fields-selector"

type WidgetListProps = {
  addLineWidget?: (collection: string, x: string, y: string) => void;
  addBarWidget?: (collection: string, x: string, y: string) => void;
  addPieWidget?: (collection: string, field: string) => void;
  addWeatherWidget?: () => void;
};

export function WidgetList({
  addLineWidget,
  addBarWidget,
  addPieWidget,
  addWeatherWidget
}: WidgetListProps) {
  const [selectedWidget, setSelectedWidget] = useState("");
  const [renderdWidget, setRenderdWidget] = useState<JSX.Element>();
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedField2, setSelectedField2] = useState("");

  useEffect(() => {
    updateSelectedWidget(selectedWidget);
  }, [selectedWidget]);
  
  function updateSelectedWidget(widget: string) {
    setSelectedWidget(widget);
    let message: JSX.Element = <div></div>
    if (widget === "Line Chart") {
      message = <div> 
        <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} /> 
        <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
        <FieldsSelector collectionName={selectedCollection} value={selectedField2} placeholder="Field" onValueChange={(value) => setSelectedField2(value)} />
        <Button onClick={() =>
            addLineWidget?.(selectedCollection, selectedField, selectedField2)
          }>Add Line Chart</Button>
      </div>
    } else if (widget === "Bar Chart") {
      message = <div> 
        <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} /> 
        <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
        <FieldsSelector collectionName={selectedCollection} value={selectedField2} placeholder="Field" onValueChange={(value) => setSelectedField2(value)} />
        <Button onClick={() =>
            addBarWidget?.(selectedCollection, selectedField, selectedField2)
          }>Add Bar Chart</Button>
      </div>
    } else if (widget === "Pie Chart") {
      message = <div> 
        <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} /> 
        <FieldsSelector collectionName={selectedCollection} value={selectedCollection} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
        <Button onClick={() =>
            addPieWidget?.(selectedCollection, selectedField)
          }>Add Pie Chart</Button>
      </div>

    } else if (widget === "Weather") {
      message = <Button onClick={addWeatherWidget}>Add Weather</Button>
    }else return 
    setRenderdWidget(message)
  } 

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button id="widget-button">Available Widgets</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[50%] max-w-none">
        <SheetHeader>
          <SheetTitle>Available widgets</SheetTitle>
          <SheetDescription>
            Here are all the available widgets to show in the dashboard.
          </SheetDescription>
        </SheetHeader>
          <Select
            value={selectedWidget}
            onValueChange={(value) => updateSelectedWidget(value)}
          >
            <SelectTrigger>
                <SelectValue placeholder="Widget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="Line Chart" value="Line Chart">
                  Line Chart
              </SelectItem>
              <SelectItem key="Bar Chart" value="Bar Chart">
                  Bar Chart
              </SelectItem>
              <SelectItem key="Pie Chart" value="Pie Chart">
                  Pie Chart
              </SelectItem>
              <SelectItem key="Weather" value="Weather">
                  Weather
              </SelectItem>
            </SelectContent>
          </Select>
          {renderdWidget}
          
      </SheetContent>
    </Sheet>
  )
}

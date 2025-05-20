import { Button } from "@/components/ui/button"
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

type WidgetListProps = {
  addLineWidget?: () => void;
  addBarWidget?: () => void;
  addPieWidget?: () => void;
  addWeatherWidget?: () => void;
};

export function WidgetList({
  addLineWidget,
  addBarWidget,
  addPieWidget,
  addWeatherWidget
}: WidgetListProps) {
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
            {/* <div className="available-widgets"> */}
            <div>
              <ScrollArea className="h-auto w-[fit-content] rounded-md">
                  <div className="add-buttons">
                  <Button onClick={addLineWidget}>Add Line Chart</Button>
                  <Button onClick={addBarWidget}>Add Bar Chart</Button>
                  <Button onClick={addPieWidget}>Add Pie Chart</Button>
                  <Button onClick={addWeatherWidget}>Add Weather</Button>
                </div>
              </ScrollArea>
            </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Add to dashboard</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

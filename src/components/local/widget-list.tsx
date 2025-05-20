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

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" id="widget-button">Widgets</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[100%] max-w-none">
        <SheetHeader>
          <SheetTitle>Available widgets</SheetTitle>
          <SheetDescription>
            Here are all the available widgets to show in the dashboard.
          </SheetDescription>
        </SheetHeader>
            {/* <div className="available-widgets"> */}
            <div>
              <ScrollArea className="h-auto w-[fit-content] rounded-md">
                  <CardComponent />
                  <CardComponent />
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

import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

export function DeleteButton() {
  return (
    <Button variant="ghost">  
      <FontAwesomeIcon icon={faTrash} />
    </Button>
  )
}

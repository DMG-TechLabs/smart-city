// import { AlertCondition } from "../AlertCondition";
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePocketBase } from "@/context/DatabaseContext.tsx";

type FieldsSelectorProps = {
    collectionName: string
    value: string | undefined
    placeholder: string
    onValueChange: (value: string) => void
};

export function FieldsSelector({
    collectionName,
    value,
    placeholder,
    onValueChange,
}: FieldsSelectorProps) {
    const [fieldsOptions, setFields] = useState<string[]>([]) 
    const pb = usePocketBase();
    pb.autoCancellation(false);

    useEffect(() => {
        async function fetchMetadata() {
            try {
                // pb.autoCancellation(false);
                // fieldsOptions.pop()
                const temp: string[]= [];
                const metadata = await pb.collection("metadata").getFullList();
                console.log("metadata", metadata);
                for (const data of metadata) {
                    if (data.provider == collectionName) {
                        for (const field of data.paths) {
                            temp.push((field.path).replaceAll("/", "_")) 
                        }
                    }
                }
                temp.push("created");
                temp.push("updated");
                setFields(temp);
            } catch (err) {
                console.error('Failed to fetch collections:', err);
            }
        }
        fetchMetadata();
    }, [pb, collectionName]);


    return (
        <Select
            value={value}
            onValueChange={(value) => onValueChange(value)}
        >
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {fieldsOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

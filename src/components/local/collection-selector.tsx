// import { AlertCondition } from "../AlertCondition";
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePocketBase } from "@/context/DatabaseContext.tsx";

type CollectionSelectorProps = {
    value: string | undefined
    placeholder: string
    onValueChange: (value: string) => void
};

export function CollectionSelector({
    value,
    placeholder,
    onValueChange,
}: CollectionSelectorProps) {
    const [CollectionOptions, setCollectionOptions] = useState<string[]>([])
    const [refresh] = useState(false)
    const pb = usePocketBase();

    useEffect(() => {
        async function fetchMetadata() {
            try {
                // collectionOptions.pop()
                const temp: string[]= [];
                const metadata = await pb.collection("metadata").getFullList();
                console.log("metadata", metadata);
                for (const data of metadata) {
                    temp.push(data.provider);
                }
                setCollectionOptions(temp);
            } catch (err) {
                console.error('Failed to fetch collections:', err);
            }
        }
        fetchMetadata();
    }, []);

    return (
        <Select
            value={value}
            onValueChange={(value) => onValueChange(value)}
        >
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {CollectionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

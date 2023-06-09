import { Person } from "./Person";
import { Result } from "./Result";

export type Roles = "coordinator" | "member";

export interface Project {
    id: number;
    title: string;
    description?: string;
    sponsor?: string;

    persons?: (Person & { role: Roles })[];
    results: Result[];
    startDate: Date | null;
    finishDate: Date | null;
    isFinished: boolean;
    created_at: Date;
    updated_at: Date;
}

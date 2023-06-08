import { Person } from "./Person";
import { Project } from "./Project";

export interface Result {
    id: number;
    description: string;
    project: Project;
    persons?: Person[];
}

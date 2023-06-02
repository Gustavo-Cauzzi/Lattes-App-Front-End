export interface Person {
    id: number;
    email: string;
    name?: string;
    institution?: string;

    created_at: Date;
    updated_at: Date;
}

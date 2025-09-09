export declare class UsersController {
    getAll(): {
        id: number;
        name: string;
    }[];
    getOne(id: string): Promise<{
        id: number;
        name: string;
    }>;
    createUser(): void;
}

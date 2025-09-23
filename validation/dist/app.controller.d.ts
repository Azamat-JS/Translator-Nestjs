import { AppService } from './app.service';
import { DataValidatorDto } from './app.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getUser(): DataValidatorDto;
    create(data: any): {
        user: string;
        email: string;
        exSecret: string;
        inSecret: string;
        marry: boolean;
    };
}

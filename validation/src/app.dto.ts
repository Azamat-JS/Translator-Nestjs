import {Exclude, Expose} from 'class-transformer'


export class DataValidatorDto {
    @Expose({name: 'user_name', toPlainOnly:true})
    userName: string;

    @Expose({name: 'email_address'})
    emailAddress: string;

    @Expose({ toClassOnly: true })
    isMarried: boolean;

    @Exclude({toPlainOnly: true})
    internalSecret: string

    @Exclude()
    externalSecret: string
}
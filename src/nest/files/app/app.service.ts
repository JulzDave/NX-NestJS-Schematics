import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    healthCheck(): {message: 'OK'} {
        return {message: 'OK'};
    }
}

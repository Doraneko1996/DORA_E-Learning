import { Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";

@Injectable()
export class SeederService {
    constructor(private readonly usersService: UsersService) {}

    async seed() {
        await this.usersService.createSuperAdmin();
    }
}
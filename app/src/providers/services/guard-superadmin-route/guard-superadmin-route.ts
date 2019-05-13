import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ApplicationDataDatabaseService } from '@db/application-data-database.service';
import { APPLICATION_DATA_CONSTANTS } from '@core/constants/application-data.constants';
import { ROLES } from '@core/constants/roles.constants';


@Injectable({ providedIn: 'root' })
export class GuardSuperAdminRouteService implements CanActivate {
    constructor(
        private applicationDatabaseService: ApplicationDataDatabaseService,
    ) { }

    public async canActivate() {
        const user = await this.applicationDatabaseService.get(APPLICATION_DATA_CONSTANTS.USER).toPromise();
        if (user.role === ROLES.SUPER_USER) {
            return true;
        }
        return false;
    }
}

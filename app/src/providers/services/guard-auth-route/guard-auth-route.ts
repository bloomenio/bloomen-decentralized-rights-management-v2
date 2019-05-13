import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { MnemonicDatabaseService } from '@db/mnemonic-database.service';
import { ApplicationDataDatabaseService } from '@db/application-data-database.service';
import { StatusEnum } from '@core/models/user.model';
import { APPLICATION_DATA_CONSTANTS } from '@core/constants/application-data.constants';
import { ROLES } from '@core/constants/roles.constants';


@Injectable({ providedIn: 'root' })
export class GuardAuthRouteService implements CanActivate {
    constructor(
        private mnemonicDatabaseService: MnemonicDatabaseService,
        private applicationDatabaseService: ApplicationDataDatabaseService,
        private router: Router,
    ) { }

    public async canActivate() {
        const user = await this.applicationDatabaseService.get(APPLICATION_DATA_CONSTANTS.USER).toPromise();
        const mnemonic = !!await this.mnemonicDatabaseService.get(APPLICATION_DATA_CONSTANTS.MNEMONIC).toPromise();
        const isFormFilled = await this.applicationDatabaseService.get(APPLICATION_DATA_CONSTANTS.IS_FORM_FILLED).toPromise();

        if (!mnemonic) {
            this.router.navigate(['login']);
            return false;
        } else if (mnemonic && !isFormFilled && !user) {
            this.router.navigate(['user-form']);
            return false;
        } else if ((mnemonic && user && user.role !== ROLES.SUPER_USER && StatusEnum[user.status] === StatusEnum[StatusEnum.PENDING])
            || (mnemonic && isFormFilled && !user)) {
            this.router.navigate(['waiting-approve']);
            return false;
        } else if (mnemonic && user && user.role !== ROLES.SUPER_USER && StatusEnum[user.status] === StatusEnum[StatusEnum.REJECTED]) {
            this.router.navigate(['login']);
            return false;
        }
        return true;
    }
}

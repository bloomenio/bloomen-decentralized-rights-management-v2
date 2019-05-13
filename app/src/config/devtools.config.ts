import { environment } from '@env/environment.pre';
import { StoreDevtoolsOptions } from '@ngrx/store-devtools';

export const devToolsConfig: StoreDevtoolsOptions = {
    maxAge: 25, // Retains last 25 states
    logOnly: environment.production, // Restrict extension to log-only mode
};

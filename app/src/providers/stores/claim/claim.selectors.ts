import { createFeatureSelector } from '@ngrx/store';
import { UserModel } from '@core/models/user.model';

export const UserState = createFeatureSelector<UserModel>('claim');

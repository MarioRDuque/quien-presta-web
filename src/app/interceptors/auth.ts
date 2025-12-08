import { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONFIG } from '../../config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${APP_CONFIG.token}`,
        }
    });

    return next(authReq);
};

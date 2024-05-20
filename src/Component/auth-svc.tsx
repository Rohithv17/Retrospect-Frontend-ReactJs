import axios from "axios";
import { environment } from "../constants/constants";
import { API_BASE_URL } from "../constants/constants";
import keycloak from "./keycloak";

class AuthSvcService {
    baseURL = `${API_BASE_URL}/valuation/users`;

    getToken = (token: any) => {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    };

    getKeyCloakToken = async () => {
        return await keycloak.getToken().then((token: any) => {
            return JSON.parse(JSON.stringify(token));
        });
    };

    getIntialData() {
        return this.getKeyCloakToken().then((token) => {
            return axios.get(`${this.baseURL}/details`, {headers: this.getToken(token)} )
        });
    }
    
    logoutToken() {
        return axios.get(environment.devUrl + '/authentication/token/logout');
    }
    appInit() {
        return new Promise<void>((resolve, reject) => {
            this.getIntialData().then(() => {})
        });
    }
}
export default new AuthSvcService();
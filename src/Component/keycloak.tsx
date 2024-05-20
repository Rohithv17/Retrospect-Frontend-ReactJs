import axios from "axios";
import { environment } from "../constants/constants";
import Keycloak from "keycloak-js";

class KeycloakService {
  static auth: any = {};
  init(): Promise<any> {
    const keycloakAuth: Keycloak = new Keycloak({
      url: environment.keycloakRootUrl,
      realm: 'master',
      clientId: 'maatrum',
    });

    KeycloakService.auth.loggedIn = false;

    return new Promise((resolve, reject) => {
      keycloakAuth.init({ onLoad: 'login-required', checkLoginIframe: false, flow: 'standard' })
        .then((authenticated) => {
          if (authenticated) {
            sessionStorage.setItem('token', JSON.stringify(keycloakAuth.token));
            KeycloakService.auth.loggedIn = true;
            KeycloakService.auth.authz = keycloakAuth;
            KeycloakService.auth.logoutUrl = keycloakAuth.authServerUrl
              + 'realms/master/protocol/openid-connect/logout?post_logout_redirect_uri='
              + document.baseURI
              + '&id_token_hint='
              + keycloakAuth.idToken
          }
          resolve(authenticated);
        })
        .catch(() => {
          reject();
        });
    });
  }

  logout() {
    KeycloakService.auth.loggedIn = false;
    KeycloakService.auth.authz = null;
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = KeycloakService.auth.logoutUrl;
  }

  static getUsername(): string {
    return KeycloakService.auth.authz.tokenParsed.preferred_username;
  }

  static getFullName(): string {
    return KeycloakService.auth.authz.tokenParsed.name;
  }

  getToken(): Promise<String> {
    return new Promise<String>((resolve, reject) => {
      if (KeycloakService?.auth?.authz?.token) {
        KeycloakService.auth.authz.updateToken(5)
          .then(() => {
            resolve(KeycloakService.auth.authz.token);
          })
          .catch(() => {
            alert("Failed to refersh token");
            reject("Failed to refersh token");
          });
      } else {
        alert("Not logged in");
        reject("Not logged in");
      }
    })
  }

}
export default new KeycloakService();
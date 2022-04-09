export let apiConfig = {};

const axios = require("axios");

var instancex = axios.create();
instancex.interceptors.request.use((request) => {
  console.log("Starting Request=> ", request);
  return request;
});

instancex.interceptors.response.use((response) => {
  console.log("Response=>", response);
  return response;
});

instancex.defaults.timeout = 20000;
let instance = null;

export const DevelopmentMode = {
  PRODUCTION: "PRODUCTION",
  TESTING: "TESTING",
  DEVELOPMENT: "DEVELOPMENT",
  ALPHA: "ALPHA",
};

export const Method = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  OPTIONS: "OPTIONS",
  DELETE: "DELETE",
};

export const ContentType = {
  applicationxwwwformurlencoded: "application/x-www-form-urlencoded",
  applicationjson: "application/json",
  custome: 9999,
};

export const Headers = async (obj) => {
  switch (obj.type) {
    case ContentType.custome:
      return {
        headers: obj.header,
      };

    default:
      return {
        headers: {
          "Content-Type": obj.type,
        },
      };
  }
};
import Translater from "app/i18n";

import { Toast, Alert } from "native-base";
class API {
  _baseURL;
  _DevMode;
  _method;
  _endPoint;
  _Headers;
  _showLoader;
  _params;

  constructor() { }

  static getInstance() {
    if (!instance) {
      instance = new API();
    }
    return instance;
  }

  build(mode, apiConfig) {
    this._DevMode = mode;
    if (this._DevMode === DevelopmentMode.PRODUCTION) {
      this._baseURL = apiConfig.productionBaseURL;
    } else if (this._DevMode === DevelopmentMode.TESTING) {
      this._baseURL = apiConfig.testingBaseURL;
    } else if (this._DevMode === DevelopmentMode.DEVELOPMENT) {
      this._baseURL = apiConfig.developmentBaseURL;
    } else if (this._DevMode === DevelopmentMode.ALPHA) {
      this._baseURL = apiConfig.alphaBaseURL;
    } else {
      this._baseURL = apiConfig.developmentBaseURL;
    }
  }

  retry({ SuccessCallback, FailureCallback }) {
    this.getResult(this._method, this._endPoint, this._Headers, this._params, {
      SuccessCallback: (re) => {
        SuccessCallback(re);
      },
      FailureCallback: (data) => {
        FailureCallback(data);
      },
    });
  }

  Logger(label, message) {
    if (this._DevMode !== DevelopmentMode.PRODUCTION) {
      console.log(label, message);
    }
  }

  onClose(reason) {
    //this.retry()
  }

  Fetch(
    res,
    headers,
    params,
    showLoader = false,
    { SuccessCallback, FailureCallback }
  ) {
    /*
     * assign value to global so it can be reused for retry based on policy.
     */
    this._method = res.method;
    this._endPoint = res.endpoint;
    this._Headers = headers;
    this._showLoader = showLoader;
    this._params = params;
    // let tmOut = setTimeout(() => {
    //   Toast.show({
    //     text: Translater.doTranslate("slow_internet"),
    //     position: "bottom",
    //     type: "danger",
    //     duration: 3000,
    //   });
    // }, 9000);
    this.getResult(res.method, res.endpoint, headers, params, {
      SuccessCallback: (res) => {
        SuccessCallback(res);
        //clearTimeout(tmOut);
        if (res.debugOutput) {
          if (res.debugOutput.timedOut) {
            // Toast.show({
            //   text: Translater.doTranslate("slow_internet"),
            //   position: "bottom",
            //   type: "danger",
            //   duration: 3000,
            // });
          }
        }
        //console.log("==>>>", res);
      },
      FailureCallback: (res) => {
        console.log("==>>>", JSON.stringify(res.message));
        Alert(Translater.doTranslate("Server_Unavailable"));
        FailureCallback(res);
      },
    });
  }

  async getResult(
    method,
    endPoint,
    headers,
    params,
    { SuccessCallback, FailureCallback }
  ) {
    const header = await Headers(headers);
    this.Logger("endPoint =>", endPoint);
    this.Logger("header function =>", header);
    this.Logger("params =>", params);
    // this.Logger("this._baseURL =>", this._baseURL);
    switch (method) {
      case Method.GET:
        const param = params ? "?" + params : "";
        axios
          .get(endPoint, header)
          .then((res) => {
            if (res.status === 200) {
              SuccessCallback(res.data);
            } else {
              FailureCallback(res);
            }
            return res;
          })
          .catch((err) => {
            FailureCallback(err);
          });

        break;
      case Method.POST:
        axios
          .post(endPoint, params, header)
          .then((res) => {
            if (res.status === 200) {
              SuccessCallback(res.data);
            } else {
              FailureCallback(res);
            }
            return res;
          })
          .catch((err) => {
            FailureCallback(err.response);
          });

        break;
      case Method.PUT:
        axios
          .put(endPoint, params, header)
          .then((res) => {
            if (res.status === 200) {
              SuccessCallback(res.data);
            } else {
              FailureCallback(res);
            }
            return res;
          })
          .catch((err) => {
            FailureCallback(err.response);
          });
        break;

      case Method.OPTIONS:
        break;

      case Method.DELETE:
        axios
          .delete(endPoint, { params, headers: headers })
          .then((res) => {
            if (res.status === 200) {
              SuccessCallback(res.data);
            } else {
              FailureCallback(res);
            }
            return res;
          })
          .catch((err) => {
            FailureCallback(err.response);
          });
        break;

      default:
        return null;
    }
  }
}

export default API;

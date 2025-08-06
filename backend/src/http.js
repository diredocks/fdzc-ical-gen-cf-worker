export class HttpClient {
  constructor(baseUrl = "", defaultHeaders = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      "User-Agent": "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      ...defaultHeaders,
    };
    this.cookies = new Map();
  }

  _getCookieHeader() {
    return [...this.cookies.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  _storeSetCookies(setCookies) {
    for (const raw of setCookies) {
      const [cookiePair] = raw.split(";"); // Ignore attributes like Path, HttpOnly
      const [key, val] = cookiePair.split("=");
      if (key && val) {
        this.cookies.set(key.trim(), val.trim());
      }
    }
  }

  setCookie(key, value) {
    this.cookies.set(key, value);
  }

  async request(method, path, options = {}) {
    const url = path.startsWith("http") ? path : this.baseUrl + path;
    const headers = {
      ...this.headers,
      ...(options.headers || {}),
    };

    if (this.cookies.size > 0) {
      headers["Cookie"] = this._getCookieHeader();
    }

    const res = await fetch(url, {
      ...options,
      method,
      headers,
    });

    const setCookies = res.headers.getSetCookie?.();
    if (setCookies && Array.isArray(setCookies)) {
      this._storeSetCookies(setCookies);
    }

    return res;
  }

  async get(path, options = {}) {
    return this.request("GET", path, options);
  }

  async post(path, body, options = {}) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      ...options.headers,
    };
    const bodyData =
      typeof body === "string"
        ? body
        : new URLSearchParams(body).toString();

    return this.request("POST", path, {
      ...options,
      headers,
      body: bodyData,
    });
  }
}

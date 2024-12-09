import * as http from 'http';
import * as https from 'https';

type NodeHeaders = Record<string, string | string[]>;

// Функция для преобразования Node.js Headers в объект Headers
function convertHeaders(incomingHeaders: http.IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (Array.isArray(value)) {
      headers.append(key, value.join(', '));
    } else if (value) {
      headers.append(key, value);
    }
  }
  return headers;
}

// Создаём свой интерфейс для инициализации запросов
interface NodeRequestInit {
  method?: string;
  headers?: NodeHeaders;
  body?: string | Buffer;
}

// Создаём интерфейс для ответа
interface NodeResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  redirected: boolean;
  type: ResponseType;
  json(): Promise<any>;
  text(): Promise<string>;
  clone(): NodeResponse;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
}

// Реализация fetch для Node.js
function nodeFetch(input: string | URL | Request, init: NodeRequestInit = {}): Promise<NodeResponse> {
  return new Promise((resolve, reject) => {
    const urlObj = typeof input === 'string' || input instanceof URL ? new URL(input.toString()) : new URL(input.url);
    const isHttp = urlObj.protocol === 'http:';

    const client = isHttp ? http : https;

    const requestOptions: http.RequestOptions = {
      method: init.method || 'GET',
      headers: init.headers,
    };

    const req = client.request(urlObj, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          ok: res.statusCode! >= 200 && res.statusCode! < 300,
          status: res.statusCode!,
          statusText: res.statusMessage || '',
          headers: convertHeaders(res.headers),
          url: urlObj.toString(),
          redirected: false,
          type: 'basic',
          json: async () => JSON.parse(data),
          text: async () => data,
          clone: () => {
            throw new Error('Clone is not implemented');
          },
          arrayBuffer: async () => Buffer.from(data).buffer,
          blob: async () => {
            throw new Error('Blob is not implemented');
          },
          formData: async () => {
            throw new Error('FormData is not implemented');
          },
        } as NodeResponse);
      });
    });

    req.on('error', reject);

    if (init.body) {
      req.write(init.body);
    }

    req.end();
  });
}

// Устанавливаем fetch глобально, если оно отсутствует
if (typeof global.fetch === 'undefined') {
  (global as any).fetch = nodeFetch;
}

export {};

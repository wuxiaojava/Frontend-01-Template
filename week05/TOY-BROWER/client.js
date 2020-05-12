const net = require('net');
/***
 * requet format
 * ----request line----
 * POST(method) /(path) HTTP/1.1(protocol version)   
 * ----headers----
 * Host: 127.0.0.1
 * Content-Type: application/x-wwww-form-urlencodede 
 * 
 * ----body----
 * field1=aaa&code=x%301
 */
class Request{
    //method, url = host + port + path 
    //headers
    //body: k/v
    constructor(options){
        this.method = options.method || 'GET';
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};

        if (!this.headers["Content-Type"]){
            this.headers["Content-Type"] = "application/x-wwww-form-urlencoded";
        }

        if (this.headers["Content-Type"] === "appliation/json"){
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers["Content-Type"] === "application/x-wwww-form-urlencoded"){
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join("&");
        }

        this.headers["Content-Length"] = this.bodyText.length;
        this.bodyParse = null;
    }

    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r
        ${Object.keys(this.headers).map(key=> `${key}: ${this.headers[key]}`).join('\r\n')}
\r
${this.bodyText}`;
    }

    send(connection){
        return new Promise((resolve,reject)=>{
            const parser = new ResponseParse();
            if (connection) {
                connection.write(this.toString());
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    //逗号表达式
                    connection.write(this.toString());
                });
            }

            connection.on('data', (data) => {
                console.log(data.toString());
                parser.receive(data.toString());

                if(parser.isFinish){
                    resolve(parser.getResponse());
                }
                // resolve(data.toString());
                connection.end();
            });
            connection.on('end', () => {
                console.log('已从服务器断开');
            });

            connection.on('error', (err) => {
                reject();
                console.log(err);
                connection.end();
            });
        });

    }
}

/***
 * 
 * 响应报文内容
 * HTTP / 1.1 200 OK
 Content - Type: text / plain
 X - Foo: bar
 Date: Tue, 12 May 2020 15: 32: 28 GMT
 Connection: keep - alive
 Transfer - Encoding: chunked

 2
 ok
 0
 */
class ResponseParse{
    constructor(){
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1;

        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
    }

    receive(string){
        for(let i =0 ; i < string.length ; i++){
            this.receiveChar(string.charAt(i));
        }
        console.log(this.statusLine);
        console.log(this.headers);
    }

    receiveChar(char) {
        if(this.current === this.WAITING_STATUS_LINE){
            if(char === '\r'){
                this.current = this.WAITING_STATUS_LINE_END;
            }else{
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        }else if(this.current === this.WAITING_HEADER_NAME){
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END;
                if (this.headers["Transfer-Encoding"] === "chunked"){
                    this.bodyParse = new TrunkedBodyParse();
                }
            }else {
                this.headerName += char;
            }
        }else if(this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE;
            }  
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = "";
                this.headerValue = "";
            } else {
                this.headerValue += char;
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if(this.current === this.WAITING_HEADER_BLOCK_END){
            if (char === '\n') {
                this.current = this.WAITING_BODY;
            }
        } else if(this.current === this.WAITING_BODY){
            this.bodyParse.receiveChar(char);
        }

    }
}


class TrunkedBodyParse {
    constructor() {
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;
        this.READING_TRUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;

        this.length = 0;
        this.content = [];
        this.isFinish = false;
        this.current = this.WAITING_LENGTH;
    }

    get isFinish(){
        return this.bodyParse && this.bodyParse
    }

    get respons(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode:RegExp.$1,
            statusText:RegExp.$2,
            headers:this.headers,
            body:this.bodyParse.content.join('')
        }
    }

    receiveChar(char) {
        //console.log(JSON.stringify(char));
        if(this.current === this.WAITING_LENGTH){
            if (char === '\r') {
                if(this.length === 0){
                    console.log(this.content);
                    this.isFinish = true;
                }
                this.current = this.WAITING_LENGTH_LINE_END;
            } else {
                this.length *= 10;
                this.length += char.codePointAt(0) - '0'.codePointAt(0);
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = this.READING_TRUNK;
            } 
        } else if (this.current === this.READING_TRUNK) {
            this.content.push(char);
            this.length --;
            if(this.length === 0){
                this.current = this.WAITING_NEW_LINE;
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_NEW_LINE_END;
            }
        } else if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n'){
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}


class Response {

}

void async function(){
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        path: "/",
        port: 8088,
        headers: {
            //对象直接量？？
            ["X-Foo2"]: "customed"
        },
        body: {
            name: "winter"
        }
    });

    let response = await request.send();
    console.log(response);
}();

 
// const client = net.createConnection({
//     host: "127.0.0.1",
//     port: 8088
// }, () => {
//     // 'connect' 监听器
//     console.log('已连接到服务器');


//     let request = new Request({
//         method:"POST",
//         host:"127.0.0.1",
//         path:"/",
//         port:8088,
//         headers:{
//             //对象直接量？？
//             ["X-Foo2"]:"customed"
//         },
//         body:{
//             name:"winter"
//         }
//     });

//     console.log(request.toString());
//     client.write(request.toString());
//     // client.write('POST /  HTTP/1.1\r\n');
//     // // client.write('Host: 127.0.0.1\r\n ');
    
//     // client.write('Content-Type: application/x-wwww-form-urlencoded\r\n');
//     // client.write('Content-Length: 11\r\n');
//     // client.write('\r\n')
//     // client.write('name=winter\r\n');
// })


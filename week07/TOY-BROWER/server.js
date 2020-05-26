const http = require("http")

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(
`<html >
    <head>
        <style>
            
        </style>
    </head>
    <body>
        <div>
             
        </div>
    </body>
</html>`);
});    

server.listen(8088);
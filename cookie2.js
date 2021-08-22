const http = require("http");
const fs = require("fs").promises;
const url = require("url");
const qs = require("querystring");

const parseCookies = (cookie='') => cookie.split(';').map(v=>v.split('=')).reduce((acc,[k,v])=>{
    acc[k.trim()] = decodeURIComponent(v); return acc;},{});

const session={};

http.createServer(async (req,res) =>{
    const cookies = parseCookies(req.headers.cookie);
    if(req.url.startsWith('/login')){
        const {query} = url.parse(req.url);
        const {name} = qs.parse(query);
        const expires = new Date();
        expires.setMinutes(expires.getMinutes()+5);
        const uniqueInt = Date.now();
        session[uniqueInt] = {name,expires,};
        res.writeHead(302,{
            Locatin:'/',
            'Set-Cookie':`session=${uniqueInt}; Expires=${expires.toUTCString()}; HttpOnly; Path=/`,
        });
        res.end();
    }else if(cookies.session && session[cookies.session].expires > new Date()){
        res.writeHead(200,{'Content-Type':'text/plain;charset=utf-8'});
        console.info(session);
        res.end(`${session[cookies.session].name}, HI`);
    }else{
        try{
            const data = await fs.readFile('./cookie2.html');
            res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
            res.end(data);
        }catch(e){
            console.error(e);
            res.writeHead(500,{'Content-Type':'text/plain;charset=utf-8'});
            res.end(e.message);
        }
    }
}).listen(8084,()=>{
    console.log('server started');
})